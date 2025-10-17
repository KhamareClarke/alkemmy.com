import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function GET() {
  try {
    // First get all users
    const { data: usersData, error: usersError } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
    }

    // Then get order statistics for each user
    const usersWithStats = await Promise.all(
      (usersData || []).map(async (user) => {
        const { data: userOrders } = await adminSupabase
          .from('orders')
          .select('total_amount')
          .eq('user_id', user.id);

        const order_count = userOrders?.length || 0;
        const total_spent = userOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        return {
          ...user,
          order_count,
          total_spent
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
