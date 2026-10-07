// Instagramの最新投稿を取得して data/instagram.json に保存する
// 必要な環境変数: IG_USER_ID（InstagramビジネスアカウントID）, IG_TOKEN（ページアクセストークン）
import { writeFile } from 'node:fs/promises';

const { IG_USER_ID, IG_TOKEN } = process.env;
if (!IG_USER_ID || !IG_TOKEN) {
  console.log('IG_USER_ID / IG_TOKEN が未設定のためスキップします');
  process.exit(0);
}

const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
const url = `https://graph.facebook.com/v21.0/${IG_USER_ID}/media?fields=${fields}&limit=12&access_token=${IG_TOKEN}`;

const res = await fetch(url);
const json = await res.json();
if (!res.ok || json.error) {
  console.error('Instagram API エラー:', json.error?.message || res.status);
  process.exit(1);
}

const items = (json.data || [])
  .map((m) => ({
    id: m.id,
    type: m.media_type,
    image: m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url,
    link: m.permalink,
    caption: (m.caption || '').slice(0, 140),
    date: m.timestamp,
  }))
  .filter((m) => m.image)
  .slice(0, 9);

await writeFile(
  new URL('../data/instagram.json', import.meta.url),
  JSON.stringify({ updated: new Date().toISOString(), items }, null, 2) + '\n'
);
console.log(`${items.length} 件の投稿を保存しました`);
