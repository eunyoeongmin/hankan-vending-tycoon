/* Stable IDs are shared by saves, quotes, effects and the event register. */
function businessEventCatalog(){return [
 ['festival','동네 봄 축제','町の春祭り','market'],['influencer','SNS의 작은 스타','SNSの小さなスター','market'],
 ['breakdown','냉각 장치 이상','冷却装置の異常','equipment'],['rival','경쟁 업체의 등장','競合の出店','rival'],
 ['inspection','위생 점검 주간','衛生点検週間','equipment'],['power','전력 수급 경보','電力需給警報','equipment'],
 ['marathon','강변 마라톤','川沿いマラソン','market'],['exam','대학 시험 기간','大学の試験期間','market'],
 ['office','기업 제휴 제안','企業提携の提案','contract'],['lost','자판기 앞 분실물','自販機前の忘れ物','staff'],
 ['tv','지역 방송 출연','地域テレビ出演','market'],['construction','도로 공사 안내','道路工事のお知らせ','equipment'],
 ['eco','친환경 상점 인증','環境配慮店の認定','contract'],['complaint','음료 미출고 신고','飲料未排出の報告','equipment'],
 ['station','주말 관광 열차','週末の観光列車','market'],['neighborhood','입주민 감사 주간','住民感謝週間','market'],
 ['supply-review','공급망 중단 예고','供給網停止予告','supply'],['regulation-review','위생 재검사 통지','衛生再検査通知','equipment'],
 ['staff-review','직원 이직 통보','社員の退職通知','staff'],['finance-review','신용 재심사','信用再審査','finance'],
 ['vendor-price','도매처 가격 인상 통보','卸価格改定通知','supply'],['cost-surge','특정 상품 원가 급등','特定商品の原価急騰','supply'],
 ['vendor-stop','주 공급사 공급 중단','主要仕入先の供給停止','supply'],['quality-recall','자체 브랜드 품질 문제','自社ブランド品質問題','production'],
 ['factory-delay','공장 납기 차질','工場納期の遅れ','production'],['permit-renewal','설치 계약 갱신','設置契約更新','contract'],
 ['misdelivery','배송 오배송','配送先の誤り','supply'],['inventory-gap','창고 재고 차이','倉庫在庫差異','supply'],
 ['rate-rise','금리 인상 예고','金利上昇予告','finance'],['rent-talk','임대료 재협상','賃料再交渉','contract'],
 ['buyout-offer','경쟁사의 기기 매입 제안','競合の機械買収提案','rival'],['price-pact','경쟁사의 가격 공조 제안','競合の価格協調提案','rival'],
 ['rival-factory','경쟁사의 제조업 진출','競合の製造業進出','rival'],['product-trend','특정 상품 SNS 유행','特定商品のSNS流行','market'],
 ['trend-end','유행 종료·악성재고','流行終了・滞留在庫','market'],['repeat-complaint','반복 민원과 거래처 면담','継続苦情と取引先面談','contract'],
 ['sponsor-bid','행사 후원권 입찰','イベント協賛権の入札','rival'],['prototype-fail','연구 시제품 성능 미달','研究試作品の性能不足','research'],
 ['cold-transport','무더위와 냉장 운송 부족','猛暑と冷蔵輸送不足','supply'],['poaching','경쟁사의 핵심 직원 영입','競合による主要社員の勧誘','staff']
].map(([id,ko,ja,group])=>({id,name:B(ko,ja),group}));}
function registerBusinessEvents(){for(const d of businessEventCatalog())if(!EVENTS.some(e=>e.id===d.id))EVENTS.push({id:d.id,businessOnly:true,icon:'',name:d.name,desc:B('사업 조건을 확인하십시오.','事業条件を確認してください。'),options:[option(B('확인','確認'),0,0)]});}
const BUSINESS_EVENTS=businessEventCatalog();
function beName(key){return BUSINESS_EVENTS.find(e=>e.id===key)?.name||B(key,key);}
function beEnabled(){return typeof mgEnabled==='function'&&mgEnabled();}
function eventBlocksClock(){return !!state.pending&&!(beEnabled()&&state.businessEvents?.pending?.deferred);}
