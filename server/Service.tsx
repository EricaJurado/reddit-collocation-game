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
    userDailySolvedList: (username: string) => `user:${username}:dailySolvedPuzzles`,

    /** Key for storing total daily solved */
    userDailySolvedCount: (username: string) => `user:${username}:dailySolvedCount`,

    /** Key for storing daily streak length */
    userStreak: (username: string) => `user:${username}:streak`,

    /** Key for storing last daily solved date (needed for streak) */
    userLastDailySolved: (username: string) => `user:${username}:lastDailySolved`,

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
      createdAt: createdAt.toString(),
    });
  }

  async getPinnedPost(postId: PostId): Promise<PinnedPostData> {
    const key = this.keys.postData(postId);
    const postType = await this.redis.hGet(key, 'postType');
    const createdAt = await this.redis.hGet(key, 'createdAt');
    return {
      postId,
      postType: postType ?? 'pinned',
      createdAt: createdAt ?? new Date().toString(),
    };
  }

  /*
   * Daily Post
   */

  async saveDailyPost(postId: PostId, createdAt: Date): Promise<void> {
    const key = this.keys.postData(postId);
    await this.redis.hSet(key, {
      postId,
      postType: 'daily',
      createdAt: createdAt.toString(),
    });
  }

  async getDailyPost(postId: PostId): Promise<PinnedPostData> {
    const key = this.keys.postData(postId);
    const postType = await this.redis.hGet(key, 'postType');
    let createdAt = await this.redis.hGet(key, 'createdAt');
    // if daily post was created before we started storing createdAt, get it from reddit
    if (!createdAt) {
      const postInfo = await this.reddit?.getPostById(postId);
      createdAt = postInfo?.createdAt.toString();
      await this.redis.hSet(key, {
        postId,
        postType: postType ?? 'daily',
        createdAt: postInfo?.createdAt.toString() ?? new Date().toString(),
      });
    }
    return {
      postId,
      postType: postType ?? 'daily',
      createdAt: createdAt ?? new Date().toString(),
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
  async addDailySolvedPuzzle(username: string, puzzleDay: string): Promise<void> {
    if (!username || !puzzleDay) {
      throw new Error('Invalid username or day.');
    }

    const key = this.keys.userDailySolvedList(username);
    const currentData = await this.redis.hGet(key, 'list');
    const solvedDays = currentData ? JSON.parse(currentData) : [];
    if (!solvedDays.includes(puzzleDay)) {
      solvedDays.push(puzzleDay);
      await this.redis.hSet(key, { list: JSON.stringify(solvedDays) });
    }
  }

  // increase total daily solved count and update streak
  async updateUserDailySolvedStats(username: string, puzzleDay: string): Promise<void> {
    if (!username || !puzzleDay) {
      throw new Error('Invalid username or day.');
    }

    // is today this daily puzzle's day? we only want to update stats when user does the daily puzzle for today
    const today = new Date();
    const day = today.getMonth() + 1 + '-' + today.getDate() + '-' + today.getFullYear();
    const isTodayPuzzleDay = day === puzzleDay;

    const dailySolvedListKey = this.keys.userDailySolvedList(username);
    const dailySolvedList = await this.redis.hGet(dailySolvedListKey, 'list');

    console.log('daily solved list', dailySolvedList);

    if (!dailySolvedList?.includes(puzzleDay)) {
      console.log('day not in daily solved list');
      // if today wasn't previously solved, add it to the list
      await this.addDailySolvedPuzzle(username, puzzleDay);

      // increment total daily solved count
      const dailySolvedCountKey = this.keys.userDailySolvedCount(username);
      await this.redis.hIncrBy(dailySolvedCountKey, day, 1);
      console.log('incremented daily solved count for', day);

      function isYesterday(date: Date): boolean {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return (
          date.getFullYear() === yesterday.getFullYear() &&
          date.getMonth() === yesterday.getMonth() &&
          date.getDate() === yesterday.getDate()
        );
      }

      if (isTodayPuzzleDay) {
        // if today is puzzle day, let's update the streak
        const lastDailySolvedKey = this.keys.userLastDailySolved(username);
        const lastDailySolved = await this.redis.hGet(lastDailySolvedKey, 'date');
        console.log('last solved day', lastDailySolved);

        // if last solved day, covert to Date object, if not make sure last solved is way in the past
        const lastSolvedDay = lastDailySolved ? new Date(lastDailySolved) : new Date(0);

        const streakKey = this.keys.userStreak(username);
        if (isYesterday(lastSolvedDay)) {
          // if the last solved day is yesterday, increment streak
          await this.redis.hIncrBy(streakKey, 'streak', 1);
          console.log('incremented streak - yesterday puzzle was solved');
        } else {
          // if the last solved day is not yesterday, reset streak
          await this.redis.hSet(streakKey, { streak: '1' });
          console.log('reset streak - yesterday puzzle was not solved');
        }

        // update last solved day
        await this.redis.hSet(lastDailySolvedKey, { date: day });
        console.log('updated last solved day to', day);
      }
    } else {
      console.log('day already in daily solved list');
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

    const key = this.keys.userDailySolvedList(username);
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

    const key = this.keys.userStreak(username);
    const streak = await this.redis.hGet(key, 'streak');
    console.log(streak);
    return streak ? parseInt(streak, 10) : 0;
  }

  getUserDailySolvedCount(username: string): Promise<number> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userDailySolvedCount(username);
    return this.redis.hGetAll(key).then((data) => {
      return Object.values(data).reduce((acc, val) => acc + parseInt(val, 10), 0);
    });
  }

  async getUserLastSolved(username: string): Promise<string> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userLastDailySolved(username);
    const lastSolved = await this.redis.hGet(key, 'date');
    return lastSolved ?? '';
  }
}
