/* Read-only notice; license grants do not depend on an acceptance flag. */
const GAME_CODE_LICENSE=__GAME_CODE_LICENSE__;
const GAME_ASSET_LICENSE=__GAME_ASSET_LICENSE__;
let licenseReturn='menu';
function licenseNoticeHTML(){
 const p=(ko,ja)=>`<p>${T(ko,ja)}</p>`;
 return `<article id="license-notice"><h2>${T('이용·라이선스 안내','利用・ライセンス案内')}</h2><small>2026-09-16 · v1.0</small>`+
 p('플레이·수정·복제·재배포·판매·방송 수익화를 자유롭게 허용합니다. 출처 표시, 수정 내용 공개, 수익 배분이나 별도 허락은 필요하지 않습니다.','プレイ・改変・複製・再配布・販売・配信の収益化を自由に許可します。出典表示、変更内容の公開、収益分配、個別の許可は不要です。')+
 `<h3>${T('적용 범위','適用範囲')}</h3>`+
 p('프로젝트 자체 코드·문서는 0BSD, 비서 이미지와 자체 시각 자료·렌더링 결과는 CC0 1.0 Universal로 제공합니다. 그래픽 구현 코드는 0BSD입니다.','独自コード・文書は0BSD、秘書画像と独自の視覚素材・描画結果はCC0 1.0 Universalで提供します。描画プログラムは0BSDです。')+
 p('프로젝트 권리자가 보유한 권리 범위의 허락입니다. 제3자의 권리나 외부 자료·도구의 라이선스를 대신하지 않습니다. 비서 이미지는 AI 생성물이며 독점성이나 제3자 권리의 부재를 보증하지 않습니다.','プロジェクト権利者が保有する権利の範囲での許諾です。第三者の権利や外部素材・ツールのライセンスを置き換えません。秘書画像はAI生成物であり、独占性や第三者の権利が存在しないことを保証しません。')+
 `<h3>${T('무보증·책임 범위','無保証・責任の範囲')}</h3>`+
 p('현 상태로 제공하며 오류 없음, 특정 목적 적합성, 저장 보존, 지속 운영·업데이트·지원을 보증하지 않습니다. 책임 제한은 적용 법률이 허용하는 범위에서만 적용되며 법률상 배제할 수 없는 책임과 권리는 유지됩니다.','現状のまま提供し、無欠陥、特定目的への適合、セーブ保持、継続運営・更新・サポートを保証しません。責任制限は適用法が許す範囲に限り、法律上排除できない責任と権利は維持されます。')+
 p('다른 사람이 만든 수정판·재배포판·유료 상품을 원작자가 제작·지원·보증한다는 뜻은 아닙니다. 수정판 표시 의무를 추가하는 조항은 아닙니다.','第三者の改変版・再配布版・有料商品を原作者が制作・支援・保証するという意味ではありません。改変版の表示義務を追加するものではありません。')+
 `<h3>${T('저장과 사이트 이용','セーブとサイト利用')}</h3>`+
 p('저장은 현재 브라우저에 남습니다. 사이트 데이터 삭제나 브라우저·기기 변경으로 사용할 수 없게 될 수 있습니다. 호스팅 서비스의 정보 처리는 해당 서비스 정책을 별도로 확인해 주세요. 이 안내는 개인정보처리방침이나 무수집 보증이 아닙니다.','セーブは現在のブラウザーに保存されます。サイトデータの削除やブラウザー・端末の変更で利用できなくなる場合があります。ホスティングサービスの情報処理は同サービスの方針を別途確認してください。本案内はプライバシーポリシーや情報無収集の保証ではありません。')+
 `<details><summary>${T('0BSD 원문','0BSD原文')}</summary><pre>${esc(GAME_CODE_LICENSE)}</pre></details><details><summary>${T('CC0 원문','CC0原文')}</summary><pre>${esc(GAME_ASSET_LICENSE)}</pre></details>`+
 p('위 안내는 표준 라이선스에 추가 제한을 부과하지 않습니다.','本案内は標準ライセンスに制限を追加しません。')+
 `<p><a href="https://github.com/eunyoeongmin/hankan-vending-tycoon/blob/main/LICENSING.md" target="_blank" rel="noopener noreferrer">${T('프로젝트·이용 조건','プロジェクト・利用条件')}</a></p></article>`+buttons(`<button id="license-back">${T('메뉴로 돌아가기','メニューへ戻る')}</button>`);
}
const licenseDrawBefore=drawModal;drawModal=function(){
 licenseDrawBefore();const host=$('modal-body');
 if(['menu','pause'].includes(modalView)&&!$('menu-license')){const b=document.createElement('button');b.id='menu-license';b.textContent=T('이용·라이선스 안내','利用・ライセンス案内');(host.querySelector('.menu-actions')||host).append(b);}
 if(modalView==='license')host.innerHTML=licenseNoticeHTML();
};
function leaveLicense(){if(modalView==='license')openModal(licenseReturn);}
const licenseCloseBefore=closeModal;closeModal=function(){if(modalView==='license'){leaveLicense();return;}licenseCloseBefore();};
document.addEventListener('click',e=>{const id=e.target.closest('button')?.id;if(id==='menu-license'&&['menu','pause'].includes(modalView)){licenseReturn=modalView;openModal('license');}else if(id==='license-back')leaveLicense();});
$('modal').addEventListener('cancel',e=>{if(modalView==='license'){e.preventDefault();e.stopImmediatePropagation();leaveLicense();}},true);
