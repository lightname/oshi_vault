<!-- TICKETS.md -->
실행 순서: T-01 → T-02 → T-03 → T-04 → T-05 → T-06 → T-07 → T-08 → T-09 → T-10 → T-11 → T-12 → T-13 → T-14 → T-15 → T-16 → T-17 → T-18 → T-19 → T-20 (참조하는 티켓은 참조 대상 뒤)
T-01은 공통 레이어다: 의존성 설치·버전 고정, 검증 명령 동작, DB 스키마·마이그레이션, CORE.md 공통 항목 구현, 레이아웃(헤더·푸터·사이트명·파비콘 link), DESIGN.md §3 토큰 적용, 이미지 매니페스트와 전체 플레이스홀더 생성, 테스트 셋업, QA 스크린샷 스크립트, SEO 공통 처리, 다국어 구조(메시지 파일·언어 경로·hreflang), 측정 이벤트 전송 함수, sitemap·robots 생성
T-01이 막히면 전체를 중단한다

공통: 페이지 title·description 문구는 `src/messages/{lang}.json` 의 `meta.{화면}.title`·`meta.{화면}.description` 키로 저장하고 CORE C-27 로 출력한다. noindex 화면의 title 은 "{DESIGN h1 문구} | {사이트명}", description 은 DESIGN 의 lead 문구.

## T-01 공통 레이어
- 프로젝트 생성: Next.js App Router, TypeScript strict, `src/` 디렉터리, 패키지 버전은 AGENTS.md 기술 스택 값으로 `--save-exact` 고정, `.node-version` = `22`. tsconfig `paths: {"@/*": ["src/*"]}`, `resolveJsonModule: true`. ESLint flat config(`eslint.config.mjs`)는 eslint-config-next 만 사용.
- npm 스크립트: `dev`, `build`, `preview`, `data`, `data:check`, `typecheck`(`tsc --noEmit`), `lint`(`eslint .`), `test`(`vitest run`), `e2e`, `qa:shots`, `og`, `placeholders`, `seo:check` — 정의는 CORE C-22·C-30·C-36·C-43·C-44·C-45.
- 데이터: `data/source/mega-ip-goods.xlsx`(설계 단계 제공 파일, 수정 금지)로 CORE C-22 스크립트를 구현·실행해 `src/data/generated/*`, `public/data/catalog.json`, `src/data/slug-lock.json` 을 만들고 커밋한다. 타입은 SPEC.md 데이터 모델 그대로 `src/lib/data/types.ts`. 서버용 조회 함수 `src/lib/data/catalog.ts`: `getIps()`(order 순), `getIp(slug)`, `getGoods()`(id 순), `getGoodsById(id)`, `getGoodsByIp(slug)`, `getPrices(goodsId)`(date 오름차순), `getMeta()`, `goodsPath(lang, g)`.
- CORE 구현: C-21, C-23, C-24, C-25, C-26, C-27, C-28, C-29, C-30, C-31, C-32, C-33, C-35, C-36(매니페스트 IMG-01~23 작성 + `npm run placeholders` 실행), C-37, C-38, C-39, C-40, C-42, C-43, C-44, C-46.
- 토큰: DESIGN §3 전 토큰을 `src/app/globals.css` `@theme`·`:root` 에, 타이포 스케일을 `@utility text-h1~text-small, text-price-xl, text-label` 로, 버튼 4종을 `src/components/ui/Button.tsx`(variant `primary|secondary|text|icon`)로, 아이콘 25종을 `src/components/ui/icons.tsx` 로, 스켈레톤·칩·토스트(DESIGN C-13)·JsonLd·ClientSection 을 `src/components/ui/` 에 만든다.
- 레이아웃: DESIGN C-01 헤더(`[lang]/layout.tsx` 가 `listGuides(lang)` 중 reviewed 문서 수를 `guideCount` props 로 넘기고 0이면 `nav.guides` 미렌더링, G-08 배지 = `useUserData` + `useCatalog` + C-23 `wishReached` 건수, 위시리스트가 비면 카탈로그를 로드하지 않음), C-02 언어 선택기(CORE C-46), C-03 푸터(광고 고지는 C-38 `anyAffiliate()`), C-14 동의 배너(CORE C-35), C-15 저장 고지 컴포넌트. 메시지 키는 DESIGN §4.0 표 전부 + 에러 문구를 3개 언어 파일에 넣는다. `public/manifest.webmanifest` 는 DESIGN §2 값.
- 이벤트: `language_switch`(헤더 선택기).
- 테스트 셋업: `vitest.config.ts`(environment jsdom, `@vitejs/plugin-react`, setup `tests/unit/setup.ts` 에서 jest-dom), 고정 카탈로그 픽스처 `tests/unit/fixtures/catalog.ts`(IP 2개, 굿즈 4개 중 2개 시세 있음, 시세 2개 일자·2개 마켓). C-23·C-24·C-25·C-29·C-32·C-38·C-39·C-40 단위 테스트 분기 100%.
- 이 티켓에서 `src/app/[lang]/page.tsx` 는 h1 만 있는 임시 페이지로 두고 T-09 가 교체한다. 검증 명령 전체가 종료 코드 0.
- 만들지 않는 것: 다른 화면 페이지, 다른 탭 동기화, 서비스 워커.
참조: 디자인 DESIGN.md §2, §3, §4.0 / 성장 GROWTH.md G-01, G-07, G-08, G-09, §5, §6 / 코드 CORE.md C-21~C-46 / 테스트 CONVENTIONS.md 테스트 기준 '순수 로직'

## T-02 S-00 언어 선택
- `src/app/page.tsx` 가 3개 언어 카드를 보여준다. 데이터 없음. 카드 클릭 시 `/{lang}/` 이동, `track('language_switch', {from_lang:'root', to_lang})`. 카드 순서 ko, en, ja 고정.
- `navigator.language` 앞 2글자가 ko·en·ja 중 하나면 그 카드만 강조 + `root.{lang}.suggest` 라벨. 자동 이동·쿠키 저장은 만들지 않는다.
- 문구는 `src/messages/root.json`(DESIGN S-00 표). 이미지 IMG-02(상단 중앙).
- 반응형: <768 카드 1열·IMG-02 240px, ≥768 카드 3열·컨테이너 720px.
- 색인: index. title `Oshi Vault | What your favorite merch is worth now`, description `Compare retail and sold prices of limited Japanese merch. Choose Korean, English, or Japanese.`, canonical `/`, hreflang x-default `/` + ko·en·ja 각 S-01. 구조화 데이터 `websiteLd('en')` + `organizationLd()`.
- 빈·로딩·에러 상태 없음(정적).
참조: 디자인 DESIGN.md S-00 / CTA DESIGN.md §6 S-00 / 성장 GROWTH.md G-07, G-01 / 코드 CORE.md C-26, C-27, C-28, C-46 / 테스트 CONVENTIONS.md 테스트 기준 '랜딩'

## T-03 S-15 404
- `src/app/not-found.tsx` 가 `out/404.html` 로 출력된다. IMG-20 중앙 240px(<768 180px) 아래 ko·en·ja 블록 3개를 세로로 보여준다. 블록마다 h2, 홈 링크(`btn-secondary`, `/{lang}/`), 검색 링크(`btn-text`, `/{lang}/search/`). 문구는 `root.json` `notFound.{lang}`.
- 헤더·푸터·스크립트 없음. noindex, title `Page not found | Oshi Vault`, description 없음.
- `scripts/serve-out.mjs` 가 없는 경로에 이 파일을 상태 404 로 준다(T-01 구현 확인).
- 만들지 않는 것: 언어 자동 판별, 검색 입력란.
참조: 디자인 DESIGN.md S-15 / CTA DESIGN.md §6 S-15 / 코드 CORE.md C-26, C-36, C-44 / 테스트 CONVENTIONS.md 테스트 기준 '정적 정보'

## T-04 S-02 IP 목록
- `/{lang}/ip/` 에서 `getIps()` 중 `ipHubGenerated(ip)` 인 IP 전부(현재 데이터 10개)를 order 순으로 카드 그리드에 보여준다. 카드: 이니셜 배지(IP 색 = CORE C-21), `ip.name[lang]`, `ip.original`, 분류 칩(`ip.category.*`), `ip.goodsCount`. 카드 클릭 → `/{lang}/ip/{slug}/`.
- 헤더 영역: 브레드크럼(홈 › IP별 한정판 굿즈), h1 `ip.listH1`, `ip.listLead`, IMG-04 우측 360px.
- 반응형: <768 1열·IMG-04 숨김, 768~1023 2열, ≥1024 3열. 페이지 번호·더 보기 없음(전부 표시).
- 색인: index. title ko `IP별 한정판 굿즈 | 오시볼트` / en `Limited merch by IP | Oshi Vault` / ja `IP別の限定グッズ | オシボルト`. description ko `{ip1}, {ip2}, {ip3} 등 IP별 한정판 굿즈의 정가와 거래가를 확인하세요.` / en `See retail and sold prices of limited merch by IP, including {ip1}, {ip2}, and {ip3}.` / ja `{ip1}、{ip2}、{ip3}などIP別の限定グッズの定価と取引価格を確認できます。` ({ip1~3} = order 상위 3개 현재 언어 이름). 구조화 데이터 `breadcrumbLd` + `itemListLd`(IP 허브 URL).
- 빈 상태: 생성 IP 0개면 빌드 실패(데이터 오류로 취급).
참조: 디자인 DESIGN.md S-02 / CTA DESIGN.md §6 S-02 / 성장 GROWTH.md G-01 / 코드 CORE.md C-27, C-28, C-29, C-36 / 테스트 CONVENTIONS.md 테스트 기준 '목록'

## T-05 S-03 IP 허브
- `/{lang}/ip/{ipSlug}/` 를 `ipHubGenerated` 인 IP 마다 생성한다. 헤더: 브레드크럼, 이니셜 배지 64px, h1 `ip.hubH1`, 원어명, 권리사, 메시지 1순위(`home.h1` 키), IMG-04 우측 280px(<768 숨김, 768~1023 200px).
- 요약 3칸: `ip.goodsCount`, 시세 있는 굿즈 수, 평균 프리미엄(CORE C-23, `formatPercent`, 0건이면 `—`).
- 굿즈 그리드: `getGoodsByIp(slug)` 전부를 DESIGN C-04 굿즈 카드(`src/components/goods/GoodsCard.tsx`, C-05 `PremiumBadge.tsx` 를 이 티켓에서 만든다)로 표시. 카드 가격: 시세 있으면 `formatLocalMoney(current.jpy)` + 배지, 없으면 `goods.priceCollecting` 칩. 정가는 `goods.retail` + `formatMoney(원통화)`.
- 필터 칩(클라이언트): `ip.filterAll` + 이 IP에 존재하는 품목유형(`type.*`). L2 이상이고 `typePageGenerated` 인 유형은 칩을 S-14 링크로. 정렬 셀렉트 기본 `ip.sortPremium`(시세 없는 굿즈는 뒤, 그 안에서 발매일 내림차순), `ip.sortRelease`(발매일 없는 것 뒤), `ip.sortName`(현재 언어 이름, `localeCompare(lang)`). 필터 결과 0건: IMG-06 160px + `ip.emptyFilter` + `ip.filterAll` 텍스트 버튼.
- 관련 가이드: DESIGN C-11(`src/components/guides/RelatedGuides.tsx`, 이 티켓에서 생성) — `listGuides(lang)` 중 `ipSlugs` 에 이 slug 포함, reviewed 무관, 최대 3개, updated 내림차순. 클릭 시 `track('internal_link_click', {block:'related_guides', target_screen_id:'S-11'})`.
- 반응형: 카드 <768 2열, 768~1023 3열, ≥1024 4열. 칩은 <768 가로 스크롤.
- 색인: `ipHubIndexable`. title ko `{IP} 한정판 굿즈 시세 목록 | 오시볼트` / en `{IP} limited merch prices | Oshi Vault` / ja `{IP} 限定グッズ 相場一覧 | オシボルト`. description ko `{IP} 한정판 굿즈 {n}개의 정가와 마켓 거래가를 비교해요. 기준일 {date}.` / en `Compare retail and sold prices for {n} {IP} limited items. Data as of {date}.` / ja `{IP}の限定グッズ{n}件の定価と取引価格を比べられます。基準日 {date}。`({date} = meta.generatedAt). OG `og-ip-{slug}-{lang}.png`. 구조화 데이터 `breadcrumbLd` + `itemListLd`(굿즈 URL).
참조: 디자인 DESIGN.md S-03 / CTA DESIGN.md §6 S-03 / 성장 GROWTH.md G-01, G-02, KW-03 / 코드 CORE.md C-23, C-24, C-27, C-28, C-29, C-31, C-37 / 테스트 CONVENTIONS.md 테스트 기준 '목록'

## T-06 S-14 IP×품목유형
- `/{lang}/ip/{ipSlug}/{type}/` 는 `typePageGenerated(count)` 가 true 인 (IP, 유형) 조합만 생성한다. `config.seo.indexLevel = 1`(현재)에서는 0개 생성되어야 한다.
- 레이아웃은 T-05 S-03 과 같고 차이만 구현: h1 `ip.typeH1`, lead `ip.typeLead`, 요약·그리드는 해당 유형 굿즈만, 필터 칩은 같은 IP의 생성된 형제 유형 링크(현재 유형 선택 상태) + `ip.filterAll` 칩은 S-03 링크. `{type}` 경로 값은 Goods.type 영문 값.
- 색인: 생성되면 index. title ko `{IP} {유형} 시세 | 오시볼트` / en `{IP} {type} prices | Oshi Vault` / ja `{IP} {種類}の相場 | オシボルト`. description ko `{IP} {유형} {n}개의 정가와 마켓 거래가를 비교해요. 기준일 {date}.` / en `Compare retail and sold prices for {n} {IP} {type}. Data as of {date}.` / ja `{IP}の{種類}{n}件の定価と取引価格を比べられます。基準日 {date}。` OG `og-ip-{slug}-{lang}.png`. 구조화 데이터 `breadcrumbLd`(홈 › IP › 유형) + `itemListLd`.
- 테스트: indexLevel 1·2·3 각각에서 생성 조합 수(픽스처 기준) 검증.
참조: 디자인 DESIGN.md S-14 / CTA DESIGN.md §6 S-14 / 성장 GROWTH.md G-01, KW-04 / 코드 CORE.md C-27, C-28, C-29 / 테스트 CONVENTIONS.md 테스트 기준 '목록'

## T-07 구독 폼 컴포넌트 (DESIGN C-09)
- `src/components/subscribe/SubscribeBox.tsx`('use client'). props `{lang, dict, topic: 'target_price'|'tracking_request', watches, requests}`. `subscribeVisible()` 가 false 면 null 을 반환한다.
- 단계 1: IMG-22, 제목(`subscribe.targetTitle`|`subscribe.trackTitle`), 본문(`subscribe.targetBody`|`subscribe.trackBody`), `btn-secondary`(`cta.secondary`|`subscribe.trackCta`). 클릭 → `track('subscribe_cta_click', {topic})` → 단계 2.
- 단계 2: 동의 체크박스(기본 해제, 라벨 `subscribe.consent` + 개인정보처리방침 링크 `/{lang}/privacy/`), `subscribe.unsubscribe` small, GIS 버튼(CORE C-34 `renderGisButton`). 체크 전 버튼 래퍼 opacity 0.4·pointer-events none + `subscribe.needConsent`. 체크 해제 상태에서 credential 이 와도 `submitSubscription` 이 INVALID_REQUEST 를 반환하고 화면에 `errors.INVALID_REQUEST` 를 보인다.
- 제출: SPEC.md API 계약의 `POST /v1/subscriptions` 행을 따른다(CORE C-34 `submitSubscription`). 전송 중 스피너 + `subscribe.sending`. 성공 → `subscribe.success` + `subscribe.successNote`, 버튼 영역 숨김. 실패 → `errors.{code}` + `subscribe.retry`(단계 2 초기화, 체크 상태 유지).
- 이미 `prefs.subscribed[topic]` 이 있으면 단계 1 대신 `subscribe.success` 한 줄만 보인다.
- 반응형: <768 IMG-22 64px 상단·내용 아래, ≥768 IMG-22 96px 좌측.
- 이벤트: `subscribe_cta_click`, `subscribe_submit`, `subscribe_success`.
- 테스트: 동의 미체크 제출 거부 / mock 성공 / NETWORK·UNAUTHORIZED 응답 문구 / production + mock 에서 null.
참조: 디자인 DESIGN.md §4.0 C-09 / 성장 GROWTH.md G-06 / 코드 CORE.md C-32, C-33, C-34, C-35, C-36 / 테스트 CONVENTIONS.md 테스트 기준 '폼'

## T-08 S-04 굿즈 상세
- `/{lang}/goods/{id}-{slug}/` 를 모든 굿즈 × 3개 언어로 생성(slug 없으면 `/{id}/`). 데이터: `getGoodsById`, `getIp`, `getPrices(goodsId)` 전부, `getMeta()`.
- 개요: 브레드크럼(홈 › IP › 상품명), GoodsPlaceholder(1:1), IP 링크, 한정구분 칩(`limit.*`, CT-03 가이드가 현재 언어에 있으면 `/{lang}/guides/limited-edition-types/` 링크), h1 `name[lang]`(비면 original), 원어명, 메타 표: `goods.code`(code 없으면 행 생략), `goods.maker`(null 생략), `goods.type`, `goods.release`(`formatDate`, null 생략), `goods.retailPrice`(`formatMoney(원통화)` + 원통화가 언어 통화와 다르면 괄호 안 `formatLocalMoney`), `goods.seller` + `status.*` 칩 + `goods.officialLink`(외부), `goods.verified`. 비고 `note[lang]` 이 있으면 표 아래 small.
- 담기: `goods.addShelf` → `addToCollection` + 토스트 `toast.addedShelf`(보기 → S-07) + `track('collection_add', {method:'search', goods_id})`. `goods.addWish` → `addToWishlist(id, localeCurrency)` + 인라인 목표가 패널 + 토스트 `toast.addedWish` + `track('wishlist_add', {goods_id})`. 목표가 입력: 숫자, 0 초과·10,000,000 이하·소수 둘째 자리까지, 실패 시 `errors.INVALID_REQUEST`, 저장 `setTarget`. 하이드레이션 전 두 버튼 disabled.
- 시세 블록(시세 있음): `goods.priceTitle`, `formatLocalMoney(current.jpy)` price-xl, 원통화 대표 마켓 중앙값 small, PremiumBadge + `goods.vsRetail`, DESIGN C-06 신뢰 줄(대표 마켓 = 거래 건수 최다), stale 이면 C-07, `trust.howToRead`(CT-05 가 현재 언어에 있으면 그 가이드, 없으면 S-12). DESIGN C-08 마켓 버튼(`src/components/goods/MarketButtons.tsx`): 최신 일자 마켓별, CORE C-38 `marketUrl`, 클릭 `affiliate_click`. `cta.leaveNote` + 광고 고지(해당 시).
- 시세 블록(시세 없음): IMG-05, `goods.collectingTitle`, `goods.collectingBody`, `cta.searchMarket` 버튼 3개(eBay·Mercari·KREAM, `btn-secondary`), SubscribeBox(topic `tracking_request`, requests `[{name:name[lang]||original, ipName: ip.name.ko, code}]`), 관련 굿즈 블록을 이 아래로.
- 차트·표(시세 있음): `PriceChart`(CORE C-40, 마켓별 시리즈, 정가 기준선), 거래 기록 표(최신순 20행, 열 = DESIGN `goods.col*`, 환산 = `formatLocalMoney`, 원문 = 외부 링크 또는 `—`), `goods.fxNote`.
- 하단: SubscribeBox(시세 있음 → `target_price`, watches = 현재 굿즈 목표가가 있으면 1건), DESIGN C-10 관련 굿즈(`RelatedGoods.tsx`, 같은 IP 최대 6개, 시세 있는 굿즈 먼저 → 발매일 내림차순), C-11 관련 가이드(T-05 컴포넌트). 관련 블록 클릭 `internal_link_click`.
- 모바일 고정 바(<768, 시세 있음): DESIGN §6 S-04 재노출 규칙. IntersectionObserver 로 시세 카드 하단 감지.
- 색인: `goodsIndexable(g, lang)`. title ko `{상품명} 시세·정가 비교 | 오시볼트` / en `{name} price vs. retail | Oshi Vault` / ja `{商品名} 相場・定価 | オシボルト`. description(시세 있음) ko `{상품명} 정가 {retail}, 중간 거래가 {median}({premium}). 마켓별 거래 건수와 기준일을 확인하세요.` / en `{name}: retail {retail}, median sold {median} ({premium}). See sale counts and dates by market.` / ja `{商品名}の定価{retail}、取引価格の中央値{median}({premium})。マーケット別の件数と基準日を確認できます。` (시세 없음) ko `{상품명} 정가 {retail}. {IP} {한정구분} 굿즈의 판매처와 시세 수집 현황을 확인하세요.` / en `{name}: retail {retail}. Seller details and price tracking status for this {IP} {limit} item.` / ja `{商品名}の定価{retail}。{IP}の{限定区分}グッズの販売元と相場収集状況を確認できます。` 구조화 데이터 `productLd` + `breadcrumbLd`. OG `og-ip-{ipSlug}-{lang}.png`.
참조: 디자인 DESIGN.md S-04 / CTA DESIGN.md §6 S-04 / 성장 GROWTH.md G-01, G-02, G-06, G-09, KW-02 / 코드 CORE.md C-23, C-24, C-27, C-28, C-29, C-32, C-35, C-37, C-38, C-40 / 테스트 CONVENTIONS.md 테스트 기준 '상세', '폼'

## T-09 S-01 홈
- `src/app/[lang]/page.tsx` 의 T-01 임시 내용을 교체한다. 섹션 순서와 문구는 DESIGN S-01.
- 히어로: `home.eyebrow`, h1 `home.h1`, `home.lead`, 검색 폼(GET 이동 `/{lang}/search/?q={입력}`, 빈 입력 제출 시 이동하지 않음), 예시 칩 3개 = 시세 있는 굿즈 프리미엄 내림차순 상위 3개(0개면 칩 영역 미렌더링). IMG-01(priority).
- 프리미엄 섹션: 시세 있는 굿즈 프리미엄 내림차순 8개(T-05 GoodsCard), 부제 `home.premiumSub`({date}=meta.generatedAt). 시세 있는 굿즈 4개 미만이면 제목 `home.recentTitle` + firstCollectedAt 내림차순 → id 오름차순 8개. 하단 `home.allIp` → S-02.
- 진열장 섹션: IMG-07, `home.shelfTitle`, `home.shelfBody`, `cta.scan`(→ S-06, `btn-secondary`), 저장 고지.
- IP 섹션: `ipHubGenerated` IP 전부 칩(이름 + goodsCount) → S-03.
- 목표가 섹션: `home.wishTitle`, `home.wishBody`, IMG-09(<768 숨김), `home.toWishlist` → S-08.
- 계산 방식 섹션: `home.howTitle` + 카드 3개(`home.how1~3Title/Body`), `trust.howToRead`(CT-05 있으면 가이드, 없으면 S-12).
- 가이드 섹션: `listGuides(lang)` 상위 3개(DESIGN C-11 형태), 0개면 섹션 미렌더링.
- 반응형: DESIGN S-01 반응형 줄 그대로(<768 히어로 1열·버튼 입력 밖 전체 폭, 768 1열, ≥1024 2열).
- 색인: index. title ko `오시볼트 | 내 최애 굿즈의 지금 가치` / en `Oshi Vault | What your favorite merch is worth now` / ja `オシボルト | 推しグッズの、いまの価値`. description ko `한정판 굿즈 시세를 정가와 비교해요. 마켓별 중간 거래가와 거래 건수, 기준일을 함께 보여드려요.` / en `Compare limited merch prices with retail. See median sold prices, sale counts, and data dates by market.` / ja `限定グッズの相場を定価と比べられます。マーケット別の中央値・件数・基準日をまとめて表示します。` 구조화 데이터 `websiteLd(lang)` + `organizationLd()`. OG `og-default-{lang}.png`.
- 테스트: 섹션 렌더 / 검색 폼 이동 경로 / 시세 0건 시 제목 대체 / 가이드 0건 시 섹션 숨김.
참조: 디자인 DESIGN.md S-01 / CTA DESIGN.md §6 S-01 / 성장 GROWTH.md G-01, KW-01 / 코드 CORE.md C-23, C-27, C-28, C-31, C-36 / 테스트 CONVENTIONS.md 테스트 기준 '랜딩'

## T-10 S-05 검색
- `/{lang}/search/`('use client' 섹션). 데이터: SPEC.md API 계약의 `GET /data/catalog.json` 행(CORE C-42 `useCatalog`, 1회 전체). 매칭은 CORE C-39 `search`, 최대 48개, 순서 = 코드 완전일치 1건 → 이름 일치(카탈로그 id 순).
- 입력: 자동 포커스, URL `?q=` 초기값, 200ms 디바운스, `history.replaceState` 로 `?q=` 동기화. 결과 수 `search.count`. 결과 = T-05 GoodsCard(카드 클릭 → S-04). 더 보기·페이지 번호는 만들지 않는다.
- 쿼리 없음: `search.browseIp` + IP 칩(T-09 와 동일 형태).
- 로딩: GoodsCard 모양 스켈레톤 8개. 빈 결과: IMG-06 200px + `search.emptyTitle` + `search.emptyBody` + `search.manualAdd`(→ `/{lang}/scan/?manual=1&name={q}`). 에러: `search.loadError` + `search.reload`(retry).
- 반응형: 그리드 <768 2열, 768~1023 3열, ≥1024 4열.
- 색인: noindex. title `{search.h1} | {사이트명}`, description `home.lead`.
참조: 디자인 DESIGN.md S-05 / CTA DESIGN.md §6 S-05 / 코드 CORE.md C-39, C-42 / 테스트 CONVENTIONS.md 테스트 기준 '목록'

## T-11 S-06 스캔·직접 등록
- `/{lang}/scan/`. 데이터: SPEC.md API 계약의 `GET /data/catalog.json` 행(`useCatalog`). 저장은 `useUserData` 변경 함수.
- 카메라: `scan.start` 클릭 시에만 `@zxing/browser` 를 동적 import, `BrowserMultiFormatReader` 로 EAN-13·EAN-8·UPC-A·CODE-128, 후면 카메라(`facingMode: 'environment'`). 시작 전·권한 거부·미지원 시 IMG-07 + 해당 문구(`scan.permDenied`|`scan.unsupported`) + 직접 입력란 자동 포커스. 스캔 성공 시 카메라 정지, 프레임 테두리 success 300ms, `navigator.vibrate?.(50)`, 결과로 스크롤.
- 직접 입력 "찾기": 공백 제거 후 1자 이상, 실패 시 `scan.required`. CORE C-39 `matchCode` 로 판정.
- 일치: `scan.matchTitle` + 가로형 GoodsCard + 수량 스테퍼(1~99) + `goods.addShelf`(`btn-primary`) → `addToCollection` 을 수량만큼(이미 있으면 qty 합산, 99 상한) + 토스트 + `track('scan_success', {format})`(직접 입력은 format `manual`) + `track('collection_add', {method:'scan', goods_id})`.
- 불일치: `track('scan_miss', {format})`, `scan.missTitle` + 직접 등록 폼. `?manual=1&name=` 으로 진입하면 폼을 바로 열고 상품명을 채운다.
- 직접 등록 폼 필드와 검증(실패 문구):
  - 상품명 `scan.fieldName`: 필수, trim 후 1~120자 (`scan.required`, 초과 시 `errors.INVALID_REQUEST`)
  - IP `scan.fieldIp`: 필수 셀렉트, 옵션 = `ipHubGenerated` IP 의 현재 언어 이름 + `scan.ipOther`(`scan.required`)
  - 정가 `scan.fieldPrice`: 필수, 숫자, 0 초과 10,000,000 이하 (`scan.required` / `errors.INVALID_REQUEST`)
  - 통화 `scan.fieldCurrency`: 필수, JPY·KRW·USD, 기본값 = 언어 통화
  - 발매일 `scan.fieldRelease`: 선택, `<input type="date">`, 오늘 이후 허용
  - 바코드 번호 `scan.fieldCode`: 선택, 스캔값 미리 채움, 1~40자
  - 검증은 제출 시 전체 수행, 첫 오류 필드로 포커스.
- 제출 `scan.saveManual` → `addManual({name, ipName, price, currency, releaseDate?, code?}, qty 1)` + 토스트 + `track('collection_add', {method:'manual'})`, 폼 초기화. 폼 아래 `scan.manualNote`.
- 폼 아래 SubscribeBox(topic `tracking_request`, requests `[{name, ipName, code|null}]` = 마지막 입력값, 입력 전이면 빈 배열).
- 로딩(스캐너 로드): 카메라 영역 스피너 32px. 카탈로그 로드 에러: 직접 입력 아래 `search.loadError` + `search.reload`.
- 반응형: <768·768~1023 1열(카메라 → 직접 입력 → 결과), 폼 <768 1열·≥768 2열. ≥1024 카메라 7열 + 직접 입력 5열.
- 색인: noindex. title `{scan.h1} | {사이트명}`, description `scan.lead`.
- 테스트: 필드별 검증 실패 1건씩 / 정상 등록 후 저장 확인 / 일치·불일치 분기 / 동일 굿즈 재등록 qty 합산.
참조: 디자인 DESIGN.md S-06 / CTA DESIGN.md §6 S-06 / 성장 GROWTH.md G-04, G-06 / 코드 CORE.md C-32, C-35, C-39, C-42 / 테스트 CONVENTIONS.md 테스트 기준 '폼'

## T-12 S-07 내 진열장
- `/{lang}/collection/`. 데이터: `useUserData`(collection) + `GET /data/catalog.json`(SPEC.md API 계약 행). 상태 합성은 CORE C-42.
- 요약: `col.total` = Σ `itemValueJPY` → `formatLocalMoney`, `col.retailTotal` = Σ 정가 환산 × qty, 정가 대비 = (총가치 − 정가 합계) ÷ 정가 합계 → PremiumBadge, `col.items`(qty 합계 아님, 항목 수), `col.asOf`({date}=meta.generatedAt). 항목 ≥3 → `col.share`(`btn-primary`, S-09), 1~2 → `cta.scan`(`btn-secondary`).
- 추이: CORE C-23 `collectionHistory` 일자 ≥2 일 때만 `ValueChart`(CORE C-40, 선 1개 + 정가 합계 점선).
- 목록: 정렬 기본 `col.sortValue`(항목 가치 내림차순), `col.sortPremium`(시세 없는 항목 뒤), `col.sortAdded`(addedAt 내림차순). 행: GoodsPlaceholder 64px(직접 등록은 IP 셀렉트 값의 IP 색, 기타는 `--color-text-muted`), 이름(카탈로그 굿즈는 S-04 링크), `col.manualTag`, 가치 또는 정가+`goods.priceCollecting`, 배지, 수량 스테퍼(1~99, `setQty`), 삭제 → 인라인 확인(`col.removeConfirm`·`col.remove`·`col.cancel`) → `removeItem`. 카탈로그에서 사라진 goodsId 항목은 이름 `goodsId` 로 표시하고 가치 0.
- 로딩: 요약 카드 스켈레톤 + 행 스켈레톤 4개. 빈: IMG-08 240px + `col.emptyTitle` + `col.emptyBody` + `cta.scan`(`btn-primary`) + `col.emptySearch`. 에러(손상 데이터 또는 카탈로그 실패): `col.loadError` + `col.reset`(확인 `confirm()` 없이 인라인 2단계: 첫 클릭 시 버튼 문구 `col.removeConfirm`, 두 번째 클릭 `reset()`; 카탈로그 실패면 `search.reload`).
- 반응형: <768 요약 1열·행 2줄, 768~1023 요약 + 버튼 아래, ≥1024 버튼 우측.
- 색인: noindex. title `{col.h1} | {사이트명}`, description `col.emptyBody`.
- 테스트: 추가·삭제·수량 변경 후 새로고침 유지 / 빈 상태 / 손상 JSON 에러 상태 / 총 가치 계산(픽스처).
참조: 디자인 DESIGN.md S-07 / CTA DESIGN.md §6 S-07 / 성장 GROWTH.md G-04, G-05 / 코드 CORE.md C-23, C-24, C-32, C-37, C-40, C-42 / 테스트 CONVENTIONS.md 테스트 기준 '로컬 데이터 화면'

## T-13 S-08 위시리스트
- `/{lang}/wishlist/`. 데이터: `useUserData`(wishlist) + `GET /data/catalog.json`(SPEC.md API 계약 행).
- 도달 섹션(1건 이상): `wishReached` 인 항목, 배경 #E8F3EC 는 DESIGN C-05 양수 배지 배경과 같은 값. 카드: 썸네일 80px, 이름(S-04 링크), `wish.current` + `formatMoney(fromJPY(cur.jpy, w.currency), w.currency)`, `wish.target`, `wish.below`, T-08 MarketButtons. 첫 카드의 첫 버튼만 `btn-primary`(나머지 카드는 전부 `btn-secondary`). 클릭 `affiliate_click`.
- 전체 목록: addedAt 내림차순. 행: 썸네일 64px, 이름, 현재 시세(없으면 `goods.priceCollecting`), 목표가 입력(120px, 숫자, 0 초과 10,000,000 이하, 빈 값 = null, blur 시 `setTarget`, 실패 시 테두리 danger + `errors.INVALID_REQUEST`, 성공 시 테두리 success 600ms), 통화 표시, `wish.gap`(도달 전) 또는 `wish.noTarget`(null), 삭제 `btn-icon` → `removeWish`(확인 없음).
- 하단 SubscribeBox(topic `target_price`, watches = targetPrice 가 있는 위시리스트 전부).
- 로딩: 행 스켈레톤 4개. 빈: IMG-09 240px + `wish.emptyTitle` + `wish.emptyBody` + `wish.emptyCta`(→ S-02). 에러: `col.loadError` + `col.reset`(T-12 와 동일 2단계).
- 반응형: <768 도달 카드 1열·행 2줄, ≥768 도달 카드 2열, ≥1024 행 1줄.
- 색인: noindex. title `{wish.h1} | {사이트명}`, description `wish.lead`.
- 이벤트: `affiliate_click`.
- 테스트: 목표가 입력 검증 실패 1건 / 저장 후 유지 / 도달 판정 이동 / 빈 상태.
참조: 디자인 DESIGN.md S-08 / CTA DESIGN.md §6 S-08 / 성장 GROWTH.md G-06, G-08 / 코드 CORE.md C-23, C-24, C-32, C-38, C-42 / 테스트 CONVENTIONS.md 테스트 기준 '로컬 데이터 화면'

## T-14 S-09 공유 카드
- `/{lang}/share/`. 데이터: `useUserData` + `GET /data/catalog.json`(SPEC.md API 계약 행).
- 헤더: `share.h1`, `share.lead`, IMG-10(<768 숨김). 설정: `share.gradeLabel` + `grade.{id}`(CORE C-23 등급), `share.nextGrade`(최고 등급이면 미표시), `share.topItems` 목록 = 가치 내림차순 상위 9개, 행마다 `share.addPhoto`(`<input type="file" accept="image/*">`, 10MB 초과 파일은 무시하고 `errors.INVALID_REQUEST`), 사진 제거 `btn-icon`. `share.watermark` 체크박스(기본 `config.share.watermarkDefault`). `share.photoNote`.
- 미리보기: CORE C-41 `renderCard` 결과를 `<img>` 로 4:5 표시, 설정 변경 시 150ms 디바운스 재렌더. 버튼: 생성 전 `share.create`(`btn-primary`) → `track('share_card_create', {item_count, watermark})`; 생성 후 `share.share`(Web Share 가능 시 `btn-primary`) + `share.download`(`btn-secondary`), 불가 시 `share.download` 만 `btn-primary`. 공유·저장 클릭 `track('share_card_share', {method:'share'|'download'})`.
- 로딩: 미리보기 자리 4:5 스켈레톤 + 스피너. 빈(진열장 0개): IMG-08 + `share.emptyTitle` + `share.emptyBody` + `cta.scan`. 에러(렌더 실패): `share.error` + `share.retry`.
- 반응형: <768·768~1023 1열(미리보기 max 420px 중앙), ≥1024 2열(미리보기 5열·설정 7열).
- 만들지 않는 것: 공유 링크 페이지, SNS별 버튼, 사진 저장.
- 색인: noindex. title `{share.h1} | {사이트명}`, description `share.lead`.
참조: 디자인 DESIGN.md S-09 / CTA DESIGN.md §6 S-09 / 성장 GROWTH.md G-05 / 코드 CORE.md C-23, C-32, C-35, C-37, C-41, C-42 / 테스트 CONVENTIONS.md 테스트 기준 '로컬 데이터 화면'

## T-15 S-10 가이드 목록
- `/{lang}/guides/` 를 3개 언어 모두 생성한다. 데이터: CORE C-31 `listGuides(lang)` 전부(updated 내림차순).
- 헤더: 브레드크럼, `guides.h1`, `guides.lead`, IMG-11 320px(<768 숨김). 카드: 커버(`coverImageId(slug)`, 16:9 cover), 제목, 설명 3줄 말줄임, `guides.updated`(`formatDate`). 클릭 → S-11. 페이지 번호 없음.
- 빈(문서 0개): IMG-11 240px + `guides.emptyTitle` + `guides.emptyCta`(→ S-02).
- 색인: `guidesListIndexable(reviewed 문서 수)`. false 면 noindex + sitemap 제외(C-30), 헤더 `nav.guides` 미표시(T-01 헤더가 `listGuides` 결과 길이를 props 로 받음).
- title ko `수집 가이드 | 오시볼트` / en `Collector guides | Oshi Vault` / ja `コレクターガイド | オシボルト`. description ko `한정판 굿즈 시세 확인, 바코드 찾기, 한정판 유형 구분법을 정리한 가이드예요.` / en `Guides on checking limited merch prices, finding barcodes, and reading limited edition labels.` / ja `限定グッズの相場の調べ方、バーコードの場所、限定の種類をまとめたガイドです。` 구조화 데이터 `breadcrumbLd` + `itemListLd`.
- 반응형: <768 1열, 768~1023 2열, ≥1024 3열.
- 테스트: 문서 0개 → noindex + 빈 상태 / reviewed false 문서만 있을 때 noindex.
참조: 디자인 DESIGN.md S-10 / CTA DESIGN.md §6 S-10 / 성장 GROWTH.md G-03, CT-01, CT-02, CT-03, CT-04, CT-05 / 코드 CORE.md C-27, C-28, C-29, C-30, C-31, C-36 / 테스트 CONVENTIONS.md 테스트 기준 '목록'

## T-16 S-11 가이드 상세
- `/{lang}/guides/{slug}/` 는 `content/{lang}/guides/{slug}.md` 가 있는 (언어, slug)만 생성한다. 본문은 작성하지 않는다(파일이 없으면 페이지 없음).
- 상단: 브레드크럼(홈 › 가이드 › 제목), h1 = frontmatter.title, `guides.updated`, 커버(`coverImageId`). 본문 HTML(C-31) 폭 720px, ≥1024 우측 목차(toc, sticky top 88px, 현재 섹션 표시), <1024 본문 위 접힘 목차(`guide.toc`).
- 슬롯 A: 두 번째 `<h2>` 의 다음 `<h2>` 직전(h2 가 2개 이하면 본문 끝)에 ipSlugs 굿즈 중 시세 있는 굿즈 프리미엄 내림차순 2개 → 가로형 GoodsCard + MarketButtons(첫 마켓 1개). 0개면 미렌더링. 본문 HTML 은 toc id(`s-2`, `s-3`) 기준으로 분할해 삽입한다.
- 슬롯 B(본문 끝, frontmatter.endCta): `primary` = 슬롯 A와 같은 카드 / `secondary` = SubscribeBox(topic `target_price`, watches = 위시리스트 중 목표가 있는 항목) / `scan` = IMG-07 120px + `scan.lead` + `cta.scan`(`btn-primary`) / `shelf` = IMG-08 120px + `home.shelfBody` + `col.emptySearch`(`btn-secondary`). 슬롯 클릭 `track('guide_cta_click', {guide_slug, cta})`.
- 어필리에이트 ID 가 하나라도 있으면 슬롯 A·B 위에 `footer.affiliate` small.
- 하단: `guide.relatedGoods`(ipSlugs[0] 굿즈 최대 4개, T-08 RelatedGoods), `guide.relatedIps` 칩(ipSlugs 의 S-03), RelatedGuides(현재 문서 제외).
- 색인: `guideIndexable(reviewed)`. title `{frontmatter.title} | {사이트명}`, description = frontmatter.description(길이 규칙 위반 시 빌드 경고 `[content] description length`). alternates = `guideLangs(slug)` 중 reviewed 인 언어. 구조화 데이터 `articleLd` + `breadcrumbLd`. OG `og-default-{lang}.png`. LangAlternates = `guideLangs(slug)`.
- 반응형: <1024 접힘 목차·본문 16/28, ≥1024 2열.
- 이벤트: `guide_cta_click`, `affiliate_click`, `internal_link_click`.
- 테스트: 테스트용 픽스처 md(`tests/unit/fixtures/content/`)로 정상 렌더 / reviewed false noindex / endCta 4종 분기 / 없는 slug 미생성.
참조: 디자인 DESIGN.md S-11 / CTA DESIGN.md §6 S-11 / 성장 GROWTH.md G-02, G-03, G-06, CT-01, CT-02, CT-03, CT-04, CT-05, KW-06, KW-07, KW-08, KW-09, KW-10 / 코드 CORE.md C-27, C-28, C-29, C-31, C-34, C-38, C-46 / 테스트 CONVENTIONS.md 테스트 기준 '상세'

## T-17 S-12 데이터 출처와 계산 방법
- `/{lang}/about/` 정적 페이지. 섹션 순서와 문구는 DESIGN S-12 표(`about.*`). 치환값: `{markets}` = 시세 데이터에 등장한 마켓의 `MARKET_LABEL` 을 쉼표로(0건이면 `eBay, Mercari, KREAM`), `{date}` = `config.fx.baseDate`(`formatDate`), `{n}` = 굿즈 수, `{days}` = `config.price.staleDays`. 비공식 고지 = `footer.unofficial` + 해당 시 `footer.affiliate`. IMG-18.
- 색인: index. title ko `데이터 출처와 계산 방법 | 오시볼트` / en `Data sources and methods | Oshi Vault` / ja `データ出典と計算方法 | オシボルト`. description ko `오시볼트의 정가·거래가 출처, 프리미엄 계산식, 갱신 주기와 한계를 공개해요.` / en `Where Oshi Vault's retail and sold prices come from, how premiums are calculated, and update limits.` / ja `オシボルトの定価・取引価格の出典、プレ値の計算式、更新頻度と制限事項を公開します。` 구조화 데이터 `breadcrumbLd`.
- 반응형: <1024 헤더 1열(IMG-18 max 280px 아래), ≥1024 2열.
참조: 디자인 DESIGN.md S-12 / CTA DESIGN.md §6 S-12 / 성장 GROWTH.md G-09 / 코드 CORE.md C-24, C-27, C-28, C-38 / 테스트 CONVENTIONS.md 테스트 기준 '정적 정보'

## T-18 S-13 개인정보처리방침·이용약관
- `/{lang}/privacy/`, `/{lang}/terms/` 는 `content/{lang}/legal/{privacy,terms}.md` 가 있을 때만 생성한다(CORE C-31 `readLegal`). 본문은 작성하지 않는다. 이 티켓에서 각 언어 2개 파일을 frontmatter 만 있고 본문이 `.` 한 줄인 상태로 만들고 `reviewed: false` 로 둔다.
- 상단 탭 2개(`legal.privacy`, `legal.terms`), h1 = frontmatter.title, `legal.effective`, IMG-19 160px(<768 숨김). 본문은 T-16 본문 스타일(목차 없음).
- 색인: reviewed true 일 때 index, false 면 noindex + sitemap 제외. title ko `개인정보처리방침 | 오시볼트`·`이용약관 | 오시볼트` / en `Privacy policy | Oshi Vault`·`Terms of use | Oshi Vault` / ja `プライバシーポリシー | オシボルト`·`利用規約 | オシボルト`. description ko `오시볼트의 개인정보 처리와 이메일 구독 정보 관리 방식을 안내해요.`·`오시볼트 서비스 이용 조건과 데이터 이용 범위를 안내해요.` / en `How Oshi Vault handles personal data and email subscription information.`·`Terms and data usage scope for using Oshi Vault.` / ja `オシボルトの個人情報とメール購読情報の取り扱いについて案内します。`·`オシボルトの利用条件とデータ利用範囲について案内します。`
참조: 디자인 DESIGN.md S-13 / CTA DESIGN.md §6 S-13 / 성장 GROWTH.md G-06 / 코드 CORE.md C-27, C-29, C-31 / 테스트 CONVENTIONS.md 테스트 기준 '정적 정보'

## T-19 S-16 프리미엄 계산기
- `/{lang}/tools/premium-calculator/`. 헤더·설명은 정적 HTML(SSG), 계산 카드만 'use client'.
- 입력: 정가 `calc.retail`(숫자) + 통화(JPY·KRW·USD, 기본 언어 통화), 거래가 `calc.sold`(숫자) + 통화(기본 언어 통화). 검증: 각 값 0 초과 10,000,000,000 이하, 실패 시 필드 테두리 danger + `calc.invalid`, 결과 카드는 `calc.placeholder`.
- 결과(두 값 유효 시 즉시): 프리미엄 = (거래가 JPY − 정가 JPY) ÷ 정가 JPY → `formatPercent` price-xl(배지 색 규칙), `calc.diff` = 차액 → 언어 통화 `formatMoney`, `calc.ratio`({x} = `formatRatio`), `goods.fxNote`({date}=fx.baseDate). 첫 유효 결과 표시 시 1회 `track('calculator_use', {from_currency, to_currency})`.
- 결과 아래: `calc.findGoods`(`btn-secondary`, → S-05), `cta.scan`(`btn-text`, → S-06). 설명 섹션: `calc.howTitle`, `about.methodBody2`, `calc.howBody`, `trust.howToRead`(CT-05 있으면 가이드, 없으면 S-12).
- 반응형: <1024 1열(IMG-21 숨김), ≥1024 2열(입력 6열·결과 6열).
- 색인: index. title ko `정가 대비 프리미엄 계산기 | 오시볼트` / en `Resale premium calculator | Oshi Vault` / ja `プレ値計算ツール | オシボルト`. description ko `정가와 거래가를 넣으면 리셀 프리미엄과 차액을 엔·원·달러로 계산해요.` / en `Enter retail and sold prices to calculate the resale premium and difference in yen, won, or dollars.` / ja `定価と取引価格を入れるとプレ値率と差額を円・ウォン・ドルで計算します。` 구조화 데이터 `webAppLd` + `breadcrumbLd`.
- 테스트: 필드별 검증 실패 1건씩 / 통화 다른 두 값 계산 / 이벤트 1회만 발생.
참조: 디자인 DESIGN.md S-16 / CTA DESIGN.md §6 S-16 / 성장 GROWTH.md G-04, KW-05 / 코드 CORE.md C-23, C-24, C-27, C-28, C-35 / 테스트 CONVENTIONS.md 테스트 기준 '폼'

## T-20 OG 이미지 합성
- CORE C-45 `tests/og/gen-og.spec.ts` 와 playwright project `og` 를 구현하고 `npm run og` 를 실행해 `public/images/og/og-default-{ko,en,ja}.png` 와 goodsCount≥1 IP × 3개 언어의 `og-ip-{slug}-{lang}.png` 를 덮어쓴다. 제목 = 사이트명(default) 또는 `ip.hubH1`(ip), 부제 = 슬로건(DESIGN §2).
- 생성된 파일 크기가 정확히 1200×630 인지 PNG 헤더로 검사하는 단위 테스트 `tests/unit/og/size.test.ts`.
- 만들지 않는 것: 굿즈별 OG, 가이드별 OG, 빌드 시 자동 실행(`npm run og` 는 수동 실행 명령으로만 둔다).
- chromium 실행 실패 시 이 티켓은 막힘 프로토콜(AGENTS.md)을 따른다. 플레이스홀더 OG 는 그대로 둔다.
참조: 디자인 DESIGN.md §2 / 성장 GROWTH.md G-01 / 코드 CORE.md C-36, C-45 / 테스트 CONVENTIONS.md 테스트 기준 '정적 정보'