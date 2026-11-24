const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function apiRequest(path, { body, headers, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...headers
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the backend API. Start it with `pnpm dev:api` and try again.');
    }
    throw error;
  }
  const responseText = await response.text();
  let payload = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      throw new Error('The API returned an invalid response.');
    }
  }

  if (!response.ok) {
    const message = payload?.error?.message
      || (response.status >= 500
        ? `The backend API returned HTTP ${response.status}. Make sure it is running with \`pnpm dev:api\`.`
        : `The API request failed (${response.status}).`);
    const error = new Error(message);
    error.status = response.status;
    error.code = payload?.error?.code;
    throw error;
  }

  return payload;
}
