import { Devvit, useAsync, useForm, type Context } from '@devvit/public-api';
import { useState } from '@devvit/public-api';
import { Service } from '../../server/Service.js';
import { LeaderboardEntry } from '../shared.js';

interface LeaderboardPageProps {
  username: string | null;
}

export const LeaderboardPage = (props: LeaderboardPageProps, context: Context): JSX.Element => {
  const service = new Service(context);

  // State hooks
  const [streak] = useState(async () =>
    props.username ? await service.userService.getUserStreak(props.username) : 0
  );
  const [dailySolved] = useState(async () =>
    props.username ? await service.userService.getUserDailySolvedCount(props.username) : 0
  );
  const [lastSolved] = useState(async () =>
    props.username ? (await service.userService.getUserLastSolved(props.username)) || '' : ''
  );
  const [userGenSolved] = useState(async () =>
    props.username ? await service.userService.getUserGeneratedPuzzleSolvedCount(props.username) : 0
  );

  const [userCreated] = useState(async () =>
    props.username ? await service.userService.getUserCreatedPuzzleCount(props.username) : 0
  );

  const [dailyLeaderboard] = useState<LeaderboardEntry[]>(
    async () => (await service.leaderboardService.getDailyLeaderboard()) || []
  );
  const [streakLeaderboard] = useState<LeaderboardEntry[]>(
    async () => (await service.leaderboardService.getDailyStreakLeaderboard()) || []
  );

  const [userGenSolvedLeaderboard] = useState<LeaderboardEntry[]>(
    async () => (await service.leaderboardService.getUserGenSolvedLeaderboard()) || []
  );

  const [userCreatedLeaderboard] = useState<LeaderboardEntry[]>(
    async () => (await service.leaderboardService.getUserCreatedPuzzleLeaderboard()) || []
  );

  // Utility function to create a vertical column of leaderboard data
  const createColumn = (
    data: LeaderboardEntry[],
    keyName: keyof LeaderboardEntry,
    title: string,
    colTitleAlignment: Devvit.Blocks.Alignment,
    colDataAlignment: Devvit.Blocks.Alignment
  ) => (
    <vstack gap="small">
      <hstack alignment={colTitleAlignment || 'top center'} gap="small">
        <text color="black" weight="bold">
          {title}
        </text>
      </hstack>
      {data.map((entry, index) => (
        <text color="black" alignment={colDataAlignment || 'middle center'} key={index.toString()}>
          {entry[keyName]}
        </text>
      ))}
    </vstack>
  );

  // UI render
  return (
    <vstack padding="medium" gap="medium">
      <text color="black" size="large" weight="bold">
        Leaderboard Page
      </text>

      {/* User Streak Info */}
      <hstack alignment="center middle" gap="medium">
        <text color="black">Current Streak: {streak}</text>
        <spacer />
        <text color="black">Total Daily Solved: {dailySolved}</text>
        <spacer />
        <text color="black">Last Solved: {lastSolved}</text>
      </hstack>

      {/* Streak Leaderboard */}
      <text color="black" size="medium" weight="bold">
        Streak Leaderboard
      </text>
      <hstack alignment="top start" gap="large">
        {createColumn(streakLeaderboard, 'username', 'User', 'middle center', 'top center')}
        {createColumn(streakLeaderboard, 'score', 'Streak', 'middle center', 'top center')}
      </hstack>

      {/* Daily Leaderboard */}
      <text color="black" size="medium" weight="bold">
        Daily Leaderboard
      </text>
      <hstack alignment="top start" gap="large">
        {createColumn(dailyLeaderboard, 'username', 'User', 'middle center', 'top center')}
        {createColumn(dailyLeaderboard, 'score', 'Streak', 'top center', 'middle start')}
      </hstack>

      {/* User Generated Solved Puzzles */}
      {/* <text size="medium" weight="bold">
        User Generated Solved Puzzles
      </text>
      <hstack alignment="top start" gap="large">
        {createColumn(userGenSolvedLeaderboard, 'username', 'User', 'middle center', 'top center')}
        {createColumn(userGenSolvedLeaderboard, 'score', 'Solved', 'top center', 'middle start')}
      </hstack> */}

      {/* User Created Puzzles */}
      <text color="black" size="medium" weight="bold">
        User Created Puzzles
      </text>
      <hstack alignment="top start" gap="large">
        {createColumn(userCreatedLeaderboard, 'username', 'User', 'middle center', 'top center')}
        {createColumn(userCreatedLeaderboard, 'score', 'Created', 'top center', 'middle start')}
      </hstack>
    </vstack>
  );
};
