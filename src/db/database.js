import * as SQLite from 'expo-sqlite';

let dbPromise = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('cinesuggest.db');
  }
  return dbPromise;
}

export async function initDatabase() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      favorite_genres TEXT,
      providers TEXT
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      media_id INTEGER NOT NULL,
      media_type TEXT NOT NULL,
      title TEXT,
      poster_path TEXT,
      vote_average REAL,
      status TEXT,
      user_rating REAL,
      added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (media_id, media_type)
    );
  `);
  return db;
}

// ---------- Preferences ----------
export async function savePreferences(genresCsv, providersCsv) {
  const db = await getDb();
  const existing = await db.getFirstAsync('SELECT id FROM user_preferences LIMIT 1');
  if (existing) {
    await db.runAsync(
      'UPDATE user_preferences SET favorite_genres = ?, providers = ? WHERE id = ?',
      [genresCsv, providersCsv, existing.id]
    );
  } else {
    await db.runAsync(
      'INSERT INTO user_preferences (favorite_genres, providers) VALUES (?, ?)',
      [genresCsv, providersCsv]
    );
  }
}

export async function getPreferences() {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM user_preferences LIMIT 1');
  return row || null;
}

// ---------- Watchlist ----------
export async function upsertWatchlistItem(item) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO watchlist (media_id, media_type, title, poster_path, vote_average, status, user_rating)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(media_id, media_type) DO UPDATE SET
       status = excluded.status,
       user_rating = excluded.user_rating,
       title = excluded.title,
       poster_path = excluded.poster_path,
       vote_average = excluded.vote_average`,
    [
      item.media_id,
      item.media_type,
      item.title,
      item.poster_path,
      item.vote_average ?? 0,
      item.status || 'PLAN_TO_WATCH',
      item.user_rating ?? null,
    ]
  );
}

export async function removeWatchlistItem(mediaId, mediaType) {
  const db = await getDb();
  await db.runAsync('DELETE FROM watchlist WHERE media_id = ? AND media_type = ?', [
    mediaId,
    mediaType,
  ]);
}

export async function getWatchlist(status, orderBy = 'added_date') {
  const db = await getDb();
  const orderCol =
    { rating: 'vote_average', recent: 'added_date' }[orderBy] || 'added_date';
  return db.getAllAsync(
    `SELECT * FROM watchlist WHERE status = ? ORDER BY ${orderCol} DESC`,
    [status]
  );
}

export async function getWatchlistEntry(mediaId, mediaType) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM watchlist WHERE media_id = ? AND media_type = ?', [
    mediaId,
    mediaType,
  ]);
}

export async function setUserRating(mediaId, mediaType, rating) {
  const db = await getDb();
  await db.runAsync('UPDATE watchlist SET user_rating = ? WHERE media_id = ? AND media_type = ?', [
    rating,
    mediaId,
    mediaType,
  ]);
}
