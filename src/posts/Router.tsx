import type { Context } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';

import { Service } from '../../server/Service.js';
import type { PostId, PostData, UserGenPostData } from '../shared.js';
import { PinnedPost } from './PinnedPost.js';
import { PostType } from '../shared.js';
import { DailyPost } from './DailyPost.js';
import { UserGeneratedPost } from './UserGeneratedPost.js';
/*
 * Page Router
 *
 * This is the post type router and the main entry point for the custom post.
 * It handles the initial data loading and routing to the correct page based on the post type.
 */

export const Router: Devvit.CustomPostComponent = (context: Context) => {
  const postId = context.postId as PostId;
  const service = new Service(context);

  const getUsername = async () => {
    if (!context.userId) return null; // Return early if no userId
    const cacheKey = 'cache:userId-username';
    const cache = await context.redis.hGet(cacheKey, context.userId);
    if (cache) {
      return cache;
    } else {
      const user = await context.reddit.getUserById(context.userId);
      if (user) {
        await context.redis.hSet(cacheKey, {
          [context.userId]: user.username,
        });
        return user.username;
      }
    }
    return null;
  };

  function getPostData(postType: PostType, postId: PostId): Promise<PostData> {
    switch (postType) {
      case PostType.PINNED:
        return service.getPinnedPost(postId);
      case PostType.DAILY:
        return service.getDailyPost(postId);
      case PostType.USERGENERATED:
        return service.getUserGeneratedPost(postId);
      default:
        return service.getPinnedPost(postId);
    }
  }

  const [data] = useState<{
    postData: PostData;
    postType: PostType;
    username: string | null;
  }>(async () => {
    const [postType, username] = await Promise.all([service.getPostType(postId), getUsername()]);
    const [postData] = await Promise.all([getPostData(postType, postId)]);
    return {
      postData,
      postType,
      username,
    };
  });

  const postTypes: Record<string, JSX.Element> = {
    daily: <DailyPost postData={data.postData as PostData} username={data.username} />,
    pinned: <PinnedPost postData={data.postData as PostData} username={data.username} />,
    usergenerated: (
      <UserGeneratedPost postData={data.postData as UserGenPostData} username={data.username} />
    ),
  };

  return (
    <zstack width="100%" height="100%" alignment="top start">
      {postTypes[data.postType] || (
        <vstack alignment="center middle" grow>
          <text>Error: Unknown post type</text>
        </vstack>
      )}
    </zstack>
  );
};
