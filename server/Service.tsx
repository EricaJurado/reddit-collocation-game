import type {
  Post,
  RedditAPIClient,
  RedisClient,
  Scheduler,
  ZRangeOptions,
} from '@devvit/public-api';

import type {
  //   DrawingPostData,
  PinnedPostData,
  PostData,
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

  readonly tags = {
    scores: 'default',
  };

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

  async getPostType(postId: PostId) {
    const key = this.keys.postData(postId);
    const postType = await this.redis.hGet(key, 'postType');
    const defaultPostType = 'drawing';
    return (postType ?? defaultPostType) as PostType;
  }

  /*
   * Pinned Post
   */

  async savePinnedPost(postId: PostId): Promise<void> {
    const key = this.keys.postData(postId);
    await this.redis.hSet(key, {
      postId,
      postType: 'pinned',
    });
  }

  async getPinnedPost(postId: PostId): Promise<PinnedPostData> {
    const key = this.keys.postData(postId);
    const postType = await this.redis.hGet(key, 'postType');
    return {
      postId,
      postType: postType ?? 'pinned',
    };
  }
}
