import { API_URL, LEADS_PATH } from './config';

// Meta calls the fields full_name / phone_number, our backend might pass
// them through untouched or rename them. Accept both so the app doesn't care.
export function normalizeLead(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('The server returned an invalid lead');
  }

  const id = raw._id || raw.id || raw.leadId;
  if (id === undefined || id === null || id === '') {
    throw new Error('The server returned a lead without an id');
  }

  const createdAt = raw.createdTime || raw.created_time || raw.createdAt;
  const date = createdAt
    ? new Date(typeof createdAt === 'number' ? createdAt * 1000 : createdAt)
    : new Date();

  return {
    id: String(id),
    name: raw.name || raw.full_name || 'Unnamed lead',
    email: raw.email || '',
    phone: raw.phone || raw.phone_number || '',
    interest: raw.interest || raw.interestedIn || raw.interested_in || '',
    createdAt: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
  };
}

export async function fetchLeads() {
  const baseUrl = API_URL.replace(/\/+$/, '');
  const res = await fetch(`${baseUrl}${LEADS_PATH}`);
  let data;
  try {
    data = await res.json();
  } catch (error) {
    if (!res.ok) {
      throw new Error(`Server answered ${res.status}`);
    }
    throw new Error('The server returned an invalid response');
  }

  if (!res.ok) {
    throw new Error((data && data.message) || `Server answered ${res.status}`);
  }

  const list = Array.isArray(data) ? data : data && data.leads;
  if (!Array.isArray(list)) {
    throw new Error('The server returned an invalid leads response');
  }
  return list.map(normalizeLead);
}
