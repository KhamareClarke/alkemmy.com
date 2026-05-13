import type { SupabaseClient } from '@supabase/supabase-js'

/** Increment current_uses if below max_uses. Idempotent-friendly for retries. */
export async function incrementDiscountCodeUsage(
  client: SupabaseClient,
  discountCodeId: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: row, error: fetchErr } = await client
    .from('discount_codes')
    .select('id, max_uses, current_uses')
    .eq('id', discountCodeId)
    .maybeSingle()

  if (fetchErr || !row) {
    return { ok: false, error: fetchErr?.message || 'Discount not found' }
  }

  if (row.max_uses != null && row.current_uses >= row.max_uses) {
    return { ok: false, error: 'Usage limit already reached' }
  }

  const { error: updErr } = await client
    .from('discount_codes')
    .update({ current_uses: (row.current_uses ?? 0) + 1 })
    .eq('id', discountCodeId)

  if (updErr) {
    return { ok: false, error: updErr.message }
  }
  return { ok: true }
}
