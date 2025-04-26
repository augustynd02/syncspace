export function getApiUrl(path: string) {
  if (typeof window === 'undefined') {
    const origin =
      process.env.NODE_ENV === 'production'
        ? 'https://syncspace-cyan.vercel.app'
        : 'http://localhost:3000';
    return `${origin}${path}`;
  } else {
    return path;
  }
}

export function getWsUrl() {
  if (typeof window === 'undefined') return undefined;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not defined');

  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const apiUrlClean = apiUrl.replace(/^https?/, wsProtocol).replace(/\/api\/?$/, '');

  return `${apiUrlClean}/ws`;
}

