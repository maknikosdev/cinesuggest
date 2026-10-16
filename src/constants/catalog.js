// Κοινός κατάλογος ειδών/πλατφορμών, ώστε το Onboarding και οι Ρυθμίσεις
// να δείχνουν πάντα τις ίδιες επιλογές.

export const GENRES = [
  { id: 28, icon: '💥' }, { id: 35, icon: '😂' }, { id: 18, icon: '🎭' },
  { id: 27, icon: '👻' }, { id: 10749, icon: '❤️' }, { id: 878, icon: '🚀' },
  { id: 53, icon: '🔪' }, { id: 16, icon: '🎨' }, { id: 9648, icon: '🕵️' },
  { id: 12, icon: '🗺️' }, { id: 14, icon: '🧙' }, { id: 99, icon: '🎥' },
];

// TMDB watch/provider IDs (region GR)
export const PROVIDERS = [
  { id: 8, name: 'Netflix' }, { id: 337, name: 'Disney+' },
  { id: 119, name: 'Prime Video' }, { id: 350, name: 'Apple TV+' },
  { id: 2100, name: 'ERTFLIX' }, { id: 1899, name: 'HBO Max' },
];

// Τα IDs ειδών του TMDB διαφέρουν μεταξύ ταινιών και σειρών.
// Αντιστοίχιση ID ταινίας -> ID(s) σειράς (οι σειρές δεν έχουν Horror/Thriller/Romance).
const MOVIE_TO_TV = {
  28: [10759], 12: [10759], 16: [16], 35: [35], 80: [80], 99: [99], 18: [18],
  10751: [10751], 14: [10765], 878: [10765], 9648: [9648], 10752: [10768],
  37: [37], 36: [], 27: [], 53: [], 10749: [], 10402: [],
};

export function toTvGenreIds(movieIds = []) {
  const out = new Set();
  movieIds.forEach((id) => (MOVIE_TO_TV[Number(id)] || []).forEach((x) => out.add(x)));
  return [...out];
}

// OR ("|") ώστε να ταιριάζει σε οποιοδήποτε από τα αγαπημένα είδη.
export function toTvGenreParam(movieIds = []) {
  const ids = toTvGenreIds(movieIds);
  return ids.length ? ids.join('|') : undefined;
}
