const LICHESS_API_BASE = 'https://lichess.org/api';

export class LichessClient {
  async *fetchGames(username: string, since?: Date): AsyncGenerator<string> {
    const url = new URL(`${LICHESS_API_BASE}/games/user/${username}`);
    if (since) {
      url.searchParams.set('since', String(since.getTime()));
    }
    url.searchParams.set('pgnInJson', 'true');
    url.searchParams.set('clocks', 'true');
    url.searchParams.set('opening', 'true');

    let retries = 0;
    const maxRetries = 5;

    while (retries <= maxRetries) {
      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/x-ndjson' }
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.pow(2, retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        retries++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Lichess API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          yield line;
        }
      }

      if (buffer.length > 0) {
        yield buffer;
      }

      return;
    }

    throw new Error('Lichess API rate limit exceeded after max retries');
  }
}
