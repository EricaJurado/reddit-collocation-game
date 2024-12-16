import type { RedditAPIClient, RedisClient, Scheduler, ZRangeOptions } from '@devvit/public-api';
import type {
  LeaderboardEntry,
  PostData,
  PostId,
  PostType,
  UserGenPostData,
} from '../src/shared.js';

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
    userPuzzles: (username: string) => `user:${username}:puzzles`,
    puzzlePostMap: () => `puzzle:post:map`,
    userSolved: (username: string) => `user:${username}:solvedPuzzles`,
    userDailySolvedList: (username: string) => `user:${username}:dailySolvedPuzzles`,
    userDailySolvedCount: (username: string) => `user:${username}:dailySolvedCount`,
    userStreak: (username: string) => `user:${username}:streak`, // current daily streak
    userLongestStreak: (username: string) => `user:${username}:longestStreak`, // longest daily streak
    userLastDailySolved: (username: string) => `user:${username}:lastDailySolved`,
    userFlair: (username: string) => `user:${username}:flair`,
    dailyLeaderboard: 'dailyLeaderboard',
    streakLeaderboard: 'streakLeaderboard',
    gameSettings: 'game-settings',
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
  async getPinnedPost(postId: PostId): Promise<PostData> {
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
  async getDailyPost(postId: PostId): Promise<PostData> {
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
    const day = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
    const isTodayPuzzleDay = day === puzzleDay;

    const dailySolvedListKey = this.keys.userDailySolvedList(username);
    const dailySolvedList = await this.redis.hGet(dailySolvedListKey, 'list');

    if (dailySolvedList?.includes(puzzleDay)) {
      await this.updateLeaderboards(username);
      return;
    }

    await this.addDailySolvedPuzzle(username, puzzleDay);
    const dailySolvedCountKey = this.keys.userDailySolvedCount(username);
    await this.redis.hIncrBy(dailySolvedCountKey, day, 1);

    const dailySolvedCount = await this.getUserDailySolvedCount(username);
    await this.updateDailyLeaderboard(username, dailySolvedCount);

    if (isTodayPuzzleDay) {
      await this.handleStreakUpdate(username, day);
    }
  }

  /**
   * Updates the daily and streak leaderboards.
   * @param username - The username of the user.
   */
  private async updateLeaderboards(username: string): Promise<void> {
    const dailySolvedCount = await this.getUserDailySolvedCount(username);
    await this.updateDailyLeaderboard(username, dailySolvedCount);

    const streak = await this.getUserStreak(username);
    await this.updateDailyStreakLeaderboard(username, streak);
  }

  /**
   * Handles streak updates for the user.
   * @param username - The username of the user.
   * @param currentDay - The current day in MM-DD-YYYY format.
   */
  private async handleStreakUpdate(username: string, currentDay: string): Promise<void> {
    const lastDailySolvedKey = this.keys.userLastDailySolved(username);
    const lastDailySolved = await this.redis.hGet(lastDailySolvedKey, 'date');
    const lastSolvedDay = lastDailySolved ? new Date(lastDailySolved) : new Date(0);

    const streakKey = this.keys.userStreak(username);
    const longestStreakKey = this.keys.userLongestStreak(username);

    const isYesterday = (date: Date): boolean => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return (
        date.getFullYear() === yesterday.getFullYear() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getDate() === yesterday.getDate()
      );
    };

    // Calculate the new streak based on whether yesterday's puzzle was solved
    const newStreak = isYesterday(lastSolvedDay)
      ? await this.redis.hIncrBy(streakKey, 'streak', 1)
      : 1;

    // If the new streak is 1, initialize it
    if (newStreak === 1) {
      await this.redis.hSet(streakKey, { streak: '1' });
    }

    // Fetch the longest streak to compare with the new streak
    const longestStreak = parseInt((await this.redis.hGet(longestStreakKey, 'longest')) || '0', 10);

    // If the new streak is longer than the current longest streak, update the longest streak
    if (newStreak > longestStreak) {
      await this.redis.hSet(longestStreakKey, { longest: newStreak.toString() });
    }

    // Update the daily streak leaderboard with the new streak
    await this.updateDailyStreakLeaderboard(username, newStreak);

    // Set the last solved date to today
    await this.redis.hSet(lastDailySolvedKey, { date: currentDay });

    // If a subreddit exists, trigger a job for the streak update
    const subreddit = await this.reddit?.getCurrentSubreddit();
    if (subreddit?.name) {
      await this.scheduler?.runJob({
        name: 'USER_STREAK_UP',
        data: { username, streak: newStreak, subredditName: subreddit.name },
        runAt: new Date(),
      });
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
   * Retrieves the longest streak for a user.
   * @param username - The username of the user.
   * @returns A promise that resolves to the user's longest streak.
   * @throws Will throw an error if the username is invalid.
   */
  async getUserLongestStreak(username: string): Promise<number> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userLongestStreak(username);
    const longestStreak = await this.redis.hGet(key, 'longest');
    return longestStreak ? parseInt(longestStreak, 10) : 0;
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

  /**
   * Retrieves the last solved date for a user.
   * @param username - The username of the user.
   * @returns A promise that resolves to the last solved date as a string.
   * @throws Will throw an error if the username is invalid.
   */
  async getUserLastSolved(username: string): Promise<string> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userLastDailySolved(username);
    const lastSolved = await this.redis.hGet(key, 'date');
    return lastSolved ?? '';
  }

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

  /**
   * Saves a user-generated puzzle.
   * @param username - The username of the user.
   * @param puzzleData - The puzzle data (can be JSON or a string representation of the puzzle).
   * @param postId - The ID of the post where the puzzle is shared.
   * @returns A promise that resolves when the puzzle is saved.
   * @throws Will throw an error if the username, puzzle data, or postId is invalid.
   */
  async saveUserPuzzle(username: string, puzzleData: any, postId: PostId): Promise<void> {
    if (!username || !puzzleData || !postId) {
      throw new Error('Invalid username, puzzle data, or post ID.');
    }

    const userPuzzlesKey = this.keys.userPuzzles(username);
    const puzzlePostMapKey = this.keys.puzzlePostMap();

    const puzzleId = `${username}-${Date.now()}`; // Unique identifier for the puzzle
    const puzzleEntry = {
      id: puzzleId,
      data: JSON.stringify(puzzleData),
      postId: postId as string,
      postType: 'usergenerated',
      createdAt: new Date().toISOString(),
    };

    // Save the puzzle under the post's key
    const key = this.keys.postData(postId);
    await this.redis.hSet(key, puzzleEntry);

    // Save the puzzle under the user's key
    await this.redis.hSet(userPuzzlesKey, { [puzzleId]: JSON.stringify(puzzleEntry) });

    // Save the mapping of postId to puzzle
    await this.redis.hSet(puzzlePostMapKey, { [postId]: JSON.stringify(puzzleEntry) });
  }

  /**
   * Retrieves a user-generated post from Redis.
   * @param postId - The ID of the post in the format `t3_${string}`.
   * @returns A promise that resolves to the user-generated post data.
   */
  async getUserGeneratedPost(postId: PostId): Promise<UserGenPostData> {
    const key = this.keys.puzzlePostMap(); // This key maps post IDs to puzzle entries
    const puzzleEntryRaw = await this.redis.hGet(key, postId);

    if (!puzzleEntryRaw) {
      throw new Error(`Post with ID ${postId} not found.`);
    }

    const puzzleEntry = JSON.parse(puzzleEntryRaw);

    // Ensure all required fields are present
    const { id, data, postType, createdAt } = puzzleEntry;
    return {
      data: JSON.parse(data), // Parse the stored puzzle data
      postId, // Post ID already matches the `PostId` type
      postType: postType ?? 'usergenerated',
      createdAt: createdAt ?? new Date().toISOString(),
    };
  }

  /**
   * Retrieves all puzzles created by a specific user.
   * @param username - The username of the user.
   * @returns A promise that resolves to an array of puzzles created by the user.
   * @throws Will throw an error if the username is invalid.
   */
  async getUserPuzzles(username: string): Promise<any[]> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const userPuzzlesKey = this.keys.userPuzzles(username);
    const puzzles = await this.redis.hGetAll(userPuzzlesKey);

    // Parse and return the puzzles as an array
    return Object.values(puzzles).map((puzzle) => JSON.parse(puzzle));
  }
}
