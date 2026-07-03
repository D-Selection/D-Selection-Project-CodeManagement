/* ===================== STEP 1 · PANEL 1: 프로덕트 ===================== */
const products = [
  { code: "AC-200-01", seq: "01", nameInternal: "국산 주방수전/워터워스유진", nameCustomer: "국산 주방수전/워터워스유진", maker: "워터워스유진", model: "YJ7515", finish: "주방 수전", size: "-", used: true },
  { code: "AC-201-01", seq: "01", nameInternal: "국산 주방수전/대림바스", nameCustomer: "국산 주방수전/대림바스", maker: "대림바스", model: "DL-K6219", finish: "주방 수전", size: "-", used: true },
  { code: "AC-202-01", seq: "01", nameInternal: "국산 다용도실 하부장 수전/대림바스", nameCustomer: "국산 다용도실 하부장 수전/대림바스", maker: "대림바스", model: "DL-K1417", finish: "다용도실 수전", size: "-", used: true },
  { code: "AC-203-01", seq: "01", nameInternal: "국산 일반 세면기 수전/대림바스", nameCustomer: "국산 일반 세면기 수전/대림바스", maker: "대림바스", model: "DL-L5110", finish: "세면기 수전", size: "-", used: true },
  { code: "AC-204-01", seq: "01", nameInternal: "국산 언더볼 세면기 수전/대림바스", nameCustomer: "국산 언더볼 세면기 수전/대림바스", maker: "대림바스", model: "DL-L5610", finish: "세면기 수전", size: "-", used: true },
  { code: "AC-205-01", seq: "01", nameInternal: "국산 선반형 샤워수전/대림바스", nameCustomer: "국산 선반형 샤워수전/대림바스", maker: "대림바스", model: "DL-B7010", finish: "샤워 수전", size: "-", used: true },
  { code: "AC-206-01", seq: "01", nameInternal: "국산 선반형 욕조수전/대림바스", nameCustomer: "국산 선반형 욕조수전/대림바스", maker: "대림바스", model: "DL-B7014SD", finish: "욕조 수전", size: "-", used: true },
  { code: "AC-207-01", seq: "01", nameInternal: "국산 슬라이드바/대림바스", nameCustomer: "국산 슬라이드바/대림바스", maker: "대림바스", model: "DL-S4106", finish: "슬라이드바", size: "-", used: true },
  { code: "AC-208-01", seq: "01", nameInternal: "국산 안마샤워헤드/대림바스", nameCustomer: "국산 안마샤워헤드/대림바스", maker: "대림바스", model: "DL-S4551", finish: "안마샤워헤드", size: "-", used: true },
  { code: "AC-209-01", seq: "01", nameInternal: "국산 일반 세면기(공용욕실)/대림바스", nameCustomer: "국산 일반 세면기(공용욕실)/대림바스", maker: "대림바스", model: "CL-339", finish: "세면기", size: "-", used: true },
  { code: "AC-210-01", seq: "01", nameInternal: "국산 일반 세면기(부부욕실)/대림바스", nameCustomer: "국산 일반 세면기(부부욕실)/대림바스", maker: "대림바스", model: "CL-336", finish: "세면기", size: "-", used: true },
  { code: "AC-211-01", seq: "01", nameInternal: "국산 언더볼 세면기/대림바스", nameCustomer: "국산 언더볼 세면기/대림바스", maker: "대림바스", model: "CL-605", finish: "세면기", size: "-", used: true },
  { code: "AC-212-01", seq: "01", nameInternal: "국산 탑볼 세면기/대림바스", nameCustomer: "국산 탑볼 세면기/대림바스", maker: "대림바스", model: "-", finish: "세면기", size: "-", used: true },
  { code: "AC-213-01", seq: "01", nameInternal: "국산 양변기/대림바스", nameCustomer: "국산 양변기/대림바스", maker: "대림바스", model: "CC-767", finish: "양변기", size: "-", used: true },
  { code: "AC-214-01", seq: "01", nameInternal: "국산 양변기(벽배수)/대림바스", nameCustomer: "국산 양변기(벽배수)/대림바스", maker: "대림바스", model: "CC-730P", finish: "양변기", size: "-", used: true },
  { code: "AC-215-01", seq: "01", nameInternal: "국산 양변기(벽걸이형)/대림바스", nameCustomer: "국산 양변기(벽걸이형)/대림바스", maker: "대림바스", model: "CC-420P", finish: "양변기", size: "-", used: true },
  { code: "AC-216-01", seq: "01", nameInternal: "국산 비데일체형 양변기/대림바스", nameCustomer: "국산 비데일체형 양변기/대림바스", maker: "대림바스", model: "DST-660", finish: "양변기", size: "-", used: true },
  { code: "AC-217-01", seq: "01", nameInternal: "국산 비데일체형 양변기(벽배수)/대림바스", nameCustomer: "국산 비데일체형 양변기(벽배수)/대림바스", maker: "대림바스", model: "-", finish: "양변기", size: "-", used: true },
  { code: "AC-218-01", seq: "01", nameInternal: "국산 분리형 비데/대림바스", nameCustomer: "국산 분리형 비데/대림바스", maker: "대림바스", model: "DST-1300", finish: "분리형 비데", size: "-", used: true },
  { code: "AC-219-01", seq: "01", nameInternal: "국산 세라믹 욕조", nameCustomer: "국산 세라믹 욕조", maker: "사전입찰", model: "-", finish: "욕조", size: "-", used: true },
  { code: "AC-220-01", seq: "01", nameInternal: "국산 아크릴 욕조", nameCustomer: "국산 아크릴 욕조", maker: "사전입찰", model: "-", finish: "욕조", size: "-", used: true },
];

const tableBody = document.getElementById("tableBody");
const rowCount = document.getElementById("rowCount");

function renderRows(list) {
  tableBody.innerHTML = "";
  list.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="code-cell">${p.code}</td>
      <td>${p.seq}</td>
      <td>${p.nameInternal}</td>
      <td>${p.nameCustomer}</td>
      <td>${p.maker}</td>
      <td class="${p.model === "-" ? "muted" : ""}">${p.model}</td>
      <td>${p.finish}</td>
      <td class="muted">${p.size}</td>
      <td>${p.used ? '<span class="dot"></span>' : ""}</td>
    `;
    tableBody.appendChild(tr);
  });
  rowCount.textContent = list.length === products.length ? "474" : list.length;
}
renderRows(products);

document.querySelectorAll(".filter-chip:not(#searchToggle):not(.add-filter)").forEach((btn) => {
  btn.addEventListener("click", () => btn.classList.toggle("active"));
});

const searchToggle = document.getElementById("searchToggle");
const searchRow = document.getElementById("searchRow");
const searchInput = document.getElementById("searchInput");

searchToggle.addEventListener("click", () => {
  searchRow.classList.toggle("open");
  if (searchRow.classList.contains("open")) searchInput.focus();
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { renderRows(products); return; }
  const filtered = products.filter((p) =>
    [p.code, p.nameInternal, p.nameCustomer, p.maker, p.model, p.finish].join(" ").toLowerCase().includes(q)
  );
  renderRows(filtered);
});

let productsSortState = true;
document.querySelector("#panel-product .sortable").addEventListener("click", () => {
  productsSortState = !productsSortState;
  const sorted = [...products].sort((a, b) =>
    productsSortState ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code)
  );
  renderRows(sorted);
});

/* ===================== 업로드 차수 사이드바 (공용 컴포넌트) ===================== */
function renderChaSidebar(el) {
  const rows = [];
  rows.push(`<div class="cha-delete-banner">🗑 상품업로드 14차수 일괄삭제</div>`);
  rows.push(`<div class="cha-btn selected-label">14 차수 선택</div>`);
  rows.push(`<p class="cha-meta">2026/06/17 11:20</p>`);
  rows.push(`<p class="cha-meta">성연희</p>`);
  rows.push(`<a href="#" class="cha-file-link">📄 아크로드 서초 현장 (1차수) - 20260617.xlsx</a>`);
  for (let i = 14; i >= 1; i--) {
    rows.push(`<button class="cha-btn${i === 14 ? " active" : ""}">${i}차수</button>`);
  }
  el.innerHTML = rows.join("");
}
renderChaSidebar(document.getElementById("chaSidebarSku"));
renderChaSidebar(document.getElementById("chaSidebarMapping"));

/* ===================== STEP 1 · PANEL 2: 상품구성코드 ===================== */
const skuData = [
  { code: "SL001", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NN", style: "스타일 미적용 - None", item: "슬라이딩 도어", itemCustomer: "슬라이딩 도어" },
  { code: "SL002", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NN", style: "스타일 미적용 - None", item: "스윙 도어", itemCustomer: "스윙 도어" },
  { code: "SL003", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NN", style: "스타일 미적용 - None", item: "신발장(아크로)", itemCustomer: "신발장(아크로)" },
  { code: "SL004", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NN", style: "스타일 미적용 - None", item: "신발장(아크로)+팬트리 도어", itemCustomer: "신발장(아크로)+팬트리 도어" },
  { code: "SL005", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NN", style: "스타일 미적용 - None", item: "신발장(아크로)+신발장", itemCustomer: "신발장(아크로)+신발장" },
  { code: "SL006", spaceCode: "EN", space: "현관 - Entrance", styleCode: "MM", style: "미니멀 - Minimal", item: "프리미엄 신발장_MM", itemCustomer: "프리미엄 신발장_MM" },
  { code: "SL007", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NM", style: "내추럴 모던 - Natural Modern", item: "프리미엄 신발장_NM", itemCustomer: "프리미엄 신발장_NM" },
  { code: "SL008", spaceCode: "EN", space: "현관 - Entrance", styleCode: "SC", style: "소프트 클래식 - Soft Classic", item: "프리미엄 신발장_SC", itemCustomer: "프리미엄 신발장_SC" },
  { code: "SL009", spaceCode: "EN", space: "현관 - Entrance", styleCode: "MM", style: "미니멀 - Minimal", item: "프리미엄 신발장+팬트리 도어_MM", itemCustomer: "프리미엄 신발장+팬트리 도어_MM" },
  { code: "SL010", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NM", style: "내추럴 모던 - Natural Modern", item: "프리미엄 신발장+팬트리 도어_NM", itemCustomer: "프리미엄 신발장+팬트리 도어_NM" },
  { code: "SL011", spaceCode: "EN", space: "현관 - Entrance", styleCode: "SC", style: "소프트 클래식 - Soft Classic", item: "프리미엄 신발장+팬트리 도어_SC", itemCustomer: "프리미엄 신발장+팬트리 도어_SC" },
  { code: "SL012", spaceCode: "EN", space: "현관 - Entrance", styleCode: "MM", style: "미니멀 - Minimal", item: "프리미엄 신발장+신발장_MM", itemCustomer: "프리미엄 신발장+신발장_MM" },
  { code: "SL013", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NM", style: "내추럴 모던 - Natural Modern", item: "프리미엄 신발장+신발장_NM", itemCustomer: "프리미엄 신발장+신발장_NM" },
  { code: "SL014", spaceCode: "EN", space: "현관 - Entrance", styleCode: "SC", style: "소프트 클래식 - Soft Classic", item: "프리미엄 신발장+신발장_SC", itemCustomer: "프리미엄 신발장+신발장_SC" },
  { code: "SL015", spaceCode: "EN", space: "현관 - Entrance", styleCode: "MM", style: "미니멀 - Minimal", item: "오픈형 프리미엄 신발장+팬트리 도어_MM", itemCustomer: "오픈형 프리미엄 신발장+팬트리 도어_MM" },
  { code: "SL016", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NM", style: "내추럴 모던 - Natural Modern", item: "오픈형 프리미엄 신발장+팬트리 도어_NM", itemCustomer: "오픈형 프리미엄 신발장+팬트리 도어_NM" },
  { code: "SL017", spaceCode: "EN", space: "현관 - Entrance", styleCode: "SC", style: "소프트 클래식 - Soft Classic", item: "오픈형 프리미엄 신발장+팬트리 도어_SC", itemCustomer: "오픈형 프리미엄 신발장+팬트리 도어_SC" },
  { code: "SL018", spaceCode: "EN", space: "현관 - Entrance", styleCode: "MM", style: "미니멀 - Minimal", item: "오픈형 프리미엄 신발장+신발장_MM", itemCustomer: "오픈형 프리미엄 신발장+신발장_MM" },
  { code: "SL019", spaceCode: "EN", space: "현관 - Entrance", styleCode: "NM", style: "내추럴 모던 - Natural Modern", item: "오픈형 프리미엄 신발장+신발장_NM", itemCustomer: "오픈형 프리미엄 신발장+신발장_NM" },
  { code: "SL020", spaceCode: "EN", space: "현관 - Entrance", styleCode: "SC", style: "소프트 클래식 - Soft Classic", item: "오픈형 프리미엄 신발장+신발장_SC", itemCustomer: "오픈형 프리미엄 신발장+신발장_SC" },
];

const skuTableBody = document.getElementById("skuTableBody");
skuTableBody.innerHTML = skuData.map((s) => `
  <tr>
    <td class="code-cell">${s.code}</td>
    <td>${s.spaceCode}</td>
    <td>${s.space}</td>
    <td>${s.styleCode}</td>
    <td>${s.style}</td>
    <td>본사</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td>${s.item}</td>
    <td>${s.itemCustomer}</td>
  </tr>
`).join("");

/* ===================== STEP 1 · PANEL 3: 프로덕트 × 상품구성코드 ===================== */
const mappingTableBody = document.getElementById("mappingTableBody");
mappingTableBody.innerHTML = skuData.map((s) => `
  <tr>
    <td class="code-cell">${s.code}</td>
    <td>${s.spaceCode}</td>
    <td>${s.space}</td>
    <td>${s.styleCode}</td>
    <td>${s.style}</td>
    <td>본사</td>
    <td>${s.item}</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
  </tr>
`).join("");

document.querySelectorAll(".toolbar-btn.primary-toggle, .toolbar-btn.success-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.parentElement.querySelectorAll(".primary-toggle, .success-toggle").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* ===================== STEP 1 · PANEL 4: 평형그룹매핑 ===================== */
const areaGroups = [
  { customer: "일반 - Customer", pyeong: "059A", option: "기본" },
  { customer: "일반 - Customer", pyeong: "059C", option: "기본" },
  { customer: "조합 - Union", pyeong: "114A", option: "기본" },
  { customer: "조합 - Union", pyeong: "114B", option: "기본" },
  { customer: "조합 - Union", pyeong: "114C", option: "기본" },
  { customer: "조합 - Union", pyeong: "114D", option: "기본" },
  { customer: "조합 - Union", pyeong: "114F", option: "기본" },
  { customer: "조합 - Union", pyeong: "118A", option: "기본" },
  { customer: "조합 - Union", pyeong: "125A", option: "기본" },
  { customer: "조합 - Union", pyeong: "135A", option: "기본" },
  { customer: "조합 - Union", pyeong: "135B", option: "기본" },
  { customer: "조합 - Union", pyeong: "135C", option: "기본" },
  { customer: "조합 - Union", pyeong: "074A", option: "기본" },
];

const areaGroupBody = document.getElementById("areaGroupBody");
areaGroupBody.innerHTML = areaGroups.map((g, i) => `
  <tr class="${i === 0 ? "selected" : ""}">
    <td><input type="checkbox" ${i === 0 ? "checked" : ""} /></td>
    <td>${g.customer}</td>
    <td>${g.pyeong}</td>
    <td>${g.option}</td>
  </tr>
`).join("");

function currentAreaGroupLabel() {
  const checkedRow = [...areaGroupBody.querySelectorAll("tr")].find(
    (tr) => tr.querySelector('input[type="checkbox"]').checked
  );
  if (!checkedRow) return "일반 - Customer 059A 기본";
  const cells = checkedRow.querySelectorAll("td");
  return `${cells[1].textContent} ${cells[2].textContent} ${cells[3].textContent}`;
}

const areaConfigRows = [
  { seq: 14, pyeong: "059A", code: "SL001", item: "슬라이딩 도어", itemCustomer: "슬라이딩 도어", space: "현관 - Entrance", hq: "본사", cnt: 1, sub: "현관중문 슬라이딩 도어/LX하우시스 F.3180" },
  { seq: 14, pyeong: "059A", code: "SL003", item: "신발장(아크로)", itemCustomer: "신발장(아크로)", space: "현관 - Entrance", hq: "본사", cnt: 1, sub: "신발장(pp)/아크로" },
  { seq: 14, pyeong: "059A", code: "SL006", item: "프리미엄 신발장_MM", itemCustomer: "프리미엄 신발장_MM", space: "현관 - Entrance", hq: "본사", cnt: 3, sub: "신발장(PET)/미니멀+신발살균기+에어브러시" },
  { seq: 14, pyeong: "059A", code: "SL007", item: "프리미엄 신발장_NM", itemCustomer: "프리미엄 신발장_NM", space: "현관 - Entrance", hq: "본사", cnt: 3, sub: "신발장(FUTURA)/내추럴 모던+신발살균기+에어브러시" },
  { seq: 14, pyeong: "059A", code: "SL008", item: "프리미엄 신발장_SC", itemCustomer: "프리미엄 신발장_SC", space: "현관 - Entrance", hq: "본사", cnt: 3, sub: "신발장(FUTURA)/소프트 클래식+신발살균기+에어브러시" },
  { seq: 14, pyeong: "059A", code: "SL021", item: "디자인 월 확장*냉장고장,아일랜드 선택시(아크로)", itemCustomer: "디자인 월 확장*냉장고장,아일랜드 선택시(아크로)", space: "거실 - Living Room", hq: "본사", cnt: 1, sub: "디자인 월/아크로" },
  { seq: 14, pyeong: "059A", code: "SL022", item: "디자인 월 확장*냉장고장,아일랜드 미선택시(아크로)", itemCustomer: "디자인 월 확장*냉장고장,아일랜드 미선택시(아크로)", space: "거실 - Living Room", hq: "본사", cnt: 1, sub: "디자인 월/아크로" },
  { seq: 14, pyeong: "059A", code: "SL025", item: "인피니티 도어(침실1 A디자인월)", itemCustomer: "인피니티 도어(침실1 A디자인월)", space: "전체 공간 - General Area", hq: "본사", cnt: 1, sub: "디자인 월 인피니티 도어(모티스 손잡이 포함)/아크로" },
  { seq: 14, pyeong: "059A", code: "SL026", item: "인피니티 도어(전체 A디자인월)", itemCustomer: "인피니티 도어(전체 A디자인월)", space: "전체 공간 - General Area", hq: "본사", cnt: 1, sub: "디자인 월 인피니티 도어(모티스 손잡이 포함)/아크로" },
  { seq: 14, pyeong: "059A", code: "SL031", item: "원목마루_MM", itemCustomer: "원목마루_MM", space: "전체 공간 - General Area", hq: "본사", cnt: 1, sub: "원목마루/딤그레이(12.5t)" },
  { seq: 14, pyeong: "059A", code: "SL032", item: "원목마루_NM", itemCustomer: "원목마루_NM", space: "전체 공간 - General Area", hq: "본사", cnt: 1, sub: "원목마루/캄리아이보리(12.5t)" },
  { seq: 14, pyeong: "059A", code: "SL033", item: "원목마루_SC", itemCustomer: "원목마루_SC", space: "전체 공간 - General Area", hq: "본사", cnt: 1, sub: "원목마루/딤그레이(12.5t)" },
];

/* 뒤로가기(undo) 상태: 렌더 함수보다 먼저 선언되어야 함 */
const MAX_MAPPING_HISTORY = 5;
const mappingHistory = [];
let highlightedRowIds = new Set();
let nextConfigRowId = 1;
let undoToastTimer = null;

const areaConfigBody = document.getElementById("areaConfigBody");
const areaConfigCountEl = document.getElementById("areaConfigCount");

function renderAreaConfig() {
  areaConfigBody.innerHTML = areaConfigRows.map((r) => `
    <tr class="${highlightedRowIds.has(r.id) ? "just-mapped" : ""}">
      <td><input type="checkbox" /></td>
      <td>${r.seq}</td>
      <td>${r.pyeong}</td>
      <td class="code-cell">${r.code}</td>
      <td>${r.item}</td>
      <td class="muted">-</td>
      <td>${r.itemCustomer}</td>
      <td>${r.space}</td>
      <td>${r.hq}</td>
      <td>${r.cnt}</td>
      <td>${r.sub}</td>
    </tr>
  `).join("");
  areaConfigCountEl.textContent = `${areaConfigRows.length}개`;
}
renderAreaConfig();

document.getElementById("areaProductCodeBody").innerHTML = `
  <tr>
    <td>프로덕트_01</td>
    <td class="code-cell">SL001</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td>FN-501-01</td>
    <td>현관중문 슬라이딩 도어/LX하우시스 F.3180</td>
    <td>LX하우시스</td>
    <td>프레임컬러 : F.3180 / 유리 : LX-SF-BC01(중간 스트라이프)</td>
  </tr>
`;

const areaRightRows = [
  { space: "EN", code: "SL002", item: "스윙 도어", itemCustomer: "스윙 도어", cnt: 1 },
  { space: "EN", code: "SL004", item: "신발장(아크로)+팬트리 도어", itemCustomer: "신발장(아크로)+팬트리 도어", cnt: 2 },
  { space: "EN", code: "SL005", item: "신발장(아크로)+신발장", itemCustomer: "신발장(아크로)+신발장", cnt: 2 },
  { space: "EN", code: "SL009", item: "프리미엄 신발장+팬트리 도어_MM", itemCustomer: "프리미엄 신발장+팬트리 도어_MM", cnt: 4 },
  { space: "EN", code: "SL010", item: "프리미엄 신발장+팬트리 도어_NM", itemCustomer: "프리미엄 신발장+팬트리 도어_NM", cnt: 4 },
  { space: "EN", code: "SL011", item: "프리미엄 신발장+팬트리 도어_SC", itemCustomer: "프리미엄 신발장+팬트리 도어_SC", cnt: 4 },
  { space: "EN", code: "SL012", item: "프리미엄 신발장+신발장_MM", itemCustomer: "프리미엄 신발장+신발장_MM", cnt: 3 },
  { space: "EN", code: "SL013", item: "프리미엄 신발장+신발장_NM", itemCustomer: "프리미엄 신발장+신발장_NM", cnt: 3 },
  { space: "EN", code: "SL014", item: "프리미엄 신발장+신발장_SC", itemCustomer: "프리미엄 신발장+신발장_SC", cnt: 3 },
  { space: "EN", code: "SL015", item: "오픈형 프리미엄 신발장+팬트리 도어_MM", itemCustomer: "오픈형 프리미엄 신발장+팬트리 도어_MM", cnt: 6 },
  { space: "EN", code: "SL016", item: "오픈형 프리미엄 신발장+팬트리 도어_NM", itemCustomer: "오픈형 프리미엄 신발장+팬트리 도어_NM", cnt: 6 },
  { space: "EN", code: "SL017", item: "오픈형 프리미엄 신발장+팬트리 도어_SC", itemCustomer: "오픈형 프리미엄 신발장+팬트리 도어_SC", cnt: 6 },
  { space: "EN", code: "SL018", item: "오픈형 프리미엄 신발장+신발장_MM", itemCustomer: "오픈형 프리미엄 신발장+신발장_MM", cnt: 6 },
  { space: "EN", code: "SL019", item: "오픈형 프리미엄 신발장+신발장_NM", itemCustomer: "오픈형 프리미엄 신발장+신발장_NM", cnt: 6 },
  { space: "EN", code: "SL020", item: "오픈형 프리미엄 신발장+신발장_SC", itemCustomer: "오픈형 프리미엄 신발장+신발장_SC", cnt: 6 },
  { space: "R1", code: "SL023", item: "인피니티 도어(침실1 세라믹패널)_U1", itemCustomer: "인피니티 도어(침실1 세라믹패널)_U1", cnt: 1 },
  { space: "R1", code: "SL024", item: "인피니티 도어(침실1 세라믹패널)_U2", itemCustomer: "인피니티 도어(침실1 세라믹패널)_U2", cnt: 1 },
];

const areaRightBody = document.getElementById("areaRightBody");

function renderAreaRight() {
  areaRightBody.innerHTML = areaRightRows.map((r) => `
    <tr class="${r.mapped ? "row-disabled" : ""}" data-code="${r.code}">
      <td><input type="checkbox" ${r.mapped ? "disabled" : ""} /></td>
      <td>${r.space}</td>
      <td class="code-cell">${r.code}</td>
      <td>${r.item}${r.mapped ? " (매핑됨)" : ""}</td>
      <td>${r.itemCustomer}</td>
      <td>${r.cnt}</td>
    </tr>
  `).join("");
}
renderAreaRight();

/* ---- 뒤로가기(undo) : 평형그룹-상품 매핑 이력 ---- */
const undoBtn = document.getElementById("undoBtn");
const undoToast = document.getElementById("undoToast");
const undoToastBody = document.getElementById("undoToastBody");

function updateUndoButtons() {
  // stages(확정 관리 상태) is defined later in this file; by the time a user can
  // trigger this (click), the whole script has already finished loading.
  undoBtn.disabled = mappingHistory.length === 0 || stages.s14.status !== "editable";
}

function spaceCodeToName(spaceCode) {
  const map = { EN: "현관 - Entrance", R1: "침실1 - Bedroom 1", LV: "거실 - Living Room", KC: "주방 - Kitchen", GA: "전체 공간 - General Area" };
  return map[spaceCode] || spaceCode;
}

document.querySelector(".map-btn").addEventListener("click", () => {
  if (stages.s14.status !== "editable") return;
  const checkedRows = [...areaRightBody.querySelectorAll("tr")].filter(
    (tr) => tr.querySelector('input[type="checkbox"]').checked
  );
  if (checkedRows.length === 0) return;

  const groupLabel = currentAreaGroupLabel();
  const addedIds = [];
  const items = [];

  checkedRows.forEach((tr) => {
    const code = tr.dataset.code;
    const source = areaRightRows.find((r) => r.code === code);
    if (!source || source.mapped) return;
    source.mapped = true;

    const id = nextConfigRowId++;
    areaConfigRows.push({
      id,
      seq: 14,
      pyeong: "059A",
      code: source.code,
      item: source.item,
      itemCustomer: source.itemCustomer,
      space: spaceCodeToName(source.space),
      hq: "본사",
      cnt: source.cnt,
      sub: "-",
    });
    addedIds.push(id);
    items.push({ code: source.code, item: source.item });
  });

  if (addedIds.length === 0) return;

  mappingHistory.push({ groupLabel, rowIds: addedIds, items });
  if (mappingHistory.length > MAX_MAPPING_HISTORY) mappingHistory.shift();

  highlightedRowIds = new Set(addedIds);
  renderAreaConfig();
  renderAreaRight();
  updateUndoButtons();
});

function showUndoToast(action) {
  undoToastBody.innerHTML = `
    <div class="undo-group-title">${action.groupLabel} ${action.items.length}건</div>
    ${action.items.map((i) => `<div class="undo-item">- ${i.code} ${i.item}</div>`).join("")}
  `;
  undoToast.hidden = false;
  clearTimeout(undoToastTimer);
  undoToastTimer = setTimeout(() => { undoToast.hidden = true; }, 2600);
}

function undoLastMapping() {
  if (mappingHistory.length === 0 || stages.s14.status !== "editable") return;
  const action = mappingHistory.pop();

  const removeIds = new Set(action.rowIds);
  for (let i = areaConfigRows.length - 1; i >= 0; i--) {
    if (removeIds.has(areaConfigRows[i].id)) areaConfigRows.splice(i, 1);
  }
  action.items.forEach((i) => {
    const source = areaRightRows.find((r) => r.code === i.code);
    if (source) source.mapped = false;
  });

  highlightedRowIds = mappingHistory.length
    ? new Set(mappingHistory[mappingHistory.length - 1].rowIds)
    : new Set();

  renderAreaConfig();
  renderAreaRight();
  updateUndoButtons();
  showUndoToast(action);
}

undoBtn.addEventListener("click", undoLastMapping);

document.addEventListener("keydown", (e) => {
  const isCtrlZ = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z";
  if (!isCtrlZ) return;
  const areaPanelActive = document.getElementById("panel-area").classList.contains("active");
  const inFormField = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
  if (areaPanelActive && !inFormField) {
    e.preventDefault();
    undoLastMapping();
  }
});

/* ===================== STEP 1 · PANEL 5: 대분류/중분류/제조사 ===================== */
const majorCats = [
  { name: "스타일", code: "00" }, { name: "현관", code: "01" }, { name: "거실", code: "02" },
  { name: "주방", code: "03" }, { name: "침실", code: "04" }, { name: "욕실", code: "05" },
  { name: "조명", code: "06" }, { name: "기타", code: "07" }, { name: "가전", code: "08" },
];
const midCats = [
  { major: "스타일", name: "블랑클래식", code: "00" },
  { major: "스타일", name: "내추럴클래식", code: "01" },
  { major: "스타일", name: "내추럴모던", code: "02" },
  { major: "스타일", name: "소프트클래식", code: "03" },
];
const makers = [
  { name: "LG", code: "01" }, { name: "삼성", code: "02" }, { name: "경동나비엔", code: "03" },
  { name: "LG하우시스", code: "04" }, { name: "LX하우시스", code: "05" }, { name: "동양엠텍", code: "06" },
  { name: "KCC", code: "07" }, { name: "한샘", code: "08" }, { name: "라이히트", code: "09" },
];

document.getElementById("majorCatBody").innerHTML = majorCats.map((c, i) => `
  <tr class="${i === 0 ? "selected" : ""}"><td>${c.name}</td><td>${c.code}</td></tr>
`).join("");
document.getElementById("midCatBody").innerHTML = midCats.map((c, i) => `
  <tr class="${i === 0 ? "selected" : ""}"><td>${c.major}</td><td>${c.name}</td><td>${c.code}</td></tr>
`).join("");
document.getElementById("makerBody").innerHTML = makers.map((c, i) => `
  <tr class="${i === 0 ? "selected" : ""}"><td>${c.name}</td><td>${c.code}</td></tr>
`).join("");

/* ===================== STEPS 2-4 공용 데이터 (원가 / 고객언어 / 판매가) ===================== */
const flatRows = [
  { seq: 1, code: "SL001", detailCode: "FN-501-01", style: "스타일 미적용 - None", space: "현관 - Entrance", item: "슬라이딩 도어", itemCustomer: "슬라이딩 도어", detail: "현관중문 슬라이딩 도어/LX하우시스 F.3180", detailCustomer: "현관중문 슬라이딩 도어/LX하우시스 F.3180", price: "" },
  { seq: 2, code: "SL003", detailCode: "FN-504-02", style: "스타일 미적용 - None", space: "현관 - Entrance", item: "신발장(아크로)", itemCustomer: "신발장(아크로)", detail: "신발장(pp)/아크로", detailCustomer: "신발장(pp)/아크로", price: "" },
  { seq: 3, code: "SL006", detailCode: "FN-505-01", style: "미니멀 - Minimal", space: "현관 - Entrance", item: "프리미엄 신발장_MM", itemCustomer: "프리미엄 신발장_MM", detail: "신발장(PET)/미니멀+신발살균기+에어브러시", detailCustomer: "신발장(PET)/미니멀+신발살균기+에어브러시", price: "" },
  { seq: 4, code: "SL007", detailCode: "FN-506-01", style: "내추럴 모던 - Natural Modern", space: "현관 - Entrance", item: "프리미엄 신발장_NM", itemCustomer: "프리미엄 신발장_NM", detail: "신발장(FUTURA)/내추럴 모던+신발살균기+에어브러시", detailCustomer: "신발장(FUTURA)/내추럴 모던+신발살균기+에어브러시", price: "" },
  { seq: 5, code: "SL008", detailCode: "FN-506-02", style: "소프트 클래식 - Soft Classic", space: "현관 - Entrance", item: "프리미엄 신발장_SC", itemCustomer: "프리미엄 신발장_SC", detail: "신발장(FUTURA)/소프트 클래식+신발살균기+에어브러시", detailCustomer: "신발장(FUTURA)/소프트 클래식+신발살균기+에어브러시", price: "" },
  { seq: 6, code: "SL021", detailCode: "FM-104-02", style: "스타일 미적용 - None", space: "거실 - Living Room", item: "디자인 월 확장*냉장고장,아일랜드 선택시(아크로)", itemCustomer: "디자인 월 확장*냉장고장,아일랜드 선택시(아크로)", detail: "디자인 월/아크로", detailCustomer: "디자인 월/아크로", price: "" },
  { seq: 7, code: "SL022", detailCode: "FM-104-02", style: "스타일 미적용 - None", space: "거실 - Living Room", item: "디자인 월 확장*냉장고장,아일랜드 미선택시(아크로)", itemCustomer: "디자인 월 확장*냉장고장,아일랜드 미선택시(아크로)", detail: "디자인 월/아크로", detailCustomer: "디자인 월/아크로", price: "" },
  { seq: 8, code: "SL025", detailCode: "FM-110-01", style: "스타일 미적용 - None", space: "전체 공간 - General Area", item: "인피니티 도어(침실1 A디자인월)", itemCustomer: "인피니티 도어(침실1 A디자인월)", detail: "디자인 월 인피니티 도어(모티스 손잡이 포함)/아크로", detailCustomer: "디자인 월 인피니티 도어(모티스 손잡이 포함)/아크로", price: "" },
  { seq: 9, code: "SL026", detailCode: "FM-110-01", style: "스타일 미적용 - None", space: "전체 공간 - General Area", item: "인피니티 도어(전체 A디자인월)", itemCustomer: "인피니티 도어(전체 A디자인월)", detail: "디자인 월 인피니티 도어(모티스 손잡이 포함)/아크로", detailCustomer: "디자인 월 인피니티 도어(모티스 손잡이 포함)/아크로", price: "" },
  { seq: 10, code: "SL031", detailCode: "FM-102-04", style: "미니멀 - Minimal", space: "전체 공간 - General Area", item: "원목마루_MM", itemCustomer: "원목마루_MM", detail: "원목마루/딤그레이(12.5t)", detailCustomer: "원목마루/딤그레이(12.5t)", price: "" },
  { seq: 11, code: "SL032", detailCode: "FM-102-03", style: "내추럴 모던 - Natural Modern", space: "전체 공간 - General Area", item: "원목마루_NM", itemCustomer: "원목마루_NM", detail: "원목마루/캄리아이보리(12.5t)", detailCustomer: "원목마루/캄리아이보리(12.5t)", price: "" },
  { seq: 12, code: "SL033", detailCode: "FM-102-04", style: "소프트 클래식 - Soft Classic", space: "전체 공간 - General Area", item: "원목마루_SC", itemCustomer: "원목마루_SC", detail: "원목마루/딤그레이(12.5t)", detailCustomer: "원목마루/딤그레이(12.5t)", price: "" },
  { seq: 13, code: "SL034", detailCode: "FM-121-02", style: "미니멀 - Minimal", space: "주방 - Kitchen", item: "주방 상판,벽(골든쇼어)+상부장 조명_MM", itemCustomer: "주방 상판,벽(골든쇼어)+상부장 조명_MM", detail: "엔지니어드 스톤-스탠다드/골든쇼어+가구 조명", detailCustomer: "엔지니어드 스톤-스탠다드/골든쇼어+가구 조명", price: "" },
  { seq: 14, code: "SL035", detailCode: "FN-519-01", style: "내추럴 모던 - Natural Modern", space: "주방 - Kitchen", item: "주방 상,하부장+상판,벽(솔라로)+상부장 조명_NM", itemCustomer: "주방 상,하부장+상판,벽(솔라로)+상부장 조명_NM", detail: "상,하부장(FUTURA)/내추럴 모던+엔지니어드 스톤-프리미엄/솔라로", detailCustomer: "상,하부장(FUTURA)/내추럴 모던+엔지니어드 스톤-프리미엄/솔라로", price: 60 },
  { seq: 15, code: "SL036", detailCode: "FN-519-02", style: "소프트 클래식 - Soft Classic", space: "주방 - Kitchen", item: "주방 상,하부장+상판,벽(몬테레이)+상부장 조명_SC", itemCustomer: "주방 상,하부장+상판,벽(몬테레이)+상부장 조명_SC", detail: "상,하부장(FUTURA)/소프트 클래식+엔지니어드 스톤-프리미엄/몬테레이", detailCustomer: "상,하부장(FUTURA)/소프트 클래식+엔지니어드 스톤-프리미엄/몬테레이", price: 60 },
  { seq: 16, code: "SL037", detailCode: "EE-327-01", style: "내추럴 모던 - Natural Modern", space: "주방 - Kitchen", item: "주방 상,하부장+상판,벽(솔라로)+상부장 조명_NM", itemCustomer: "주방 상,하부장+상판,벽(솔라로)+상부장 조명_NM", detail: "상,하부장(FUTURA)/내추럴 모던+가구 조명", detailCustomer: "상,하부장(FUTURA)/내추럴 모던+가구 조명", price: 0 },
  { seq: 17, code: "SL038", detailCode: "FN-531-02", style: "소프트 클래식 - Soft Classic", space: "주방 - Kitchen", item: "주방 상,하부장+상판,벽(몬테레이)+상부장 조명_SC", itemCustomer: "주방 상,하부장+상판,벽(몬테레이)+상부장 조명_SC", detail: "상,하부장(FUTURA)/소프트 클래식+가구 조명", detailCustomer: "상,하부장(FUTURA)/소프트 클래식+가구 조명", price: 0 },
  { seq: 18, code: "SL040", detailCode: "FN-518-01", style: "미니멀 - Minimal", space: "주방 - Kitchen", item: "냉장고장(선반 수납형)+아일랜드_MM", itemCustomer: "냉장고장(선반 수납형)+아일랜드_MM", detail: "냉장고장(선반 수납형)/미니멀+아일랜드", detailCustomer: "냉장고장(선반 수납형)/미니멀+아일랜드", price: 60 },
  { seq: 19, code: "SL045", detailCode: "FN-900-05", style: "미니멀 - Minimal", space: "주방 - Kitchen", item: "수입 주방가구 일체+주방상판_MM", itemCustomer: "수입 주방가구 일체+주방상판_MM", detail: "수입 주방가구 일체/미니멀+상,하부장(베네시안)", detailCustomer: "수입 주방가구 일체/미니멀+상,하부장(베네시안)", price: 50 },
  { seq: 20, code: "SL047", detailCode: "AC-223-01", style: "스타일 미적용 - None", space: "주방 - Kitchen", item: "외산 주방수전", itemCustomer: "외산 주방수전", detail: "외산 주방수전", detailCustomer: "외산 주방수전", price: 10 },
  { seq: 21, code: "SL048", detailCode: "FN-547-01", style: "스타일 미적용 - None", space: "다용도실 - Utility Room", item: "손빨래 하부장+세탁기장(수직형)", itemCustomer: "손빨래 하부장+세탁기장(수직형)", detail: "세탁기장(수직형)", detailCustomer: "세탁기장(수직형)", price: 40 },
  { seq: 22, code: "SL052", detailCode: "FM-115-01", style: "스타일 미적용 - None", space: "전체 공간 - General Area", item: "세라믹 탄성코트", itemCustomer: "세라믹 탄성코트", detail: "세라믹 탄성코트", detailCustomer: "세라믹 탄성코트", price: 10 },
  { seq: 23, code: "SL054", detailCode: "FN-551-01", style: "미니멀 - Minimal", space: "침실1 - Bedroom 1", item: "침실1 와이드 붙박이장_MM", itemCustomer: "침실1 와이드 붙박이장_MM", detail: "도어형 붙박이장/미니멀", detailCustomer: "도어형 붙박이장/미니멀", price: 10 },
  { seq: 24, code: "SL055", detailCode: "FN-552-01", style: "내추럴 모던 - Natural Modern", space: "침실1 - Bedroom 1", item: "침실1 와이드 붙박이장_NM", itemCustomer: "침실1 와이드 붙박이장_NM", detail: "도어형 붙박이장/내추럴 모던", detailCustomer: "도어형 붙박이장/내추럴 모던", price: 10 },
].map((r) => ({ customer: "일반 - Customer", pyeong: "059A", hq: "본사", option: "기본", plan: "미적용", ...r }));

document.getElementById("costTableBody").innerHTML = flatRows.map((r) => `
  <tr>
    <td>${r.seq}</td>
    <td>${r.customer} ${r.pyeong} ${r.option} 미적용</td>
    <td class="muted">-</td>
    <td class="code-cell">${r.code}</td>
    <td>${r.detailCode}</td>
    <td>${r.item}</td>
    <td>${r.itemCustomer}</td>
    <td>${r.detail}</td>
    <td>${r.detailCustomer}</td>
  </tr>
`).join("");

document.getElementById("langTableBody").innerHTML = flatRows.map((r) => `
  <tr>
    <td>${r.seq}</td>
    <td>${r.customer}</td>
    <td>${r.pyeong}</td>
    <td>${r.hq}</td>
    <td>${r.style}</td>
    <td>${r.option}</td>
    <td>${r.plan}</td>
    <td>${r.space}</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td class="code-cell">${r.code}</td>
    <td>${r.item}</td>
    <td>${r.itemCustomer}</td>
    <td>${r.detailCode}</td>
    <td>${r.detail}</td>
    <td>${r.detailCustomer}</td>
  </tr>
`).join("");

document.getElementById("priceTableBody").innerHTML = flatRows.map((r) => `
  <tr>
    <td>${r.seq}</td>
    <td>${r.customer}</td>
    <td>${r.pyeong}</td>
    <td>${r.hq}</td>
    <td>${r.style}</td>
    <td>${r.option}</td>
    <td>${r.plan}</td>
    <td>${r.space}</td>
    <td class="code-cell">${r.code}</td>
    <td>${r.detailCode}</td>
    <td>${r.item}</td>
    <td>${r.itemCustomer}</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td class="muted">-</td>
    <td>${r.price === "" ? "" : r.price}</td>
  </tr>
`).join("");

/* ===================== STEP 5: 안분표 생성 ===================== */
const allocationRows = [
  { seq: 4935, sales: "ST-U-059A-NM-GA-01", pyeong: "059A", item: "신발장", detail: "에어브러시" },
  { seq: 4936, sales: "ST-U-059B-NM-GA-01", pyeong: "059B", item: "원목마루", detail: "내추럴모던" },
  { seq: 4937, sales: "ST-U-059C-NM-GA-01", pyeong: "059C", item: "건식 벽체", detail: "도어스토퍼" },
  { seq: 4938, sales: "ST-U-114C-NM-GA-01", pyeong: "114C", item: "원목마루", detail: "타쿠아리" },
  { seq: 4939, sales: "ST-U-097B-NM-GA-01", pyeong: "097B", item: "신발장", detail: "에어브러시" },
  { seq: 4940, sales: "ST-U-118A-NM-GA-01", pyeong: "118A", item: "신발장", detail: "에어브러시" },
  { seq: 4941, sales: "ST-U-135B-NM-GA-01", pyeong: "135B", item: "신발장", detail: "에어브러시" },
  { seq: 4942, sales: "ST-U-084A-NM-GA-01", pyeong: "084A", item: "신발장", detail: "에어브러시" },
  { seq: 4943, sales: "ST-U-084E-NM-GA-01", pyeong: "084E", item: "신발장", detail: "에어브러시" },
  { seq: 4944, sales: "ST-U-084F-NM-GA-01", pyeong: "084F", item: "신발장", detail: "에어브러시" },
  { seq: 4945, sales: "ST-U-097C-NM-GA-01", pyeong: "097C", item: "신발장", detail: "에어브러시" },
  { seq: 4946, sales: "ST-U-114A-NM-GA-01", pyeong: "114A", item: "신발장", detail: "에어브러시" },
  { seq: 4947, sales: "ST-U-125A-NM-GA-01", pyeong: "125A", item: "신발장", detail: "에어브러시" },
  { seq: 4948, sales: "ST-U-097A-NM-GA-01", pyeong: "097A", item: "신발장", detail: "에어브러시" },
  { seq: 4949, sales: "ST-U-097D-NM-GA-01", pyeong: "097D", item: "신발장", detail: "에어브러시" },
  { seq: 4950, sales: "ST-U-114B-NM-GA-01", pyeong: "114B", item: "신발장", detail: "에어브러시" },
  { seq: 4951, sales: "ST-U-114F-NM-GA-01", pyeong: "114F", item: "신발장", detail: "에어브러시" },
  { seq: 4952, sales: "ST-U-114D-NM-GA-01", pyeong: "114D", item: "상,하부장", detail: "프리미엄 톤" },
  { seq: 4953, sales: "ST-U-074A-NM-GA-01", pyeong: "074A", item: "신발장", detail: "에어브러시" },
  { seq: 4954, sales: "ST-U-074B-NM-GA-01", pyeong: "074B", item: "신발장", detail: "에어브러시" },
  { seq: 4955, sales: "ST-U-074C-NM-GA-01", pyeong: "074C", item: "신발장", detail: "에어브러시" },
];

document.getElementById("allocationTableBody").innerHTML = allocationRows.map((r) => `
  <tr>
    <td class="checkbox-col"><input type="checkbox" /></td>
    <td>${r.seq}</td>
    <td class="code-cell">${r.sales}</td>
    <td>조합 - Union</td>
    <td>${r.pyeong}</td>
    <td>본사</td>
    <td>내추럴 모던 - Natural Modern</td>
    <td class="muted">-</td>
    <td>기본</td>
    <td>미적용</td>
    <td>전체 공간 - General Area</td>
    <td class="muted">-</td>
    <td>[내추럴 모던]인테리어 스타일 선택</td>
    <td>${r.item}</td>
    <td>${r.detail}</td>
  </tr>
`).join("");

/* ===================== 내비게이션: 상단 5단계 + 상품구성 5개 서브탭 ===================== */
document.querySelectorAll(".nav-step").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-step").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    const step = link.dataset.step;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById(`view-${step}`).classList.add("active");
  });
});

document.querySelectorAll(".step-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".step-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll("#view-1 .tab-panel").forEach((p) => p.classList.remove("active"));
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add("active");
    renderStage14Box();
  });
});

/* =====================================================================
   메뉴별 확정 관리 (승인 워크플로우)
   작업순서 : 1.4 평형그룹매핑 → 2. 원가 수정 → 4. 판매가 수정
   - 확정하면 다음 단계 담당자에게 알림
   - 후속 작업이 이미 진행/확정된 상태에서 선행 작업을 재작업(잠금해제)하려면
     해당 후속 담당자(들)의 승인이 필요 (아직 손대지 않은 담당자는 자동 통과)
   - 승인 완료 시 선행 담당자에게 알림, 승인한 후속 작업은 다시 잠김(재확정 필요)
   ===================================================================== */
const roles = [
  { key: "owner14", name: "안은철", team: "설계팀", stageLabel: "1.4 평형그룹매핑" },
  { key: "owner2", name: "김민준", team: "원가팀", stageLabel: "2. 원가 수정" },
  { key: "owner4", name: "박서연", team: "영업팀", stageLabel: "4. 판매가 수정" },
];
function roleName(key) {
  const r = roles.find((x) => x.key === key);
  return r ? `${r.name}(${r.team})` : key;
}

const stages = {
  s14: { key: "s14", label: "1.4 평형그룹매핑", owner: "owner14", downstream: ["s2"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 1:31:21", pendingApprovals: [] },
  s2: { key: "s2", label: "2. 원가 수정", owner: "owner2", downstream: ["s4"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 5:30:20", pendingApprovals: [] },
  s4: { key: "s4", label: "4. 판매가 수정", owner: "owner4", downstream: [], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 5:30:03", pendingApprovals: [] },
};

let currentRole = "owner14";
let notifSeq = 1;
const notifications = [];

function nowKorean() {
  const d = new Date();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  const hour24 = d.getHours();
  const ampm = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday}) ${ampm} ${hour12}:${min}`;
}

function statusLabel(status) {
  return { locked: "대기(잠금)", editable: "작업중", confirmed: "확정완료", reopen_pending: "잠금해제 요청중" }[status];
}

function addNotification(toRoleKey, kind, text, stageKey) {
  notifications.unshift({
    id: notifSeq++, to: toRoleKey, kind, text, time: nowKorean(),
    read: false, resolved: false, stageKey, approverStage: null,
  });
  return notifications[0];
}

function downstreamNeedingApproval(stage) {
  // 아직 손대지 않은(잠금 상태) 후속 담당자는 승인 없이 자동 통과
  return stage.downstream.filter((k) => stages[k].status !== "locked");
}

function confirmStage(stageKey) {
  const stage = stages[stageKey];
  if (stage.status !== "editable") return;
  stage.status = "confirmed";
  stage.confirmedAt = nowKorean();
  stage.downstream.forEach((dKey) => {
    const d = stages[dKey];
    if (d.status === "locked") {
      d.status = "editable";
      addNotification(d.owner, "confirmed", `「${stage.label}」 확정이 완료되었습니다. 이제 「${d.label}」 작업을 시작할 수 있습니다.`, dKey);
    }
  });
  renderAll();
}

function requestReopen(stageKey) {
  const stage = stages[stageKey];
  if (stage.status !== "confirmed") return;
  const approvers = downstreamNeedingApproval(stage);
  if (approvers.length === 0) {
    stage.status = "editable";
    stage.confirmedAt = null;
    renderAll();
    return;
  }
  stage.status = "reopen_pending";
  stage.pendingApprovals = approvers.slice();
  approvers.forEach((dKey) => {
    const d = stages[dKey];
    const n = addNotification(
      d.owner,
      "reopen_request",
      `${roleName(stage.owner)}님이 「${stage.label}」 재작업을 위해 잠금 해제를 요청했습니다. 승인하면 「${d.label}」은(는) 다시 확정해야 합니다.`,
      stageKey
    );
    n.approverStage = dKey;
  });
  renderAll();
}

function cancelReopenRequest(stageKey) {
  const stage = stages[stageKey];
  if (stage.status !== "reopen_pending") return;
  stage.status = "confirmed";
  stage.pendingApprovals = [];
  renderAll();
}

function approveReopen(notifId) {
  const notif = notifications.find((n) => n.id === notifId);
  if (!notif || notif.resolved || notif.kind !== "reopen_request") return;
  const stage = stages[notif.stageKey];
  const approverStage = stages[notif.approverStage];
  notif.resolved = true;
  notif.read = true;

  stage.pendingApprovals = stage.pendingApprovals.filter((k) => k !== notif.approverStage);
  // 승인한 후속 작업 기준 데이터가 바뀔 수 있으므로 다시 잠금(재확정 필요)
  approverStage.status = "locked";
  approverStage.confirmedAt = null;

  if (stage.pendingApprovals.length === 0) {
    stage.status = "editable";
    stage.confirmedAt = null;
    addNotification(stage.owner, "reopen_approved", `모든 후속 작업 담당자가 잠금 해제를 승인했습니다. 「${stage.label}」을(를) 다시 수정할 수 있습니다.`, stage.key);
  }
  renderAll();
}

/* ---- 렌더링 ---- */
function renderStatusStrip() {
  const order = ["s14", "s2", "s4"];
  document.getElementById("statusStrip").innerHTML = order.map((key, i) => {
    const s = stages[key];
    const node = `
      <span class="status-node">
        <span class="status-dot ${s.status}"></span>
        <span class="status-node-label">${s.label}</span>
        <span class="status-node-owner">· ${roleName(s.owner)} · ${statusLabel(s.status)}</span>
      </span>`;
    return i < order.length - 1 ? node + `<span class="status-arrow">→</span>` : node;
  }).join("");
}

function renderMappingLock() {
  const editable = stages.s14.status === "editable";
  document.querySelectorAll(".mapping-editable-control").forEach((el) => { el.disabled = !editable; });
  document.getElementById("stage14LockTag").hidden = editable;
  updateUndoButtons();
}

function renderStage14Box() {
  const box = document.getElementById("stage14Box");
  const s = stages.s14;
  const isAreaTab = document.getElementById("panel-area").classList.contains("active");
  const isOwner = currentRole === s.owner;

  if (!isAreaTab) {
    box.innerHTML = `
      <div class="confirm-box">
        <span class="confirm-badge">상품 구성<br />${s.status === "confirmed" ? "확 정" : statusLabel(s.status)}</span>
        <div class="confirm-info">
          <p>담당자 : ${roleName(s.owner)}</p>
          <p>${s.confirmedAt ? `확정일 : ${s.confirmedAt}` : "확정 전"}</p>
        </div>
      </div>`;
    renderMappingLock();
    return;
  }

  if (s.status === "editable") {
    box.innerHTML = `
      <button class="ghost-btn green" id="stage14ConfirmBtn" ${isOwner ? "" : "disabled"}>✔ 평형그룹매핑 확정하기</button>
      ${isOwner ? "" : `<span class="stage-role-hint">담당자(${roleName(s.owner)})만 확정할 수 있습니다</span>`}`;
    document.getElementById("stage14ConfirmBtn").addEventListener("click", () => confirmStage("s14"));
  } else if (s.status === "confirmed") {
    box.innerHTML = `
      <div class="confirm-box">
        <span class="confirm-badge">상품 구성<br />확 정</span>
        <div class="confirm-info">
          <p>확정자 : ${roleName(s.owner)}</p>
          <p>확정일 : ${s.confirmedAt}</p>
        </div>
      </div>
      <button class="danger-btn" id="stage14ReopenBtn" ${isOwner ? "" : "disabled"}>↺ 상품구성 확정 강제취소</button>`;
    document.getElementById("stage14ReopenBtn").addEventListener("click", () => requestReopen("s14"));
  } else if (s.status === "reopen_pending") {
    box.innerHTML = `
      <div class="stage-pending-badge">⏳ 잠금 해제 승인 대기 중 (${s.pendingApprovals.map((k) => roleName(stages[k].owner)).join(", ")})</div>
      <button class="toolbar-btn" id="stage14CancelReopenBtn" ${isOwner ? "" : "disabled"}>요청 취소</button>`;
    document.getElementById("stage14CancelReopenBtn").addEventListener("click", () => cancelReopenRequest("s14"));
  }
  renderMappingLock();
}

function renderStageBox(stageKey, containerId, verb, badgeText) {
  const box = document.getElementById(containerId);
  const s = stages[stageKey];
  const isOwner = currentRole === s.owner;

  if (s.status === "locked") {
    box.innerHTML = `<span class="stage-pending-badge">🔒 선행 작업 확정 대기 중</span>`;
  } else if (s.status === "editable") {
    box.innerHTML = `
      <button class="ghost-btn green" id="${stageKey}ConfirmBtn" ${isOwner ? "" : "disabled"}>✔ ${verb} 확정하기</button>
      ${isOwner ? "" : `<span class="stage-role-hint">담당자(${roleName(s.owner)})만 확정할 수 있습니다</span>`}`;
    document.getElementById(`${stageKey}ConfirmBtn`).addEventListener("click", () => confirmStage(stageKey));
  } else if (s.status === "confirmed") {
    box.innerHTML = `
      <div class="confirm-box">
        <span class="confirm-badge">${badgeText}<br />확 정</span>
        <div class="confirm-info">
          <p>확정자 : ${roleName(s.owner)}</p>
          <p>확정일 : ${s.confirmedAt}</p>
        </div>
      </div>
      <button class="danger-btn" id="${stageKey}ReopenBtn" ${isOwner ? "" : "disabled"}>↺ ${verb} 확정 강제취소</button>`;
    document.getElementById(`${stageKey}ReopenBtn`).addEventListener("click", () => requestReopen(stageKey));
  } else if (s.status === "reopen_pending") {
    box.innerHTML = `
      <div class="stage-pending-badge">⏳ 잠금 해제 승인 대기 중 (${s.pendingApprovals.map((k) => roleName(stages[k].owner)).join(", ")})</div>
      <button class="toolbar-btn" id="${stageKey}CancelReopenBtn" ${isOwner ? "" : "disabled"}>요청 취소</button>`;
    document.getElementById(`${stageKey}CancelReopenBtn`).addEventListener("click", () => cancelReopenRequest(stageKey));
  }

  const overlayId = stageKey === "s2" ? "stage2LockOverlay" : "stage4LockOverlay";
  const toolbarLeftId = stageKey === "s2" ? "stage2ToolbarLeft" : "stage4ToolbarLeft";
  const overlay = document.getElementById(overlayId);
  const toolbarLeft = document.getElementById(toolbarLeftId);
  const upstream = stageKey === "s2" ? stages.s14 : stages.s2;

  if (s.status === "locked") {
    overlay.hidden = false;
    overlay.querySelector(".lock-overlay-msg").textContent = `🔒 「${upstream.label}」 확정 후 작업할 수 있습니다.`;
    toolbarLeft.classList.add("disabled-group");
  } else {
    overlay.hidden = true;
    toolbarLeft.classList.toggle("disabled-group", s.status !== "editable");
  }
}

function renderNotifications() {
  const badge = document.getElementById("notifBadge");
  const panel = document.getElementById("notifPanel");
  const mine = notifications.filter((n) => n.to === currentRole);
  const unread = mine.filter((n) => !n.read).length;

  badge.hidden = unread === 0;
  badge.textContent = unread;

  if (mine.length === 0) {
    panel.innerHTML = `<div class="notif-panel-title">알림 (${roleName(currentRole)})</div><div class="notif-item-empty">받은 알림이 없습니다.</div>`;
    return;
  }

  panel.innerHTML = `<div class="notif-panel-title">알림 (${roleName(currentRole)})</div>` + mine.map((n) => `
    <div class="notif-item ${n.read ? "" : "unread"}">
      <div class="notif-item-text">${n.text}</div>
      <div class="notif-item-meta">${n.time}</div>
      ${n.kind === "reopen_request" && !n.resolved ? `<button class="notif-approve-btn" data-approve="${n.id}">승인</button>` : ""}
      ${n.kind === "reopen_request" && n.resolved ? `<span class="notif-resolved-tag">✓ 승인 완료</span>` : ""}
    </div>
  `).join("");
}

function renderAll() {
  renderStatusStrip();
  renderStage14Box();
  renderStageBox("s2", "stage2Box", "원가", "원 가");
  renderStageBox("s4", "stage4Box", "판매가", "판매가");
  renderNotifications();
}

const roleSelect = document.getElementById("roleSelect");
roleSelect.innerHTML = roles.map((r) => `<option value="${r.key}">${r.name} · ${r.stageLabel}</option>`).join("");
roleSelect.value = currentRole;
roleSelect.addEventListener("change", () => {
  currentRole = roleSelect.value;
  renderAll();
});

const notifBell = document.getElementById("notifBell");
const notifPanel = document.getElementById("notifPanel");
notifBell.addEventListener("click", (e) => {
  e.stopPropagation();
  notifPanel.hidden = !notifPanel.hidden;
  if (!notifPanel.hidden) {
    notifications.filter((n) => n.to === currentRole).forEach((n) => { n.read = true; });
    renderNotifications();
  }
});
notifPanel.addEventListener("click", (e) => {
  e.stopPropagation();
  const btn = e.target.closest("[data-approve]");
  if (btn) approveReopen(Number(btn.dataset.approve));
});
document.addEventListener("click", () => { notifPanel.hidden = true; });

renderAll();
