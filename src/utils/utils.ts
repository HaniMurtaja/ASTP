import { I18N } from 'astrowind:config';
import { generateHTML } from '@tiptap/html';
import { JSDOM } from 'jsdom';

import ar from '~/content/ar';
import en from '~/content/en';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Youtube from '@tiptap/extension-youtube';
import Image from '@tiptap/extension-image';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Underline from '@tiptap/extension-underline';
import type { MediaObject } from '~/api/api';
import { fetchLocales } from '~/api';
import { validateLocaleSchema } from './locale';
export const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(I18N?.language, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export const getFormattedDate = (date: Date): string => (date ? formatter.format(date) : '');

export const trim = (str = '', ch?: string) => {
  let start = 0,
    end = str.length || 0;
  while (start < end && str[start] === ch) ++start;
  while (end > start && str[end - 1] === ch) --end;
  return start > 0 || end < str.length ? str.substring(start, end) : str;
};

// Function to format a number in thousands (K) or millions (M) format depending on its value
export const toUiAmount = (amount: number) => {
  if (!amount) return 0;

  let value: string;

  if (amount >= 1000000000) {
    const formattedNumber = (amount / 1000000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'B';
    } else {
      value = formattedNumber + 'B';
    }
  } else if (amount >= 1000000) {
    const formattedNumber = (amount / 1000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'M';
    } else {
      value = formattedNumber + 'M';
    }
  } else if (amount >= 1000) {
    const formattedNumber = (amount / 1000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'K';
    } else {
      value = formattedNumber + 'K';
    }
  } else {
    value = Number(amount).toFixed(0);
  }

  return value;
};
const supportedLocales = { ar, en };

export const getContentForLocale = async (locale) => {
  console.log('[getContentForLocale]', { locale });
  let locales = supportedLocales;
  try {
    const localesData = await fetchLocales(locale);
    const currentLocale = localesData.data.find((currLocale) => {
      console.log('[getContentForLocale] checking', locale);
      return currLocale.lang_code?.toLowerCase() === (locale as unknown as string).toLowerCase();
    });
    const parsedJSON = JSON.parse(currentLocale?.json);
    if(validateLocaleSchema(parsedJSON))
    return parsedJSON;
  } catch (e) {
    console.error('[getContentForLocale] Failed to Fetch locales ', e);
  }
  return locales[locale] ? locales[locale] : locales['ar'];
};

export function formatCustomDate(dateString, locale) {
  try {
    const date = new Date(dateString);

    // Format month name according to the locale
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    const month = monthFormatter.format(date);

    // Format day and year
    const day = date.getDate();
    const year = date.getFullYear();

    // Return formatted string in the exact structure: Month Day, Year
    return `${month} ${day}, ${year}`;
  } catch {
    return 'dateString';
  }
}

export function formatLargeNumber(num: number | string): string {
  const value = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(value)) return '0';

  const format = (n: number) => {
    const rounded = parseFloat(n.toFixed(2));
    return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
  };

  if (value >= 1e9) {
    return format(value / 1e9) + 'B';
  } else if (value >= 1e6) {
    return format(value / 1e6) + 'M';
  } else if (value >= 1e3) {
    return format(value / 1e3) + 'K';
  } else {
    return format(value);
  }
}

export function prepareContentFromJsonOrHTMLString(
  content: string | Record<string, unknown>,
  locale = 'ar',
  stripAllHTML = false
): string {
  try {
    if (!content) return '';

    const htmlString = convertContentToHTML(content, locale);
    if (stripAllHTML) {
      return stripHTMLTags(htmlString);
    }

    const cleanedHTML = processHTMLContent(htmlString);
    return cleanedHTML;
  } catch (error) {
    console.error('Error processing content:', error);
    return '';
  }
}

function convertContentToHTML(content: string | Record<string, unknown>, locale: string): string {
  if (typeof content === 'object') {
    return generateHTMLFromObject(content, locale);
  }

  // Decode HTML entities if the string contains them
  if (content.includes('&lt;') || content.includes('&gt;') || content.includes('&amp;')) {
    return decodeHTMLEntities(content);
  }

  return content;
}

function decodeHTMLEntities(encodedHTML: string): string {
  // Use JSDOM to properly decode HTML entities
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const tempDiv = dom.window.document.createElement('div');
  tempDiv.innerHTML = encodedHTML;
  return tempDiv.innerHTML;
}

function generateHTMLFromObject(content: Record<string, unknown>, locale: string): string {
  try {
    const lowlight = createLowlight(common);

    // Don't include extensions that are already part of StarterKit
    const extensions = [
      StarterKit.configure({
        // Configure StarterKit options if needed
        codeBlock: false, // Disable default codeBlock to use CodeBlockLowlight
      }),
      // Only include extensions NOT in StarterKit
      Highlight,
      Superscript,
      Subscript,
      Underline,
      Typography,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        shouldAutoLink: (url) => url.startsWith('https://'),
        defaultProtocol: 'https',
        autolink: true,
        protocols: ['http', 'https', { scheme: 'tel', optionalSlashes: true }, 'sms', 'mailto'],
      }),
      TextStyle.configure({ mergeNestedSpanStyles: true }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-1/2 max-h-[500px] object-contain rounded-lg shadow-lg',
          loading: 'lazy',
        },
      }),
      Youtube.configure({
        ccLanguage: locale,
        interfaceLanguage: locale,
      }),
    ];

    return generateHTML(content, extensions);
  } catch (error) {
    console.error('Error generating HTML from TipTap object:', error);
    // Fallback: try to extract text content if possible
    return extractTextFromTipTapObject(content);
  }
}

function processHTMLContent(htmlString: string): string {
  const dom = new JSDOM(htmlString);
  const document = dom.window.document;

  removeUnwantedAttributes(document);
  updateRelativeImagePaths(document);

  return dom.serialize();
}

function removeUnwantedAttributes(document: Document): void {
  const allElements = document.querySelectorAll('*');

  allElements.forEach((element) => {
    const tagName = element.tagName?.toLowerCase();

    // Remove style attributes from all elements except iframe, img, and pre
    if (!['iframe', 'img', 'pre'].includes(tagName)) {
      element.removeAttribute('style');
    }

    // Remove class attributes from all elements except iframe and img
    if (!['iframe', 'img'].includes(tagName)) {
      element.removeAttribute('class');
    }
  });
}

function updateRelativeImagePaths(document: Document): void {
  const backendUrl = getBackendUrl();
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    updateImageSrc(img, backendUrl);
    updateImageSrcset(img, backendUrl);
  });
}

function getBackendUrl(): string {
  return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
}

function isRelativeUrl(src: string): boolean {
  return !/^(https?:|blob:|\/\/|data:)/i.test(src);
}

function updateImageSrc(img: HTMLImageElement, backendUrl: string): void {
  const src = img.getAttribute('src');
  if (src && isRelativeUrl(src)) {
    img.src = `${backendUrl}/${src.replace(/^\/+/, '')}`;
  }
}

function updateImageSrcset(img: HTMLImageElement, backendUrl: string): void {
  const srcset = img.getAttribute('srcset');
  if (!srcset) return;

  const newSrcset = srcset
    .split(',')
    .map((item) => {
      const [url, descriptor] = item.trim().split(/\s+/, 2);
      const updatedUrl = isRelativeUrl(url) ? `${backendUrl}/${url.replace(/^\/+/, '')}` : url;
      return descriptor ? `${updatedUrl} ${descriptor}` : updatedUrl;
    })
    .join(', ');

  img.setAttribute('srcset', newSrcset);
}

function stripHTMLTags(htmlString: string): string {
  const dom = new JSDOM(htmlString);
  const document = dom.window.document;

  // Try multiple approaches to get text content
  const textContent = document.body?.textContent || document.documentElement?.textContent || document.textContent || '';

  return textContent.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}

function extractTextFromTipTapObject(content: Record<string, unknown>): string {
  try {
    // Recursively extract text from TipTap JSON structure
    const extractText = (node: Record<string, unknown>): string => {
      if (!node) return '';

      if (typeof node === 'string') return node;

      if (node.text) return node.text as string;

      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('');
      }

      if (node.content) {
        return extractText(node.content as Record<string, unknown>);
      }

      return '';
    };

    return extractText(content);
  } catch (error) {
    console.error('Error extracting text from TipTap object:', error);
    return '';
  }
}

export function ExtractImagesFromMedia(media: MediaObject[]) {
  const imagesCollections = ['Post_images', 'Media_Library_Thumbnails', 'Podcast_images', 'Podcast_avatars'];
  return media?.filter((media) => imagesCollections.includes(media.collection_name));
}
interface CategoryNode {
  id: string | number;
  children?: CategoryNode[];
}
export function getAllSubcategoryIdsIterative(categoryNode: CategoryNode): (string | number)[] {
  if (!categoryNode || !categoryNode.children) {
    return [];
  }

  const allIds: (string | number)[] = [categoryNode.id];
  const queue: CategoryNode[] = [...categoryNode.children]; // Start with direct children

  while (queue.length > 0) {
    const currentNode = queue.shift();

    // Type guard to ensure currentNode exists (shift() can return undefined)
    if (currentNode) {
      allIds.push(currentNode.id);

      // Add children to queue for processing
      if (currentNode.children && currentNode.children.length > 0) {
        queue.push(...currentNode.children);
      }
    }
  }

  return allIds;
}
