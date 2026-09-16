# 코드·소재·외부 라이선스 점검

2026-09-16. 대상: 소스 기준 `24b3ca9`, 공개 Sites42 / 게임10.8.2. 이번은 출처·포함 경로 점검이며 코드 유사도 데이터베이스 검사나 법률상 비침해 인증이 아니다.

## 결론

개발에 외부 OSS를 사용했다. 다만 현재 독립 HTML 두 파일에 jsdom/Playwright나 외부 게임 엔진을 묶은 흔적은 발견되지 않았다. 공개 사이트는 호스팅 단계에서 외부 보안 코드를 삽입한다. 따라서 “외부 라이선스 사용 없음”, “사이트에서 외부 코드 실행 없음”, “모든 자료의 권리 문제 없음”으로 설명해서는 안 된다.

## 확인한 범위

| 대상 | 근거와 결과 |
|---|---|
| 게임 코드 | `build.py`의 모든 입력 경로, `src`의 JS/CSS/HTML, 외부 URL·import/require·동적 로딩·저작권 표기·라이브러리 이름 검색. 로컬 소스를 연결하는 방식이며 node_modules 입력 없음. 이름/고지 검색은 복사 코드 부재를 증명하지 않음. |
| 배포 파일 | `dist/index.html`, `dist/art-lab.html` 모두 인라인 스크립트 1개. 외부 script/link 로딩, 웹폰트, 오디오/영상/wasm 자산은 발견되지 않음. SVG namespace URL은 다운로드 주소가 아님. GitHub 이용 조건은 사용자가 여는 링크. |
| 도시·건물·보행자·기기 | `src/art-lab/assets.js`, `pixel-*.js`, `iso-city.js`, `city-art.js`, `base.html`에서 Canvas/SVG 도형으로 구성. 생성 PNG를 타일로 잘라 넣는 경로 없음. 개발 기록 `ART_LAB.md` / `PIXEL_CITY_10.5.md`와 일치. 타 게임 원본과 전수 비교한 것은 아님. |
| 비서 PNG | `src/assets/advisor/README.md`에 생성 도구·날짜·프롬프트 기록. 배포 HTML의 유일한 base64 이미지와 원본의 SHA256 일치. AI 생성물의 독점성·비침해를 보증하지 않음. |
| 상권 시안 PNG 4개 | `assets/districts/`에 GitHub 추적됨. `c26f683`에서 추가, `DISTRICT_ART_DIRECTION.md`에 생성 시안으로 기록. 본편/아트 시험판 빌드 입력도 아니고 HTML 내 이미지 해시에도 없음. 개별 생성 프롬프트·원본 생성 식별자 기록은 없음. |
| 폰트·아이콘 | CSS에서 Segoe UI, Yu Gothic, Malgun Gothic, Tahoma, MS UI Gothic 등 기기 폰트 이름 사용. 폰트 파일이나 아이콘 패키지 재배포는 발견되지 않음. Unicode 문자와 직접 그린 도형 사용. |
| 개발 의존성 | lockfile의 38개 항목 모두 dev. 별도 임시 폴더에서 `npm ci --ignore-scripts --no-audit --no-fund` 실행해 실제 패키지 메타데이터와 루트 고지 파일 검사. [전체 목록](LICENSE_DEPENDENCIES_10.8.2.json). |
| 별도 브라우저 도구 | 기존 테스트 환경의 Playwright / playwright-core 1.63.0, Apache-2.0. 저장소 lockfile에는 없으며 테스트 코드에서 require. 브라우저 바이너리도 배포물에 없음. 이 표는 OS/브라우저/개발 서비스 전체의 전이 의존성 목록이 아님. |
| CI·빌드 환경 | Python 표준 라이브러리만 빌드에 사용. Node/Python/Git 및 GitHub Actions checkout/setup-node/setup-python은 외부 개발 도구/서비스. 게임 파일로 재배포하지 않음. |
| 공개 호스팅 | 실제 Edge에서 본편·아트 시험판 응답과 네트워크 확인. 각 HTML에 원본 외 인라인 스크립트 1개 추가, `/cdn-cgi/challenge-platform/` 스크립트 및 XHR 발생. 원본 게임 스크립트는 동일하고 추가 스크립트 제거 후 파싱한 전체 HTML도 로컬과 일치. Cloudflare 공식 설명과 일치하는 호스팅 보안 삽입. 서비스 내부 전체 구성이나 OSS 고지 의무까지 확인한 것은 아님. |

## 개발 의존성 라이선스

lockfile 38항목: MIT 28, MIT-0 2, BSD-2-Clause 2, BSD-3-Clause 2, BlueOak-1.0.0 1, CC0-1.0 1, ISC 1, Apache-2.0 1. 패키지 단위 메타데이터 집계이며 패키지 내부의 모든 파일/데이터가 동일 조건이라는 단정은 아니다.

- jsdom 30.0.1: MIT. [프로젝트 원문](https://github.com/jsdom/jsdom/blob/main/LICENSE.txt).
- Playwright / playwright-core 1.63.0: Apache-2.0. [프로젝트 원문](https://github.com/microsoft/playwright/blob/main/LICENSE).
- saxes 6.0.0: package.json은 ISC이나 설치 패키지 루트에 별도 LICENSE/COPYING/NOTICE 파일이 없음. [상류 LICENSE](https://github.com/lddubeau/saxes/blob/master/LICENSE) 참고. 현재 게임 배포에는 미포함. node_modules를 별도 제품에 포함할 때는 정확한 버전의 원문·내부 자료 고지를 다시 수집해야 함.
- 프로젝트 0BSD/CC0는 위 외부 패키지나 호스팅 코드의 원래 조건을 대체하지 않는다. 현재 Git 추적 파일에 node_modules 또는 브라우저 바이너리 없음.

## 발견 및 조치

1. **외부 도구와 공개 사이트에 대한 설명 정정.** 위 범위를 LICENSING/README에도 명시. 게임 메뉴는 이미 제3자 권리 및 호스팅 정책을 별도로 명시하며 이번에 게임 실행 코드는 바꾸지 않음.
2. **lockfile 버전 불일치 수정.** decimal.js의 version은 10.7.1이었으나 resolved URL/integrity와 실제 설치 파일은 10.6.0. jsdom 조건 `^10.6.0`에 맞는 실제 버전 10.6.0으로 메타데이터 정정. 다운로드 URL·해시·실행 패키지는 변경하지 않음. 목록에 정정 전 값도 보존.
3. **시안 출처 기록 한계 명시.** 자산 해시와 비배포 여부를 목록에 남김. 기록되지 않은 프롬프트나 생성 출처를 추정해서 작성하지 않음.

## 검증과 한계

- 공개 HTTP 단순 요청은 403. 실제 headless Edge에서는 두 페이지 모두 200 및 보안 스크립트 관찰. 결과는 목록 JSON에 동적 인증값을 제거하고 기록. 시작 페이지 로딩 표본으로 모든 세션의 통신을 보증하지 않음.
- 빌드 재생성 전후 두 배포 파일의 SHA256 불변 확인. decimal.js 정정 후 의존성 메타데이터 대조 및 기존 메뉴 회귀 검사.
- 전 세계 소스와의 코드 유사도 검사, 이미지 역검색·원작 자산 대조, AI 서비스의 당시 계약/권리 귀속 검토, 패키지 내부 파일별 라이선스 감사는 미실시. 선언문이 없는 복사 코드는 문자열 검색만으로 판별할 수 없음.
- 구체적인 제3자 코드 무단 복제나 배포 고지 누락은 이번 범위에서 발견하지 못했음. **권리 문제가 전혀 없다는 결론은 아님.**

공개 보안 삽입의 공식 근거: [Cloudflare JavaScript Detections](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/). 관리 화면이나 호스팅 설정은 변경하지 않았다.
