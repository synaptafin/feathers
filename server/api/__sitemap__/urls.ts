import { asSitemapUrl, defineSitemapEventHandler } from '#imports';
import type { SitemapUrlInput } from '@nuxtjs/sitemap';

export default defineSitemapEventHandler(async (e) => {
  const urls: SitemapUrlInput[] = [];

  // Static pages
  const staticPages = [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/insight', priority: 0.8, changefreq: 'weekly' },
    { loc: '/inspiration', priority: 0.8, changefreq: 'weekly' },
    { loc: '/linked-notes', priority: 0.9, changefreq: 'weekly' },
  ];

  staticPages.forEach((page) => {
    urls.push(
      asSitemapUrl({
        loc: page.loc,
        lastmod: new Date(),
        priority: page.priority,
        changefreq: page.changefreq,
      }),
    );
  });

  // Extract unique categories from content
  const categories = new Set<string>();

  // Add category pages
  categories.forEach((category) => {
    urls.push(
      asSitemapUrl({
        loc: `/categories/${category}`,
        lastmod: new Date(),
        priority: 0.7,
        changefreq: 'weekly',
      }),
    );
  });

  return urls;
});
