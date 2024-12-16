import { Devvit, useAsync, useForm, type Context } from '@devvit/public-api';
import { useState } from '@devvit/public-api';
import { Service } from '../../server/Service.js';
import { LeaderboardEntry } from '../shared.js';

interface LeaderboardPageProps {
  username: string | null;
}

export const LeaderboardPage = (props: LeaderboardPageProps, context: Context): JSX.Element => {
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

  // last solved
  const [lastSolved] = useState(async () => {
    if (props.username) {
      const last = await service.getUserLastSolved(props.username);
      console.log('lastSolved', last);
      return last || ''; // Default to empty string if null or undefined
    } else {
      return '';
    }
  });

  // total daily leaderboard
  const [dailyLeaderboard] = useState<LeaderboardEntry[]>(async () => {
    const leaderboard = await service.getDailyLeaderboard();
    console.log('dailyLeaderboard', leaderboard);
    return leaderboard || []; // Default to empty array if null
  });

  const dailyLeaderboardStack = dailyLeaderboard.map((user, index) => (
    <hstack key={index.toString()} alignment="center middle">
      <text>{index + 1}</text>
      <text>{user.username}</text>
      <text>{user.score}</text>
    </hstack>
  ));

  // streak leaderboard
  const [streakLeaderboard] = useState<LeaderboardEntry[]>(async () => {
    const leaderboard = await service.getDailyStreakLeaderboard();
    console.log('streakLeaderboard', leaderboard);
    return leaderboard || []; // Default to empty array if null
  });

  const streakLeaderboardStack = streakLeaderboard.map((user, index) => (
    <hstack key={index.toString()} alignment="center middle">
      <text>{index + 1}</text>
      <text>{user.username}</text>
      <text>{user.score}</text>
    </hstack>
  ));

  return (
    <vstack padding="medium" gap="medium">
      <text>Leaderboard Page</text>
      <text key={streak.toString()}>Current Streak: {streak}</text>
      <text key={dailySolved.toString()}>Total Daily Solved: {dailySolved.toString()}</text>
      <text key={lastSolved}>Last Solved: {lastSolved}</text>

      <text>Streak Leaderboard</text>
      {streakLeaderboardStack}

      <text>Daily Leaderboard</text>
      {dailyLeaderboardStack}
    </vstack>
  );
};
