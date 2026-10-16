// ==========================================================================
// TMDB (The Movie Database) API client για το CineSuggest
// Docs: https://developer.themoviedb.org/reference/intro/getting-started
//
// ΣΗΜΕΙΩΣΗ ΑΣΦΑΛΕΙΑΣ: Το API key είναι ενσωματωμένο εδώ όπως ζητήθηκε.
// Για δημόσια δημοσίευση στο Play Store καλό είναι το key να περνάει μέσα
// από δικό σου backend/proxy ώστε να μην είναι ορατό σε reverse engineering
// του APK. Για προσωπική/δοκιμαστική χρήση αυτό δεν αποτελεί πρόβλημα.
// ==========================================================================

export const TMDB_API_KEY = '754658376b25f2fa54ab50c100070351';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Χώρα για streaming availability (JustWatch μέσω TMDB watch/providers) —
// χρησιμοποιείται μόνο στο Detail screen για να δείξουμε τα badges "Available on".
export const WATCH_REGION = 'GR';

function buildUrl(path, params = {}) {
  const url = new URL(TMDB_BASE_URL + path);
  url.searchParams.set('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  return url.toString();
}

async function request(path, params = {}) {
  const url = buildUrl(path, params);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TMDB request failed (${res.status}): ${body}`);
  }
  return res.json();
}

export function posterUrl(path, size = 'w500') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path, size = 'w780') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export const tmdb = {
  // --- Discovery / Λίστες ---
  trending: (mediaType = 'all', timeWindow = 'week') =>
    request(`/trending/${mediaType}/${timeWindow}`),

  discoverMovies: ({ genres, year, page = 1, sortBy = 'popularity.desc', maxRuntime } = {}) =>
    request('/discover/movie', {
      with_genres: genres,
      primary_release_year: year,
      page,
      sort_by: sortBy,
      'with_runtime.lte': maxRuntime,
    }),

  discoverTV: ({ genres, year, page = 1, sortBy = 'popularity.desc' } = {}) =>
    request('/discover/tv', {
      with_genres: genres,
      first_air_date_year: year,
      page,
      sort_by: sortBy,
    }),

  // --- Αναζήτηση ---
  searchMulti: (query, page = 1) => request('/search/multi', { query, page, include_adult: false }),
  searchMovie: (query, page = 1, year) => request('/search/movie', { query, page, year }),
  searchTV: (query, page = 1) => request('/search/tv', { query, page }),
  searchPerson: (query, page = 1) => request('/search/person', { query, page }),

  // --- Λεπτομέρειες ---
  movieDetails: (id) =>
    request(`/movie/${id}`, { append_to_response: 'credits,videos,watch/providers' }),
  tvDetails: (id) =>
    request(`/tv/${id}`, { append_to_response: 'credits,videos,watch/providers,external_ids' }),

  personCredits: (id) => request(`/person/${id}/combined_credits`),

  // --- Genres ---
  movieGenres: (language) => request('/genre/movie/list', { language }),
  tvGenres: (language) => request('/genre/tv/list', { language }),

  // --- Κινηματογράφος (Ελλάδα) ---
  nowPlaying: (page = 1) => request('/movie/now_playing', { region: WATCH_REGION, page }),
  upcoming: (page = 1) => request('/movie/upcoming', { region: WATCH_REGION, page }),

  // --- Random / Mood matcher helpers ---
  discoverByRuntime: (maxRuntime, genres, page = 1) =>
    request('/discover/movie', {
      'with_runtime.lte': maxRuntime,
      with_genres: genres,
      sort_by: 'popularity.desc',
      page,
    }),
};

// Trailer YouTube key finder
export function findTrailerKey(videos) {
  if (!videos?.results?.length) return null;
  const trailer =
    videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    videos.results.find((v) => v.site === 'YouTube');
  return trailer?.key || null;
}

// Watch providers helper (flatrate/subscription providers for GR region)
export function getWatchProviders(watchProvidersResponse) {
  const regionData = watchProvidersResponse?.results?.[WATCH_REGION];
  if (!regionData) return [];
  return regionData.flatrate || regionData.ads || regionData.free || [];
}
