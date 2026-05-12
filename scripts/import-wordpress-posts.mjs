import fs from 'node:fs/promises';
import path from 'node:path';
import TurndownService from 'turndown';

const API_URL = 'https://incentric.co.id/wp-json/wp/v2/posts';
const BLOG_DIR = path.resolve('src/content/blog');

const turndown = new TurndownService({
  codeBlockStyle: 'fenced',
  headingStyle: 'atx',
});

turndown.addRule('removeEmptyParagraphs', {
  filter: (node) => node.nodeName === 'P' && node.textContent.trim() === '',
  replacement: () => '',
});

function decodeHtml(value = '') {
  return value
    .replace(/â€”/g, '-')
    .replace(/â€“/g, '-')
    .replace(/â€˜/g, "'")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(value = '') {
  return decodeHtml(value.replace(/<[^>]+>/g, ''))
    .replace(/\s*(\[…\]|\[\.\.\.\])\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeYaml(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function yamlList(values = []) {
  if (!values.length) return '[]';
  return `[${values.map((value) => `"${escapeYaml(value)}"`).join(', ')}]`;
}

function getTerms(post, taxonomy) {
  const termGroups = post._embedded?.['wp:term'] ?? [];
  return termGroups
    .flat()
    .filter((term) => term.taxonomy === taxonomy)
    .map((term) => decodeHtml(term.name));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return {
    data: await response.json(),
    totalPages: Number(response.headers.get('x-wp-totalpages') ?? 1),
  };
}

async function fetchAllPosts() {
  const firstUrl = `${API_URL}?per_page=100&_embed=1`;
  const first = await fetchJson(firstUrl);
  const posts = [...first.data];

  for (let page = 2; page <= first.totalPages; page += 1) {
    const { data } = await fetchJson(`${API_URL}?per_page=100&_embed=1&page=${page}`);
    posts.push(...data);
  }

  return posts;
}

function postToMarkdown(post) {
  const title = decodeHtml(post.title?.rendered ?? post.slug);
  const description = stripHtml(post.excerpt?.rendered ?? '');
  const author = post._embedded?.author?.[0]?.name ?? 'Incentric';
  const categories = getTerms(post, 'category');
  const tags = getTerms(post, 'post_tag');
  const body = turndown
    .turndown(post.content?.rendered ?? '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `---\ntitle: "${escapeYaml(title)}"\ndescription: "${escapeYaml(description)}"\npubDate: ${post.date_gmt ?? post.date}\nauthor: "${escapeYaml(author)}"\nsourceUrl: "${escapeYaml(post.link)}"\ncategories: ${yamlList(categories)}\ntags: ${yamlList(tags)}\ndraft: false\n---\n\n${body}\n`;
}

async function main() {
  await fs.mkdir(BLOG_DIR, { recursive: true });
  const posts = await fetchAllPosts();

  for (const post of posts) {
    await fs.writeFile(path.join(BLOG_DIR, `${post.slug}.md`), postToMarkdown(post));
  }

  console.log(`Imported ${posts.length} WordPress posts into ${BLOG_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
