import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';
import { EMPIRE_SKILLS } from './skills';

export interface EmpireMetrics {
  totalEvents: number;
  last24h: number;
  bySkill: Record<string, number>;
  skillsTotal: number;
}

export async function getEmpireMetrics(): Promise<EmpireMetrics> {
  const empty: EmpireMetrics = {
    totalEvents: 0,
    last24h: 0,
    bySkill: {},
    skillsTotal: EMPIRE_SKILLS.length,
  };

  try {
    const { data: rows, error } = await adminSupabase
      .from('empire_os_events')
      .select('skill_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error || !rows) return empty;

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const bySkill: Record<string, number> = {};
    let last24h = 0;

    for (const r of rows as { skill_id: string | null; created_at: string }[]) {
      const t = new Date(r.created_at).getTime();
      if (now - t < day) last24h++;
      if (r.skill_id) bySkill[r.skill_id] = (bySkill[r.skill_id] || 0) + 1;
    }

    return {
      totalEvents: rows.length,
      last24h,
      bySkill,
      skillsTotal: EMPIRE_SKILLS.length,
    };
  } catch {
    return empty;
  }
}
