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

| ID | 분야 | 대상 | 확인 방법 | 기대 결과 | 근거 문서·절 |
|---|---|---|---|---|---|
| QA-19 | 버그 | S-06·S-07·S-08·S-09 모바일(375px) | `npm run qa:shots` 후 375px 스크린샷 및 S-07 삭제 인라인 확인·S-08 목표가 입력 검증 | 가로 스크롤 없음, S-07 삭제 2단계 인라인 확인 및 S-08 목표가 오류/성공 테두리 정상 전환 | TICKETS T-11~T-14 / DESIGN S-06~S-09 |
| QA-20 | 기능 | S-09 공유 카드 캔버스·워터마크 | 진열장 1건 이상 등록 후 `/ko/share/` 에서 워터마크 토글 및 카드 생성·저장 | 1080×1350 PNG 미리보기·다운로드 정상, 워터마크 해제 시 주소 미표기, 10MB 초과 사진 거부 | TICKETS T-14 / CORE C-41 |
| QA-21 | 기능 | S-16 계산기 교차 통화·CTA 규칙 | `/ko/tools/premium-calculator/` 에서 JPY 정가·USD 거래가 입력 및 DOM 확인 | 고정 환율 프리미엄·차액·배율 즉시 계산, `btn-primary` 0개, 정적 계산식 설명 HTML 포함 | TICKETS T-19 / DESIGN §6 S-16 |
| QA-22 | 버그 | 콘텐츠 frontmatter 날짜 형식 | `content/{lang}/{guides,legal}/*.md` 추가 후 `npm run build` | `date`·`updated`·`effective` 를 YAML 문자열(`"YYYY-MM-DD"`)로 기록 시 `formatDate` 오류 없이 빌드 통과 | CORE C-31 / TICKETS T-16, T-18 |
| QA-23 | 디자인 | T-20 합성 OG 이미지 | `public/images/og/og-default-{ko,en,ja}.png`, `og-ip-{slug}-{lang}.png` 열람 및 `tests/unit/og/size.test.ts` | 전체 33개 파일 1200×630 PNG, 배경·모노 심볼·언어별 제목 및 슬로건 정상 합성 | TICKETS T-20 / CORE C-45 |

## §3 1차 QA 결과

### 점검 결과

| 점검 ID | 결과 | 관찰 내용 한 줄 |
|---|---|---|
| 검증명령 | 통과 | `data:check`·`typecheck`·`lint`·`test`(28파일 60건)·`build`·`seo:check`(121건/43 indexable) 종료 코드 0 (Next 16.4.3 최초 빌드 보안 안내 1회 재실행 후 통과, e2e 17/17 통과) |
| QA-01 | 통과 | `/ko/goods/pkm-0001/` 담기→토스트→`/ko/collection/` 항목 1개·정가 환산 표시 및 새로고침 후 유지 확인 (단 S-04 목표가 통화 선택 버그는 QA-I03) |
| QA-02 | 실패 | `MarketButtons.tsx` 구현은 DESIGN §6·C-38 준수하나 `tests/unit/goods/MarketButtons.test.tsx` 부재 및 2개 마켓 스타일·`target`/`rel` 단위 테스트 미비 (QA-I15) |
| QA-03 | 통과 | 375px `/ko/goods/pkm-0001/`에서 IMG-05·수집 중 문구·`btn-secondary` 검색 버튼 3개·`btn-primary` 0개·하단 고정 바 없음 확인 |
| QA-04 | 통과 | S-06 상품명 공백·정가 1000 제출 시 `border-danger`·`필수 항목이에요.`·포커스 이동·`mipg.v1` 미변경 확인 |
| QA-05 | 통과 | S-07 빈 상태(IMG-08·제목·`바코드로 등록하기`) 및 `mipg.v1="{"` 손상 시 에러 문구·2단계 초기화 버튼 동작 확인 |
| QA-06 | 실패 | 375px 18개 라우트 가로 스크롤 0건·S-01 검색 버튼 하단 전체 폭 통과하나 `npm run qa:shots` 1440px 30초 타임아웃 실패 및 S-03 375px 정렬 라벨 2줄 꺾임 (QA-I02, QA-I12) |
| QA-07 | 실패 | `out/ko/index.html` 메타·아이콘·manifest·OG 정상이나 `out/en/ip/pokemon/index.html` title에 일본어 원어명(`ポケットモンスター / Pokémon`) 혼입 (QA-I05) |
| QA-08 | 실패 | `home-shelf.webp` 1152×960·`<img>` width/height·매니페스트 일치하나 `Header`·`Footer`·`page.tsx`·`renderCard`에 `/images/brand/logo-symbol*.svg` 경로 문자열 직접 기재 (QA-I10) |
| QA-09 | 실패 | S-01/S-04 1차 버튼 색 `#C2410C` 토큰 일치하나 `Chip.tsx`·`PremiumBadge.tsx`·`GoodsPlaceholder.tsx`에 Hex 리터럴 7줄 잔존 (QA-I04) |
| QA-10 | 실패 | `sitemap.xml` 3개 하위 구조·`robots.txt`·S-05~S-09 제외 정상이나 `sitemap-ko.xml`에 S-04 23건 전원 누락(0건) (QA-I01) |
| QA-11 | 실패 | `out/ko/ip/sanrio/index.html` 정상이나 `out/ko/goods/pkm-0001/index.html`이 `noindex, follow`로 출력되고 슬러그가 비어 있음 (QA-I01) |
| QA-12 | 통과 | 가이드 0건 상태에서 `out/ko/guides/index.html` `noindex`·sitemap 제외·헤더 `가이드` 미렌더링·`/ko/guides/abc/` HTTP 404 확인 |
| QA-13 | 실패 | dev 모드에서 위시리스트 항목 존재 시 동의 미체크 거부·체크 후 구독 성공 동작하나, 위시리스트 빈 상태 `/ko/wishlist/`에서는 구독 폼 미노출 (QA-I08) |
| QA-14 | 통과 | `api.mode='mock'` 정적 preview의 `/ko/goods/pkm-0001/`에서 구독 컴포넌트 DOM 0건 확인 |
| QA-15 | 실패 | `track.ts`의 프로덕션·localhost·`ga4Id`·consent 분기는 정상이나 `track.test.ts`에 `MarketButtons` `affiliate_click` 및 localhost 차단 테스트 미포함 (QA-I15) |
| QA-16 | 실패 | 홈 hreflang 4개·`/fr/` 404+S-15 통과하나 `out/ko/goods/pkm-0001/index.html`이 `noindex`라 hreflang 0개 출력 (QA-I01) |
| QA-17 | 통과 | `ja-JP` locale `/` 자동 이동 없음·日本語 카드만 강조, S-04 언어 선택기 English 클릭 시 `/en/goods/pkm-0001/` 이동 확인 |
| QA-18 | 실패 | `data:check` 통과·goods 23/ips 27/prices 0 일치하나 원천 엑셀 `상품명(EN)` 부재로 `slug-lock.json`이 `{}`(슬러그 0건) 상태 (QA-I01) |
| QA-19 | 통과 | S-06~S-09 375px `scrollWidth=375`, S-07 삭제 2단계 인라인 확인 및 S-08 목표가 오류/성공 테두리 전환 정상 |
| QA-20 | 통과 | S-09 1080×1350 PNG 미리보기·워터마크 토글·생성/다운로드 및 10MB 초과 사진 거부 확인 |
| QA-21 | 통과 | S-16 JPY 2000·USD 30 입력 시 `+125%`·`2.25배` 즉시 계산, `btn-primary` 0개, 정적 계산식 HTML 포함 확인 |
| QA-22 | 통과 | `content/*/legal/*.md` 문자열 날짜 `"2026-10-24"` 빌드·`formatDate` 정상 및 가이드 픽스처 테스트 통과 |
| QA-23 | 통과 | default 3종·IP 30종 총 33개 OG PNG 모두 1200×630 유효 및 합성 정상(단 영문 IP명은 QA-I05 영향) |
| 가정-T-01-1 | 통과 | 원천 엑셀 복사 사용은 원본 미수정 및 CONVENTIONS 경로 규칙과 충돌 없음 |
| 가정-T-01-2 | 실패 | `상품명(EN)`/`IP명(EN)` 부재 폴백이 `goodsComplete` 전원 실패(ko S-04 23건 `noindex`)·`slug-lock` 공백·영문 IP명 일본어 혼입을 유발 (QA-I01, QA-I05) |
| 가정-T-01-3 | 통과 | `hasPage` 기반 매니페스트 등록은 전 화면 구현 완료 시점에서 공개 라우트 전체 정상 포함 |
| 가정-T-06 | 실패 | L1 S-14 0건 매니페스트 유지되나 `out/ko/ip/_none/_none/index.html`이 남아 HTTP 200 소프트 404 반환 (QA-I11) |
| 가정-T-16 | 실패 | 가이드 0건 매니페스트 유지되나 `out/ko/guides/_none/index.html`이 남아 HTTP 200 소프트 404 반환 (QA-I11) |
| 막힘-없음 | 통과 | PROGRESS.md 막힘 절 0건, T-01~T-20 미구현 티켓 없음 |
| KW-매핑 | 실패 | S-01·S-03·S-04·S-16 title/H1 템플릿 일치 및 GROWTH §2 오류 수정 완료; 영문 IP 허브 title에 일본어 원어명 혼입 (QA-I05) |
| CT-01~CT-05 | 사람 확인 필요 | S-10·S-11 템플릿·커버 IMG-13~17·슬롯 A/B 코드 구현 확인; 5편 가이드 본문은 사람 작성 전(0건 `noindex`·sitemap 제외 정상) |
| G-01 | 실패 | 구조화 데이터·robots·OG·메타 키워드 부재 준수하나 ko S-04 23건 전원 `noindex`·sitemap 누락 (QA-I01) |
| G-02 | 실패 | S-04 시세 없음 시 관련 굿즈 상단 배치·관련 가이드/IP 블록 동작하나 `이 숫자 읽는 법` 및 `RelatedGoods` 전체 보기 링크에 `internal_link_click` 누락 (QA-I06) |
| G-03 | 실패 | 0건 시 S-10 `noindex`·sitemap 제외·메뉴 숨김 정상이나 `GuideCtaSlots` 래퍼 `onClick` 오발생 및 `_none` 200 응답 (QA-I07, QA-I11) |
| G-04 | 통과 | S-06·S-07 로그인 없이 로컬 동작, S-16 고정 환율 즉시 계산·정적 설명·S-05/S-06 링크·`calculator_use` 1회 발생 확인 |
| G-05 | 통과 | S-09 워터마크 기본 ON·체크박스 토글·사이트 주소 표기·Web Share UTM 링크·`share_card_create`/`share_card_share` 확인 |
| G-06 | 실패 | 동의 미체크 차단·프로덕션 mock 숨김 정상이나 발송 주기 안내 누락 및 S-08 빈 상태 구독 폼 미노출 (QA-I08, QA-I09) |
| G-07 | 통과 | S-00 자동 이동 없음·브라우저 언어 강조, 헤더/푸터 선택기 `LangAlternates` 연동 및 `language_switch` 확인 |
| G-08 | 실패 | 헤더 배지·S-08 도달 정렬·1차 CTA 로직 정상이나 S-04 목표가 저장 시 선택 통화 미반영으로 도달 판정 왜곡 (QA-I03) |
| G-09 | 통과 | S-04 시세 근거/수집 중·S-12 출처/계산식/한계/기준일·푸터 비공식 고지 및 허위 수치 부재 확인 |
| 다국어(§5) | 실패 | ko/en/ja 경로·`format.ts` 로케일 함수·`/fr/` 404·자동 리다이렉트 없음·키 일치 테스트 통과하나 일부 `aria-label` 영문 하드코딩 (QA-I10) |
| 측정(§6) | 실패 | 14종 이벤트 이름·`lang`/`screen_id`·개인정보 미포함·동의 전 GA 미로드 정상이나 일부 `internal_link_click` 누락 및 `guide_cta_click` 오발생 (QA-I06, QA-I07) |
| 금지채널(§1) | 통과 | 대량 메일·커뮤니티 홍보·후기/사용자 수·L3/L4 자동 대량 페이지·키워드 메타/반복 기능 미구현 확인 |

### 개선 목록

| QA-ID | 분야 | 심각도 | 위치(S-ID·섹션·파일) | 현상 | 기대 | 근거(문서·절 또는 객관적 결함) |
|---|---|---|---|---|---|---|
| QA-I01 | 성장 | 상 | S-04 · `src/lib/seo/indexing.ts`, `scripts/build-data.mjs`, `src/data/slug-lock.json`, `out/sitemap-ko.xml` | 원천 엑셀 `상품명(EN)` 부재로 23건 굿즈의 `name.en`·`slug`가 빈 문자열(`slug-lock.json={}`)이 되어 `goodsComplete`가 전원 실패하고, 한국어 S-04 23건 모두 `noindex` 처리되어 `sitemap-ko.xml` 및 hreflang에서 누락됨 | 한국어 S-04 23건이 `index` 상태로 출력되고 `sitemap-ko.xml`에 모두 포함되며 각 페이지에 `ko`·`x-default` hreflang이 출력된다(슬러그 정책도 일관되게 고정) | QA.md 심각도 기준(상)·QA-10·QA-11·QA-16·QA-18, GROWTH.md §4 G-01 |
| QA-I02 | 버그 | 상 | QA 스크립트 · `tests/qa/screenshots.spec.ts` | `npm run qa:shots` 실행 시 1440×900 테스트가 41개 라우트를 단일 테스트 내 `networkidle`로 순회하다 30초 타임아웃으로 실패(`/ja/privacy/` 중단, 2장 누락) | 375·768·1440px 모든 대상 화면 스크린샷이 타임아웃 없이 전부 생성되고 `npm run qa:shots`가 종료 코드 0으로 통과한다 | CORE.md C-44, AGENTS.md 실행 규칙 |
| QA-I03 | 버그 | 상 | S-04 · 개요 액션 패널 · `src/components/goods/GoodsActions.tsx`, `src/lib/storage/store.ts` | S-04에서 `위시리스트에 담기` 후 인라인 패널에서 통화를 변경(예: KRW→USD)하고 목표가를 저장해도 기존 통화가 유지되어 목표가 금액과 통화가 불일치함 | 목표가 저장 시 사용자가 패널에서 선택한 통화가 함께 저장되어 S-08 위시리스트와 헤더 도달 배지가 선택한 통화 기준으로 판정된다 | SPEC.md 핵심 흐름(목표가), DESIGN.md S-04 섹션 2, QA.md 심각도 기준(상) |
| QA-I04 | 디자인 | 중 | C-05·C-07·S-08 · `src/components/ui/Chip.tsx`, `src/components/goods/PremiumBadge.tsx`, `src/components/goods/GoodsPlaceholder.tsx`, `src/components/collection/WishlistReached.tsx` | 컴포넌트에 `#E8F3EC`·`#F9E7E8`·`#FBF0E4`·`#FFFFFF` Hex 리터럴이 직접 남아 QA-09 기준(0줄) 위반, `WishlistReached`는 `bg-success/10` 사용 | 모든 색상이 `globals.css` 토큰으로 참조되어 QA-09 검색 결과가 0줄이고, C-05·C-07·S-08 배경색이 DESIGN 지정 값과 일치한다 | QA.md QA-09, CONVENTIONS.md 디자인 값, DESIGN.md §3·§4.0 |
| QA-I05 | 성장 | 중 | S-02·S-03·OG · `scripts/build-data.mjs`, `src/data/generated/ips.json`, `public/images/og/og-ip-*-en.png` | 원천 엑셀 `IP명(EN)` 부재 폴백으로 영문 IP명이 `ポケットモンスター / Pokémon`처럼 일본어 원어명을 포함해 `/en/ip/pokemon/` title·H1·OG 및 이니셜 배지(`ポ`, `ち`)가 오염됨 | 영문·일문 IP명이 언어별로 분리되어 `/en/ip/pokemon/` title이 `Pokémon limited merch prices \| Oshi Vault`로 출력되고 이니셜 배지가 영문 대문자 첫 글자로 표시된다 | QA.md QA-07, CORE.md C-37, GROWTH.md §2 KW-03 |
| QA-I06 | 성장 | 중 | S-04·S-11 · `src/components/goods/GoodsPriceSection.tsx`, `src/components/goods/RelatedGoods.tsx` | G-02 내부 링크인 S-04 시세 블록의 `이 숫자 읽는 법` 링크와 `RelatedGoods` 상단의 `{ip} 굿즈 전체 보기` 링크 클릭 시 `internal_link_click` 이벤트가 발생하지 않음 | G-02 내부 링크 블록의 모든 링크 클릭 시 `internal_link_click` 이벤트가 `block`·`target_screen_id` 파라미터와 함께 발생한다 | GROWTH.md §4 G-02·§6 측정, QA.md 심각도 기준(중) |
| QA-I07 | 성장 | 중 | S-11 · 본문 CTA 슬롯 · `src/components/guides/GuideCtaSlots.tsx` | `GuideSlotA`와 `GuideSlotB(secondary)`가 최외곽 래퍼 `<div>`에 `onClick`을 달아 CTA 버튼이 아닌 카드 빈 영역·텍스트·체크박스 클릭에도 `guide_cta_click`이 발생함 | `guide_cta_click` 이벤트가 본문 슬롯 내 실제 CTA 버튼·링크 클릭 시에만 1회 발생한다 | GROWTH.md §6 측정(`guide_cta_click`), TICKETS.md T-16 |
| QA-I08 | 성장 | 중 | S-08 · 섹션 4 · `src/components/collection/WishlistView.tsx` | `SubscribeBox`가 `ClientSection`의 `children` 안에 있어 위시리스트가 비어 있을 때 dev/live 모드에서도 하단 구독 폼이 표시되지 않음 | 위시리스트 빈 상태와 무관하게 `subscribeVisible()`가 참일 때 S-08 하단 구독 폼에 접근할 수 있어 QA-13 절차가 즉시 동작한다 | QA.md QA-13, DESIGN.md S-08 섹션 4 |
| QA-I09 | 성장 | 중 | C-09 · `src/components/subscribe/SubscribeBox.tsx`, `src/messages/{ko,en,ja}.json` | 구독 폼 동의 영역에 발송 내용·해지 방법·개인정보처리방침 링크는 있으나 발송 주기(시세 갱신 시 1회 / 월 1회 이하) 안내 문구가 누락됨 | C-09 동의 영역에 발송 내용·주기·해지 방법·개인정보처리방침 링크가 모두 메시지 파일 키로 표시된다 | DESIGN.md §1.5 6단계, GROWTH.md §4 G-06 |
| QA-I10 | 성장 | 중 | C-01·C-03·C-12·S-00·S-04·S-06 · `Header.tsx`, `Footer.tsx`, `src/app/page.tsx`, `Breadcrumb.tsx`, `GoodsActions.tsx`, `ScanCamera.tsx` | `Header`·`Breadcrumb`·`GoodsActions`·`ScanCamera`에 영문 `aria-label`(`Main`, `Close`, `Breadcrumb`, `Currency`, `loading`)이 하드코딩되고, 로고 경로 `/images/brand/logo-symbol*.svg`가 여러 컴포넌트에 직접 기재됨 | 모든 `aria-label`이 언어별 메시지 파일 키를 참조하고, 컴포넌트 내 직접 `/images/` 문자열 없이 매니페스트/단일 헬퍼를 통해 참조한다 | CONVENTIONS.md 다국어·이미지 규칙, QA.md QA-08, GROWTH.md §5 |
| QA-I11 | 버그 | 중 | S-11·S-14 · `src/app/[lang]/guides/[slug]/page.tsx`, `src/app/[lang]/ip/[ipSlug]/[type]/page.tsx` | 빈 `generateStaticParams` 우회용 `_none` 센티널 HTML이 `out/`에 남아 `/ko/guides/_none/`·`/ko/ip/_none/_none/` 요청 시 HTTP 404가 아닌 HTTP 200 소프트 404를 반환함 | 센티널 산출물이 배포 디렉터리에 남지 않아 존재하지 않는 가이드·유형 경로가 모두 HTTP 404를 반환한다 | GROWTH.md §4 G-03, PROGRESS.md 가정 절 T-06·T-16 |
| QA-I12 | 디자인 | 하 | S-03 · 섹션 3 툴바 · `src/components/ip/IpGoodsGrid.tsx` | 375px 모바일에서 정렬 셀렉트에 `w-full`이 적용되면서 왼쪽 `정렬` 라벨이 2줄(`정`/`렬`)로 세로 줄바꿈됨 | 375px에서도 `정렬` 라벨이 한 줄로 유지되며 셀렉트와 자연스럽게 정렬된다 | DESIGN.md S-03 반응형, 375px 스크린샷 확인 |
| QA-I13 | 디자인 | 하 | S-04 · 섹션 2 메타 표 · `src/components/goods/GoodsDetailView.tsx` | 메타 표의 정가 확인일 행에서 `<dt>`(`정가 확인일`)와 `<dd>`(`정가 확인일 2026. 10. 24.`)에 라벨 문구가 중복 표시됨(3개 언어 동일) | `<dt>`에는 라벨만, `<dd>`에는 포맷된 확인일 날짜만 표시된다 | DESIGN.md S-04 섹션 2 메타 표, 1440px 스크린샷 확인 |
| QA-I14 | 성장 | 하 | S-03·S-14 · `src/messages/ko.json` (`meta.ipHub.description`, `meta.ipType.description`) | 한국어 `formatDate` 끝 마침표와 메시지 템플릿의 `.`가 겹쳐 `기준일 2026. 10. 24..`처럼 마침표가 이중 출력됨 | 한국어 메타 description의 날짜 끝에 마침표가 하나만 출력된다 | QA.md 심각도 기준(하: 구두점), `out/ko/ip/sanrio/index.html` 확인 |
| QA-I15 | 버그 | 하 | 단위 테스트 · `tests/unit/goods/`, `tests/unit/analytics/track.test.ts` | QA-02 명시 파일 `MarketButtons.test.tsx` 부재(2개 마켓 버튼 우열·`target`/`rel` 미검증) 및 `track.test.ts` 내 `MarketButtons` `affiliate_click`·localhost 차단 테스트 누락 | `MarketButtons` 2개 마켓 우열·속성·URL 단위 테스트와 `affiliate_click` 및 localhost 차단 단위 테스트가 추가되어 통과한다 | QA.md §1 QA-02·QA-15 |

## §4 수정 결과

### QA 항목 처리

| QA-ID | 상태(완료/보류/실패) | 변경 파일 | 커밋 | 비고(보류·실패 사유, 영향 화면) |
|---|---|---|---|---|
| QA-I01 | 완료 | `src/lib/seo/indexing.ts`, `tests/unit/seo/indexing.test.ts` | `60da7ba` | 공통 레이어(`indexing.ts`) 수정 — 영향 화면: S-01, S-02, S-03, S-04, S-05, S-06, S-10, S-11, S-13, S-14, sitemap. ko S-04 23건 index·sitemap·hreflang(`ko`, `x-default`) 정상화(엑셀 미수정 원칙 준수, `상품명(EN)` 부재 시 `/{lang}/goods/{id}/` 정책 유지) |
| QA-I02 | 완료 | `tests/qa/screenshots.spec.ts` | `a4309b7` | 타임아웃 180초 상향 후 `npm run qa:shots` 375·768·1440px 전체 통과 확인 |
| QA-I03 | 완료 | `src/lib/storage/store.ts`, `src/components/goods/GoodsActions.tsx`, `tests/unit/storage/storage.test.ts`, `tests/unit/goods/GoodsDetail.test.tsx` | `d5757a5` | 공통 레이어(`store.ts`) 수정 — 영향 화면: 헤더(C-01), S-04, S-06, S-07, S-08, S-09, S-11(C-09). `setTarget` 선택 통화 저장 반영 |
| QA-I04 | 완료 | `src/app/globals.css`, `src/components/ui/Chip.tsx`, `src/components/goods/PremiumBadge.tsx`, `src/components/goods/GoodsPlaceholder.tsx`, `src/components/collection/WishlistReached.tsx` | `b6535a4` | 공통 레이어(`globals.css`, `Chip.tsx`) 수정 — 영향 화면: 전 화면(S-00~S-16). 컴포넌트 Hex 리터럴 0줄 및 S-08 도달 띠 `bg-success-tint` 일치 |
| QA-I05 | 완료 | `scripts/build-data.mjs`, `src/data/generated/ips.json`, `public/data/catalog.json`, `public/images/og/*.png` | `4afe269` | 원어명에서 영문·일문 IP명 분리 및 `npm run data`·`npm run og` 재생성 (`/en/ip/pokemon/` title `Pokémon limited merch prices \| Oshi Vault` 확인) |
| QA-I06 | 완료 | `src/components/goods/HowToReadLink.tsx`, `src/components/goods/GoodsPriceSection.tsx`, `src/components/goods/RelatedGoods.tsx` | `da84073` | S-04 `이 숫자 읽는 법` 및 `RelatedGoods` 전체 보기 링크에 `internal_link_click` 추가 |
| QA-I07 | 완료 | `src/components/goods/MarketButtons.tsx`, `src/components/subscribe/SubscribeBox.tsx`, `src/components/guides/GuideCtaSlots.tsx`, `tests/unit/guides/GuideDetailView.test.tsx` | `4f7dc2c` | 슬롯 래퍼 `onClick` 제거, 실제 CTA 링크·버튼 클릭 시에만 `guide_cta_click` 1회 발생 |
| QA-I08 | 완료 | `src/components/collection/WishlistView.tsx`, `tests/unit/collection/WishlistView.test.tsx` | `b4e336a` | S-08 `SubscribeBox`를 `ClientSection` 밖(ready 상태)으로 이동해 빈 상태에서도 노출(프로덕션 mock 미렌더 유지) |
| QA-I09 | 완료 | `src/components/subscribe/SubscribeBox.tsx`, `src/messages/{ko,en,ja}.json`, `tests/unit/subscribe/SubscribeBox.test.tsx` | `a6f53d7` | C-09 동의 영역에 발송 주기 키(`subscribe.frequency`) 추가 |
| QA-I10 | 완료 | `src/messages/{ko,en,ja}.json`, `src/lib/data/images.ts`, `src/lib/share/renderCard.ts`, `src/app/page.tsx`, `src/app/[lang]/tools/premium-calculator/page.tsx`, `src/components/layout/{Header,Footer}.tsx`, `src/components/ui/Breadcrumb.tsx`, `src/components/goods/{GoodsActions,GoodsDetailView}.tsx`, `src/components/scan/ScanCamera.tsx`, `src/components/home/{AboutView,LegalView}.tsx`, `src/components/ip/{IpListView,IpHubHeader}.tsx`, `src/components/guides/{GuidesListView,GuideDetailView}.tsx` | `69574e1` | 공통 레이어(`images.ts`, `Header.tsx`, `Footer.tsx`, `Breadcrumb.tsx`) 수정 — 영향 화면: 전 화면(S-00~S-16). `aria-label` 메시지 파일화 및 브랜드 로고 `getBrandLogo` 단일 헬퍼화 |
| QA-I11 | 완료 | `scripts/gen-sitemap.mjs`, `scripts/check-seo.mjs` | `d81d0aa` | 빌드 공통 스크립트 수정 — 영향 화면: S-11, S-14, `out/` 배포 산출물. `_none` 센티널 디렉터리 제거 및 `seo:check` 검증 추가 |
| QA-I12 | 완료 | `src/components/ip/IpGoodsGrid.tsx` | `dcb07e5` | 375px 정렬 라벨 `shrink-0 whitespace-nowrap` 및 셀렉트 `min-w-0 flex-1` 적용 |
| QA-I13 | 완료 | `src/components/goods/GoodsDetailView.tsx` | `7756ec9` | S-04 메타 표 정가 확인일 `<dd>`에서 라벨 중복 제거(날짜만 출력) |
| QA-I14 | 완료 | `src/messages/ko.json` | `f467b5e` | `meta.ipHub.description`, `meta.ipType.description` 끝 이중 마침표 제거 |
| QA-I15 | 완료 | `tests/unit/goods/MarketButtons.test.tsx`, `tests/unit/analytics/track.test.ts` | `322d385` | `MarketButtons` 2개 마켓 우열·속성·URL 테스트 및 `affiliate_click`·localhost 차단 테스트 추가 |

### GROWTH 반영 점검

점검 완료 절: §1, §2, §3, §4(G-01~G-09), §5, §6, §9 및 페이지 생성 규칙 (1단계 QA-I01·QA-I05~I11·QA-I14 처리분 제외, 추가 미반영 1건 반영)

| GR-ID | GROWTH 절·ID | 미반영 내용 | 상태(완료/보류/실패) | 변경 파일 | 커밋 | 비고 |
|---|---|---|---|---|---|---|
| GR-01 | §4 G-02 / §6 `internal_link_click` | G-02 적용 화면인 S-16 프리미엄 계산기의 내부 링크(`trust.howToRead`, `calc.findGoods`, `cta.scan`) 클릭 시 `internal_link_click` 이벤트 미발생 | 완료 | `src/app/[lang]/tools/premium-calculator/page.tsx`, `src/components/calc/CalculatorCard.tsx`, `tests/unit/calc/CalculatorCard.test.tsx` | `15aca86` | `HowToReadLink` 재사용 및 계산기 CTA 링크 `internal_link_click` 이벤트·단위 테스트 추가 |
