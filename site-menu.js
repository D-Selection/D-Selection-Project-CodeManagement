/* =====================================================================
   site-menu.js — 현장 메뉴 전용 추가 스크립트.
   script.js(본사 화면과 동일한 파일, 수정하지 않음)가 먼저 전부 로드·실행된
   뒤에 로드된다. 전역으로 선언된 함수/변수(dsLoad, flatRows, products,
   PRODUCT_MASTER_CATALOG, renderEverything 등)를 그대로 재사용하거나
   재정의(override)해서 "본사 기능은 그대로 두고, 현장 메뉴에 필요한
   부분만 얹는다."
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) 현장 메뉴는 본사 승인 워크플로우(담당부서 확정/재작업)를 쓰지 않는다.
      별매 행사가 끝난 뒤에는 그 워크플로우 자체가 의미가 없으므로, 이
      현장 전용 저장소(dselection_site_state_v1)에서만 관련 단계를
      "editable"로 맞춰 두어 프로덕트/평형그룹매핑 등 모든 편집 컨트롤이
      항상 활성화되도록 한다. 본사 저장소는 건드리지 않는다.
   --------------------------------------------------------------------- */
(function ensureSiteStagesEditable() {
  const s = dsLoad();
  ["s11", "s13", "s14", "s3"].forEach((key) => {
    const stage = s.stages[key];
    if (stage.status !== "editable") {
      stage.status = "editable";
      stage.confirmedAt = null;
      stage.pendingApprovals = [];
      stage.justUnlocked = false;
    }
  });
  dsSave();
})();

/* 본사 담당부서 확정 UI(확정하기/확정 강제취소 박스)는 현장 메뉴에서는
   보여줄 필요가 없으므로 비워서 렌더링한다. 잠금 여부에 따라 컨트롤을
   활성/비활성화하는 renderStage11Lock 등 원래 함수는 그대로 둔다(위에서
   상태를 이미 "editable"로 맞췄으므로 자연히 모두 활성화된다). */
function renderStep1StageBox() {
  const box = document.getElementById("stage14Box");
  if (box) box.innerHTML = "";
  renderStage11Lock();
  renderStage13Lock();
  renderMappingLock();
}
function renderStageBox(stageKey, containerId) {
  const box = document.getElementById(containerId);
  if (box) box.innerHTML = "";
}
function renderAll() {
  renderStep1StageBox();
  renderStageBox("s2", "stage2Box");
  renderStageBox("s4", "stage4Box");
  renderStageBox("s3", "stage3Box");
  renderStage3ExtraLock();
}

/* ---------------------------------------------------------------------
   2) "본사 데이터 다시 불러오기" — 본사에서 확정한 소분류 마스터
      (DS_PRODUCT_MASTER_CATALOG)를 다시 가져와 현재 목록을 덮어쓴다.
      "다른현장 불러오기"와 동일한 잠금 규칙(s11 편집 가능할 때만)을 따른다.
   --------------------------------------------------------------------- */
document.getElementById("reloadFromHqBtn").addEventListener("click", () => {
  if (dsLoad().stages.s11.status !== "editable") return;
  products = PRODUCT_MASTER_CATALOG.slice();
  renderRows(products);
  dsAddEditLog("1.1 프로덕트(현장)", `본사 확정 소분류 마스터 ${products.length}건을 다시 불러와 반영`);
  showToast(`본사 데이터를 다시 불러왔습니다 (${products.length}건).`);
});

/* ---------------------------------------------------------------------
   3) 현장용 언어 재가공 — "분양 시 활용했던 용어를 현장에 맞게 재가공"하는
      기능은 1.1 프로덕트(소분류 단위)와 1.2 상품구성코드(상품 단위) 화면에
      각각 "현장 표기명" 오버레이 컬럼으로 둔다. 원본(본사 상품명/항목명
      (고객용))은 그대로 두고, 오버레이 값만 별도로 저장·초기화(↺)한다.
   --------------------------------------------------------------------- */

/* 3-1) 1.1 프로덕트 — 소분류(PK) 단위 현장 표기명 */
const siteProductNameOverrides = {};
function getSiteProductName(p) {
  if (!(p.code in siteProductNameOverrides)) siteProductNameOverrides[p.code] = p.name;
  return siteProductNameOverrides[p.code];
}
function isSiteProductNameOverridden(p) {
  return p.code in siteProductNameOverrides && siteProductNameOverrides[p.code] !== p.name;
}
function renderRows(list) {
  tableBody.innerHTML = list.map((p) => {
    const siteName = getSiteProductName(p);
    return `
    <tr>
      <td>${p.no}</td>
      <td class="code-cell">${p.majorCode}</td>
      <td>${p.majorName}</td>
      <td>${p.groupName || "-"}</td>
      <td>${p.midCode}</td>
      <td>${p.midName}</td>
      <td class="code-cell">${p.code}</td>
      <td>${p.name}</td>
      <td class="site-overlay-col">
        <div class="site-overlay-cell">
          <input type="text" class="site-overlay-input" data-code="${p.code}" data-kind="product" value="${siteName.replace(/"/g, "&quot;")}" />
          <button class="site-overlay-reset-btn" data-reset-code="${p.code}" data-reset-kind="product" ${isSiteProductNameOverridden(p) ? "" : "disabled"} title="본사 상품명으로 초기화">↺</button>
        </div>
      </td>
    </tr>`;
  }).join("");
  rowCount.textContent = list.length;
}
renderRows(products);

document.getElementById("tableBody").addEventListener("change", (e) => {
  const input = e.target.closest(".site-overlay-input[data-kind='product']");
  if (!input) return;
  siteProductNameOverrides[input.dataset.code] = input.value;
  dsAddEditLog("1.1 프로덕트(현장)", `${input.dataset.code} · 현장 표기명 → "${input.value}"`);
  renderRows(products);
});
document.getElementById("tableBody").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-reset-kind='product']");
  if (!btn || btn.disabled) return;
  const p = PRODUCT_MASTER_CATALOG.find((x) => x.code === btn.dataset.resetCode);
  if (!p) return;
  siteProductNameOverrides[p.code] = p.name;
  dsAddEditLog("1.1 프로덕트(현장)", `${p.code} · 현장 표기명을 본사 상품명으로 초기화`);
  renderRows(products);
});

/* 3-2) 1.2 상품구성코드 — 상품(SKU) 단위 현장 표기명.
   script.js에는 skuTableBody를 다시 그리는 함수가 없고(최초 1회만 렌더),
   여기서 별도 렌더 함수를 새로 만들어 그 자리를 대체한다. */
const siteSkuNameOverrides = {};
function getSiteSkuName(s) {
  if (!(s.code in siteSkuNameOverrides)) siteSkuNameOverrides[s.code] = s.itemCustomer;
  return siteSkuNameOverrides[s.code];
}
function isSiteSkuNameOverridden(s) {
  return s.code in siteSkuNameOverrides && siteSkuNameOverrides[s.code] !== s.itemCustomer;
}
function renderSkuTableSite() {
  document.getElementById("skuTableBody").innerHTML = skuData.map((s) => {
    const siteName = getSiteSkuName(s);
    return `
    <tr>
      <td class="code-cell">${s.code}</td>
      <td>${s.spaceCode}</td>
      <td>${s.space}</td>
      <td>${s.styleCode}</td>
      <td>${s.style}</td>
      <td>본사</td>
      <td>${skuProductChipsHtml(s.code)}</td>
      <td>${s.item}</td>
      <td class="site-overlay-col">
        <div class="site-overlay-cell">
          <input type="text" class="site-overlay-input" data-code="${s.code}" data-kind="sku" value="${siteName.replace(/"/g, "&quot;")}" />
          <button class="site-overlay-reset-btn" data-reset-code="${s.code}" data-reset-kind="sku" ${isSiteSkuNameOverridden(s) ? "" : "disabled"} title="본사 항목명(고객용)으로 초기화">↺</button>
        </div>
      </td>
    </tr>`;
  }).join("");
}
renderSkuTableSite();

document.getElementById("skuTableBody").addEventListener("change", (e) => {
  const input = e.target.closest(".site-overlay-input[data-kind='sku']");
  if (!input) return;
  siteSkuNameOverrides[input.dataset.code] = input.value;
  dsAddEditLog("1.2 상품구성코드(현장)", `${input.dataset.code} · 현장 표기명 → "${input.value}"`);
  renderSkuTableSite();
});
document.getElementById("skuTableBody").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-reset-kind='sku']");
  if (!btn || btn.disabled) return;
  const s = skuData.find((x) => x.code === btn.dataset.resetCode);
  if (!s) return;
  siteSkuNameOverrides[s.code] = s.itemCustomer;
  dsAddEditLog("1.2 상품구성코드(현장)", `${s.code} · 현장 표기명을 본사 항목명(고객용)으로 초기화`);
  renderSkuTableSite();
});

/* ---------------------------------------------------------------------
   4) 가감조건 관리 — 공간을 먼저 고르고, 그 공간의 상품(SKU)에 "안내문
      스텝"(우선순위)을 매기는 기능과, 같은 공간 안에서 서로 대체 관계인
      프로덕트들을 "카테고리(간섭 그룹)"로 묶으면 카테고리 안의 프로덕트들
      사이에 자동으로 상호 제외 규칙이 생기는 기능을 중심으로 재구성했다.
      상품(소분류)/프로덕트(대분류/중분류) 단위 수동 추가/제외 등록 기능은
      그대로 유지된다.
   --------------------------------------------------------------------- */
document.getElementById("gagamProductList").innerHTML = DS_PRODUCT_MASTER_CATALOG
  .map((p) => `<option value="${p.code}">${p.code} ${p.name}</option>`)
  .join("");

const GAGAM_LEVEL_LABEL = { sub: "소분류", major: "대분류", mid: "중분류" };

function resolveGagamEntity(level, code) {
  if (!code) return null;
  if (level === "sub") {
    const p = DS_PRODUCT_MASTER_CATALOG.find((x) => x.code === code);
    return p ? { code: p.code, name: p.name } : null;
  }
  if (level === "major") {
    const m = DS_PRODUCT_MAJORS_NEW.find((x) => x.code === code);
    return m ? { code: m.code, name: m.name } : null;
  }
  if (level === "mid") {
    const [majorCode, midCode] = code.split("-");
    const m = DS_PRODUCT_MIDS_NEW.find((x) => x.majorCode === majorCode && x.code === midCode);
    return m ? { code, name: `${m.majorCode} · ${m.name}` } : null;
  }
  return null;
}

let gagamSeq = 1;
const gagamConditions = [
  { id: gagamSeq++, priority: 1, triggerLevel: "sub", triggerCode: "AC-200-01", type: "add", targetLevel: "sub", targetCode: "AC-221-01", note: "주방수전 선택 시 수건걸이 기본 제공", createdAt: "2026-07-01" },
  { id: gagamSeq++, priority: 2, triggerLevel: "major", triggerCode: "CW", type: "remove", targetLevel: "mid", targetCode: "FN-501", note: "공사성(창호 등) 대분류 선택 시 현관중문 슬라이딩 도어 중분류는 전체 제외", createdAt: "2026-07-01" },
  { id: gagamSeq++, priority: 3, triggerLevel: "sub", triggerCode: "AC-216-01", type: "remove", targetLevel: "sub", targetCode: "AC-218-01", note: "비데일체형 양변기 선택 시 분리형 비데는 제외", createdAt: "2026-07-01" },
];

function gagamToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ---- 공간 목록 & 선택 상태 (모든 공간 하위 섹션이 공유) ---- */
const gagamSpaces = [...new Set(skuData.map((s) => s.space))];
let gagamSelectedSpace = gagamSpaces[0] || "";

/* ---- 1. 안내문 스텝(우선순위) : 공간 안 상품(SKU)별로 관리, 별매품
   단계(PRODUCT_OPTION_TIER)와는 별개의 값이다. ---- */
const gagamPriority = { SL003: 1, SL001: 2, SL006: 3 };

function renderGagamSpaceTabs() {
  document.getElementById("gagamSpaceTabs").innerHTML = gagamSpaces.map((sp) => `
    <button type="button" class="gagam-space-tab ${sp === gagamSelectedSpace ? "active" : ""}" data-space="${sp}">${sp}</button>
  `).join("");
}

function renderGagamStepSection() {
  const items = skuData.filter((s) => s.space === gagamSelectedSpace);
  const sorted = [...items].sort((a, b) => (gagamPriority[a.code] ?? Infinity) - (gagamPriority[b.code] ?? Infinity));
  document.getElementById("gagamStepCount").textContent = `${items.length}개`;
  document.getElementById("gagamStepBody").innerHTML = sorted.map((s) => `
    <tr data-code="${s.code}">
      <td><input type="number" class="gagam-step-input" data-code="${s.code}" min="1" value="${gagamPriority[s.code] ?? ""}" placeholder="-" /></td>
      <td class="code-cell">${s.code}</td>
      <td>${s.item}</td>
    </tr>
  `).join("");
}

document.getElementById("gagamStepBody").addEventListener("change", (e) => {
  const input = e.target.closest(".gagam-step-input");
  if (!input) return;
  const code = input.dataset.code;
  const raw = input.value.trim();
  if (raw === "") delete gagamPriority[code];
  else gagamPriority[code] = Math.max(1, Number(raw) || 1);
  dsAddEditLog("가감조건 관리", `${code} 안내문 스텝을 ${raw === "" ? "미지정" : raw}(으)로 변경`);
  renderGagamStepSection();
});

/* ---- 2. 프로덕트 카테고리(간섭 그룹) : 같은 카테고리의 프로덕트끼리는
   서로 대체 관계라 동시에 선택될 수 없으므로, 저장 즉시 모든 순서쌍에
   대해 상호 "제외" 규칙을 자동 생성한다(autoCategoryId로 추적). ---- */
let gagamCategorySeq = 1;
const gagamCategories = [
  { id: gagamCategorySeq++, space: "현관 - Entrance", name: "현관중문 도어 방식", codes: ["FN-501-01", "FN-500-01", "FN-502-01"] },
];

function gagamRegenerateCategoryConditions(category) {
  for (let i = gagamConditions.length - 1; i >= 0; i--) {
    if (gagamConditions[i].autoCategoryId === category.id) gagamConditions.splice(i, 1);
  }
  category.codes.forEach((a) => {
    category.codes.forEach((b) => {
      if (a === b) return;
      gagamConditions.push({
        id: gagamSeq++,
        priority: 900,
        triggerLevel: "sub", triggerCode: a,
        type: "remove",
        targetLevel: "sub", targetCode: b,
        note: `카테고리 "${category.name}" 상호 제외 (자동)`,
        createdAt: gagamToday(),
        autoCategoryId: category.id,
      });
    });
  });
}
gagamCategories.forEach(gagamRegenerateCategoryConditions);

function renderGagamCategoryList() {
  const list = gagamCategories.filter((c) => c.space === gagamSelectedSpace);
  document.getElementById("gagamCategoryCount").textContent = `${list.length}개`;
  document.getElementById("gagamCategoryList").innerHTML = list.length === 0
    ? `<div class="gagam-category-empty">이 공간에 등록된 카테고리가 없습니다.</div>`
    : list.map((c) => `
      <div class="gagam-category-card" data-id="${c.id}">
        <div class="gagam-category-card-head">
          <strong>${c.name}</strong>
          <span class="gagam-category-card-actions">
            <button type="button" class="gagam-edit-btn" data-edit-category="${c.id}">수정</button>
            <button type="button" class="gagam-delete-btn" data-delete-category="${c.id}">삭제</button>
          </span>
        </div>
        <div class="gagam-category-chips">
          ${c.codes.map((code) => {
            const p = DS_PRODUCT_MASTER_CATALOG.find((x) => x.code === code);
            return `<span class="gagam-category-chip"><span class="code-cell">${code}</span> ${p ? p.name : "알 수 없음"}</span>`;
          }).join("")}
        </div>
      </div>
    `).join("");
}

let gagamCategoryEditingId = null;
const gagamCategoryModal = document.getElementById("gagamCategoryModal");
const gagamCategoryModalBody = document.getElementById("gagamCategoryModalBody");
const gagamCategoryModalHeader = document.getElementById("gagamCategoryModalHeader");

function renderGagamCategoryMembers(codes) {
  const el = document.getElementById("gagamCategoryMembers");
  el.innerHTML = codes.length === 0
    ? `<div class="gagam-category-empty">아직 추가된 프로덕트가 없습니다.</div>`
    : codes.map((code) => {
      const p = DS_PRODUCT_MASTER_CATALOG.find((x) => x.code === code);
      return `<span class="gagam-category-chip"><span class="code-cell">${code}</span> ${p ? p.name : code}
        <button type="button" class="gagam-category-chip-remove" data-remove-code="${code}">✕</button>
      </span>`;
    }).join("");
}

function gagamAutoCategoryName(codes) {
  const names = codes.map((code) => {
    const p = DS_PRODUCT_MASTER_CATALOG.find((x) => x.code === code);
    return p ? p.name : code;
  });
  return names.length <= 2 ? names.join(" · ") : `${names[0]} 외 ${names.length - 1}개`;
}

function openGagamCategoryModal(editing) {
  gagamCategoryEditingId = editing ? editing.id : null;
  let workingCodes = editing ? [...editing.codes] : [];
  gagamCategoryModalHeader.innerHTML = `${editing ? "✎ 간섭 프로덕트 수정" : "➕ 간섭 프로덕트 선택"} <button class="cmodal-close" id="gagamCategoryModalClose" type="button">✕</button>`;
  gagamCategoryModalBody.innerHTML = `
    <div class="lang-edit-field">
      <label>「${gagamSelectedSpace}」 안에서 서로 대체 관계라 동시에 선택될 수 없는 프로덕트를 골라주세요 (2개 이상). 완료하면 카테고리가 자동으로 만들어집니다.</label>
      <div class="gagam-category-members" id="gagamCategoryMembers"></div>
    </div>
    <div class="lang-edit-field">
      <label>프로덕트 코드/상품명으로 검색</label>
      <input type="text" id="gagamCategorySearchInput" class="sku-product-search-input" placeholder="코드 또는 상품명으로 검색" autocomplete="off" />
      <div class="sku-product-results" id="gagamCategoryProductResults"></div>
    </div>
    <div class="lang-edit-error" id="gagamCategoryError" hidden></div>
    <div class="lang-edit-actions">
      <button class="toolbar-btn" id="gagamCategoryCancelBtn" type="button">취소</button>
      <button class="primary-btn" id="gagamCategorySaveBtn" type="button">완료</button>
    </div>
  `;
  renderGagamCategoryMembers(workingCodes);
  gagamCategoryModal.hidden = false;

  function renderGagamCategorySearchResults(query) {
    const q = (query || "").trim().toLowerCase();
    const resultsEl = document.getElementById("gagamCategoryProductResults");
    if (!q) { resultsEl.innerHTML = `<div class="sku-product-results-hint">코드 또는 상품명으로 검색해보세요.</div>`; return; }
    const matches = DS_PRODUCT_MASTER_CATALOG
      .filter((p) => [p.code, p.name, p.majorName, p.midName].join(" ").toLowerCase().includes(q))
      .slice(0, 30);
    resultsEl.innerHTML = matches.length === 0
      ? `<div class="sku-product-results-hint">일치하는 프로덕트가 없습니다.</div>`
      : matches.map((p) => `
        <button type="button" class="sku-product-result ${workingCodes.includes(p.code) ? "selected" : ""}" data-toggle-code="${p.code}">
          <span class="code-cell">${p.code}</span>
          <span class="sku-product-result-name">${p.name}</span>
          <span class="sku-product-result-cat">${p.majorName} · ${p.midName}</span>
          ${workingCodes.includes(p.code) ? `<span class="sku-product-result-check">✓ 선택됨</span>` : ""}
        </button>
      `).join("");
  }

  document.getElementById("gagamCategoryModalClose").addEventListener("click", () => { gagamCategoryModal.hidden = true; });
  document.getElementById("gagamCategoryCancelBtn").addEventListener("click", () => { gagamCategoryModal.hidden = true; });
  document.getElementById("gagamCategorySearchInput").addEventListener("input", (e) => renderGagamCategorySearchResults(e.target.value));
  document.getElementById("gagamCategoryProductResults").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-toggle-code]");
    if (!btn) return;
    const code = btn.dataset.toggleCode;
    if (workingCodes.includes(code)) workingCodes = workingCodes.filter((c) => c !== code);
    else workingCodes.push(code);
    renderGagamCategoryMembers(workingCodes);
    renderGagamCategorySearchResults(document.getElementById("gagamCategorySearchInput").value);
  });
  document.getElementById("gagamCategoryMembers").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-code]");
    if (!btn) return;
    workingCodes = workingCodes.filter((c) => c !== btn.dataset.removeCode);
    renderGagamCategoryMembers(workingCodes);
    renderGagamCategorySearchResults(document.getElementById("gagamCategorySearchInput").value);
  });

  document.getElementById("gagamCategorySaveBtn").addEventListener("click", () => {
    const errorEl = document.getElementById("gagamCategoryError");
    errorEl.hidden = true;
    if (workingCodes.length < 2) { errorEl.hidden = false; errorEl.textContent = "❌ 서로 배타적인 프로덕트를 2개 이상 선택해주세요."; return; }
    const space = gagamSelectedSpace;
    const name = gagamAutoCategoryName(workingCodes);

    let category;
    if (gagamCategoryEditingId) {
      category = gagamCategories.find((c) => c.id === gagamCategoryEditingId);
      Object.assign(category, { space, name, codes: [...workingCodes] });
      dsAddEditLog("가감조건 관리", `카테고리 "${name}" 수정 (${workingCodes.length}건)`);
    } else {
      category = { id: gagamCategorySeq++, space, name, codes: [...workingCodes] };
      gagamCategories.push(category);
      dsAddEditLog("가감조건 관리", `카테고리 "${name}" 신규 등록 (${workingCodes.length}건) — 상호 제외 규칙 자동 생성`);
    }
    gagamRegenerateCategoryConditions(category);
    gagamCategoryModal.hidden = true;
    renderGagamAll();
    showToast(`선택한 프로덕트 ${workingCodes.length}개가 카테고리로 묶였고, 상호 제외 규칙 ${workingCodes.length * (workingCodes.length - 1)}건이 자동 생성되었습니다.`);
  });
}

document.getElementById("gagamCategoryAddBtn").addEventListener("click", () => openGagamCategoryModal(null));
document.getElementById("gagamCategoryList").addEventListener("click", (e) => {
  const editBtn = e.target.closest("[data-edit-category]");
  if (editBtn) {
    const c = gagamCategories.find((x) => x.id === Number(editBtn.dataset.editCategory));
    if (c) openGagamCategoryModal(c);
    return;
  }
  const delBtn = e.target.closest("[data-delete-category]");
  if (delBtn) {
    const id = Number(delBtn.dataset.deleteCategory);
    const c = gagamCategories.find((x) => x.id === id);
    if (!c) return;
    if (!window.confirm(`카테고리 "${c.name}"을(를) 삭제할까요? 자동 생성된 상호 제외 규칙도 함께 삭제됩니다.`)) return;
    for (let i = gagamConditions.length - 1; i >= 0; i--) {
      if (gagamConditions[i].autoCategoryId === id) gagamConditions.splice(i, 1);
    }
    gagamCategories.splice(gagamCategories.findIndex((x) => x.id === id), 1);
    dsAddEditLog("가감조건 관리", `카테고리 "${c.name}" 삭제 (상호 제외 규칙도 함께 삭제)`);
    renderGagamAll();
  }
});

function gagamValueFieldHtml(prefix, fieldId, level, code) {
  if (level === "major") {
    return `<label>${prefix} 대분류</label>
      <select id="${fieldId}">
        ${DS_PRODUCT_MAJORS_NEW.map((m) => `<option value="${m.code}" ${m.code === code ? "selected" : ""}>${m.code} · ${m.name}</option>`).join("")}
      </select>`;
  }
  if (level === "mid") {
    return `<label>${prefix} 중분류</label>
      <select id="${fieldId}">
        ${DS_PRODUCT_MIDS_NEW.map((m) => {
          const v = `${m.majorCode}-${m.code}`;
          return `<option value="${v}" ${v === code ? "selected" : ""}>${m.majorCode} · ${m.code} ${m.name}</option>`;
        }).join("")}
      </select>`;
  }
  return `<label>${prefix} 소분류코드(PK)</label>
    <input type="text" id="${fieldId}" list="gagamProductList" placeholder="예: AC-200-01" value="${code || ""}" />`;
}

function gagamRowHtml(c) {
  const trigger = resolveGagamEntity(c.triggerLevel, c.triggerCode);
  const target = resolveGagamEntity(c.targetLevel, c.targetCode);
  const isAuto = !!c.autoCategoryId;
  const category = isAuto ? gagamCategories.find((x) => x.id === c.autoCategoryId) : null;
  return `
    <tr data-id="${c.id}">
      <td>${isAuto
        ? `<span class="gagam-priority-readonly">${c.priority}</span>`
        : `<input type="number" class="gagam-priority-input" data-id="${c.id}" value="${c.priority}" min="1" />`}</td>
      <td><span class="gagam-level-tag">${GAGAM_LEVEL_LABEL[c.triggerLevel]}</span></td>
      <td class="code-cell">${c.triggerCode}</td>
      <td>${trigger ? trigger.name : `<span class="muted">알 수 없음</span>`}</td>
      <td><span class="tag-condition ${c.type}">${c.type === "add" ? "추가" : "제외"}</span></td>
      <td><span class="gagam-level-tag">${GAGAM_LEVEL_LABEL[c.targetLevel]}</span></td>
      <td class="code-cell">${c.targetCode}</td>
      <td>${target ? target.name : `<span class="muted">알 수 없음</span>`}</td>
      <td>${isAuto ? `<span class="gagam-source-auto">카테고리: ${category ? category.name : "-"}</span>` : `<span class="gagam-source-manual">수동 등록</span>`}</td>
      <td>${c.note || `<span class="muted">-</span>`}</td>
      <td>${c.createdAt}</td>
      <td class="gagam-row-actions">
        ${isAuto
          ? `<span class="muted">카테고리에서 관리</span>`
          : `<button class="gagam-edit-btn" data-edit-id="${c.id}">수정</button><button class="gagam-delete-btn" data-delete-id="${c.id}">삭제</button>`}
      </td>
    </tr>`;
}

function renderGagamTable(filterText) {
  const q = (filterText || "").trim().toLowerCase();
  const sorted = [...gagamConditions].sort((a, b) => a.priority - b.priority);
  const list = !q ? sorted : sorted.filter((c) => {
    const trigger = resolveGagamEntity(c.triggerLevel, c.triggerCode);
    const target = resolveGagamEntity(c.targetLevel, c.targetCode);
    return [c.triggerCode, c.targetCode, c.note, trigger && trigger.name, target && target.name]
      .filter(Boolean).join(" ").toLowerCase().includes(q);
  });
  document.getElementById("gagamTableBody").innerHTML = list.map(gagamRowHtml).join("");
  document.getElementById("gagamCount").textContent = `${list.length}개`;
}

document.getElementById("gagamSearchInput").addEventListener("input", (e) => renderGagamTable(e.target.value));

document.getElementById("gagamTableBody").addEventListener("change", (e) => {
  const input = e.target.closest(".gagam-priority-input");
  if (!input) return;
  const row = gagamConditions.find((c) => c.id === Number(input.dataset.id));
  const newPriority = Math.max(1, Number(input.value) || 1);
  row.priority = newPriority;
  dsAddEditLog("가감조건 관리", `${row.triggerCode} → ${row.targetCode} 조건의 우선순위를 ${newPriority}(으)로 변경`);
  renderGagamTable(document.getElementById("gagamSearchInput").value);
});

document.getElementById("gagamSpaceTabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".gagam-space-tab");
  if (!btn) return;
  gagamSelectedSpace = btn.dataset.space;
  renderGagamAll();
});

function renderGagamAll() {
  renderGagamSpaceTabs();
  renderGagamStepSection();
  renderGagamCategoryList();
  renderGagamTable(document.getElementById("gagamSearchInput").value);
}
renderGagamAll();

function openGagamModal(editing) {
  gagamEditingId = editing ? editing.id : null;
  const triggerLevel = editing ? editing.triggerLevel : "sub";
  const targetLevel = editing ? editing.targetLevel : "sub";
  const manualConditions = gagamConditions.filter((c) => !c.autoCategoryId);
  const nextPriority = manualConditions.length ? Math.max(...manualConditions.map((c) => c.priority)) + 1 : 1;

  gagamModalHeader.innerHTML = `${editing ? "✎ 가감조건 수정" : "➕ 가감조건 추가"} <button class="cmodal-close" id="gagamModalClose" type="button">✕</button>`;
  gagamModalBody.innerHTML = `
    <div class="lang-edit-field">
      <label>기준 단위 (조건이 발생하는 대상)</label>
      <select id="gagamTriggerLevel">
        <option value="sub" ${triggerLevel === "sub" ? "selected" : ""}>소분류(PK)</option>
        <option value="major" ${triggerLevel === "major" ? "selected" : ""}>대분류</option>
        <option value="mid" ${triggerLevel === "mid" ? "selected" : ""}>중분류</option>
      </select>
    </div>
    <div class="lang-edit-field" id="gagamTriggerValueWrap">
      ${gagamValueFieldHtml("기준", "gagamTriggerCode", triggerLevel, editing ? editing.triggerCode : "")}
    </div>
    <div class="lang-edit-field">
      <label>조건구분</label>
      <select id="gagamType">
        <option value="add" ${editing && editing.type === "add" ? "selected" : ""}>추가</option>
        <option value="remove" ${editing && editing.type === "remove" ? "selected" : ""}>제외</option>
      </select>
    </div>
    <div class="lang-edit-field">
      <label>대상 단위 (자동으로 추가/제외될 대상)</label>
      <select id="gagamTargetLevel">
        <option value="sub" ${targetLevel === "sub" ? "selected" : ""}>소분류(PK)</option>
        <option value="major" ${targetLevel === "major" ? "selected" : ""}>대분류</option>
        <option value="mid" ${targetLevel === "mid" ? "selected" : ""}>중분류</option>
      </select>
    </div>
    <div class="lang-edit-field" id="gagamTargetValueWrap">
      ${gagamValueFieldHtml("대상", "gagamTargetCode", targetLevel, editing ? editing.targetCode : "")}
    </div>
    <div class="lang-edit-field">
      <label>우선순위</label>
      <input type="number" id="gagamPriority" min="1" value="${editing ? editing.priority : nextPriority}" />
      <div class="field-hint">숫자가 작을수록 먼저 적용됩니다. 같은 기준상품에 여러 조건이 겹칠 때 순서를 정합니다.</div>
    </div>
    <div class="lang-edit-field">
      <label>비고</label>
      <input type="text" id="gagamNote" placeholder="자유롭게 입력" value="${editing ? (editing.note || "") : ""}" />
    </div>
    <div class="lang-edit-error" id="gagamError" hidden></div>
    <div class="lang-edit-actions">
      <button class="toolbar-btn" id="gagamCancelBtn" type="button">취소</button>
      <button class="primary-btn" id="gagamSaveBtn" type="button">저장</button>
    </div>
  `;
  gagamModal.hidden = false;

  document.getElementById("gagamModalClose").addEventListener("click", () => { gagamModal.hidden = true; });
  document.getElementById("gagamCancelBtn").addEventListener("click", () => { gagamModal.hidden = true; });
  document.getElementById("gagamSaveBtn").addEventListener("click", saveGagamModal);
  document.getElementById("gagamTriggerLevel").addEventListener("change", (e) => {
    document.getElementById("gagamTriggerValueWrap").innerHTML = gagamValueFieldHtml("기준", "gagamTriggerCode", e.target.value, "");
  });
  document.getElementById("gagamTargetLevel").addEventListener("change", (e) => {
    document.getElementById("gagamTargetValueWrap").innerHTML = gagamValueFieldHtml("대상", "gagamTargetCode", e.target.value, "");
  });
}

function saveGagamModal() {
  const errorEl = document.getElementById("gagamError");
  errorEl.hidden = true;
  const triggerLevel = document.getElementById("gagamTriggerLevel").value;
  const triggerCode = document.getElementById("gagamTriggerCode").value.trim();
  const type = document.getElementById("gagamType").value;
  const targetLevel = document.getElementById("gagamTargetLevel").value;
  const targetCode = document.getElementById("gagamTargetCode").value.trim();
  const priority = Math.max(1, Number(document.getElementById("gagamPriority").value) || 1);
  const note = document.getElementById("gagamNote").value.trim();

  const trigger = resolveGagamEntity(triggerLevel, triggerCode);
  const target = resolveGagamEntity(targetLevel, targetCode);
  if (!trigger || !target) {
    errorEl.hidden = false;
    errorEl.textContent = `❌ 기준/대상 코드는 선택한 단위(소분류/대분류/중분류)에 실제로 등록된 코드여야 합니다.`;
    return;
  }
  if (triggerLevel === targetLevel && triggerCode === targetCode) {
    errorEl.hidden = false;
    errorEl.textContent = `❌ 기준과 대상은 서로 달라야 합니다.`;
    return;
  }

  if (gagamEditingId) {
    const row = gagamConditions.find((c) => c.id === gagamEditingId);
    Object.assign(row, { triggerLevel, triggerCode, type, targetLevel, targetCode, priority, note });
    dsAddEditLog("가감조건 관리", `${triggerCode} → ${targetCode} (${type === "add" ? "추가" : "제외"}) 조건 수정`);
  } else {
    gagamConditions.push({ id: gagamSeq++, priority, triggerLevel, triggerCode, type, targetLevel, targetCode, note, createdAt: gagamToday() });
    dsAddEditLog("가감조건 관리", `${triggerCode} → ${targetCode} (${type === "add" ? "추가" : "제외"}) 조건 신규 등록`);
  }
  gagamModal.hidden = true;
  renderGagamTable(document.getElementById("gagamSearchInput").value);
  showToast("가감조건이 저장되었습니다.");
}

document.getElementById("gagamAddBtn").addEventListener("click", () => openGagamModal(null));

document.getElementById("gagamTableBody").addEventListener("click", (e) => {
  const editBtn = e.target.closest("[data-edit-id]");
  if (editBtn) {
    const row = gagamConditions.find((c) => c.id === Number(editBtn.dataset.editId));
    if (row) openGagamModal(row);
    return;
  }
  const delBtn = e.target.closest("[data-delete-id]");
  if (delBtn) {
    const id = Number(delBtn.dataset.deleteId);
    const row = gagamConditions.find((c) => c.id === id);
    if (!row) return;
    if (!window.confirm(`${row.triggerCode} → ${row.targetCode} 가감조건을 삭제할까요?`)) return;
    const idx = gagamConditions.findIndex((c) => c.id === id);
    gagamConditions.splice(idx, 1);
    dsAddEditLog("가감조건 관리", `${row.triggerCode} → ${row.targetCode} (${row.type === "add" ? "추가" : "제외"}) 조건 삭제`);
    renderGagamTable(document.getElementById("gagamSearchInput").value);
  }
});

/* 위 오버라이드들을 실제 화면에 즉시 반영 (script.js가 자기 자신을 로드하며
   이미 한 번 renderEverything()을 호출했으므로, 재정의된 함수들로 다시
   그린다). */
renderEverything();
