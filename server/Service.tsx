import type { RedditAPIClient, RedisClient, Scheduler } from '@devvit/public-api';

import type { PinnedPostData, PostId, PostType } from '../src/shared.js';

export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
  }

  /**
   * Redis keys used for organizing data storage.
   */
  readonly keys = {
    /** Key for storing post data by post ID. */
    postData: (postId: PostId) => `post:${postId}`,

    /** Key for storing the list of puzzles created by a specific user. */
    userPuzzles: (username: string) => `user:${username}:createdPuzzles`,

    /** Key for storing the list of puzzles solved by a specific user. */
    userSolved: (username: string) => `user:${username}:solvedPuzzles`,

    /** Key for storing the list of puzzles solved by a specific user on a daily basis. */
    userDailySolved: (username: string) => `user:${username}:dailySolvedPuzzles`,

    /** Key for storing leaderboard stats. */
    leaderboard: 'leaderboard',
  };

  /*
   * Post data
   */

  async getPostType(postId: PostId): Promise<PostType> {
    const key = this.keys.postData(postId);
    const postType = await this.redis.hGet(key, 'postType');
    const defaultPostType = 'daily';
    return (postType ?? defaultPostType) as PostType;
  }

  async getPostCreatedAt(postId: PostId): Promise<Date> {
    const key = this.keys.postData(postId);
    const createdAt = await this.redis.hGet(key, 'createdAt');
    return createdAt ? new Date(createdAt) : new Date();
  }

  /*
   * Pinned Post
   */

  async savePinnedPost(postId: PostId, createdAt: Date): Promise<void> {
    const key = this.keys.postData(postId);
    await this.redis.hSet(key, {
      postId,
      postType: 'pinned',
      createdAt: createdAt.toISOString(),
    });
  }

  async getPinnedPost(postId: PostId): Promise<PinnedPostData> {
    const key = this.keys.postData(postId);
    const postType = await this.redis.hGet(key, 'postType');
    const createdAt = await this.redis.hGet(key, 'createdAt');
    return {
      postId,
      postType: postType ?? 'pinned',
      createdAt: createdAt ?? new Date().toISOString(),
    };
  }

  /**
   * Add a puzzle to the list of puzzles created by a user.
   */
  async addCreatedPuzzle(username: string, puzzleId: string): Promise<void> {
    if (!username || !puzzleId) {
      throw new Error('Invalid username or puzzleId.');
    }

    const key = this.keys.userPuzzles(username);
    const currentData = await this.redis.hGet(key, 'list');
    const puzzles = currentData ? JSON.parse(currentData) : [];
    puzzles.push(puzzleId);
    await this.redis.hSet(key, { list: JSON.stringify(puzzles) });
  }

  /**
   * Add a puzzle to the list of puzzles solved by a user and update their stats.
   */
  async addSolvedPuzzle(username: string, puzzleId: string): Promise<void> {
    if (!username || !puzzleId) {
      throw new Error('Invalid username or puzzleId.');
    }

    const key = this.keys.userSolved(username);
    const currentData = await this.redis.hGet(key, 'list');
    const puzzles = currentData ? JSON.parse(currentData) : [];
    if (!puzzles.includes(puzzleId)) {
      puzzles.push(puzzleId);
      await this.redis.hSet(key, { list: JSON.stringify(puzzles) });

      // Update leaderboard and streak
      await this.incrementUserStats(username);
    }
  }

  /**
   * Add a daily solved puzzle to the list of puzzles solved by a user.
   */
  async addDailySolvedPuzzle(username: string, day: string): Promise<void> {
    if (!username || !day) {
      throw new Error('Invalid username or day.');
    }

    const key = this.keys.userDailySolved(username);
    const currentData = await this.redis.hGet(key, 'list');
    const solvedDays = currentData ? JSON.parse(currentData) : [];
    if (!solvedDays.includes(day)) {
      solvedDays.push(day);
      await this.redis.hSet(key, { list: JSON.stringify(solvedDays) });
    }
  }

  /**
   * Increment the stats for a user (e.g., total puzzles solved).
   */
  async incrementUserStats(username: string): Promise<void> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const leaderboardKey = this.keys.leaderboard;
    await this.redis.hIncrBy(leaderboardKey, username, 1);
  }

  /**
   * Get the list of puzzles created by a user.
   */
  async getCreatedPuzzles(username: string): Promise<string[]> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userPuzzles(username);
    const currentData = await this.redis.hGet(key, 'list');
    return currentData ? JSON.parse(currentData) : [];
  }

  /**
   * Get the list of puzzles solved by a user.
   */
  async getSolvedPuzzles(username: string): Promise<string[]> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userSolved(username);
    const currentData = await this.redis.hGet(key, 'list');
    return currentData ? JSON.parse(currentData) : [];
  }

  /**
   * Get the list of daily puzzles solved by a user.
   */
  async getDailySolvedPuzzles(username: string): Promise<string[]> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userDailySolved(username);
    const currentData = await this.redis.hGet(key, 'list');
    return currentData ? JSON.parse(currentData) : [];
  }

  /**
   * Get the leaderboard for top solvers.
   */
  async getLeaderboard(limit = 10): Promise<{ username: string; score: number }[]> {
    const leaderboardKey = this.keys.leaderboard;
    const data = await this.redis.hGetAll(leaderboardKey);
    const leaderboard = Object.entries(data).map(([username, score]) => ({
      username,
      score: parseInt(score, 10),
    }));
    return leaderboard.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Get a user's streak based on consecutive days solving puzzles.
   */
  async getUserStreak(username: string): Promise<number> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const solvedPuzzles = await this.getSolvedPuzzles(username);
    // Parse dates from puzzle IDs (dd-mm-yyyy format)
    const solvedDates = solvedPuzzles
      .map((id) => {
        const [day, month, year] = id.split('-').map(Number);
        return new Date(year, month - 1, day); // Convert to Date object
      })
      .filter((date) => !isNaN(date.getTime())) // Filter out invalid dates
      .sort((a, b) => b.getTime() - a.getTime()); // Sort descending by date

    let streak = 0;
    let currentDate = new Date();

    for (const date of solvedDates) {
      // Check if the date matches today or yesterday in the streak
      if (
        date.toDateString() === currentDate.toDateString() ||
        date.toDateString() ===
          new Date(currentDate.setDate(currentDate.getDate() - 1)).toDateString()
      ) {
        streak++;
        currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1)); // Move to previous day
      } else {
        break;
      }
    }

    return streak;
  }
}
