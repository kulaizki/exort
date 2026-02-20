import { config } from '../../config/index.js';

export class SyncService {
  static async triggerSync(userId: string) {
    let res: Response;
    try {
      res = await fetch(`${config.SYNC_SERVICE_URL}/sync/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      throw new Error(`Sync service unreachable at ${config.SYNC_SERVICE_URL}`);
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Sync service returned ${res.status}`);
    }

    return res.json();
  }
}
