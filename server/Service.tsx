import type { RedditAPIClient, RedisClient, Scheduler, ZRangeOptions } from '@devvit/public-api';
import type {
  LeaderboardEntry,
  PostData,
  PostId,
  PostType,
  UserGenPostData,
} from '../src/shared.js';
import { UserService } from './UserService.js';
import { LeaderboardService } from './LeaderboardService.js';
import { PostService } from './PostService.js';
import { PuzzleService } from './PuzzleService.js';

export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;

  public userService: UserService;
  public leaderboardService: LeaderboardService;
  public postService: PostService;
  public puzzleService: PuzzleService;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;

    this.userService = new UserService(context);
    this.leaderboardService = new LeaderboardService(context);
    this.postService = new PostService(context);
    this.puzzleService = new PuzzleService(context);
  }

  /**
   * Redis keys used for organizing data storage.
   *
   */
  readonly keys = {
    postData: (postId: PostId) => `post:${postId}`,
    userPuzzles: (username: string) => `user:${username}:puzzles`,
    puzzlePostMap: () => `puzzle:post:map`,
    userCreatedPuzzleList: (username: string) => `user:${username}:userGeneratedPuzzles`,
    userUserGeneratedSolved: (username: string) => `user:${username}:solvedUGPuzzles`,
    userUserGeneratedSolvedCount: (username: string) => `user:${username}:solvedUGCount`,
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

  /*
   * User Flair
   */
  async saveUserFlairData(username: string, rank: number): Promise<void> {
    const key = this.keys.userFlair(username);
    await this.redis.hSet(key, { rank: rank.toString() });
  }

  async getUserFlairData(username: string): Promise<number> {
    const key = this.keys.userFlair(username);
    const rank = await this.redis.hGet(key, 'rank');
    return rank ? parseInt(rank, 10) : 0;
  }
}
