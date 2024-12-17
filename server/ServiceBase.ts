import type { RedditAPIClient, RedisClient, Scheduler } from '@devvit/public-api';
import type {
  PostId,
} from '../src/shared.js';

export abstract class ServiceBase {
  protected readonly redis: RedisClient;
  protected readonly reddit?: RedditAPIClient;
  protected readonly scheduler?: Scheduler;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
  }

  /**
   * Centralized Redis key management
   */
  protected readonly keys = {
    postData: (postId: PostId) => `post:${postId}`,
    userPuzzles: (username: string) => `user:${username}:puzzles`,
    puzzlePostMap: () => `puzzle:post:map`,
        userCreatedPuzzleList: (username: string) => `user:${username}:userGeneratedPuzzles`,

    userUserGeneratedSolved: (username: string) => `user:${username}:solvedUGPuzzles`,
    userDailySolvedList: (username: string) => `user:${username}:dailySolvedPuzzles`,
    userDailySolvedCount: (username: string) => `user:${username}:dailySolvedCount`,
    userStreak: (username: string) => `user:${username}:streak`, // current daily streak
    userLongestStreak: (username: string) => `user:${username}:longestStreak`, // longest daily streak
    userLastDailySolved: (username: string) => `user:${username}:lastDailySolved`,
    userFlair: (username: string) => `user:${username}:flair`,
    dailyTotalLeaderboard: 'dailyTotalLeaderboard',
    dailyStreakLeaderboard: 'dailyStreakLeaderboard',
    userGenSolvedLeaderboard: 'userGenSolvedLeaderboard',
        userCreatedPuzzleLeaderboard: 'userCreatedPuzzleLeaderboard',

    gameSettings: 'game-settings',

  };

  /**
   * Safely retrieves a value from Redis with a fallback default.
   */
  protected async getRedisValue(key: string, field: string, defaultValue: string = ''): Promise<string> {
    const value = await this.redis.hGet(key, field);
    return value ?? defaultValue;
  }
}
