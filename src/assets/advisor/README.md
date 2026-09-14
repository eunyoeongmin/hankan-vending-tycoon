# 경영 비서 기본 초상화

2026-09-14. 사용자 요청: 튜토리얼과 게임 설명을 맡는 1995년대 일본게임 도트 미인 비서 1명.

- 원본: `secretary-v1.png`. 내장 image_gen 도구로 새로 생성. CLI/API 폴백 사용 안 함.
- 성인 여성 회사원, 갈색 단발, 남색 재킷·아이보리 블라우스·버건디 스카프·서류철. 투명 배경, 인물 1명, 문자 없음.
- 원본을 변경하지 않고 보관하며 build.py가 PNG를 HTML에 내장한다. UI에서 비율을 유지해 축소한다.
- 현행 운영 안내와 도움말의 역할 표시는 한국어 `경영 비서`, 일본어 `経営秘書`. 실습형 학습 진행이나 자동 상담 시스템을 구현한 것은 아니다.
- 생성 모델의 결과는 도트풍 래스터이며, 엄밀한 192×256 원본 격자나 32색 이하 팔레트를 검증한 자산은 아니다.

## 최종 생성 프롬프트

Use case: stylized-concept. Asset type: one original secretary/advisor portrait for a 1995 Japanese PC business-management game tutorial and help dialog. Draw ONE attractive adult Japanese office woman approximately 28 years old, mature and capable, warm restrained smile, dark chestnut shoulder-length hair with side-swept fringe, deep brown eyes, navy tailored office blazer over an ivory high-neck blouse and a small burgundy neck scarf. Waist-up portrait, three-quarter view facing slightly toward viewer's right, relaxed professional posture holding a modest gray document folder low at her waist. Fully visible hair, head and shoulders with comfortable margins. AUTHENTIC COARSE 1993-1996 Japanese PC-98 game pixel art: looks hand-pixeled on a native 192 by 256 pixel grid then nearest-neighbor enlarged, clearly visible square pixel clusters, stair-stepped dark outlines, restricted 24-32 color palette, two or three flat shade bands per material, sparse ordered dithering. Period anime facial drawing with a small mouth and pointed but adult face, NOT modern glossy mobile anime. Designed to sit inside gray beveled Windows 95 dialog chrome with navy titlebar. Transparent background, real alpha, no scene, no frame, no UI, no writing or lettering, no logos or watermark. Do not draw a screenshot or an advertisement. No smooth gradients, airbrush, soft shadows, bloom, shiny plastic skin, photorealism, 3D, modern vector illustration, enormous eyes, school uniform, childlike body, cleavage, or elaborate decorative accessories. Keep the artwork genuinely rough and readable at small pixel scale rather than finely detailed high-resolution illustration. Portrait aspect 3:4.
