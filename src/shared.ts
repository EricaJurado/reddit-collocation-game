export type CommentId = `t1_${string}`;
export type UserId = `t2_${string}`;
export type PostId = `t3_${string}`;
export type SubredditId = `t5_${string}`;

// Base post data
export type PostData = {
  postId: PostId;
  postType: string;
  createdAt: string;
};

// Pinned post
export type PinnedPostData = {
  postId: PostId;
  postType: string;
  createdAt: string;
};

// TODO: daily post
// TODO: usergen post


export enum PostType {
  USERGEN = 'usergen',
  DAILY = 'daily',
  PINNED = 'pinned',
}


export type UserData = {
  solved: boolean; // Has the user solved this post?
  guessCount: number;
};

