import { NextResponse } from 'next/server';
import { buildOrderCohortReport } from '@/lib/cohorts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await buildOrderCohortReport();
    return NextResponse.json(report);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to build cohort report' }, { status: 500 });
  }
}
