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
