import type { Context } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';

import { Service } from '../../server/Service.js';
import type { PinnedPostData, PostId } from '../shared.js';
import { PinnedPost } from './PinnedPost.js';
import { PostType } from '../shared.js';
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

  function getPostData(postType: PostType, postId: PostId): Promise<PinnedPostData> {
    switch (postType) {
      case PostType.PINNED:
        return service.getPinnedPost(postId);
      default:
        return service.getPinnedPost(postId);
    }
  }

  const [data] = useState<{
    postData: PinnedPostData;
    postType: PostType;
    username: string | null;
  }>(async () => {
    // First batch
    const [postType, username] = await Promise.all([service.getPostType(postId), getUsername()]);

    // Second batch
    const [postData] = await Promise.all([getPostData(postType, postId)]);
    console.log('postData', postData);
    return {
      postData,
      postType,
      username,
    };
  });

  console.log(data);

  const postTypes: Record<string, JSX.Element> = {
    pinned: (
      <vstack>
        <text>pinned</text>
      </vstack>
    ),
    drawing: (
      <vstack>
        <text>drawing</text>
      </vstack>
    ),
    // pinned: <PinnedPost postData={data as PinnedPostData} username={data.username} />,
    // Add more post types here
  };

  /*
   * Return the custom post unit
   */

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
