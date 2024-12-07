import { Devvit } from "@devvit/public-api";

const API_URL = "https://pokeapi.co/api/v2/pokemon";

export const getPokemonByName = async (name: string) => {
  const response = await fetch(`${API_URL}/${name}`);
  const data = await response.json();

  return data;
};

interface CollocationResponse {
  bolls: Array<{
    base: string;
    collocation: string;
    score: number;
  }>;
}

export async function fetchRapidAPIData(
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

  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "linguatools-english-collocations.p.rapidapi.com",
    },
  };

  const url: URL = new URL(
    "https://linguatools-english-collocations.p.rapidapi.com/bolls/v2"
  );

  const params = {
    lang: "en",
    query: "light", // Change this to test other queries
    max_results: "2",
    relation: "N:nn:N",
    min_sig: "10000",
  };

  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url.toString(), requestOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
