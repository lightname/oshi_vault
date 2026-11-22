export type Lang = 'ko' | 'en' | 'ja';
export type Currency = 'JPY' | 'KRW' | 'USD';
export type Market = 'ebay' | 'mercari' | 'kream' | 'other';
export type IpCategory = 'game' | 'anime' | 'character' | 'movie';
export type GoodsType = 'figure' | 'plush' | 'badge' | 'card' | 'kuji' | 'apparel' | 'other';
export type LimitType = 'quantity' | 'period' | 'store' | 'region' | 'lottery' | 'collab' | 'regular';
export type SellerType = 'official_online' | 'official_store' | 'mall' | 'specialty';
export type SaleStatus = 'preorder' | 'onsale' | 'soldout' | 'ended';
export type CodeType = 'jan13' | 'jan8' | 'other';
export type SubscribeTopic = 'target_price' | 'tracking_request';

export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL'
  | 'NETWORK';

export type Ip = {
  slug: string;
  name: Record<Lang, string>;
  original: string;
  owner: string;
  category: IpCategory;
  priority: 1 | 2 | 3;
  officialUrl: string | null;
  order: number;
  goodsCount: number;
};

export type Goods = {
  id: string;
  ipSlug: string;
  slug: string;
  name: Record<Lang, string>;
  original: string;
  code: string | null;
  codeType: CodeType | null;
  maker: string | null;
  type: GoodsType;
  limit: LimitType;
  releaseDate: string | null;
  retail: {
    price: number;
    currency: Currency;
  };
  seller: string;
  sellerType: SellerType;
  status: SaleStatus;
  officialUrl: string;
  verifiedAt: string;
  firstCollectedAt: string;
  note: Record<Lang, string | null>;
  review: {
    en: boolean;
    ja: boolean;
  };
};

export type PriceSnapshot = {
  goodsId: string;
  date: string;
  market: Market;
  median: number;
  currency: Currency;
  samples: number;
  sourceUrl: string | null;
};

export type Meta = {
  generatedAt: string;
  counts: {
    ips: number;
    goods: number;
    prices: number;
  };
};

export type Catalog = {
  meta: Meta;
  ips: Ip[];
  goods: Goods[];
  prices: PriceSnapshot[];
};

export type ManualItem = {
  name: string;
  ipName: string;
  price: number;
  currency: Currency;
  releaseDate?: string;
  code?: string;
};

export type CollectionItem = {
  id: string;
  goodsId: string | null;
  manual?: ManualItem;
  qty: number;
  acquiredPrice?: number;
  acquiredCurrency?: Currency;
  addedAt: string;
};

export type WishItem = {
  goodsId: string;
  targetPrice: number | null;
  currency: Currency;
  addedAt: string;
};

export type UserDataDoc = {
  version: 1;
  collection: CollectionItem[];
  wishlist: WishItem[];
  prefs: {
    subscribed: {
      target_price?: string;
      tracking_request?: string;
    };
  };
};

export type SeoManifestEntry = {
  path: string;
  lang: Lang | null;
  screen: string;
  indexable: boolean;
  lastmod: string;
  alternates: Record<string, string>;
};

export type SeoManifest = {
  siteUrl: string;
  entries: SeoManifestEntry[];
};
