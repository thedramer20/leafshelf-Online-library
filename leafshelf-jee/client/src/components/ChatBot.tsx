import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavoriteIds, getLocalBorrowed, getLocalReturned, listBooks, readCached } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';

const GROQ_API_KEY = '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';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function callGroq(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  allBooks: Book[],
  userName: string,
): Promise<{ text: string; books?: Book[] }> {
  const catalog = allBooks.slice(0, 60).map(b =>
    `ID:${b.id} | "${b.title}" by ${b.author} | ${b.category ?? 'General'} | ★${b.rating.toFixed(1)} | ${b.available ? 'Available' : 'Checked Out'}`
  ).join('\n');

  const borrowed = getLocalBorrowed();
  const returned = getLocalReturned();
  const historyLine = [
    borrowed.length ? `Borrowing: ${borrowed.map(b => b.title).join(', ')}` : '',
    returned.length ? `Previously read: ${returned.map(b => b.title).join(', ')}` : '',
  ].filter(Boolean).join('. ') || 'No reading history yet.';

  const systemPrompt = `You are LeafShelf Assistant, a warm and knowledgeable library chatbot for ${userName}.
LeafShelf is an online library. Help users find books, get recommendations, and explore the catalog.

User reading history: ${historyLine}

Book catalog:
${catalog}

Reply ONLY with valid JSON in this exact shape:
{"text":"your reply here","bookTitles":["Exact Title 1","Exact Title 2"]}
Rules:
- "text": friendly, concise reply (1-3 sentences, use emojis)
- "bookTitles": EXACT titles from the catalog above when recommending books, empty array otherwise
- Never invent books not in the catalog
- If the user asks about stats, due dates, or general chat, set bookTitles to []`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...history],
      max_tokens: 350,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  const raw = data.choices[0]?.message?.content ?? '';

  let parsed: { text?: string; bookTitles?: string[] } = {};
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]) as typeof parsed;
  } catch { /* use raw text */ }

  const text = parsed.text ?? raw;
  const titles: string[] = parsed.bookTitles ?? [];
  const books = titles
    .map(t => allBooks.find(b => b.title.toLowerCase() === t.toLowerCase() || b.title.toLowerCase().includes(t.toLowerCase())))
    .filter((b): b is Book => b !== undefined)
    .slice(0, 3);

  return { text, books: books.length > 0 ? books : undefined };
}

interface Message {
  id: number;
  from: 'bot' | 'user';
  text: string;
  books?: Book[];
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPersonalizedRec(allBooks: Book[]): Book[] {
  const borrowed = getLocalBorrowed();
  const returned = getLocalReturned();
  const allRead = [...borrowed, ...returned];
  const readIds = new Set(allRead.map(b => b.id));
  const favIds = new Set(getFavoriteIds());

  // Find genres the user likes
  const genreCounts: Record<string, number> = {};
  for (const b of allRead) {
    if (b.category) genreCounts[b.category] = (genreCounts[b.category] ?? 0) + 1;
  }
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  let candidates = allBooks.filter(b => !readIds.has(b.id) && !favIds.has(b.id) && b.available);

  if (topGenre && candidates.some(b => b.category === topGenre)) {
    candidates = candidates.filter(b => b.category === topGenre);
  }

  // Sort by rating desc, take top 3
  return candidates.sort((a, b) => b.rating - a.rating).slice(0, 3);
}

const QUICK_ACTIONS = [
  { label: '📚 Recommend me a book', key: 'recommend' },
  { label: '🔥 What\'s popular?', key: 'popular' },
  { label: '🎯 My reading stats', key: 'stats' },
  { label: '🌍 Multi-language support', key: 'lang' },
];

// ── Intelligence Layer ────────────────────────────────────────────────────────

// Translates foreign-language keywords into English concept tokens
const LANG_PATTERNS: Array<[RegExp, string]> = [
  // Chinese
  [/爱情|浪漫|恋爱|情感|爱情故事|言情|爱书|关于爱/, 'romance'],
  [/恐怖|鬼故事|可怕|惊悚|吓人|鬼/, 'horror'],
  [/科幻|未来|太空|外星人|宇宙/, 'sci-fi'],
  [/奇幻|魔法|龙|巫师|魔幻|神话/, 'fantasy'],
  [/神秘|侦探|悬疑|犯罪|推理/, 'mystery'],
  [/历史|古代|战争|革命|朝代/, 'history'],
  [/经典|古典文学/, 'classic'],
  [/励志|自助|成功|成长|自我提升/, 'self-help'],
  [/冒险|探险/, 'adventure'],
  [/传记|名人传|回忆录/, 'biography'],
  [/哲学|智慧|人生意义/, 'philosophy'],
  [/推荐|建议|介绍一本/, 'recommend'],
  [/流行|热门|最好|最受欢迎|畅销/, 'popular'],
  [/你好|嗨|您好|早上好|下午好|晚上好/, 'hello'],
  [/谢谢|再见|拜拜/, 'thanks'],
  [/统计|阅读记录|进度|看了多少/, 'stats'],
  [/新书|最新|最近添加/, 'new'],
  [/有没有|你有|有吗|是否有/, 'have'],
  // Arabic
  [/رومانسي|حب|عشق|غرام|قصة حب/, 'romance'],
  [/رعب|مخيف|مرعب|فزع/, 'horror'],
  [/خيال علمي|فضاء|مستقبل|كواكب/, 'sci-fi'],
  [/خيال|سحر|أسطوري|ساحر/, 'fantasy'],
  [/غموض|محقق|جريمة|تشويق/, 'mystery'],
  [/تاريخ|تاريخي|قديم|حرب/, 'history'],
  [/مشهور|شهير|شعبي|الأكثر قراءة/, 'popular'],
  [/توصية|اقترح|ينصح/, 'recommend'],
  [/مرحبا|أهلا|السلام عليكم/, 'hello'],
  [/شكرا|وداعا|مع السلامة/, 'thanks'],
  [/تحفيز|نجاح|تطوير الذات/, 'self-help'],
  [/سيرة ذاتية|مذكرات/, 'biography'],
  [/مغامرة|استكشاف/, 'adventure'],
  [/جديد|أحدث/, 'new'],
  [/إحصاء|قرأت|سجل القراءة/, 'stats'],
  // French
  [/romantique|amour|histoire d.amour|roman d.amour/, 'romance'],
  [/horreur|effrayant|terrifiant|peur/, 'horror'],
  [/science.fiction|futur|espace|extraterrestre/, 'sci-fi'],
  [/fantaisie|magie|sorcier|elfe/, 'fantasy'],
  [/mystère|détective|crime|enquête/, 'mystery'],
  [/historique|histoire|guerre|ancien/, 'history'],
  [/classique/, 'classic'],
  [/populaire|tendance|meilleur livre/, 'popular'],
  [/recommande|suggère|conseil/, 'recommend'],
  [/bonjour|salut|bonsoir/, 'hello'],
  [/merci|au revoir|adieu/, 'thanks'],
  [/motivation|réussite|développement personnel/, 'self-help'],
  [/nouveau|récent/, 'new'],
  // Spanish
  [/romántico|amor|historia de amor|novela romántica/, 'romance'],
  [/terror|miedo|susto|espeluznante/, 'horror'],
  [/ciencia ficción|futuro|espacio|extraterrestre/, 'sci-fi'],
  [/fantasía|magia|mago|dragón/, 'fantasy'],
  [/misterio|detective|crimen|suspense/, 'mystery'],
  [/histórico|historia|guerra|antiguo/, 'history'],
  [/clásico/, 'classic'],
  [/popular|tendencia|mejor libro/, 'popular'],
  [/recomienda|sugiere|aconsejar/, 'recommend'],
  [/hola|buenos días|buenas tardes|buenas noches/, 'hello'],
  [/gracias|adiós|hasta luego/, 'thanks'],
  [/motivación|éxito|superación personal/, 'self-help'],
  [/nuevo|reciente/, 'new'],
  // German
  [/romantisch|liebe|liebesgeschichte|liebesroman/, 'romance'],
  [/horror|gruselig|angst|erschreckend/, 'horror'],
  [/science.fiction|zukunft|weltall|außerirdisch/, 'sci-fi'],
  [/fantasie|magie|zauberer|drachen/, 'fantasy'],
  [/krimi|detektiv|verbrechen|mysteriös/, 'mystery'],
  [/historisch|geschichte|krieg|antike/, 'history'],
  [/klassiker/, 'classic'],
  [/beliebt|populär|bestseller/, 'popular'],
  [/empfehlung|empfehlen/, 'recommend'],
  [/hallo|guten morgen|guten tag|guten abend/, 'hello'],
  [/danke|auf wiedersehen|tschüss/, 'thanks'],
  [/motivation|erfolg|persönlichkeitsentwicklung/, 'self-help'],
  [/neu|neueste/, 'new'],
  // Japanese
  [/ロマンス|恋愛|愛情|ラブストーリー/, 'romance'],
  [/ホラー|怖い|幽霊|恐怖/, 'horror'],
  [/SF|未来|宇宙|エイリアン/, 'sci-fi'],
  [/ファンタジー|魔法|魔法使い|ドラゴン/, 'fantasy'],
  [/ミステリー|探偵|犯罪|謎/, 'mystery'],
  [/歴史|古代|戦争|時代小説/, 'history'],
  [/人気|おすすめ|ベストセラー/, 'popular recommend'],
  [/こんにちは|おはよう|こんばんは/, 'hello'],
  [/ありがとう|さようなら/, 'thanks'],
  [/モチベーション|成功|自己啓発/, 'self-help'],
  [/新しい|最新/, 'new'],
];

// Maps everyday English words/phrases to genre tokens
const CONCEPT_MAP: Array<[string, string]> = [
  // Romance
  ['love book', 'romance'], ['love story', 'romance'], ['love novel', 'romance'],
  ['books about love', 'romance'], ['romantic novel', 'romance'], ['romantic book', 'romance'],
  ['heart', 'romance'], ['crush', 'romance'], ['dating book', 'romance'],
  ['relationship book', 'romance'], ['wedding', 'romance'], ['passion', 'romance'],
  ['heartbreak', 'romance'], ['soulmate', 'romance'], ['couple', 'romance'],
  ['falling in love', 'romance'], ['love between', 'romance'], ['lovers', 'romance'],
  // Horror
  ['scary book', 'horror'], ['scary story', 'horror'], ['spooky book', 'horror'],
  ['ghost book', 'horror'], ['ghost story', 'horror'], ['creepy book', 'horror'],
  ['dark story', 'horror'], ['haunted', 'horror'], ['nightmare', 'horror'],
  ['demon', 'horror'], ['vampire', 'horror'], ['zombie', 'horror'],
  ['supernatural', 'horror'], ['evil book', 'horror'], ['frightening', 'horror'],
  // Sci-Fi
  ['space book', 'sci-fi'], ['space story', 'sci-fi'], ['alien book', 'sci-fi'],
  ['robot book', 'sci-fi'], ['spaceship', 'sci-fi'], ['future book', 'sci-fi'],
  ['futuristic', 'sci-fi'], ['time travel', 'sci-fi'], ['galaxy', 'sci-fi'],
  ['artificial intelligence', 'sci-fi'], ['planet book', 'sci-fi'],
  // Dystopian
  ['dystopia', 'Dystopian'], ['apocalypse', 'Dystopian'], ['post-apocalyptic', 'Dystopian'],
  ['end of world', 'Dystopian'], ['dystopian', 'Dystopian'],
  // Fantasy
  ['magic book', 'fantasy'], ['dragon book', 'fantasy'], ['wizard book', 'fantasy'],
  ['witch book', 'fantasy'], ['elf', 'fantasy'], ['mythical', 'fantasy'],
  ['enchanted', 'fantasy'], ['fairy tale', 'fantasy'], ['epic quest', 'fantasy'],
  ['magical world', 'fantasy'], ['sorcerer', 'fantasy'], ['kingdom', 'fantasy'],
  // Mystery / Thriller
  ['detective book', 'mystery'], ['detective story', 'mystery'], ['crime book', 'mystery'],
  ['murder mystery', 'mystery'], ['whodunit', 'mystery'], ['crime novel', 'mystery'],
  ['serial killer', 'thriller'], ['spy book', 'thriller'], ['espionage', 'thriller'],
  ['suspense book', 'thriller'], ['cold case', 'mystery'], ['heist', 'thriller'],
  // Adventure
  ['adventure book', 'adventure'], ['survival story', 'adventure'], ['journey book', 'adventure'],
  ['quest', 'adventure'], ['exploration', 'adventure'], ['treasure hunt', 'adventure'],
  // Biography
  ['biography', 'biography'], ['life story', 'biography'], ['memoir', 'biography'],
  ['autobiography', 'biography'], ['real story', 'biography'], ['true story', 'biography'],
  ['famous person', 'biography'], ['real life story', 'biography'],
  // Self-Help
  ['motivation book', 'self-help'], ['motivational book', 'self-help'], ['inspiring book', 'self-help'],
  ['success book', 'self-help'], ['productivity book', 'self-help'], ['habit book', 'self-help'],
  ['mindset', 'self-help'], ['leadership book', 'self-help'], ['personal growth', 'self-help'],
  ['positive thinking', 'self-help'], ['how to succeed', 'self-help'], ['happiness book', 'self-help'],
  // History
  ['war book', 'history'], ['historical novel', 'history'], ['medieval book', 'history'],
  ['ancient world', 'history'], ['world war book', 'history'], ['civilization', 'history'],
  ['ancient egypt', 'history'], ['ancient rome', 'history'], ['revolution book', 'history'],
  // Philosophy
  ['philosophy book', 'philosophy'], ['wisdom book', 'philosophy'], ['meaning of life', 'philosophy'],
  ['stoic', 'philosophy'], ['existential', 'philosophy'],
  // Classic
  ['classic novel', 'classic'], ['old classic', 'classic'], ['timeless book', 'classic'],
  ['must read', 'classic'], ['literary fiction', 'classic'],
];

function detectLanguage(raw: string): string | null {
  if (/[一-鿿぀-ヿ゠-ヿ]/.test(raw)) return 'Chinese/Japanese';
  if (/[؀-ۿ]/.test(raw)) return 'Arabic';
  if (/\b(bonjour|merci|salut|bonsoir|avez.vous|recommande)\b/i.test(raw)) return 'French';
  if (/\b(hola|gracias|buenos|romántico|adiós|recomienda)\b/i.test(raw)) return 'Spanish';
  if (/\b(hallo|danke|buch|bücher|empfehlung|guten)\b/i.test(raw)) return 'German';
  return null;
}

function enrichQuery(raw: string): string {
  let q = raw.toLowerCase();
  // Step 1: translate foreign-language tokens
  for (const [pattern, token] of LANG_PATTERNS) {
    if (pattern.test(q)) q += ' ' + token;
  }
  // Step 2: expand English concepts (longest match first to avoid partial overlaps)
  const sorted = [...CONCEPT_MAP].sort((a, b) => b[0].length - a[0].length);
  for (const [concept, genre] of sorted) {
    if (q.includes(concept)) q += ' ' + genre;
  }
  return q;
}

// Genre patterns checked against the enriched query
const GENRE_RULES: Array<[RegExp, string, string]> = [
  [/\bromance\b|romantic book|love story|love book/, 'Romance', 'romance'],
  [/\bhorror\b|scary book|ghost story|spooky/, 'Horror', 'horror'],
  [/sci.?fi|science.?fiction|space story|alien book/, 'Science Fiction', 'sci-fi'],
  [/\bfantasy\b|magic book|dragon book|wizard/, 'Fantasy', 'fantasy'],
  [/dystopian|dystopia|apocalypse|post.apocalyptic/, 'Dystopian', 'dystopian'],
  [/\bmystery\b|detective book|crime book|murder mystery/, 'Mystery', 'mystery'],
  [/\bthriller\b|spy book|espionage|serial killer/, 'Thriller', 'thriller'],
  [/\badventure\b|survival story|treasure hunt/, 'Adventure', 'adventure'],
  [/\bbiography\b|memoir|life story|true story/, 'Biography', 'biography'],
  [/self.help|motivation book|personal growth|mindset/, 'Self-Help', 'self-help'],
  [/\bhistory\b|historical|war book|medieval/, 'History', 'history'],
  [/\bphilosophy\b|wisdom book|stoic|existential/, 'Philosophy', 'philosophy'],
  [/\bclassic\b|timeless book|must read|literary/, 'Classic', 'classic'],
  [/\bfiction\b/, 'Fiction', 'fiction'],
  [/non.fiction|nonfiction/, 'Non-Fiction', 'non-fiction'],
];

function findBooksByGenre(genre: string, allBooks: Book[]): Book[] {
  const g = genre.toLowerCase().replace(/[^a-z]/g, '');
  return allBooks
    .filter(b => b.available && b.category?.toLowerCase().replace(/[^a-z]/g, '').includes(g))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
}

function buildBotReply(input: string, allBooks: Book[], userName: string): { text: string; books?: Book[] } {
  const raw = input.trim();
  const lang = detectLanguage(raw);
  const q = enrichQuery(raw);

  const LANG_GREET: Record<string, string> = {
    'Chinese/Japanese': '你好！ ', 'Arabic': 'مرحباً! ', 'French': 'Bonjour! ',
    'Spanish': '¡Hola! ', 'German': 'Hallo! ',
  };
  const langNote = lang ? (LANG_GREET[lang] ?? '') : '';

  // ── Greetings ──────────────────────────────────────────────────
  if (/\b(hi|hello|hey|hiya|howdy|sup)\b|^(hello|hi|hey)$|hello\b/.test(q)) {
    return { text: `${langNote}${pickRandom([
      `${timeGreeting()}, ${userName}! 📚 I'm your LeafShelf Assistant. Ask me for book recommendations, search by mood ("scary", "romantic", "adventure"), or explore genres — even in Chinese, Arabic, French, or Spanish!`,
      `Hello, ${userName}! 👋 Looking for your next great read? Tell me a mood, genre, or keyword and I'll find the perfect book. I also understand multiple languages!`,
      `Hey ${userName}! 📖 Ready to discover something amazing? Try "love story", "scary book", "war history" — or ask in any language!`,
    ])}` };
  }

  // ── "Do you have X" — title or concept lookup ──────────────────
  if (/do you have|have you got|is there a|you have|هل عندك|有没有|avez.vous|tenéis|haben sie/i.test(q)) {
    // Strip the "do you have" prefix to get the topic
    const topic = raw.replace(/do you have|have you got|is there a|avez.vous|tenéis|haben sie|هل عندك|有没有/gi, '').replace(/\?/g, '').trim();
    const topicEnriched = enrichQuery(topic);
    // Check if topic maps to a genre
    for (const [pattern, genreLabel, genreSlug] of GENRE_RULES) {
      if (pattern.test(topicEnriched)) {
        const found = findBooksByGenre(genreSlug, allBooks);
        if (found.length > 0) return { text: `${langNote}Yes! Here are our top ${genreLabel} books:`, books: found };
        const broader = [...allBooks].sort((a, b) => b.rating - a.rating).slice(0, 3);
        return { text: `${langNote}We don't have a dedicated ${genreLabel} section yet, but here are our highest-rated picks:`, books: broader };
      }
    }
    // Try title search
    const topicLower = topic.toLowerCase();
    const titleHits = allBooks.filter(b => b.title.toLowerCase().includes(topicLower) || b.author.toLowerCase().includes(topicLower)).slice(0, 3);
    if (titleHits.length > 0) return { text: `${langNote}Found it! Here's what we have:`, books: titleHits };
    // Fallback
    const recs = getPersonalizedRec(allBooks);
    return { text: `${langNote}We don't have that specific title yet, but here are books you might enjoy:`, books: recs.length > 0 ? recs : [...allBooks].sort((a, b) => b.rating - a.rating).slice(0, 3) };
  }

  // ── Recommend ──────────────────────────────────────────────────
  if (/recommend|suggest|what should i read|next book|pick.*book|book.*pick|توصية|推荐|おすすめ|recomienda|recommande|empfehlung/.test(q) || q.trim() === 'recommend') {
    const borrowed = getLocalBorrowed(); const returned = getLocalReturned();
    const allRead = [...borrowed, ...returned];
    const recs = getPersonalizedRec(allBooks);
    if (recs.length === 0) return { text: `${langNote}You've explored most of our collection! Here are all-time favorites:`, books: [...allBooks].sort((a, b) => b.rating - a.rating).slice(0, 3) };
    const genreLine = allRead.length > 0 ? ' Based on your reading history, ' : ' Here are some top picks for you: ';
    return { text: `${langNote}✨${genreLine}I think you'll love these:`, books: recs };
  }

  // ── Popular / trending ─────────────────────────────────────────
  if (/popular|trending|top.*book|best.*book|bestseller|famous|مشهور|流行|人気|populaire|beliebt/.test(q) || q.trim() === 'popular') {
    const top = [...allBooks].sort((a, b) => b.rating - a.rating).slice(0, 3);
    return { text: `${langNote}🔥 Here are our highest-rated books right now:`, books: top };
  }

  // ── Stats ──────────────────────────────────────────────────────
  if (/\bstat|how many|progress|streak|my library|reading history|إحصاء|统计/.test(q) || q.trim() === 'stats') {
    const borrowed = getLocalBorrowed(); const returned = getLocalReturned();
    const total = borrowed.length + returned.length;
    if (total === 0) return { text: `${langNote}You haven't borrowed any books yet — let's change that! 📖 Ask me for a recommendation.` };
    return { text: `${langNote}📊 Your reading snapshot:\n• Currently reading: ${borrowed.length} book${borrowed.length !== 1 ? 's' : ''}\n• Completed: ${returned.length}\n• Total books: ${total}\n\nKeep it up, ${userName}! 🌿` };
  }

  // ── New arrivals ───────────────────────────────────────────────
  if (/\bnew\b|latest|recent|arrival|just added|جديد|新书|nouveau|nuevo|neu/.test(q)) {
    const recent = allBooks.slice(-4).reverse();
    return { text: `${langNote}🆕 Our latest additions:`, books: recent };
  }

  // ── Due dates ──────────────────────────────────────────────────
  if (/\bdue\b|return|overdue|deadline/.test(q)) {
    const borrowed = getLocalBorrowed();
    if (borrowed.length === 0) return { text: `${langNote}You have no active borrows right now. 🎉` };
    const lines = borrowed.map(b => `• "${b.title}" — due ${b.dueAt}`).join('\n');
    return { text: `${langNote}📅 Your borrowed books:\n${lines}` };
  }

  // ── Author search ──────────────────────────────────────────────
  if (/author|who wrote|written by/.test(q)) {
    const authorMatch = q.match(/by\s+([a-z\s]+)/i);
    const authorName = authorMatch?.[1]?.trim() ?? '';
    const found = authorName ? allBooks.filter(b => b.author.toLowerCase().includes(authorName.toLowerCase())).slice(0, 3) : [];
    if (found.length > 0) return { text: `${langNote}Found books by "${authorName}":`, books: found };
    return { text: `${langNote}I couldn't find that author. Try the Books section for more options! 🔍` };
  }

  // ── Multi-language info ────────────────────────────────────────
  if (/multi.language|language|chinese|arabic|french|spanish|german|japanese|langue|sprache/.test(q) || q.trim() === 'lang') {
    return { text: `${langNote}🌍 I understand multiple languages! Try asking me in:\n\n🇨🇳 Chinese — "有没有爱情书？"\n🇸🇦 Arabic — "هل عندك كتاب رومانسي؟"\n🇫🇷 French — "Avez-vous des livres romantiques?"\n🇪🇸 Spanish — "¿Tienen libros de amor?"\n🇩🇪 German — "Haben Sie Liebesromane?"\n🇯🇵 Japanese — "恋愛小説はありますか？"\n\nI'll understand the genre and find matching books! 📚` };
  }

  // ── Help ───────────────────────────────────────────────────────
  if (/help|what can|what do|how do|how to|what.*you/.test(q)) {
    return { text: `${langNote}I can help with:\n\n📚 **Recommendations** — personalized picks\n🔥 **Trending** — highest-rated books\n🎭 **Mood/Genre** — "scary", "romantic", "adventure"...\n📊 **Stats** — your reading progress\n📅 **Due dates** — active borrows\n🌍 **Multi-language** — Chinese, Arabic, French, Spanish, German, Japanese\n\nJust ask naturally — I'll figure it out!` };
  }

  // ── Goodbye ────────────────────────────────────────────────────
  if (/bye|goodbye|later|see you|thanks|thank you|شكرا|谢谢|merci|gracias|danke|ありがとう/.test(q)) {
    return { text: `${langNote}${pickRandom([
      `Happy reading, ${userName}! 📚 Come back anytime!`,
      `Until next time! May your next book be unputdownable. 🌿`,
      `Goodbye! Your next great read is just one click away. ✨`,
    ])}` };
  }

  // ── Genre / Mood search — the main intelligence path ──────────
  for (const [pattern, genreLabel, genreSlug] of GENRE_RULES) {
    if (pattern.test(q)) {
      const found = findBooksByGenre(genreSlug, allBooks);
      if (found.length > 0) return { text: `${langNote}📖 Top ${genreLabel} books in our collection:`, books: found };
      // Broader fallback: search in title + description
      const broader = allBooks
        .filter(b => b.available && new RegExp(pattern.source, 'i').test(b.title + ' ' + (b.description ?? '')))
        .sort((a, b) => b.rating - a.rating).slice(0, 3);
      if (broader.length > 0) return { text: `${langNote}📖 Here are some "${genreLabel}" style books you might enjoy:`, books: broader };
      const top = [...allBooks].sort((a, b) => b.rating - a.rating).slice(0, 3);
      return { text: `${langNote}We're still building our ${genreLabel} section, but here are our highest-rated books:`, books: top };
    }
  }

  // ── Keyword / title search ─────────────────────────────────────
  const rawLower = raw.toLowerCase();
  const keywordHits = allBooks
    .filter(b =>
      b.title.toLowerCase().includes(rawLower) ||
      b.author.toLowerCase().includes(rawLower) ||
      b.description?.toLowerCase().includes(rawLower) ||
      b.category?.toLowerCase().includes(rawLower)
    )
    .sort((a, b) => b.rating - a.rating).slice(0, 3);
  if (keywordHits.length > 0) {
    return { text: `${langNote}Here's what I found matching "${raw.slice(0, 40)}":`, books: keywordHits };
  }

  // ── Smart fallback — never say "I'm not sure" ─────────────────
  const recs = getPersonalizedRec(allBooks);
  if (recs.length > 0) {
    return {
      text: `${langNote}I think I understand what you're looking for! Here are some books you'd likely enjoy — or try being more specific (e.g. "romance", "scary story", "history"):`,
      books: recs,
    };
  }
  return { text: `${langNote}Let me help you find the perfect book! Try:\n• A mood: "romantic", "scary", "inspiring"\n• A genre: "fantasy", "mystery", "history"\n• Or ask in another language! 🌍📚` };
}

export default function ChatBot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [allBooks, setAllBooks] = useState<Book[]>(() => readCached<Book[]>('books') ?? []);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(1);
  const groqHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const userName = user?.name?.split(' ')[0] ?? 'Reader';

  useEffect(() => {
    if (allBooks.length === 0) {
      void listBooks().then(b => setAllBooks(b)).catch(() => null);
    }
  }, [allBooks.length]);

  useEffect(() => {
    if (open && messages.length === 0) {
      groqHistoryRef.current = [];
      const greeting: Message = {
        id: idRef.current++,
        from: 'bot',
        text: `${timeGreeting()}, ${userName}! 📚 I'm your LeafShelf Assistant — powered by Groq AI. Ask me anything about books, get personalised recommendations, or search by mood. How can I help you today?`,
      };
      setMessages([greeting]);
      setUnread(0);
    }
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  function addBotMessage(reply: { text: string; books?: Book[] }) {
    setTyping(false);
    const msg: Message = {
      id: idRef.current++,
      from: 'bot',
      text: reply.text,
      books: reply.books,
    };
    setMessages(prev => [...prev, msg]);
    if (!open) setUnread(u => u + 1);
  }

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput('');

    const userMsg: Message = { id: idRef.current++, from: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    groqHistoryRef.current = [...groqHistoryRef.current, { role: 'user', content: q }];

    try {
      const reply = await callGroq(groqHistoryRef.current, allBooks, userName);
      groqHistoryRef.current = [...groqHistoryRef.current, { role: 'assistant', content: reply.text }];
      addBotMessage(reply);
    } catch {
      // Fallback to local pattern-matching if Groq is unavailable
      const reply = buildBotReply(q, allBooks, userName);
      addBotMessage(reply);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const THEMES = {
    sepia: { bg: '#FBF7EE', text: '#3C2E22' },
    light: { bg: '#FFFFFF', text: '#111827' },
    dark: { bg: '#1a1a2e', text: '#e8e8e8' },
  };
  const _ = THEMES; void _;

  return (
    <>
      {/* Floating button */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          title="LeafShelf Assistant"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1B4332, #2d6a4f)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(27,67,50,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            transform: open ? 'scale(0.92)' : 'scale(1)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = open ? 'scale(0.92)' : 'scale(1)'; }}
        >
          {open ? (
            <svg width="22" height="22" fill="none" stroke="#f5e9c0" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="#f5e9c0" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
          {unread > 0 && !open && (
            <span style={{
              position: 'absolute',
              top: -2, right: -2,
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: 18, height: 18,
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>{unread}</span>
          )}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 92,
          right: 24,
          width: 360,
          maxWidth: 'calc(100vw - 48px)',
          height: 520,
          maxHeight: 'calc(100vh - 120px)',
          borderRadius: 20,
          background: '#fff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9998,
          animation: 'chatSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <style>{`
            @keyframes chatSlideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes typingDot {
              0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
              40% { transform: scale(1); opacity: 1; }
            }
            .chat-msg-bot { animation: msgFadeIn 0.2s ease; }
            .chat-msg-user { animation: msgFadeIn 0.2s ease; }
            @keyframes msgFadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1B4332, #2d6a4f)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(245,233,192,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 18 }}>📚</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#f5e9c0', fontWeight: 700, fontSize: 14, margin: 0 }}>LeafShelf Assistant</p>
              <p style={{ color: 'rgba(245,233,192,0.65)', fontSize: 11, margin: 0 }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#4ade80', marginRight: 4, verticalAlign: 'middle' }} />
                Online · Ready to help
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,233,192,0.7)', padding: 4 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(msg => (
              <div key={msg.id} className={msg.from === 'bot' ? 'chat-msg-bot' : 'chat-msg-user'}
                style={{ display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
                {msg.from === 'bot' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 13 }}>📚</span>
                  </div>
                )}
                <div style={{ maxWidth: '80%' }}>
                  <div style={{
                    background: msg.from === 'user' ? '#1B4332' : '#F3F4F6',
                    color: msg.from === 'user' ? '#f5e9c0' : '#1f2937',
                    borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '9px 13px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                  }}>
                    {msg.text}
                  </div>
                  {msg.books && msg.books.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {msg.books.map(book => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => navigate(`/books/${book.id}`)}
                          style={{
                            display: 'flex', gap: 10, alignItems: 'center',
                            background: '#fff', border: '1px solid #e5e7eb',
                            borderRadius: 12, padding: '8px 10px',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
                        >
                          <div style={{ width: 36, height: 50, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#e5e7eb' }}>
                            {book.cover_url
                              ? <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1B4332,#2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ fontSize: 14 }}>📖</span>
                                </div>
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: 12, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                            <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <span style={{ fontSize: 10, color: '#f59e0b' }}>{'★'.repeat(Math.round(book.rating))}</span>
                              <span style={{ fontSize: 10, color: '#6b7280' }}>{book.rating.toFixed(1)}</span>
                              <span style={{ fontSize: 10, color: book.available ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{book.available ? '● Available' : '○ Checked Out'}</span>
                            </div>
                          </div>
                          <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="chat-msg-bot" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 13 }}>📚</span>
                </div>
                <div style={{ background: '#F3F4F6', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af', display: 'inline-block', animation: `typingDot 1.2s ease infinite`, animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_ACTIONS.map(({ label, key }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => send(label.replace(/^[^\s]+\s/, ''))}
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    border: '1px solid #86efac',
                    borderRadius: 20,
                    padding: '5px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#166534',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, alignItems: 'center', background: '#fafafa' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything about books..."
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: 20,
                border: '1.5px solid #e5e7eb',
                fontSize: 13,
                outline: 'none',
                background: '#fff',
                color: '#111827',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B4332'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'; }}
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={!input.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: input.trim() ? '#1B4332' : '#e5e7eb',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <svg width="16" height="16" fill="none" stroke={input.trim() ? '#f5e9c0' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <div style={{ padding: '4px 14px 8px', textAlign: 'center' }}>
            <span style={{ fontSize: 10, color: '#d1d5db' }}>LeafShelf AI Assistant · Powered by Groq</span>
          </div>
        </div>
      )}
    </>
  );
}
