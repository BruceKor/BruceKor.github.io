import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { renderMarkdown } from './render.mjs';
const site = JSON.parse(await readFile('site.json', 'utf8'));
const posts = JSON.parse(await readFile('content/posts.json', 'utf8'));
if (posts.some(p => p.visibility === 'private' || p.draft === true)) {
  throw Error('这个公开仓库不能包含私密文章或草稿；请先从仓库中移除相关内容。');
}
posts.sort((a,b) => b.date.localeCompare(a.date));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base = new URL(site.url);
if (!['https:','http:'].includes(base.protocol)) throw Error('Invalid site URL');
const basePath = base.pathname.replace(/\/$/, '');
const url = path => basePath + path;
const absolute = path => new URL(url(path), base.origin).href;
const topics = [
  {id:'ai', name:'技术洞见', description:'前沿 AI / LLM 技术、模型与方法。'},
  {id:'learning', name:'随想记录', description:'学习笔记，以及理解中的疑问与变化。'},
  {id:'research', name:'研究手记', description:'研究综述、论文阅读、教程与实践。'}
];
const seen = new Set();
for (const p of posts) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || seen.has(p.slug)) throw Error('Invalid or duplicate slug');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || Number.isNaN(Date.parse(p.date))) throw Error('Invalid date');
  if (!/^[a-z0-9-]+\.md$/.test(p.file)) throw Error('Invalid Markdown path');
  const topic = topics.find(t=>t.id===p.categoryId);
  if (!topic) throw Error('Unknown topic');
  p.category = topic.name;
  seen.add(p.slug);
  p.markdown = await readFile('content/' + p.file, 'utf8');
}
await rm('dist', {recursive:true,force:true}); await mkdir('dist', {recursive:true}); await cp('assets','dist/assets',{recursive:true});
const nav = (path,label,current) => `<a href="${url(path)}"${current===path?' aria-current="page"':''}>${label}</a>`;
const postHref = p => url('/posts/'+p.slug+'/');
function shell(title, description, path, body) { const home=path==='/'; return `<!doctype html>
<html lang="zh-CN" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fbfaf8"><title>${esc(title===site.title?title:title+' — '+site.title)}</title><meta name="description" content="${esc(description)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${path.startsWith('/posts/')?'article':'website'}"><meta property="og:url" content="${esc(absolute(path))}"><link rel="canonical" href="${esc(absolute(path))}"><link rel="icon" href="${url('/assets/favicon.svg')}" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="${esc(site.title)}" href="${url('/feed.xml')}"><script>try{document.documentElement.dataset.theme=localStorage.getItem('bruces-blog-theme')||localStorage.getItem('rolling-stone-theme')||'light'}catch{}</script><link rel="stylesheet" href="${url('/assets/style.css')}"><link rel="stylesheet" href="${url('/assets/academic.css')}"><script src="${url('/assets/app.js')}" defer></script></head><body><a class="skip" href="#main">跳到正文</a><div class="site"><header class="site-header"><${home?'h1':'div'} class="site-title"><a href="${url('/')}">${esc(site.title)}</a></${home?'h1':'div'}><p class="site-description">关于 AI / LLM 的观察、学习笔记与研究实践。</p><nav class="nav" aria-label="主导航">${nav('/','Posts',path)}${nav('/archive/','Archive',path)}${nav('/about/','About',path)}</nav></header><main id="main">${body}</main><footer class="site-footer"><span>© ${new Date().getFullYear()} ${esc(site.title)}</span><div><a href="${esc(site.github)}">GitHub</a><button class="theme" data-theme-toggle aria-label="切换到深色模式"><span data-theme-label>深色</span></button></div></footer></div></body></html>`; }
const meta = p => `<div class="post-meta"><time datetime="${p.date}">${p.date}</time><span aria-hidden="true">·</span><a href="${url('/archive/?topic='+p.categoryId)}">${esc(p.category)}</a>${p.sample?'<span aria-hidden="true">·</span><span>示例</span>':''}</div>`;
const attrs = p => `data-post data-category="${esc(p.categoryId)}" data-search-text="${esc([p.title,p.description,p.category,...(p.tags||[]),p.markdown].join(' '))}"`;
const summary = p => `<article class="post-summary"><h2><a href="${postHref(p)}">${esc(p.title)}</a></h2>${meta(p)}<p>${esc(p.description)}</p><a class="read-more" href="${postHref(p)}" aria-label="阅读全文：${esc(p.title)}">阅读全文 →</a></article>`;
const archiveRow = p => `<li class="archive-row" ${attrs(p)}><time datetime="${p.date}">${p.date}</time><div><a class="archive-title" href="${postHref(p)}">${esc(p.title)}</a><span class="archive-category">${esc(p.category)}${p.sample?' · 示例':''}</span></div></li>`;
const filters = `<div class="filters" aria-label="按栏目筛选"><button data-filter="all" aria-pressed="true">全部</button>${topics.map(t=>`<button data-filter="${t.id}" aria-pressed="false">${esc(t.name)}</button>`).join('')}</div>`;
const empty = '<div class="empty" data-empty hidden><p>没有找到相关文章。</p><button class="text-button" data-reset>清除筛选</button></div>';
const sampleNote = posts.some(p=>p.sample)?'<p class="sample-note">带「示例」标记的文章仅用于预览排版。</p>':'';
async function page(path,content) { const file='dist'+(path.endsWith('/')?path+'index.html':path);await mkdir(file.slice(0,file.lastIndexOf('/')),{recursive:true});await writeFile(file,content); }
await page('/',shell(site.title,site.description,'/',`${posts.length?posts.slice(0,10).map(summary).join(''):'<p class="empty-home">第一篇文章，未完待续。</p>'}<div class="home-end"><a href="${url('/archive/')}">全部文章 →</a>${sampleNote}</div>`));
await page('/archive/',shell('文章归档','按时间、栏目或关键词查找文章。','/archive/',`<h1 class="page-title">文章归档</h1><section data-explorer><label class="sr-only" for="search">搜索文章</label><input class="search" id="search" data-search type="search" placeholder="搜索文章…" autocomplete="off">${filters}<p class="result" data-result aria-live="polite"></p><ul class="archive-list">${posts.map(archiveRow).join('')}</ul>${empty}${sampleNote}</section>`));
await page('/topics/',shell('分类',`${site.title} 的写作方向。`,'/topics/',`<h1 class="page-title">分类</h1><ul class="topic-list">${topics.map(t=>`<li><a href="${url('/archive/?topic='+t.id)}">${esc(t.name)}</a><p>${esc(t.description)}</p></li>`).join('')}</ul><p class="muted">其他方向，未完待续。</p>`));
const about=renderMarkdown(await readFile('content/about.md','utf8'));
await page('/about/',shell('关于',site.description,'/about/',`<h1 class="page-title">关于 ${esc(site.title)}</h1><article class="prose about">${about}</article>`));
for (const [index,p] of posts.entries()) {
  const toc=[];
  const html=renderMarkdown(p.markdown).replace(/<h2>(.*?)<\/h2>/g,(_,content)=>{const id='section-'+(toc.length+1);toc.push({id,label:content.replace(/<[^>]+>/g,'')});return `<h2 id="${id}">${content}</h2>`;});
  const next=posts[index+1] || posts[index-1];
  await page('/posts/'+p.slug+'/',shell(p.title,p.description,'/posts/'+p.slug+'/',`<article class="article"><header class="article-header"><h1>${esc(p.title)}</h1>${meta(p)}</header>${toc.length?`<details class="toc"><summary>目录</summary><nav aria-label="文章目录">${toc.map(t=>`<a href="#${t.id}">${t.label}</a>`).join('')}</nav></details>`:''}<div class="prose">${html}</div><div class="article-end"><a href="${url('/')}">← 返回文章列表</a>${next?`<a href="${postHref(next)}">继续阅读：${esc(next.title)}</a>`:''}</div></article>`));
}
await page('/404.html',shell('页面未找到','页面未找到','/404.html',`<h1 class="page-title">页面未找到</h1><p>这个页面可能已移动，或链接有误。</p><p><a href="${url('/')}">返回首页 →</a></p>`));
await writeFile('dist/feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.title)}</title><link>${esc(absolute('/'))}</link><description>${esc(site.description)}</description><language>zh-CN</language>${posts.map(p=>`<item><title>${esc(p.title)}</title><link>${esc(absolute('/posts/'+p.slug+'/'))}</link><guid>${esc(absolute('/posts/'+p.slug+'/'))}</guid><pubDate>${new Date(p.date+'T12:00:00+08:00').toUTCString()}</pubDate><description>${esc((p.sample?'[排版示例] ':'')+p.description)}</description></item>`).join('')}</channel></rss>`);
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/archive/','/topics/','/about/',...posts.map(p=>'/posts/'+p.slug+'/')].map(p=>`<url><loc>${esc(absolute(p))}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${absolute('/sitemap.xml')}\n`);await writeFile('dist/.nojekyll','');
console.log(`Built ${site.title}: ${posts.length} posts, 4 main pages, 404, RSS and sitemap.`);
