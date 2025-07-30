interface Date {
  /**
   * Give a more precise return type to the method `toISOString()`:
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
   */
  toISOString(): TDateISO;
}

type TYear = `${number}${number}${number}${number}`;
type TMonth = `${number}${number}`;
type TDay = `${number}${number}`;
type THours = `${number}${number}`;
type TMinutes = `${number}${number}`;
type TSeconds = `${number}${number}`;
type TMilliseconds = `${number}${number}${number}`;

/**
 * Represent a string like `2021-01-08`
 */
type TDateISODate = `${TYear}-${TMonth}-${TDay}`;

/**
 * Represent a string like `14:42:34.678`
 */
type TDateISOTime = `${THours}:${TMinutes}:${TSeconds}.${TMilliseconds}`;

/**
 * Represent a string like `2021-01-08T14:42:34.678Z` (format: ISO 8601).
 *
 * It is not possible to type more precisely (list every possible values for months, hours etc) as
 * it would result in a warning from TypeScript:
 *   "Expression produces a union type that is too complex to represent. ts(2590)
 */
type TDateISO = `${TDateISODate}T${TDateISOTime}Z`;

export type AppearanceObject = {
  id: number;
  title: unknown[];
  content: string;
  created_at: TDateISO;
  updated_at: TDateISO;
  media: MediaObject[];
};

export type CategoryObject = {
  id: number;
  parent_id: number;
  position: number;
  title: unknown[];
  posts: PostObject[];
  deleted_at: TDateISO;
  created_at: TDateISO;
  updated_at: TDateISO;
  media_libraries: MediaPostObject[];
  slug: unknown[];
};

export type Direction = 'rtl' | 'ltr';
export type Locale = {
  id: number;
  title: string;
  lang_code: string;
  direction: Direction;
  jsonb: string;
  created_at: TDateISO;
  updated_at: TDateISO;
};

export type MediaObject = {
  id: number;
  model_type: string;
  model_id: number;
  uuid: string;
  collection_name: string;
  name: string;
  filename: string;
  link: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: number;
  manipulations: unknown[];
  custom_properties: unknown[];
  generated_conversions: unknown[];
  responsive_images: unknown[];
  order_column: number;
  created_at: TDateISO;
  updated_at: TDateISO;
  preview_url: string;
  original_url: string;
};
export type MediaPostSourceType = 'FILE' | 'LINK';
export type MediaPostType = 'VIDEO' | 'IMAGE';
export type MediaPostObject = {
  id: number;
  title: unknown[];
  description: unknown[];
  category_id: number;
  type: MediaPostType;
  source_type: 'FILE' | 'LINK';
  link: string;
  created_at: TDateISO;
  updated_at: TDateISO;
  media: MediaObject[];
};

export type SectionObject = {
  id: number;
  title: unknown[];
  description: unknown[];
  model_type: string;
  created_at: TDateISO;
  updated_at: TDateISO;
  post_id: number;
  component: string;
  post_id_label: unknown[];
  sectionables: Sectionable[];
  post: SectionableModel;
};
export type SectionableModel = PostObject | MediaPostObject | PressReleaseObject | categoryObject | SectionObject;

export type Sectionable = {
  id: number;
  section_id: number;
  sectionable_type: string;
  sectionable_id: number;
  order: number;
  created_at: TDateISO;
  updated_at: TDateISO;
  sectionable: SectionableModel;
};
export type PageObject = {
  id: number;
  title: unknown[];
  slug: unknown[];
  created_at: TDateISO;
  updated_at: TDateISO;
  sections: SectionObject[];
};

export type PostObject = {
  id: number;
  title: unknown[];
  description: unknown[];
  short_description: unknown[];
  url: string;
  icon: string;
  created_at: TDateISO;
  updated_at: TDateISO;
  category_id: number;
  images: MediaObject[];
  attachments: MediaObject[];
  media: MediaObject[];
  category: CategoryObject;
};

export type PressReleaseObject = {
  id: number;
  title: unknown[];
  short_description: unknown[];
  description: unknown[];
  created_at: TDateISO;
  updated_at: TDateISO;
};

export type SettingsObject = {
  id: number;
  group: string;
  name: string;
  locked: true;
  payload: string;
  created_at: TDateISO;
  updated_at: TDateISO;
};

export type MenuObject = {
  id: number;
  parent_id: number | null;
  position: number;
  title: unknown[];
  icon: string;
  url: string | null;
  deleted_at: string;
  category_id: number | null;
  children?: MenuObject[];
};

export type StatObject = {
  id: 0;
  title: unknown[];
  short_desc: unknown[];
  number: 0;
  icon: string;
  created_at: TDateISO;
  updated_at: TDateISO;
  slug: string;
};

export type PetitionObject = {
  id: number;
  uuid: string;
  title: Record<string, string>;
  description: Record<string, string>;
  category: CategoryObject;
  created_at: TDateISO;
  updated_at: TDateISO;
  parliament_petition_signatures: {
    status: 'PENDING' | 'CONFIRMED';
    media: MediaObject[];
  }[];
};

export type CountryObject = {
  id: number;
  lc_region_id: number;
  uid: string;
  official_name: string;
  capital: string;
  iso_alpha_2: string;
  iso_alpha_3: string;
  iso_numeric: number;
  international_phone: string;
  geoname_id: string;
  wmo: string;
  independence_day: string;
  population: string;
  area: string;
  gdp: string;
  languages: string[];
  tld: string[];
  alternative_tld: string[];
  borders: string[];
  timezones: string[];
  currency: string[];
  flag_colors: string[];
  flag_colors_web: string[];
  flag_colors_contrast: string[];
  flag_colors_hex: string[];
  flag_colors_rgb: string[];
  flag_colors_cmyk: string[];
  flag_colors_hsl: string[];
  flag_colors_hsv: string[];
  flag_colors_pantone: string[];
  is_visible: boolean;
  created_at: TDateISO;
  updated_at: TDateISO;
  flag_emoji: {
    img: string;
    utf8: string;
  };
  translations: Array<{
    name: string;
    locale: string;
  }>;
};
