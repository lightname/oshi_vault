<!-- CORE.md -->
# CORE.md

판정 기준: "이 문장만 읽은 서로 다른 두 개발자가 다른 코드를 쓸 수 있으면 코드로, 아니면 텍스트로 쓴다"
번호는 C-21부터 시작한다(DESIGN.md 컴포넌트 C-01~C-15와 구분). 티켓의 "CORE C-xx"는 이 문서, "DESIGN C-xx"는 DESIGN.md §4.0이다.

### C-21 사이트 설정
- 쓰는 곳: 전 티켓
- 파일 위치: `src/config.ts`, 빌드 가드는 `next.config.ts`
- 형식: 코드
- 내용:
```ts
export const config = {
  site: { url: 'https://REPLACE-ME.pages.dev', name: { ko: '오시볼트', en: 'Oshi Vault', ja: 'オシボルト' } },
  locales: ['ko', 'en', 'ja'] as const,
  defaultLocale: 'ko' as const,
  localeCurrency: { ko: 'KRW', en: 'USD', ja: 'JPY' } as const,
  seo: { indexLevel: 1 as 1 | 2 | 3 | 4, gscVerification: '' },
  analytics: { ga4Id: '' },
  google: { clientId: '' },
  api: { baseUrl: '', mode: 'mock' as 'mock' | 'live' },
  subscribe: { consentVersion: '2026-10-v1' },
  affiliate: { ebay: null, mercari: null, kream: null } as Record<'ebay' | 'mercari' | 'kream', { param: string; value: string } | null>,
  fx: { baseDate: '2026-10-24', toJPY: { JPY: 1, KRW: 0.11, USD: 150 } }, // 1단위당 JPY. 초기값, 운영자가 baseDate와 함께 갱신
  price: { staleDays: 90 },
  share: { watermarkDefault: true, grades: [
    { id: 'starter', minJPY: 0 }, { id: 'collector', minJPY: 30000 },
    { id: 'curator', minJPY: 100000 }, { id: 'keeper', minJPY: 300000 } ] },
  ipColors: ['#3B2F6B', '#C2410C', '#2563A8', '#B4235A', '#1F7A4D', '#6B7A2E', '#1C1A24', '#B45309'],
} as const;
```
  `next.config.ts`: `output:'export'`, `trailingSlash:true`, `images:{unoptimized:true}`. 파일 상단에서 `process.env.CF_PAGES === '1' && config.site.url.includes('REPLACE-ME') && config.seo.indexLevel >= 1` 이면 `throw new Error('config.site.url 미설정')`.
  IP 색 = `config.ipColors[ip.order % 8]`.
- 지키지 않으면 생기는 문제: 잘못된 canonical 이 배포되거나 .env 의존이 생긴다.

### C-22 데이터 파이프라인 (엑셀 → JSON)
- 쓰는 곳: T-01
- 파일 위치: `scripts/build-data.mjs` (exceljs). npm 스크립트 `data` = `node scripts/build-data.mjs`, `data:check` = `node scripts/build-data.mjs --check`
- 형식: 텍스트
- 내용:
  1. `data/source/mega-ip-goods.xlsx` 를 연다. 시트 이름 `메가IP`, `굿즈`, `시세`. 1행이 머리글이며 열은 머리글 이름으로 찾는다(위치 의존 금지). 머리글이 빈 열과 첫 열이 빈 행은 무시한다. `로그` 시트는 읽지 않는다.
  2. 셀 값 정규화: 날짜(Date 객체 또는 엑셀 시리얼 숫자) → `YYYY-MM-DD`(UTC). 숫자로 저장된 품번/JAN → `BigInt(Math.round(v)).toString()` 후 `console.warn('[data] numeric code', 굿즈ID)`. 문자열은 trim, 빈 문자열 → null.
  3. enum 매핑(불일치 시 throw): 분류 게임/애니/캐릭터/영화 → game/anime/character/movie. 품목유형 피규어/인형/뱃지·아크릴/카드/쿠지/의류·잡화/기타 → figure/plush/badge/card/kuji/apparel/other. 한정구분 수량/기간/매장·이벤트/지역/추첨/콜라보/일반 → quantity/period/store/region/lottery/collab/regular. 판매상태 예약중/판매중/품절/종료 → preorder/onsale/soldout/ended. 판매처유형 공식몰/공식매장/쇼핑몰/전문샵 → official_online/official_store/mall/specialty. 마켓은 소문자 ebay/mercari/kream/other.
  4. IP: `상태 = 제외` 행 제외. 필수: IP명, 원어명, 권리사, 분류, 우선순위, IP슬러그(`^[a-z0-9-]+$`). `order` = 우선순위 오름차순 → 시트 행 순서. name.ko=IP명, en=IP명(EN) ?? 원어명, ja=IP명(JA) ?? 원어명.
  5. 굿즈 필수: 굿즈ID(`^[A-Z]{3}-\d{4}$`, 중복 금지), IP명(IP 시트에 존재), 상품명(원어), 상품명(KR), 품목유형, 한정구분, 정가(>0), 통화(JPY/KRW/USD), 판매처, 판매처유형, 판매상태, 상품URL, 검증일, 최초수집일. name.ko=상품명(KR), en=상품명(EN) ?? '', ja=상품명(JA) ?? 상품명(원어). codeType: 13자리 숫자 jan13, 8자리 숫자 jan8, 그 외 값 other, 없음 null. review.en = EN검수==='Y', review.ja = JA검수==='Y'. 리셀* 열은 읽지 않는다.
  6. 시세 필수: 굿즈ID(굿즈에 존재), 일자, 마켓, 중앙값(>0), 통화, 표본수(정수 ≥1). `굿즈ID+일자+마켓` 중복 시 throw.
  7. 슬러그: `slug-lock.json` 에 있으면 그 값. 없으면 name.en 을 NFKD → 소문자 → `[^a-z0-9]+` 를 `-` → 양끝 `-` 제거 → 60자 초과 시 60자 이내 마지막 `-` 에서 자름. name.en 이 비면 ''. 새 값은 lock 에 추가 저장.
  8. 오류는 모아서 `[data] {시트} {행번호} {열} {사유}` 형식으로 전부 출력 후 `process.exit(1)`.
  9. 출력(2칸 들여쓰기, 키 정렬 고정, 끝 줄바꿈): `src/data/generated/{ips,goods,prices,meta}.json`, `public/data/catalog.json`(`{meta,ips,goods,prices}`). meta.generatedAt = 시세 최신 일자와 굿즈 검증일 최댓값 중 큰 값(실행일 아님).
  10. `--check`: 파일을 쓰지 않고 메모리 결과를 기존 파일과 문자열 비교. 다르거나 lock 에 없는 슬러그가 생기면 `[data:check] stale: {파일}` 출력 후 exit 1.
- 지키지 않으면 생기는 문제: 엑셀과 페이지 데이터가 어긋난 채 배포된다.

### C-23 시세 계산
- 쓰는 곳: T-01(배지), T-05, T-08, T-09, T-12, T-13, T-14, T-16
- 파일 위치: `src/lib/price/price.ts`
- 형식: 코드
- 내용:
```ts
export const toJPY = (v: number, c: Currency) => v * config.fx.toJPY[c];
export const fromJPY = (jpy: number, c: Currency) => jpy / config.fx.toJPY[c];
const days = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86_400_000;
export type Current = { jpy: number; date: string; stale: boolean; markets: PriceSnapshot[] } | null;

export function priceOn(rows: PriceSnapshot[], maxDate: string, generatedAt: string): Current {
  const usable = rows.filter((r) => r.date <= maxDate);
  if (usable.length === 0) return null;
  const date = usable.reduce((d, r) => (r.date > d ? r.date : d), usable[0].date);
  const at = usable.filter((r) => r.date === date).sort((a, b) => b.samples - a.samples);
  const total = at.reduce((s, r) => s + r.samples, 0);
  const jpy = at.reduce((s, r) => s + toJPY(r.median, r.currency) * r.samples, 0) / total;
  return { jpy, date, stale: days(date, generatedAt) > config.price.staleDays, markets: at };
}
export const currentPrice = (goodsId: string, prices: PriceSnapshot[], generatedAt: string) =>
  priceOn(prices.filter((p) => p.goodsId === goodsId), '9999-12-31', generatedAt);
export const premiumRatio = (curJPY: number, retail: Goods['retail']) =>
  (curJPY - toJPY(retail.price, retail.currency)) / toJPY(retail.price, retail.currency);

export function itemValueJPY(item: CollectionItem, cat: Catalog, maxDate = '9999-12-31'): number {
  if (item.manual) return toJPY(item.manual.price, item.manual.currency) * item.qty;
  const g = cat.goods.find((x) => x.id === item.goodsId);
  if (!g) return 0;
  const cur = priceOn(cat.prices.filter((p) => p.goodsId === g.id), maxDate, cat.meta.generatedAt);
  return (cur ? cur.jpy : toJPY(g.retail.price, g.retail.currency)) * item.qty;
}
export function collectionHistory(items: CollectionItem[], cat: Catalog) {
  const ids = new Set(items.map((i) => i.goodsId));
  const dates = [...new Set(cat.prices.filter((p) => ids.has(p.goodsId)).map((p) => p.date))].sort();
  return dates.map((date) => ({ date, jpy: items.reduce((s, i) => s + itemValueJPY(i, cat, date), 0) }));
}
export const wishReached = (w: WishItem, cur: Current) =>
  w.targetPrice !== null && cur !== null && fromJPY(cur.jpy, w.currency) <= w.targetPrice;
```
  평균 프리미엄 = 시세 있는 굿즈들의 premiumRatio 산술평균, 0건이면 null. 등급 = `config.share.grades` 중 `minJPY ≤ 총가치` 인 마지막 항목.
- 지키지 않으면 생기는 문제: 상세·진열장·공유 카드의 숫자가 서로 다르게 나온다.

### C-24 포맷 함수
- 쓰는 곳: 가격·날짜·퍼센트를 표시하는 모든 티켓
- 파일 위치: `src/lib/format/format.ts`
- 형식: 코드
- 내용:
```ts
const TAG: Record<Lang, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' };
export const formatMoney = (amount: number, currency: Currency, lang: Lang) =>
  new Intl.NumberFormat(TAG[lang], { style: 'currency', currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: currency === 'USD' ? 2 : 0 }).format(amount);
export const formatLocalMoney = (jpy: number, lang: Lang) =>
  formatMoney(fromJPY(jpy, config.localeCurrency[lang]), config.localeCurrency[lang], lang);
export function formatPercent(ratio: number): string {
  const n = Math.round(ratio * 100);
  return n > 0 ? `+${n}%` : n < 0 ? `−${Math.abs(n)}%` : '±0%';
}
export const formatDate = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(TAG[lang], { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
export const formatRatio = (ratio: number) => (1 + ratio).toFixed(2); // 배율 x.xx
```
- 지키지 않으면 생기는 문제: 언어별 통화·부호 표기가 화면마다 달라진다.

### C-25 메시지 조회
- 쓰는 곳: 전 화면
- 파일 위치: `src/lib/i18n/dictionary.ts`, 키 일치 테스트 `tests/unit/i18n/keys.test.ts`
- 형식: 코드
- 내용:
```ts
import ko from '@/messages/ko.json'; import en from '@/messages/en.json'; import ja from '@/messages/ja.json';
export type Dict = Record<string, string>;
const DICTS: Record<Lang, Dict> = { ko, en, ja };
export const getDictionary = (lang: Lang): Dict => DICTS[lang];
export function t(dict: Dict, key: string, vars?: Record<string, string | number>): string {
  const raw = dict[key];
  if (raw === undefined) throw new Error(`[i18n] missing key: ${key}`);
  return vars ? raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : raw;
}
export const isLang = (v: string): v is Lang => (config.locales as readonly string[]).includes(v);
```
  `keys.test.ts`: 3개 파일 키 집합이 같은지, 값이 빈 문자열이 아닌지 검사. 서버 컴포넌트는 `dict` 를 props 로 클라이언트 컴포넌트에 넘긴다(클라이언트에서 JSON 직접 import 금지).
- 지키지 않으면 생기는 문제: 언어별 문구 누락이 배포 후에 발견된다.

### C-26 라우팅 골격
- 쓰는 곳: T-01
- 파일 위치: `src/app/` 아래
- 형식: 텍스트
- 내용: `src/app/layout.tsx` 는 `export default function RootLayout({children}) { return children; }` 만 둔다(패스스루). `src/app/[lang]/layout.tsx` 가 `<html lang={lang}>` + `<body className={font.className}>` + Header + `<main>` + Footer + ConsentBanner 를 렌더링하고 `generateStaticParams = () => config.locales.map(lang => ({lang}))`, `dynamicParams = false` 를 export 한다. `src/app/page.tsx`(S-00)와 `src/app/not-found.tsx`(S-15)는 각자 `<html lang="en"><body>` 를 직접 렌더링한다. 폰트는 `src/lib/i18n/fonts.ts` 에서 `next/font/google` 로 `Noto_Sans_KR`, `Noto_Sans_JP`(둘 다 `weight:['400','600','700']`, `preload:false`, `display:'swap'`), `Inter`(`subsets:['latin']`, `display:'swap'`)를 모듈 최상위에서 선언하고 ko→KR, ja→JP, en→Inter 를 고른다. 모든 동적 세그먼트 페이지는 `generateStaticParams` + `dynamicParams = false`.
- 지키지 않으면 생기는 문제: `<html lang>` 이 언어별로 달라지지 않거나 미지원 언어 경로가 200으로 생성된다.

### C-27 SEO 메타 생성
- 쓰는 곳: 모든 page.tsx 의 `generateMetadata`
- 파일 위치: `src/lib/seo/metadata.ts`
- 형식: 코드
- 내용:
```ts
type MetaInput = { lang: Lang | null; path: string; pageName: string | null; description: string;
  indexable: boolean; alternates: Partial<Record<Lang, string>>; ogImage: string; };
export function buildMetadata(m: MetaInput): Metadata {
  const site = m.lang ? config.site.name[m.lang] : config.site.name.en;
  const title = m.pageName ? `${m.pageName} | ${site}` : site;
  const abs = (p: string) => `${config.site.url}${p}`;
  const languages = m.indexable
    ? { ...Object.fromEntries(Object.entries(m.alternates).map(([l, p]) => [l, abs(p as string)])), 'x-default': abs('/') }
    : undefined;
  return {
    title, description: m.description,
    alternates: { canonical: abs(m.path), languages },
    robots: m.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description: m.description, url: abs(m.path), type: 'website', siteName: site,
      locale: m.lang ? { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP' }[m.lang] : 'en_US',
      images: [{ url: abs(m.ogImage), width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description: m.description, images: [abs(m.ogImage)] },
    verification: config.seo.gscVerification ? { google: config.seo.gscVerification } : undefined,
  };
}
```
  `alternates` 에는 그 페이지가 **색인 가능한** 언어만 넣는다(C-29 로 각 언어 판정). S-01·S-00 은 `pageName: null` 로 넘기고 title 을 `{사이트명} | {슬로건}` 으로 직접 지정한다. ogImage 경로는 `getImage` 가 아니라 DESIGN §2 OG 파일 경로 규칙 함수 `ogPath(lang, ipSlug?)` 로 만든다(`/images/og/og-ip-{ipSlug}-{lang}.png` 또는 `/images/og/og-default-{lang}.png`, S-00·S-15 는 en).
- 지키지 않으면 생기는 문제: noindex 페이지가 hreflang 에 들어가 색인 신호가 충돌한다.

### C-28 구조화 데이터
- 쓰는 곳: T-05, T-08, T-09, T-04, T-16, T-19
- 파일 위치: `src/lib/seo/jsonld.ts`, 렌더 컴포넌트 `src/components/ui/JsonLd.tsx`
- 형식: 텍스트
- 내용: `JsonLd` 는 `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g,'\\u003c')}} />`. 함수와 필드: `websiteLd(lang)` = WebSite{name, url, inLanguage}. `organizationLd()` = Organization{name:'Oshi Vault', url, logo: site.url+'/icons/icon-512.png'}. `breadcrumbLd(items:{name,path}[])` = BreadcrumbList(position 1부터, item 절대 URL). `itemListLd(items:{name,path}[])` = ItemList(ListItem position, url). `productLd(g, ip, lang)` = Product{name: g.name[lang]||g.original, sku: g.id, gtin13: codeType==='jan13' ? code : 생략, brand: {Brand, name: ip.name[lang]}, offers: {Offer, price: retail.price, priceCurrency: retail.currency, url: officialUrl, availability: preorder→PreOrder, onsale→InStock, soldout→SoldOut, ended→Discontinued(schema.org URL 형식)}}. `articleLd(guide, lang)` = Article{headline: title, description, datePublished: date, dateModified: updated, inLanguage, image: 커버 절대 URL}. `webAppLd(lang)` = WebApplication{name: calc.h1, applicationCategory:'UtilitiesApplication', operatingSystem:'Any', offers:{price:0, priceCurrency: localeCurrency}}. AggregateRating·Review·FAQPage 생성 금지.
- 지키지 않으면 생기는 문제: 리치 결과 테스트 오류 또는 구조화 데이터 정책 위반.

### C-29 색인 판정
- 쓰는 곳: T-01(C-30), 모든 공개 page.tsx
- 파일 위치: `src/lib/seo/indexing.ts`
- 형식: 코드
- 내용:
```ts
const L = () => config.seo.indexLevel;
export const goodsComplete = (g: Goods) => g.name.ko !== '' && g.name.en !== '' && g.name.ja !== '' && g.retail.price > 0;
export function goodsIndexable(g: Goods, lang: Lang): boolean {
  if (L() >= 3) return true;
  if (!goodsComplete(g)) return false;
  return lang === 'ko' || g.review[lang];
}
export const ipHubGenerated = (ip: Ip) => L() >= 3 || ip.goodsCount >= 1;
export const ipHubIndexable = ipHubGenerated;
export function typePageGenerated(count: number): boolean {
  if (L() === 1) return false;
  return L() === 2 ? count >= 3 : count >= 1;
}
export const guideIndexable = (reviewed: boolean) => reviewed;
export const guidesListIndexable = (reviewedCount: number) => reviewedCount > 0;
export const lastmodOverride = (): string | null => (L() === 4 ? new Date().toISOString().slice(0, 10) : null);
// 항상 index: S-00, S-01, S-02, S-12, S-13(reviewed=true일 때), S-16. 항상 noindex: S-05~S-09, S-15.
```
- 지키지 않으면 생기는 문제: 검수 안 된 번역 페이지나 얇은 페이지가 색인된다.

### C-30 seo-manifest · sitemap · robots
- 쓰는 곳: T-01
- 파일 위치: `src/app/seo-manifest.json/route.ts`, `src/lib/seo/manifest.ts`, `scripts/gen-sitemap.mjs`, `src/app/robots.ts`
- 형식: 텍스트
- 내용: `manifest.ts` 의 `buildSeoManifest()` 가 생성되는 모든 공개 페이지(S-00~S-04, S-10~S-14, S-16, 언어별)를 `{path, lang, screen, indexable, lastmod, alternates}` 로 만든다. alternates 는 같은 화면의 색인 가능한 언어 경로 맵. lastmod: S-04 = max(verifiedAt, 그 굿즈 시세 최신일), S-03·S-14 = 소속 굿즈 lastmod 최댓값, S-00·S-01·S-02·S-12 = meta.generatedAt, S-10 = 문서 updated 최댓값, S-11 = updated, S-13 = effective, S-16 = config.fx.baseDate. `lastmodOverride()` 가 값이면 전부 그 값. route.ts 는 `export const dynamic = 'force-static'` 과 `GET` 에서 `Response.json({entries})` 반환. 페이지 파일들도 indexable 판정에 같은 함수(C-29)를 쓴다. `scripts/gen-sitemap.mjs` 는 `next build` 직후 `out/seo-manifest.json` 을 읽어 `indexable=true` 만으로 `out/sitemap-{ko,en,ja}.xml`(S-00 은 en 파일에 포함)을 쓰고, 각 `<url>` 에 `<loc>`, `<lastmod>`, alternates 마다 `<xhtml:link rel="alternate" hreflang=".." href="..">` + x-default 를 넣는다. `out/sitemap.xml` 은 세 파일을 가리키는 `<sitemapindex>`. site.url 은 manifest 에 절대 URL 로 담아 넘긴다(스크립트가 src import 금지). `robots.ts` 는 `{rules:[{userAgent:'*', allow:'/'}], sitemap: site.url+'/sitemap.xml'}`. npm `build` = `next build && node scripts/gen-sitemap.mjs`.
- 지키지 않으면 생기는 문제: 색인 대상과 sitemap·메타 태그가 서로 다른 판정을 쓴다.

### C-31 콘텐츠 로더
- 쓰는 곳: T-09, T-05, T-08, T-15, T-16, T-18
- 파일 위치: `src/lib/content/content.ts`
- 형식: 코드
- 내용:
```ts
const ROOT = path.join(process.cwd(), 'content');
export type Guide = { slug: string; lang: Lang; title: string; description: string; date: string; updated: string;
  ipSlugs: string[]; reviewed: boolean; endCta: 'primary' | 'secondary' | 'scan' | 'shelf'; html: string; toc: { id: string; text: string }[] };
export function listGuides(lang: Lang): Guide[] {
  const dir = path.join(ROOT, lang, 'guides');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readGuide(lang, f.replace(/\.md$/, '')))
    .sort((a, b) => (a.updated < b.updated ? 1 : -1));
}
export function readGuide(lang: Lang, slug: string): Guide {
  const { data, content } = matter(fs.readFileSync(path.join(ROOT, lang, 'guides', `${slug}.md`), 'utf8'));
  for (const k of ['title', 'description', 'date', 'updated', 'ipSlugs', 'reviewed', 'endCta'])
    if (data[k] === undefined) throw new Error(`[content] ${lang}/${slug}: missing ${k}`);
  const toc: Guide['toc'] = [];
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map((t) => ('text' in t ? t.text : '')).join('');
    if (depth !== 2) return `<h${depth}>${text}</h${depth}>`;
    const id = `s-${toc.length + 1}`; toc.push({ id, text });
    return `<h2 id="${id}">${text}</h2>`;
  };
  const html = marked.parse(content, { renderer, async: false }) as string;
  return { slug, lang, ...(data as Omit<Guide, 'slug' | 'lang' | 'html' | 'toc'>), date: String(data.date).slice(0, 10), updated: String(data.updated).slice(0, 10), html, toc };
}
export const guideLangs = (slug: string) => config.locales.filter((l) => fs.existsSync(path.join(ROOT, l, 'guides', `${slug}.md`)));
```
  법적 고지 `readLegal(lang, 'privacy'|'terms')` 도 같은 방식(필수 `title, effective, reviewed`, toc 없음). 커버 IMG-ID: slug 가 DESIGN §5 IMG-13~17 파일명(`cover-{slug}`)과 일치하면 그 IMG, 아니면 IMG-12(`coverImageId(slug)`).
- 지키지 않으면 생기는 문제: 검수 안 된 문서가 색인되거나 목차 id 가 화면마다 달라진다.

### C-32 사용자 데이터 저장소
- 쓰는 곳: T-01(헤더 배지), T-08, T-11, T-12, T-13, T-14, T-07
- 파일 위치: `src/lib/storage/repository.ts`, `src/lib/storage/store.ts`, `src/lib/storage/useUserData.ts`
- 형식: 코드 (상태 흐름이 여러 화면에 걸쳐 완성 코드에 가깝게 기재)
- 내용:
```ts
// repository.ts
export interface UserDataRepository { load(): Promise<UserDataDoc>; save(doc: UserDataDoc): Promise<void>; }
export const EMPTY: UserDataDoc = { version: 1, collection: [], wishlist: [], prefs: { subscribed: {} } };
export class CorruptDataError extends Error {}
export const localRepository: UserDataRepository = {
  async load() {
    const raw = window.localStorage.getItem('mipg.v1');
    if (raw === null) return structuredClone(EMPTY);
    let doc: unknown;
    try { doc = JSON.parse(raw); } catch { throw new CorruptDataError('parse'); }
    if (!isUserDataDoc(doc)) throw new CorruptDataError('shape'); // 필드·타입 검사 함수, 같은 파일
    return doc;
  },
  async save(doc) { window.localStorage.setItem('mipg.v1', JSON.stringify(doc)); },
};
// store.ts
type State = { status: 'loading' | 'ready' | 'error'; doc: UserDataDoc };
let state: State = { status: 'loading', doc: EMPTY };
const listeners = new Set<() => void>();
let started = false;
const emit = () => listeners.forEach((l) => l());
export function subscribe(l: () => void) {
  listeners.add(l);
  if (!started) { started = true;
    localRepository.load().then((doc) => { state = { status: 'ready', doc }; emit(); })
      .catch(() => { state = { status: 'error', doc: EMPTY }; emit(); }); }
  return () => listeners.delete(l);
}
export const getSnapshot = () => state;
export const getServerSnapshot = (): State => ({ status: 'loading', doc: EMPTY });
export function update(fn: (d: UserDataDoc) => UserDataDoc) {
  if (state.status !== 'ready') return;
  const doc = fn(state.doc); state = { status: 'ready', doc }; emit();
  void localRepository.save(doc);
}
export function reset() { state = { status: 'ready', doc: structuredClone(EMPTY) }; emit(); void localRepository.save(state.doc); }
// useUserData.ts ('use client')
export const useUserData = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```
  변경 함수(같은 `store.ts`, 모두 `update` 경유): `addToCollection(goodsId)`(있으면 qty+1, 상한 99), `addManual(manual)`(id `USR-${Date.now().toString(36)}`), `setQty(id, qty)`(1~99로 clamp), `removeItem(id)`, `addToWishlist(goodsId, currency)`(있으면 무시, targetPrice null), `setTarget(goodsId, price|null)`, `removeWish(goodsId)`, `markSubscribed(topic)`(ISO 시각). 다른 탭 동기화(storage 이벤트)는 하지 않는다.
- 지키지 않으면 생기는 문제: 화면마다 localStorage 를 따로 읽어 하이드레이션 불일치와 덮어쓰기가 생긴다.

### C-33 API 클라이언트
- 쓰는 곳: T-07
- 파일 위치: `src/lib/api/client.ts`
- 형식: 코드
- 내용:
```ts
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string> } };
export async function apiFetch<T>(path: string, init: { method: 'GET' | 'POST'; body?: unknown }): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(`${config.api.baseUrl}${path}`, {
      method: init.method, signal: ctrl.signal, credentials: 'omit',
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined });
    const json = (await res.json()) as ApiResult<T>;
    if (typeof json !== 'object' || json === null || typeof (json as { ok?: unknown }).ok !== 'boolean')
      return { ok: false, error: { code: 'INTERNAL', message: 'bad envelope' } };
    return json;
  } catch {
    return { ok: false, error: { code: 'NETWORK', message: 'network' } };
  } finally { clearTimeout(timer); }
}
```
  재시도 없음. 응답 HTTP 상태는 해석하지 않고 봉투만 본다.
- 지키지 않으면 생기는 문제: 화면마다 예외 처리가 달라 에러 문구가 누락된다.

### C-34 구독 흐름
- 쓰는 곳: T-07
- 파일 위치: `src/lib/api/subscribe.ts`, `src/lib/api/gis.ts`
- 형식: 코드
- 내용:
```ts
export function subscribeVisible(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  return config.api.mode === 'live' && config.google.clientId !== '';
}
export type SubscribeInput = { idToken: string; lang: Lang; topic: 'target_price' | 'tracking_request'; consent: boolean;
  watches: { goodsId: string; targetPrice: number; currency: Currency }[]; requests: { name: string; ipName: string; code: string | null }[] };
export async function submitSubscription(i: SubscribeInput): Promise<ApiResult<{ subscriptionId: string; status: 'pending' | 'active' }>> {
  if (!i.consent) return { ok: false, error: { code: 'INVALID_REQUEST', message: 'consent required' } }; // 동의 없이는 전송하지 않는다
  track('subscribe_submit', { topic: i.topic, watch_count: i.watches.length });
  const body = { idToken: i.idToken, locale: i.lang, topics: [i.topic], consentVersion: config.subscribe.consentVersion,
    watches: i.watches, requests: i.requests };
  const res = config.api.mode === 'mock'
    ? await new Promise<ApiResult<{ subscriptionId: string; status: 'pending' }>>((r) => setTimeout(() => r({ ok: true, data: { subscriptionId: 'mock', status: 'pending' } }), 300))
    : await apiFetch<{ subscriptionId: string; status: 'pending' | 'active' }>('/v1/subscriptions', { method: 'POST', body });
  if (res.ok) { markSubscribed(i.topic); track('subscribe_success', { topic: i.topic }); }
  return res;
}
```
  `gis.ts`: `loadGis()` 는 `https://accounts.google.com/gsi/client` 스크립트를 1회만 삽입하고 Promise 를 캐시. `renderGisButton(el, onCredential)` 는 `google.accounts.id.initialize({client_id: config.google.clientId, callback: (r) => onCredential(r.credential)})` 후 `renderButton(el, {theme:'outline', size:'large', text:'continue_with', width:280})`. dev 에서 clientId 가 비어 있으면 GIS 대신 `btn-secondary` "Mock Google" 버튼을 렌더링하고 클릭 시 `onCredential('mock-token')`. watches 는 `targetPrice !== null` 인 위시리스트 항목만.
- 지키지 않으면 생기는 문제: 동의 체크 없이 구독이 전송되거나 mock 상태로 실제 사용자 동의를 받는다.

### C-35 측정
- 쓰는 곳: 이벤트를 보내는 모든 티켓
- 파일 위치: `src/lib/analytics/track.ts`, `src/lib/analytics/consent.ts`
- 형식: 코드
- 내용:
```ts
export type EventName = 'affiliate_click' | 'subscribe_cta_click' | 'subscribe_submit' | 'subscribe_success' | 'share_card_create'
  | 'share_card_share' | 'language_switch' | 'collection_add' | 'wishlist_add' | 'scan_success' | 'scan_miss'
  | 'calculator_use' | 'internal_link_click' | 'guide_cta_click';
type Params = Record<string, string | number | boolean>;
export function track(name: EventName, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) return;
  if (!config.analytics.ga4Id || getConsent() !== 'granted') return;
  const lang = window.location.pathname.split('/')[1] || 'root';
  const screen_id = document.body.dataset.screen ?? 'unknown';
  window.gtag?.('event', name, { ...params, lang, screen_id });
}
// consent.ts
export const getConsent = (): 'granted' | 'denied' | null => {
  const v = window.localStorage.getItem('mipg.consent.v1'); return v === 'granted' || v === 'denied' ? v : null; };
export const setConsent = (v: 'granted' | 'denied') => window.localStorage.setItem('mipg.consent.v1', v);
```
  각 페이지는 `<body data-screen="S-xx">` 대신 `src/components/layout/ScreenMark.tsx`('use client')가 마운트 시 `document.body.dataset.screen = 'S-xx'` 를 설정한다. GA 로드: 동의 수락 시 `https://www.googletagmanager.com/gtag/js?id={ga4Id}` 삽입 + `gtag('config', ga4Id, {anonymize_ip: true})`. 테스트는 `window.gtag` 를 mock 하고 `vi.stubEnv('NODE_ENV','production')` 로 검증.
- 지키지 않으면 생기는 문제: 동의 전 수집이나 개발 환경 이벤트가 GA 에 섞인다.

### C-36 이미지 매니페스트와 플레이스홀더
- 쓰는 곳: T-01, 이미지를 쓰는 모든 티켓
- 파일 위치: `src/lib/data/images.ts`, `src/data/images.manifest.json`, `scripts/gen-placeholders.mjs`
- 형식: 코드 + 텍스트
- 내용:
```ts
import manifest from '@/data/images.manifest.json';
export type ImageId = keyof typeof manifest;
export function getImage(id: ImageId, lang: Lang) {
  const m = manifest[id];
  return { src: m.src, width: m.width, height: m.height, alt: m.alt[lang] };
}
```
  T-01 에서 매니페스트에 IMG-01~IMG-23 을 DESIGN §5 의 경로·크기·alt(ko 그대로, en·ja 직역, 장식은 "")로 작성한다. `scripts/gen-placeholders.mjs`(npm `placeholders`): 매니페스트 23개 + DESIGN §2 파일(아이콘 4종, og-default 3종, og-ip-{slug}-{lang} 전체: `src/data/generated/ips.json` 을 `fs.readFileSync` 로 읽어 goodsCount≥1 IP × 3개 언어)을 대상으로, 파일이 이미 있으면 건너뛴다(`--force` 시 덮어씀). `import { chromium } from '@playwright/test'` 로 브라우저를 띄워 `page.evaluate` 안에서 캔버스(지정 픽셀)를 #E4DFD7 로 채우고 중앙에 `{IMG-ID 또는 파일명}\n{W}×{H}` 를 #5E5A6B, `bold {min(W,H)/10}px sans-serif` 로 그린 뒤 `toDataURL('image/webp' 또는 'image/png', 0.9)` 를 base64 디코드해 쓴다. favicon.ico 는 16·32·48 PNG 3개를 ICO 컨테이너(헤더 6바이트 + 엔트리 16바이트×3 + PNG 바이트)로 묶는다. `logo-symbol.svg`·`logo-symbol-mono.svg` 는 viewBox 0 0 64 64 의 rect(rx 14, #3B2F6B 또는 #FFFFFF) + 4꼭지 별 path(#C2410C 또는 #3B2F6B) 텍스트로 쓴다. chromium 실행 실패 시 `node:zlib` 로 단색 #E4DFD7 PNG(IHDR+IDAT+IEND)를 같은 경로·크기로 쓰고 `[placeholders] fallback png: {경로}` 를 출력하며 PROGRESS.md 가정 절에 기록한다.
- 지키지 않으면 생기는 문제: 이미지 경로가 코드에 흩어져 실제 이미지 교체 시 누락된다.

### C-37 GoodsPlaceholder
- 쓰는 곳: T-05 이후 굿즈 썸네일 전부, T-14 캔버스
- 파일 위치: `src/components/goods/GoodsPlaceholder.tsx`, 도형 정의 `src/lib/data/placeholderShapes.ts`
- 형식: 텍스트
- 내용: 서버 컴포넌트. props `{ ipColor: string; ipInitial: string; type: Goods['type']; size: number; label: string }`. `<svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label}>`: rect 0,0,100,100 rx 12 fill=ipColor → 중앙 아이콘(stroke #FFFFFF, stroke-width 4, fill none, 40×40 영역 x30 y22): figure=원(지름 16) 위 + 둥근 사각형 몸통, plush=큰 원 + 귀 원 2개, badge=원 2개 겹침, card=rx4 직사각형 26×36, kuji=삼각 깃발 + 막대, apparel=티셔츠 외곽선 path, other=별 4꼭지 → 하단 텍스트 ipInitial(IP name.en 첫 글자 대문자, fill #FFFFFF, font-size 16, font-weight 700, x50 y86, text-anchor middle). label = 상품명(현재 언어). 도형 path 문자열은 `placeholderShapes.ts` 에 type 키로 한 번만 정의하고 캔버스(C-41)도 같은 문자열을 `Path2D` 로 쓴다.
- 지키지 않으면 생기는 문제: 화면과 공유 카드의 썸네일 모양이 달라진다.

### C-38 마켓 링크 생성
- 쓰는 곳: T-08, T-13, T-16
- 파일 위치: `src/lib/affiliate/marketLink.ts`
- 형식: 코드
- 내용:
```ts
const SEARCH: Record<Exclude<Market, 'other'>, (q: string) => string> = {
  ebay: (q) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&LH_Sold=1&LH_Complete=1`,
  mercari: (q) => `https://jp.mercari.com/search?keyword=${encodeURIComponent(q)}&status=sold_out`,
  kream: (q) => `https://kream.co.kr/search?keyword=${encodeURIComponent(q)}`,
};
const QUERY = (g: Goods, m: Exclude<Market, 'other'>) => (m === 'ebay' ? g.name.en || g.original : m === 'mercari' ? g.original : g.name.ko);
export function marketUrl(g: Goods, market: Market, sourceUrl: string | null): string | null {
  const base = sourceUrl ?? (market === 'other' ? null : SEARCH[market](QUERY(g, market)));
  if (!base) return null;
  const aff = market === 'other' ? null : config.affiliate[market];
  if (!aff) return base;
  const u = new URL(base); u.searchParams.set(aff.param, aff.value); return u.toString();
}
export const hasAffiliate = (m: Market) => m !== 'other' && config.affiliate[m] !== null;
export const anyAffiliate = () => Object.values(config.affiliate).some((v) => v !== null);
export const MARKET_LABEL: Record<Market, string> = { ebay: 'eBay', mercari: 'Mercari', kream: 'KREAM', other: 'Other' };
```
  링크 속성 고정: `target="_blank" rel="sponsored nofollow noopener"`. 클릭 시 `track('affiliate_click', {goods_id, ip_slug, market, has_affiliate})`.
- 지키지 않으면 생기는 문제: 어필리에이트 파라미터·rel 속성이 화면마다 달라진다.

### C-39 카탈로그 매칭
- 쓰는 곳: T-10, T-11
- 파일 위치: `src/lib/match/match.ts`
- 형식: 코드
- 내용:
```ts
export const norm = (s: string) => s.normalize('NFKC').toLowerCase().replace(/[\s\-_・·]/g, '');
const digits = (s: string) => s.replace(/\D/g, '');
export function matchCode(input: string, goods: Goods[]): Goods | null {
  const q = norm(input); const d = digits(input);
  return goods.find((g) => g.code !== null && (norm(g.code) === q || (d.length >= 6 && digits(g.code) === d))) ?? null;
}
export function search(input: string, cat: Catalog, limit = 48): Goods[] {
  const q = norm(input); if (q === '') return [];
  const byCode = matchCode(input, cat.goods);
  const ipName = (g: Goods) => { const ip = cat.ips.find((i) => i.slug === g.ipSlug)!; return [ip.name.ko, ip.name.en, ip.name.ja, ip.original]; };
  const hits = cat.goods.filter((g) => g !== byCode &&
    [g.name.ko, g.name.en, g.name.ja, g.original, g.code ?? '', ...ipName(g)].some((v) => norm(v).includes(q)));
  return (byCode ? [byCode, ...hits] : hits).slice(0, limit);
}
```
  S-06 스캔 결과는 `matchCode` 만 쓴다(이름 부분일치 없음). S-06 직접 입력 "찾기"는 `matchCode` → null 이면 불일치.
- 지키지 않으면 생기는 문제: 같은 번호가 검색과 스캔에서 다른 결과를 낸다.

### C-40 SVG 차트 좌표
- 쓰는 곳: T-08, T-12
- 파일 위치: `src/lib/chart/scale.ts`, 뷰 `src/components/goods/PriceChart.tsx`(서버), `src/components/collection/ValueChart.tsx`(클라이언트)
- 형식: 코드
- 내용:
```ts
export type Pt = { date: string; value: number };
export function layout(series: Pt[][], ref: number | null, w: number, h: number, pad = { l: 56, r: 48, t: 16, b: 28 }) {
  const all = series.flat(); const vals = all.map((p) => p.value).concat(ref === null ? [] : [ref]);
  const t = all.map((p) => Date.parse(p.date)); const t0 = Math.min(...t); const t1 = Math.max(...t);
  const v0 = Math.min(...vals) * 0.9; const v1 = Math.max(...vals) * 1.1;
  const x = (d: string) => (t1 === t0 ? pad.l + (w - pad.l - pad.r) / 2 : pad.l + ((Date.parse(d) - t0) / (t1 - t0)) * (w - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - v0) / (v1 - v0 || 1)) * (h - pad.t - pad.b);
  const ticks = [0, 1, 2, 3].map((i) => v0 + ((v1 - v0) * i) / 3);
  const path = (s: Pt[]) => s.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  return { x, y, ticks, path };
}
```
  viewBox 는 `0 0 720 280`(PriceChart), 너비 100% 반응형(`preserveAspectRatio="none"` 금지, 기본값 사용). 값은 언어 통화로 환산한 숫자. x축 라벨은 첫·마지막 일자만 `formatDate`. y축 라벨은 ticks 를 `formatMoney`. 툴팁은 각 점에 `<title>` 요소(서버 렌더) + 포커스 가능한 `<g tabIndex={0}>`.
- 지키지 않으면 생기는 문제: 단일 스냅샷·동일 값에서 0 나누기로 NaN 경로가 생긴다.

### C-41 공유 카드 렌더
- 쓰는 곳: T-14
- 파일 위치: `src/lib/share/renderCard.ts`
- 형식: 텍스트
- 내용: `renderCard(canvas, input)` 순서: (1) canvas 1080×1350 (2) `await document.fonts.ready` (3) IMG-23 을 `new Image()` 로 로드 후 전체 그리기, 실패 시 #3B2F6B 채움 (4) DESIGN S-09 캔버스 레이아웃의 상단 제목·등급 (5) 3×3 셀: 셀 순서는 현재 가치 내림차순 상위 9개, 사진이 있으면 `URL.createObjectURL(file)` 이미지를 셀에 cover 크롭(짧은 변 기준 중앙), 없으면 C-37 도형을 ipColor 배경 위에 `Path2D` 로 그림, 하단 띠·상품명(1줄, 셀 폭 초과 시 말줄임 '…')·가치 (6) 하단 총 가치·정가 대비 (7) watermark=true 이면 logo-symbol-mono + `share.madeWith` + `new URL(config.site.url).host` (8) `canvas.toBlob('image/png')` 반환. 공유: `navigator.canShare?.({files:[file]})` 이면 `navigator.share({files:[file], text: share.shareText + '\n' + site.url + '/{lang}/?utm_source=share_card&utm_medium=social'})`, 아니면 `<a download="oshi-vault-shelf.png">` 클릭. 사용한 object URL 은 `URL.revokeObjectURL`.
- 지키지 않으면 생기는 문제: 폰트 로드 전 렌더로 글자가 대체 폰트로 찍힌다.

### C-42 카탈로그 클라이언트 로드와 섹션 상태
- 쓰는 곳: T-01(배지), T-10, T-11, T-12, T-13, T-14
- 파일 위치: `src/lib/data/catalogClient.ts`, `src/components/ui/ClientSection.tsx`
- 형식: 코드
- 내용:
```ts
let cache: Promise<Catalog> | null = null;
export function loadCatalog(): Promise<Catalog> {
  if (!cache) cache = fetch('/data/catalog.json').then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<Catalog>; })
    .catch((e) => { cache = null; throw e; });
  return cache;
}
export function useCatalog(): { status: 'loading' | 'ready' | 'error'; data: Catalog | null; retry: () => void } {
  const [s, set] = useState<{ status: 'loading' | 'ready' | 'error'; data: Catalog | null }>({ status: 'loading', data: null });
  const [n, setN] = useState(0);
  useEffect(() => { let alive = true; set({ status: 'loading', data: null });
    loadCatalog().then((data) => alive && set({ status: 'ready', data })).catch(() => alive && set({ status: 'error', data: null }));
    return () => { alive = false; }; }, [n]);
  return { ...s, retry: () => setN((v) => v + 1) };
}
```
  `ClientSection` props `{ status, skeleton, error, empty, isEmpty, children }`: loading → skeleton, error → error, ready && isEmpty → empty, 그 외 children. 카탈로그 상태와 `useUserData` 상태 중 하나라도 loading 이면 loading, error 면 error 로 합친다.
- 지키지 않으면 생기는 문제: 언마운트 후 setState 경합과 화면별 상태 표시 불일치.

### C-43 SEO 점검 스크립트
- 쓰는 곳: T-01 (`npm run seo:check` = `node scripts/check-seo.mjs`)
- 파일 위치: `scripts/check-seo.mjs`
- 형식: 텍스트
- 내용: `out/seo-manifest.json` 의 entries 마다 `out{path}index.html` 을 읽어 검사: (1) 파일 존재 (2) `<title>` 1개, 비어 있지 않음 (3) canonical href = site.url+path (4) indexable=false 면 `noindex` 메타 존재, true 면 noindex 없음 (5) indexable=true 면 hreflang link 집합 = alternates + x-default (6) `application/ld+json` 블록이 모두 JSON.parse 성공 (7) og:image 경로 파일이 out 에 존재. sitemap: `out/sitemap.xml` 이 3개 하위 sitemap 을 가리키고, 하위 sitemap 의 loc 집합 = indexable=true entries. `out/robots.txt` 에 `Sitemap:` 줄 존재. noindex 경로(S-05~S-09)의 `index.html` 에 noindex 존재. `out/404.html` 존재. 실패는 `[seo] {path} {규칙}` 으로 전부 출력 후 exit 1.
- 지키지 않으면 생기는 문제: 색인 대상 누락이 배포 후에야 발견된다.

### C-44 QA 스크린샷과 정적 서버
- 쓰는 곳: T-01
- 파일 위치: `scripts/serve-out.mjs`, `playwright.config.ts`, `tests/qa/routes.ts`, `tests/qa/screenshots.spec.ts`
- 형식: 텍스트
- 내용: `serve-out.mjs` 는 `node:http` 로 `out/` 을 포트 4173 에 서빙(경로가 `/` 로 끝나면 `index.html`, 없는 파일은 `404.html` 을 상태 404 로, Content-Type 은 확장자 맵 html/js/css/json/png/webp/svg/ico/xml/txt/webmanifest). npm `preview` = `node scripts/serve-out.mjs`. `playwright.config.ts`: `webServer: {command: 'npm run preview', port: 4173, reuseExistingServer: true}`, `use.baseURL: 'http://localhost:4173'`, testDir `tests`, projects `e2e`(testMatch e2e/*.spec.ts), `qa`(testMatch qa/*.spec.ts). `routes.ts`: S-ID별 대표 경로 배열 — S-00 `/`, S-15 `/__missing__/`, S-01~S-16 은 ko·en·ja 각각, S-03 은 goodsCount 최대 IP, S-04 는 시세 있는 첫 굿즈(없으면 첫 굿즈), S-11 은 존재하는 첫 가이드(없으면 생략), S-14 는 생성될 때만. `screenshots.spec.ts` 는 폭 375×812, 768×1024, 1440×900 마다 `fullPage: true` 로 `qa/screenshots/{width}/{S-ID}-{lang}.png` 저장. npm `qa:shots` = `npm run build && playwright test --project=qa`, `e2e` = `npm run build && playwright test --project=e2e`. chromium 설치 실패 시 `qa/MANUAL_CHECKS.md` 에 S-ID×폭 체크리스트를 쓴다.
- 지키지 않으면 생기는 문제: QA 가 같은 경로·폭으로 재현하지 못한다.

### C-45 OG 이미지 합성
- 쓰는 곳: T-20 (`npm run og` = `playwright test --project=og`)
- 파일 위치: `tests/og/gen-og.spec.ts` (playwright.config.ts 에 project `og`, testMatch og/*.spec.ts 추가)
- 형식: 텍스트
- 내용: 대상 = og-default × {ko,en,ja} + og-ip-{slug}-{lang} × (goodsCount≥1 IP × 3). 각 대상마다 viewport 1200×630 페이지에 `page.setContent(html)`: body margin 0, 배경 = `public/images/og/og-base.png` 를 `fs.readFileSync` 로 읽어 `data:image/png;base64,...` URL 로 cover, 좌측 64px 여백에 `public/images/brand/logo-symbol-mono.svg` 를 같은 방식의 `data:image/svg+xml;base64,...` `<img>` 64px(상단 64px), 좌측 하단 64px 여백에 제목(56px/700 #FFFFFF, 최대 2줄, 폭 640px) + 슬로건(28px/400 #D9D4E8). 제목: default 는 사이트명(언어별), ip 는 `ip.hubH1` 메시지(언어별). 폰트는 `<link>` 로 Google Fonts Noto Sans KR/JP·Inter 로드 후 `document.fonts.ready` 대기. `page.screenshot({path: public/images/og/{파일}, type:'png'})`. 기존 파일 덮어씀.
- 지키지 않으면 생기는 문제: OG 이미지가 플레이스홀더로 남는다.

### C-46 언어 선택기 동작
- 쓰는 곳: T-01, T-02
- 파일 위치: `src/components/layout/LanguageSelect.tsx`, `src/components/layout/LangAlternates.tsx`
- 형식: 텍스트
- 내용: 각 page.tsx 는 `<LangAlternates map={{ko:'/ko/..', en:'/en/..', ja:'/ja/..'}} />` 를 렌더링한다. map 에는 **생성된** 언어 페이지 경로만 넣는다(색인 여부 무관). 컴포넌트는 `<script type="application/json" id="lang-alternates">{JSON}</script>` 를 출력. LanguageSelect('use client')는 드롭다운을 열 때 `document.getElementById('lang-alternates')` 를 읽어 대상 언어 경로가 있으면 그 경로, 없거나 파싱 실패면 `/{lang}/` 로 `<a hreflang>` href 를 설정한다. 링크 클릭 시 `track('language_switch', {from_lang, to_lang})`. 쿠키·localStorage 에 언어를 저장하지 않는다. 자동 이동 없음.
- 지키지 않으면 생기는 문제: 번역 없는 가이드에서 언어 전환 시 404 로 간다.
