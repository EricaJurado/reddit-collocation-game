import { ServiceBase } from './ServiceBase.js';
import type { PostId, PostType, PostData } from '../src/shared.js';

export class PuzzleService extends ServiceBase {
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
      puzzle: JSON.stringify(puzzleData),
      postId: postId as string,
      postType: 'usergenerated',
      creator: username,
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
