import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SITE = 'https://kirill12633.github.io/press.metro.new';

if(!SUPABASE_URL || !SUPABASE_ANON_KEY){
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORY_NAMES = {world:'Мир', tech:'Технологии', culture:'Культура', sport:'Спорт', weather:'Погода', other:'Другое'};
const catName = slug => CATEGORY_NAMES[slug] || 'Другое';

function escapeHtml(s){
  return String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function main(){
  const { data: news, error } = await db.from('news')
    .select('*')
    .order('published_at', { ascending: false });

  if(error){
    console.error('Supabase error:', error);
    process.exit(1);
  }

  await fs.mkdir('news', { recursive: true });

  const urls = [];

  for(const n of news || []){
    const slug = slugify(n.title) + '-' + n.id;
    const url = `${SITE}/news/${slug}.html`;
    urls.push({ loc: url, lastmod: n.published_at });

    const cover = n.cover_image
      ? `<img src="${escapeHtml(n.cover_image)}" alt="${escapeHtml(n.title)}" style="width:100%;max-width:800px;border-radius:16px;margin-bottom:24px">`
      : '';

    const author = n.author
      ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">${n.author_avatar?`<img src="${escapeHtml(n.author_avatar)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`:''}<span>${escapeHtml(n.author)}</span></div>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(n.title)} — Метро New International</title>
<meta name="description" content="${escapeHtml(n.excerpt || n.title)}">
<meta property="og:title" content="${escapeHtml(n.title)}">
<meta property="og:description" content="${escapeHtml(n.excerpt || '')}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${escapeHtml(n.cover_image || SITE + '/file/main.png')}">
<link rel="canonical" href="${url}">
<link rel="icon" href="/press.metro.new/file/main.png" type="image/png">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
body{font-family:Inter,sans-serif;background:#f8f9fc;color:#0f172a;line-height:1.6;margin:0}
.container{max-width:760px;margin:0 auto;padding:48px 24px}
h1{font-size:clamp(28px,4vw,42px);font-weight:900;letter-spacing:-.03em;line-height:1.15;margin:0 0 20px}
.meta{color:#64748b;font-size:13px;margin-bottom:24px;display:flex;gap:16px;flex-wrap:wrap}
.body{font-size:17.5px;line-height:1.75;color:#1e293b;white-space:pre-wrap}
.back{display:inline-block;margin-bottom:24px;color:#ef4444;text-decoration:none;font-weight:600}
.category{display:inline-block;background:#fee2e2;color:#ef4444;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;padding:4px 10px;border-radius:999px;margin-bottom:16px}
</style>
</head>
<body>
<div class="container">
<a class="back" href="/press.metro.new/">← Все новости</a>
<span class="category">${escapeHtml(catName(n.category_slug))}</span>
<h1>${escapeHtml(n.title)}</h1>
<div class="meta">
<span>${new Date(n.published_at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</span>
</div>
${author}
${cover}
<div class="body">${escapeHtml(n.body || n.excerpt || '')}</div>
</div>
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"NewsArticle",
  "headline":${JSON.stringify(n.title)},
  "description":${JSON.stringify(n.excerpt || '')},
  "image":${JSON.stringify(n.cover_image || SITE + '/file/main.png')},
  "datePublished":${JSON.stringify(n.published_at)},
  "author":{"@type":"Person","name":${JSON.stringify(n.author || 'Редакция Метро New')}},
  "publisher":{"@type":"Organization","name":"Метро New International","logo":{"@type":"ImageObject","url":SITE + '/file/main.png'}},
  "mainEntityOfPage":{"@type":"WebPage","@id":${JSON.stringify(url)}}
}
</script>
</body>
</html>`;

    await fs.writeFile(path.join('news', `${slug}.html`), html, 'utf8');
  }

  // sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${SITE}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
${urls.map(u => `<url><loc>${u.loc}</loc><lastmod>${new Date(u.lastmod).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>`;
  await fs.writeFile('sitemap.xml', sitemap, 'utf8');

  // robots.txt
  await fs.writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');

  console.log(`✅ Generated ${urls.length} news pages + sitemap.xml + robots.txt`);
}

function slugify(s){
  const map = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
  return String(s || '')
    .toLowerCase()
    .split('')
    .map(ch => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

main().catch(err => { console.error(err); process.exit(1); });
