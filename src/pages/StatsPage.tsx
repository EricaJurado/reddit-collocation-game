import { Devvit, useForm, type Context } from '@devvit/public-api';

import { useState } from '@devvit/public-api';
import { Service } from '../../server/Service.js';

interface StatsPageProps {
  username: string | null;
}

export const StatsPage = (props: StatsPageProps, context: Context): JSX.Element => {
  // get user stats
  const service = new Service(context);

  // get daily streak
  const [streak] = useState(async () => {
    if (props.username) {
      const currStreak = await service.getUserStreak(props.username);
      console.log('streak', currStreak);
      return currStreak;
    } else {
      return 0;
    }
  });

  // total daily solved
  const [dailySolved] = useState(async () => {
    if (props.username) {
      const totalDailySolved = await service.getUserDailySolvedCount(props.username);
      console.log('totalDailySolved', totalDailySolved);
      return totalDailySolved;
    } else {
      return 0;
    }
  });

  // lastest daily solved
  const [lastSolved] = useState(async () => {
    if (props.username) {
      const last = await service.getUserLastSolved(props.username);
      console.log('lastSolved', last);
      if (last) {
        return last;
      } else {
        return '';
      }
    } else {
      return '';
    }
  });

  // total daily leaderboard
  const [dailyLeaderboard] = useState(async () => {
    const leaderboard = await service.getDailyLeaderboard();
    console.log('dailyLeaderboard', leaderboard);
    return leaderboard;
  });

  // streak leaderboard
  const [streakLeaderboard] = useState(async () => {
    const leaderboard = await service.getDailyStreakLeaderboard();
    console.log('streakLeaderboard', leaderboard);
    return leaderboard;
  });

  return (
    <vstack padding="medium" gap="medium">
      <text>Stats Page</text>
      <text key={streak.toString()}>Current Streak: {streak}</text>
      <text key={dailySolved.toString()}>Total Daily Solved: {dailySolved.toString()}</text>
      <text key={lastSolved}>Last Solved: {lastSolved}</text>

      {/* {dailyLeaderboard ? (
        <>
          {dailyLeaderboard.map((user, index) => (
            <hstack key={index} alignment="center middle">
              <text>{index + 1}</text>
              <text>{user.username}</text>
              <text>{user.dailySolved}</text>
            </hstack>
          ))}
        </>
      ) : null} */}
      <text>Daily Leaderboard</text>
    </vstack>
  );
};
