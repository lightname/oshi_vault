<!-- CONVENTIONS.md -->
# CONVENTIONS.md

## 폴더 구조
이 구조를 벗어나는 배치 금지. 새 최상위 폴더 금지.
```
src/config.ts                      사이트 설정 단일 파일 (CORE C-21)
src/app/layout.tsx                 패스스루 루트 레이아웃 (CORE C-26)
src/app/page.tsx                   S-00
src/app/not-found.tsx              S-15
src/app/robots.ts                  robots.txt
src/app/seo-manifest.json/route.ts 색인 매니페스트 (CORE C-30)
src/app/[lang]/layout.tsx          <html lang>, 헤더·푸터
src/app/[lang]/**/page.tsx         S-01~S-14, S-16 라우트 (페이지 파일은 조립만)
src/components/ui/                 버튼·칩·아이콘·스켈레톤·토스트 (DESIGN §3, C-13)
src/components/layout/             Header, Footer, LanguageSelect, ConsentBanner
src/components/{goods,collection,scan,share,subscribe,guides,home,ip,calc}/  기능별 뷰
src/lib/{data,price,i18n,seo,storage,api,affiliate,format,analytics,content,chart,match}/  기능별 로직
src/messages/{ko,en,ja,root}.json  화면 문구
src/data/generated/{ips,goods,prices,meta}.json   npm run data 산출물 (수정 금지)
src/data/slug-lock.json            굿즈 슬러그 고정
src/data/images.manifest.json      이미지 매니페스트
content/{ko,en,ja}/guides/*.md     가이드 본문 (사람 작성)
content/{ko,en,ja}/legal/{privacy,terms}.md  법적 고지 본문 (사람 작성)
data/source/mega-ip-goods.xlsx     원천 엑셀
public/data/catalog.json           클라이언트용 카탈로그 (npm run data 산출물)
public/images/{brand,hero,ip,empty,guides,og,share}/  이미지
public/icons/  public/manifest.webmanifest
scripts/{build-data,gen-sitemap,check-seo,serve-out,gen-placeholders}.mjs
tests/unit/**  tests/e2e/**  tests/qa/**  tests/og/**
qa/screenshots/ (gitignore)  qa/MANUAL_CHECKS.md
```
- 기능 하나 = 뷰 폴더 `src/components/{기능}/` + 로직 폴더 `src/lib/{기능}/`. 테스트는 `tests/unit/{기능}/`.
- 서버 측 코드 없음: `output: 'export'`. API 라우트는 `seo-manifest.json/route.ts`(force-static) 하나만. 백엔드는 외부(`config.api.baseUrl`).

## 레이어 규칙
- `src/app` → components, lib, messages 를 import 한다.
- `src/components` → lib, 다른 components 를 import 한다. app 을 import 하지 않는다.
- `src/lib` → lib, config, data 만 import 한다. React 컴포넌트·components 를 import 하지 않는다(예외: `src/lib/storage/useUserData.ts` 는 React 훅).
- `src/data/generated/*.json` import 는 `src/lib/data/` 에서만 한다.
- `fetch` 는 `src/lib/api/client.ts`(외부 API)와 `src/lib/data/catalogClient.ts`(정적 JSON)에서만 호출한다.
- `localStorage` 는 `src/lib/storage/` 와 `src/lib/analytics/consent.ts` 에서만 접근한다.
- scripts/*.mjs 는 src 를 import 하지 않는다(예외 없음).

## 파일 크기
- 한 파일 200줄 초과 금지. 초과 시 분할 기준: 뷰는 섹션 단위 컴포넌트로, 로직은 순수 함수 묶음 단위로, 메시지 JSON 은 예외(상한 없음).

## 네이밍
- 컴포넌트 파일 `PascalCase.tsx`, 로직 `camelCase.ts`, 훅 `useXxx.ts`, 테스트 `{대상}.test.ts(x)`, e2e `{S-ID}.spec.ts`.
- 메시지 키: DESIGN.md §4 표의 키 그대로(`영역.camelCase`). 새 키는 같은 규칙.
- 측정 이벤트: GROWTH.md §6 이름 그대로(snake_case). 새 이벤트 금지.
- 타입: `Lang = 'ko'|'en'|'ja'`, `Currency = 'JPY'|'KRW'|'USD'`, `Market = 'ebay'|'mercari'|'kream'|'other'`.
- 굿즈 URL: `/{lang}/goods/{goodsId 소문자}-{slug}/`, slug 없으면 `/{lang}/goods/{goodsId 소문자}/`.

## 에러 처리
- 외부 API 는 `apiFetch` 만 사용하며 예외를 던지지 않는다. 결과는 `{ok:true,data}|{ok:false,error:{code,message,fieldErrors?}}`. UI 문구는 `errors.{code}`.
- 정적 JSON 로드 실패: 해당 화면 DESIGN.md 에러 상태 표시. `console.error` 1회만.
- 빌드 시 데이터 오류는 throw 로 빌드 실패시킨다(조용한 대체 금지).
- `try/catch` 로 삼키기 금지. catch 는 반드시 상태 전환 또는 재throw.

## 상태 관리
- 사용자 데이터(진열장·위시리스트·구독 플래그)는 `useUserData()`(CORE C-32) 하나로만 읽고 쓴다.
- 서버 컴포넌트가 기본. `'use client'` 는 상호작용 섹션 파일에만.
- 전역 상태 라이브러리 금지. React context 는 사용하지 않는다(언어는 props 전달).

## 디자인 값
- 색·여백·폰트·버튼·라운드·그림자는 DESIGN.md §3 토큰만 쓴다. 임의 값 금지.
- Tailwind 표기: 색 `bg-primary` 등 `@theme --color-*`, 여백 `p-(--space-5)`, 라운드 `rounded-(--radius-md)`, 그림자 `shadow-(--shadow-card)`, 글자 `text-h1`·`text-body` 등 `@utility`. 브레이크포인트는 `md:`(768)·`lg:`(1024)만.

## 이미지 규칙
- 매니페스트 `src/data/images.manifest.json`: `{ "IMG-01": { "src": "/images/hero/home-shelf.webp", "width": 1152, "height": 960, "alt": { "ko": "...", "en": "...", "ja": "..." } } }`. alt 는 DESIGN §5 (en·ja 는 ko 의 직역, 장식은 "").
- 코드에서 이미지 경로 문자열 직접 사용 금지. `getImage('IMG-01')`(CORE C-36)로만 참조.
- `<img>`/`next/image` 모두 width·height 명시. 히어로(IMG-01)만 `priority`, 나머지 `loading="lazy"`.
- 플레이스홀더: DESIGN §2·§5 와 같은 경로·파일명·픽셀 크기, 단색 배경 #E4DFD7 + 중앙에 IMG-ID와 크기 텍스트(#5E5A6B). 생성은 CORE C-36.
- 굿즈 썸네일은 파일이 아니라 `GoodsPlaceholder` 인라인 SVG(CORE C-37).

## 테스트 기준
- 도구: vitest 5.0.5 + @testing-library/react 16.3.3 + jsdom (unit, `tests/unit/**`, `npm test`). Playwright 1.64.1 (e2e 스모크 `tests/e2e/{S-ID}.spec.ts`, `npm run e2e`, preview 서버 대상).
- 순수 로직(price, format, match, i18n, seo, storage, affiliate): 분기 커버리지 100%.
- 화면 성격별 최소 항목:
  - 목록(S-02, S-03, S-05, S-10, S-14): 정상 렌더 / 빈 상태 문구 / 에러 상태 문구(클라이언트 로드 화면만) / 정렬·필터 동작 1건
  - 상세(S-04, S-11): 정상 렌더 / 시세 없음·데이터 없음 분기 / 없는 id·slug 는 정적 경로에 생성되지 않음(generateStaticParams 테스트)
  - 폼(S-06 직접 등록, S-04 목표가, S-16 계산기, C-09 구독): 필드별 검증 실패 1건씩 / 정상 제출 / 서버 에러 응답(구독만)
  - 랜딩(S-00, S-01): 섹션 렌더 / 1차 행동 링크 경로 / 데이터 0건 시 섹션 대체·숨김
  - 로컬 데이터 화면(S-07, S-08, S-09): 추가·삭제·새로고침 후 유지 / 빈 상태 / 손상 데이터 에러 상태
  - 정적 정보(S-12, S-13, S-15): 정상 렌더
- 모든 S-ID 에 e2e 스모크 1개: 페이지 200, h1 존재, 콘솔 에러 0.

## 기술 SEO 규칙
- 색인 대상(GROWTH.md §4 G-01, 판정은 CORE C-29)은 SSG HTML 에 본문·가격·링크가 포함된다. CSR 단독 렌더 금지.
- title: `{페이지명} | {사이트명}` (ko·ja 사이트명 `오시볼트`·`オシボルト`, en `Oshi Vault`). S-01·S-00 은 `{사이트명} | {슬로건}`.
- description: ko·ja 40~80자, en 70~160자. 티켓의 실제 문구 사용.
- canonical: `config.site.url` + 경로(트레일링 슬래시 포함), 쿼리 제거. 자기 자신만 가리킨다.
- noindex: `<meta name="robots" content="noindex,follow">`. 대상: S-05~S-09, S-15, CORE C-29 가 false 를 반환한 페이지.
- sitemap: `/sitemap.xml`(index) + `/sitemap-{ko,en,ja}.xml`. 생성은 CORE C-30. 색인 대상만.
- robots.txt: `User-agent: *` / `Allow: /` / `Sitemap: {site.url}/sitemap.xml`.
- OG 필수: og:title, og:description, og:url, og:image(1200×630, DESIGN §2 파일), og:type(website, S-04 product 아님 → website), og:locale(ko_KR·en_US·ja_JP), twitter:card summary_large_image.
- 아이콘 link: `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png`(Next 파일 규칙 자동 출력) + `<link rel="manifest" href="/manifest.webmanifest">` + `<meta name="theme-color" content="#3B2F6B">`.
- 구조화 데이터: GROWTH.md G-01 목록 그대로. AggregateRating·FAQPage 금지.
- 404: 미생성 경로는 Cloudflare 가 `404.html`(S-15) 반환. 301: `public/_redirects` 에 슬러그 변경분만 수기 추가(자동 생성 금지).
- 성능 기준: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms (375px, 4G 기준 Lighthouse). 이미지 width·height 필수, 폰트 `display: swap`.

## 다국어 규칙 (GROWTH.md §5 구현 형식)
- 메시지 파일 `src/messages/{ko,en,ja}.json` 은 평면 키-값(JSON 1단계, 키에 점 포함). 언어 무관 문자열은 `src/messages/root.json`.
- 화면 문구 하드코딩 금지. 예외: 브랜드명, 마켓명(eBay·Mercari·KREAM), 언어 자기 표기.
- 3개 파일의 키 집합이 다르면 빌드 실패(CORE C-25).
- 날짜·숫자·통화·퍼센트는 `src/lib/format/` 함수만 사용(CORE C-24). `toLocaleString` 직접 호출 금지.
- 언어 경로: `src/app/[lang]/` 동적 세그먼트, `generateStaticParams` 로 ko·en·ja, `dynamicParams = false`. 미지원 언어 경로는 미생성 → 404.
- hreflang·x-default: 각 페이지 `metadata.alternates.languages` 에 색인 가능한 언어 URL + `x-default` → `{site.url}/`. 출력은 CORE C-27 만.
- 언어별 sitemap 에 해당 언어 URL 과 `xhtml:link` alternates 를 넣는다(CORE C-30).
- 자동 리다이렉트 금지(IP·Accept-Language·navigator.language 모두). S-00 은 강조만.
- 검수 전 번역: 굿즈는 엑셀 `EN검수`·`JA검수` ≠ `Y` 이면 그 언어 S-04 noindex. 가이드는 frontmatter `reviewed: false` 이면 noindex. hreflang·sitemap 에서도 제외.

## 콘텐츠 규칙
- 경로: `content/{lang}/guides/{slug}.md`, `content/{lang}/legal/{privacy,terms}.md`. 같은 문서는 언어 간 같은 slug.
- frontmatter(가이드): `title: string`, `description: string`, `date: YYYY-MM-DD`, `updated: YYYY-MM-DD`, `ipSlugs: string[]`, `reviewed: boolean`, `endCta: 'primary'|'secondary'|'scan'|'shelf'`. 언어는 경로에서 판정.
- frontmatter(법적 고지): `title`, `effective: YYYY-MM-DD`, `reviewed: boolean`.
- 파일 없음 → 페이지 미생성(404). `reviewed: false` → 생성 + noindex + sitemap 제외. 필드 누락 → 빌드 실패.

## 측정 규칙
- GA4 스크립트는 `src/components/layout/ConsentBanner.tsx` 에서 동의 수락 후에만 동적 삽입한다.
- 이벤트 전송은 `track()`(CORE C-35) 하나로만. `gtag` 직접 호출 금지.
- 이메일·이름·idToken·자유 입력값을 파라미터에 넣지 않는다.
- `NODE_ENV !== 'production'`, hostname 이 `localhost`·`127.0.0.1`, `config.analytics.ga4Id` 가 빈 문자열이면 전송하지 않는다.
