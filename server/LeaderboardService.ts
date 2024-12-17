import { LeaderboardEntry } from '../src/shared.js';
import { ServiceBase } from './ServiceBase.js';
import type { RedditAPIClient, RedisClient, Scheduler, ZRangeOptions } from '@devvit/public-api';
import { UserService } from './UserService.js';

export class LeaderboardService extends ServiceBase {
  private userService: UserService;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    super(context);
    this.userService = new UserService(context); // Inject UserService instance
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
   * Updates the daily leaderboard with a new score for a user.
   * @param username - The username of the user.
   * @param score - The score to update.
   * @returns A promise that resolves when the leaderboard is updated.
   */
  async updateDailyLeaderboard(username: string): Promise<void> {
    const dailySolvedListKey = this.keys.userDailySolvedList(username);
    const dailySolvedList = await this.redis.hGet(dailySolvedListKey, 'list');
    const dailySolvedCount = dailySolvedList ? JSON.parse(dailySolvedList).length : 0;
    const leaderboardKey = this.keys.dailyTotalLeaderboard;
    await this.redis.zAdd(leaderboardKey, { member: username, score: dailySolvedCount });
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

  async getUserGenSolvedLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const leaderboardKey = this.keys.userGenSolvedLeaderboard;
    const options: ZRangeOptions = { reverse: true, by: 'rank' };
    const entries = await this.redis.zRange(leaderboardKey, 0, limit - 1, options);
    return entries.map((entry) => ({
      username: entry.member,
      score: entry.score,
    }));
  }

  async updateUserGenSolvedLeaderboard(username: string): Promise<void> {
    const userGenSolvedCount = await this.userService.getUserGeneratedPuzzleSolvedCount(username);
    const leaderboardKey = this.keys.userGenSolvedLeaderboard;
    await this.redis.zAdd(leaderboardKey, { member: username, score: userGenSolvedCount });
  }

  // for created puzzles
  async getUserCreatedPuzzleLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const leaderboardKey = this.keys.userCreatedPuzzleLeaderboard;
    const options: ZRangeOptions = { reverse: true, by: 'rank' };
    const entries = await this.redis.zRange(leaderboardKey, 0, limit - 1, options);
    return entries.map((entry) => ({
      username: entry.member,
      score: entry.score,
    }));
  }

  async updateUserCreatedPuzzleLeaderboard(username: string): Promise<void> {
    const userCreatedPuzzleCount = await this.userService.getUserCreatedPuzzleCount(username);
    const leaderboardKey = this.keys.userCreatedPuzzleLeaderboard;
    await this.redis.zAdd(leaderboardKey, { member: username, score: userCreatedPuzzleCount });
  }
}
