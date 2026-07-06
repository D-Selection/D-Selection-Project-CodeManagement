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
      "editable"로 맞춰 두어 프로덕트/평형그룹매핑/고객언어 등 모든 편집
      컨트롤이 항상 활성화되도록 한다. 본사 저장소는 건드리지 않는다.
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
   3) 4. 상품고객언어 : 현장 전용 고객언어 오버레이
      분양 시 값(flatRows의 itemCustomer/detailCustomer)은 그대로 두고,
      "현장 표기명/현장 세부사항" 2개 컬럼만 별도 상태(siteLangOverrides)로
      관리한다. 처음에는 분양 시 값을 그대로 복사해 보여주고, 현장에서
      수정하면 그 값만 바뀌며 원본은 영향받지 않는다.
   --------------------------------------------------------------------- */
const siteLangOverrides = {};
function getSiteLangOverride(row) {
  if (!siteLangOverrides[row.seq]) {
    siteLangOverrides[row.seq] = { itemCustomer: row.itemCustomer, detailCustomer: row.detailCustomer };
  }
  return siteLangOverrides[row.seq];
}
function isSiteLangOverridden(row) {
  const o = siteLangOverrides[row.seq];
  return !!o && (o.itemCustomer !== row.itemCustomer || o.detailCustomer !== row.detailCustomer);
}

function siteOverlayCellHtml(seq, field, value, overridden) {
  return `
    <td class="site-overlay-col">
      <div class="site-overlay-cell">
        <input type="text" class="site-overlay-input" data-seq="${seq}" data-field="${field}" value="${value.replace(/"/g, "&quot;")}" />
        <button class="site-overlay-reset-btn" data-reset-seq="${seq}" data-reset-field="${field}" ${overridden ? "" : "disabled"} title="분양 시 값으로 초기화">↺</button>
      </div>
    </td>`;
}

function renderLangTable() {
  document.getElementById("langTableBody").innerHTML = flatRows.map((r) => {
    const o = getSiteLangOverride(r);
    return `
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
      ${siteOverlayCellHtml(r.seq, "itemCustomer", o.itemCustomer, isSiteLangOverridden(r))}
      ${siteOverlayCellHtml(r.seq, "detailCustomer", o.detailCustomer, isSiteLangOverridden(r))}
    </tr>`;
  }).join("");
  renderStage3ExtraLock();
}
renderLangTable();

document.getElementById("langTableBody").addEventListener("change", (e) => {
  const input = e.target.closest(".site-overlay-input");
  if (!input) return;
  const row = flatRows.find((r) => r.seq === Number(input.dataset.seq));
  const o = getSiteLangOverride(row);
  o[input.dataset.field] = input.value;
  dsAddEditLog("현장 상품고객언어", `순번 ${row.seq} · ${input.dataset.field === "itemCustomer" ? "현장 표기명" : "현장 세부사항"} → "${input.value}"`);
  renderLangTable();
});

document.getElementById("langTableBody").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-reset-seq]");
  if (!btn || btn.disabled) return;
  const row = flatRows.find((r) => r.seq === Number(btn.dataset.resetSeq));
  const o = getSiteLangOverride(row);
  o[btn.dataset.resetField] = row[btn.dataset.resetField];
  dsAddEditLog("현장 상품고객언어", `순번 ${row.seq} · ${btn.dataset.resetField === "itemCustomer" ? "현장 표기명" : "현장 세부사항"}을 분양 시 값으로 초기화`);
  renderLangTable();
});

/* ---------------------------------------------------------------------
   4) 가감조건 관리 — 상품 간 자동 추가/제외 규칙.
      DS_PRODUCT_MASTER_CATALOG(1.1 프로덕트 소분류 마스터)에서 기준/대상
      상품을 코드로 찾아 이름을 함께 보여준다.
   --------------------------------------------------------------------- */
document.getElementById("gagamProductList").innerHTML = DS_PRODUCT_MASTER_CATALOG
  .map((p) => `<option value="${p.code}">${p.code} ${p.name}</option>`)
  .join("");

function findGagamProduct(code) {
  return DS_PRODUCT_MASTER_CATALOG.find((p) => p.code === code);
}

let gagamSeq = 1;
const gagamConditions = [
  { id: gagamSeq++, triggerCode: "AC-001-01", type: "add", targetCode: "AC-005-01", note: "주방수전 선택 시 수건걸이 기본 제공", createdAt: "2026-07-01" },
  { id: gagamSeq++, triggerCode: "AC-003-04", type: "remove", targetCode: "AC-003-06", note: "비데일체형 양변기 선택 시 분리형 비데는 제외", createdAt: "2026-07-01" },
  { id: gagamSeq++, triggerCode: "FN-002-04", type: "add", targetCode: "FN-002-01", note: "슬라이딩 도어 선택 시 예비 스윙 도어 부속 추가", createdAt: "2026-07-02" },
];

function gagamToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

let gagamEditingId = null;
const gagamModal = document.getElementById("gagamModal");
const gagamModalBody = document.getElementById("gagamModalBody");
const gagamModalHeader = document.getElementById("gagamModalHeader");

function gagamRowHtml(c) {
  const trigger = findGagamProduct(c.triggerCode);
  const target = findGagamProduct(c.targetCode);
  return `
    <tr data-id="${c.id}">
      <td>${c.id}</td>
      <td class="code-cell">${c.triggerCode}</td>
      <td>${trigger ? trigger.name : `<span class="muted">알 수 없음</span>`}</td>
      <td><span class="tag-condition ${c.type}">${c.type === "add" ? "추가" : "제외"}</span></td>
      <td class="code-cell">${c.targetCode}</td>
      <td>${target ? target.name : `<span class="muted">알 수 없음</span>`}</td>
      <td>${c.note || `<span class="muted">-</span>`}</td>
      <td>${c.createdAt}</td>
      <td class="gagam-row-actions">
        <button class="gagam-edit-btn" data-edit-id="${c.id}">수정</button>
        <button class="gagam-delete-btn" data-delete-id="${c.id}">삭제</button>
      </td>
    </tr>`;
}

function renderGagamTable(filterText) {
  const q = (filterText || "").trim().toLowerCase();
  const list = !q ? gagamConditions : gagamConditions.filter((c) => {
    const trigger = findGagamProduct(c.triggerCode);
    const target = findGagamProduct(c.targetCode);
    return [c.triggerCode, c.targetCode, c.note, trigger && trigger.name, target && target.name]
      .filter(Boolean).join(" ").toLowerCase().includes(q);
  });
  document.getElementById("gagamTableBody").innerHTML = list.map(gagamRowHtml).join("");
  document.getElementById("gagamCount").textContent = `${list.length}개`;
}
renderGagamTable("");

document.getElementById("gagamSearchInput").addEventListener("input", (e) => renderGagamTable(e.target.value));

function openGagamModal(editing) {
  gagamEditingId = editing ? editing.id : null;
  gagamModalHeader.innerHTML = `${editing ? "✎ 가감조건 수정" : "➕ 가감조건 추가"} <button class="cmodal-close" id="gagamModalClose" type="button">✕</button>`;
  gagamModalBody.innerHTML = `
    <div class="lang-edit-field">
      <label>기준 상품코드 (조건이 발생하는 상품)</label>
      <input type="text" id="gagamTriggerCode" list="gagamProductList" placeholder="예: AC-001-01" value="${editing ? editing.triggerCode : ""}" />
    </div>
    <div class="lang-edit-field">
      <label>조건구분</label>
      <select id="gagamType">
        <option value="add" ${editing && editing.type === "add" ? "selected" : ""}>추가</option>
        <option value="remove" ${editing && editing.type === "remove" ? "selected" : ""}>제외</option>
      </select>
    </div>
    <div class="lang-edit-field">
      <label>대상 상품코드 (자동으로 추가/제외될 상품)</label>
      <input type="text" id="gagamTargetCode" list="gagamProductList" placeholder="예: AC-005-01" value="${editing ? editing.targetCode : ""}" />
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
}

function saveGagamModal() {
  const errorEl = document.getElementById("gagamError");
  errorEl.hidden = true;
  const triggerCode = document.getElementById("gagamTriggerCode").value.trim();
  const type = document.getElementById("gagamType").value;
  const targetCode = document.getElementById("gagamTargetCode").value.trim();
  const note = document.getElementById("gagamNote").value.trim();

  const trigger = findGagamProduct(triggerCode);
  const target = findGagamProduct(targetCode);
  if (!trigger || !target) {
    errorEl.hidden = false;
    errorEl.textContent = `❌ 기준/대상 상품코드는 1.1 프로덕트에 등록된 소분류코드(PK)여야 합니다.`;
    return;
  }
  if (triggerCode === targetCode) {
    errorEl.hidden = false;
    errorEl.textContent = `❌ 기준 상품과 대상 상품은 서로 달라야 합니다.`;
    return;
  }

  if (gagamEditingId) {
    const row = gagamConditions.find((c) => c.id === gagamEditingId);
    Object.assign(row, { triggerCode, type, targetCode, note });
    dsAddEditLog("가감조건 관리", `${triggerCode} → ${targetCode} (${type === "add" ? "추가" : "제외"}) 조건 수정`);
  } else {
    gagamConditions.unshift({ id: gagamSeq++, triggerCode, type, targetCode, note, createdAt: gagamToday() });
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
