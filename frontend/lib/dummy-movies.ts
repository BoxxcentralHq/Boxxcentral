import type { Movie } from "./api/types";

/**
 * Placeholder catalog for building the FilmBoxx UI without the backend.
 * Used by app/filmboxx/page.tsx whenever GET /cinema/movies returns nothing.
 */
export const dummyMovies: Movie[] = [
  {
    _id: "dummy-1",
    title: "Midnight in Lagos",
    synopsis:
      "A jazz pianist with one night left in the city chases a stolen song across Lagos Island — from rooftop bars to the last ferry out.",
    genre: "Drama",
    durationMins: 118,
    posterUrl: "/assets/DSC00412-2.jpg",
    trailerUrl: "/videos/filmboxx.mp4",
    rating: "15",
    showtimes: [
      { time: "13:30", screen: "Hall 1" },
      { time: "16:15", screen: "Hall 1" },
      { time: "19:00", screen: "Hall 2" },
      { time: "21:45", screen: "Hall 1" },
    ],
    visible: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    _id: "dummy-2",
    title: "The Last Frame",
    synopsis:
      "An old projectionist discovers a reel that shows events before they happen. Every screening brings the ending closer.",
    genre: "Thriller",
    durationMins: 104,
    posterUrl: "/images/filmboxx-detail-1.jpg",
    trailerUrl: "/videos/hero.mp4",
    rating: "15",
    showtimes: [
      { time: "14:00", screen: "Hall 2" },
      { time: "18:30", screen: "Hall 2" },
      { time: "22:00", screen: "Hall 2" },
    ],
    visible: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    _id: "dummy-3",
    title: "Strike Zone",
    synopsis:
      "Four friends, one bowling league, and a bet none of them can afford to lose. A loud, warm comedy about second chances.",
    genre: "Comedy",
    durationMins: 96,
    posterUrl: "/images/bowlboxx-wide.jpg",
    trailerUrl: "/videos/bowlboxx.mp4",
    rating: "PG",
    showtimes: [
      { time: "11:00", screen: "Hall 1" },
      { time: "13:45", screen: "Hall 2" },
      { time: "16:30", screen: "Hall 2" },
      { time: "19:30", screen: "Hall 1" },
    ],
    visible: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    _id: "dummy-4",
    title: "Red Signal",
    synopsis:
      "When the city's grid goes dark, a radio engineer becomes the only voice connecting millions — and the target of whoever cut the power.",
    genre: "Action",
    durationMins: 127,
    posterUrl: "/assets/DSC00700.jpg",
    trailerUrl: "/videos/lounge.mp4",
    rating: "12A",
    showtimes: [
      { time: "15:00", screen: "Hall 1" },
      { time: "18:00", screen: "Hall 1" },
      { time: "21:00", screen: "Hall 2" },
    ],
    visible: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    _id: "dummy-5",
    title: "Velvet Hour",
    synopsis:
      "Two strangers keep meeting at the same lounge at the same hour. Neither remembers the night before.",
    genre: "Romance",
    durationMins: 109,
    posterUrl: "/images/lounge-wide.jpg",
    trailerUrl: "/videos/lounge.mp4",
    rating: "12A",
    showtimes: [
      { time: "17:00", screen: "Hall 2" },
      { time: "20:15", screen: "Hall 1" },
    ],
    visible: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    _id: "dummy-6",
    title: "Below the Static",
    synopsis:
      "A late-night TV host starts receiving calls from viewers who shouldn't exist.",
    genre: "Thriller",
    durationMins: 99,
    posterUrl: "/images/filmboxx-detail-2.jpg",
    trailerUrl: "/videos/filmboxx.mp4",
    rating: "18",
    showtimes: [
      { time: "20:30", screen: "Hall 2" },
      { time: "23:00", screen: "Hall 1" },
    ],
    visible: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    _id: "dummy-7",
    title: "Heavy Bag",
    synopsis:
      "A retired boxer opens a gym in his old neighbourhood and finds a fighter worth coming back for.",
    genre: "Drama",
    durationMins: 121,
    posterUrl: "/images/gymboxx-wide.jpg",
    trailerUrl: "/videos/gymboxx.mp4",
    rating: "15",
    showtimes: [
      { time: "12:30", screen: "Hall 1" },
      { time: "15:45", screen: "Hall 2" },
      { time: "19:15", screen: "Hall 1" },
    ],
    visible: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    _id: "dummy-8",
    title: "Afterparty",
    synopsis:
      "The party's over, the guests are gone, and someone has locked every door from the outside.",
    genre: "Comedy",
    durationMins: 92,
    posterUrl: "/images/gallery-3.jpg",
    trailerUrl: "/videos/hero.mp4",
    rating: "PG",
    showtimes: [
      { time: "14:30", screen: "Hall 2" },
      { time: "17:30", screen: "Hall 1" },
      { time: "22:30", screen: "Hall 2" },
    ],
    visible: true,
    createdAt: "2026-10-01T00:00:00.000Z",
  },
];
