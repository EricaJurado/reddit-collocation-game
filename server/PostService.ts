import { ServiceBase } from './ServiceBase.js';
import type { PostId, PostType, PostData, UserGenPostData } from '../src/shared.js';

export class PostService extends ServiceBase {
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
    const { data, postType, createdAt, creator, puzzle } = puzzleEntry;
    return {
      puzzle: (puzzle && Array.isArray(JSON.parse(puzzle))) ? JSON.parse(puzzle) : [],
      // puzzle: JSON.parse(data), // Parse the stored puzzle data
      postId, // Post ID already matches the `PostId` type
      postType: postType ?? 'usergenerated',
      createdAt: createdAt ?? new Date().toISOString(),
      creator: creator,
    };
  }
}
