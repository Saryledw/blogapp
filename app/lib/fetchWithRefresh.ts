

export async function fetchWithRefresh(url: string, options: RequestInit = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies in the request
  });

  if (response.status === 401) {
    // Try to refresh the token
    const refreshResponse = await fetch('/api/refresh-token', {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
    });

    if (refreshResponse.ok) {
      // Retry the original request
      response = await fetch(url, {
        ...options,
        credentials: 'include', // Include cookies in the request
      });
    } else {
      throw new Error('Unable to refresh token');
    }
  }

  return response;
}
