export interface ResearchSource {
  kind: "encyclopedia" | "news";
  title: string;
  snippet: string;
  url: string;
  date: string;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

function decodeEntities(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function wikipedia(company: string): Promise<ResearchSource[]> {
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        company + " company",
      )}&format=json&srlimit=1&origin=*`,
      { headers: { "User-Agent": UA } },
    );
    if (!searchRes.ok) return [];
    const search = (await searchRes.json()) as {
      query?: { search?: Array<{ title: string }> };
    };
    const title = search.query?.search?.[0]?.title;
    if (!title) return [];

    const sumRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { "User-Agent": UA } },
    );
    if (!sumRes.ok) return [];
    const summary = (await sumRes.json()) as {
      title?: string;
      extract?: string;
      content_urls?: { desktop?: { page?: string } };
    };
    if (!summary.extract) return [];

    return [
      {
        kind: "encyclopedia",
        title: summary.title ?? title,
        snippet: summary.extract,
        url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${title}`,
        date: "",
      },
    ];
  } catch {
    return [];
  }
}

async function news(company: string, limit = 8): Promise<ResearchSource[]> {
  try {
    const res = await fetch(
      `https://news.google.com/rss/search?q=${encodeURIComponent(
        `"${company}"`,
      )}&hl=en-US&gl=US&ceid=US:en`,
      { headers: { "User-Agent": UA } },
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

    return items.slice(0, limit).map((item) => {
      const pick = (tag: string) => {
        const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return m?.[1] ? decodeEntities(m[1]) : "";
      };
      return {
        kind: "news" as const,
        title: pick("title"),
        snippet: pick("description").slice(0, 300),
        url: pick("link"),
        date: pick("pubDate").slice(0, 16),
      };
    });
  } catch {
    return [];
  }
}

/** Live research about a company: encyclopedia entry plus recent news headlines. */
export async function researchCompany(company: string): Promise<ResearchSource[]> {
  const [wiki, headlines] = await Promise.all([wikipedia(company), news(company)]);
  return [...wiki, ...headlines];
}

export function formatSources(sources: ResearchSource[]): string {
  if (sources.length === 0) return "(no live sources found — rely on general knowledge)";
  return sources
    .map((s, i) => `[${i + 1}] (${s.kind}${s.date ? `, ${s.date}` : ""}) ${s.title}\n${s.snippet}`)
    .join("\n\n");
}
