import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

const wordsPerMinute = 220;

export function sortPostsNewestFirst(posts: BlogPost[]): BlogPost[] {
  return [...posts].toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getReadingTime(post: BlogPost): number {
  const wordCount = post.body?.trim().split(/\s+/u).filter(Boolean).length ?? 0;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getAllTags(posts: BlogPost[]): Array<{ name: string; count: number }> {
  const tags = new Map<string, { name: string; count: number }>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const key = tag.toLocaleLowerCase();
      const existing = tags.get(key);

      tags.set(key, {
        name: existing?.name ?? tag,
        count: (existing?.count ?? 0) + 1,
      });
    }
  }

  return [...tags.values()].toSorted((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
}

export function getAdjacentPosts(posts: BlogPost[], currentId: string) {
  const index = posts.findIndex((post) => post.id === currentId);

  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

export function toTagSlug(tag: string): string {
  return encodeURIComponent(tag.toLocaleLowerCase());
}
