// Poster imports
import posterCLOY from "@/assets/posters/crash-landing-on-you.jpg";
import posterGoblin from "@/assets/posters/goblin.jpg";
import posterDOTS from "@/assets/posters/descendants-of-the-sun.jpg";
import posterMLFTS from "@/assets/posters/my-love-from-the-star.jpg";
import posterItaewon from "@/assets/posters/itaewon-class.jpg";
import posterVincenzo from "@/assets/posters/vincenzo.jpg";
import posterStartUp from "@/assets/posters/start-up.jpg";
import posterReply from "@/assets/posters/reply-1988.jpg";
import posterSquidGame from "@/assets/posters/squid-game.jpg";
import posterAOUAD from "@/assets/posters/all-of-us-are-dead.jpg";
import posterKingdom from "@/assets/posters/kingdom.jpg";
import posterAttorneyWoo from "@/assets/posters/extraordinary-attorney-woo.jpg";

// Backdrop imports
import backdropCLOY from "@/assets/backdrops/crash-landing-on-you.jpg";
import backdropGoblin from "@/assets/backdrops/goblin.jpg";
import backdropDOTS from "@/assets/backdrops/descendants-of-the-sun.jpg";
import backdropMLFTS from "@/assets/backdrops/my-love-from-the-star.jpg";
import backdropItaewon from "@/assets/backdrops/itaewon-class.jpg";
import backdropVincenzo from "@/assets/backdrops/vincenzo.jpg";
import backdropStartUp from "@/assets/backdrops/start-up.jpg";
import backdropReply from "@/assets/backdrops/reply-1988.jpg";
import backdropSquidGame from "@/assets/backdrops/squid-game.jpg";
import backdropAOUAD from "@/assets/backdrops/all-of-us-are-dead.jpg";
import backdropKingdom from "@/assets/backdrops/kingdom.jpg";
import backdropAttorneyWoo from "@/assets/backdrops/extraordinary-attorney-woo.jpg";

export interface Drama {
  id: string;
  title: string;
  titleKorean: string;
  poster: string;
  backdrop: string;
  synopsis: string;
  genres: string[];
  tags: string[];
  cast: { name: string; role: string; image: string }[];
  episodes: number;
  airingStatus: "ongoing" | "completed";
  rating: number;
  year: number;
  network: string;
  similarIds: string[];
}

export const dramas: Drama[] = [
  {
    id: "crash-landing-on-you",
    title: "Crash Landing on You",
    titleKorean: "사랑의 불시착",
    poster: posterCLOY,
    backdrop: backdropCLOY,
    synopsis: "A South Korean heiress crash-lands in North Korea after a paragliding accident and falls in love with a North Korean army officer who helps hide her.",
    genres: ["Romance", "Comedy", "Drama"],
    tags: ["enemies-to-lovers", "forbidden-love", "military", "cross-border", "slow-burn"],
    cast: [
      { name: "Hyun Bin", role: "Ri Jeong-hyeok", image: "" },
      { name: "Son Ye-jin", role: "Yoon Se-ri", image: "" },
      { name: "Seo Ji-hye", role: "Seo Dan", image: "" },
      { name: "Kim Jung-hyun", role: "Gu Seung-jun", image: "" },
    ],
    episodes: 16,
    airingStatus: "completed",
    rating: 9.2,
    year: 2019,
    network: "tvN",
    similarIds: ["descendants-of-the-sun", "goblin"],
  },
  {
    id: "goblin",
    title: "Goblin: The Lonely and Great God",
    titleKorean: "쓸쓸하고 찬란하神 – 도깨비",
    poster: posterGoblin,
    backdrop: backdropGoblin,
    synopsis: "A goblin who needs a human bride to end his immortal life meets a grim reaper and a bubbly high school student who claims to be the goblin's bride.",
    genres: ["Fantasy", "Romance", "Drama"],
    tags: ["supernatural", "immortality", "reincarnation", "fate", "slow-burn", "tearjerker"],
    cast: [
      { name: "Gong Yoo", role: "Kim Shin", image: "" },
      { name: "Kim Go-eun", role: "Ji Eun-tak", image: "" },
      { name: "Lee Dong-wook", role: "Grim Reaper", image: "" },
      { name: "Yoo In-na", role: "Sunny", image: "" },
    ],
    episodes: 16,
    airingStatus: "completed",
    rating: 9.1,
    year: 2016,
    network: "tvN",
    similarIds: ["crash-landing-on-you", "my-love-from-the-star"],
  },
  {
    id: "descendants-of-the-sun",
    title: "Descendants of the Sun",
    titleKorean: "태양의 후예",
    poster: posterDOTS,
    backdrop: backdropDOTS,
    synopsis: "A special forces captain and a doctor navigate their complicated relationship while stationed in a war-torn country.",
    genres: ["Romance", "Action", "Drama"],
    tags: ["military", "doctor", "long-distance", "action-romance", "strong-leads"],
    cast: [
      { name: "Song Joong-ki", role: "Yoo Si-jin", image: "" },
      { name: "Song Hye-kyo", role: "Kang Mo-yeon", image: "" },
    ],
    episodes: 16,
    airingStatus: "completed",
    rating: 8.8,
    year: 2016,
    network: "KBS2",
    similarIds: ["crash-landing-on-you"],
  },
  {
    id: "my-love-from-the-star",
    title: "My Love from the Star",
    titleKorean: "별에서 온 그대",
    poster: posterMLFTS,
    backdrop: backdropMLFTS,
    synopsis: "An alien who landed on Earth 400 years ago falls in love with a top actress in modern-day Seoul, just as he's about to return home.",
    genres: ["Romance", "Comedy", "Sci-Fi"],
    tags: ["alien", "celebrity", "supernatural", "comedy", "fate"],
    cast: [
      { name: "Jun Ji-hyun", role: "Cheon Song-yi", image: "" },
      { name: "Kim Soo-hyun", role: "Do Min-joon", image: "" },
    ],
    episodes: 21,
    airingStatus: "completed",
    rating: 8.9,
    year: 2013,
    network: "SBS",
    similarIds: ["goblin"],
  },
  {
    id: "itaewon-class",
    title: "Itaewon Class",
    titleKorean: "이태원 클라쓰",
    poster: posterItaewon,
    backdrop: backdropItaewon,
    synopsis: "An ex-con opens a bar in Itaewon and fights to take down the food conglomerate that destroyed his family.",
    genres: ["Drama", "Romance", "Business"],
    tags: ["revenge", "underdog", "found-family", "strong-female-lead", "food"],
    cast: [
      { name: "Park Seo-joon", role: "Park Saeroyi", image: "" },
      { name: "Kim Da-mi", role: "Jo Yi-seo", image: "" },
    ],
    episodes: 16,
    airingStatus: "completed",
    rating: 8.5,
    year: 2020,
    network: "JTBC",
    similarIds: ["start-up", "vincenzo"],
  },
  {
    id: "vincenzo",
    title: "Vincenzo",
    titleKorean: "빈센조",
    poster: posterVincenzo,
    backdrop: backdropVincenzo,
    synopsis: "A Korean-Italian mafia consigliere returns to Seoul to recover gold hidden in a building, teaming up with a feisty lawyer.",
    genres: ["Action", "Comedy", "Crime"],
    tags: ["mafia", "dark-comedy", "revenge", "anti-hero", "ensemble-cast"],
    cast: [
      { name: "Song Joong-ki", role: "Vincenzo Cassano", image: "" },
      { name: "Jeon Yeo-been", role: "Hong Cha-young", image: "" },
    ],
    episodes: 20,
    airingStatus: "completed",
    rating: 9.0,
    year: 2021,
    network: "tvN",
    similarIds: ["itaewon-class"],
  },
  {
    id: "start-up",
    title: "Start-Up",
    titleKorean: "스타트업",
    poster: posterStartUp,
    backdrop: backdropStartUp,
    synopsis: "Young entrepreneurs compete in Korea's Silicon Valley, navigating love, ambition, and the harsh realities of the startup world.",
    genres: ["Romance", "Drama", "Business"],
    tags: ["love-triangle", "tech", "underdog", "family", "coming-of-age"],
    cast: [
      { name: "Bae Suzy", role: "Seo Dal-mi", image: "" },
      { name: "Nam Joo-hyuk", role: "Nam Do-san", image: "" },
    ],
    episodes: 16,
    airingStatus: "completed",
    rating: 8.2,
    year: 2020,
    network: "tvN",
    similarIds: ["itaewon-class"],
  },
  {
    id: "reply-1988",
    title: "Reply 1988",
    titleKorean: "응답하라 1988",
    poster: posterReply,
    backdrop: backdropReply,
    synopsis: "Five families living in the same neighborhood in Seoul in 1988 share their joys and sorrows while their children navigate youth and love.",
    genres: ["Drama", "Comedy", "Romance"],
    tags: ["nostalgia", "slice-of-life", "friendship", "family", "coming-of-age", "tearjerker"],
    cast: [
      { name: "Lee Hye-ri", role: "Sung Deok-sun", image: "" },
      { name: "Park Bo-gum", role: "Choi Taek", image: "" },
      { name: "Ryu Jun-yeol", role: "Kim Jung-hwan", image: "" },
    ],
    episodes: 20,
    airingStatus: "completed",
    rating: 9.4,
    year: 2015,
    network: "tvN",
    similarIds: ["crash-landing-on-you", "goblin"],
  },
  {
    id: "squid-game",
    title: "Squid Game",
    titleKorean: "오징어 게임",
    poster: posterSquidGame,
    backdrop: backdropSquidGame,
    synopsis: "Hundreds of cash-strapped contestants accept an invitation to compete in children's games for a tempting prize, but the stakes are deadly.",
    genres: ["Thriller", "Drama", "Action"],
    tags: ["survival", "dark", "social-commentary", "ensemble-cast", "suspense", "dystopia"],
    cast: [
      { name: "Lee Jung-jae", role: "Seong Gi-hun", image: "" },
      { name: "Park Hae-soo", role: "Cho Sang-woo", image: "" },
      { name: "Wi Ha-joon", role: "Hwang Jun-ho", image: "" },
      { name: "Jung Ho-yeon", role: "Kang Sae-byeok", image: "" },
    ],
    episodes: 9,
    airingStatus: "completed",
    rating: 8.9,
    year: 2021,
    network: "Netflix",
    similarIds: ["all-of-us-are-dead", "kingdom"],
  },
  {
    id: "all-of-us-are-dead",
    title: "All of Us Are Dead",
    titleKorean: "지금 우리 학교는",
    poster: posterAOUAD,
    backdrop: backdropAOUAD,
    synopsis: "A high school becomes ground zero for a zombie virus outbreak, trapping students inside as they fight to survive and escape.",
    genres: ["Horror", "Thriller", "Action"],
    tags: ["zombie", "survival", "high-school", "coming-of-age", "ensemble-cast"],
    cast: [
      { name: "Yoon Chan-young", role: "Lee Cheong-san", image: "" },
      { name: "Park Ji-hu", role: "Nam On-jo", image: "" },
      { name: "Cho Yi-hyun", role: "Choi Nam-ra", image: "" },
    ],
    episodes: 12,
    airingStatus: "completed",
    rating: 7.8,
    year: 2022,
    network: "Netflix",
    similarIds: ["squid-game", "kingdom"],
  },
  {
    id: "kingdom",
    title: "Kingdom",
    titleKorean: "킹덤",
    poster: posterKingdom,
    backdrop: backdropKingdom,
    synopsis: "A Joseon-era crown prince is thrust into a political power struggle and a mysterious plague that resurrects the dead, threatening the kingdom.",
    genres: ["Historical", "Horror", "Thriller"],
    tags: ["zombie", "political-intrigue", "period-drama", "survival", "dark", "royalty"],
    cast: [
      { name: "Ju Ji-hoon", role: "Crown Prince Lee Chang", image: "" },
      { name: "Bae Doona", role: "Seo-bi", image: "" },
      { name: "Ryu Seung-ryong", role: "Cho Hak-ju", image: "" },
    ],
    episodes: 12,
    airingStatus: "completed",
    rating: 8.7,
    year: 2019,
    network: "Netflix",
    similarIds: ["all-of-us-are-dead", "squid-game"],
  },
  {
    id: "extraordinary-attorney-woo",
    title: "Extraordinary Attorney Woo",
    titleKorean: "이상한 변호사 우영우",
    poster: posterAttorneyWoo,
    backdrop: backdropAttorneyWoo,
    synopsis: "Woo Young-woo, a brilliant attorney with autism spectrum disorder, navigates the challenges of a top law firm while solving cases with her unique perspective.",
    genres: ["Drama", "Comedy", "Romance"],
    tags: ["legal", "heartwarming", "neurodiversity", "slice-of-life", "strong-female-lead", "wholesome"],
    cast: [
      { name: "Park Eun-bin", role: "Woo Young-woo", image: "" },
      { name: "Kang Tae-oh", role: "Lee Jun-ho", image: "" },
      { name: "Kang Ki-young", role: "Jung Myung-seok", image: "" },
    ],
    episodes: 16,
    airingStatus: "completed",
    rating: 8.9,
    year: 2022,
    network: "ENA",
    similarIds: ["reply-1988", "start-up"],
  },
];

export const genres = ["Romance", "Comedy", "Drama", "Action", "Fantasy", "Sci-Fi", "Crime", "Thriller", "Business", "Historical", "Horror"];

export const allTags = [...new Set(dramas.flatMap(d => d.tags))];

export function getDramaById(id: string): Drama | undefined {
  return dramas.find(d => d.id === id);
}

export function getDramasByGenre(genre: string): Drama[] {
  return dramas.filter(d => d.genres.includes(genre));
}

export function searchDramas(query: string): Drama[] {
  const q = query.toLowerCase();
  return dramas.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.titleKorean.includes(q) ||
    d.cast.some(c => c.name.toLowerCase().includes(q)) ||
    d.genres.some(g => g.toLowerCase().includes(q)) ||
    d.tags.some(t => t.toLowerCase().includes(q))
  );
}
