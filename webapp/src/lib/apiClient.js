/**
 * Atlas API Client
 * 
 * A centralized, standardized fetch wrapper that automatically binds:
 * - Authorization Bearer Token (from memory/localStorage in client, or SSR)
 * - x-business-id header for tenant isolation
 * - Content-Type headers
 * 
 * Usage (client-side): apiClient.get('/api/catalog/products')
 * Usage (server-side): apiClient.get('/api/catalog/products', { token, businessId })
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

function getStoredAuth() {
  if (typeof window === 'undefined') return {};
  try {
    const token = sessionStorage.getItem('atlas_access_token');
    const businessId = sessionStorage.getItem('atlas_business_id');
    return { token, businessId };
  } catch {
    return {};
  }
}

async function request(method, path, { body, token, businessId, ...options } = {}) {
  const stored = getStoredAuth();
  const resolvedToken = token || stored.token;
  const resolvedBusinessId = businessId || stored.businessId;

  const headers = {
    'Content-Type': 'application/json',
    ...(resolvedToken && { Authorization: `Bearer ${resolvedToken}` }),
    ...(resolvedBusinessId && { 'x-business-id': resolvedBusinessId }),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data?.message || 'API Request Failed');
    error.status = res.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { body, ...options }),
  put: (path, body, options) => request('PUT', path, { body, ...options }),
  patch: (path, body, options) => request('PATCH', path, { body, ...options }),
  delete: (path, options) => request('DELETE', path, options),
};
