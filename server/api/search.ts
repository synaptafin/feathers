import { defineEventHandler } from 'h3';
import type { DocsCollectionItem } from '@nuxt/content';

export default defineEventHandler(async (event) => {
  const docs: DocsCollectionItem[] = await queryCollection(event, 'docs');
  // const data = docs.map(( doc )=> {return {title: doc.title, description: 'No desc', keywords: 'Keyword', body: doc.body}})

  return 'api/search';
});
