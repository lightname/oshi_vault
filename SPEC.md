<!-- SPEC.md -->
# SPEC.md — 오시볼트 (Oshi Vault) v1

## 목표
- 메가 IP 한정판 굿즈 100~150건의 정가·마켓별 거래가를 ko·en·ja 정적 페이지(SSG)로 제공하고 색인시킨다.
- 로그인 없이 진열장(총 가치)·위시리스트(목표가 도달 표시)·공유 카드를 브라우저 안에서 제공한다.
- 1차 전환(마켓 링크 클릭)과 2차 전환(Google 계정 구독, 백엔드 live 시)을 측정한다.

타겟·톤앤매너·CTA는 DESIGN.md §1·§6.
채널·키워드·콘텐츠·성장 장치·언어 확장은 GROWTH.md.

## 비목표
| 항목 | 이유 |
|---|---|
| 푸시 알림(웹 푸시 포함) | 서버 필요. 방문 시 배지로 대체 |
| 리셀 시세 자동 수집·크롤링 | 데이터는 엑셀로 공급 |
| 로그인·기기 간 동기화·API 저장 구현 | 저장소 인터페이스만 정의, 백엔드 이후 |
| 이메일 저장·발송·알림 메일 | 외부 백엔드 몫 |
| 3D 쇼케이스 | 2D 그리드 카드로 대체 |
| 굿즈별 동적 OG 이미지 | IP 단위 OG만 |
| 공식 상품 이미지, 사용자 사진 영구 저장 | 권리 문제, localStorage 용량 |
| 관리자 화면, 커뮤니티, 리뷰, 결제, PWA 오프라인 | v1 범위 밖 |
| ko·en·ja 외 언어 | 구조만 확장 가능 |
| 색인 L4 아카이브 페이지(발매연도·가격대) | GROWTH.md §1 대량 자동 생성 금지 |
| 실시간 환율 | config 고정 환율 |
| 공유 링크 페이지 | 서버 없음, 진열장은 브라우저에만 존재 |

## 화면 목록
| S-ID | 경로 | 한 줄 목적 | 구현 티켓 |
|---|---|---|---|
| S-00 | `/` | 언어 선택, x-default | T-02 |
| S-01 | `/{lang}/` | 홈: 검색, 프리미엄 상위, 스캔 유도 | T-09 |
| S-02 | `/{lang}/ip/` | IP 목록 | T-04 |
| S-03 | `/{lang}/ip/{ipSlug}/` | IP 허브 | T-05 |
| S-04 | `/{lang}/goods/{id}-{slug}/` | 굿즈 상세, 시세, 1차 CTA | T-08 |
| S-05 | `/{lang}/search/` | 카탈로그 검색 (noindex) | T-10 |
| S-06 | `/{lang}/scan/` | 바코드·품번 스캔, 직접 등록 (noindex) | T-11 |
| S-07 | `/{lang}/collection/` | 내 진열장, 총 가치 (noindex) | T-12 |
| S-08 | `/{lang}/wishlist/` | 위시리스트, 목표가 도달 (noindex) | T-13 |
| S-09 | `/{lang}/share/` | 공유 카드 생성 (noindex) | T-14 |
| S-10 | `/{lang}/guides/` | 가이드 목록 | T-15 |
| S-11 | `/{lang}/guides/{slug}/` | 가이드 상세 | T-16 |
| S-12 | `/{lang}/about/` | 데이터 출처·계산 방법 | T-17 |
| S-13 | `/{lang}/privacy/`, `/{lang}/terms/` | 법적 고지 | T-18 |
| S-14 | `/{lang}/ip/{ipSlug}/{type}/` | IP×품목유형 (L2 이상만 생성) | T-06 |
| S-15 | `404.html` | 없는 페이지 | T-03 |
| S-16 | `/{lang}/tools/premium-calculator/` | 프리미엄 계산기 | T-19 |
공통 레이어(헤더·푸터·언어 선택기·동의 배너·SEO·sitemap): T-01. 구독 컴포넌트: T-07. OG 이미지 생성: T-20.

## 핵심 흐름
- P1 검색 유입 구매: S-04 → 시세 확인 → 마켓 버튼(외부) / S-04 → 진열장 담기 → S-07 → S-09 공유
- P1 IP 탐색: S-01 → S-02 → S-03 → S-04 → 마켓 버튼
- 스캔 등록: S-01 → S-06 → 일치: 담기 → S-07 / 불일치: 직접 등록 → 구독(tracking_request)
- 목표가: S-04 위시리스트 담기 + 목표가 → (재방문) 헤더 배지 → S-08 → 마켓 버튼
- 정보형 유입: S-11 → 슬롯 A 굿즈 카드 → 마켓 버튼 또는 S-04
- 도구 유입: S-16 → S-05 → S-04
- P2 해외: S-00 → S-01(en·ja) → 위 흐름 동일

## 데이터 모델

### 원천 엑셀 `Spark_메가IP굿즈.xlsx`
- 시트 `메가IP`: IP명, 원어명, 권리사, 분류(게임/애니/캐릭터/영화), 우선순위(1~3), 공식몰URL, 주요판매처URL, 상태(수집대상/제외), 최근수집일, 누적굿즈수, 선정근거, **IP슬러그, IP명(EN), IP명(JA)**
- 시트 `굿즈`: 굿즈ID, IP명, 상품명(원어), 상품명(KR), 품번/JAN, 제조사, 품목유형, 한정구분, 예약·발매일, 정가, 통화, 판매처, 판매처유형, 판매상태, 상품URL, URL검증, 검증일, 리셀중앙값·리셀통화·리셀표본수·리셀확인URL·리셀확인일(무시), 최초수집일, 비고, **상품명(EN), 상품명(JA), 비고(EN), 비고(JA), EN검수(Y/N), JA검수(Y/N)**
- 시트 `시세`: 굿즈ID, 일자, 마켓(ebay/mercari/kream/other), 중앙값, 통화, 표본수, 확인URL. `굿즈ID+일자+마켓` 유일.
- 변환 규칙·필수 필드·enum 매핑: CORE.md C-22.

### 생성 JSON (`src/data/generated/`, `public/data/catalog.json` = 아래 4개 합본)
| 엔티티 | 필드:타입 |
|---|---|
| Ip (`ips.json`) | slug:string, name:{ko:string,en:string,ja:string}, original:string, owner:string, category:'game'\|'anime'\|'character'\|'movie', priority:1\|2\|3, officialUrl:string\|null, order:number, goodsCount:number |
| Goods (`goods.json`) | id:string(`AAA-0000`), ipSlug:string→Ip.slug, slug:string, name:{ko:string,en:string,ja:string}, original:string, code:string\|null, codeType:'jan13'\|'jan8'\|'other'\|null, maker:string\|null, type:'figure'\|'plush'\|'badge'\|'card'\|'kuji'\|'apparel'\|'other', limit:'quantity'\|'period'\|'store'\|'region'\|'lottery'\|'collab'\|'regular', releaseDate:string\|null, retail:{price:number,currency:Currency}, seller:string, sellerType:'official_online'\|'official_store'\|'mall'\|'specialty', status:'preorder'\|'onsale'\|'soldout'\|'ended', officialUrl:string, verifiedAt:string, firstCollectedAt:string, note:{ko:string\|null,en:string\|null,ja:string\|null}, review:{en:boolean,ja:boolean} |
| PriceSnapshot (`prices.json`) | goodsId:string→Goods.id, date:string, market:Market, median:number, currency:Currency, samples:number, sourceUrl:string\|null |
| Meta (`meta.json`) | generatedAt:string(YYYY-MM-DD), counts:{ips:number,goods:number,prices:number} |
- 날짜는 전부 `YYYY-MM-DD` 문자열. 관계: Ip 1—N Goods 1—N PriceSnapshot.

### 슬러그 고정 `src/data/slug-lock.json`
`{ "PKM-0001": "pokemon-visual-art-book-book1" }` — 한 번 기록된 값은 바뀌지 않는다.

### 사용자 데이터 (localStorage 키 `mipg.v1`)
| 엔티티 | 필드:타입 |
|---|---|
| UserDataDoc | version:1, collection:CollectionItem[], wishlist:WishItem[], prefs:{subscribed:{target_price?:string, tracking_request?:string}} |
| CollectionItem | id:string(굿즈ID 또는 `USR-{base36 ms}`), goodsId:string\|null, manual?:{name:string, ipName:string, price:number, currency:Currency, releaseDate?:string, code?:string}, qty:number(1~99), acquiredPrice?:number, acquiredCurrency?:Currency, addedAt:string(ISO) |
| WishItem | goodsId:string, targetPrice:number\|null, currency:Currency, addedAt:string(ISO) |
- 같은 goodsId 재추가 시 collection 은 qty+1(상한 99), wishlist 는 무시.
- 동의 상태는 별도 키 `mipg.consent.v1` = `'granted'|'denied'`.

## API 계약

공통 응답: `{ "ok": true, "data": T }`
공통 에러: `{ "ok": false, "error": { "code": ErrorCode, "message": string, "fieldErrors"?: Record<string,string> } }`
ErrorCode: `INVALID_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL`, `NETWORK`(클라이언트 전용: fetch 실패·타임아웃 10s·JSON 파싱 실패)
기준 URL: `config.api.baseUrl`. 정적 파일 행은 같은 출처이며 공통 봉투를 쓰지 않는다.

| 메서드 | 경로 | 요청 파라미터(이름:타입:기본값) | 응답 data 필드(이름:타입) | 에러 코드 | 구현 담당 티켓 |
|---|---|---|---|---|---|
| POST | `/v1/subscriptions` | idToken:string:없음(필수), locale:Lang:없음(필수), topics:('target_price'\|'tracking_request')[]:없음(1개 이상), consentVersion:string:`config.subscribe.consentVersion`, watches:{goodsId:string,targetPrice:number,currency:Currency}[]:[], requests:{name:string,ipName:string,code:string\|null}[]:[] | subscriptionId:string, status:'pending'\|'active' | INVALID_REQUEST, UNAUTHORIZED, RATE_LIMITED, INTERNAL, NETWORK | T-07 |
| GET | `/data/catalog.json` (정적) | 없음 | meta:Meta, ips:Ip[], goods:Goods[], prices:PriceSnapshot[] (봉투 없음, 전체 1회) | NETWORK | T-01 |
| GET | `/seo-manifest.json` (정적, 빌드 내부용) | 없음 | entries:{path:string, lang:Lang\|null, screen:string, indexable:boolean, lastmod:string, alternates:Record<string,string>}[] (봉투 없음) | 없음 | T-01 |

`api.mode = 'mock'` 이면 POST 는 네트워크 없이 300ms 후 `{ok:true,data:{subscriptionId:'mock',status:'pending'}}` 반환(CORE C-34).
