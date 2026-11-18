<!-- DESIGN.md -->
# DESIGN.md — 오시볼트 (Oshi Vault)

입력: 확정표, GROWTH.md(승인본). 이미지는 전부 §5의 경로에 이미 존재한다고 전제한다.
카피 표의 `키`는 `src/messages/{ko,en,ja}.json`의 키다. `{}` 안은 런타임 치환값이다.

════════════════════════════════
## §1 마케팅 전략

### 1.1 타겟 페르소나

| 항목 | P1. 한국 일본 굿즈 수집가 (`/ko/`) | P2. 해외 수집가, 영어권·일본 (`/en/`, `/ja/`) |
|---|---|---|
| 상황 | 포켓몬센터·산리오·치이카와마켓·이치방쿠지 등 일본 한정판을 구매대행·국내 중고거래로 모은다. 품절·종료 상품을 뒤늦게 찾는 경우가 많다. | 영어권은 eBay·일본 구매대행으로 산다. 일본은 메루카리에서 직접 사고판다. |
| 해결하려는 문제 | ① 사려는 굿즈의 리셀가가 정가 대비 적정한지 ② 가진 굿즈가 지금 전부 얼마인지 | ①과 같음 + 엔화 정가와 현지 거래가 비교의 번거로움 |
| 지금 쓰는 대안 | 번개장터·메루카리·KREAM 개별 검색, 엑셀·메모 앱, 커뮤니티 시세 질문 | eBay Sold 필터, 메루카리 売り切れ 필터, 스프레드시트 |
| 선택 기준 | 가격 근거(마켓·건수·시점), 일본 정가와 즉시 비교, 한국어 검색 | 근거 공개, 원어명·품번으로 정확한 동일 상품 확인 |
| 망설이는 이유 | 시세 신뢰도, 카탈로그 규모(100~150건), 가입 요구 여부 | 같음 + 데이터 최신성 |

### 1.2 가치 제안
"한정판 굿즈의 정가와 마켓 거래가를 한 페이지에서 비교하고, 내 진열장의 총 가치를 바로 확인한다."
1. 굿즈 상세(S-04): 공식 정가, 마켓별 중간 거래가, 거래 건수, 기준일, 정가 대비 프리미엄, 추이 차트
2. 바코드·품번 스캔 등록(S-06)과 진열장 총 가치(S-07). 로그인 없이 브라우저에 저장
3. 위시리스트 목표가(S-08): 방문 시 도달 항목 표시, 마켓 링크 연결

### 1.3 차별점

| 지금 쓰는 대안 | 한계 | 오시볼트 |
|---|---|---|
| 마켓별 직접 검색 | 마켓·통화별 따로 검색, 정가는 공식몰에서 따로 확인 | 정가·마켓별 중간 거래가·통화 환산을 한 페이지에 |
| 엑셀·메모 | 가치 수동 계산, 수동 입력 | 스캔 등록, 총 가치·추이 자동 계산 |
| 커뮤니티 질문 | 응답 시점·근거 불명 | 거래 건수·기준일·원문 링크 공개 |

불리한 점(카탈로그 100~150건, 재빌드 시에만 갱신)은 S-12에 공개한다.

### 1.4 메시지 위계

| 순위 | ko | en | ja | 화면 |
|---|---|---|---|---|
| 1 | 정가 대비 지금 얼마인지, 거래가로 확인하세요 | See what it sells for now vs. retail | 定価と今の取引価格を比べられます | S-01 히어로, S-03 상단, S-04 시세 블록 위 |
| 2 | 바코드를 스캔해 내 진열장에 담으세요 | Scan a barcode to add it to your shelf | バーコードで棚に登録できます | S-01, S-06, S-07 빈 상태 |
| 3 | 목표가를 정해두면 도달한 굿즈를 표시해요 | Set a target price and we'll flag it | 目標価格に届いた商品を表示します | S-04 위시리스트 버튼 옆, S-08 상단 |

### 1.5 전환 퍼널

| 단계 | 행동 | 화면 | 이탈 요인 | 장치 |
|---|---|---|---|---|
| 1 유입 | 상품명·품번 검색 유입 | S-04, S-03, S-16, S-11 | 다른 상품, 시세 없음 | 원어명·품번·발매일·정가 상단, 시세 없으면 같은 IP 시세 보유 굿즈 상단 |
| 2 시세 확인 | 거래가·프리미엄 확인 | S-04 | 근거 불신 | 마켓·거래 건수·기준일·원문 링크, S-12 링크, 오래된 시세 라벨 |
| 3 1차 전환 | 마켓 링크 클릭 | S-04, S-08 | 이동 대상 불명 | 버튼에 마켓명, 외부 이동 아이콘, 버튼 옆 중간 거래가 |
| 4 저장 | 진열장·위시리스트 담기 | S-04, S-06 | 가입 요구 우려 | "로그인 없이 이 브라우저에 저장" 명시, 브라우저 데이터 삭제 시 소실 고지 |
| 5 스캔 실패 | 직접 등록 | S-06 | 막힘 | 직접 입력 폼 즉시 표시, 추적 요청 구독 제안 |
| 6 2차 전환 | Google 계정으로 구독 | S-04, S-06, S-08, S-11 (`api.mode=live`일 때만) | 스팸 우려 | 발송 내용·주기·해지 방법 명시, 동의 문구 버전 기록 |
| 7 공유 | 공유 카드 공유 | S-09 | 동기 부족 | S-07 항목 3개 이상이면 S-09 진입 버튼, 카드에 사이트 주소 표기 |

### 1.6 신뢰 장치
- 시세 근거 공개: 마켓, 거래 건수, 기준일, 원문 URL
- 정가 출처 공개: 공식몰 상품 URL, 검증일
- 산출 방법 공개(S-12): 가중평균, 환율 기준일, 90일 기준
- 어필리에이트 ID 설정 시 광고 고지
- 로그인 없이 사용, v1은 보유 목록을 서버로 보내지 않음
- 제공하지 않음: 사용자 후기, 사용자 수, 가격 보증, 매입 보장

### 1.7 톤앤매너 규칙

| 규칙 | 내용 |
|---|---|
| 문장 길이 | ko·ja 40자 이내, en 80자 이내 |
| 어미 | ko 해요체, ja です・ます체, en 2인칭 + sentence case |
| 버튼 | 동사로 끝낸다. 이동 버튼은 목적지 이름 포함 |
| 숫자 | 통화 기호 + 천 단위 구분, 프리미엄은 부호 필수(+38%, −12%), 색만으로 구분 금지 |
| 날짜 | 시세 옆에 항상 기준일 |
| 금지어 | 실시간, 최저가, 보장, 투자, 재테크, 수익 보장, 시세 예측, 떡상, 혁신적, 최고의, 1위 |
| 용어 치환 | 중앙값→중간 거래가, 표본수→거래 n건, JAN→바코드 번호, 스냅샷→사용 안 함 |
| 그대로 쓰는 용어 | 리셀, 프리미엄, 쿠지, 한정판, 시크릿 |
| IP 표기 | 권리사 공식 표기. 제휴·공인 오해 표현 금지. 푸터에 "비공식 팬 아카이브" |

### 1.8 CTA 문구

| 구분 | ko | en | ja |
|---|---|---|---|
| 1차 | {market}에서 매물 보기 | See listings on {market} | {market}で出品を見る |
| 2차 | 목표가 도달 메일 받기 | Email me at my target price | 目標価格のメールを受け取る |
| 보조 | 진열장에 담기 / 바코드로 등록하기 | Add to my shelf / Scan barcode | 棚に追加 / バーコードで登録 |

════════════════════════════════
## §2 브랜드

- 사이트명: ko `오시볼트` / en `Oshi Vault` / ja `オシボルト`
- 슬로건: ko `내 최애 굿즈의 지금 가치` / en `What your favorite merch is worth now` / ja `推しグッズの、いまの価値`
- 워드마크: 이미지가 아니라 HTML 텍스트다. 폰트는 §3 `--font-sans`, 20px/700, 자간 -0.01em, 색 `--color-secondary`. ko·ja 페이지에서도 헤더 워드마크는 `Oshi Vault`로 통일한다. 각 언어 이름은 `<title>`과 본문에서 쓴다.

### 로고 심볼 컨셉
- 형태: 모서리가 둥근 정사각형 진열 케이스(금고 문 비율). 안쪽 중앙에 4꼭지 반짝임 별 하나. 케이스 우측 가장자리에 작은 원형 다이얼 하나.
- 상징: 케이스·다이얼 = 보관(Vault), 별 = 최애(推し).
- 색: 케이스 `--color-secondary`(#3B2F6B), 별 `--color-primary`(#C2410C), 다이얼 `--color-border`(#E4DFD7).

### 웹 아이콘 생성 프롬프트
```
Logo symbol for a collectibles archive website. A rounded square display case shaped like a vault door, solid deep violet (#3B2F6B), with a single four-pointed sparkle star centered inside in burnt orange (#C2410C), and one small circular dial on the right edge in warm light gray (#E4DFD7). Flat vector, geometric, even stroke-free shapes, centered on a transparent background, square 1:1 canvas, 10% padding on all sides. No text, no letters, no gradients, no shadows, no 3D, no characters, no mascots.
```

### 파비콘 생성 프롬프트
```
Favicon, extremely simplified. A solid deep violet (#3B2F6B) rounded square filling 90% of the canvas, with one bold four-pointed star in burnt orange (#C2410C) centered, star width 55% of the square. No dial, no outlines, no thin lines, no details smaller than 2px at 16x16. Flat vector, transparent background, square 1:1. No text, no letters, no gradients, no shadows.
```

### 필요 파일

| 파일 | 경로 | 픽셀 크기 | 원본 | 용도 |
|---|---|---|---|---|
| favicon.ico | `src/app/favicon.ico` | 16·32·48 멀티 사이즈 | 파비콘 프롬프트 결과 | 브라우저 탭 |
| icon.png | `src/app/icon.png` | 512×512 | 파비콘 프롬프트 결과 | Next 파일 규칙 아이콘 |
| apple-icon.png | `src/app/apple-icon.png` | 180×180, 배경 #FAF8F5 불투명 | 웹 아이콘 프롬프트 결과 | iOS 홈 화면 |
| icon-192.png | `public/icons/icon-192.png` | 192×192 | 웹 아이콘 프롬프트 결과 | `public/manifest.webmanifest` |
| icon-512.png | `public/icons/icon-512.png` | 512×512 | 웹 아이콘 프롬프트 결과 | `public/manifest.webmanifest` |
| logo-symbol.svg | `public/images/brand/logo-symbol.svg` | 벡터, viewBox 0 0 64 64 | 웹 아이콘 프롬프트 결과를 벡터화 | 헤더·푸터 심볼 |
| logo-symbol-mono.svg | `public/images/brand/logo-symbol-mono.svg` | 벡터, 단색 #FFFFFF | logo-symbol.svg 단색화 | 푸터(어두운 배경), 공유 카드 |
| og-default-{ko,en,ja}.png | `public/images/og/og-default-{lang}.png` | 1200×630 | `scripts/gen-og.ts`가 IMG-03 위에 텍스트를 합성 | S-00·S-01·S-02·S-05~S-16 OG |
| og-ip-{ipSlug}-{lang}.png | `public/images/og/og-ip-{ipSlug}-{lang}.png` | 1200×630 | `scripts/gen-og.ts`가 IMG-03 위에 IP명을 합성 | S-03·S-04·S-14 OG |
| manifest.webmanifest | `public/manifest.webmanifest` | — | 직접 작성 | name "Oshi Vault", theme_color #3B2F6B, background_color #FAF8F5 |

OG 합성 템플릿(gen-og): 배경 IMG-03. 좌측 상단 64px 여백에 logo-symbol-mono.svg 64px. 좌측 하단에 1줄 제목(56px/700, #FFFFFF, 최대 2줄)과 슬로건(28px/400, #D9D4E8).

════════════════════════════════
## §3 디자인 시스템

`src/app/globals.css`의 Tailwind `@theme`에 아래 이름 그대로 정의한다. 라이트 테마 단일.

### 색

| 토큰 | 값 | 용도 | 대비 |
|---|---|---|---|
| `--color-primary` | #C2410C | 1차 CTA 배경, 링크 강조, 로고 별 | 흰 글자 5.18:1 |
| `--color-primary-hover` | #A8370A | 1차 CTA hover | 흰 글자 6.53:1 |
| `--color-secondary` | #3B2F6B | 브랜드, 2차 버튼 테두리·글자, 푸터 배경, 헤딩 | 흰 글자 11.64:1 |
| `--color-secondary-hover` | #2E2456 | 2차 버튼 hover 글자 | — |
| `--color-secondary-tint` | #F1EEF8 | 2차 버튼 hover 배경, 선택 칩 배경 | secondary 글자 10.15:1 |
| `--color-text` | #1C1A24 | 본문 | bg 대비 16.2:1 |
| `--color-text-muted` | #5E5A6B | 보조 텍스트, 메타 | bg 6.29:1 / surface 6.67:1 |
| `--color-text-on-dark` | #FFFFFF | 어두운 배경 위 글자 | — |
| `--color-text-on-dark-muted` | #D9D4E8 | 푸터 보조 글자 | secondary 위 8.05:1 |
| `--color-bg` | #FAF8F5 | 페이지 배경 | — |
| `--color-surface` | #FFFFFF | 카드, 헤더, 입력 | — |
| `--color-border` | #E4DFD7 | 카드·입력 테두리, 구분선 | — |
| `--color-success` | #1F7A4D | 양(+) 프리미엄, 목표가 도달, 성공 | surface 5.32:1 |
| `--color-warning` | #B45309 | 오래된 시세 라벨 | surface 5.02:1 |
| `--color-danger` | #C0262D | 음(−) 프리미엄, 에러 | surface 5.9:1 |
| `--color-disabled-bg` | #EEEBE5 | 비활성 버튼 배경 | — |
| `--color-disabled-text` | #8C8797 | 비활성 버튼 글자 | 예외(비활성) |
| `--color-focus` | #C2410C | 포커스 링 | — |
| `--color-chart-ebay` | #2563A8 | 차트 eBay 선 | — |
| `--color-chart-mercari` | #B4235A | 차트 Mercari 선 | — |
| `--color-chart-kream` | #1C1A24 | 차트 KREAM 선 | — |
| `--color-chart-other` | #6B7A2E | 차트 기타 마켓 선 | — |
| `--color-chart-retail` | #5E5A6B | 차트 정가 기준선(점선) | — |
| `--color-chart-grid` | #E4DFD7 | 차트 격자 | — |

### 폰트
- `--font-sans`: 언어별로 next/font 변수를 지정한다. ko `Noto Sans KR`, ja `Noto Sans JP`, en `Inter`. fallback은 `system-ui, -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Hiragino Sans", sans-serif`.
- 가격·퍼센트·날짜는 `font-variant-numeric: tabular-nums`.

| 스타일 | 데스크톱(≥768) px / line-height / weight | 모바일(<768) |
|---|---|---|
| h1 | 40 / 48 / 700 | 28 / 36 / 700 |
| h2 | 28 / 36 / 700 | 22 / 30 / 700 |
| h3 | 20 / 28 / 600 | 18 / 26 / 600 |
| h4 | 16 / 24 / 600 | 16 / 24 / 600 |
| body | 16 / 26 / 400 | 16 / 26 / 400 |
| small | 13 / 20 / 400 | 13 / 20 / 400 |
| price-xl (S-04·S-07 대표 숫자) | 36 / 44 / 700 | 30 / 38 / 700 |
| label (칩, 배지) | 12 / 16 / 600 | 12 / 16 / 600 |

### 여백·레이아웃

| 토큰 | px |
|---|---|
| `--space-1` | 4 |
| `--space-2` | 8 |
| `--space-3` | 12 |
| `--space-4` | 16 |
| `--space-5` | 24 |
| `--space-6` | 32 |
| `--space-7` | 48 |
| `--space-8` | 64 |
| `--space-9` | 96 |

- 섹션 간 여백: ≥1024px `--space-9`, 768~1023px `--space-8`, <768px `--space-7`
- 컨테이너 최대 폭 1200px. 좌우 패딩: 375 → 16, 768 → 24, 1440 → 32
- 본문 가독 폭(S-11·S-12·S-13 본문): 최대 720px

### 라운드·그림자·테두리

| 토큰 | 값 |
|---|---|
| `--radius-sm` | 6px (칩, 배지) |
| `--radius-md` | 10px (버튼, 입력) |
| `--radius-lg` | 16px (카드, 모달) |
| `--radius-full` | 9999px (아바타, 숫자 배지) |
| `--shadow-card` | 0 1px 2px rgba(28,26,36,0.06), 0 1px 3px rgba(28,26,36,0.08) |
| `--shadow-raised` | 0 8px 24px rgba(28,26,36,0.12) (드롭다운, 하단 고정 바, 토스트) |
| `--border-width` | 1px (기본), 1.5px (2차 버튼), 2px (포커스 링, 강조 카드) |

### 버튼

| 종류 | 높이 | 패딩(좌우) | 글자 | 배경 / 테두리 | hover | disabled |
|---|---|---|---|---|---|---|
| 1차 `btn-primary` | 48px (모바일 고정 바 안 52px) | 20px | 16/600 `--color-text-on-dark` | `--color-primary` / 없음 | 배경 `--color-primary-hover` | 배경 `--color-disabled-bg`, 글자 `--color-disabled-text`, cursor not-allowed |
| 2차 `btn-secondary` | 48px | 20px | 16/600 `--color-secondary` | `--color-surface` / 1.5px `--color-secondary` | 배경 `--color-secondary-tint`, 글자 `--color-secondary-hover` | 테두리 `--color-border`, 글자 `--color-disabled-text` |
| 텍스트 `btn-text` | 40px | 8px | 15/600 `--color-secondary` | 없음 | 밑줄(1px, offset 3px) | 글자 `--color-disabled-text` |
| 아이콘 `btn-icon` | 40×40px | 0 | 아이콘 24px `--color-text` | 없음 | 배경 `--color-secondary-tint` | 아이콘 `--color-disabled-text` |

- 모든 버튼 radius `--radius-md`, 포커스: `outline: 2px solid var(--color-focus); outline-offset: 2px`
- 외부 이동 버튼은 문구 뒤 16px 외부 링크 아이콘. 새 탭으로 연다.
- 터치 대상 최소 44×44px.

### 브레이크포인트와 그리드

| 기준 | 적용 범위 | 열 | 거터 | 좌우 패딩 |
|---|---|---|---|---|
| 375 | <768px | 4 | 16px | 16px |
| 768 | 768~1023px | 8 | 24px | 24px |
| 1440 | ≥1024px | 12 | 24px | 32px, 컨테이너 1200px 중앙 |

굿즈 카드 그리드: <768 2열, 768~1023 3열, ≥1024 4열.

### 아이콘·모션
- 아이콘: 선형(line), stroke 1.75px, 24px 그리드, round cap/join, 색 `currentColor`. 라이브러리 없이 `src/components/ui/icons.tsx`에 인라인 SVG로 정의. 필요 목록: search, scan, shelf, heart, heart-filled, external, globe, chevron-down, chevron-right, close, menu, plus, minus, trash, share, download, camera, upload, info, check, alert, arrow-up-right, arrow-down-right, calculator, book.
- 전환: 색·배경 150ms ease-out / 드롭다운·시트·하단 고정 바 200ms ease-out(opacity + translateY 8px) / 토스트 200ms 등장, 3000ms 유지.
- `prefers-reduced-motion: reduce`이면 모든 transform 전환을 0ms로 바꾼다.

════════════════════════════════
## §4 화면별 상세 디자인

### §4.0 공통 컴포넌트 (모든 화면이 참조)

#### C-01 헤더 (`src/components/layout/Header.tsx`)
- 높이 64px(<768: 56px), 배경 `--color-surface`, 하단 1px `--color-border`, 스크롤 시 상단 고정(sticky).
- ≥1024: 좌측 심볼 32px + 워드마크 / 중앙 내비 링크 4개(간격 `--space-6`) / 우측 아이콘 버튼 순서: 검색(S-05), 진열장(S-07), 위시리스트(S-08, G-08 배지), 언어 선택기(C-02).
- <1024: 좌측 심볼 28px + 워드마크 / 우측 검색, 위시리스트(배지), 메뉴 버튼. 메뉴는 우측에서 밀려 나오는 시트(폭 min(320px, 85vw), `--shadow-raised`, 200ms)이며, 내비 링크 4개 + 진열장 링크 + 언어 선택기(세그먼트형)를 담는다.
- G-08 배지: 위시리스트 아이콘 우상단, 18px 원형 `--color-success` 배경, 흰 12/600 숫자. 도달 0건이면 숨김.

| 키 | ko | en | ja |
|---|---|---|---|
| nav.ip | IP별 굿즈 | Browse by IP | IP別グッズ |
| nav.guides | 가이드 | Guides | ガイド |
| nav.calculator | 프리미엄 계산기 | Premium calculator | プレ値計算 |
| nav.scan | 바코드 등록 | Scan barcode | バーコード登録 |
| nav.collection | 내 진열장 | My shelf | マイ棚 |
| nav.wishlist | 위시리스트 | Wishlist | ウィッシュリスト |
| nav.search | 검색 | Search | 検索 |
| nav.menu | 메뉴 | Menu | メニュー |
| nav.wishlistBadge | 목표가 도달 {n}건 | {n} at target price | 目標価格到達 {n}件 |

가이드 문서가 0개인 언어에서는 `nav.guides`를 렌더링하지 않는다(G-03).

#### C-02 언어 선택기 (G-07, `src/components/layout/LanguageSelect.tsx`)
- 헤더형: `btn-text` + globe 아이콘 + 현재 언어명 + chevron-down. 클릭 시 아래로 드롭다운(폭 180px, `--color-surface`, `--radius-md`, `--shadow-raised`). 항목 3개는 `<a hreflang>` 링크이고 현재 언어에 check 아이콘.
- 링크 대상: 현재 페이지의 해당 언어 URL이 존재하면 그 URL, 없으면 그 언어의 S-01.
- 시트·푸터형: 3칸 세그먼트(높이 40px, 선택 칸 배경 `--color-secondary-tint`, 글자 `--color-secondary`).
- 언어명은 각 언어 자기 표기로 고정: `한국어`, `English`, `日本語`. 라벨 키 `lang.label`: ko 언어 / en Language / ja 言語.

#### C-03 푸터 (`src/components/layout/Footer.tsx`)
- 배경 `--color-secondary`, 글자 `--color-text-on-dark`, 상하 패딩 `--space-8`.
- ≥1024: 4열(심볼 mono 32px + 워드마크 + 슬로건 / 둘러보기 / 정보 / 언어 선택기 세그먼트). <1024: 1열 스택.
- 하단 구분선(1px rgba(255,255,255,0.16)) 아래: 비공식 고지(G-09), 광고 고지(config에 어필리에이트 ID가 하나라도 있을 때만), 저작권 줄. 글자 `--color-text-on-dark-muted` small.

| 키 | ko | en | ja |
|---|---|---|---|
| footer.explore | 둘러보기 | Explore | さがす |
| footer.info | 정보 | About | 情報 |
| footer.about | 데이터 출처와 계산 방법 | Data sources & methods | データ出典と計算方法 |
| footer.privacy | 개인정보처리방침 | Privacy policy | プライバシーポリシー |
| footer.terms | 이용약관 | Terms of use | 利用規約 |
| footer.unofficial | 오시볼트는 비공식 팬 아카이브예요. 각 IP의 권리는 권리사에 있어요. | Oshi Vault is an unofficial fan archive. Each IP belongs to its owner. | オシボルトは非公式のファンアーカイブです。各IPの権利は権利者に帰属します。 |
| footer.affiliate | 일부 마켓 링크는 제휴 링크예요. 구매 시 수수료를 받을 수 있어요. | Some market links are affiliate links. We may earn a commission. | 一部のマーケットリンクはアフィリエイトリンクです。購入時に手数料を受け取る場合があります。 |
| footer.copyright | © {year} Oshi Vault | © {year} Oshi Vault | © {year} Oshi Vault |

#### C-04 굿즈 카드 (`src/components/goods/GoodsCard.tsx`)
- 카드 전체가 S-04 링크. 배경 `--color-surface`, 1px `--color-border`, `--radius-lg`, `--shadow-card`, 패딩 `--space-3`.
- 위에서 아래: 1:1 썸네일(GoodsPlaceholder 인라인 SVG, `--radius-md`) / IP명 label `--color-text-muted` / 상품명 h4 2줄 말줄임 / 정가 small / 중간 거래가(16/700) + C-05 배지. 시세 없으면 `goods.priceCollecting` 칩.
- hover: 테두리 `--color-secondary`, `--shadow-raised`, 150ms. 포커스: 포커스 링.

| 키 | ko | en | ja |
|---|---|---|---|
| goods.retail | 정가 {price} | Retail {price} | 定価 {price} |
| goods.median | 중간 거래가 | Median sold price | 取引価格の中央値 |
| goods.priceCollecting | 시세 수집 중 | Collecting prices | 相場を収集中 |

#### C-05 프리미엄 배지 (`PremiumBadge`)
- 높이 22px, 패딩 0 6px, `--radius-sm`, label 스타일. 양수: 글자 `--color-success` + arrow-up-right 14px, 배경 #E8F3EC. 음수: 글자 `--color-danger` + arrow-down-right, 배경 #F9E7E8. 0: 글자 `--color-text-muted`, 배경 `--color-bg`. 텍스트는 항상 부호 포함(`+38%`, `−12%`, `±0%`).

#### C-06 신뢰 줄 (G-09, `TrustLine`)
- small `--color-text-muted`, 항목을 ` · `로 구분: 마켓명 · `trust.samples` · `trust.asOf` · `trust.source`(외부 링크). 90일 초과 시 앞에 C-07.

| 키 | ko | en | ja |
|---|---|---|---|
| trust.samples | 거래 {n}건 | {n} sales | 取引{n}件 |
| trust.asOf | 기준일 {date} | As of {date} | 基準日 {date} |
| trust.source | 원문 보기 | View source | 元データを見る |
| trust.howToRead | 이 숫자 읽는 법 | How to read these numbers | この数字の読み方 |

#### C-07 오래된 시세 칩
- label 스타일, 글자 `--color-warning`, 배경 #FBF0E4, `--radius-sm`, info 아이콘 12px. 키 `trust.stale`: ko 오래된 시세 / en Older data / ja 古い相場.

#### C-08 마켓 버튼 그룹 (1차 CTA, `MarketButtons`)
- 시세 데이터가 있는 마켓만 버튼으로 만든다. 정렬: 최신 일자의 거래 건수 내림차순.
- 첫 버튼만 `btn-primary`, 나머지는 `btn-secondary`. 각 버튼 오른쪽 또는 아래에 그 마켓 중간 거래가(small `--color-text-muted`).
- 시세가 없는 굿즈: 버튼 대신 마켓 검색 URL을 `btn-secondary`로 최대 3개(eBay, Mercari, KREAM), 1차 스타일 사용 금지.
- 문구는 §1.8 1차 CTA. 마켓명 표기: `eBay`, `Mercari`, `KREAM`, 기타는 시세 시트 값.
- 그룹 아래 1줄: `cta.leaveNote` + 광고 고지(어필리에이트 ID 설정 시).

| 키 | ko | en | ja |
|---|---|---|---|
| cta.primary | {market}에서 매물 보기 | See listings on {market} | {market}で出品を見る |
| cta.leaveNote | 외부 마켓으로 이동해요. 오시볼트는 상품을 판매하지 않아요. | Opens an external market. Oshi Vault doesn't sell items. | 外部マーケットに移動します。オシボルトは商品を販売していません。 |
| cta.searchMarket | {market}에서 검색하기 | Search on {market} | {market}で検索する |

#### C-09 구독 폼 (G-06, `src/components/subscribe/SubscribeBox.tsx`)
- `api.mode=mock`인 프로덕션 빌드에서는 렌더링하지 않는다.
- 카드: `--color-surface`, 1px `--color-border`, `--radius-lg`, 패딩 `--space-5`. ≥768: 좌측 IMG-22(96×96) + 우측 내용. <768: IMG-22 64×64 위, 내용 아래.
- 단계 1(접힘): 제목 + 본문 1줄 + `btn-secondary` `cta.secondary`. 클릭 시 `subscribe_cta_click` 발생, 단계 2로 펼침(200ms 높이 전환).
- 단계 2(펼침): 동의 체크박스(기본 해제, 20px, 라벨 small) + Google Identity Services 버튼(`renderButton`, theme outline, size large, text continue_with, width 280). 체크 전에는 GIS 버튼을 감싼 래퍼를 opacity 0.4 + pointer-events none으로 비활성화하고 `subscribe.needConsent`를 표시한다.
- 전송 중: GIS 버튼 자리에 스피너 20px + `subscribe.sending`. 성공: check 아이콘 + `subscribe.success` + `subscribe.successNote`. 실패: alert 아이콘 `--color-danger` + `errors.{code}` 문구 + `btn-text` `subscribe.retry`.
- topic: S-04(시세 있음)·S-08 → `target_price`, S-04(시세 없음)·S-06(미등록) → `tracking_request`. 제목·본문은 topic별.

| 키 | ko | en | ja |
|---|---|---|---|
| cta.secondary | 목표가 도달 메일 받기 | Email me at my target price | 目標価格のメールを受け取る |
| subscribe.targetTitle | 목표가에 닿으면 메일로 알려드려요 | Get an email when it hits your target | 目標価格に届いたらメールでお知らせします |
| subscribe.targetBody | 위시리스트 목표가에 도달한 굿즈만 보내요. | We only email when a wishlist item hits your target. | ウィッシュリストの目標価格に届いた商品だけお送りします。 |
| subscribe.trackTitle | 시세가 등록되면 알려드려요 | Get notified when prices are added | 相場が登録されたらお知らせします |
| subscribe.trackBody | 요청한 굿즈의 시세 추적 결과만 보내요. | We only email results for items you requested. | リクエストした商品の相場結果だけお送りします。 |
| subscribe.trackCta | 시세 추적 요청 메일 받기 | Email me when it's tracked | 相場追跡のメールを受け取る |
| subscribe.consent | [필수] 위 내용의 이메일 수신과 개인정보처리방침에 동의해요. | [Required] I agree to these emails and the privacy policy. | [必須] 上記メールの受信とプライバシーポリシーに同意します。 |
| subscribe.unsubscribe | 메일 하단 링크로 언제든 해지할 수 있어요. | Unsubscribe anytime from the link in each email. | 各メールのリンクからいつでも解除できます。 |
| subscribe.needConsent | 동의에 체크하면 Google 계정으로 계속할 수 있어요. | Check the box to continue with Google. | 同意にチェックするとGoogleで続行できます。 |
| subscribe.sending | 등록하고 있어요 | Subscribing | 登録しています |
| subscribe.success | 구독했어요 | You're subscribed | 登録しました |
| subscribe.successNote | 확인 메일을 보냈어요. 해지는 메일 하단 링크로 할 수 있어요. | We sent a confirmation email. Unsubscribe from its footer link. | 確認メールを送りました。解除はメール下部のリンクからできます。 |
| subscribe.retry | 다시 시도하기 | Try again | もう一度試す |

`trackCta`는 topic이 `tracking_request`일 때 단계 1 버튼 문구로 쓴다(2차 CTA 계열, 스타일 동일).

#### C-10 관련 굿즈 블록 (G-02, `RelatedGoods`)
- 제목 h3 `related.goodsTitle` + 우측 `btn-text` `related.goodsMore`(S-03 링크). 같은 IP 굿즈 최대 6개(현재 굿즈 제외, 시세 있는 굿즈 우선). C-04 그리드.
- 키: `related.goodsTitle` ko 같은 IP의 다른 굿즈 / en More from this IP / ja 同じIPのほかのグッズ. `related.goodsMore` ko {ip} 굿즈 전체 보기 / en See all {ip} merch / ja {ip}のグッズをすべて見る.

#### C-11 관련 가이드 블록 (G-02, `RelatedGuides`)
- 제목 h3 `related.guidesTitle`(ko 관련 가이드 / en Related guides / ja 関連ガイド). 리스트 카드 최대 3개: 좌측 커버 16:9 120px 폭(<768 96px), 우측 제목 h4 + 설명 small 2줄 말줄임. 해당 문서 0개면 블록을 렌더링하지 않는다.

#### C-12 브레드크럼
- small `--color-text-muted`, 구분 chevron-right 14px, 마지막 항목은 링크 아님 `--color-text`. 루트 키 `breadcrumb.home`: ko 홈 / en Home / ja ホーム.

#### C-13 저장 토스트
- 화면 하단 중앙(≥768: 우하단 `--space-5`), 폭 max 360px, 배경 `--color-text`, 글자 흰색, `--radius-md`, `--shadow-raised`. 우측 `btn-text`(글자 #FFFFFF) 링크.
- 키: `toast.addedShelf` ko 진열장에 담았어요 / en Added to your shelf / ja 棚に追加しました. `toast.addedWish` ko 위시리스트에 담았어요 / en Added to your wishlist / ja ウィッシュリストに追加しました. `toast.view` ko 보기 / en View / ja 見る.

#### C-14 GA 동의 배너
- 첫 방문 시 화면 하단 전체 폭, `--color-surface`, 상단 1px `--color-border`, `--shadow-raised`, 패딩 `--space-4`. 문구 + 버튼 2개(둘 다 `btn-secondary`, 같은 크기). 선택 전 GA 미로드.
- 키: `consent.text` ko 방문 통계 수집에 동의하나요? 동의하면 Google Analytics를 사용해요. / en Allow visit statistics? We use Google Analytics if you agree. / ja 閲覧統計の収集に同意しますか?同意するとGoogle Analyticsを使用します。 `consent.accept` ko 동의하기 / en Allow / ja 同意する. `consent.reject` ko 거부하기 / en Decline / ja 拒否する.

#### C-15 로컬 저장 고지
- small `--color-text-muted` + info 14px. 키 `storage.note`: ko 로그인 없이 이 브라우저에 저장해요. 브라우저 데이터를 지우면 사라져요. / en Saved in this browser without login. Clearing browser data removes it. / ja ログインなしでこのブラウザに保存します。ブラウザのデータを消すと消えます。

#### 공통 에러 문구 (`errors.{code}`)

| 키 | ko | en | ja |
|---|---|---|---|
| errors.INVALID_REQUEST | 입력 내용을 확인해 주세요. | Please check your input. | 入力内容をご確認ください。 |
| errors.UNAUTHORIZED | Google 인증이 만료됐어요. 다시 시도해 주세요. | Google sign-in expired. Please try again. | Google認証の期限が切れました。もう一度お試しください。 |
| errors.FORBIDDEN | 이 요청은 처리할 수 없어요. | This request can't be processed. | このリクエストは処理できません。 |
| errors.NOT_FOUND | 요청한 정보를 찾을 수 없어요. | We couldn't find that. | 情報が見つかりません。 |
| errors.CONFLICT | 이미 처리된 요청이에요. | This was already processed. | すでに処理済みです。 |
| errors.RATE_LIMITED | 잠시 후 다시 시도해 주세요. | Please try again shortly. | しばらくしてからお試しください。 |
| errors.INTERNAL | 일시적인 문제가 생겼어요. | Something went wrong on our side. | 一時的な問題が発生しました。 |
| errors.NETWORK | 네트워크 연결을 확인해 주세요. | Check your network connection. | ネットワーク接続をご確認ください。 |

---

### S-00 언어 선택 (`/`)
- 목적: 퍼널 1단계. 언어가 맞지 않아 이탈하는 것을 막는다(G-07). index, hreflang x-default 대상.
- 헤더·푸터 없음. 페이지 배경 `--color-bg`. 컨테이너 최대 720px 중앙.
- 섹션 1 상단: IMG-02 중앙, 폭 min(320px, 80%). 아래 `--space-5`에 심볼 40px + 워드마크.
- 섹션 2 소개: h1 `Oshi Vault` 중앙. 아래 3줄 각 언어 슬로건(body `--color-text-muted`, 중앙).
- 섹션 3 언어 카드: 3장. ≥768 3열, <768 1열 스택, 간격 `--space-4`. 카드 = `<a hreflang href="/{lang}/">`, `--color-surface`, 1px `--color-border`, `--radius-lg`, 패딩 `--space-5`, 높이 최소 96px. 내용: 언어명 h3 + 그 언어 문구 small + chevron-right 우측. `navigator.language`와 일치하는 카드만 테두리 2px `--color-primary` + 상단 우측 label 칩(배경 `--color-primary`, 흰 글자). 일치 없으면 강조 없음. 자동 이동 없음.

| 키(언어 무관 고정 문자열, `src/messages/root.json`) | 값 |
|---|---|
| root.ko.name / root.ko.desc / root.ko.suggest | 한국어 / 한정판 굿즈 정가와 거래가 비교 / 추천 |
| root.en.name / root.en.desc / root.en.suggest | English / Compare retail and sold prices of limited merch / Suggested |
| root.ja.name / root.ja.desc / root.ja.suggest | 日本語 / 限定グッズの定価と取引価格を比較 / おすすめ |

- 반응형: 375 카드 1열, IMG-02 폭 240px / 768 3열 / 1440 3열, 컨테이너 720px.
- 상태: 로딩·빈·에러 없음(정적). 강조 판정 JS 실패 시 강조 없이 표시.
- 인터랙션: 카드 hover 테두리 `--color-secondary` + `--shadow-raised` 150ms. 포커스 링.

### S-01 홈 (`/{lang}/`)
- 목적: 퍼널 1단계(브랜드 유입) → 2단계. 검색으로 굿즈 상세에 도달시킨다.
- 섹션 1 히어로: ≥1024 2열(좌 6열 텍스트, 우 6열 IMG-01 세로 중앙, object-fit contain). 배경 `--color-bg`. 상하 패딩 `--space-8`.
  - eyebrow label `--color-primary` / h1 메시지 1순위 / 본문 `--color-text-muted` / 검색 입력(높이 52px, 폭 100% max 520px, 좌측 search 아이콘, `--radius-md`, 1px `--color-border`, 포커스 시 2px `--color-secondary`) + 입력 우측 내부 `btn-primary` 버튼 `home.searchButton` / 입력 아래 small 예시 칩 3개(데이터에서 시세 있는 굿즈 상위 3개 상품명, 클릭 시 S-04).
  - 제출 시 `/{lang}/search/?q={입력}` 이동.
- 섹션 2 프리미엄 큰 굿즈: h2 + 부제 small(기준일 포함). C-04 8개(프리미엄 내림차순, 시세 있는 굿즈만). 시세 있는 굿즈가 4개 미만이면 h2를 `home.recentTitle`로 바꾸고 최초수집일 내림차순 8개. 하단 중앙 `btn-text` `home.allIp`(S-02).
- 섹션 3 진열장 소개: 배경 `--color-surface` 전체 폭 띠. ≥1024 2열(좌 IMG-07, 우 텍스트). h2 메시지 2순위 + 본문 + `btn-secondary` `cta.scan`(S-06) + C-15.
- 섹션 4 IP별로 보기: h2 + 칩 목록(굿즈 있는 IP 전부, 칩 = IP명 + 굿즈 수, 높이 36px, 1px `--color-border`, `--radius-full`, hover `--color-secondary-tint`). 클릭 시 S-03.
- 섹션 5 목표가: ≥1024 2열(좌 텍스트, 우 IMG-09 축소 240px). h2 메시지 3순위 + 본문 + `btn-text` `home.toWishlist`(S-08).
- 섹션 6 계산 방식: h2 + 3열 카드(<768 1열). 카드 = 아이콘 32px `--color-secondary` + h4 + small. 하단 `btn-text` `trust.howToRead`(CT-05가 있으면 CT-05, 없으면 S-12).
- 섹션 7 가이드: h2 + C-11과 같은 리스트 카드 최대 3개(updated 내림차순). 문서 0개면 섹션 미렌더링.

| 키 | ko | en | ja |
|---|---|---|---|
| home.eyebrow | 한정판 굿즈 아카이브 | Limited merch archive | 限定グッズアーカイブ |
| home.h1 | 정가 대비 지금 얼마인지, 거래가로 확인하세요 | See what it sells for now vs. retail | 定価と今の取引価格を比べられます |
| home.lead | 마켓별 중간 거래가와 거래 건수, 기준일을 함께 보여드려요. | We show median sold prices, sale counts, and dates by market. | マーケット別の取引価格の中央値、件数、基準日を表示します。 |
| home.searchPlaceholder | 상품명, 품번, 바코드 번호 | Product name, code, or barcode | 商品名・品番・JANコード |
| home.searchButton | 검색하기 | Search | 検索する |
| home.premiumTitle | 정가보다 거래가가 높은 굿즈 | Selling above retail | 定価より高く取引されているグッズ |
| home.premiumSub | 기준일 {date} 데이터예요. | Data as of {date}. | 基準日 {date} のデータです。 |
| home.recentTitle | 최근 등록한 굿즈 | Recently added | 最近追加したグッズ |
| home.allIp | IP별 굿즈 전체 보기 | Browse all IPs | IP別にすべて見る |
| home.shelfTitle | 바코드를 스캔해 내 진열장에 담으세요 | Scan a barcode to add it to your shelf | バーコードで棚に登録できます |
| home.shelfBody | 담은 굿즈의 총 가치와 정가 대비 차이를 계산해요. | We total your shelf's value and its difference from retail. | 登録したグッズの合計価値と定価との差を計算します。 |
| cta.scan | 바코드로 등록하기 | Scan barcode | バーコードで登録 |
| home.ipTitle | IP별로 보기 | Browse by IP | IP別に見る |
| home.wishTitle | 목표가를 정해두면 도달한 굿즈를 표시해요 | Set a target price and we'll flag it | 目標価格に届いた商品を表示します |
| home.wishBody | 굿즈 상세에서 위시리스트에 담고 목표가를 입력하세요. | Add items to your wishlist on their page and set a price. | 商品ページでウィッシュリストに追加し、目標価格を入力します。 |
| home.toWishlist | 위시리스트 보기 | View wishlist | ウィッシュリストを見る |
| home.howTitle | 시세는 이렇게 계산해요 | How prices are calculated | 相場の計算方法 |
| home.how1Title / home.how1Body | 중간 거래가 / 판매완료 거래의 중간값을 써요. | Median sold price / We use the middle value of completed sales. | 取引価格の中央値 / 取引済み価格の中央値を使います。 |
| home.how2Title / home.how2Body | 거래 건수 가중 / 거래가 많은 마켓에 더 큰 비중을 둬요. | Weighted by sales / Markets with more sales count more. | 件数で加重 / 取引が多いマーケットを重視します。 |
| home.how3Title / home.how3Body | 기준일 표시 / 모든 시세에 데이터 날짜를 붙여요. | Dated data / Every price shows its data date. | 基準日を表示 / すべての相場にデータ日付を付けます。 |
| home.guidesTitle | 수집 가이드 | Collector guides | コレクターガイド |

- 반응형: 375 히어로 1열(텍스트 → IMG-01 폭 100% max 320px, 검색 입력 아래 버튼이 입력 밖 전체 폭으로 이동), 카드 2열 / 768 히어로 1열, IMG-01 우측 정렬 360px, 카드 3열 / 1440 2열 히어로, 카드 4열.
- 상태: 정적(로딩 없음). 시세 굿즈 0개는 섹션 2 대체 규칙 적용. 굿즈 0개(빌드 실패 조건이므로 발생 안 함).
- 인터랙션: 검색 입력 포커스 테두리 150ms, 칩·카드 hover 150ms.

### S-02 IP 목록 (`/{lang}/ip/`)
- 목적: 퍼널 1단계 탐색 허브. S-03으로 보낸다.
- 섹션 1 헤더: C-12 / ≥1024 2열(좌 h1 + 본문, 우 IMG-04 360px, 세로 중앙). 배경 `--color-bg`.
- 섹션 2 IP 그리드: <768 1열, 768 2열, ≥1024 3열. IP 카드 = `--color-surface`, 1px `--color-border`, `--radius-lg`, 패딩 `--space-5`. 좌측 48px 원형 IP 이니셜 배지(배경 config IP 색, 흰 글자 20/700) + IP명 h3 + 원어명 small `--color-text-muted` + 분류 label 칩 + `ip.goodsCount`. 정렬: 우선순위 → 굿즈 수 내림차순. 굿즈 1건 이상 IP만.

| 키 | ko | en | ja |
|---|---|---|---|
| ip.listH1 | IP별 한정판 굿즈 | Limited merch by IP | IP別の限定グッズ |
| ip.listLead | IP를 고르면 굿즈별 정가와 거래가를 볼 수 있어요. | Pick an IP to see retail and sold prices for each item. | IPを選ぶとグッズごとの定価と取引価格を見られます。 |
| ip.goodsCount | 굿즈 {n}개 | {n} items | グッズ{n}件 |
| ip.category.game / anime / character / movie | 게임 / 애니 / 캐릭터 / 영화 | Games / Anime / Characters / Movies | ゲーム / アニメ / キャラクター / 映画 |

- 반응형: 위 열 수. 375에서 IMG-04 숨김.
- 상태: 정적.
- 인터랙션: 카드 hover 테두리 `--color-secondary` + `--shadow-raised` 150ms.

### S-03 IP 허브 (`/{lang}/ip/{ipSlug}/`)
- 목적: 퍼널 1단계(IP 단위 검색 유입) → 2단계.
- 섹션 1 헤더: C-12 / 좌측 IP 이니셜 배지 64px + h1 `ip.hubH1` + 원어명 + 권리사(small) / ≥1024 우측 IMG-04 280px. 아래 메시지 1순위 문장(body `--color-text-muted`).
- 섹션 2 요약 통계: 3칸(<768 3칸 가로 유지, 글자 축소). 각 칸 = 숫자 h2 tabular + label small. 등록 굿즈 수 / 시세 있는 굿즈 수 / 평균 프리미엄(C-05 스타일 숫자, 시세 0건이면 `—`). 칸 배경 `--color-surface`, 1px `--color-border`, `--radius-lg`.
- 섹션 3 필터 칩 + 그리드: 칩 = `ip.filterAll` + 이 IP에 있는 품목유형. 클라이언트 필터(L1). L2 이상에서 S-14가 생성된 유형은 칩을 S-14 링크로 렌더링. 선택 칩 배경 `--color-secondary-tint`, 글자 `--color-secondary`, 테두리 `--color-secondary`. 정렬 셀렉트(우측): `ip.sortPremium`, `ip.sortRelease`, `ip.sortName`. C-04 그리드.
- 섹션 4 C-11.

| 키 | ko | en | ja |
|---|---|---|---|
| ip.hubH1 | {ip} 한정판 굿즈 | {ip} limited merch | {ip}の限定グッズ |
| ip.statGoods / ip.statPriced / ip.statAvgPremium | 등록 굿즈 / 시세 있는 굿즈 / 평균 프리미엄 | Items / With prices / Avg. premium | 登録グッズ / 相場あり / 平均プレ値 |
| ip.filterAll | 전체 | All | すべて |
| ip.sortLabel | 정렬 | Sort | 並び替え |
| ip.sortPremium / ip.sortRelease / ip.sortName | 프리미엄 높은 순 / 발매일 최신순 / 이름순 | Highest premium / Newest release / Name | プレ値が高い順 / 発売日が新しい順 / 名前順 |
| type.figure / plush / badge / card / kuji / apparel / other | 피규어 / 인형 / 뱃지·아크릴 / 카드 / 쿠지 / 의류·잡화 / 기타 | Figures / Plush / Badges & acrylic / Cards / Kuji / Apparel & goods / Other | フィギュア / ぬいぐるみ / 缶バッジ・アクスタ / カード / くじ / アパレル・雑貨 / その他 |
| ip.emptyFilter | 이 유형의 굿즈가 아직 없어요. | No items of this type yet. | この種類のグッズはまだありません。 |

- 반응형: 375 헤더 1열, IMG-04 숨김, 칩 가로 스크롤(줄바꿈 없음), 정렬 셀렉트는 칩 아래 전체 폭 / 768 IMG-04 표시 200px / 1440 위 레이아웃.
- 상태: 필터 결과 0건 → IMG-06 160px + `ip.emptyFilter` + `btn-text` `ip.filterAll`(필터 해제).
- 인터랙션: 칩 클릭 즉시 필터(전환 없음), 카드 hover 150ms.

### S-04 굿즈 상세 (`/{lang}/goods/{id}-{slug}/`)
- 목적: 퍼널 1단계 착지 → 2단계 시세 확인 → 3단계 1차 전환 / 4단계 저장.
- 섹션 1 상단: C-12(홈 › IP › 상품명).
- 섹션 2 개요: ≥1024 2열(좌 5열 썸네일 1:1 GoodsPlaceholder, `--radius-lg`, 1px `--color-border` / 우 7열 정보). 우측 위→아래:
  - IP명 링크 label(S-03) + 한정구분 칩(`--color-secondary-tint`, 클릭 시 CT-03 있으면 CT-03로, 없으면 툴팁만)
  - h1 상품명(현재 언어) / 원어명 body `--color-text-muted`
  - 메타 표(2열 dl, small, 행 간 1px `--color-border`): 품번·바코드, 제조사, 품목유형, 발매일, 정가(원통화 + 환산), 판매처 + 판매상태 칩 + 공식몰 링크(외부 아이콘), 정가 확인일
  - 액션 줄: `btn-secondary` `goods.addShelf`(shelf 아이콘) + `btn-secondary` `goods.addWish`(heart 아이콘). 그 아래 C-15. 이미 담긴 경우 문구 `goods.inShelf` / `goods.inWish`, 아이콘 filled.
  - 위시리스트 클릭 시 버튼 아래 인라인 패널(200ms): 목표가 입력(숫자, 통화 셀렉트 기본 = 언어 통화) + `btn-primary` 아님 → `btn-secondary` `goods.saveTarget` + 메시지 3순위 small.
- 섹션 3 시세 블록(시세 있음): 카드 `--color-surface`, `--radius-lg`, 패딩 `--space-5`, 1px `--color-border`.
  - h2 `goods.priceTitle` / 메시지 1순위 small
  - 큰 숫자 price-xl(언어 통화 환산) + 원통화 small + C-05 + `goods.vsRetail`
  - C-06(대표 마켓) + C-07 조건부 + `btn-text` `trust.howToRead`(CT-05 → 없으면 S-12)
  - C-08 마켓 버튼 그룹
- 섹션 3' 시세 없음: 같은 카드 안 IMG-05(200px 중앙) + h3 `goods.collectingTitle` + 본문 `goods.collectingBody` + C-08 검색 버튼 + C-09(topic `tracking_request`). 이 경우 섹션 6 C-10을 섹션 3' 바로 아래로 이동.
- 섹션 4 추이 차트(시세 있음): h3 `goods.chartTitle`. 서버 렌더링 SVG, 폭 100%, 높이 280px(<768 220px). x축 일자, y축 언어 통화. 마켓별 선 2px(`--color-chart-*`), 점 4px, 정가 기준선 1.5px 점선 `--color-chart-retail` + 우측 끝 라벨 `goods.retailLine`. 범례는 차트 위 좌측(색 원 8px + 마켓명). 스냅샷 1개면 선 대신 점만.
- 섹션 5 거래 기록 표: h3 `goods.tableTitle`. 열: 기준일 / 마켓 / 중간 거래가(원통화) / 환산 / 거래 건수 / 원문. 최신순 최대 20행. <768 가로 스크롤 래퍼.
- 섹션 6 C-09(시세 있음 시 topic `target_price`) → C-10 → C-11.

| 키 | ko | en | ja |
|---|---|---|---|
| goods.code | 품번·바코드 | Code / barcode | 品番・JAN |
| goods.maker | 제조사 | Manufacturer | メーカー |
| goods.type | 품목 | Type | 種類 |
| goods.release | 발매일 | Release | 発売日 |
| goods.retailPrice | 정가 | Retail price | 定価 |
| goods.seller | 판매처 | Sold by | 販売元 |
| goods.officialLink | 공식몰에서 보기 | View official store | 公式ストアで見る |
| goods.verified | 정가 확인일 {date} | Retail checked {date} | 定価確認日 {date} |
| status.preorder / onsale / soldout / ended | 예약중 / 판매중 / 품절 / 판매 종료 | Pre-order / On sale / Sold out / Ended | 予約受付中 / 販売中 / 品切れ / 販売終了 |
| limit.quantity / period / store / region / lottery / collab / regular | 수량 한정 / 기간 한정 / 매장·이벤트 한정 / 지역 한정 / 추첨 / 콜라보 / 일반 | Limited quantity / Limited time / Store & event / Regional / Lottery / Collab / Regular | 数量限定 / 期間限定 / 店舗・イベント限定 / 地域限定 / 抽選 / コラボ / 通常 |
| goods.addShelf | 진열장에 담기 | Add to my shelf | 棚に追加 |
| goods.inShelf | 진열장에 있어요 | On your shelf | 棚にあります |
| goods.addWish | 위시리스트에 담기 | Add to wishlist | ウィッシュリストに追加 |
| goods.inWish | 위시리스트에 있어요 | In your wishlist | ウィッシュリストにあります |
| goods.targetLabel | 목표가 | Target price | 目標価格 |
| goods.saveTarget | 목표가 저장하기 | Save target price | 目標価格を保存 |
| goods.priceTitle | 거래 시세 | Sold prices | 取引相場 |
| goods.vsRetail | 정가 대비 | vs. retail | 定価比 |
| goods.collectingTitle | 이 굿즈는 시세를 수집하고 있어요 | We're collecting prices for this item | この商品の相場を収集しています |
| goods.collectingBody | 정가와 발매 정보는 위에서 확인할 수 있어요. | Retail and release info are shown above. | 定価と発売情報は上で確認できます。 |
| goods.chartTitle | 거래가 추이 | Price history | 取引価格の推移 |
| goods.retailLine | 정가 | Retail | 定価 |
| goods.tableTitle | 거래 기록 | Sales data | 取引データ |
| goods.colDate / colMarket / colMedian / colConverted / colSamples / colSource | 기준일 / 마켓 / 중간 거래가 / 환산 / 거래 건수 / 원문 | Date / Market / Median / Converted / Sales / Source | 基準日 / マーケット / 中央値 / 換算 / 件数 / 出典 |
| goods.fxNote | 환산은 {date} 기준 고정 환율이에요. | Converted at fixed rates as of {date}. | 換算は{date}時点の固定レートです。 |

- 반응형: 375 개요 1열(썸네일 폭 100% max 280px 중앙 → 정보), 액션 버튼 2개 가로 50%씩, 마켓 버튼 전체 폭 세로 스택, 섹션 3 통과 후 하단 고정 바(§6) / 768 개요 2열(4:4), 마켓 버튼 가로 랩 / 1440 위 레이아웃.
- 상태: 정적 HTML이라 로딩 없음. 담기 버튼은 하이드레이션 전 비활성(disabled 스타일, 깜빡임 없이 동일 폭). 목표가 입력 오류: 입력 테두리 `--color-danger` + small `errors.INVALID_REQUEST`.
- 인터랙션: 담기 클릭 → 아이콘 filled 150ms + C-13. 차트 점 hover/포커스 → 툴팁(일자·마켓·가격·건수, `--color-text` 배경, 흰 글자 small, 150ms). 마켓 버튼 hover 150ms.

### S-05 검색 (`/{lang}/search/`)
- 목적: 퍼널 2단계 진입 보조. noindex.
- 섹션 1: h1 `search.h1`(시각적으로 h2 크기) + 검색 입력(S-01과 동일 스타일, 자동 포커스, 입력 200ms 디바운스로 결과 갱신). URL `?q=` 동기화.
- 섹션 2 결과: `search.count` small + C-04 그리드. 매칭 대상: 3개 언어 상품명, 원어명, 품번·바코드, IP명. 최대 48개.
- 초기(쿼리 없음): h3 `search.browseIp` + S-01 섹션 4와 같은 IP 칩.

| 키 | ko | en | ja |
|---|---|---|---|
| search.h1 | 굿즈 검색 | Search merch | グッズ検索 |
| search.count | 검색 결과 {n}개 | {n} results | 検索結果 {n}件 |
| search.browseIp | IP별로 찾아보기 | Browse by IP | IP別に探す |
| search.emptyTitle | 찾는 굿즈가 아직 없어요 | We don't have that item yet | お探しのグッズはまだありません |
| search.emptyBody | 직접 등록하면 내 진열장에 담을 수 있어요. | Add it manually to keep it on your shelf. | 手動で登録すると棚に追加できます。 |
| search.manualAdd | 직접 등록하기 | Add manually | 手動で登録する |
| search.loadError | 검색 데이터를 불러오지 못했어요. | Couldn't load search data. | 検索データを読み込めませんでした。 |
| search.reload | 다시 불러오기 | Reload | 再読み込み |

- 반응형: 그리드 2/3/4열.
- 상태: 로딩(검색 인덱스 JSON 로드 중) → C-04 모양 스켈레톤 8개(썸네일 정사각 + 3줄 막대, 배경 `--color-border` 펄스 1200ms) / 빈 결과 → IMG-06 200px + `search.emptyTitle` + `search.emptyBody` + `btn-secondary` `search.manualAdd`(S-06 `?manual=1&name={q}`) / 에러 → alert 아이콘 + `search.loadError` + `btn-secondary` `search.reload`.
- 인터랙션: 결과 갱신 시 전환 없음.

### S-06 스캔·직접 등록 (`/{lang}/scan/`)
- 목적: 퍼널 4단계(저장)·5단계(스캔 실패). noindex.
- 섹션 1: h1 `scan.h1` + 본문 메시지 2순위 + C-15.
- 섹션 2 스캐너: ≥1024 2열(좌 7열 카메라, 우 5열 직접 입력). 카메라 영역 4:3, `--radius-lg`, 배경 `--color-text`. 시작 전: IMG-07을 영역 안 중앙(폭 60%) + `btn-primary` `scan.start`(카메라 아이콘). 시작 후: 비디오 + 중앙 가이드 프레임(폭 70%, 높이 35%, 2px #FFFFFF, `--radius-md`) + 하단 `btn-text`(흰 글자) `scan.stop`.
- 섹션 2 우측 직접 입력: h3 `scan.manualTitle` + 입력(바코드 번호·품번) + `btn-secondary` `scan.lookup`. 그 아래 `btn-text` `scan.toGuide`(CT-02, 없으면 미렌더링).
- 섹션 3 결과(일치): 결과 카드 = C-04 가로형(썸네일 96px 좌, 정보 우) + `btn-primary` `goods.addShelf` + 수량 스테퍼(− 1 +, 40px). 담은 뒤 C-13.
- 섹션 3' 결과(불일치): alert 없이 info 아이콘 + `scan.missTitle` + 직접 등록 폼(2열 ≥768): 상품명(필수), IP(셀렉트: 데이터 IP + `scan.ipOther`), 정가(숫자), 통화(JPY/KRW/USD), 발매일(선택), 바코드 번호(스캔값 미리 채움). `btn-primary` `scan.saveManual`. 폼 아래 C-09(topic `tracking_request`).

| 키 | ko | en | ja |
|---|---|---|---|
| scan.h1 | 바코드로 진열장에 등록 | Add to your shelf by barcode | バーコードで棚に登録 |
| scan.lead | 바코드를 스캔해 내 진열장에 담으세요 | Scan a barcode to add it to your shelf | バーコードで棚に登録できます |
| scan.start | 카메라 켜기 | Turn on camera | カメラを起動 |
| scan.stop | 카메라 끄기 | Turn off camera | カメラを停止 |
| scan.frameHint | 바코드를 네모 안에 맞춰 주세요. | Fit the barcode inside the frame. | バーコードを枠内に合わせてください。 |
| scan.manualTitle | 번호로 찾기 | Find by number | 番号で探す |
| scan.manualPlaceholder | 바코드 번호 또는 품번 | Barcode number or product code | JANコードまたは品番 |
| scan.lookup | 찾기 | Find | 探す |
| scan.toGuide | 바코드 위치 찾는 법 | Where to find the barcode | バーコードの探し方 |
| scan.matchTitle | 이 굿즈가 맞나요? | Is this your item? | この商品ですか? |
| scan.missTitle | 등록되지 않은 굿즈예요. 직접 등록할 수 있어요. | This item isn't listed. You can add it yourself. | 未登録のグッズです。手動で登録できます。 |
| scan.fieldName / fieldIp / fieldPrice / fieldCurrency / fieldRelease / fieldCode | 상품명 / IP / 정가 / 통화 / 발매일(선택) / 바코드 번호 | Product name / IP / Retail price / Currency / Release date (optional) / Barcode | 商品名 / IP / 定価 / 通貨 / 発売日(任意) / JANコード |
| scan.ipOther | 기타 | Other | その他 |
| scan.saveManual | 진열장에 담기 | Add to my shelf | 棚に追加 |
| scan.manualNote | 직접 등록한 굿즈는 정가로 가치를 계산해요. | Manually added items are valued at retail. | 手動登録のグッズは定価で計算します。 |
| scan.permDenied | 카메라 권한이 없어요. 번호로 찾을 수 있어요. | No camera access. You can search by number. | カメラの権限がありません。番号で探せます。 |
| scan.unsupported | 이 브라우저는 카메라 스캔을 지원하지 않아요. | This browser doesn't support camera scanning. | このブラウザはカメラスキャンに対応していません。 |
| scan.required | 필수 항목이에요. | Required. | 必須項目です。 |

- 반응형: 375 1열(카메라 → 직접 입력 → 결과), 카메라 영역 폭 100%, 폼 1열 / 768 1열, 폼 2열 / 1440 위.
- 상태: 로딩(스캐너 라이브러리 로드) → 카메라 영역 안 스피너 32px 흰색 / 권한 거부·미지원 → 카메라 영역에 IMG-07 + `scan.permDenied` 또는 `scan.unsupported`, 직접 입력 입력란에 자동 포커스 / 폼 검증 오류 → 필드 테두리 `--color-danger` + small `scan.required`.
- 인터랙션: 스캔 성공 시 가이드 프레임 테두리 `--color-success` 300ms + 진동(navigator.vibrate 50ms, 지원 시) + 결과 섹션으로 부드럽게 스크롤(200ms).

### S-07 내 진열장 (`/{lang}/collection/`)
- 목적: 퍼널 4단계 이후 재방문·7단계 공유. noindex.
- 섹션 1 요약: 카드 `--color-surface`, `--radius-lg`, 패딩 `--space-6`. h1 `col.h1` / price-xl 총 가치(언어 통화) / 그 아래 3칸: 정가 합계, 정가 대비(C-05), 항목 수. small `col.asOf` + C-15. 우측(≥1024) 또는 아래(<1024): 항목 3개 이상이면 `btn-primary` `col.share`(S-09), 3개 미만이면 `btn-secondary` `cta.scan`(S-06).
- 섹션 2 추이 차트: h3 `col.chartTitle`. S-04 차트 규칙과 같고 선 1개(`--color-secondary`) + 정가 합계 점선. 스냅샷 일자 2개 미만이면 섹션 미렌더링.
- 섹션 3 목록: 툴바(정렬 셀렉트: `col.sortValue` / `col.sortPremium` / `col.sortAdded`). 행 = 썸네일 64px + 상품명(S-04 링크, 직접 등록 항목은 링크 없음 + `col.manualTag` 칩) + 현재 가치(또는 정가 + `goods.priceCollecting` 칩) + C-05 + 수량 스테퍼 + 삭제 `btn-icon`(trash). 행 간 1px `--color-border`.
- 삭제 클릭 → 행 안 인라인 확인(`col.removeConfirm` + `btn-text` `col.remove`(글자 `--color-danger`) + `btn-text` `col.cancel`).

| 키 | ko | en | ja |
|---|---|---|---|
| col.h1 | 내 진열장 | My shelf | マイ棚 |
| col.total | 총 가치 | Total value | 合計価値 |
| col.retailTotal | 정가 합계 | Retail total | 定価合計 |
| col.items | 항목 {n}개 | {n} items | {n}点 |
| col.asOf | 시세 기준일 {date} · 시세 없는 굿즈는 정가로 계산 | Prices as of {date} · Items without prices use retail | 基準日 {date}・相場なしは定価で計算 |
| col.share | 공유 카드 만들기 | Create share card | シェアカードを作る |
| col.chartTitle | 진열장 가치 추이 | Shelf value history | 棚の価値の推移 |
| col.sortValue / sortPremium / sortAdded | 가치 높은 순 / 프리미엄 높은 순 / 최근 담은 순 | Highest value / Highest premium / Recently added | 価値が高い順 / プレ値が高い順 / 最近追加した順 |
| col.manualTag | 직접 등록 | Manual | 手動登録 |
| col.qty | 수량 | Qty | 数量 |
| col.removeConfirm | 진열장에서 뺄까요? | Remove from shelf? | 棚から外しますか? |
| col.remove | 빼기 | Remove | 外す |
| col.cancel | 취소 | Cancel | キャンセル |
| col.emptyTitle | 진열장이 비어 있어요 | Your shelf is empty | 棚は空です |
| col.emptyBody | 바코드를 스캔해 내 진열장에 담으세요 | Scan a barcode to add it to your shelf | バーコードで棚に登録できます |
| col.emptySearch | 굿즈 검색하기 | Search merch | グッズを検索 |
| col.loadError | 저장된 진열장을 읽지 못했어요. | Couldn't read your saved shelf. | 保存した棚を読み込めませんでした。 |
| col.reset | 진열장 초기화하기 | Reset shelf | 棚をリセット |

- 반응형: 375 요약 3칸 → 1열 스택, 목록 행은 2줄(1줄: 썸네일·이름·삭제 / 2줄: 가치·배지·스테퍼) / 768 1열 요약 + 버튼 아래 / 1440 요약 우측 버튼.
- 상태: 로딩(localStorage 읽기 전) → 요약 카드 스켈레톤(큰 막대 1 + 작은 막대 3) + 행 스켈레톤 4개 / 빈 → IMG-08 240px + `col.emptyTitle` + `col.emptyBody` + `btn-primary` `cta.scan` + `btn-text` `col.emptySearch`(S-05) / 에러(파싱 실패) → alert + `col.loadError` + `btn-secondary` `col.reset`(확인 후 초기화).
- 인터랙션: 스테퍼 변경 즉시 합계 갱신, 숫자 변경 전환 없음. 행 삭제 시 높이 200ms 축소.

### S-08 위시리스트 (`/{lang}/wishlist/`)
- 목적: 재방문 시 퍼널 3단계(1차 전환). noindex.
- 섹션 1: h1 `wish.h1` + 메시지 3순위 + C-15.
- 섹션 2 도달 항목(1건 이상일 때만): 배경 #E8F3EC 띠, h2 `wish.reachedTitle` + check 아이콘 `--color-success`. 카드 = 썸네일 80px + 상품명 + 현재 시세 + 목표가 + `wish.below` + C-08(마켓 버튼 그룹).
- 섹션 3 전체 목록: 행 = 썸네일 64px + 상품명(S-04 링크) + 현재 시세(없으면 `goods.priceCollecting`) + 목표가 인라인 편집(숫자 입력 120px + 통화 표시, blur 시 저장) + 차이(`wish.gap`) + 삭제 `btn-icon`.
- 섹션 4 C-09(topic `target_price`, `watches`에 위시리스트 전체를 담는다).

| 키 | ko | en | ja |
|---|---|---|---|
| wish.h1 | 위시리스트 | Wishlist | ウィッシュリスト |
| wish.lead | 목표가를 정해두면 도달한 굿즈를 표시해요 | Set a target price and we'll flag it | 目標価格に届いた商品を表示します |
| wish.reachedTitle | 목표가에 도달한 굿즈 {n}개 | {n} items at your target price | 目標価格に到達 {n}件 |
| wish.current | 현재 중간 거래가 | Current median | 現在の中央値 |
| wish.target | 목표가 | Target | 目標価格 |
| wish.below | 목표가보다 {amount} 낮아요 | {amount} below target | 目標より{amount}安い |
| wish.gap | 목표가까지 {amount} | {amount} to target | 目標まで{amount} |
| wish.noTarget | 목표가를 입력하세요 | Enter a target price | 目標価格を入力 |
| wish.emptyTitle | 위시리스트가 비어 있어요 | Your wishlist is empty | ウィッシュリストは空です |
| wish.emptyBody | 굿즈 상세에서 위시리스트에 담을 수 있어요. | Add items from their product page. | 商品ページから追加できます。 |
| wish.emptyCta | 굿즈 둘러보기 | Browse merch | グッズを見る |

- 반응형: 375 도달 카드 1열, 마켓 버튼 전체 폭 스택, 목록 행 2줄 / 768 도달 카드 2열 / 1440 도달 카드 2열, 목록 1줄.
- 상태: 로딩 → 행 스켈레톤 4개 / 빈 → IMG-09 240px + 제목·본문 + `btn-secondary` `wish.emptyCta`(S-02) / 에러 → S-07과 같은 `col.loadError` + `col.reset`(위시리스트 문서에 적용).
- 인터랙션: 목표가 저장 시 입력 테두리 `--color-success` 600ms 후 원복. 목표 도달 상태가 되면 해당 행이 섹션 2로 이동(전환 없음).

### S-09 공유 카드 (`/{lang}/share/`)
- 목적: 퍼널 7단계(공유). noindex.
- 섹션 1 헤더: ≥1024 2열(좌 h1 + 본문, 우 IMG-10 280px).
- 섹션 2 편집: ≥1024 2열(좌 5열 미리보기, 우 7열 설정). 미리보기는 캔버스 결과를 4:5 비율로 축소 표시(`--radius-lg`, `--shadow-card`).
  - 설정: 등급 표시(현재 등급명 h3 + 다음 등급까지 남은 금액 small) / 항목 9칸 목록(현재 가치 상위 9개, 행마다 `btn-text` `share.addPhoto`로 사진 선택, 선택 시 32px 미리보기 + `btn-icon` close) / 체크박스 `share.watermark`(기본 체크, config `share.watermarkDefault`) / 버튼 줄: `btn-primary` `share.create` → 생성 후 `btn-primary` `share.share`(Web Share 지원 시) 또는 `share.download`, 옆에 `btn-secondary` `share.download`(공유 지원 시 함께 노출).
  - 사진 고지 small: `share.photoNote`.
- 캔버스 레이아웃(1080×1350): 배경 IMG-23 전체. 상단 0~200px: 좌측 64px 여백에 `share.cardTitle`(48px/700 #FFFFFF) + 아래 등급명(32px/600 #D9D4E8). 200~1150px: 3×3 그리드(셀 296×296, 간격 24px, 좌우 여백 48px), 셀 = 흰 배경 radius 24 + 사진(cover) 또는 GoodsPlaceholder 렌더 + 하단 반투명 띠(#1C1A24 70%)에 상품명 1줄(24px) + 가치(24px/700). 1150~1350px: 좌측 총 가치(56px/700 #FFFFFF) + 정가 대비(32px, 양수 #8FE0B0, 음수 #FFB3B6, 부호 포함). 워터마크 체크 시 우하단 logo-symbol-mono 40px + `share.madeWith` + site.url 호스트(24px #D9D4E8). 9개 미만이면 빈 셀은 #FFFFFF 12% 사각형.
- 등급(config `share.grades`, JPY 환산 총 가치 기준): ≥0 starter / ≥30,000 collector / ≥100,000 curator / ≥300,000 keeper.

| 키 | ko | en | ja |
|---|---|---|---|
| share.h1 | 진열장 공유 카드 | Shelf share card | 棚シェアカード |
| share.lead | 가치가 높은 굿즈 9개와 총 가치를 이미지로 만들어요. | Turn your top 9 items and total value into an image. | 価値の高いグッズ9点と合計価値を画像にします。 |
| share.gradeLabel | 진열장 등급 | Shelf grade | 棚ランク |
| grade.starter / collector / curator / keeper | 스타터 / 컬렉터 / 큐레이터 / 볼트 키퍼 | Starter / Collector / Curator / Vault Keeper | スターター / コレクター / キュレーター / ボルトキーパー |
| share.nextGrade | 다음 등급까지 {amount} | {amount} to next grade | 次のランクまで{amount} |
| share.topItems | 카드에 들어갈 굿즈 | Items on the card | カードに入るグッズ |
| share.addPhoto | 사진 넣기 | Add photo | 写真を追加 |
| share.photoNote | 사진은 이 화면에서만 쓰고 저장하지 않아요. | Photos are used only here and never saved. | 写真はこの画面でのみ使い、保存しません。 |
| share.watermark | 카드에 오시볼트 주소 표시 | Show Oshi Vault address on card | カードにオシボルトのURLを表示 |
| share.create | 카드 만들기 | Create card | カードを作る |
| share.share | 공유하기 | Share | シェアする |
| share.download | 이미지 저장하기 | Save image | 画像を保存 |
| share.cardTitle | 내 진열장 | My shelf | マイ棚 |
| share.madeWith | 오시볼트로 만듦 | Made with Oshi Vault | オシボルトで作成 |
| share.shareText | 내 진열장 총 가치 {amount} | My shelf is worth {amount} | 私の棚の合計価値 {amount} |
| share.emptyTitle | 공유할 굿즈가 없어요 | No items to share yet | シェアするグッズがありません |
| share.emptyBody | 진열장에 굿즈를 담으면 카드를 만들 수 있어요. | Add items to your shelf to make a card. | 棚にグッズを追加するとカードを作れます。 |
| share.error | 이미지를 만들지 못했어요. | Couldn't create the image. | 画像を作成できませんでした。 |
| share.retry | 다시 만들기 | Try again | もう一度作る |

- 반응형: 375 1열(미리보기 폭 100% → 설정), 버튼 전체 폭 / 768 1열, 미리보기 max 420px 중앙 / 1440 2열.
- 상태: 로딩(이미지·폰트 준비) → 미리보기 자리 4:5 스켈레톤 + 스피너 / 빈(진열장 0개) → IMG-08 240px + `share.emptyTitle` + `share.emptyBody` + `btn-primary` `cta.scan` / 에러 → alert + `share.error` + `btn-secondary` `share.retry`.
- 인터랙션: 설정 변경 시 미리보기 즉시 재렌더(디바운스 150ms). 생성 버튼 클릭 → 버튼 안 스피너.

### S-10 가이드 목록 (`/{lang}/guides/`)
- 목적: 퍼널 1단계(정보형 유입) 허브. 해당 언어 `reviewed: true` 문서가 0개면 noindex + sitemap 제외 + 메뉴 숨김(G-03).
- 섹션 1 헤더: ≥1024 2열(좌 C-12 + h1 + 본문, 우 IMG-11 320px 세로 중앙).
- 섹션 2 카드 그리드: <768 1열, 768 2열, ≥1024 3열. 카드 = 커버 16:9(가이드별 IMG-13~17, 없으면 IMG-12, object-fit cover, 상단 radius) + 본문 패딩 `--space-4`: h3 제목 + small 설명 3줄 말줄임 + small `guides.updated`. updated 내림차순.

| 키 | ko | en | ja |
|---|---|---|---|
| guides.h1 | 수집 가이드 | Collector guides | コレクターガイド |
| guides.lead | 시세 확인, 바코드 찾기, 한정판 구분법을 정리했어요. | How to check prices, find barcodes, and read limited labels. | 相場の調べ方、バーコードの場所、限定の種類をまとめました。 |
| guides.updated | {date} 업데이트 | Updated {date} | {date} 更新 |
| guides.emptyTitle | 이 언어의 가이드를 준비하고 있어요 | Guides in this language are coming | この言語のガイドは準備中です |
| guides.emptyCta | 굿즈 둘러보기 | Browse merch | グッズを見る |

- 반응형: 위 열 수. 375에서 IMG-11 숨김.
- 상태: 정적. 문서 0개 → IMG-11 240px 중앙 + `guides.emptyTitle` + `btn-secondary` `guides.emptyCta`(S-02).
- 인터랙션: 카드 hover `--shadow-raised` + 커버 scale 1.02(200ms, 오버플로 숨김).

### S-11 가이드 상세 (`/{lang}/guides/{slug}/`)
- 목적: 퍼널 1단계(정보형 유입) → 2단계(S-04)·4단계.
- 섹션 1: C-12 / h1 / small `guides.updated` / 커버 16:9 폭 100%(본문 폭 720px 기준), `--radius-lg`, 해당 IMG-13~17(없으면 IMG-12).
- 섹션 2 본문: ≥1024 2열(좌 본문 720px, 우 목차 240px sticky top 88px). 목차 = h2 목록 small, 현재 섹션 `--color-primary` 좌측 2px 바. <1024 목차는 본문 위 접힘 박스(`guide.toc`).
  - 본문 스타일: body 17/30(데스크톱), h2 상단 `--space-7`, 링크 `--color-primary` 밑줄, 표 1px `--color-border`, 인용 좌측 4px `--color-secondary-tint`.
  - CTA 슬롯 A: 두 번째 h2 섹션 끝. frontmatter `ipSlugs`의 굿즈 중 시세 있는 굿즈 상위 2개를 C-04 가로형 카드로, 각 카드 아래 C-08(첫 마켓 1개만). 해당 굿즈 0개면 슬롯 미렌더링.
  - CTA 슬롯 B: 본문 끝. frontmatter `endCta` 값별: `primary` → 슬롯 A와 같은 굿즈 카드 2개 / `secondary` → C-09(topic `target_price`) / `scan` → 박스(IMG-07 120px + `scan.lead` + `btn-primary` `cta.scan`) / `shelf` → 박스(IMG-08 120px + `home.shelfBody` + `btn-secondary` `goods.addShelf` 대신 `col.emptySearch`(S-05)).
- 섹션 3: C-10 변형(ipSlugs 첫 IP의 굿즈 최대 4개, 제목 `guide.relatedGoods`) + ipSlugs의 S-03 링크 칩 + C-11(현재 문서 제외).
- CT별 `endCta` 값: CT-01 `shelf`, CT-02 `scan`, CT-03 `primary`, CT-04 `primary`, CT-05 `secondary`.

| 키 | ko | en | ja |
|---|---|---|---|
| guide.toc | 목차 | Contents | 目次 |
| guide.relatedGoods | 글에 나온 IP의 굿즈 | Merch from this guide's IPs | 記事に出てきたIPのグッズ |
| guide.relatedIps | 관련 IP | Related IPs | 関連IP |

- 반응형: 375 목차 접힘 박스, 본문 16/28, 커버 폭 100% / 768 같음 / 1440 2열 + sticky 목차.
- 상태: 정적. 슬롯 데이터 없음 → 해당 슬롯 미렌더링.
- 인터랙션: 목차 클릭 시 해당 h2로 스크롤(200ms, 헤더 높이만큼 오프셋). 현재 섹션 하이라이트 전환 150ms.

### S-12 데이터 출처와 계산 방법 (`/{lang}/about/`)
- 목적: 퍼널 2단계 신뢰 확보(G-09).
- 섹션 1 헤더: ≥1024 2열(좌 C-12 + h1 + 본문, 우 IMG-18 320px).
- 섹션 2~6 본문(폭 720px, 각 h2 + 본문): 데이터 출처 / 계산 방법(식은 코드 블록 스타일 박스, 배경 `--color-surface`, 1px `--color-border`, 모노 아님) / 갱신 주기 / 한계 / 비공식 고지. 모든 수치는 config 값에서 치환.

| 키 | ko | en | ja |
|---|---|---|---|
| about.h1 | 데이터 출처와 계산 방법 | Data sources and methods | データ出典と計算方法 |
| about.lead | 오시볼트의 모든 숫자가 어디서 오는지 공개해요. | Where every number on Oshi Vault comes from. | オシボルトのすべての数字の出どころを公開します。 |
| about.sourcesTitle | 데이터 출처 | Data sources | データ出典 |
| about.sourcesBody | 정가는 각 공식몰 상품 페이지에서 확인해요. 거래가는 {markets}의 판매완료 거래에서 수집해요. | Retail prices come from official store pages. Sold prices come from completed sales on {markets}. | 定価は各公式ストアの商品ページで確認します。取引価格は{markets}の取引済みデータから収集します。 |
| about.methodTitle | 계산 방법 | How we calculate | 計算方法 |
| about.methodBody1 | 현재 시세는 가장 최근 기준일의 마켓별 중간 거래가를 거래 건수로 가중평균한 값이에요. | Current price is the sales-weighted average of each market's median on the latest date. | 現在の相場は、最新基準日のマーケット別中央値を取引件数で加重平均した値です。 |
| about.methodBody2 | 프리미엄 = (현재 시세 − 정가) ÷ 정가 | Premium = (current price − retail) ÷ retail | プレ値率 = (現在の相場 − 定価) ÷ 定価 |
| about.methodBody3 | 통화 환산은 {date} 기준 고정 환율을 써요. | Currency conversion uses fixed rates as of {date}. | 通貨換算は{date}時点の固定レートを使います。 |
| about.updateTitle | 갱신 주기 | Update schedule | 更新頻度 |
| about.updateBody | 데이터를 갱신할 때 사이트를 다시 만들어요. 모든 시세에 기준일을 표시해요. | The site is rebuilt when data is updated. Every price shows its date. | データ更新時にサイトを再構築します。すべての相場に基準日を表示します。 |
| about.limitsTitle | 한계 | Limitations | 制限事項 |
| about.limitsBody1 | 등록된 굿즈는 {n}개예요. 모든 굿즈를 다루지는 않아요. | We list {n} items. Not every item is covered. | 登録グッズは{n}件です。すべてのグッズは扱っていません。 |
| about.limitsBody2 | 기준일이 {days}일보다 오래되면 '오래된 시세'로 표시해요. | Prices older than {days} days are marked as older data. | 基準日が{days}日より古い相場は「古い相場」と表示します。 |
| about.limitsBody3 | 거래 건수가 적으면 실제 거래가와 차이가 클 수 있어요. | With few sales, prices may differ from actual deals. | 取引件数が少ないと実際の価格と差が出ることがあります。 |
| about.unofficialTitle | 비공식 고지 | Unofficial notice | 非公式について |

`about.unofficialTitle` 본문은 `footer.unofficial`, 그 아래 `footer.affiliate`(어필리에이트 ID 설정 시).

- 반응형: 375 헤더 1열, IMG-18 폭 100% max 280px 아래 / 768 같음 / 1440 2열 헤더.
- 상태: 정적.
- 인터랙션: 없음(링크 hover만).

### S-13 개인정보처리방침·이용약관 (`/{lang}/privacy/`, `/{lang}/terms/`)
- 목적: 2차 전환 동의 근거 제공(G-06).
- 섹션 1 헤더: C-12 + 우측 IMG-19 160px(≥768), h1 + small `legal.effective`.
- 섹션 2 본문: `content/{lang}/legal/{privacy,terms}.md`를 S-11 본문 스타일로 렌더링(목차 없음, 폭 720px). 본문은 사람이 작성한다.
- 두 문서 상단에 서로 이동하는 탭(높이 40px, 선택 탭 하단 2px `--color-secondary`).

| 키 | ko | en | ja |
|---|---|---|---|
| legal.privacy | 개인정보처리방침 | Privacy policy | プライバシーポリシー |
| legal.terms | 이용약관 | Terms of use | 利用規約 |
| legal.effective | 시행일 {date} | Effective {date} | 施行日 {date} |

- 반응형: 375 IMG-19 숨김.
- 상태: 정적.
- 인터랙션: 탭 hover 글자 `--color-secondary` 150ms.

### S-14 IP×품목유형 (`/{lang}/ip/{ipSlug}/{type}/`, L2 이상에서만 생성)
- 목적: 퍼널 1단계(유형 단위 검색 유입).
- 레이아웃: S-03과 같다. 차이: h1 `ip.typeH1`, 요약 통계는 해당 유형 기준, 필터 칩 대신 형제 유형 링크 칩(현재 유형 선택 상태) + `ip.filterAll` 칩은 S-03 링크. 헤더 이미지 IMG-04.

| 키 | ko | en | ja |
|---|---|---|---|
| ip.typeH1 | {ip} {type} 시세 | {ip} {type} prices | {ip} {type}の相場 |
| ip.typeLead | {ip} {type}의 정가와 거래가를 비교해요. | Compare retail and sold prices for {ip} {type}. | {ip}の{type}の定価と取引価格を比べられます。 |

- 반응형·상태·인터랙션: S-03과 같다.

### S-15 404 (`404.html`)
- 목적: 이탈 방지. noindex.
- 헤더·푸터 없음(언어 판별 불가). 컨테이너 560px 중앙, 상하 `--space-9`.
- 내용: IMG-20 240px 중앙 → 3개 언어 블록 세로 스택(블록 간 `--space-6`, 구분선 1px `--color-border`). 블록 = h2 제목 + `btn-secondary` 홈 링크(`/{lang}/`) + `btn-text` 검색 링크(`/{lang}/search/`).

| 키(`src/messages/root.json`) | 값 |
|---|---|
| notFound.ko | 페이지를 찾을 수 없어요 / 홈으로 가기 / 굿즈 검색하기 |
| notFound.en | Page not found / Go to home / Search merch |
| notFound.ja | ページが見つかりません / ホームへ / グッズを検索 |

- 반응형: 375 IMG-20 180px.
- 상태: 정적.
- 인터랙션: 버튼 hover 150ms.

### S-16 프리미엄 계산기 (`/{lang}/tools/premium-calculator/`)
- 목적: 퍼널 1단계(도구 검색 유입) → 4단계(G-04).
- 섹션 1 헤더: ≥1024 2열(좌 C-12 + h1 + 본문, 우 IMG-21 280px).
- 섹션 2 계산기: ≥1024 2열(좌 6열 입력 카드, 우 6열 결과 카드). 입력: 정가(숫자) + 통화 셀렉트(JPY/KRW/USD), 거래가(숫자) + 통화 셀렉트. 입력 높이 48px. 결과 카드(배경 `--color-surface`, 2px `--color-secondary`): price-xl 프리미엄 %(C-05 색 규칙, 부호) + 차액(언어 통화) + 배율 small + `goods.fxNote`. 입력 중 즉시 계산(버튼 없음).
- 섹션 3 결과 아래 행동: `btn-secondary` `calc.findGoods`(S-05) + `btn-text` `cta.scan`(S-06).
- 섹션 4 설명(정적 HTML, 폭 720px): h2 `calc.howTitle` + `about.methodBody2` + `calc.howBody` + `btn-text` `trust.howToRead`(CT-05, 없으면 S-12).

| 키 | ko | en | ja |
|---|---|---|---|
| calc.h1 | 정가 대비 프리미엄 계산기 | Resale premium calculator | プレ値計算ツール |
| calc.lead | 정가와 거래가를 넣으면 프리미엄과 차액을 계산해요. | Enter retail and sold prices to see the premium and difference. | 定価と取引価格を入れるとプレ値率と差額を計算します。 |
| calc.retail | 정가 | Retail price | 定価 |
| calc.sold | 거래가 | Sold price | 取引価格 |
| calc.currency | 통화 | Currency | 通貨 |
| calc.premium | 프리미엄 | Premium | プレ値率 |
| calc.diff | 차액 | Difference | 差額 |
| calc.ratio | 정가의 {x}배 | {x}× retail | 定価の{x}倍 |
| calc.placeholder | 두 가격을 입력하면 결과가 나와요. | Enter both prices to see the result. | 2つの価格を入力すると結果が出ます。 |
| calc.findGoods | 카탈로그에서 이 굿즈 찾기 | Find this item in the catalog | カタログでこのグッズを探す |
| calc.howTitle | 계산 방식 | How it's calculated | 計算方法 |
| calc.howBody | 두 가격을 같은 통화로 바꾼 뒤 비교해요. 수수료와 배송비는 포함하지 않아요. | Both prices are converted to one currency. Fees and shipping are excluded. | 2つの価格を同じ通貨に換算して比べます。手数料と送料は含みません。 |
| calc.invalid | 0보다 큰 숫자를 입력하세요. | Enter a number greater than 0. | 0より大きい数字を入力してください。 |

- 반응형: 375 1열(입력 → 결과), IMG-21 숨김 / 768 1열, 입력·결과 카드 각 전체 폭 / 1440 2열.
- 상태: 입력 전 → 결과 카드에 `calc.placeholder`(`--color-text-muted`) / 잘못된 입력 → 필드 테두리 `--color-danger` + `calc.invalid`, 결과 카드 placeholder 상태.
- 인터랙션: 결과 숫자 변경 시 전환 없음. 입력 포커스 테두리 150ms.

════════════════════════════════
## §5 이미지 목록

공통 스타일 앵커:
`flat vector illustration, limited palette of deep violet #3B2F6B, burnt orange #C2410C, warm off-white #FAF8F5 and soft gray #E4DFD7, simple geometric shapes, solid fills, rounded corners, generous negative space, no text, no letters, no numbers, no logos, no watermark`

공통 네거티브(모든 이미지에 추가): `no text, no letters, no numbers, no brand logos, no existing characters, no Pokémon, no Disney, no Sanrio, no anime characters, no human faces, no photorealism, no gradients mesh, no 3D render`

규칙: 컬렉터블은 얼굴 없는 둥근 장난감 형태, 무지 상자, 무늬 없는 아크릴 스탠드처럼 기존 캐릭터를 연상시키지 않는 추상 형태만 쓴다. 경로는 `public/images/`, 매니페스트는 `src/data/images.manifest.json`(키 = IMG-ID, 값 = `{src, width, height, alt:{ko,en,ja}}`).

### IMG-01 홈 히어로 진열장
- 파일 경로: `public/images/hero/home-shelf.webp`
- 적용 위치: S-01 섹션 1 히어로 우측 6열, 세로 중앙
- 역할: 히어로
- 크기: 1152×960 (6:5), 표시 576×480의 2배
- 표시: object-fit contain. <768 폭 100% max 320px, 텍스트 아래
- alt: 진열장 선반에 놓인 피규어와 인형, 가격 태그 일러스트
- 프롬프트: A three-tier display shelf seen straight-on, holding abstract faceless round toy figures, a small plush blob, an acrylic stand, and closed collector boxes; small blank price tags hang from two items; a tiny upward arrow shape floats beside one tag; plain warm off-white background; calm, orderly mood. + 앵커
- 네거티브: 공통 네거티브 + no price numbers on tags

### IMG-02 언어 선택 문
- 파일 경로: `public/images/hero/root-languages.webp`
- 적용 위치: S-00 섹션 1 상단 중앙
- 역할: 히어로
- 크기: 640×400 (8:5), 표시 320×200의 2배
- 표시: object-fit contain. <768 폭 240px
- alt: "" (장식)
- 프롬프트: Three identical rounded vault-style display cabinet doors standing side by side, slightly open, each glowing softly from inside with a small four-pointed star; front view; plain background; welcoming mood. + 앵커
- 네거티브: 공통 네거티브 + no flags

### IMG-03 OG 배경
- 파일 경로: `public/images/og/og-base.png`
- 적용 위치: `scripts/gen-og.ts` 템플릿 배경 (og-default-{lang}.png, og-ip-{ipSlug}-{lang}.png 전부)
- 역할: OG
- 크기: 1200×630 (1.91:1)
- 표시: 템플릿 전체 배경, cover. 좌측 60% 영역은 텍스트 합성 영역이므로 단색 유지
- alt: "" (OG 배경, HTML 미노출)
- 프롬프트: Solid deep violet background filling the canvas; on the right 40% only, a small cluster of abstract collectibles (faceless round figure, plush blob, acrylic stand, closed box) on a single floating shelf, lit warmly; left 60% completely empty solid color; side view slightly from above. + 앵커
- 네거티브: 공통 네거티브 + no objects in the left 60 percent

### IMG-04 IP 허브 배너
- 파일 경로: `public/images/ip/ip-banner.webp`
- 적용 위치:
  - S-02 섹션 1 헤더 우측 360px
  - S-03 섹션 1 헤더 우측 280px
  - S-14 섹션 1 헤더 우측 280px
- 역할: 섹션 설명
- 크기: 720×540 (4:3)
- 표시: object-fit contain. <768 숨김
- alt: "" (장식)
- 프롬프트: A row of colorful closed collector boxes of different sizes on a counter, each with a blank colored label band, one box open showing an abstract faceless figure inside; front three-quarter view; plain background; tidy mood. + 앵커
- 네거티브: 공통 네거티브 + no printed graphics on boxes

### IMG-05 시세 수집 중
- 파일 경로: `public/images/empty/price-collecting.webp`
- 적용 위치: S-04 섹션 3' 시세 없음 카드 중앙 상단
- 역할: 빈 상태
- 크기: 400×400 (1:1), 표시 200×200의 2배
- 표시: object-fit contain. <768 160px
- alt: 시세를 모으고 있는 그래프 일러스트
- 프롬프트: A small magnifying glass hovering over a blank line chart card with only grid lines and three faint dots, a tiny hourglass beside it; front view; plain background; patient mood. + 앵커
- 네거티브: 공통 네거티브 + no axis labels

### IMG-06 검색 결과 없음
- 파일 경로: `public/images/empty/no-results.webp`
- 적용 위치:
  - S-05 빈 결과 중앙 200px
  - S-03 필터 결과 0건 중앙 160px
  - S-14 필터 결과 0건 중앙 160px
- 역할: 빈 상태
- 크기: 400×400 (1:1)
- 표시: object-fit contain
- alt: 비어 있는 선반을 돋보기로 살펴보는 일러스트
- 프롬프트: A magnifying glass looking at an empty single shelf with one small four-pointed sparkle at its edge; front view; plain background; light, not sad mood. + 앵커
- 네거티브: 공통 네거티브 + no question mark symbols

### IMG-07 바코드 스캔 안내
- 파일 경로: `public/images/hero/scan-barcode.webp`
- 적용 위치:
  - S-06 섹션 2 카메라 영역 안 중앙(폭 60%), 시작 전·권한 거부 상태
  - S-01 섹션 3 좌측 6열
  - S-11 CTA 슬롯 B(`scan`) 박스 좌측 120px
- 역할: 섹션 설명
- 크기: 960×720 (4:3)
- 표시: object-fit contain
- alt: 휴대폰으로 굿즈 상자의 바코드를 비추는 일러스트
- 프롬프트: A smartphone held at an angle pointing its camera at the side of a plain collector box; the box shows a barcode made only of vertical bars without digits; a soft orange scan line crosses the bars; side view; plain background; focused mood. + 앵커
- 네거티브: 공통 네거티브 + no digits under the barcode, no hands with detailed fingers

### IMG-08 빈 진열장
- 파일 경로: `public/images/empty/empty-shelf.webp`
- 적용 위치:
  - S-07 빈 상태 중앙 240px
  - S-09 빈 상태 중앙 240px
  - S-11 CTA 슬롯 B(`shelf`) 박스 좌측 120px
- 역할: 빈 상태
- 크기: 480×480 (1:1)
- 표시: object-fit contain
- alt: 비어 있는 진열장 선반 일러스트
- 프롬프트: An empty glass-door display cabinet with three clean shelves and a single small four-pointed star sparkle on the top shelf; front view; plain background; inviting mood. + 앵커
- 네거티브: 공통 네거티브

### IMG-09 빈 위시리스트
- 파일 경로: `public/images/empty/empty-wishlist.webp`
- 적용 위치:
  - S-08 빈 상태 중앙 240px
  - S-01 섹션 5 우측 240px
- 역할: 빈 상태
- 크기: 480×480 (1:1)
- 표시: object-fit contain. S-01에서 <768 숨김
- alt: 하트 표시가 달린 빈 태그와 목표 깃발 일러스트
- 프롬프트: A blank hanging tag with a small heart outline, next to a tiny target flag on a short pole, and a closed collector box behind; front view; plain background; hopeful mood. + 앵커
- 네거티브: 공통 네거티브

### IMG-10 공유 카드 소개
- 파일 경로: `public/images/hero/share-card-intro.webp`
- 적용 위치: S-09 섹션 1 헤더 우측 280px
- 역할: 섹션 설명
- 크기: 720×540 (4:3)
- 표시: object-fit contain. <768 숨김
- alt: 3×3 격자 카드가 휴대폰 화면에서 튀어나오는 일러스트
- 프롬프트: A portrait card with a three-by-three grid of small abstract collectible icons popping out of a smartphone screen, with two small share arrows curving away; slight three-quarter view; plain background; celebratory mood. + 앵커
- 네거티브: 공통 네거티브

### IMG-11 가이드 배너
- 파일 경로: `public/images/guides/guides-banner.webp`
- 적용 위치:
  - S-10 섹션 1 헤더 우측 320px
  - S-10 빈 상태 중앙 240px
- 역할: 섹션 설명
- 크기: 720×540 (4:3)
- 표시: object-fit contain. <768 헤더에서 숨김
- alt: "" (장식)
- 프롬프트: An open notebook with blank lines, a small closed collector box, and a magnifying glass arranged on a desk; top-down view; plain background; studious mood. + 앵커
- 네거티브: 공통 네거티브 + no handwriting

### IMG-12 가이드 기본 커버
- 파일 경로: `public/images/guides/cover-default.webp`
- 적용 위치:
  - S-11 섹션 1 커버(전용 커버가 없을 때)
  - S-10 카드 커버(전용 커버가 없을 때)
  - C-11 리스트 카드 썸네일(전용 커버가 없을 때)
- 역할: 카드 썸네일
- 크기: 1280×720 (16:9)
- 표시: object-fit cover, 중앙 크롭
- alt: "" (장식)
- 프롬프트: A wide simple scene of a single long shelf with evenly spaced abstract collectibles; front view; plain background; neutral mood. + 앵커
- 네거티브: 공통 네거티브

### IMG-13 CT-01 커버
- 파일 경로: `public/images/guides/cover-how-to-check-resale-price.webp`
- 적용 위치: S-11(CT-01) 커버, S-10 CT-01 카드, C-11 CT-01 썸네일
- 역할: 카드 썸네일
- 크기: 1280×720 (16:9)
- 표시: object-fit cover
- alt: 여러 마켓의 가격표를 비교하는 일러스트
- 프롬프트: Three small market stall awnings side by side, each with a blank price tag hanging, and a balance scale in front weighing two closed boxes; front view; plain background; analytical mood. + 앵커
- 네거티브: 공통 네거티브 + no numbers on tags

### IMG-14 CT-02 커버
- 파일 경로: `public/images/guides/cover-find-barcode-product-code.webp`
- 적용 위치: S-11(CT-02) 커버, S-10 CT-02 카드, C-11 CT-02 썸네일
- 역할: 카드 썸네일
- 크기: 1280×720 (16:9)
- 표시: object-fit cover
- alt: 상자 옆면의 바코드를 돋보기로 보는 일러스트
- 프롬프트: A collector box turned to its side panel showing a digit-free barcode of vertical bars, a magnifying glass highlighting it with an orange outline; three-quarter view; plain background; helpful mood. + 앵커
- 네거티브: 공통 네거티브 + no digits

### IMG-15 CT-03 커버
- 파일 경로: `public/images/guides/cover-limited-edition-types.webp`
- 적용 위치: S-11(CT-03) 커버, S-10 CT-03 카드, C-11 CT-03 썸네일
- 역할: 카드 썸네일
- 크기: 1280×720 (16:9)
- 표시: object-fit cover
- alt: 서로 다른 표식이 붙은 한정판 상자들 일러스트
- 프롬프트: Five closed collector boxes in a row, each marked with a different simple symbol (hourglass, small house, raffle ticket, two linked rings, three stacked short bars); front view; plain background; organized mood. + 앵커
- 네거티브: 공통 네거티브

### IMG-16 CT-04 커버
- 파일 경로: `public/images/guides/cover-ways-to-buy-japan-exclusive.webp`
- 적용 위치: S-11(CT-04) 커버, S-10 CT-04 카드, C-11 CT-04 썸네일
- 역할: 카드 썸네일
- 크기: 1280×720 (16:9)
- 표시: object-fit cover
- alt: 상자가 여러 경로로 배송되는 일러스트
- 프롬프트: A single closed collector box at the left with three dotted paths leading to the right, one path via a small airplane, one via a delivery truck, one via a small storefront; side view; plain background; journey mood. + 앵커
- 네거티브: 공통 네거티브 + no maps, no country shapes

### IMG-17 CT-05 커버
- 파일 경로: `public/images/guides/cover-how-to-read-prices.webp`
- 적용 위치: S-11(CT-05) 커버, S-10 CT-05 카드, C-11 CT-05 썸네일
- 역할: 카드 썸네일
- 크기: 1280×720 (16:9)
- 표시: object-fit cover
- alt: 막대 그래프 가운데에 표시가 있는 일러스트
- 프롬프트: A simple bar chart with seven bars of different heights where the middle bar is highlighted in orange, a small calendar card beside it with blank squares; front view; plain background; clear mood. + 앵커
- 네거티브: 공통 네거티브 + no axis labels

### IMG-18 데이터 출처
- 파일 경로: `public/images/hero/about-data.webp`
- 적용 위치: S-12 섹션 1 헤더 우측 320px
- 역할: 섹션 설명
- 크기: 720×540 (4:3)
- 표시: object-fit contain. <768 폭 100% max 280px, 텍스트 아래
- alt: 여러 출처의 데이터가 하나의 표로 모이는 일러스트
- 프롬프트: Three small blank document cards on the left with arrows flowing into one larger blank table card on the right; front view; plain background; transparent, trustworthy mood. + 앵커
- 네거티브: 공통 네거티브

### IMG-19 법적 고지
- 파일 경로: `public/images/hero/legal.webp`
- 적용 위치: S-13 섹션 1 헤더 우측 160px
- 역할: 섹션 설명
- 크기: 480×360 (4:3)
- 표시: object-fit contain. <768 숨김
- alt: "" (장식)
- 프롬프트: A single blank document with a small shield shape in the corner and a closed padlock beside it; front view; plain background; calm mood. + 앵커
- 네거티브: 공통 네거티브

### IMG-20 404
- 파일 경로: `public/images/empty/not-found.webp`
- 적용 위치: S-15 상단 중앙 240px
- 역할: 빈 상태
- 크기: 480×480 (1:1)
- 표시: object-fit contain. <768 180px
- alt: "" (장식, 문구는 HTML 3개 언어로 표시)
- 프롬프트: An open empty display cabinet door swinging slightly, with a single small four-pointed star floating outside it; front view; plain background; light, curious mood. + 앵커
- 네거티브: 공통 네거티브

### IMG-21 계산기
- 파일 경로: `public/images/hero/calculator.webp`
- 적용 위치: S-16 섹션 1 헤더 우측 280px
- 역할: 섹션 설명
- 크기: 720×540 (4:3)
- 표시: object-fit contain. <1024 숨김
- alt: "" (장식)
- 프롬프트: A simple calculator with blank keys next to two blank price tags connected by a small arrow, one tag slightly larger than the other; front view; plain background; practical mood. + 앵커
- 네거티브: 공통 네거티브 + no digits on keys or screen

### IMG-22 구독 메일
- 파일 경로: `public/images/brand/subscribe-mail.webp`
- 적용 위치: C-09 구독 폼 좌측 96px(<768 상단 64px) — S-04, S-06, S-08, S-11
- 역할: 섹션 설명
- 크기: 192×192 (1:1)
- 표시: object-fit contain
- alt: "" (장식)
- 프롬프트: A closed envelope with a small blank price tag tied to it and a tiny four-pointed star; front view; plain background; friendly mood. + 앵커
- 네거티브: 공통 네거티브

### IMG-23 공유 카드 배경
- 파일 경로: `public/images/share/card-bg.webp`
- 적용 위치: S-09 캔버스 1080×1350 전체 배경
- 역할: 배경
- 크기: 1080×1350 (4:5)
- 표시: 캔버스 drawImage 전체 채움
- alt: "" (캔버스 내부, HTML 미노출)
- 프롬프트: Solid deep violet background with very subtle large rounded rectangle shapes in a slightly lighter violet along the edges, a few tiny four-pointed stars scattered in the top 15 percent and bottom 15 percent only, center area completely plain. + 앵커
- 네거티브: 공통 네거티브 + no objects in the central 70 percent

════════════════════════════════
## §6 CTA 전략

### 전체 원칙
- 1차 CTA 문구: `cta.primary` "{market}에서 매물 보기" 1종. 2차 CTA 문구: `cta.secondary` "목표가 도달 메일 받기" 1종(`tracking_request` 맥락은 같은 계열 `subscribe.trackCta`).
- `btn-primary` 스타일은 한 뷰포트에 1개만 보이게 한다. 마켓 버튼 그룹(C-08)은 첫 버튼만 `btn-primary`, 나머지는 `btn-secondary`. 1차 CTA가 없는 화면에서는 그 화면의 단일 행동 버튼 1개만 `btn-primary`.
- 시각 우열: 1차 = `btn-primary`(배경 `--color-primary`). 2차 = `btn-secondary`(테두리 `--color-secondary`). 보조 이동 = `btn-text`. 2차 CTA를 `btn-primary`로 만들지 않는다.
- 외부 이동 CTA는 항상 외부 아이콘 + `cta.leaveNote`.
- 1차 CTA와 2차 CTA를 같은 행에 나란히 두지 않는다(세로 간격 최소 `--space-6`).

### S-00 언어 선택
- 단일 행동: 언어 카드 선택
- 1차 CTA: 없음(시세 맥락 없음). 행동 요소는 언어 카드 3장
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: 없음(각 카드 설명이 역할 수행)
- 모바일: 카드 1열, 전체 폭, 높이 96px
- 두지 않을 것: 외부 링크, 헤더 내비

### S-01 홈
- 단일 행동: 굿즈 검색 제출 → S-04 도달
- 1차 CTA: 없음(특정 굿즈 맥락 없음). 화면 단일 `btn-primary`는 히어로 검색 버튼 `home.searchButton` → `/{lang}/search/?q=`
- 2차 CTA: 없음(구독 배치 화면 아님)
- 재노출: 없음
- 망설임 해소 문구: 검색 입력 아래 예시 칩 3개(시세 있는 굿즈)
- 모바일: 검색 버튼이 입력 아래 전체 폭 52px
- 두지 않을 것: 히어로 안에 스캔·진열장 버튼(섹션 3에서만), 외부 마켓 링크

### S-02 IP 목록
- 단일 행동: IP 카드 클릭 → S-03
- 1차 CTA: 없음(탐색 허브)
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: 없음
- 모바일: 카드 1열 전체 폭
- 두지 않을 것: 광고 고지 이외 외부 링크

### S-03 IP 허브
- 단일 행동: 굿즈 카드 클릭 → S-04
- 1차 CTA: 없음. 마켓 링크는 굿즈 단위(S-04)에서만 제공
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: 헤더 아래 메시지 1순위 문장
- 모바일: 필터 칩 가로 스크롤, 카드 2열
- 두지 않을 것: 카드 안 외부 링크, 카드 안 담기 버튼(카드 전체 링크 유지)

### S-04 굿즈 상세
- 단일 행동: 마켓 링크 클릭(1차 전환)
- 1차 CTA: `cta.primary`(거래 건수 최다 마켓) / 섹션 3 시세 카드 하단, 좌측 정렬, 큰 숫자·신뢰 줄 아래 / 새 탭으로 해당 마켓 URL(`확인URL` → 없으면 검색 URL, 어필리에이트 파라미터 조건부). 시세 없는 굿즈는 1차 CTA 없음(C-08 검색 버튼은 `btn-secondary`)
- 2차 CTA: `cta.secondary`(시세 있음) 또는 `subscribe.trackCta`(시세 없음) / 섹션 6 C-09, 거래 기록 표 아래 / 폼 펼침 → GIS → `POST /v1/subscriptions`
- 보조: `goods.addShelf`, `goods.addWish` / 섹션 2 개요 우측 / 로컬 저장
- 재노출: <768에서 섹션 3 하단이 뷰포트 위로 벗어나면 하단 고정 바 표시(높이 72px + safe-area, `--color-surface`, 상단 1px `--color-border`, `--shadow-raised`, 200ms 슬라이드업). 내용: 좌측 중간 거래가 16/700 + C-05, 우측 `btn-primary` `cta.primary`(52px). 섹션 3이 다시 보이면 숨김. 시세 없는 굿즈는 고정 바 없음. ≥768 재노출 없음
- 망설임 해소 문구: 마켓 버튼 그룹 바로 아래 `cta.leaveNote`, 담기 버튼 아래 C-15
- 모바일: 마켓 버튼 전체 폭 세로 스택(첫 버튼 52px), 고정 바 사용
- 두지 않을 것: 시세 카드 안 공식몰 링크(섹션 2 메타 표에만), 시세 카드 안 내부 링크 블록, 1차 CTA 옆 구독 버튼

### S-05 검색
- 단일 행동: 결과 카드 클릭 → S-04
- 1차 CTA: 없음(굿즈 맥락 없음)
- 2차 CTA: 없음
- 보조: 빈 결과 시 `search.manualAdd`(`btn-secondary`) → S-06 직접 등록
- 재노출: 없음
- 망설임 해소 문구: 빈 결과 `search.emptyBody`
- 모바일: 입력 상단 고정 아님(헤더만 sticky)
- 두지 않을 것: 외부 마켓 검색 링크

### S-06 스캔·직접 등록
- 단일 행동: 진열장에 담기
- 1차 CTA: 없음(구매 맥락 아님). 화면 단일 `btn-primary`: 시작 전 `scan.start`, 결과 후 `goods.addShelf` 또는 `scan.saveManual`(동시에 1개만 노출)
- 2차 CTA: `subscribe.trackCta` / 불일치 시 직접 등록 폼 아래 C-09 / GIS → `POST /v1/subscriptions`(`requests`에 입력값)
- 재노출: 없음
- 망설임 해소 문구: 담기 버튼 아래 C-15, 직접 등록 폼 아래 `scan.manualNote`
- 모바일: 결과 카드와 버튼 전체 폭, 스캔 성공 시 결과로 자동 스크롤
- 두지 않을 것: 외부 마켓 링크, 결과 카드 주변 관련 굿즈 블록

### S-07 내 진열장
- 단일 행동: 공유 카드 만들기(항목 3개 이상) / 바코드 등록(3개 미만)
- 1차 CTA: 없음(보유 품목이라 구매 맥락 아님)
- 화면 단일 `btn-primary`: 3개 이상 `col.share` → S-09, 빈 상태 `cta.scan` → S-06. 3개 미만·비어있지 않음은 `cta.scan`을 `btn-secondary`로
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: 요약 카드 C-15
- 모바일: 버튼 요약 카드 아래 전체 폭
- 두지 않을 것: 행마다 마켓 링크(보유품 판매 유도로 오해)

### S-08 위시리스트
- 단일 행동: 목표가 도달 굿즈의 마켓 링크 클릭
- 1차 CTA: `cta.primary` / 섹션 2 도달 카드 각각 하단(C-08), 뷰포트에 `btn-primary` 1개 규칙에 따라 첫 도달 카드만 `btn-primary`, 나머지 카드의 첫 버튼은 `btn-secondary` / 새 탭 마켓 URL
- 2차 CTA: `cta.secondary` / 섹션 4 C-09 / GIS → `POST /v1/subscriptions`(`watches`에 위시리스트 전체)
- 재노출: 없음
- 망설임 해소 문구: 도달 카드의 `wish.below` + `cta.leaveNote`
- 모바일: 도달 카드 1열, 마켓 버튼 전체 폭
- 두지 않을 것: 도달 섹션 안 구독 폼, 도달 0건일 때 1차 CTA

### S-09 공유 카드
- 단일 행동: 카드 공유(또는 저장)
- 1차 CTA: 없음(구매 맥락 아님). 화면 단일 `btn-primary`: 생성 전 `share.create`, 생성 후 `share.share`(미지원 시 `share.download`)
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: `share.photoNote`
- 모바일: 버튼 전체 폭, 미리보기 위·설정 아래
- 두지 않을 것: 외부 SNS별 개별 버튼(Web Share로 통일)

### S-10 가이드 목록
- 단일 행동: 가이드 카드 클릭 → S-11
- 1차 CTA: 없음(목록)
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: 없음
- 모바일: 카드 1열
- 두지 않을 것: 외부 링크

### S-11 가이드 상세
- 단일 행동: 본문 CTA 슬롯 클릭
- 1차 CTA: `cta.primary` / 슬롯 A(두 번째 h2 섹션 끝) 굿즈 카드 아래, `endCta=primary`이면 슬롯 B에도 / 새 탭 마켓 URL. 뷰포트 규칙: 슬롯의 첫 카드 버튼만 `btn-primary`
- 2차 CTA: `cta.secondary` / `endCta=secondary`(CT-05)일 때 슬롯 B C-09
- 보조: `endCta=scan` → `cta.scan` `btn-primary`(1차 없는 슬롯), `endCta=shelf` → `col.emptySearch` `btn-secondary`
- 재노출: 없음
- 망설임 해소 문구: 1차 CTA 아래 `cta.leaveNote`, 어필리에이트 ID 설정 시 슬롯 바로 위에 `footer.affiliate`
- 모바일: 슬롯 카드 전체 폭 1열
- 두지 않을 것: 본문 첫 화면(h1~첫 h2) 안의 CTA, 목차 안의 CTA

### S-12 데이터 출처와 계산 방법
- 단일 행동: 정보 확인 후 이전 페이지 복귀
- 1차 CTA: 없음(신뢰 정보 페이지, 판매 유도 시 신뢰 훼손)
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: 없음
- 모바일: 해당 없음
- 두지 않을 것: 마켓 링크, 구독 폼

### S-13 개인정보처리방침·이용약관
- 단일 행동: 문서 열람
- 1차 CTA: 없음(법적 고지)
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: 없음
- 모바일: 해당 없음
- 두지 않을 것: 모든 CTA

### S-14 IP×품목유형
- 단일 행동: 굿즈 카드 클릭 → S-04
- 1차 CTA: 없음(S-03과 같은 이유)
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: 헤더 `ip.typeLead`
- 모바일: S-03과 같음
- 두지 않을 것: S-03과 같음

### S-15 404
- 단일 행동: 홈으로 이동
- 1차 CTA: 없음(복구 화면)
- 2차 CTA: 없음
- 행동 버튼: 언어별 `btn-secondary` 홈 링크 + `btn-text` 검색 링크
- 재노출: 없음
- 망설임 해소 문구: 없음
- 모바일: 버튼 전체 폭
- 두지 않을 것: 외부 링크

### S-16 프리미엄 계산기
- 단일 행동: 계산 후 카탈로그에서 굿즈 찾기
- 1차 CTA: 없음(특정 굿즈 맥락 없음)
- 화면 행동 버튼: `calc.findGoods` `btn-secondary` → S-05, `cta.scan` `btn-text` → S-06. 화면에 `btn-primary` 없음
- 2차 CTA: 없음
- 재노출: 없음
- 망설임 해소 문구: 결과 카드 `goods.fxNote`
- 모바일: 버튼 결과 카드 아래 전체 폭 세로 스택
- 두지 않을 것: 외부 마켓 링크(입력 금액과 무관한 이동)

