import type { RedditAPIClient, RedisClient, Scheduler, ZRangeOptions } from '@devvit/public-api';
import type { LeaderboardEntry, PinnedPostData, PostId, PostType } from '../src/shared.js';

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
   *
   */
  readonly keys = {
    postData: (postId: PostId) => `post:${postId}`,
    userPuzzles: (username: string) => `user:${username}:createdPuzzles`,
    userSolved: (username: string) => `user:${username}:solvedPuzzles`,
    userDailySolvedList: (username: string) => `user:${username}:dailySolvedPuzzles`,
    userDailySolvedCount: (username: string) => `user:${username}:dailySolvedCount`,
    userStreak: (username: string) => `user:${username}:streak`,
    userLastDailySolved: (username: string) => `user:${username}:lastDailySolved`,
    dailyLeaderboard: 'dailyLeaderboard',
    streakLeaderboard: 'streakLeaderboard',
  };

  /*
   * Post data
   */

  /**
   * Retrieves the type of a post from Redis.
   * @param postId - The ID of the post.
   * @returns A promise that resolves to the type of the post.
   */
  async getPostType(postId: PostId): Promise<PostType> {
    const key = this.keys.postData(postId);
    const postType = await this.redis.hGet(key, 'postType');
    const defaultPostType = 'daily';
    return (postType ?? defaultPostType) as PostType;
  }

  /*
   * Pinned Post
   */
  /**
   * Saves a pinned post to Redis.
   * @param postId - The ID of the post.
   * @param createdAt - The creation date of the post.
   * @returns A promise that resolves when the post is saved.
   */
  async savePinnedPost(postId: PostId, createdAt: Date): Promise<void> {
    const key = this.keys.postData(postId);
    await this.redis.hSet(key, {
      postId,
      postType: 'pinned',
      createdAt: createdAt.toString(),
    });
  }

  /**
   * Retrieves a pinned post from Redis.
   * @param postId - The ID of the post.
   * @returns A promise that resolves to the pinned post data.
   */
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
  /**
   * Saves a daily post to Redis.
   * @param postId - The ID of the post.
   * @param createdAt - The creation date of the post.
   * @returns A promise that resolves when the post is saved.
   */
  async saveDailyPost(postId: PostId, createdAt: Date): Promise<void> {
    const key = this.keys.postData(postId);
    await this.redis.hSet(key, {
      postId,
      postType: 'daily',
      createdAt: createdAt.toString(),
    });
  }

  /**
   * Retrieves a daily post from Redis.
   * @param postId - The ID of the post.
   * @returns A promise that resolves to the daily post data.
   */
  async getDailyPost(postId: PostId): Promise<PinnedPostData> {
    const key = this.keys.postData(postId);
    const postType = await this.redis.hGet(key, 'postType');
    let createdAt = await this.redis.hGet(key, 'createdAt');
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

  /*
   * User Daily Solved Puzzles
   */
  /**
   * Adds a solved daily puzzle for a user.
   * @param username - The username of the user.
   * @param puzzleDay - The day of the puzzle.
   * @returns A promise that resolves when the puzzle is added.
   * @throws Will throw an error if the username or puzzle day is invalid.
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

  /**
   * Updates the daily solved puzzle stats for a user. Will also update the daily and streak leaderboards accordingly.
   * @param username - The username of the user.
   * @param puzzleDay - The day of the puzzle in MM-DD-YYYY format.
   * @returns A promise that resolves when the stats are updated.
   * @throws Will throw an error if the username or puzzle day is invalid.
   */
  async updateUserDailySolvedStats(username: string, puzzleDay: string): Promise<void> {
    if (!username || !puzzleDay) {
      throw new Error('Invalid username or day.');
    }

    const today = new Date();
    const day = today.getMonth() + 1 + '-' + today.getDate() + '-' + today.getFullYear();
    const isTodayPuzzleDay = day === puzzleDay;

    const dailySolvedListKey = this.keys.userDailySolvedList(username);
    const dailySolvedList = await this.redis.hGet(dailySolvedListKey, 'list');

    if (!dailySolvedList?.includes(puzzleDay)) {
      await this.addDailySolvedPuzzle(username, puzzleDay);

      const dailySolvedCountKey = this.keys.userDailySolvedCount(username);
      await this.redis.hIncrBy(dailySolvedCountKey, day, 1);

      // update leaderboard
      const dailySolvedCount = await this.getUserDailySolvedCount(username);
      console.log('first if trying to update daily leaderboard', username, dailySolvedCount);
      await this.updateDailyLeaderboard(username, dailySolvedCount);

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
        const lastDailySolvedKey = this.keys.userLastDailySolved(username);
        const lastDailySolved = await this.redis.hGet(lastDailySolvedKey, 'date');
        const lastSolvedDay = lastDailySolved ? new Date(lastDailySolved) : new Date(0);

        const streakKey = this.keys.userStreak(username);
        if (isYesterday(lastSolvedDay)) {
          await this.redis.hIncrBy(streakKey, 'streak', 1);
          const streak = await this.getUserStreak(username);
          console.log('if trying to update daily streak leaderboard', username, streak);
          await this.updateDailyStreakLeaderboard(username, streak);
        } else {
          await this.redis.hSet(streakKey, { streak: '1' });
          console.log('if trying to update daily streak leaderboard', username, 1);
          await this.updateDailyStreakLeaderboard(username, 1);
        }

        await this.redis.hSet(lastDailySolvedKey, { date: day });
      }
    } else {
      // make sure leadboard is update even if user solved before
      const dailySolvedCount = await this.getUserDailySolvedCount(username);
      console.log('else trying to update daily leaderboard', username, dailySolvedCount);
      await this.updateDailyLeaderboard(username, dailySolvedCount);

      const streak = await this.getUserStreak(username);
      console.log('else trying to update daily streak leaderboard', username, streak);
      await this.updateDailyStreakLeaderboard(username, streak);
    }
  }

  /**
   * Retrieves the list of daily solved puzzles for a user.
   * @param username - The username of the user.
   * @returns A promise that resolves to an array of solved puzzle days.
   * @throws Will throw an error if the username is invalid.
   */
  async getDailySolvedPuzzles(username: string): Promise<string[]> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userDailySolvedList(username);
    const currentData = await this.redis.hGet(key, 'list');
    return currentData ? JSON.parse(currentData) : [];
  }

  /*
   * Leaderboards
   */
  /**
   * Retrieves the daily leaderboard.
   * @param limit - The maximum number of entries to retrieve. Defaults to 10.
   * @returns A promise that resolves to an array of leaderboard entries.
   */
  async getDailyLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const leaderboardKey = this.keys.dailyLeaderboard;
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
  async updateDailyLeaderboard(username: string, score: number): Promise<void> {
    const leaderboardKey = this.keys.dailyLeaderboard;
    await this.redis.zAdd(leaderboardKey, { member: username, score });
  }

  /**
   * Retrieves the streak leaderboard.
   * @param limit - The maximum number of entries to retrieve. Defaults to 10.
   * @returns A promise that resolves to an array of leaderboard entries.
   */
  async getDailyStreakLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const leaderboardKey = this.keys.streakLeaderboard;
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
  async updateDailyStreakLeaderboard(username: string, score: number): Promise<void> {
    const leaderboardKey = this.keys.streakLeaderboard;
    await this.redis.zAdd(leaderboardKey, { member: username, score });
  }

  /*
   * User Stats
   */
  /**
   * Retrieves the current streak for a user.
   * @param username - The username of the user.
   * @returns A promise that resolves to the user's current streak.
   * @throws Will throw an error if the username is invalid.
   */
  async getUserStreak(username: string): Promise<number> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userStreak(username);
    const streak = await this.redis.hGet(key, 'streak');
    return streak ? parseInt(streak, 10) : 0;
  }

  /**
   * Retrieves the total count of daily solved puzzles for a user.
   * @param username - The username of the user.
   * @returns A promise that resolves to the total count of daily solved puzzles.
   * @throws Will throw an error if the username is invalid.
   */
  async getUserDailySolvedCount(username: string): Promise<number> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userDailySolvedCount(username);
    const data = await this.redis.hGetAll(key);
    return Object.values(data).reduce((acc, val) => acc + parseInt(val, 10), 0);
  }

  async getUserLastSolved(username: string): Promise<string> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    /**
     * Retrieves the last solved date for a user.
     * @param username - The username of the user.
     * @returns A promise that resolves to the last solved date as a string.
     * @throws Will throw an error if the username is invalid.
     */
    const key = this.keys.userLastDailySolved(username);
    const lastSolved = await this.redis.hGet(key, 'date');
    return lastSolved ?? '';
  }
}
