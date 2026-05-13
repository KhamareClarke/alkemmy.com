import 'server-only';
import type { User } from '@supabase/supabase-js';
import type { Order } from '@/lib/order-types';

export interface HubSpotUserPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

function hubspotToken(): string {
  const t = process.env.HUBSPOT_PRIVATE_APP_TOKEN?.trim();
  if (!t) throw new Error('HUBSPOT_PRIVATE_APP_TOKEN is not set');
  return t;
}

async function hubspotFetch(path: string, init: RequestInit): Promise<unknown> {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${hubspotToken()}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HubSpot ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

/** Upsert contact by email (CRM v3). */
export async function syncCustomerToHubSpot(user: HubSpotUserPayload): Promise<{ id: string }> {
  const body = {
    properties: {
      email: user.email,
      firstname: user.firstName ?? '',
      lastname: user.lastName ?? '',
      phone: user.phone ?? '',
    },
  };

  const search = await hubspotFetch('/crm/v3/objects/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: user.email }] }],
      properties: ['email'],
      limit: 1,
    }),
  });

  const results = (search as { results?: { id: string }[] }).results;
  if (results?.[0]?.id) {
    const id = results[0].id;
    await hubspotFetch(`/crm/v3/objects/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return { id };
  }

  const created = await hubspotFetch('/crm/v3/objects/contacts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return { id: String((created as { id?: string }).id) };
}

export async function syncCustomerFromSupabaseUser(user: User): Promise<{ id: string }> {
  const email = user.email;
  if (!email) throw new Error('User has no email');
  const meta = user.user_metadata as Record<string, string | undefined> | undefined;
  return syncCustomerToHubSpot({
    id: user.id,
    email,
    firstName: meta?.first_name,
    lastName: meta?.last_name,
    phone: meta?.phone,
  });
}

/** Create or update a deal linked to pipeline default (configure pipeline/stage in HubSpot). */
export async function syncOrderToHubSpot(order: Order & { lineSummary?: string }): Promise<{ dealId: string }> {
  const dealname = `Alkhemmy ${order.order_number}`;
  const amount = String(order.total_amount ?? 0);

  const props: Record<string, string> = {
    dealname,
    amount,
    closedate: new Date().toISOString(),
    description: [order.lineSummary, `order_id:${order.id}`].filter(Boolean).join('\n'),
  };

  const search = await hubspotFetch('/crm/v3/objects/deals/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'dealname', operator: 'EQ', value: dealname }] }],
      properties: ['dealname'],
      limit: 1,
    }),
  });

  const results = (search as { results?: { id: string }[] }).results;
  if (results?.[0]?.id) {
    const id = results[0].id;
    await hubspotFetch(`/crm/v3/objects/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties: props }),
    });
    return { dealId: id };
  }

  const createProps = { ...props };
  const pipe = process.env.HUBSPOT_DEAL_PIPELINE_ID?.trim();
  const stage = process.env.HUBSPOT_DEAL_STAGE_ID?.trim();
  if (pipe) createProps.pipeline = pipe;
  if (stage) createProps.dealstage = stage;

  const created = await hubspotFetch('/crm/v3/objects/deals', {
    method: 'POST',
    body: JSON.stringify({ properties: createProps }),
  });
  return { dealId: String((created as { id?: string }).id) };
}
