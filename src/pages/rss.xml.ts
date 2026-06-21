import { getCollection } from "astro:content";
import rss from "@astrojs/rss";

export async function GET(context: { site: URL }) {
  const posts = await getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: "Corphy's Blog",
    description: "Thoughts, tutorials, and updates from Corphy (蝦蝦).",
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/corphy-page/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>zh-TW</language>`,
  });
}
