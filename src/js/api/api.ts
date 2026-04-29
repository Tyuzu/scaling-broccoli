export async function apiFetch<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = options.timeoutMs
    ? setTimeout(() => controller.abort(), options.timeoutMs)
    : null;

  try {
    const headers = new Headers(options.headers || {});

    // Set default JSON header only if not provided
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    let body = options.body;

    // ავტომatically stringify plain objects
    if (
      body &&
      typeof body === 'object' &&
      !(body instanceof FormData) &&
      !(body instanceof Blob)
    ) {
      body = JSON.stringify(body);
    }

    const res = await fetch(url, {
      ...options,
      headers,
      body,
      signal: controller.signal
    });

    if (timeout) clearTimeout(timeout);

    // Handle empty response
    if (res.status === 204) {
      return undefined as T;
    }

    const contentType = res.headers.get('content-type') || '';

    let data: any;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const error = new Error(
        `API error: ${res.status} ${res.statusText}`
      ) as Error & { status: number; data: unknown };

      error.status = res.status;
      error.data = data;

      throw error;
    }

    return data as T;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out or aborted');
    }
    throw err;
  }
}