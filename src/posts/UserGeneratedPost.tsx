import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { UserGenPostData } from '../shared.js';
import { Service } from '../../server/Service.js';
import { MenuHomePage } from '../pages/MenuHomePage.js';
import { WinPage } from '../pages/WinPage.js';
import { LeaderboardPage } from '../pages/LeaderboardPage.js';

interface UserGeneratedPostProps {
  postData: UserGenPostData;
  username: string | null;
}

// User-generated post for puzzles created by users
export const UserGeneratedPost = (props: UserGeneratedPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('puzzle');

  // Fetch the puzzle data from `props.postData`
  const puzzleData = useAsync(async () => {
    const postDataFromService = await service.postService.getUserGeneratedPost(
      props.postData.postId
    );
    return postDataFromService.data;
  });

  // Format the creation date of the post
  const createdAtDate = new Date(props.postData.createdAt);
  const createdAtString = createdAtDate.toLocaleDateString();

  const [isPuzzleSolved] = useState(async () => {
    if (props.username) {
      // get the list of solved puzzles for the user and see if the current puzzle is in the list
      // const solvedPuzzles = await service.getDailySolvedPuzzles(props.username); // Could be updated for user-generated solved list
      // return solvedPuzzles.includes(props.postData.postId);
      return false;
    }
    return false;
  });

  const savePuzzleSolved = async () => {
    setPage('win');
    if (props.username) {
      const puzzleId = props.postData.postId;
      await service.userService.addUserGeneratedSolvedPuzzle(props.username, puzzleId);
      const allSolved = await service.userService.getUserGeneratedSolvedPuzzleList(props.username);
      console.log(allSolved);

      // update leaderboard
      await service.leaderboardService.updateUserGenSolvedLeaderboard(props.username);
    }
  };

  const pages: Record<string, JSX.Element> = {
    puzzle: !puzzleData ? (
      <text>Loading...</text>
    ) : Array.isArray(puzzleData.data) ? (
      <GuessPage wordList={puzzleData.data} solvedSetter={savePuzzleSolved} />
    ) : (
      <text>Error: Could not load puzzle data.</text>
    ),
    win: <WinPage onNext={() => setPage('menu')} />,
    menu: <MenuHomePage username={props.username} postData={props.postData} pageSetter={setPage} />,
    leaderboard: <LeaderboardPage username={props.username} />,
  };

  return (
    <vstack key={page} height="100%" width="100%">
      <zstack height="100%" width="100%">
        {page !== 'menu' && (
          <hstack alignment="top end" width="100%">
            <button onPress={() => setPage('menu')}>Menu</button>
          </hstack>
        )}
        <hstack alignment="middle center" height="100%" width="100%">
          {pages[page]}
        </hstack>
      </zstack>
    </vstack>
  );
};
