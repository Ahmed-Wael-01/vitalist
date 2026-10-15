// Fetch wrapper: sends httpOnly auth cookies, transparently refreshes an expired access token once.
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let refreshPromise = null;

function refreshSession() {
  refreshPromise ??= fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    .then((res) => res.ok)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

export async function api(path, { method = 'GET', body, retry = true } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    if (await refreshSession()) return api(path, { method, body, retry: false });
  }
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || res.statusText, data.details);
  return data;
}

/** /auth/me with one refresh attempt — used on app start. */
export async function fetchCurrentUser() {
  try {
    return (await api('/auth/me', { retry: false })).user;
  } catch (err) {
    if (err.status === 401 && (await refreshSession())) return (await api('/auth/me', { retry: false })).user;
    return null;
  }
}
