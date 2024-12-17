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

export type UserGenPostData = PostData & {
  puzzle: string[];
  creator: UserId;
}

export enum PostType {
  USERGENERATED = 'usergenerated',
  DAILY = 'daily',
  PINNED = 'pinned',
}


export type UserData = {
  flairRank: number;
};


export type LeaderboardEntry = {
  username: string;
  score: number;
}
