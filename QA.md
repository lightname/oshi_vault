<!-- QA.md -->

## 심각도 기준
- 상: 핵심 흐름(S-04 시세 확인 → 마켓 버튼, S-06 → S-07 등록, S-04 → S-08 목표가)이 완주되지 않음 / 색인 대상 페이지(S-00·S-01·S-02·S-03·S-04 ko·S-12·S-16)에 noindex 가 붙거나 robots.txt 가 차단하거나 sitemap 에서 누락 / 구독 폼(DESIGN C-09)이 수신 동의 체크 없이 전송됨 / 사용자 데이터(`mipg.v1`)가 저장되지 않거나 다른 화면에서 덮어써짐 / 검증 명령 실패 / 빌드 산출물에 존재하지 않는 시세·후기·사용자 수가 표시됨
- 중: 1차 CTA 문구·위치·스타일이 DESIGN.md §6 과 다름 / 빈·로딩·에러 상태 중 하나가 DESIGN 문구·IMG-ID 와 다름 / 375px 에서 가로 스크롤 또는 겹침 / canonical·hreflang·OG·구조화 데이터 오류 / 측정 이벤트 누락·이름 불일치 / 메시지 키 하드코딩 / 토큰 밖 색·여백
- 하: 전환 시간·hover 효과 차이 / 문구 띄어쓰기·구두점 / 768·1440 에서의 2px 이하 정렬 차이 / 콘솔 경고(에러 아님)

## §1 설계 QA 리스트

| ID | 분야 | 대상 | 확인 방법 | 기대 결과 | 근거 문서·절 |
|---|---|---|---|---|---|
| QA-01 | 버그 | 흐름 S-04 → S-07 | `npm run preview` 후 `/ko/goods/pkm-0001-.../` 에서 `진열장에 담기` 클릭 → `/ko/collection/` 이동 → 새로고침 | 토스트 `진열장에 담았어요` 표시, S-07 항목 1개·총 가치(정가 환산) 표시, 새로고침 후 유지 | TICKETS T-08, T-12 / CORE C-32 |
| QA-02 | CTA | S-04 시세 있음 | `tests/unit/goods/MarketButtons.test.tsx` 실행(픽스처 시세 2개 마켓) | 버튼 2개, 첫 버튼만 `btn-primary`, 문구 `{market}에서 매물 보기`, `target="_blank"`, `rel="sponsored nofollow noopener"`, href 가 CORE C-38 결과와 일치 | DESIGN §6 S-04 / CORE C-38 |
| QA-03 | CTA | S-04 시세 없음(현재 데이터) | `/ko/goods/pkm-0001-.../` 375px 스크린샷과 DOM | IMG-05, `이 굿즈는 시세를 수집하고 있어요`, `btn-secondary` 검색 버튼 3개, `btn-primary` 0개, 하단 고정 바 없음 | DESIGN S-04 섹션 3' / §6 S-04 |
| QA-04 | 버그 | S-06 직접 등록 폼 | 상품명 비우고 정가 1000 입력 후 `진열장에 담기` | 상품명 필드 테두리 danger + `필수 항목이에요.`, 포커스 이동, `mipg.v1` collection 변화 없음 | TICKETS T-11 |
| QA-05 | 버그 | S-07 빈·에러 | (1) localStorage 비우고 `/ko/collection/` (2) `mipg.v1` 에 `{` 저장 후 새로고침 | (1) IMG-08 + `진열장이 비어 있어요` + `바코드로 등록하기` (2) `저장된 진열장을 읽지 못했어요.` + `진열장 초기화하기` | DESIGN S-07 상태 / CORE C-32 |
| QA-06 | 디자인 | S-01·S-04·S-06 375px | `npm run qa:shots` 결과 `qa/screenshots/375/` 와 `document.documentElement.scrollWidth` | 가로 스크롤 없음(scrollWidth ≤ 375), 요소 겹침 없음, S-01 검색 버튼이 입력 아래 전체 폭 | DESIGN S-01·S-04·S-06 반응형 |
| QA-07 | 디자인 | 공개 페이지 메타 | `out/ko/index.html`, `out/en/ip/pokemon/index.html` 열람 | title `오시볼트 | 내 최애 굿즈의 지금 가치` / `Pokémon limited merch prices | Oshi Vault`, og:image 파일 존재(1200×630), `favicon.ico`·`icon.png`·`apple-icon.png`·manifest link 존재 | CONVENTIONS 기술 SEO / TICKETS T-05, T-09 |
| QA-08 | 디자인 | 이미지 플레이스홀더 | `public/images/hero/home-shelf.webp` 픽셀 크기, S-01 히어로 `<img>` 속성 | 1152×960, `<img>` 에 width 1152·height 960, src 가 매니페스트 IMG-01 값, 다른 컴포넌트에 `/images/` 문자열 없음 | DESIGN §5 IMG-01 / CONVENTIONS 이미지 규칙 |
| QA-09 | 디자인 | 토큰 준수 | `rg -n "#[0-9A-Fa-f]{6}" src --glob '!src/app/globals.css' --glob '!src/config.ts' --glob '!src/lib/share/**' --glob '!src/lib/data/placeholderShapes.ts' --glob '!src/data/**'` | 결과 0줄. 스크린샷 S-04 1차 버튼 배경 #C2410C | CONVENTIONS 디자인 값 / DESIGN §3 |
| QA-10 | 성장 | sitemap·robots | `out/sitemap.xml`, `out/sitemap-ko.xml`, `out/sitemap-en.xml`, `out/robots.txt` | index 가 하위 3개를 가리킴, ko 에 S-01·S-02·S-03(10개)·S-04(23개)·S-12·S-16 포함, en 에 S-04 없음(EN검수 N), S-05~S-09 없음, robots 에 `Sitemap: {site.url}/sitemap.xml` | GROWTH G-01 / CORE C-29, C-30 |
| QA-11 | 성장 | 색인 대상 canonical | `out/ko/goods/pkm-0001-*/index.html`, `out/ko/ip/sanrio/index.html` | canonical = `{site.url}` + 자기 경로(트레일링 슬래시), robots meta 에 noindex 없음, Product·BreadcrumbList JSON-LD 파싱 성공 | CONVENTIONS 기술 SEO / CORE C-27, C-28 |
| QA-12 | 성장 | 본문 없는 콘텐츠 | `content/*/guides/` 가 비어 있는 상태의 `out/ko/guides/index.html`, sitemap | `noindex` 메타 존재, sitemap 에 `/ko/guides/` 없음, 헤더에 `가이드` 메뉴 없음, `/ko/guides/abc/` 는 404 | GROWTH G-03 / TICKETS T-15, T-16 |
| QA-13 | 성장 | 구독 동의 | `npm run dev` 에서 `/ko/wishlist/` 하단 구독 → `목표가 도달 메일 받기` → 체크하지 않고 Mock Google 클릭 | `입력 내용을 확인해 주세요.` 표시, `subscribe_submit` 미발생, `mipg.v1.prefs.subscribed` 변화 없음. 체크 후 클릭 시 `구독했어요` | GROWTH G-06 / CORE C-34 / TICKETS T-07 |
| QA-14 | 성장 | 구독 UI 숨김 | `api.mode='mock'` 상태 `npm run preview` 의 `/ko/goods/pkm-0001-.../` | 구독 컴포넌트 DOM 없음 | CORE C-34 `subscribeVisible` |
| QA-15 | 성장 | 1차 CTA 측정 | `tests/unit/analytics/track.test.ts`(NODE_ENV production stub, consent granted, gtag mock)에서 MarketButtons 클릭 | `gtag('event','affiliate_click',{goods_id, ip_slug, market, has_affiliate, lang, screen_id:'S-04'})` 1회. consent 없음·localhost 에서는 0회 | GROWTH §6 / CORE C-35 |
| QA-16 | 성장 | hreflang·언어 경로 | `out/ko/index.html`, `out/ko/goods/pkm-0001-*/index.html`, `GET /fr/` | 홈: hreflang ko·en·ja·x-default 4개. 굿즈: ko·x-default 2개(en·ja 미검수). `/fr/` 는 상태 404 + S-15 | CONVENTIONS 다국어 / CORE C-27 |
| QA-17 | 성장 | 언어 전환·자동 이동 금지 | Playwright locale `ja-JP` 로 `/` 접속 / `/ko/goods/pkm-0001-.../` 에서 언어 선택기 English 클릭 | `/` 에 머묾 + 日本語 카드만 강조 / `/en/goods/pkm-0001-.../` 로 이동, `language_switch` 발생 | GROWTH G-07 / CORE C-46 / TICKETS T-02 |
| QA-18 | 버그 | 데이터 무결성 | `npm run data:check`, `public/data/catalog.json` | 종료 코드 0, goods 23개·ips 27개·prices 0개, 슬러그 23개가 slug-lock 과 일치 | CORE C-22 |

## §2 코딩 후 추가 항목

## §3 1차 QA 결과

## §4 수정 결과
