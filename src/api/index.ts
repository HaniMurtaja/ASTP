import Fetch  from '@11ty/eleventy-fetch';
import { getAllSubcategoryIdsIterative } from '~/utils/utils';
import type { CountryObject, MenuObject, PageObject, PetitionObject, PostObject } from './api';

const CACHE_AGE = '5m'; // 5 minutes
export function deepMerge(target: Record<string | number, unknown>, source: Record<string | number, unknown>) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      deepMerge(target[key] as Record<string | number, unknown>, source[key] as Record<string | number, unknown>);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
export const ApiRequest = async function requestFunction(
  url,
  fetchOptions: Record<string, unknown>,
  duration = '1s',
  locale = 'ar'
) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  headers.append('Authorization', 'Bearer 123');
  if (locale) {
    headers.append('accept-language', locale);
  }
  const requestOptions = {
    method: 'GET',
    headers: Object.fromEntries(headers as unknown as Iterable<[string, string]>),
    redirect: 'follow',
  };
  try {
    // const response = await Fetch(`${url}`, {
    //   duration,
    //   directory: import.meta.env.PROD ? '/tmp/.cache/' : './.cache',
    //   type: 'json',
    //   fetchOptions: deepMerge({ ...requestOptions }, fetchOptions),
    // });
    const response = await (await fetch(url, requestOptions)).json();

    return response;
  } catch (error) {
    console.dir({ error }, { depth: null });
    return { data: null };
  }
};
export const ApiCachedRequest = async function requestFunction(
  url,
  fetchOptions: Record<string, unknown>,
  duration = '1s',
  locale = 'ar'
) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  headers.append('Authorization', 'Bearer 123');
  if (locale) {
    headers.append('accept-language', locale);
  }
  const requestOptions = {
    method: 'GET',
    headers: Object.fromEntries(headers as unknown as Iterable<[string, string]>),
    redirect: 'follow',
  };
  try {
    const response = await Fetch(`${url}`, {
      duration,
      directory: import.meta.env.PROD ? '/tmp/.cache/' : ".cache",
      type: 'json',
      fetchOptions: deepMerge({ ...requestOptions }, fetchOptions),
    });
    // const response = await (await fetch(url, requestOptions)).json();

    return  response;
  } catch (error) {
    console.dir({ cachedRequestError: error }, { depth: null });
    return { data: null };
  }
};

export const fetchPage = async function getPage(
  id: number,
  locale
): Promise<{
  data: PageObject;
}> {
  try {
    const response = ApiRequest(`${import.meta.env.VITE_API_URL}/api/pages/${id}`, {}, CACHE_AGE, locale);
    return await response;
  } catch (e: unknown) {
    console.error('fetchPage error');
    console.dir(e, { depth: Infinity });
    return {
      data: {
        id: -1,
        sections: [],
        created_at: '0000-00-00T00:00:00.000000Z',
        updated_at: '0000-00-00T00:00:00.000000Z',
        slug: [],
        title: [],
      },
    };
  }
};
//@todo move to config
export const HOME_PAGE_SECTION_TYPES = {
  HERO_FS_SLIDER: true,
  SIDE_BUTTON: false,
  MEDIA_POSTS_CATEGORY: true,
  POSTS_CATEGORY: true,
  POSTS_CATEGORY_2: true,
  POSTS_CATEGORY_3: true,
  PODCASTS: true,
  TESTIMONIALS: true,
  POSTS: true,
  CONTACT_WRAPPER: true,
  PETITIONS: true,
  // POSTS_CATEGORY: true,
  // FEATURED_POSTS_CATEGORY: true,
  // MEDIA_POST_CATEGORY: true,
  // POSTS_CATEGORY_NO_DESC: true,
  // MEDIA_LIBRARY: true,
} as const;

export const isHomePageSectionType = (component: string): component is keyof typeof HOME_PAGE_SECTION_TYPES => {
  return component in HOME_PAGE_SECTION_TYPES;
};

export const fetchMainMenu = async function getMenus(locale): Promise<{
  data: MenuObject[];
}> {
  try {
    const response = await ApiRequest(
      `${import.meta.env.VITE_API_URL}/api/menus?include=category,children`,
      {},
      CACHE_AGE,
      locale
    );
    return response;
  } catch (e: unknown) {
    console.error('fetchPage error');
    console.dir(e, { depth: Infinity });
    return { data: [] };
  }
};
export const fetchFooterMenu = async function getFooterMenus(locale): Promise<{
  data: MenuObject[];
}> {
  try {
    const response = ApiRequest(
      `${import.meta.env.VITE_API_URL}/api/footer-menus?include=category,action,children`,
      {},
      CACHE_AGE,
      locale
    );
    return await response;
  } catch (e: unknown) {
    console.error('fetchPage error');
    console.dir(e, { depth: Infinity });
    return { data: [] };
  }
};

export const fetchCountries = async function getCountries(locale): Promise<{
  data: CountryObject[];
}> {
  try {
    const response = ApiRequest(
      `${import.meta.env.VITE_API_URL}/api/countries?include=translations&per_page=245`,
      {},
      CACHE_AGE,
      locale
    );
    return await response;
  } catch (e: unknown) {
    console.error('fetchPage error');
    console.dir(e, { depth: Infinity });
    return { data: [] };
  }
};

export async function fetchCategoryPosts(
  paginationConfig: { page: number; per_page: number } | number = 6,
  locale,
  category: string | undefined = undefined
): Promise<{ data: PostObject[] }> {
  if (!category) {
    return { data: [] };
  }
  try {
    let categoryObject;
    if (category.indexOf('-') > 0) {
      categoryObject = await ApiRequest(
        `${import.meta.env.VITE_API_URL}/api/categories/${category}`,
        {},
        CACHE_AGE,
        locale
      );
    }
    const catid = categoryObject ? categoryObject.data.id : category;
    const response = await ApiRequest(
      `${import.meta.env.VITE_API_URL}/api/posts?sort=-id${typeof paginationConfig === 'object' ? `&page=${paginationConfig.page}&per_page=${paginationConfig.per_page}` : `&per_page=${paginationConfig}`}&include=media,category&filter[category_id]=${catid}`,
      {},
      CACHE_AGE,
      locale
    );
    return response;
  } catch (e: unknown) {
    console.error(e);
    return { data: [] };
  }
}

export async function fetchCategoryPetitions(
  paginationConfig: { page: number; per_page: number } | number = 6,
  locale,
  category: string | undefined = undefined
): Promise<{ data: PostObject[] }> {
  try {
    const categoryObject = await ApiRequest(
      `${import.meta.env.VITE_API_URL}/api/categories/${category}?include=children,petitions.media`,
      {},
      CACHE_AGE,
      locale
    );

    const catIds = categoryObject ? getAllSubcategoryIdsIterative(categoryObject.data)?.join(',') : category; // if no categoryObject, use the category directly
    const catid = catIds ? catIds : category;
    console.dir(
      {
        catid,
        catIds,
        link: `${import.meta.env.VITE_API_URL}/api/petitions?${typeof paginationConfig === 'object' ? `page=${paginationConfig.page}&per_page=${paginationConfig.per_page}` : `per_page=${paginationConfig}`}&sort=-id&include=media,category&filter[category_id]=${catid}`,
      },
      { depth: null }
    );
    const response = await ApiRequest(
      `${import.meta.env.VITE_API_URL}/api/petitions?${typeof paginationConfig === 'object' ? `page=${paginationConfig.page}&per_page=${paginationConfig.per_page}` : `per_page=${paginationConfig}`}&sort=-id&include=media,category&filter[category_id]=${catid}`,
      {},
      CACHE_AGE,
      locale
    );
    return response;
  } catch (e: unknown) {
    console.error(e);
    return { data: [] };
  }
}

export async function fetchPost(id: number | string, locale): Promise<{ data: PostObject }> {
  try {
    const response = await ApiRequest(
      `${import.meta.env.VITE_API_URL}/api/posts/${id}?include=category,media&sort=-id`,
      {},
      CACHE_AGE,
      locale
    );
    return response;
  } catch (e: unknown) {
    console.error(e);
    return { data: {} as PostObject };
  }
}
export async function fetchPetition(id: number | string, locale): Promise<{ data: PetitionObject }> {
  try {
    const response = await ApiRequest(
      `${import.meta.env.VITE_API_URL}/api/petitions/${id}?include=category,media,parliamentPetitionSignatures.media,parliaments,category.parent`,
      {},
      CACHE_AGE,
      locale
    );
    return response;
  } catch (e: unknown) {
    console.error(e);
    return { data: {} as PetitionObject };
  }
}

export async function fetchLocales(
  locale
): Promise<{ data: { id: number; json: string; lang_code: string; title: string; direction: 'ltr' | 'rtl' }[] }> {
  try {
    const response = await ApiCachedRequest(`${import.meta.env.VITE_API_URL}/api/locales`, {}, '1d', locale);
    return response;
  } catch (e: unknown) {
    console.error('fetchLocales',e);
    return { data: [] };
  }
}

export async function fetchMediaPost(id: number, locale): Promise<{ data: PostObject[] }> {
  try {
    const response = await ApiCachedRequest(
      `${import.meta.env.VITE_API_URL}/api/media_posts/${id}?include=category,media`,
      {},
      CACHE_AGE,
      locale
    );
    return response;
  } catch (e: unknown) {
    console.error(e);
    return { data: [] };
  }
}

// old
export const request = async function requestFunction(
  url,
  fetchOptions: Record<string, unknown>,
  duration = '1h',
  locale
) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  headers.append('Authorization', 'Bearer 1234567890');
  headers.append('accept-language', locale);
  const requestOptions = {
    method: 'GET',
    headers: Object.fromEntries(Array.from(headers.entries())),
    redirect: 'follow',
  };

  return Fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    duration,
    directory: '/tmp/.cache/',
    type: 'json',
    fetchOptions: { ...requestOptions, ...fetchOptions },
  });
};

export const fetchRootCategories = async function fetchCategoryModels(locale) {
  try {
    const response = request(
      `/api/category_models?filters[parent_id]=null&with=activeSubCategories&per_page=20&sort=desc`,
      {},
      CACHE_AGE,
      locale
    );
    return await response;
  } catch (e: unknown) {
    console.error(e);
    return { data: [] };
  }
};

export async function getPostsByCategories(categoryIds: number[], limitPerCategory = 6, locale_id = 1, locale) {
  try {
    const response = request(
      `/api/post_models/call/?call=getPostsByCategories&args[categoryIds]=${categoryIds.join(',')}&args[limitPerCategory]=${limitPerCategory}&args[language_id]=${locale_id}`,
      {},
      CACHE_AGE,
      locale
    );
    return await response;
  } catch (e: unknown) {
    console.error(e);
    return { result: { data: [] } };
  }
}

export async function getFeaturedPosts(locale_id: number, locale) {
  try {
    const response = request(
      `/api/post_models/?filters[is_featured]=1&filters[language_id]=${locale_id}&per_page=5&sort=desc`,
      {},
      CACHE_AGE,
      locale
    );
    return await response;
  } catch (e: unknown) {
    console.error(e);
  }
}
export async function getLanguages(locale) {
  try {
    const response = await request(`/api/language_models`, {}, CACHE_AGE, locale);
    return response;
  } catch (e) {
    console.error(e);
    return { data: [{ id: 1, iso_code: 'ar', rtl: 1 }] };
  }
}
export async function getCategory(slug, locale) {
  try {
    const response = await request(
      `/api/category_models/?filters[slug]=${slug}&filters[is_active]=1`,
      {},
      CACHE_AGE,
      locale
    );
    return response?.data?.[0] || null;
  } catch (e: unknown) {
    console.error(e);

    return null;
  }
}

export async function getPosts(
  locale_id: number,
  per_page: { page: number; per_page: number } | number = 6,
  latest = true,
  featured = false,
  category: string | undefined = undefined,
  locale
) {
  try {
    const response = await request(
      `/api/post_models/?&filters[language_id]=${locale_id}${typeof per_page === 'object' ? `&page=${per_page.page}&per_page=${per_page.per_page}` : `&per_page=${per_page}`}&filters[is_featured]=${Number(featured)}&sort=${latest ? 'desc' : 'asc'}&with=category,author${category ? `&filters[category_id]=${category}` : ''}`,
      {},
      CACHE_AGE,
      locale
    );
    return response;
  } catch (e) {
    console.error(e);
    return [];
  }
}
export async function getPost(id: number, locale) {
  try {
    const response = await request(
      `/api/post_models/?filters[id]=${id}&per_page=1&with=category,user`,
      {},
      CACHE_AGE,
      locale
    );
    return response;
  } catch (e) {
    console.error(e);
    return [];
  }
}
