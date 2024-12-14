import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from '@devvit/public-api';

import type {
  PinnedPostData,
  UserData,
  PostId,
  PostType,
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

  readonly keys = {
    postGuesses: (postId: PostId) => `guesses:${postId}`,
    postSolved: (postId: PostId) => `solved:${postId}`,
    postData: (postId: PostId) => `post:${postId}`,
    userData: (username: string) => `users:${username}`,
    postUserGuessCounter: (postId: PostId) => `user-guess-counter:${postId}`,
  };

  async getUser(username: string | null, postId: PostId): Promise<UserData | null> {
    if (!username) return null;
    const data = await this.redis.hGetAll(this.keys.userData(username));
    const solved = !!(await this.redis.zScore(this.keys.postSolved(postId), username));

    const guessCount =
      (await this.redis.zScore(this.keys.postUserGuessCounter(postId), username)) ?? 0;
    const parsedData: UserData = {
      solved,
      guessCount,
    };
    return parsedData;
  }

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
}
