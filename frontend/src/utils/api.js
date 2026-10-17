const API_BASE = '/api/v1';
async function checkResponse(res) {
  if (res.ok) return;
  const body = await res.json().catch(() => null);
  throw new Error(body?.error || `Request failed (${res.status})`);
}

export async function createProject(data) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await checkResponse(res);
  return res.json();
}

export async function listProjects() {
  const res = await fetch(`${API_BASE}/projects?_t=${Date.now()}`);
  await checkResponse(res);
  return res.json();
}

export async function getProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}?_t=${Date.now()}`);
  await checkResponse(res);
  return res.json();
}

export async function deleteProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
  await checkResponse(res);
  return res.json();
}

export async function startAnalysis(id) {
  const res = await fetch(`${API_BASE}/projects/${id}/analyze`, { method: 'POST', headers: {'Content-Type':'application/json'} });
  await checkResponse(res);
  return res.json();
}

export async function getStatus(id) {
  const res = await fetch(`${API_BASE}/projects/${id}/status?_t=${Date.now()}`);
  await checkResponse(res);
  return res.json();
}

export async function getKeywords(id, params = {}) {
  const query = new URLSearchParams({ ...params, _t: Date.now() }).toString();
  const res = await fetch(`${API_BASE}/projects/${id}/keywords?${query}`);
  await checkResponse(res);
  return res.json();
}

export async function reproject(id, assumptions) {
  const res = await fetch(`${API_BASE}/projects/${id}/reproject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assumptions }),
  });
  await checkResponse(res);
  return res.json();
}

export async function exportProject(id, format) {
  const res = await fetch(`${API_BASE}/projects/${id}/export/${format}?_t=${Date.now()}`);
  await checkResponse(res);
  if (format === 'csv') {
    return res.text();
  }
  return res.json();
}

export function formatCurrency(amount, currency = 'USD') {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

export async function getCrawledKeywords() {
  const res = await fetch(`${API_BASE}/projects/crawled-keywords?_t=${Date.now()}`);
  await checkResponse(res);
  return res.json();
}
