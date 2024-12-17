import { ServiceBase } from './ServiceBase.js';

export class UserService extends ServiceBase {
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

  async addUserGeneratedSolvedPuzzle(username: string, puzzleId: string): Promise<void> {
    if (!username || !puzzleId) {
      throw new Error('Invalid username or puzzle ID.');
    }

    const key = this.keys.userUserGeneratedSolved(username);
    const currentData = await this.redis.hGet(key, 'list');
    const solvedPuzzles = currentData ? JSON.parse(currentData) : [];
    if (!solvedPuzzles.includes(puzzleId)) {
      solvedPuzzles.push(puzzleId);
      await this.redis.hSet(key, { list: JSON.stringify(solvedPuzzles) });
    }
  }

  async getUserGeneratedSolvedPuzzleList(username: string): Promise<string[]> {
    if (!username) {
      throw new Error('Invalid username.');
    }

    const key = this.keys.userUserGeneratedSolved(username);
    const currentData = await this.redis.hGet(key, 'list');
    return currentData ? JSON.parse(currentData) : [];
  }

  async getUserGeneratedPuzzleSolvedCount(username: string): Promise<number> {
    // get length of user generated solved list
    const key = this.keys.userUserGeneratedSolved(username);
    const currentData = await this.redis.hGet(key, 'list');
    const solvedPuzzles = currentData ? JSON.parse(currentData) : [];
    return solvedPuzzles.length;
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

    // const dailySolvedListKey = this.keys.userDailySolvedList(username);
    // const dailySolvedList = await this.redis.hGet(dailySolvedListKey, 'list');

    // if (dailySolvedList?.includes(puzzleDay)) {
    //   await this.leaderboardService.updateAllDailyLeaderboards(username);
    //   return;
    // }

    if (isTodayPuzzleDay) {
      await this.handleStreakUpdate(username, day);
    }
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
}
