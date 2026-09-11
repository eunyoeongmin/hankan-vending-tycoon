# 9.0 레퍼런스 구현 대조표

> 이 표는 9.0 기반 기능의 대조 기록입니다. 10.0 새 게임의 달력·운영 위임·차입·연구 조건은 [장기 경영 개편](MANAGEMENT_REDESIGN.md)을 우선 적용합니다. 기존 저장의 9.0 규칙은 유지됩니다.

기준: 사용자가 승인한 [70개 후보](REFERENCE_CATALOG.md). 원작 전체를 복제했다는 뜻이 아니라, 각 후보를 현재 4~5상권·최대 3경쟁사·자판기 사업 규모에 맞춰 구현한 범위입니다. 제외한 은행/보험사 직접 경영, 도시 정치, 무관한 산업, 생활 시뮬레이션, 범죄 버튼, 무한 맵·멀티플레이는 추가하지 않았습니다.

9.0.1 진입: 왼쪽 **발주·직원·연구·제조·운영 규정**에서 해당 업무를 직접 엽니다. 사업장·물류·상품·기기 정비·시설 계약·기업집단·경영 분석도 왼쪽 전용 메뉴를 사용하며, 사업 운영 통합 메뉴와 상단 중복 탭은 제거했습니다. KO/JA와 USD를 유지합니다.

## 시장·상품·기기

| ID | 실제 규칙과 선택 | 주 구현 / 작업 화면 |
|---|---|---|
| M1 | 4개 구매 성향, 가격 민감도·품목 선호·시간대 차이 | `refCustomer` / 시장·상품 |
| M2 | 상권 내부 6개 입지 사이 거리로 선택 확률 변화 | `refCustomer` / 배송 지도 |
| M3 | 가격·실물 품질·브랜드 포지션·용량을 함께 평가 | `refCustomer`, `refBatch` / 상품 |
| M4 | 입지별 신뢰 누적, 품절 시 하락·구매/민원 처리로 회복 | `refCustomer`, `respondComplaint` |
| M5 | 유한 고객이 자사/타사/미구매 중 하나만 선택, 인접 자사 중복 표시 | `refCustomer`, `refSupplyMap` |
| P1 | 제조사별 SKU·250/350/500 ml·구입 원가·실물 품질 보존 | `refSeedCatalog`, `refOrder` / 구매 계약 |
| P2 | 외부 제조사 상품, 자사·저가·표준·고급 브랜드 | `refBrand`, `refLaunchProduct` / 상품 |
| P3 | 출시 직후·성숙·장기 노후 제품 선호 차이와 단종 | `refCustomer`, `refProductDecision` |
| P4 | 광고비·상권 인지도·판매량·판매당 광고비 | `refAdvertise` / 상품 |
| P5 | 소량 시험 생산, SKU 지정 기기 판매, 확대 투자·단종 | `refProduce`, `refSetSKU`, `refProductDecision` |
| V1 | S80/L120 용량, 냉각/가열 지원, 대형 기기 입지 면적 제한 | `refSupports`, `installKit` / 기기 조달·수명 |
| V2 | 사용일·신뢰성·마모·감가상각과 분해 정비 | `refEquipmentDay`, `refRetrofit` |
| V3 | 교체·부품 개조·입지 이전 중 판매 중단, 정비 인력/외주·작업시간 | `refReplace`, `refRetrofit`, `refRelocate` |
| V4 | 제조사 유한 재고에서 중고·리스 교체, 일 리스료·만료 후 중단·갱신 | `refReplace`, `refRenewMachineLease` |
| V5 | 연도별 전자결제/원격재고 도입, 결제 수수료·통신료·지도 정보 갱신 | `refRetrofit`, `recordMarketSale`, `refSupplyMap` |

## 공급·물류·제조

| ID | 실제 규칙과 선택 | 주 구현 / 작업 화면 |
|---|---|---|
| S1 | 거래/연구 자금으로 공급사 운영, 여유 자금 증설, 자금난 조업 중단·투자자 재진입 | `supplierDaily`, `refWorldDay` |
| S2 | 최소 20/50/100/200개·수량 할인·선불/7/14/30일 외상·신용 한도 | `refTerms`, `refOrder` / 구매 계약 |
| S3 | 공급능력의 최대 80% 예약, 다른 회사 예약분 보호·미사용 약정 비용 | `refReserveCapacity`, `refCommerceDay` |
| S4 | 주/예비 거래처, 부족·중단 시 대체 SKU 발주 | `refOrder`, `refDelegate` |
| S5 | 제한된 수입 운송, 외부 공급사 실물 재고를 쓰는 동일 용량 OEM | `refImport`, `refOEM` |
| L1 | 거점별 용량·재고·건설·유지비·담당 기기·냉장 정비 | `refBuildSite`, `refUpgradeHub`, `refSiteUsed` |
| L2 | 밴/냉장차/트럭·차량 리스·경로·적재·연료·직원 시간, 직접 보충 20개/회 | `refVehicle`, `refDispatchRoute`, `companyRestock` |
| L3 | 공급사→거점→다른 거점→기기, 운송 중 화물도 자산 | `refOrder`, `refTransferStock`, `refExtraAssets` |
| L4 | 판매 실적·납기·안전 재고·계절 계수에서 발주점 계산·규정 적용 | `refForecast`, `refForecastPolicy` |
| L5 | 배치별 FEFO·부분 출고·배치 폐기, 운송/냉장 설비 불량에 따른 기한 단축 | `refTake`, `expireInventory`, `refOperationsDay` |
| F1 | 3공정 순차 진행, 사업장별 처리 인력과 공정별 증설 | `refProduce`, `refProductionAdvance` |
| F2 | 용수·원액·용기·금속·전자부품, 등급별 원가/품질과 제품 용량별 소요량 | `refRawOrder`, `refProduce` |
| F3 | 제품 전환 준비 시간, 가동/대기 실적, 설비 상태·피로에 따른 검사 불합격 | `refProductionAdvance` |
| F4 | 재료·인건비·유지비·감가상각을 포함한 생산 단위원가, 외부 구매가격 비교 | `refProductionAdvance` / 공장·구매 계약 |
| F5 | 자사 SKU 재고를 다른 운영사에 도매, AI도 조건이 맞으면 구매 | `refWholesaleOrder`, `companyOrder` |

## 연구·조직·계약·경쟁

| ID | 실제 규칙과 선택 | 주 구현 / 작업 화면 |
|---|---|---|
| R1 | 단계별 기술 선행 조건, 공정/소재/냉각/물류 성과와 제품/설비 이용권 | `refResearch`, `refApplyTechnology` |
| R2 | 설계→시제품→검증, 단계별 승인·보완·중단과 미집행 예산 환급 | `refResearchReview`, `refProductionAdvance` |
| R3 | 협력사 연구 인력 공유·내부 연구소, 재검증·추가 예산·설계 보완 | `refResearchTopUp`, `refResearchReview` |
| R4 | 경쟁사 기술 영구 도입 또는 60일 사용권, 실제 대금·만료 | `refLicense`, `refTimedLicense` |
| R5 | 기술 단계 추격·선행 기술 확보, 신형 생산에만 성과 적용 | `refApplyTechnology`, `refAI`, `refProduce` |
| H1 | 거점/공장/연구소에 개별 직원 배치, 담당 사업장 처리량 | `refAssignEmployee`, `refStaffPower` |
| H2 | 숙련별 채용 비용·급여·교육·경험/전문성 생산성 | `refHireEmployee`, `chainTrain`, `refStaffPower` |
| H3 | 기본/전반/후반 교대·초과근무·피로·추가 급여·만족·퇴사 통지 | `refSetShift`, `refWorkerFactor`, `chainPayroll` |
| H4 | 지역 직무별 유한 채용 풀·시장 임금·경쟁사 영입·유지 인상·인수인계 | `refHiringSupply`, `refPoach`, `refRaise` |
| H5 | 숙련 관리자 임명, 일 예산·현금 유보·재고 기준 안에서 발주/채용/정비 | `refAppointManager`, `refDelegate` |
| C1 | 고정/매출 배분/높은 서비스 기준 계약, 보증금·임대료·60일 만기 | `refContract`, `companyRent` |
| C2 | 동일 상권 2입지 묶음 공고, 낙찰 후 실제 기기 조달/설치 | `refTenderCreate`, `refTenderDay` |
| C3 | 영업 시계로 누적한 재고 가용 시간·기기 상태·벌점에 따른 갱신 | `companyReceive`, `refEquipmentDay` |
| C4 | 예치 입찰·환급·서비스 평가와 만기 전 추가 갱신 제안 | `refBid`, `refTenderRenewal` |
| C5 | 실제 운영사와 보충 위탁, 계약료·일 비용·제공사 인력별 일 처리 한도 | `refOutsource`, `refEquipmentDay` |
| A1 | 밀집/고급/제조/현금 보전의 30일 전략·공세 예산 | `refAI` |
| A2 | 공개 품절 입지 겨냥, 가격·광고 비용·채용 공세·시설 입찰 | `refAI`, `refPoach`, `refBid` |
| A3 | AI의 물량 예약·협력 연구·동일 공정 제조/자재/인력 제한 | `refAI`, `produce`, `orderMaterials` |
| A4 | 소매 경쟁 상대와 도매 외상·기술 거래·위탁 운영 | `refWholesaleTerms`, `refLicense`, `refOutsource` |
| A5 | 공세 유보금·철수/복구·임금 대응·매각·회사 새 기수, AI 구매 판단에 공개 입지 상태 사용 | `refAI`, `recoverCompanyCash`, `reviveCompany` |

## 재무·기업집단·환경·경영 화면

| ID | 실제 규칙과 선택 | 주 구현 / 작업 화면 |
|---|---|---|
| B1 | 기존 최종 손익과 대조하는 손익/재무상태/현금흐름, 차입·투자 구분 | `refFinalizeReports` / 경영 분석 |
| B2 | 사업장 매출/원가/급여/대기, SKU 판매이익·공장 단위원가 | `recordMarketSale`, `refFinanceDay`, `refExtraUI` |
| B3 | 매출채권·매입채무·7일 급여·30일 세금 산정/7일 후 지급 | `refAccruePayroll`, `refCommerceDay`, `refFinalizeReports` |
| B4 | 기존 담보대출 + 60일 차입/180일 회사채 + 신주 발행·희석 | `refBorrow`, `refIssueEquity` |
| B5 | 보험·자기부담·지급 한도·채무 재조정·유휴 자산 정리·연체 종료 | `refInsurance`, `refRestructure`, `refLiquidateIdle` |
| G1 | 기존 경쟁사 과반 지분 경영 정책 변경, 신주 유통분 매집·방어 매입·경영권 상실 | `refControl`, `refTradeVoting`, `refBuyback` |
| G2 | 실제 사업장 분리·별도 현금 예산·인력 처리량과 자회사 자금 부족 | `refSubsidiary`, `refWorkerFactor` |
| G3 | 인수한 사업장/인력/물류 승계와 14일 통합 처리량 감소 | `transferExpansionAssets`, `refWorkerFactor` |
| G4 | 자회사 자금 이동·거점 재고 내부 거래·내부 거래 표시, 연결 시 자산/현금 중복 방지 | `refUnitTransfer`, `refTransferStock`, `refExtraAssets` |
| G5 | 일부 지분 공개 매각, 100% 자회사 본사 통합, 운영 자회사 전체 매각·실물 이전 | `refUnitIPO`, `refUnitDissolve`, `refDivestUnit` |
| E1 | 상권 사업 활동에 따른 개발/인구와 기존 신도시 개방 | `refWorldDay`, 기존 신도시 시스템 |
| E2 | 고용·소득·임금·수요·금리, 기존 경기/물가 옵션 연계 | `refWorldDay`, `demand`, `refBorrow` |
| E3 | 기존 날씨/계절 장면 + 계절·영업 시간대 상품 선호 | `refCustomer`, 기존 실시간 장면 |
| E4 | 2000년 시작, 결제/통신 도입 연도와 냉각 효율 부담금 | `refRetrofit`, `refWorldDay` |
| E5 | **부분 구현. 연속 선택 사건 미완료 ([대조](EVENT_AUDIT.md)).** 공급사 자금난→공급 중단, 피로/정비 부족→처리 저하/불량, 냉장 고장→폐기 | `refWorldDay`, `refProductionAdvance`, `refOperationsDay` |
| U1 | 고정 경영 화면의 사업장 장부·작업 큐·병목 원인 | `renderReference`, `refServiceDiagnostics` |
| U2 | 입지별 가격/재고·관측일/근접 자사와 배송 거점 연결 전환 | `refSupplyMap` |
| U3 | 연구 예산·인력 부족·입고·계약·차입 통지에서 해당 업무 이동 | `refNotice`, `refExtraUI` |
| U4 | 규정 저장/전체 거점 적용·주/예비 공급사·예산/유보금·일 중복 실행 방지 | `refPolicy`, `refApplyPolicy`, `refDelegate` |
| U5 | 운영·제조·지역 확장·기업집단·생존 목표, 실제 거래 기반 운영 순서 | `refGoal`, `refTeachingSteps` |

## 검증을 해석하는 방법

- `tests/reference.cjs`: 새 진입, 발주/외상/화물 자산 보존, 직원 처리량, 단계형 연구, 공장 자재/인력, 차입/보증금, KO/JA 장부.
- `tests/reference-decisions.cjs`: FEFO, 채용 풀/교대/연장 급여, 연구 검토/환급/독점, OEM·도매 외상, 자회사 실물 매각, 적대적 의결권 확보, AI/플레이어 공통 생산 진입.
- `tests/reference-migration.cjs`: 이전 저장의 현금·장부가·원자재·건설·연구 보존, 원본 백업과 결정론적 재개.
- `tests/reference-long.cjs`: 정상 시작 자금·3난수·120일·빈번 사건·재고/재무제표 일치·저장 재개. 스크립트가 영업 결정을 수행합니다.
- `tests/reference-integration.cjs`: 추가 자금·3경쟁사·180일의 제조/재무/인력/AI/폐업/재진입 연결. 정상 난이도 표본과 구분합니다.
- `tests/browser-reference.cjs`: 일본어 첫 진입부터 실제 클릭 거래, 연구 검토·공장 생산·자회사, 4화면 크기, 정지/차입금 표시 갱신 안정성, 메뉴와 저장 재개. 자금/작업 시간은 시험용으로 주입합니다.
- 기존 7/8 규칙 회귀를 별도로 유지했습니다. 기본 시간·기존 저장·메뉴 검사를 새 구현 근거와 혼동하지 않습니다.

자동 검사는 모든 전략의 우열, 장기 재미, 실제 회계 기준 또는 원작 수준의 복잡성을 보장하지 않습니다. 도시의 경로는 현재 입지 거리, 인력시장은 지역/직무 풀, 자회사는 기존 운영 사업장 묶음으로 추상화합니다. 본격 수치 밸런싱·장시간 인간 플레이는 다음 단계입니다.
