// Learn more at developers.reddit.com/docs
import { Devvit, useState } from "@devvit/public-api";
import axios, { AxiosResponse } from "axios";

Devvit.configure({
  redditAPI: true,
  http: true,
});

Devvit.addSettings([
  {
    name: "rapidapikey",
    label: "RapidAPI Key",
    type: "string",
    isSecret: true,
    scope: "app",
  },
]);

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: "Add my post",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: "My devvit post",
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: "Created post!" });
  },
});

interface CollocationResponse {
  bolls: Array<{
    base: string;
    collocation: string;
    score: number;
  }>;
}

async function fetchRapidAPIData(
  context: Devvit.Context
): Promise<CollocationResponse | null | string> {
  const apiKey = await context.settings.get("rapidapikey");
  let testing = "testing";
  if (typeof apiKey !== "string" || !apiKey) {
    testing = "uh-oh";
    throw new Error("RapidAPI key is missing or invalid in settings.");
  } else {
    console.log("Success apikey");
    testing = "success";
  }

  const url: string =
    "https://linguatools-english-collocations.p.rapidapi.com/bolls/v2";

  return testing;

  //   try {
  //     const response: AxiosResponse<any> = await axios.get(url, {
  //       params: {
  //         lang: "en",
  //         query: "light", // Change this to test other queries
  //         max_results: "2",
  //         relation: "N:nn:N",
  //         min_sig: "10000",
  //       },
  //       headers: {
  //         "x-rapidapi-key": apiKey,
  //         "x-rapidapi-host": "linguatools-english-collocations.p.rapidapi.com",
  //       },
  //     });

  //     console.log("Fetched Data:", response);
  //     return null;
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       console.error("Axios error:", error.message);
  //     } else {
  //       console.error("Unexpected error:", error);
  //     }
  //     return null;
  //   }
}

// Add a post type definition
Devvit.addCustomPostType({
  name: "Experience Post",
  height: "regular",
  render: (_context) => {
    const [counter, setCounter] = useState(0);
    const [answer, setAnswer] = useState<any>(null);

    async function onPress() {
      const response = await fetchRapidAPIData(_context);
      setAnswer(response);
    }

    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        <image
          url="logo.png"
          description="logo"
          imageHeight={256}
          imageWidth={256}
          height="48px"
          width="48px"
        />
        <text size="large">{`Click counter: ${counter}`}</text>
        <button appearance="primary" onPress={onPress}>
          Fetch Data
        </button>
        {answer}
      </vstack>
    );
  },
});

export default Devvit;
