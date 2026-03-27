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
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=1200&h=600&fit=crop",
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
    poster: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop",
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
    poster: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&h=600&fit=crop",
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
    poster: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=1200&h=600&fit=crop",
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
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop",
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
    poster: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=1200&h=600&fit=crop",
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
    poster: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&h=600&fit=crop",
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
    poster: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1200&h=600&fit=crop",
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
];

export const genres = ["Romance", "Comedy", "Drama", "Action", "Fantasy", "Sci-Fi", "Crime", "Thriller", "Business", "Historical"];

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
