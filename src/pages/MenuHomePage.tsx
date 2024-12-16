import { Devvit, type Context } from '@devvit/public-api';
import { useState } from '@devvit/public-api';
import type { PostData } from '../shared.js';
import { Service } from '../../server/Service.js';
import { DailyPost } from '../posts/DailyPost.js';
import { formatCreatedAtDate } from '../utils.js';

interface MenuProps {
  username: string | null;
  postData: PostData;
  pageSetter: (page: string) => void;
}

export const MenuHomePage = (props: MenuProps, context: Context): JSX.Element => {
  const service = new Service(context);

  const targetDate = formatCreatedAtDate(new Date(props.postData.createdAt));

  const [isDailySolved] = useState(async () => {
    if (props.username) {
      const puzzleList = await service.getDailySolvedPuzzles(props.username);
      const isDailyInSolvedList = puzzleList.includes(targetDate) ? true : false;
      return isDailyInSolvedList;
    } else {
      return false;
    }
  });

  return (
    <vstack width="100%" height="100%" alignment="center middle">
      {/* Menu */}
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => props.pageSetter('daily')}
        >
          <text>Today's Puzzle</text>
          {isDailySolved ? <text>✅</text> : <text>❌</text>}
        </hstack>
      </vstack>
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => props.pageSetter('leaderboard')}
        >
          <text>Leaderboard</text>
        </hstack>
      </vstack>
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => props.pageSetter('howto')}
        >
          <text>How To Play</text>
        </hstack>
      </vstack>
    </vstack>
  );
};
