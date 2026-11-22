import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import site from "./src/_data/site.js";

// Old Tumblr URLs that are not tied to a single post.
const STATIC_REDIRECTS = [
  { from: "/archive", to: "/#writing" },
  { from: "/page/2", to: "/#writing" },
  { from: "/page/3", to: "/#writing" },
  { from: "/rss", to: "/feed.xml" },
];

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ CNAME: "CNAME" });

  eleventyConfig.setLiquidOptions({ timezoneOffset: site.timezone });

  eleventyConfig.addLayoutAlias("default", "layouts/default.html");
  eleventyConfig.addLayoutAlias("post", "layouts/post.html");
  eleventyConfig.addLayoutAlias("page", "layouts/page.html");

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.html").sort((a, b) => a.date - b.date)
  );

  eleventyConfig.addCollection("redirects", (api) => {
    const out = [...STATIC_REDIRECTS];
    for (const post of api.getFilteredByGlob("src/posts/*.html")) {
      for (const from of post.data.redirect_from || []) out.push({ from, to: post.url });
    }
    const topics = new Set(
      api.getFilteredByGlob("src/posts/*.html").flatMap((p) => p.data.topics || [])
    );
    for (const t of topics) {
      for (const v of new Set([t, t.toLowerCase()])) {
        out.push({ from: "/tagged/" + encodeURIComponent(v).replace(/%20/g, "-"), to: "/#writing" });
      }
    }
    const seen = new Set();
    return out.filter((r) => !seen.has(r.from) && seen.add(r.from));
  });

  // Newest first, grouped by year: [{ year, items }]
  eleventyConfig.addFilter("byYear", (posts) => {
    const groups = new Map();
    for (const p of [...posts].reverse()) {
      const y = String(p.date.getFullYear());
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y).push(p);
    }
    return [...groups].map(([year, items]) => ({ year, items }));
  });

  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("absoluteUrl", (path) => new URL(path, site.url).href);
  eleventyConfig.addFilter("readingTime", (html) => {
    const words = String(html).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return words > 350 ? Math.ceil(words / 220) : 0;
  });
  eleventyConfig.addFilter("summary", (html) => {
    const first = String(html).split("<!-- more -->")[0];
    const text = first.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return text.length > 180 ? text.slice(0, 177).replace(/\s+\S*$/, "") + "…" : text;
  });

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 0 },
    metadata: {
      language: site.lang,
      title: site.title,
      subtitle: site.description,
      base: site.url + "/",
      author: { name: site.author, email: site.email },
    },
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
  };
}
