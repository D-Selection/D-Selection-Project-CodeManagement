const sites = [
  { code: "001108", name: "ACROHILLS 논현 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "040104", name: "e편한세상 가재울 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "070925", name: "e편한세상 광교 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "080394", name: "e편한세상 부천 어반스퀘어 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "150120", name: "구리역 하이니티 리버파크 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "170020", name: "아크로 서초 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "170374", name: "e편한세상 센텀 하이베뉴 현장", biz: "도급사업", product: "아파트", created: "Feb 2, 2026, 3:46 PM" },
  { code: "180247", name: "아크로 리버스카이 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "180258", name: "e편한세상 강동 프레스티지원 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "190197", name: "아크로 리츠카운티 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "200160", name: "e편한세상 당산 리버파크 현장", biz: "도급사업", product: "아파트", created: "Feb 4, 2026, 2:40 PM" },
  { code: "210114", name: "e편한세상 분당 퍼스트빌리지 현장", biz: "도급사업", product: "아파트", created: "Feb 2, 2026, 3:45 PM" },
  { code: "210115", name: "e편한세상 동탄 파크아너스 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "230028", name: "e편한세상 성성호수공원 현장", biz: "도급사업", product: "아파트", created: "Feb 2, 2026, 3:47 PM" },
  { code: "230146", name: "안양 에버포레 자연&e편한세상 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "230160", name: "e편한세상 동탄역 어반원 현장", biz: "도급사업", product: "아파트", created: null },
  { code: "240196", name: "e편한세상 내포 에듀플라츠 현장", biz: "도급사업", product: "아파트", created: "Feb 2, 2026, 3:47 PM" },
];

const siteTableBody = document.getElementById("siteTableBody");

siteTableBody.innerHTML = sites.map((s) => `
  <tr data-code="${s.code}">
    <td>${s.code}</td>
    <td>${s.name}</td>
    <td>${s.biz}</td>
    <td>${s.product}</td>
    <td>${s.created ? s.created : '<span class="value-empty">No value</span>'}</td>
    <td class="csite-goto-cell">
      <button class="csite-goto-btn" type="button" data-goto="hq" title="본사에서 관리하는 상품구성 · 원가 · 판매가 · 안분표 생성 화면">🏢 본사 메뉴</button>
      <button class="csite-goto-btn" type="button" data-goto="site" title="본사 데이터를 가져와 현장에서 관리하는 화면(원가·판매가 제외, 가감조건/현장 고객언어 추가)">🏗 현장 메뉴</button>
    </td>
  </tr>
`).join("");

/* 현장별로 "본사 메뉴"(안분표 생성 앱, index.html) 또는
   "현장 메뉴"(별매 행사 종료 후 현장이 직접 관리하는 site-menu.html)로 이동 */
siteTableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-goto]");
  if (!btn) return;
  window.location.href = btn.dataset.goto === "site" ? "site-menu.html" : "index.html";
});
