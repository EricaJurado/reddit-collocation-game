import { LeaderboardEntry } from "../src/shared.js";
import { ServiceBase } from "./ServiceBase.js";
import type { RedditAPIClient, RedisClient, Scheduler, ZRangeOptions } from '@devvit/public-api';
import { UserService } from "./UserService.js";

export class LeaderboardService extends ServiceBase {
  private userService: UserService;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    super(context);
    this.userService = new UserService(context); // Inject UserService instance
  }
   /**
     * Updates the daily leaderboard with a new score for a user.
     * @param username - The username of the user.
     * @param score - The score to update.
     * @returns A promise that resolves when the leaderboard is updated.
     */
    async updateDailyLeaderboard(username: string): Promise<void> {
      const dailySolvedListKey = this.keys.userDailySolvedList(username);
      const dailySolvedList = await this.redis.hGet(dailySolvedListKey, 'list');
      const dailySolvedCount = dailySolvedList ? JSON.parse(dailySolvedList).length + 1 : 1;
      const leaderboardKey = this.keys.dailyTotalLeaderboard;
      await this.redis.zAdd(leaderboardKey, { member: username, score: dailySolvedCount });
    }

      /**
   * Updates the streak leaderboard with a new score for a user.
   * @param username - The username of the user.
   * @param score - The score to update.
   * @returns A promise that resolves when the leaderboard is updated.
   */
  async updateDailyStreakLeaderboard(username: string): Promise<void> {
    const streak = await this.userService.getUserStreak(username);
    const leaderboardKey = this.keys.dailyStreakLeaderboard;
    await this.redis.zAdd(leaderboardKey, { member: username, score: streak });
  }

  /**
   * Updates the daily and streak leaderboards.
   * @param username - The username of the user.
   */
  async updateAllDailyLeaderboards(username: string): Promise<void> {
    await this.updateDailyLeaderboard(username);

    await this.updateDailyStreakLeaderboard(username);
  }

    /**
     * Retrieves the daily leaderboard.
     * @param limit - The maximum number of entries to retrieve. Defaults to 10.
     * @returns A promise that resolves to an array of leaderboard entries.
     */
    async getDailyLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
      const leaderboardKey = this.keys.dailyTotalLeaderboard;
      const options: ZRangeOptions = { reverse: true, by: 'rank' };
      const entries = await this.redis.zRange(leaderboardKey, 0, limit - 1, options);
      return entries.map((entry) => ({
        username: entry.member,
        score: entry.score,
      }));
    }

      /**
   * Retrieves the streak leaderboard.
   * @param limit - The maximum number of entries to retrieve. Defaults to 10.
   * @returns A promise that resolves to an array of leaderboard entries.
   */
  async getDailyStreakLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const leaderboardKey = this.keys.dailyStreakLeaderboard;
    const options: ZRangeOptions = { reverse: true, by: 'rank' };

    const entries = await this.redis.zRange(leaderboardKey, 0, limit - 1, options);
    return entries.map((entry) => ({
      username: entry.member,
      score: entry.score,
    }));
  }
}
