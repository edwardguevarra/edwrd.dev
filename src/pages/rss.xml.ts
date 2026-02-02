import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: { site: string | undefined }) {
  const blogPosts = await getCollection("blog");
  const sortedPosts = blogPosts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: "Blog - edwrd.dev",
    description:
      "Practical programming tips, tutorials, and insights from real projects",
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.id}`,
      pubDate: post.data.date,
    })),
    trailingSlash: false,
  });
}
