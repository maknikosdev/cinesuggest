// Επιπλέον πηγές που συμπληρώνουν το TMDB στην οθόνη Λεπτομερειών.
// Όλες δουλεύουν με το IMDb ID και αποτυγχάνουν σιωπηλά: αν κάποια δεν
// απαντήσει, η εφαρμογή δείχνει ό,τι έχει από το TMDB.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OMDB_API_KEY, WATCHMODE_API_KEY } from '../config/keys';
import { WATCH_REGION } from './tmdb';

const TTL = 7 * 24 * 60 * 60 * 1000; // 7 ημέρες, για να μην ξοδεύονται αιτήματα

async function cached(key, fetcher) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const { at, value } = JSON.parse(raw);
      if (Date.now() - at < TTL) return value;
    }
  } catch (e) { /* αγνόηση */ }
  const value = await fetcher();
  if (value) {
    try { await AsyncStorage.setItem(key, JSON.stringify({ at: Date.now(), value })); } catch (e) { /* αγνόηση */ }
  }
  return value;
}

// --- OMDb: IMDb, Rotten Tomatoes, Metascore ---
export function getOmdbRatings(imdbId) {
  if (!OMDB_API_KEY || !imdbId) return Promise.resolve(null);
  return cached(`omdb:${imdbId}`, async () => {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    const j = await res.json();
    if (j.Response === 'False') return null;
    const rt = (j.Ratings || []).find((r) => r.Source === 'Rotten Tomatoes')?.Value;
    return {
      imdb: j.imdbRating && j.imdbRating !== 'N/A' ? j.imdbRating : null,
      rotten: rt || null,
      metascore: j.Metascore && j.Metascore !== 'N/A' ? j.Metascore : null,
    };
  }).catch(() => null);
}

// --- Watchmode: απευθείας σύνδεσμοι προς πλατφόρμες ---
export function getWatchmodeSources(imdbId) {
  if (!WATCHMODE_API_KEY || !imdbId) return Promise.resolve([]);
  return cached(`wm:${imdbId}:${WATCH_REGION}`, async () => {
    const res = await fetch(
      `https://api.watchmode.com/v1/title/${imdbId}/sources/?apiKey=${WATCHMODE_API_KEY}&regions=${WATCH_REGION}`
    );
    if (!res.ok) return null;
    const list = await res.json();
    if (!Array.isArray(list)) return null;
    const seen = new Set();
    return list
      .filter((s) => s.web_url && ['sub', 'free'].includes(s.type))
      .filter((s) => (seen.has(s.name) ? false : seen.add(s.name)))
      .map((s) => ({ name: s.name, url: s.web_url, type: s.type }));
  }).then((v) => v || []).catch(() => []);
}

// --- TVmaze: επόμενο επεισόδιο / κατάσταση σειράς (χωρίς κλειδί) ---
export async function getTvmazeInfo(imdbId) {
  if (!imdbId) return null;
  try {
    const res = await fetch(
      `https://api.tvmaze.com/lookup/shows?imdb=${imdbId}`
    );
    if (!res.ok) return null;
    const show = await res.json();
    let next = null;
    const nextHref = show?._links?.nextepisode?.href;
    if (nextHref) {
      const r2 = await fetch(nextHref);
      if (r2.ok) next = await r2.json();
    }
    return {
      status: show.status || null,
      network: show.network?.name || show.webChannel?.name || null,
      next: next
        ? { season: next.season, number: next.number, name: next.name, airdate: next.airdate }
        : null,
    };
  } catch (e) {
    return null;
  }
}
