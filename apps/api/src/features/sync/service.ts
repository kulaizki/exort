// Sync trigger — calls the sync service
export class SyncService {
  static async triggerSync(userId: string) {
    // TODO: Call sync service via HTTP or Pub/Sub
    return { message: 'Sync triggered', userId };
  }
}
