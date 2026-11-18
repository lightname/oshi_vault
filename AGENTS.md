<!-- AGENTS.md -->
# AGENTS.md

## 프로젝트
- 사이트명: 오시볼트 (en Oshi Vault, ja オシボルト). 슬로건: 내 최애 굿즈의 지금 가치 / What your favorite merch is worth now / 推しグッズの、いまの価値
- 한 줄 요약: 메가 IP 한정판 굿즈의 정가와 마켓별 거래가를 ko·en·ja 정적 페이지로 비교하고, 로그인 없이 진열장·위시리스트·공유 카드를 제공하는 Next.js 정적 사이트(Cloudflare Pages).

## 기술 스택 (정확한 버전, `--save-exact`)
- 런타임: Node 22.x (`.node-version` = 22)
- dependencies: next 16.4.3, react 19.3.1, react-dom 19.3.1, @zxing/browser 0.2.1, @zxing/library 0.23.0, gray-matter 4.0.3, marked 18.1.1
- devDependencies: typescript 5.9.3, eslint 9.39.5, eslint-config-next 16.4.3, tailwindcss 4.3.3, @tailwindcss/postcss 4.3.3, exceljs 4.4.0, vitest 5.0.5, vite 8.3.5, @vitejs/plugin-react 6.1.2, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/jest-dom 7.0.1, jsdom 30.1.3, @playwright/test 1.64.1, @types/react 19.3.0, @types/react-dom 19.3.0, @types/node 22.x 최신
- 배포: `output: 'export'` → `out/`, Cloudflare Pages(빌드 명령 `npm run build`, 출력 `out`)

## 검증 명령
완료 판정은 다음 명령의 종료 코드로만 한다:
`npm run data:check && npm run typecheck && npm run lint && npm test && npm run build && npm run seo:check`
'잘 동작할 것으로 보입니다' 같은 자체 판단 금지.

## 실행
- 개발: `npm run dev` → http://localhost:3000/ko/
- 정적 미리보기: `npm run build && npm run preview` → http://localhost:4173/
- QA 스크린샷: `npm run qa:shots` → `qa/screenshots/{375,768,1440}/{S-ID}-{lang}.png` (Playwright chromium 은 T-01 에서 `npx playwright install chromium`)
- e2e 스모크: `npm run e2e`

## 문서 로딩
| 문서 | 읽는 조건 | 읽는 범위 |
|---|---|---|
| AGENTS.md | 모든 세션 시작 | 전체 |
| CONVENTIONS.md | 코딩 세션 시작 | 전체 |
| SPEC.md | 코딩 세션 시작 | 데이터 모델, API 공통 형식, 화면 목록 |
| DESIGN.md | 코딩 세션 시작 | §3 |
| GROWTH.md | 코딩 세션 시작 | §2, §4, §5, §6 |
| CORE.md | 코딩 세션 시작 | 전체 |
| TICKETS.md | 코딩 세션 시작 | 맨 위 세 줄과 공통 줄 |
| PROGRESS.md | 코딩 세션 시작 | 전체 |
| TICKETS.md | 티켓마다 | 해당 티켓 |
| DESIGN.md | 티켓마다 | 참조 줄의 S-xx 화면 절, §6 S-xx, §4.0 중 언급된 C-xx |
| GROWTH.md | 티켓마다 | 참조 줄의 G·CT·KW 항목 |
| CORE.md | 티켓마다 | 참조 줄의 C-xx |
| SPEC.md | 티켓마다 | 티켓이 가리키는 API 계약 행 |
| 전체 | 1차 QA 세션(P7) | 읽기 전부. 쓰기는 QA.md §3 과 GROWTH.md(§9 이력 기록 필수)만 |
| 전체 | 수정 세션(P8) | 읽기 필요한 만큼. 쓰기는 코드와 QA.md §4 만 |
| 전체 | 최종 QA 세션(P9) | 읽기 전부. 쓰기는 최종완료보고서.md 만 |

## 세션 역할
코딩 세션(P6)과 수정 세션(P8)만 코드를 수정한다.
QA 세션(P7, P9)은 코드를 수정하지 않는다.
설계 문서 중 수정 가능한 것은 P7의 GROWTH.md 하나뿐이다. 다른 세션은 설계 문서를 수정하지 않는다.
코딩 세션은 QA.md §2 에 코딩 후 추가 점검 항목을 5개 이내로 쓴다.

## 성장 규칙
GROWTH.md §1에서 '금지'인 채널을 구현하지 않는다(예: 대량 메일 발송 기능).
콘텐츠 본문을 지어 쓰지 않는다. 화면 문구를 하드코딩하지 않는다(메시지 파일).
측정 이벤트는 CORE.md의 전송 함수로만 보낸다.
시세·후기·사용자 수 등 데이터에 없는 수치를 화면이나 테스트 외 파일에 만들어 넣지 않는다(테스트 픽스처는 `tests/unit/fixtures/` 에만).

## 논스톱 규칙
코딩 세션은 사람에게 묻지 않는다. 티켓마다 PROGRESS.md를 갱신한다(완료 티켓 행, 현재 상태).

## 가정 규칙
서술이 모호하면 ① 같은 성격의 앞선 티켓 구현을 따르고 ② 없으면 가장 단순한 구현을 고르고 ③ PROGRESS.md 가정 절에 기록한다. 기록 없는 추측 금지.

## 탐색 금지
파일 위치 추측·검색 금지. 경로는 CONVENTIONS.md 폴더 구조와 CORE.md 각 항목의 파일 위치에 있다.

## 절대 금지
- 새 라이브러리 추가(위 기술 스택 외)
- 폴더 구조 변경(CONVENTIONS.md 밖 배치)
- 티켓 외 데이터 스키마 변경(SPEC.md 데이터 모델, `data/source/mega-ip-goods.xlsx` 수정 포함)
- 대규모 리팩터링
- 테스트 스킵(`.skip`, `.only`), `any` 캐스팅, `@ts-ignore`, `eslint-disable`
- DESIGN.md §3 밖 색·여백·폰트
- 이미지 경로 하드코딩(매니페스트 `getImage` 외)
- T-01 이후 공통 레이어(`src/config.ts`, `src/app/layout.tsx`, `src/app/[lang]/layout.tsx`, `src/components/layout/*`, `src/components/ui/*`, `src/lib/*` 중 T-01 생성 파일, `globals.css`) 수정
- `.env` 파일 생성, `process.env` 로 설정값 읽기(예외: `NODE_ENV`, `CF_PAGES`)
- 자동 리다이렉트(언어·지역 기반)

## 브랜치·커밋
- 작업 브랜치 `build/v1`. 티켓 커밋 `T-xx: {요약}`, 수정 커밋 `QA-xx: {요약}`. 티켓 하나 = 커밋 하나 이상, 검증 명령 통과 후 커밋.
- main 직접 커밋·머지 금지. main 머지는 사람만 한다.

## 막힘 프로토콜
동일 오류 3회 실패 시 그 티켓 중단. 우회책 금지.
PROGRESS.md 막힘 절에 기록하고 다음 티켓으로 간다.
이 티켓에 의존하는 티켓은 건너뛰고 같은 절에 '선행 막힘'으로 기록한다.
T-01이 막히거나 막힌 티켓이 전체의 20%를 넘으면(20개 중 5개 이상) 최종완료보고서.md에 막힌부분을 기록하고 다음단계로 넘어간다.

## 세션 교체
도구가 컨텍스트 경고·자동 압축을 띄우거나 이 세션에서 티켓 10개를 끝내면 PROGRESS.md 세션 교체 절에 기록하고 종료한다.
