import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';

export interface CohortMonthRow {
  cohortMonth: string;
  users: number;
  retention: { monthOffset: number; rate: number; activeUsers: number }[];
  avgLtv: number;
}

const DORMANT_GAP_DAYS = 90;

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** First calendar month of a user's first non-cancelled order defines their cohort. */
export async function buildOrderCohortReport(options?: { maxOrders?: number }): Promise<{
  cohorts: CohortMonthRow[];
  churnedApprox: { cohortMonth: string; usersDormant90d: number }[];
}> {
  const maxOrders = options?.maxOrders ?? 8000;
  const { data: orders, error } = await adminSupabase
    .from('orders')
    .select('user_id, created_at, total_amount, status')
    .not('user_id', 'is', null)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true })
    .limit(maxOrders);

  if (error || !orders?.length) {
    return { cohorts: [], churnedApprox: [] };
  }

  type O = { user_id: string; created_at: string; total_amount: number };
  const list = orders as O[];

  const firstOrderMonth = new Map<string, string>();
  const allMonthsByUser = new Map<string, Set<string>>();
  const ltvByUser = new Map<string, number>();

  for (const o of list) {
    const uid = o.user_id;
    const t = new Date(o.created_at);
    const mk = monthKey(t);
    if (!firstOrderMonth.has(uid)) firstOrderMonth.set(uid, mk);
    let set = allMonthsByUser.get(uid);
    if (!set) {
      set = new Set();
      allMonthsByUser.set(uid, set);
    }
    set.add(mk);
    ltvByUser.set(uid, (ltvByUser.get(uid) || 0) + Number(o.total_amount || 0));
  }

  const cohortToUsers = new Map<string, Set<string>>();
  for (const [uid, cohort] of Array.from(firstOrderMonth.entries())) {
    if (!cohortToUsers.has(cohort)) cohortToUsers.set(cohort, new Set());
    cohortToUsers.get(cohort)!.add(uid);
  }

  const sortedCohorts = Array.from(cohortToUsers.keys()).sort();

  const cohorts: CohortMonthRow[] = sortedCohorts.map((cohortMonth) => {
    const usersSet = cohortToUsers.get(cohortMonth)!;
    const userIds = Array.from(usersSet);
    const base = userIds.length;
    const retention: CohortMonthRow['retention'] = [];

    const [y, m] = cohortMonth.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));

    for (let offset = 0; offset <= 6; offset++) {
      const target = new Date(start);
      target.setUTCMonth(target.getUTCMonth() + offset);
      const mk = monthKey(target);
      let active = 0;
      for (const uid of userIds) {
        if (allMonthsByUser.get(uid)?.has(mk)) active += 1;
      }
      retention.push({
        monthOffset: offset,
        rate: base > 0 ? Math.round((active / base) * 1000) / 1000 : 0,
        activeUsers: active,
      });
    }

    const ltvSum = userIds.reduce((s, uid) => s + (ltvByUser.get(uid) || 0), 0);
    const avgLtv = base > 0 ? Math.round((ltvSum / base) * 100) / 100 : 0;

    return { cohortMonth, users: base, retention, avgLtv };
  });

  const now = new Date();
  const churnedApprox = sortedCohorts.map((cohortMonth) => {
    const usersSet = cohortToUsers.get(cohortMonth)!;
    let dormant = 0;
    for (const uid of Array.from(usersSet)) {
      const months = allMonthsByUser.get(uid);
      if (!months) continue;
      const last = Array.from(months).sort().pop();
      if (!last) continue;
      const [ly, lm] = last.split('-').map(Number);
      const lastD = new Date(Date.UTC(ly, lm - 1, 28));
      const gap = (now.getTime() - lastD.getTime()) / (86400 * 1000);
      if (gap >= DORMANT_GAP_DAYS) dormant += 1;
    }
    return { cohortMonth, usersDormant90d: dormant };
  });

  return { cohorts, churnedApprox };
}
