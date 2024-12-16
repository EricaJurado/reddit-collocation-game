import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { UserGenPostData } from '../shared.js';
import { Service } from '../../server/Service.js';
import { MenuHomePage } from '../pages/MenuHomePage.js';

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
    const postDataFromService = await service.getUserGeneratedPost(props.postData.postId);
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
    if (props.username) {
      console.log(' puzzle solved should be saved');
      const puzzleId = props.postData.postId;
      // add the solved puzzle to the user's list of solved puzzles
      // await service.addDailySolvedPuzzle(props.username, puzzleId); // Assuming shared logic
      setPage('menu');
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
    menu: <MenuHomePage username={props.username} postData={props.postData} pageSetter={setPage} />,
  };

  return (
    <vstack key={page}>
      {isPuzzleSolved && <text>Puzzle Solved ✅</text>}
      <text>Created At: {createdAtString}</text>
      <text>Current Page: {page}</text>
      {pages[page]}
    </vstack>
  );
};
