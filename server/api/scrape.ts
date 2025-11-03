import { defineEventHandler } from 'h3';
import * as cheerio from 'cheerio';
import fs from 'node:fs/promises';

export default defineEventHandler(async (event) : Promise<ScrapingData[] | { msg: string }> => {
  console.log('request received');
  const url = getQuery(event)?.url;

  setHeader(event, 'Content-Type', 'text/event-stream');
  setHeader(event, 'Cache-Control', 'no-cache');
  setHeader(event, 'Connection', 'keep-alive');


  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: 'Missing or invalid url parameter'
    });
  }
  const data = scraping(url);

  return data;
});

type ScrapingData = {
  url: string
  linkedURLs: string[]
  failed?: boolean
  remarks?: string
};

const scraping = async (rootUrl: string) => {

  const result: ScrapingData[] = [];
  const urlQueue: string[] = [];
  const visitedURLs: Set<string> = new Set();

  urlQueue.push(rootUrl);
  visitedURLs.add(rootUrl);
  const urlFilter = { host: new URL(rootUrl).host };

  while (urlQueue.length > 0) {
    let $: cheerio.CheerioAPI;
    const curURL = urlQueue.shift();
    console.log('URL:', curURL);
    const curLinkdedURLs: string[] = [];
    if (visitedURLs.has(curURL!)) continue;
    await respectDelay(1000); // Respect 1 second delay between requests

    try {
      const response = await fetch(curURL!, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
          Accept: 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });
      const html = await response.text();
      $ = cheerio.load(html);
      $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          let url: string;
          if (URL.canParse(href)) {
            url = href;
          } else {
            const absoluteUrl = new URL(href, curURL).toString();
            url = absoluteUrl;
          }
          if (FilterURL(url, urlFilter)) {
            urlQueue.push(url);
            curLinkdedURLs.push(url);
          }
        }
      });
      result.push({
        url: curURL!,
        linkedURLs: curLinkdedURLs,
        failed: false
      });
    } catch (err) {
      result.push({
        url: curURL!,
        linkedURLs: [],
        failed: true,
        remarks: String(err)

      });
    } finally {
      visitedURLs.add(curURL!);
    }
  }
  return result;
};

type URLFilter = {
  host?: string
};

type PageFilter = {
  meta?: Record<string, string>
};

const FilterURL = (url: string, filter: URLFilter) : boolean => {
  if (filter.host) {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== filter.host) {
        return false;
      }
    } catch {
      return false;
    }
  }
  return true;
};

const respectDelay = async (ms: number) : Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const saveToJson = async (data: ScrapingData[], filename: string) => {
  try {
    const data = await fs.readFile(filename, 'utf-8');
    const jsonData = JSON.parse(data);
  } catch(error) {
    console.warn('Error reading file:', error);
  }

};

