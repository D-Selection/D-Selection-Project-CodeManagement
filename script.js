/* ===================== STEP 1 · PANEL 1: 프로덕트 =====================
   대분류/중분류는 전사공통코드로 관리되고(1.5 대분류/중분류/제조사, 현장별
   표준코드 > 전사공통코드와 같은 코드 체계), 소분류(PK)는 이제 "현장별
   관리 항목"이다 — 현장마다 마스터 카탈로그 중 자기가 쓰는 소분류만
   보유한다. 마스터 카탈로그(DS_PRODUCT_MASTER_CATALOG)와 현장별 배정
   데모 데이터(DS_OTHER_SITE_PRODUCT_SETS)는 현장별 표준코드 화면과
   공유해야 하므로 shared-state.js에서 관리한다. products는 "현재
   현장(아크로드 서초 현장)"이 보유한 소분류 목록이다. */
const PRODUCT_MASTER_CATALOG = DS_PRODUCT_MASTER_CATALOG;
const OTHER_SITE_PRODUCT_SETS = DS_OTHER_SITE_PRODUCT_SETS;

// 현재 현장이 보유한 소분류 목록(현장별 관리 항목). 기본값은 마스터 전체.
let products = PRODUCT_MASTER_CATALOG.slice();

const tableBody = document.getElementById("tableBody");
const rowCount = document.getElementById("rowCount");

function renderRows(list) {
  tableBody.innerHTML = list.map((p) => `
    <tr>
      <td>${p.no}</td>
      <td class="code-cell">${p.majorCode}</td>
      <td>${p.majorName}</td>
      <td>${p.midCode}</td>
      <td>${p.midName}</td>
      <td class="code-cell">${p.code}</td>
      <td>${p.name}</td>
    </tr>
  `).join("");
  rowCount.textContent = list.length;
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
    [p.code, p.name, p.majorName, p.midName].join(" ").toLowerCase().includes(q)
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

/* ---- 엑셀 다운로드 / 업로드 (CSV 기반 — 엑셀에서 그대로 열고 편집할 수 있다) ---- */
function productsToCsv(list) {
  const header = ["연번", "대분류코드", "대분류명", "중분류코드", "중분류명", "소분류코드(PK)", "상품명"];
  const escCell = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [header.map(escCell).join(",")];
  list.forEach((p) => {
    lines.push([p.no, p.majorCode, p.majorName, p.midCode, p.midName, p.code, p.name].map(escCell).join(","));
  });
  return "\uFEFF" + lines.join("\r\n");
}

function parseProductCsv(text) {
  const clean = text.replace(/^\uFEFF/, "").trim();
  const rows = clean.split(/\r\n|\n/).map((line) => {
    const cells = [];
    let cur = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else cur += ch;
      } else if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { cells.push(cur); cur = ""; }
      else cur += ch;
    }
    cells.push(cur);
    return cells;
  });
  return rows.slice(1).map((cells) => ({
    no: Number(cells[0]) || 0,
    majorCode: cells[1] || "",
    majorName: cells[2] || "",
    midCode: cells[3] || "",
    midName: cells[4] || "",
    code: cells[5] || "",
    name: cells[6] || "",
  })).filter((r) => r.code);
}

document.getElementById("productExcelDownloadBtn").addEventListener("click", () => {
  const csv = productsToCsv(products);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `아크로드_서초현장_프로덕트(소분류)_${products.length}건.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  dsAddEditLog("1.1 프로덕트", `프로덕트(소분류) ${products.length}건을 엑셀로 다운로드`);
});

const productExcelUploadInput = document.createElement("input");
productExcelUploadInput.type = "file";
productExcelUploadInput.accept = ".csv";
productExcelUploadInput.hidden = true;
document.body.appendChild(productExcelUploadInput);

document.getElementById("productExcelUploadBtn").addEventListener("click", () => {
  if (dsLoad().stages.s11.status !== "editable") return;
  productExcelUploadInput.value = "";
  productExcelUploadInput.click();
});

productExcelUploadInput.addEventListener("change", () => {
  const file = productExcelUploadInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseProductCsv(String(reader.result));
    if (parsed.length === 0) { showToast("업로드한 파일에서 유효한 데이터를 찾지 못했습니다."); return; }
    products = parsed;
    renderRows(products);
    dsAddEditLog("1.1 프로덕트", `엑셀 업로드로 프로덕트(소분류) ${products.length}건 갱신`);
    showToast(`${products.length}건이 업로드되어 반영되었습니다.`);
  };
  reader.readAsText(file, "utf-8");
});

/* ---- 다른현장 불러오기 : 현장별로 관리되는 소분류(PK) 목록을 다른 현장 것으로 그대로 교체 ---- */
const productLoadSiteModal = document.getElementById("productLoadSiteModal");
const productLoadSiteModalBody = document.getElementById("productLoadSiteModalBody");

function renderProductLoadSiteModal() {
  productLoadSiteModalBody.innerHTML = `
    <div class="lang-edit-summary">다른 현장에서 이미 관리 중인 소분류(PK) 목록을 그대로 불러와 현재 목록을 교체합니다.</div>
    <div class="sort-order-list">
      ${OTHER_SITE_PRODUCT_SETS.map((s, i) => `
        <div class="sort-order-item">
          <span>${s.name} <span class="muted">(${s.codes.length}건)</span></span>
          <button type="button" class="ghost-btn blue-fill" data-site-idx="${i}" style="padding:4px 10px;font-size:11.5px;">불러오기</button>
        </div>
      `).join("")}
    </div>
  `;
  productLoadSiteModalBody.querySelectorAll("[data-site-idx]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const site = OTHER_SITE_PRODUCT_SETS[Number(btn.dataset.siteIdx)];
      const codeSet = new Set(site.codes);
      products = PRODUCT_MASTER_CATALOG.filter((r) => codeSet.has(r.code));
      renderRows(products);
      dsAddEditLog("1.1 프로덕트", `「${site.name}」의 프로덕트(소분류) ${products.length}건을 불러와 반영`);
      productLoadSiteModal.hidden = true;
      showToast(`「${site.name}」에서 ${products.length}건을 불러왔습니다.`);
    });
  });
}

document.getElementById("productLoadOtherSiteBtn").addEventListener("click", () => {
  if (dsLoad().stages.s11.status !== "editable") return;
  renderProductLoadSiteModal();
  productLoadSiteModal.hidden = false;
});
document.getElementById("productLoadSiteModalClose").addEventListener("click", () => { productLoadSiteModal.hidden = true; });

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

/* 상품(SKU)은 직접 입력하는 텍스트 데이터, 프로덕트는 1.1의 소분류(PK)
   마스터(452건)다. 상품 1개에 프로덕트를 여러 개 매핑할 수 있는데, 코드를
   직접 타이핑하게 하면 452개 중에서 오타·오매핑이 나기 쉬우므로, 검색해서
   클릭으로만 추가/해제하도록 해 오류 여지를 없앤다. */
const skuProductMap = {}; // { [skuCode]: string[] (프로덕트 소분류코드 PK 목록) }

function skuMappedProducts(skuCode) {
  return (skuProductMap[skuCode] || [])
    .map((code) => PRODUCT_MASTER_CATALOG.find((p) => p.code === code))
    .filter(Boolean);
}

function skuProductChipsHtml(skuCode) {
  const mapped = skuMappedProducts(skuCode);
  const chips = mapped.map((p) => `
    <span class="sku-product-chip" title="${p.majorName} · ${p.midName}">
      <span class="code-cell">${p.code}</span> ${p.name}
      <button type="button" class="sku-product-remove" data-sku="${skuCode}" data-code="${p.code}" title="매핑 해제">✕</button>
    </span>
  `).join("");
  return `
    <div class="sku-product-cell">
      <div class="sku-product-chips">${chips}</div>
      <button type="button" class="sku-product-add-btn" data-sku="${skuCode}">+ 프로덕트 매핑</button>
    </div>
  `;
}

function renderSkuTable() {
  skuTableBody.innerHTML = skuData.map((s) => `
    <tr>
      <td class="code-cell">${s.code}</td>
      <td>${s.spaceCode}</td>
      <td>${s.space}</td>
      <td>${s.styleCode}</td>
      <td>${s.style}</td>
      <td>본사</td>
      <td>${skuProductChipsHtml(s.code)}</td>
      <td>${s.item}</td>
      <td>${s.itemCustomer}</td>
    </tr>
  `).join("");
}
renderSkuTable();

skuTableBody.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".sku-product-add-btn");
  if (addBtn) { openSkuProductModal(addBtn.dataset.sku); return; }
  const removeBtn = e.target.closest(".sku-product-remove");
  if (removeBtn) {
    const { sku, code } = removeBtn.dataset;
    skuProductMap[sku] = (skuProductMap[sku] || []).filter((c) => c !== code);
    dsAddEditLog("1.2 상품구성코드", `${sku} · 프로덕트 매핑 해제: ${code}`);
    renderSkuTable();
  }
});

/* ---- 프로덕트 매핑 모달 : 452개 소분류 마스터에서 검색해서 클릭 한 번으로 추가/해제 ---- */
const skuProductModal = document.getElementById("skuProductModal");
const skuProductModalBody = document.getElementById("skuProductModalBody");
const skuProductModalSkuLabel = document.getElementById("skuProductModalSkuLabel");
const skuProductModalNav = document.getElementById("skuProductModalNav");
let skuProductModalSku = null;
let skuProductModalIndex = -1;

function renderSkuProductModalNav() {
  if (!skuProductModalNav || skuProductModalIndex < 0) return;
  const s = skuData[skuProductModalIndex];
  const mappedCount = (skuProductMap[s.code] || []).length;
  skuProductModalNav.innerHTML = `
    <button type="button" class="sku-nav-btn" id="skuNavPrev" title="이전 상품 (←)">◀ 이전</button>
    <div class="sku-nav-info">
      <span class="code-cell">${s.code}</span>
      <span class="sku-nav-item-name">${s.itemCustomer || s.item}</span>
      <span class="sku-nav-pos">${skuProductModalIndex + 1} / ${skuData.length}</span>
      ${mappedCount === 0 ? `<span class="sku-nav-unmapped-tag">미매핑</span>` : `<span class="sku-nav-mapped-count">${mappedCount}개 매핑됨</span>`}
    </div>
    <button type="button" class="sku-nav-btn" id="skuNavNext" title="다음 상품 (→)">다음 ▶</button>
    <button type="button" class="sku-nav-btn sku-nav-jump" id="skuNavJumpUnmapped" title="프로덕트가 아직 매핑되지 않은 다음 상품으로 이동">⏭ 다음 미매핑</button>
  `;
  document.getElementById("skuNavPrev").addEventListener("click", () => {
    const i = (skuProductModalIndex - 1 + skuData.length) % skuData.length;
    openSkuProductModal(skuData[i].code);
  });
  document.getElementById("skuNavNext").addEventListener("click", () => {
    const i = (skuProductModalIndex + 1) % skuData.length;
    openSkuProductModal(skuData[i].code);
  });
  document.getElementById("skuNavJumpUnmapped").addEventListener("click", () => {
    const n = skuData.length;
    for (let step = 1; step <= n; step++) {
      const i = (skuProductModalIndex + step) % n;
      if ((skuProductMap[skuData[i].code] || []).length === 0) { openSkuProductModal(skuData[i].code); return; }
    }
    showToast("모든 상품에 프로덕트가 매핑되어 있습니다.");
  });
}

document.addEventListener("keydown", (e) => {
  if (!skuProductModal || skuProductModal.hidden) return;
  const active = document.activeElement;
  const typingInSearch = active && active.id === "skuProductSearchInput" && active.value.length > 0;
  if (typingInSearch) return;
  if (e.key === "ArrowLeft") { e.preventDefault(); document.getElementById("skuNavPrev")?.click(); }
  if (e.key === "ArrowRight") { e.preventDefault(); document.getElementById("skuNavNext")?.click(); }
});

function renderSkuModalMappedList() {
  const list = document.getElementById("skuModalMappedList");
  if (!list) return;
  const mapped = skuMappedProducts(skuProductModalSku);
  list.innerHTML = mapped.length === 0
    ? `<div class="sku-modal-mapped-empty">아직 매핑된 프로덕트가 없습니다.</div>`
    : mapped.map((p) => `
      <span class="sku-product-chip"><span class="code-cell">${p.code}</span> ${p.name}
        <button type="button" class="sku-product-remove" data-code="${p.code}" title="매핑 해제">✕</button>
      </span>
    `).join("");
}

function renderSkuProductResults(query) {
  const resultsEl = document.getElementById("skuProductResults");
  if (!resultsEl) return;
  const q = query.trim().toLowerCase();
  const mappedCodes = new Set(skuProductMap[skuProductModalSku] || []);
  if (!q) { resultsEl.innerHTML = `<div class="sku-product-results-hint">코드, 상품명, 대분류/중분류명으로 검색해보세요 (452건 중 검색).</div>`; return; }
  const matches = PRODUCT_MASTER_CATALOG
    .filter((p) => !mappedCodes.has(p.code))
    .filter((p) => [p.code, p.name, p.majorName, p.midName].join(" ").toLowerCase().includes(q))
    .slice(0, 30);
  resultsEl.innerHTML = matches.length === 0
    ? `<div class="sku-product-results-hint">일치하는 프로덕트가 없습니다.</div>`
    : matches.map((p) => `
      <button type="button" class="sku-product-result" data-code="${p.code}">
        <span class="code-cell">${p.code}</span>
        <span class="sku-product-result-name">${p.name}</span>
        <span class="sku-product-result-cat">${p.majorName} · ${p.midName}</span>
      </button>
    `).join("");
}

function renderSkuProductModalBody() {
  skuProductModalBody.innerHTML = `
    <div class="lang-edit-summary">이미 매핑된 프로덕트는 아래에서 바로 해제할 수 있고, 검색으로 새 프로덕트를 찾아 클릭하면 바로 추가됩니다.</div>
    <div class="sku-modal-mapped" id="skuModalMappedList"></div>
    <input type="text" id="skuProductSearchInput" class="sku-product-search-input" placeholder="소분류코드(PK), 상품명, 대분류명, 중분류명으로 검색" autocomplete="off" />
    <div class="sku-product-results" id="skuProductResults"></div>
  `;
  renderSkuModalMappedList();
  renderSkuProductResults("");
  const searchInput = document.getElementById("skuProductSearchInput");
  searchInput.addEventListener("input", (e) => renderSkuProductResults(e.target.value));
  searchInput.focus();
}

function openSkuProductModal(skuCode) {
  skuProductModalSku = skuCode;
  skuProductModalIndex = skuData.findIndex((s) => s.code === skuCode);
  skuProductModalSkuLabel.textContent = `— ${skuCode}`;
  renderSkuProductModalNav();
  renderSkuProductModalBody();
  skuProductModal.hidden = false;
}

document.getElementById("skuProductModalClose").addEventListener("click", () => { skuProductModal.hidden = true; renderSkuTable(); });
skuProductModalBody.addEventListener("click", (e) => {
  const resultBtn = e.target.closest(".sku-product-result");
  if (resultBtn) {
    const code = resultBtn.dataset.code;
    skuProductMap[skuProductModalSku] = [...(skuProductMap[skuProductModalSku] || []), code];
    dsAddEditLog("1.2 상품구성코드", `${skuProductModalSku} · 프로덕트 매핑 추가: ${code}`);
    renderSkuModalMappedList();
    renderSkuProductResults(document.getElementById("skuProductSearchInput").value);
    renderSkuProductModalNav();
    renderSkuTable();
    return;
  }
  const removeBtn = e.target.closest(".sku-product-remove");
  if (removeBtn) {
    const code = removeBtn.dataset.code;
    skuProductMap[skuProductModalSku] = (skuProductMap[skuProductModalSku] || []).filter((c) => c !== code);
    dsAddEditLog("1.2 상품구성코드", `${skuProductModalSku} · 프로덕트 매핑 해제: ${code}`);
    renderSkuModalMappedList();
    renderSkuProductResults(document.getElementById("skuProductSearchInput").value);
    renderSkuProductModalNav();
    renderSkuTable();
  }
});

/* ---- 상품 추가 모달 (직접 입력) ---- */
const skuAddModal = document.getElementById("skuAddModal");
const skuAddModalBody = document.getElementById("skuAddModalBody");

function nextSkuCode() {
  const nums = skuData.map((s) => Number(String(s.code).replace(/\D/g, "")) || 0);
  return `SL${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`;
}

document.getElementById("skuAddBtn").addEventListener("click", () => {
  skuAddModalBody.innerHTML = `
    <div class="lang-edit-field"><label>상품 코드</label><input type="text" id="skuAddCode" value="${nextSkuCode()}" /></div>
    <div class="lang-edit-field"><label>공간코드</label><input type="text" id="skuAddSpaceCode" placeholder="예: EN" /></div>
    <div class="lang-edit-field"><label>공간명</label><input type="text" id="skuAddSpace" placeholder="예: 현관 - Entrance" /></div>
    <div class="lang-edit-field"><label>스타일코드</label><input type="text" id="skuAddStyleCode" placeholder="예: NN" /></div>
    <div class="lang-edit-field"><label>스타일명</label><input type="text" id="skuAddStyle" placeholder="예: 스타일 미적용 - None" /></div>
    <div class="lang-edit-field"><label>항목명</label><input type="text" id="skuAddItem" placeholder="예: 슬라이딩 도어" /></div>
    <div class="lang-edit-field"><label>항목명 (고객용)</label><input type="text" id="skuAddItemCustomer" placeholder="비워두면 항목명과 동일하게 저장됩니다" /></div>
    <div class="lang-edit-error" id="skuAddError" hidden></div>
    <div class="lang-edit-actions">
      <button class="toolbar-btn" id="skuAddCancelBtn" type="button">취소</button>
      <button class="primary-btn" id="skuAddSaveBtn" type="button">추가</button>
    </div>
  `;
  skuAddModal.hidden = false;
  document.getElementById("skuAddCancelBtn").addEventListener("click", () => { skuAddModal.hidden = true; });
  document.getElementById("skuAddSaveBtn").addEventListener("click", () => {
    const errorEl = document.getElementById("skuAddError");
    errorEl.hidden = true;
    const code = document.getElementById("skuAddCode").value.trim();
    const item = document.getElementById("skuAddItem").value.trim();
    if (!code || !item) {
      errorEl.hidden = false;
      errorEl.textContent = "❌ 상품 코드와 항목명은 반드시 입력해야 합니다.";
      return;
    }
    if (skuData.some((s) => s.code === code)) {
      errorEl.hidden = false;
      errorEl.textContent = `❌ 이미 존재하는 상품 코드입니다: ${code}`;
      return;
    }
    skuData.push({
      code,
      spaceCode: document.getElementById("skuAddSpaceCode").value.trim(),
      space: document.getElementById("skuAddSpace").value.trim(),
      styleCode: document.getElementById("skuAddStyleCode").value.trim(),
      style: document.getElementById("skuAddStyle").value.trim(),
      item,
      itemCustomer: document.getElementById("skuAddItemCustomer").value.trim() || item,
    });
    renderSkuTable();
    dsAddEditLog("1.2 상품구성코드", `상품 ${code} 신규 추가 (항목명: ${item})`);
    skuAddModal.hidden = true;
    showToast(`상품 ${code}이(가) 추가되었습니다.`);
  });
});
document.getElementById("skuAddModalClose").addEventListener("click", () => { skuAddModal.hidden = true; });

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

/* ===================== STEP 1 · PANEL 4 개선 뷰 (서브탭) =====================
   1) 현재 방식(.area-layout)은 그대로 유지.
   2) 아래 3개는 "상품이 어느 평형에 배정되는지"를 다루는 공용 데이터(pivotAssignments)를
      함께 보고 편집하는 새로운 보조 화면으로, 기존 화면과는 독립적으로 동작한다. */
document.querySelectorAll(".area-subtab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".area-subtab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll("#panel-area .area-subview").forEach((v) => v.classList.remove("active"));
    document.getElementById(`areaSubview-${btn.dataset.view}`).classList.add("active");
    if (btn.dataset.view === "pivot") renderPivotTable();
    if (btn.dataset.view === "template") renderTemplateView();
    if (btn.dataset.view === "review") renderReviewDoc();
  });
});

const pyeongList = [...new Set(areaGroups.map((g) => g.pyeong))];

const pivotProducts = [
  ...areaConfigRows.map((r) => ({ code: r.code, item: r.item, itemCustomer: r.itemCustomer, space: r.space })),
  ...areaRightRows.map((r) => ({ code: r.code, item: r.item, itemCustomer: r.itemCustomer, space: spaceCodeToName(r.space) })),
];

const PIVOT_CORE_CODES = ["SL001", "SL003", "SL031"];
const pivotAssignments = {};
pyeongList.forEach((p, idx) => {
  if (p === "059A") {
    pivotAssignments[p] = new Set(areaConfigRows.map((r) => r.code));
    return;
  }
  const extraCount = 2 + (idx % 3);
  const extraPool = pivotProducts.map((x) => x.code).filter((c) => !PIVOT_CORE_CODES.includes(c));
  const extras = extraPool.slice(idx, idx + extraCount);
  pivotAssignments[p] = new Set([...PIVOT_CORE_CODES, ...extras]);
});

/* ---- 개선 1안 : 상품 × 평형 매트릭스 ---- */
function renderPivotTable() {
  const editable = dsLoad().stages.s14.status === "editable";

  document.getElementById("pivotTableHeadRow").innerHTML =
    `<th class="pivot-product-col">상품명</th>` + pyeongList.map((p) => `<th>${p}</th>`).join("");

  document.getElementById("pivotTableBody").innerHTML = pivotProducts.map((prod) => `
    <tr>
      <td class="pivot-product-col">
        <span class="code-cell">${prod.code}</span> ${prod.itemCustomer}
        <div class="pivot-space-tag">${prod.space}</div>
      </td>
      ${pyeongList.map((p) => `
        <td class="pivot-cell">
          <input type="checkbox" class="pivot-check mapping-editable-control"
            data-pyeong="${p}" data-code="${prod.code}"
            ${pivotAssignments[p].has(prod.code) ? "checked" : ""} ${editable ? "" : "disabled"} />
        </td>
      `).join("")}
    </tr>
  `).join("");

  document.getElementById("pivotProductCount").textContent = `${pivotProducts.length}개`;

  document.querySelectorAll(".pivot-check").forEach((cb) => {
    cb.addEventListener("change", () => {
      const { pyeong, code } = cb.dataset;
      if (cb.checked) pivotAssignments[pyeong].add(code);
      else pivotAssignments[pyeong].delete(code);
      dsAddEditLog("1.4 평형그룹매핑(매트릭스)", `${pyeong} · ${code} ${cb.checked ? "배정" : "배정 해제"}`);
    });
  });
}

/* ---- 개선 2안 : 대표 타입 복제 후 수정 ---- */
const templateCloneLogEntries = [];
let templateEditTarget = pyeongList.find((p) => p !== "059A") || pyeongList[0];

function renderTemplateTargetList() {
  const sourceSelect = document.getElementById("templateSourceSelect");
  const source = sourceSelect.value;
  document.getElementById("templateTargetList").innerHTML = pyeongList
    .filter((p) => p !== source)
    .map((p) => `
      <label class="area-template-target-item">
        <input type="checkbox" class="mapping-editable-control template-target-check" value="${p}" /> ${p}
      </label>
    `).join("");
}

function renderTemplateCloneLog() {
  const el = document.getElementById("templateCloneLog");
  if (templateCloneLogEntries.length === 0) {
    el.innerHTML = `<div class="area-template-log-empty">아직 복제 이력이 없습니다.</div>`;
    return;
  }
  el.innerHTML = templateCloneLogEntries.map((e) => `
    <div class="area-template-log-item">
      <div class="area-template-log-item-title">${e.source} → ${e.targets.join(", ")}</div>
      <div class="muted">${e.count}개 항목 복제 · ${e.time}</div>
    </div>
  `).join("");
}

function renderTemplateEditTargetSelect() {
  const select = document.getElementById("templateEditTargetSelect");
  select.innerHTML = pyeongList.map((p) => `<option value="${p}" ${p === templateEditTarget ? "selected" : ""}>${p}</option>`).join("");
}

function renderTemplateEditBody() {
  const editable = dsLoad().stages.s14.status === "editable";
  const assigned = pivotAssignments[templateEditTarget];
  document.getElementById("templateEditBody").innerHTML = pivotProducts.map((prod) => `
    <tr>
      <td><input type="checkbox" class="mapping-editable-control template-edit-check" data-code="${prod.code}"
        ${assigned.has(prod.code) ? "checked" : ""} ${editable ? "" : "disabled"} /></td>
      <td>${prod.space}</td>
      <td class="code-cell">${prod.code}</td>
      <td>${prod.item}</td>
      <td>${prod.itemCustomer}</td>
    </tr>
  `).join("");
  document.getElementById("templateEditCount").textContent = `${assigned.size}개`;

  document.querySelectorAll(".template-edit-check").forEach((cb) => {
    cb.addEventListener("change", () => {
      const code = cb.dataset.code;
      if (cb.checked) assigned.add(code);
      else assigned.delete(code);
      dsAddEditLog("1.4 평형그룹매핑(템플릿편집)", `${templateEditTarget} · ${code} ${cb.checked ? "추가" : "제거"}`);
      document.getElementById("templateEditCount").textContent = `${assigned.size}개`;
    });
  });
}

function renderTemplateView() {
  renderTemplateTargetList();
  renderTemplateCloneLog();
  renderTemplateEditTargetSelect();
  renderTemplateEditBody();
}

document.getElementById("templateSourceSelect").innerHTML = pyeongList.map((p) => `<option value="${p}">${p}</option>`).join("");
document.getElementById("templateSourceSelect").addEventListener("change", renderTemplateTargetList);

document.getElementById("templateEditTargetSelect").addEventListener("change", (e) => {
  templateEditTarget = e.target.value;
  renderTemplateEditBody();
});

document.getElementById("templateCloneBtn").addEventListener("click", () => {
  if (dsLoad().stages.s14.status !== "editable") return;
  const source = document.getElementById("templateSourceSelect").value;
  const targets = [...document.querySelectorAll(".template-target-check:checked")].map((cb) => cb.value);
  if (targets.length === 0) return;

  targets.forEach((t) => { pivotAssignments[t] = new Set(pivotAssignments[source]); });

  const count = pivotAssignments[source].size;
  templateCloneLogEntries.unshift({ source, targets, count, time: dsNowKorean() });
  dsAddEditLog("1.4 평형그룹매핑(템플릿복제)", `${source} 상품구성(${count}개)을 ${targets.join(", ")}에 복제`);

  templateEditTarget = targets[0];
  renderTemplateView();
});

/* ---- 검수 화면 : 안내문 초안 뷰어 (판매가·패키지 정보 없이 평형별/공간별 배정만 확인) ---- */
document.getElementById("reviewPyeongSelect").innerHTML = pyeongList.map((p) => `<option value="${p}">${p}</option>`).join("");
document.getElementById("reviewPyeongSelect").addEventListener("change", renderReviewDoc);

/* 고객스타일 = 상품 스타일(styleCode)의 조합. 이 화면에서만 쓰는 조회용 그룹핑이며
   pivotAssignments/skuData 등 실제 데이터는 전혀 건드리지 않는다. */
const CUSTOMER_STYLE_COMBOS = [
  { name: "미니멀", productStyles: ["NN", "MM"] },
  { name: "네츄럴모던", productStyles: ["NN", "NM"] },
  { name: "소프트클래식", productStyles: ["NN", "SC"] },
];
const skuStyleCodeByCode = {};
skuData.forEach((s) => { skuStyleCodeByCode[s.code] = s.styleCode; });

const reviewCustomerStyleSelect = document.getElementById("reviewCustomerStyleSelect");
if (reviewCustomerStyleSelect) {
  reviewCustomerStyleSelect.innerHTML =
    `<option value="">전체 스타일</option>` +
    CUSTOMER_STYLE_COMBOS.map((c) => `<option value="${c.name}">${c.name}</option>`).join("");
  reviewCustomerStyleSelect.addEventListener("change", renderReviewDoc);
}

function renderReviewDoc() {
  const pyeong = document.getElementById("reviewPyeongSelect").value || pyeongList[0];
  const assigned = pivotAssignments[pyeong];
  let items = pivotProducts.filter((p) => assigned.has(p.code));

  const customerStyleName = reviewCustomerStyleSelect ? reviewCustomerStyleSelect.value : "";
  const combo = CUSTOMER_STYLE_COMBOS.find((c) => c.name === customerStyleName);
  if (combo) {
    items = items.filter((it) => combo.productStyles.includes(skuStyleCodeByCode[it.code]));
  }

  if (items.length === 0) {
    document.getElementById("reviewDoc").innerHTML = `<div class="review-doc-empty">배정된 상품이 없습니다.</div>`;
    return;
  }

  const bySpace = {};
  items.forEach((it) => {
    if (!bySpace[it.space]) bySpace[it.space] = [];
    bySpace[it.space].push(it);
  });

  document.getElementById("reviewDoc").innerHTML = `
    <div class="review-doc-title">${pyeong} 세대 마감재 안내문 (초안)${combo ? ` · 고객스타일: ${combo.name}` : ""}</div>
    <div class="review-doc-subtitle">본 안내문은 검수용 초안이며 판매가 · 패키지 구성 정보는 포함하지 않습니다.${combo ? ` (고객스타일 분류는 이 화면 전용 조회 필터입니다)` : ""}</div>
    ${Object.keys(bySpace).map((space) => `
      <div class="review-doc-space">
        <div class="review-doc-space-title">${space}</div>
        <ul class="review-doc-item-list">
          ${bySpace[space].map((it) => `
            <li class="review-doc-item">
              <span class="review-doc-item-name">${it.itemCustomer}</span>
              <span class="review-doc-item-code">${it.code}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `).join("")}
  `;
}

renderPivotTable();
renderTemplateView();
renderReviewDoc();

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

function renderCategoryTables() {
  document.getElementById("majorCatBody").innerHTML = majorCats.map((c, i) => `
    <tr class="${i === 0 ? "selected" : ""}"><td>${c.name}</td><td>${c.code}</td></tr>
  `).join("");
  document.getElementById("midCatBody").innerHTML = midCats.map((c, i) => `
    <tr class="${i === 0 ? "selected" : ""}"><td>${c.major}</td><td>${c.name}</td><td>${c.code}</td></tr>
  `).join("");
  document.getElementById("makerBody").innerHTML = makers.map((c, i) => `
    <tr class="${i === 0 ? "selected" : ""}"><td>${c.name}</td><td>${c.code}</td></tr>
  `).join("");
}
renderCategoryTables();

/* 별매품 단계(1/2/3) : 상품코드별로 관리되는 값. 4.상품고객언어에서 수정하면
   5.안분표 생성의 같은 상품코드 행에도 그대로 반영된다(단일 소스). */
const PRODUCT_OPTION_TIER = {
  SL001: "1", SL003: "2", SL006: "3", SL007: "3", SL008: "3",
  SL021: "2", SL022: "2", SL025: "3", SL026: "3", SL031: "1",
  SL032: "1", SL033: "1", SL034: "2", SL035: "2", SL036: "2",
  SL037: "3", SL038: "3", SL040: "2", SL045: "3", SL047: "1",
  SL048: "1", SL052: "1", SL054: "2", SL055: "2",
  SL060: "3",
};

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
].map((r) => ({
  customer: "일반 - Customer", pyeong: "059A", hq: "본사", option: "기본", plan: "미적용",
  majorCode: "", majorName: "", midCode: "", midName: "", makerCode: "", makerName: "",
  ...r,
}));

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

function renderLangTable() {
  document.getElementById("langTableBody").innerHTML = flatRows.map((r) => `
    <tr>
      <td><input type="checkbox" class="lang-row-check stage3-editable-control" data-seq="${r.seq}" /></td>
      <td>${r.seq}</td>
      <td>${r.customer}</td>
      <td>${r.pyeong}</td>
      <td>${r.hq}</td>
      <td>${r.style}</td>
      <td>${r.option}</td>
      <td>${r.plan}</td>
      <td>${r.space}</td>
      <td class="${r.majorName ? "" : "muted"}">${r.majorName || "-"}</td>
      <td class="${r.midName ? "" : "muted"}">${r.midName || "-"}</td>
      <td class="${r.makerName ? "" : "muted"}">${r.makerName || "-"}</td>
      <td>${PRODUCT_OPTION_TIER[r.code] ? `${PRODUCT_OPTION_TIER[r.code]}단계` : "-"}</td>
      <td class="code-cell">${r.code}</td>
      <td>${r.item}</td>
      <td>${r.itemCustomer}</td>
      <td>${r.detailCode}</td>
      <td>${r.detail}</td>
      <td>${r.detailCustomer}</td>
    </tr>
  `).join("");
  renderStage3ExtraLock();
}
renderLangTable();

function renderPriceTable() {
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
      <td class="${r.majorName ? "" : "muted"}">${r.majorName || "-"}</td>
      <td class="${r.midName ? "" : "muted"}">${r.midName || "-"}</td>
      <td class="${r.makerName ? "" : "muted"}">${r.makerName || "-"}</td>
      <td>${r.price === "" ? "" : r.price}</td>
    </tr>
  `).join("");
}
renderPriceTable();

/* ===================== STEP 4 개선 : 선택 항목 일괄수정(대분류/중분류/제조사명 검증) + 정렬순서 설정 ===================== */
const langEditModal = document.getElementById("langEditModal");
const langEditModalBody = document.getElementById("langEditModalBody");
const langEditBtn = document.getElementById("langEditBtn");

document.getElementById("langEditModalClose").addEventListener("click", () => { langEditModal.hidden = true; });

langEditBtn.addEventListener("click", () => {
  if (dsLoad().stages.s3.status !== "editable") return;
  const checkedSeqs = [...document.querySelectorAll(".lang-row-check:checked")].map((cb) => Number(cb.dataset.seq));
  if (checkedSeqs.length === 0) { showToast("수정할 항목을 먼저 선택해주세요."); return; }

  langEditModalBody.innerHTML = `
    <div class="lang-edit-summary">선택 ${checkedSeqs.length}건에 아래 입력값을 동일하게 적용합니다. 비워두면 해당 항목은 변경하지 않습니다.</div>
    <div class="lang-edit-field">
      <label>상품 대분류명</label>
      <input type="text" id="langEditMajor" placeholder="예: 현관" />
      <div class="field-hint">분양수금 시스템에 등록된 대분류명과 정확히 일치해야 합니다.</div>
      <div class="lang-edit-error" id="langEditMajorError" hidden></div>
    </div>
    <div class="lang-edit-field">
      <label>상품 중분류명</label>
      <input type="text" id="langEditMid" placeholder="예: 블랑클래식" />
      <div class="field-hint">분양수금 시스템에 등록된 중분류명과 정확히 일치해야 합니다.</div>
      <div class="lang-edit-error" id="langEditMidError" hidden></div>
    </div>
    <div class="lang-edit-field">
      <label>상품 제조사명</label>
      <input type="text" id="langEditMaker" placeholder="예: LX하우시스" />
      <div class="field-hint">분양수금 시스템에 등록된 제조사명과 정확히 일치해야 합니다.</div>
      <div class="lang-edit-error" id="langEditMakerError" hidden></div>
    </div>
    <div class="lang-edit-field">
      <label>별매품 단계</label>
      <select id="langEditTier">
        <option value="">(변경 안 함)</option>
        <option value="1">1단계</option>
        <option value="2">2단계</option>
        <option value="3">3단계</option>
      </select>
      <div class="field-hint">여기서 지정한 단계는 5.안분표 생성의 같은 상품코드 행에도 그대로 반영됩니다.</div>
    </div>
    <div class="lang-edit-field">
      <label>항목명(고객용)</label>
      <input type="text" id="langEditItemCustomer" placeholder="자유롭게 입력 (데이터 검증 없음)" />
    </div>
    <div class="lang-edit-field">
      <label>세부사항(고객용)</label>
      <input type="text" id="langEditDetailCustomer" placeholder="자유롭게 입력 (데이터 검증 없음)" />
    </div>
    <div class="lang-edit-actions">
      <button class="toolbar-btn" id="langEditCancelBtn" type="button">취소</button>
      <button class="primary-btn" id="langEditSaveBtn" type="button">저장</button>
    </div>
  `;
  langEditModal.hidden = false;

  document.getElementById("langEditCancelBtn").addEventListener("click", () => { langEditModal.hidden = true; });

  document.getElementById("langEditSaveBtn").addEventListener("click", () => {
    ["langEditMajorError", "langEditMidError", "langEditMakerError"].forEach((id) => { document.getElementById(id).hidden = true; });

    const majorInput = document.getElementById("langEditMajor").value.trim();
    const midInput = document.getElementById("langEditMid").value.trim();
    const makerInput = document.getElementById("langEditMaker").value.trim();
    const tierInput = document.getElementById("langEditTier").value;
    const itemCustomerInput = document.getElementById("langEditItemCustomer").value.trim();
    const detailCustomerInput = document.getElementById("langEditDetailCustomer").value.trim();

    let hasError = false;
    let majorMatch = null, midMatch = null, makerMatch = null;

    if (majorInput) {
      majorMatch = majorCats.find((c) => c.name === majorInput);
      if (!majorMatch) {
        document.getElementById("langEditMajorError").hidden = false;
        document.getElementById("langEditMajorError").textContent = `❌ '${majorInput}'은(는) 분양수금 시스템에 없는 상품 대분류명입니다.`;
        hasError = true;
      }
    }
    if (midInput) {
      midMatch = midCats.find((c) => c.name === midInput);
      if (!midMatch) {
        document.getElementById("langEditMidError").hidden = false;
        document.getElementById("langEditMidError").textContent = `❌ '${midInput}'은(는) 분양수금 시스템에 없는 상품 중분류명입니다.`;
        hasError = true;
      }
    }
    if (makerInput) {
      makerMatch = makers.find((c) => c.name === makerInput);
      if (!makerMatch) {
        document.getElementById("langEditMakerError").hidden = false;
        document.getElementById("langEditMakerError").textContent = `❌ '${makerInput}'은(는) 분양수금 시스템에 없는 상품 제조사명입니다.`;
        hasError = true;
      }
    }
    if (hasError) return;

    const changed = [];
    flatRows.forEach((r) => {
      if (!checkedSeqs.includes(r.seq)) return;
      if (majorMatch) { r.majorName = majorMatch.name; r.majorCode = majorMatch.code; }
      if (midMatch) { r.midName = midMatch.name; r.midCode = midMatch.code; }
      if (makerMatch) { r.makerName = makerMatch.name; r.makerCode = makerMatch.code; }
      if (tierInput) PRODUCT_OPTION_TIER[r.code] = tierInput;
      if (itemCustomerInput) r.itemCustomer = itemCustomerInput;
      if (detailCustomerInput) r.detailCustomer = detailCustomerInput;
      changed.push(r.seq);
    });

    dsAddEditLog("4. 상품고객언어", `${changed.length}건 수정 (순번: ${changed.join(", ")})`);
    renderLangTable();
    renderPriceTable();
    renderAllocationTable();
    langEditModal.hidden = true;
    showToast(`${changed.length}건이 수정되었습니다.`);
  });
});

// 대분류/중분류/제조사 조회·편집 : 1.5(대분류/중분류/제조사)에 있는 마스터 데이터를
// 4.상품고객언어 상단에서도 바로 조회·추가·수정·삭제·정렬할 수 있게 한다.
// 변경 즉시 majorCats/midCats/makers 배열 자체를 수정하므로 1.5 화면과 데이터를 공유한다.
const sortOrderModal = document.getElementById("sortOrderModal");
const sortOrderModalBody = document.getElementById("sortOrderModalBody");
const SORT_ORDER_ARRAYS = { major: majorCats, mid: midCats, maker: makers };

function renderSortOrderColumn(title, arr, key) {
  return `
    <div class="sort-order-col">
      <div class="sort-order-col-title">${title} <span class="muted">${arr.length}개</span></div>
      <div class="sort-order-list">
        ${arr.map((c, i) => `
          <div class="sort-order-item">
            <span class="sort-order-item-btns">
              <button type="button" data-list="${key}" data-idx="${i}" data-dir="up" ${i === 0 ? "disabled" : ""}>▲</button>
              <button type="button" data-list="${key}" data-idx="${i}" data-dir="down" ${i === arr.length - 1 ? "disabled" : ""}>▼</button>
            </span>
            ${key === "mid" ? `
              <select class="sort-edit-input sort-edit-major" data-list="${key}" data-idx="${i}" data-field="major">
                ${majorCats.map((m) => `<option value="${m.name}" ${m.name === c.major ? "selected" : ""}>${m.name}</option>`).join("")}
              </select>
            ` : ""}
            <input type="text" class="sort-edit-input sort-edit-name" data-list="${key}" data-idx="${i}" data-field="name" value="${c.name}" placeholder="명칭" />
            <input type="text" class="sort-edit-input sort-edit-code" data-list="${key}" data-idx="${i}" data-field="code" value="${c.code}" placeholder="코드" />
            <button type="button" class="sort-edit-remove" data-list="${key}" data-idx="${i}" title="삭제">✕</button>
          </div>
        `).join("")}
      </div>
      <button type="button" class="sort-edit-add" data-list="${key}">+ 추가</button>
    </div>
  `;
}

function renderSortOrderModal() {
  sortOrderModalBody.innerHTML = `
    <div class="sort-order-columns">
      ${renderSortOrderColumn("대분류", majorCats, "major")}
      ${renderSortOrderColumn("중분류", midCats, "mid")}
      ${renderSortOrderColumn("제조사", makers, "maker")}
    </div>
    <div class="sort-order-actions">
      <button class="primary-btn" id="sortOrderSaveBtn" type="button">저장 후 닫기</button>
    </div>
  `;
  sortOrderModalBody.querySelectorAll(".sort-order-item-btns button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const arr = SORT_ORDER_ARRAYS[btn.dataset.list];
      const idx = Number(btn.dataset.idx);
      const swapWith = btn.dataset.dir === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= arr.length) return;
      [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
      renderSortOrderModal();
    });
  });
  sortOrderModalBody.querySelectorAll(".sort-edit-input").forEach((el) => {
    el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
      const arr = SORT_ORDER_ARRAYS[el.dataset.list];
      arr[Number(el.dataset.idx)][el.dataset.field] = el.value;
    });
  });
  sortOrderModalBody.querySelectorAll(".sort-edit-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const arr = SORT_ORDER_ARRAYS[btn.dataset.list];
      arr.splice(Number(btn.dataset.idx), 1);
      renderSortOrderModal();
    });
  });
  sortOrderModalBody.querySelectorAll(".sort-edit-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const arr = SORT_ORDER_ARRAYS[btn.dataset.list];
      arr.push(btn.dataset.list === "mid" ? { major: majorCats[0] ? majorCats[0].name : "", name: "", code: "" } : { name: "", code: "" });
      renderSortOrderModal();
    });
  });
  document.getElementById("sortOrderSaveBtn").addEventListener("click", () => {
    renderCategoryTables();
    dsAddEditLog("4. 상품고객언어", "대분류/중분류/제조사 마스터 데이터 수정");
    sortOrderModal.hidden = true;
    showToast("변경사항이 저장되었습니다.");
  });
}

document.getElementById("sortOrderBtn").addEventListener("click", () => {
  renderSortOrderModal();
  sortOrderModal.hidden = false;
});
document.getElementById("sortOrderModalClose").addEventListener("click", () => { sortOrderModal.hidden = true; });

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

// 품목명 -> 상품코드 (1.상품구성에서 쓰는 SL 코드 체계와 연결) : 안분표 발송 기록을 상품별로 관리하기 위한 키
const ITEM_PRODUCT_CODE = {
  "신발장": "SL003",
  "원목마루": "SL031",
  "건식 벽체": "SL060",
  "상,하부장": "SL035",
};
allocationRows.forEach((r) => {
  r.productCode = ITEM_PRODUCT_CODE[r.item] || "SL000";
  r.sendLog = []; // 세일즈코드 기준 발송 기록 — 여러 번 발송해도 계속 누적만 됨 (재발송 제한 없음)
});

const allocationTableBody = document.getElementById("allocationTableBody");
const allocationSelectAll = document.getElementById("allocationSelectAll");

function renderAllocationTable() {
  allocationTableBody.innerHTML = allocationRows.map((r) => {
    const count = r.sendLog.length;
    const last = count ? r.sendLog[count - 1] : null;
    const statusHtml = count
      ? `<span class="send-status-badge sent" title="${r.sendLog.map((l) => `${l.batchName} · ${l.sentAt}`).join("\n")}">✔ 발송 ${count}회 (최근: ${last.batchName})</span>`
      : `<span class="send-status-badge unsent">미발송</span>`;
    return `
    <tr data-seq="${r.seq}">
      <td class="checkbox-col"><input type="checkbox" class="allocation-row-check" /></td>
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
      <td class="code-cell">${r.productCode}</td>
      <td>${r.item}</td>
      <td>${r.detail}</td>
      <td>${PRODUCT_OPTION_TIER[r.productCode] ? `${PRODUCT_OPTION_TIER[r.productCode]}단계` : "-"}</td>
      <td>${statusHtml}</td>
    </tr>
  `;
  }).join("");
  allocationSelectAll.checked = false;
  allocationSelectAll.indeterminate = false;
}
renderAllocationTable();

allocationSelectAll.addEventListener("change", () => {
  document.querySelectorAll(".allocation-row-check").forEach((cb) => { cb.checked = allocationSelectAll.checked; });
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
      대상 세일즈코드 : ${rows.length}건 (평형 ${pyeongs.length}종)
    </div>
    <div class="send-pyeong-tags">${rows.map((r) => `<span class="send-pyeong-tag">${r.sales}</span>`).join("")}</div>
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
    const sentAt = dsNowKorean();
    const sentBy = dsRoleName(dsGetCurrentRole());

    // 재발송 제한 없음: 기존 발송 여부와 무관하게 매번 새 발송 기록만 누적한다
    rows.forEach((r) => {
      r.sendLog.push({ batchName: name, sentAt, sentBy });
      recordSalesSend(r.sales, r.productCode, r.item, name, sentAt, sentBy);
    });

    const batch = {
      id: sendBatchSeq++,
      name,
      count: rows.length,
      pyeongs,
      salesCodes: rows.map((r) => r.sales),
      sentAt,
      sentBy,
    };
    sendBatches.unshift(batch);
    dsAddEditLog(
      "5. 안분표 생성",
      `「${name}」 ${rows.length}건을 분양수금 시스템으로 발송 (세일즈코드: ${rows.map((r) => r.sales).join(", ")})`
    );
    renderAllocationTable();
    renderSendHistory();
    sendModal.hidden = true;
    showToast(`「${name}」 ${rows.length}건이 분양수금 시스템으로 발송되었습니다.`);
  });

  sendModal.hidden = false;
}

// 세일즈코드별 발송 기록 — "발송 기록 관리" 필드. 재발송을 막지 않고 매번의 발송을
// 세일즈코드 기준으로 계속 누적 기록한다 (몇 번 보냈는지, 언제·어느 차수로 보냈는지).
const salesSendHistory = {}; // sales -> [{ productCode, item, batchName, sentAt, sentBy }]
function recordSalesSend(sales, productCode, item, batchName, sentAt, sentBy) {
  if (!salesSendHistory[sales]) salesSendHistory[sales] = [];
  salesSendHistory[sales].push({ productCode, item, batchName, sentAt, sentBy });
}

document.getElementById("allocationSendMenuItem").addEventListener("click", openSendModal);
sendModal.addEventListener("click", (e) => { if (e.target === sendModal) sendModal.hidden = true; });

const sendHistoryBtn = document.getElementById("sendHistoryBtn");
const sendHistoryPanel = document.getElementById("sendHistoryPanel");

function renderSendHistory() {
  const salesCodes = Object.keys(salesSendHistory);

  if (sendBatches.length === 0) {
    sendHistoryPanel.innerHTML = `<div class="notif-panel-title">안분표 발송 이력</div><div class="notif-item-empty">아직 발송한 차수가 없습니다.</div>`;
    return;
  }

  const salesSummaryHtml = `
    <div class="notif-panel-title">세일즈코드별 발송 기록 (${salesCodes.length}건 발송됨)</div>
    ${salesCodes.map((sales) => {
      const logs = salesSendHistory[sales];
      const last = logs[logs.length - 1];
      return `
        <div class="notif-item">
          <div class="notif-item-text">
            <span class="code-cell">${sales}</span> (${last.productCode} ${last.item})
            — <strong>발송 ${logs.length}회</strong>
          </div>
          <div class="notif-item-meta">
            ${logs.map((l) => `「${l.batchName}」 ${l.sentAt}`).join(" · ")}
          </div>
        </div>`;
    }).join("")}
  `;

  const batchHistoryHtml = `
    <div class="notif-panel-title">발송 차수 이력 (전체 ${sendBatches.length}건)</div>
    ${sendBatches.map((b) => `
      <div class="notif-item">
        <div class="notif-item-text">「${b.name}」 ${b.count}건 · 평형 ${b.pyeongs.join(", ")}</div>
        <div class="notif-item-meta">세일즈코드: ${b.salesCodes.join(", ")}</div>
        <div class="notif-item-meta">${b.sentBy} · ${b.sentAt}</div>
      </div>
    `).join("")}
  `;

  sendHistoryPanel.innerHTML = salesSummaryHtml + batchHistoryHtml;
}
renderSendHistory();

sendHistoryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  sendHistoryPanel.hidden = !sendHistoryPanel.hidden;
});
sendHistoryPanel.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => { sendHistoryPanel.hidden = true; });

/* =====================================================================
   5. 안분표 생성 : 패키지 만들기
   1) 현재안(패키지 만들기) : 평형 1개를 고른 뒤 그 평형의 상품후보만 보고 패키지 1개를 생성 — 그대로 유지.
   2) 개선안(공통 패키지 만들기) : 패키지를 구성할 상품을 한 번만 고르고, 적용할 평형을 여러 개
      체크해서 한 번에 일괄 생성한다 — 1.4에서 쓰는 pivotProducts(상품 후보)/pivotAssignments(평형별
      배정)/pyeongList(평형 목록)를 그대로 재사용해 "어느 평형에 어떤 상품이 있는지"를 새로 정의하지 않는다.
   ===================================================================== */
const PRODUCT_PRICE = {};
pivotProducts.forEach((p, i) => { PRODUCT_PRICE[p.code] = [10, 20, 30, 40, 50, 60][i % 6]; });

let packageSeq = 1;
const packages = []; // { id, code, name, pyeong, type, space, items, supply, vat, total, note, source, batchId, createdAt, createdBy }

function packageCandidateRowsHtml(candidates, selectedCodes, checkboxClass) {
  return candidates.map((p) => {
    const supply = PRODUCT_PRICE[p.code] || 10;
    const vat = Math.round(supply * 0.1);
    return `
      <tr>
        <td><input type="checkbox" class="${checkboxClass}" data-code="${p.code}" ${selectedCodes.has(p.code) ? "checked" : ""} /></td>
        <td class="code-cell">${p.code}</td>
        <td>${p.item}</td>
        <td>${p.itemCustomer}</td>
        <td>${supply}</td>
        <td>${vat}</td>
        <td>${supply + vat}</td>
      </tr>
    `;
  }).join("");
}

function calcPackageTotals(codes) {
  let supply = 0;
  codes.forEach((code) => { supply += PRODUCT_PRICE[code] || 10; });
  const vat = Math.round(supply * 0.1);
  return { supply, vat, total: supply + vat };
}

/* ---- 현재안 : 평형 1개 선택 → 그 평형의 후보 상품 선택 → 패키지 1개 생성 ---- */
const packageModal = document.getElementById("packageModal");
const packageModalBody = document.getElementById("packageModalBody");

function renderPackageModal() {
  const select = document.getElementById("pkgPyeongSelect");
  const pyeong = select ? select.value : pyeongList[0];
  const candidates = pivotProducts.filter((p) => pivotAssignments[pyeong] && pivotAssignments[pyeong].has(p.code));
  const checkedCodes = new Set([...document.querySelectorAll(".pkg-candidate-check:checked")].map((cb) => cb.dataset.code));
  const totals = calcPackageTotals([...checkedCodes]);
  const spaceOptions = [...new Set(pivotProducts.map((p) => p.space))];

  packageModalBody.innerHTML = `
    <div class="pkg-section">
      <div class="pkg-section-title">1 패키지 기본정보</div>
      <div class="pkg-section-body">
        <div class="pkg-field-row">
          <div class="pkg-field">
            <label>평형그룹</label>
            <select id="pkgPyeongSelect">${pyeongList.map((p) => `<option value="${p}" ${p === pyeong ? "selected" : ""}>${p}</option>`).join("")}</select>
          </div>
          <div class="pkg-field readonly"><label>고객스타일</label><input type="text" value="내추럴 모던 - Natural Modern" disabled /></div>
          <div class="pkg-field readonly"><label>평형옵션</label><input type="text" value="기본" disabled /></div>
        </div>
      </div>
    </div>

    <div class="pkg-section">
      <div class="pkg-section-title">2 패키지로 구성할 상품후보 <span>${candidates.length}건</span></div>
      <div class="pkg-section-body">
        <div class="pkg-table-scroll">
          <table class="pkg-table">
            <thead><tr><th></th><th>상품코드</th><th>품목명</th><th>항목명(고객용)</th><th>공급가(원)</th><th>부가세(원)</th><th>합계(원)</th></tr></thead>
            <tbody>${packageCandidateRowsHtml(candidates, checkedCodes, "pkg-candidate-check")}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="pkg-section">
      <div class="pkg-section-title">3 패키지 생성정보</div>
      <div class="pkg-section-body">
        <div class="pkg-field-row">
          <div class="pkg-field">
            <label>패키지타입</label>
            <div class="pkg-radio-group">
              <label><input type="radio" name="pkgType" value="스타일 패키지" checked /> 스타일 패키지</label>
              <label><input type="radio" name="pkgType" value="할인 패키지" /> 할인 패키지</label>
            </div>
          </div>
          <div class="pkg-field">
            <label>공간</label>
            <select id="pkgSpaceSelect">${spaceOptions.map((s) => `<option value="${s}">${s}</option>`).join("")}</select>
          </div>
        </div>
        <div class="pkg-field-row">
          <div class="pkg-field" style="flex:2">
            <label>품목명</label>
            <input type="text" id="pkgNameInput" value="패키지임시명칭-${pyeong}-${packageSeq}" />
          </div>
        </div>
        <div class="pkg-field-row">
          <div class="pkg-field"><label>비고</label><textarea id="pkgNoteInput" rows="2"></textarea></div>
        </div>
        <div class="pkg-summary">
          <span>선택 상품 <strong>${checkedCodes.size}건</strong></span>
          <span>공급가 합계 <strong>${totals.supply}원</strong></span>
          <span>부가세 합계 <strong>${totals.vat}원</strong></span>
          <span>판매가 합계 <strong>${totals.total}원</strong></span>
        </div>
      </div>
    </div>

    <div class="pkg-actions">
      <button class="toolbar-btn" id="packageCancelBtn" type="button">취소</button>
      <button class="primary-btn" id="packageCreateBtn" type="button">생성하기</button>
    </div>
  `;

  document.getElementById("pkgPyeongSelect").addEventListener("change", renderPackageModal);
  packageModalBody.querySelectorAll(".pkg-candidate-check").forEach((cb) => {
    cb.addEventListener("change", renderPackageModal);
  });
  document.getElementById("packageCancelBtn").addEventListener("click", () => { packageModal.hidden = true; });
  document.getElementById("packageCreateBtn").addEventListener("click", () => {
    const codes = [...document.querySelectorAll(".pkg-candidate-check:checked")].map((cb) => cb.dataset.code);
    if (codes.length === 0) { showToast("패키지에 포함할 상품을 선택해주세요."); return; }
    const items = candidates.filter((p) => codes.includes(p.code));
    const t = calcPackageTotals(codes);
    const id = packageSeq++;
    const pkg = {
      id,
      code: `PKG-${pyeong}-${String(id).padStart(3, "0")}`,
      name: document.getElementById("pkgNameInput").value.trim() || `패키지-${pyeong}`,
      pyeong,
      type: document.querySelector('input[name="pkgType"]:checked').value,
      space: document.getElementById("pkgSpaceSelect").value,
      items,
      supply: t.supply, vat: t.vat, total: t.total,
      note: document.getElementById("pkgNoteInput").value.trim(),
      source: "individual",
      batchId: null,
      createdAt: dsNowKorean(),
      createdBy: dsRoleName(dsGetCurrentRole()),
    };
    packages.unshift(pkg);
    dsAddEditLog("5. 안분표 생성", `패키지 「${pkg.name}」(${pyeong}) ${items.length}개 상품으로 생성`);
    renderPackageHistory();
    packageModal.hidden = true;
    showToast(`「${pkg.name}」 패키지가 생성되었습니다.`);
  });
}

document.getElementById("packageMenuItem").addEventListener("click", () => {
  allocationSettingsMenu.hidden = true;
  renderPackageModal();
  packageModal.hidden = false;
});
document.getElementById("packageModalClose").addEventListener("click", () => { packageModal.hidden = true; });

/* ---- 개선안 : 패키지를 구성할 상품을 한 번만 선택 → 적용할 평형을 여러 개 체크 → 일괄 생성 ---- */
const packageMapModal = document.getElementById("packageMapModal");
const packageMapModalBody = document.getElementById("packageMapModalBody");

function renderPackageMapModal() {
  const checkedCodes = new Set([...document.querySelectorAll(".pkgmap-candidate-check:checked")].map((cb) => cb.dataset.code));
  const checkedPyeongs = new Set([...document.querySelectorAll(".pkgmap-pyeong-check:checked")].map((cb) => cb.value));
  const totals = calcPackageTotals([...checkedCodes]);

  packageMapModalBody.innerHTML = `
    <div class="pkg-section">
      <div class="pkg-section-title">1 패키지 구성 상품 선택 <span>${pivotProducts.length}건 중 ${checkedCodes.size}건 선택</span></div>
      <div class="pkg-section-body">
        <div class="pkg-table-scroll">
          <table class="pkg-table">
            <thead><tr><th></th><th>상품코드</th><th>품목명</th><th>항목명(고객용)</th><th>공급가(원)</th><th>부가세(원)</th><th>합계(원)</th></tr></thead>
            <tbody>${packageCandidateRowsHtml(pivotProducts, checkedCodes, "pkgmap-candidate-check")}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="pkg-section">
      <div class="pkg-section-title">2 매핑할 평형 선택 <span>${pyeongList.length}종 중 ${checkedPyeongs.size}종 선택</span></div>
      <div class="pkg-section-body">
        <div class="pkg-pyeong-grid">
          ${pyeongList.map((p) => `
            <label class="pkg-pyeong-chip">
              <input type="checkbox" class="pkgmap-pyeong-check" value="${p}" ${checkedPyeongs.has(p) ? "checked" : ""} /> ${p}
            </label>
          `).join("")}
        </div>
      </div>
    </div>

    <div class="pkg-section">
      <div class="pkg-section-title">3 패키지 생성정보 (선택한 모든 평형에 동일하게 적용)</div>
      <div class="pkg-section-body">
        <div class="pkg-field-row">
          <div class="pkg-field">
            <label>패키지타입</label>
            <div class="pkg-radio-group">
              <label><input type="radio" name="pkgMapType" value="스타일 패키지" checked /> 스타일 패키지</label>
              <label><input type="radio" name="pkgMapType" value="할인 패키지" /> 할인 패키지</label>
            </div>
          </div>
          <div class="pkg-field" style="flex:2">
            <label>품목명(공통)</label>
            <input type="text" id="pkgMapNameInput" value="공통패키지-${packageSeq}" />
          </div>
        </div>
        <div class="pkg-field-row">
          <div class="pkg-field"><label>비고</label><textarea id="pkgMapNoteInput" rows="2"></textarea></div>
        </div>
        <div class="pkg-summary">
          <span>선택 상품 <strong>${checkedCodes.size}건</strong></span>
          <span>공급가 합계 <strong>${totals.supply}원</strong></span>
          <span>부가세 합계 <strong>${totals.vat}원</strong></span>
          <span>판매가 합계 <strong>${totals.total}원</strong></span>
          <span>적용 평형 <strong>${checkedPyeongs.size}종</strong></span>
        </div>
      </div>
    </div>

    <div class="pkg-actions">
      <button class="toolbar-btn" id="packageMapCancelBtn" type="button">취소</button>
      <button class="primary-btn" id="packageMapCreateBtn" type="button">선택 평형에 일괄 생성하기</button>
    </div>
  `;

  packageMapModalBody.querySelectorAll(".pkgmap-candidate-check, .pkgmap-pyeong-check").forEach((el) => {
    el.addEventListener("change", renderPackageMapModal);
  });
  document.getElementById("packageMapCancelBtn").addEventListener("click", () => { packageMapModal.hidden = true; });
  document.getElementById("packageMapCreateBtn").addEventListener("click", () => {
    const codes = [...document.querySelectorAll(".pkgmap-candidate-check:checked")].map((cb) => cb.dataset.code);
    const targetPyeongs = [...document.querySelectorAll(".pkgmap-pyeong-check:checked")].map((cb) => cb.value);
    if (codes.length === 0) { showToast("패키지에 포함할 상품을 선택해주세요."); return; }
    if (targetPyeongs.length === 0) { showToast("매핑할 평형을 선택해주세요."); return; }

    const items = pivotProducts.filter((p) => codes.includes(p.code));
    const t = calcPackageTotals(codes);
    const baseName = document.getElementById("pkgMapNameInput").value.trim() || "공통패키지";
    const type = document.querySelector('input[name="pkgMapType"]:checked').value;
    const note = document.getElementById("pkgMapNoteInput").value.trim();
    const batchId = packageSeq;
    const createdAt = dsNowKorean();
    const createdBy = dsRoleName(dsGetCurrentRole());

    targetPyeongs.forEach((pyeong) => {
      const id = packageSeq++;
      packages.unshift({
        id,
        code: `PKG-${pyeong}-${String(id).padStart(3, "0")}`,
        name: `${baseName} - ${pyeong}`,
        pyeong,
        type,
        space: "전체 공간 - General Area",
        items,
        supply: t.supply, vat: t.vat, total: t.total,
        note,
        source: "common-mapped",
        batchId,
        createdAt,
        createdBy,
      });
    });

    dsAddEditLog("5. 안분표 생성", `공통 패키지 「${baseName}」 ${items.length}개 상품을 ${targetPyeongs.length}개 평형(${targetPyeongs.join(", ")})에 일괄 생성`);
    renderPackageHistory();
    packageMapModal.hidden = true;
    showToast(`${targetPyeongs.length}개 평형에 일괄 생성되었습니다.`);
  });
}

document.getElementById("packageMapMenuItem").addEventListener("click", () => {
  allocationSettingsMenu.hidden = true;
  renderPackageMapModal();
  packageMapModal.hidden = false;
});
document.getElementById("packageMapModalClose").addEventListener("click", () => { packageMapModal.hidden = true; });

/* ---- 패키지 생성 이력 (현재안/개선안 공통) ---- */
const packageHistoryBtn = document.getElementById("packageHistoryBtn");
const packageHistoryPanel = document.getElementById("packageHistoryPanel");

function renderPackageHistory() {
  if (packages.length === 0) {
    packageHistoryPanel.innerHTML = `<div class="pkg-history-empty">아직 생성된 패키지가 없습니다.</div>`;
    return;
  }
  packageHistoryPanel.innerHTML = `
    <div class="notif-panel-title">패키지 생성 이력 (전체 ${packages.length}건)</div>
    ${packages.map((p) => `
      <div class="pkg-history-item">
        <div class="pkg-history-item-title">
          <span>${p.code} · ${p.name}</span>
          <span class="pkg-history-tag ${p.source === "common-mapped" ? "mapped" : ""}">${p.source === "common-mapped" ? "공통매핑" : "개별생성"}</span>
        </div>
        <div class="muted">평형 ${p.pyeong} · 상품 ${p.items.length}건 · 합계 ${p.total}원</div>
        <div class="muted">${p.createdBy} · ${p.createdAt}</div>
      </div>
    `).join("")}
  `;
}
renderPackageHistory();

packageHistoryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  packageHistoryPanel.hidden = !packageHistoryPanel.hidden;
});
packageHistoryPanel.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => { packageHistoryPanel.hidden = true; });

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
  s11: { badge: "프로덕트", verb: "프로덕트" },
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

// 1.1 프로덕트 : 소분류(PK)는 현장별 관리 항목이므로 다른 화면들과 동일하게
// 확정/재작업 프로세스로 잠금 처리한다 (엑셀 업로드·다른현장 불러오기는 편집이므로 잠금 대상,
// 엑셀 다운로드는 조회이므로 잠금과 무관하게 항상 가능하다).
function renderStage11Lock() {
  const s11 = dsLoad().stages.s11;
  const editable = s11.status === "editable";
  document.querySelectorAll(".stage11-editable-control").forEach((el) => { el.disabled = !editable; });
  const overlay = document.getElementById("stage11LockOverlay");
  const toolbarLeft = document.getElementById("stage11ToolbarLeft");
  if (s11.status === "locked") {
    overlay.hidden = false;
    overlay.querySelector(".lock-overlay-msg").textContent = `🔒 「${dsLoad().stages.s0.label}」 확정 후 작업할 수 있습니다.`;
    toolbarLeft.classList.add("disabled-group");
  } else {
    overlay.hidden = true;
    toolbarLeft.classList.toggle("disabled-group", !editable);
  }
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
  const targetKey = activeTab === "product" ? "s11" : activeTab === "mapping" ? "s13" : activeTab === "area" ? "s14" : null;

  if (!targetKey) {
    const s11 = stages.s11;
    const s13 = stages.s13;
    const s14 = stages.s14;
    box.innerHTML = `
      <div class="confirm-box compact">
        <div class="confirm-info">
          <p>1.1 프로덕트 : ${dsStatusLabel(s11.status)}${s11.confirmedAt ? " · " + s11.confirmedAt : ""}</p>
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
      document.getElementById("stageBoxReopenBtn").addEventListener("click", () => { if (dsPromptAndRequestReopen(targetKey)) renderEverything(); });
    } else if (s.status === "reopen_pending") {
      box.innerHTML = `
        <div class="stage-pending-badge">⏳ 잠금 해제 승인 대기 중 (${s.pendingApprovals.map((k) => dsRoleName(stages[k].owner)).join(", ")})</div>
        <button class="toolbar-btn" id="stageBoxCancelReopenBtn" ${isOwner ? "" : "disabled"}>요청 취소</button>`;
      document.getElementById("stageBoxCancelReopenBtn").addEventListener("click", () => { dsCancelReopenRequest(targetKey); renderEverything(); });
    }
  }

  renderStage11Lock();
  renderStage13Lock();
  renderMappingLock();
}

function renderStageBox(stageKey, containerId, verb, badgeText, upstreamKey, overlayId, toolbarLeftId) {
  const box = document.getElementById(containerId);
  const stages = dsLoad().stages;
  const s = stages[stageKey];
  const isOwner = dsGetCurrentRole() === s.owner;
  const upstream = stages[upstreamKey];

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
    document.getElementById(`${stageKey}ReopenBtn`).addEventListener("click", () => { if (dsPromptAndRequestReopen(stageKey)) renderEverything(); });
  } else if (s.status === "reopen_pending") {
    box.innerHTML = `
      <div class="stage-pending-badge">⏳ 잠금 해제 승인 대기 중 (${s.pendingApprovals.map((k) => dsRoleName(stages[k].owner)).join(", ")})</div>
      <button class="toolbar-btn" id="${stageKey}CancelReopenBtn" ${isOwner ? "" : "disabled"}>요청 취소</button>`;
    document.getElementById(`${stageKey}CancelReopenBtn`).addEventListener("click", () => { dsCancelReopenRequest(stageKey); renderEverything(); });
  }

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

// 4. 상품고객언어 : 체크박스/일괄수정 버튼처럼 lockable 영역 밖(floating-action)에
// 있는 개별 컨트롤은 stage3-editable-control 클래스로 별도 잠금 처리한다.
function renderStage3ExtraLock() {
  const editable = dsLoad().stages.s3.status === "editable";
  document.querySelectorAll(".stage3-editable-control").forEach((el) => { el.disabled = !editable; });
}

function renderAll() {
  renderStep1StageBox();
  renderStageBox("s2", "stage2Box", "원가", "원 가", "s14", "stage2LockOverlay", "stage2ToolbarLeft");
  renderStageBox("s4", "stage4Box", "판매가", "판매가", "s2", "stage4LockOverlay", "stage4ToolbarLeft");
  renderStageBox("s3", "stage3Box", "상품고객언어", "고객언어", "s4", "stage3LockOverlay", "stage3ToolbarLeft");
  renderStage3ExtraLock();
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

// 상태바의 단계 배지를 눌러 이동해 왔을 때(같은 페이지 내 이동 + 다른 페이지에서 넘어온 경우 모두) 해당 화면으로 전환
function applyStageNavigation(stageKey) {
  const goStep1Tab = (tab) => {
    document.querySelector('.nav-step[data-step="1"]').click();
    const tabBtn = document.querySelector(`.step-tab[data-tab="${tab}"]`);
    if (tabBtn) tabBtn.click();
  };
  const goStep = (step) => {
    const link = document.querySelector(`.nav-step[data-step="${step}"]`);
    if (link) link.click();
  };
  ({
    s11: () => goStep1Tab("product"),
    s13: () => goStep1Tab("mapping"),
    s14: () => goStep1Tab("area"),
    s2: () => goStep("2"),
    s4: () => goStep("3"),
    s3: () => goStep("4"),
  }[stageKey] || (() => {}))();
}

document.addEventListener("ds:goto-stage", (e) => applyStageNavigation(e.detail.stageKey));
const dsPendingGoto = dsConsumeGotoHash();
if (dsPendingGoto) applyStageNavigation(dsPendingGoto);
