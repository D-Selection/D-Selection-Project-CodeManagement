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

// 평형그룹 매핑 이력(매핑/매핑취소 전체 로그, undo 스택과 별개로 계속 누적됨)
let mappingLogSeq = 1;
const mappingLog = [];

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
const mappingHistoryBtn = document.getElementById("mappingHistoryBtn");
const mappingHistoryPanel = document.getElementById("mappingHistoryPanel");
const mappingHistoryList = document.getElementById("mappingHistoryList");

function addMappingLog(type, groupLabel, items) {
  mappingLog.unshift({ id: mappingLogSeq++, type, groupLabel, items, time: dsNowKorean() });
  const verb = type === "map" ? "매핑" : "매핑 취소";
  dsAddEditLog("1.4 평형그룹매핑", `${groupLabel} ${items.length}건 ${verb}: ${items.map((it) => it.code).join(", ")}`);
}

function renderMappingHistoryPanel(highlightLatest) {
  if (mappingLog.length === 0) {
    mappingHistoryList.innerHTML = `<div class="mapping-history-empty">아직 매핑 이력이 없습니다.</div>`;
    return;
  }
  mappingHistoryList.innerHTML = mappingLog.map((h, i) => `
    <div class="mapping-history-item ${highlightLatest && i === 0 ? "latest" : ""}">
      <div class="mapping-history-item-title">
        <span class="${h.type === "map" ? "tag-map" : "tag-undo"}">${h.type === "map" ? "➕ 매핑" : "↩ 매핑 취소"}</span>
        <span>${h.groupLabel} · ${h.items.length}건</span>
      </div>
      <div class="mapping-history-item-detail">${h.items.map((it) => `- ${it.code} ${it.item}`).join("<br/>")}</div>
      <div class="mapping-history-item-time">${h.time}</div>
    </div>
  `).join("");
}
renderMappingHistoryPanel(false);

mappingHistoryBtn.addEventListener("click", () => {
  mappingHistoryPanel.hidden = !mappingHistoryPanel.hidden;
  if (!mappingHistoryPanel.hidden) renderMappingHistoryPanel(false);
});
document.getElementById("mappingHistoryClose").addEventListener("click", () => {
  mappingHistoryPanel.hidden = true;
});

function updateUndoButtons() {
  // stages(확정 관리 상태) is defined later in this file; by the time a user can
  // trigger this (click), the whole script has already finished loading.
  undoBtn.disabled = mappingHistory.length === 0 || dsLoad().stages.s14.status !== "editable";
}

function spaceCodeToName(spaceCode) {
  const map = { EN: "현관 - Entrance", R1: "침실1 - Bedroom 1", LV: "거실 - Living Room", KC: "주방 - Kitchen", GA: "전체 공간 - General Area" };
  return map[spaceCode] || spaceCode;
}

document.querySelector(".map-btn").addEventListener("click", () => {
  if (dsLoad().stages.s14.status !== "editable") return;
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

  addMappingLog("map", groupLabel, items);
  if (!mappingHistoryPanel.hidden) renderMappingHistoryPanel(false);

  highlightedRowIds = new Set(addedIds);
  renderAreaConfig();
  renderAreaRight();
  updateUndoButtons();
});

function undoLastMapping() {
  if (mappingHistory.length === 0 || dsLoad().stages.s14.status !== "editable") return;
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

  addMappingLog("undo", action.groupLabel, action.items);
  mappingHistoryPanel.hidden = false;
  renderMappingHistoryPanel(true);
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

allocationRows.forEach((r) => { r.sent = false; r.sentBatch = null; });

const allocationTableBody = document.getElementById("allocationTableBody");
const allocationSelectAll = document.getElementById("allocationSelectAll");

function renderAllocationTable() {
  allocationTableBody.innerHTML = allocationRows.map((r) => `
    <tr class="${r.sent ? "row-disabled" : ""}" data-seq="${r.seq}">
      <td class="checkbox-col"><input type="checkbox" class="allocation-row-check" ${r.sent ? "disabled" : ""} /></td>
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
      <td>${r.sent ? `<span class="send-status-badge sent">✔ ${r.sentBatch}</span>` : `<span class="send-status-badge unsent">미발송</span>`}</td>
    </tr>
  `).join("");
  allocationSelectAll.checked = false;
  allocationSelectAll.indeterminate = false;
}
renderAllocationTable();

allocationSelectAll.addEventListener("change", () => {
  document.querySelectorAll(".allocation-row-check:not(:disabled)").forEach((cb) => { cb.checked = allocationSelectAll.checked; });
});

/* ===================== 안분표 발송: 상품별 차수 분할 발송 ===================== */
let sendBatchSeq = 1;
const sendBatches = []; // { id, name, count, pyeongs, sentAt, sentBy }

const allocationSettingsBtn = document.getElementById("allocationSettingsBtn");
const allocationSettingsMenu = document.getElementById("allocationSettingsMenu");
allocationSettingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  allocationSettingsMenu.hidden = !allocationSettingsMenu.hidden;
});
allocationSettingsMenu.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => { allocationSettingsMenu.hidden = true; });

const sendModal = document.getElementById("sendModal");
const sendModalBody = document.getElementById("sendModalBody");
const sendToast = document.getElementById("sendToast");

function showToast(text) {
  sendToast.textContent = text;
  sendToast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { sendToast.hidden = true; }, 2400);
}

function openSendModal() {
  allocationSettingsMenu.hidden = true;
  const checked = [...document.querySelectorAll(".allocation-row-check:checked")].map(
    (cb) => Number(cb.closest("tr").dataset.seq)
  );

  if (checked.length === 0) {
    sendModalBody.innerHTML = `
      <div class="send-empty-msg">
        발송할 항목이 선택되지 않았습니다.<br/>
        분양 행사가 여러 차수로 나뉘어 진행되므로, 표에서 이번에 내보낼 상품(평형/고객타입 등으로 필터링 후)만 체크한 뒤 다시 시도해 주세요.
        전체를 한 번에 일괄 발송하지 않고, 상품별로 나눠 발송하기 위한 절차입니다.
      </div>
      <div class="cmodal-actions">
        <button class="toolbar-btn" id="sendModalCloseBtn">닫기</button>
      </div>`;
    document.getElementById("sendModalCloseBtn").addEventListener("click", () => { sendModal.hidden = true; });
    sendModal.hidden = false;
    return;
  }

  const rows = allocationRows.filter((r) => checked.includes(r.seq));
  const pyeongs = [...new Set(rows.map((r) => r.pyeong))];
  const defaultName = `${sendBatchSeq}차 발송`;

  sendModalBody.innerHTML = `
    <div class="send-summary">
      선택 <strong>${rows.length}건</strong>을 새 발송 차수로 「분양수금 시스템」에 전송합니다.<br/>
      대상 평형 : ${pyeongs.length}종
    </div>
    <div class="send-pyeong-tags">${pyeongs.map((p) => `<span class="send-pyeong-tag">${p}</span>`).join("")}</div>
    <div class="send-field" style="margin-top:14px;">
      <label>발송 차수명</label>
      <input type="text" id="sendBatchNameInput" value="${defaultName}" />
    </div>
    <div class="cmodal-actions">
      <button class="toolbar-btn" id="sendModalCancelBtn">취소</button>
      <button class="primary-btn" id="sendModalConfirmBtn">➤ 발송</button>
    </div>`;

  document.getElementById("sendModalCancelBtn").addEventListener("click", () => { sendModal.hidden = true; });
  document.getElementById("sendModalConfirmBtn").addEventListener("click", () => {
    const name = document.getElementById("sendBatchNameInput").value.trim() || defaultName;
    rows.forEach((r) => { r.sent = true; r.sentBatch = name; });
    const batch = {
      id: sendBatchSeq++,
      name,
      count: rows.length,
      pyeongs,
      sentAt: dsNowKorean(),
      sentBy: dsRoleName(dsGetCurrentRole()),
    };
    sendBatches.unshift(batch);
    dsAddEditLog("5. 안분표 생성", `「${name}」 ${rows.length}건을 분양수금 시스템으로 발송 (평형 ${pyeongs.join(", ")})`);
    renderAllocationTable();
    renderSendHistory();
    sendModal.hidden = true;
    showToast(`「${name}」 ${rows.length}건이 분양수금 시스템으로 발송되었습니다.`);
  });

  sendModal.hidden = false;
}

document.getElementById("allocationSendMenuItem").addEventListener("click", openSendModal);
sendModal.addEventListener("click", (e) => { if (e.target === sendModal) sendModal.hidden = true; });

const sendHistoryBtn = document.getElementById("sendHistoryBtn");
const sendHistoryPanel = document.getElementById("sendHistoryPanel");

function renderSendHistory() {
  if (sendBatches.length === 0) {
    sendHistoryPanel.innerHTML = `<div class="notif-panel-title">안분표 발송 이력</div><div class="notif-item-empty">아직 발송한 차수가 없습니다.</div>`;
    return;
  }
  sendHistoryPanel.innerHTML = `<div class="notif-panel-title">안분표 발송 이력 (전체 ${sendBatches.length}건)</div>` + sendBatches.map((b) => `
    <div class="notif-item">
      <div class="notif-item-text">「${b.name}」 ${b.count}건 · 평형 ${b.pyeongs.join(", ")}</div>
      <div class="notif-item-meta">${b.sentBy} · ${b.sentAt}</div>
    </div>
  `).join("");
}
renderSendHistory();

sendHistoryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  sendHistoryPanel.hidden = !sendHistoryPanel.hidden;
});
sendHistoryPanel.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => { sendHistoryPanel.hidden = true; });

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
    renderStep1StageBox();
  });
});

/* =====================================================================
   메뉴별 확정 관리 (승인 워크플로우)
   작업순서 : 0. 현장별코드 → 1.3 프로덕트×상품구성코드 → 1.4 평형그룹매핑
              → 2. 원가 수정 → 4. 판매가 수정
   실제 상태/알림/이력 엔진은 shared-state.js(ds* 함수들)에 있다 — 이 파일은
   codes-standard.html(현장별코드 화면)과도 같은 localStorage 상태를 공유하므로,
   여기서는 렌더링과 이벤트 연결만 담당한다.
   ===================================================================== */
const STEP1_STAGE_META = {
  s13: { badge: "구성코드", verb: "프로덕트×상품구성코드" },
  s14: { badge: "상품 구성", verb: "평형그룹매핑" },
};

// 재작업 승인 완료 직후, 확정 버튼 위에 잠깐이 아니라 다음 재확정 전까지 계속 보여주는 완료 안내
function approvedBannerHtml(s) {
  return s.justUnlocked ? `<span class="stage-approved-badge">✅ 잠금해제 승인 완료</span>` : "";
}

// 담당자 미확정으로 인한 대기 상태(선행 작업이 끝나지 않아 작업/확정 자체가 불가능한 상태)
function lockedBadgeHtml(s, upstreamLabel) {
  return `<span class="stage-pending-badge">🔒 「${upstreamLabel}」 확정 대기 중 (작업 및 확정 불가)</span>`;
}

function renderStage13Lock() {
  const editable = dsLoad().stages.s13.status === "editable";
  document.querySelectorAll(".stage13-editable-control").forEach((el) => { el.disabled = !editable; });
  document.getElementById("stage13LockTag").hidden = editable;
}

function renderMappingLock() {
  const s = dsLoad().stages;
  const editable = s.s14.status === "editable";
  document.querySelectorAll(".mapping-editable-control").forEach((el) => { el.disabled = !editable; });
  document.getElementById("stage14LockTag").hidden = editable;
  updateUndoButtons();

  const fullOverlay = document.getElementById("stage14FullLockOverlay");
  if (s.s14.status === "locked") {
    fullOverlay.hidden = false;
    fullOverlay.querySelector(".lock-overlay-msg").textContent = `🔒 「${s.s13.label}」 확정 후 작업할 수 있습니다.`;
  } else {
    fullOverlay.hidden = true;
  }
}

// 1.3 프로덕트×상품구성코드 / 1.4 평형그룹매핑 공용 확정 박스 (활성 서브탭에 맞는 단계만 조작 가능하게 표시)
function renderStep1StageBox() {
  const box = document.getElementById("stage14Box");
  const stages = dsLoad().stages;
  const activeTab = document.querySelector("#view-1 .step-tab.active").dataset.tab;
  const targetKey = activeTab === "mapping" ? "s13" : activeTab === "area" ? "s14" : null;

  if (!targetKey) {
    const s13 = stages.s13;
    const s14 = stages.s14;
    box.innerHTML = `
      <div class="confirm-box compact">
        <div class="confirm-info">
          <p>1.3 프로덕트×상품구성코드 : ${dsStatusLabel(s13.status)}${s13.confirmedAt ? " · " + s13.confirmedAt : ""}</p>
          <p>1.4 평형그룹매핑 : ${dsStatusLabel(s14.status)}${s14.confirmedAt ? " · " + s14.confirmedAt : ""}</p>
        </div>
      </div>`;
  } else {
    const s = stages[targetKey];
    const meta = STEP1_STAGE_META[targetKey];
    const isOwner = dsGetCurrentRole() === s.owner;
    const upstreamLabel = targetKey === "s14" ? stages.s13.label : stages.s0.label;

    if (s.status === "locked") {
      box.innerHTML = lockedBadgeHtml(s, upstreamLabel);
    } else if (s.status === "editable") {
      box.innerHTML = `
        ${approvedBannerHtml(s)}
        <button class="ghost-btn green" id="stageBoxConfirmBtn" ${isOwner ? "" : "disabled"}>✔ ${meta.verb} 확정하기</button>
        ${isOwner ? "" : `<span class="stage-role-hint">담당자(${dsRoleName(s.owner)})만 확정할 수 있습니다</span>`}`;
      document.getElementById("stageBoxConfirmBtn").addEventListener("click", () => { dsConfirmStage(targetKey); renderEverything(); });
    } else if (s.status === "confirmed") {
      box.innerHTML = `
        <div class="confirm-box">
          <span class="confirm-badge">${meta.badge}<br />확 정</span>
          <div class="confirm-info">
            <p>확정자 : ${dsRoleName(s.owner)}</p>
            <p>확정일 : ${s.confirmedAt}</p>
          </div>
        </div>
        <button class="danger-btn" id="stageBoxReopenBtn" ${isOwner ? "" : "disabled"}>↺ ${meta.verb} 확정 강제취소</button>`;
      document.getElementById("stageBoxReopenBtn").addEventListener("click", () => { dsRequestReopen(targetKey); renderEverything(); });
    } else if (s.status === "reopen_pending") {
      box.innerHTML = `
        <div class="stage-pending-badge">⏳ 잠금 해제 승인 대기 중 (${s.pendingApprovals.map((k) => dsRoleName(stages[k].owner)).join(", ")})</div>
        <button class="toolbar-btn" id="stageBoxCancelReopenBtn" ${isOwner ? "" : "disabled"}>요청 취소</button>`;
      document.getElementById("stageBoxCancelReopenBtn").addEventListener("click", () => { dsCancelReopenRequest(targetKey); renderEverything(); });
    }
  }

  renderStage13Lock();
  renderMappingLock();
}

function renderStageBox(stageKey, containerId, verb, badgeText) {
  const box = document.getElementById(containerId);
  const stages = dsLoad().stages;
  const s = stages[stageKey];
  const isOwner = dsGetCurrentRole() === s.owner;
  const upstream = stageKey === "s2" ? stages.s14 : stages.s2;

  if (s.status === "locked") {
    box.innerHTML = lockedBadgeHtml(s, upstream.label);
  } else if (s.status === "editable") {
    box.innerHTML = `
      ${approvedBannerHtml(s)}
      <button class="ghost-btn green" id="${stageKey}ConfirmBtn" ${isOwner ? "" : "disabled"}>✔ ${verb} 확정하기</button>
      ${isOwner ? "" : `<span class="stage-role-hint">담당자(${dsRoleName(s.owner)})만 확정할 수 있습니다</span>`}`;
    document.getElementById(`${stageKey}ConfirmBtn`).addEventListener("click", () => { dsConfirmStage(stageKey); renderEverything(); });
  } else if (s.status === "confirmed") {
    box.innerHTML = `
      <div class="confirm-box">
        <span class="confirm-badge">${badgeText}<br />확 정</span>
        <div class="confirm-info">
          <p>확정자 : ${dsRoleName(s.owner)}</p>
          <p>확정일 : ${s.confirmedAt}</p>
        </div>
      </div>
      <button class="danger-btn" id="${stageKey}ReopenBtn" ${isOwner ? "" : "disabled"}>↺ ${verb} 확정 강제취소</button>`;
    document.getElementById(`${stageKey}ReopenBtn`).addEventListener("click", () => { dsRequestReopen(stageKey); renderEverything(); });
  } else if (s.status === "reopen_pending") {
    box.innerHTML = `
      <div class="stage-pending-badge">⏳ 잠금 해제 승인 대기 중 (${s.pendingApprovals.map((k) => dsRoleName(stages[k].owner)).join(", ")})</div>
      <button class="toolbar-btn" id="${stageKey}CancelReopenBtn" ${isOwner ? "" : "disabled"}>요청 취소</button>`;
    document.getElementById(`${stageKey}CancelReopenBtn`).addEventListener("click", () => { dsCancelReopenRequest(stageKey); renderEverything(); });
  }

  const overlayId = stageKey === "s2" ? "stage2LockOverlay" : "stage4LockOverlay";
  const toolbarLeftId = stageKey === "s2" ? "stage2ToolbarLeft" : "stage4ToolbarLeft";
  const overlay = document.getElementById(overlayId);
  const toolbarLeft = document.getElementById(toolbarLeftId);

  if (s.status === "locked") {
    overlay.hidden = false;
    overlay.querySelector(".lock-overlay-msg").textContent = `🔒 「${upstream.label}」 확정 후 작업할 수 있습니다.`;
    toolbarLeft.classList.add("disabled-group");
  } else {
    overlay.hidden = true;
    toolbarLeft.classList.toggle("disabled-group", s.status !== "editable");
  }
}

function renderAll() {
  renderStep1StageBox();
  renderStageBox("s2", "stage2Box", "원가", "원 가");
  renderStageBox("s4", "stage4Box", "판매가", "판매가");
}

// 공용 상태바(단계 현황/역할전환/알림/이력/수정로그)까지 함께 다시 그린다
function renderEverything() {
  dsRenderStatusBar("dsStatusStrip", { onRoleChange: renderAll, onStateChange: renderAll });
  renderAll();
}

document.getElementById("closeBtn").addEventListener("click", () => {
  window.location.href = "codes-landing.html";
});

renderEverything();
