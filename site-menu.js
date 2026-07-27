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
      <td>${s.origin || "본사"}</td>
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
   4) 가감조건 관리
      ① 공간 선택
      ② 그 공간에서 확인되는 "상품 × 프로덕트" 조합 선택
      ③ 선택 정보로 가감 그룹 생성 (같은 그룹 = 서로 대체 관계라 동시 선택 불가)
      ④ 가감 적용 순서는 안내문 스텝을 그대로 따른다. 안내문 스텝은 앞 단계
         (4.상품고객언어)에서 입력한 값(PRODUCT_OPTION_STEP)을 가져오며 이
         화면에서 따로 관리하지 않는다. 현장에서 추가한 상품은 우선순위
         숫자를 가장 낮게(0) 잡아 가장 먼저 적용된다
         (이 시스템은 우선순위 숫자가 낮은 것부터 적용).
   --------------------------------------------------------------------- */
const gagamSpaces = [...new Set(skuData.map((s) => s.space))];
let gagamSelectedSpace = gagamSpaces[0] || "";

let gagamGroupSeq = 1;
const gagamGroups = [];                 // { id, space, name, members: [{skuCode, productCode}] }
const gagamSelectedPairs = new Set();   // "SKU|PRODUCT"

function gagamPairKey(skuCode, productCode) { return `${skuCode}|${productCode}`; }

function gagamToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* 이 공간에서 확인되는 상품 × 프로덕트 조합 */
function gagamSpacePairs(space) {
  const pairs = [];
  skuData.filter((s) => s.space === space).forEach((s) => {
    (skuProductMap[s.code] || []).forEach((code) => {
      const p = DS_PRODUCT_MASTER_CATALOG.find((x) => x.code === code);
      pairs.push({
        skuCode: s.code,
        item: getSiteSkuName(s),
        origin: s.origin || "본사",
        productCode: code,
        productName: p ? p.name : "알 수 없음",
      });
    });
  });
  return pairs;
}

/* 안내문 스텝(앞 단계 작업 결과)으로 분류.
   현장 상품은 우선순위 숫자 0 = 가장 낮은 값이라 맨 앞에서 적용된다. */
function gagamBucketOf(skuCode) {
  const sku = skuData.find((s) => s.code === skuCode);
  if (sku && sku.origin === "현장") {
    return { key: "site", order: 0, label: "현장 상품", note: "우선순위 0 · 가장 먼저 적용" };
  }
  const step = PRODUCT_OPTION_STEP[skuCode];
  if (step) {
    return { key: `step-${step}`, order: Number(step), label: `STEP ${step} 상품`, note: `우선순위 ${step}` };
  }
  return { key: "none", order: Number.MAX_SAFE_INTEGER, label: "스텝 미지정 상품", note: "4.상품고객언어에서 안내문 스텝 입력 필요" };
}

function gagamBucketTagHtml(skuCode) {
  const b = gagamBucketOf(skuCode);
  return `<span class="gagam-bucket-tag ${b.key === "site" ? "site" : b.key === "none" ? "none" : "step"}">${b.label.replace(" 상품", "")}</span>`;
}

/* ---- ① 공간 선택 ---- */
function renderGagamSpaceTabs() {
  document.getElementById("gagamSpaceTabs").innerHTML = gagamSpaces.map((sp) => `
    <button type="button" class="gagam-space-tab ${sp === gagamSelectedSpace ? "active" : ""}" data-space="${sp}">${sp}</button>
  `).join("");
}
document.getElementById("gagamSpaceTabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".gagam-space-tab");
  if (!btn) return;
  gagamSelectedSpace = btn.dataset.space;
  gagamSelectedPairs.clear();
  gagamPairQuery = "";
  document.getElementById("gagamPairSearch").value = "";
  renderGagamAll();
});

/* ---- ② 상품 × 프로덕트 선택 ----
   조합이 많아 하나씩 고르기 어려우므로, 검색해서 걸러낸 결과를 한 번에
   선택/해제할 수 있게 한다. 검색어는 쉼표로 나누면 모두 포함(AND)해야
   매치된다. 예) "신발장,아크로" */
let gagamPairQuery = "";

function gagamPairMatches(r, query) {
  const terms = (query || "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [r.skuCode, r.item, r.origin, r.productCode, r.productName, gagamBucketOf(r.skuCode).label]
    .join(" ").toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

function gagamFilteredPairs() {
  return gagamSpacePairs(gagamSelectedSpace).filter((r) => gagamPairMatches(r, gagamPairQuery));
}

function renderGagamPairTable() {
  const total = gagamSpacePairs(gagamSelectedSpace).length;
  const pairs = gagamFilteredPairs();
  document.getElementById("gagamPairCount").textContent = gagamPairQuery.trim()
    ? `${total}개 중 ${pairs.length}개`
    : `${total}개`;
  document.getElementById("gagamPairSelected").textContent = `선택 ${gagamSelectedPairs.size}건`;
  document.getElementById("gagamPairBody").innerHTML = pairs.length === 0
    ? `<tr><td colspan="7" class="gagam-pair-empty">${total === 0
        ? "이 공간에는 매핑된 상품 × 프로덕트가 없습니다. 「1. 상품구성 &gt; 상품구성코드」에서 프로덕트를 먼저 매핑해주세요."
        : "검색과 일치하는 상품 × 프로덕트가 없습니다."}</td></tr>`
    : pairs.map((r) => {
      const key = gagamPairKey(r.skuCode, r.productCode);
      return `
        <tr data-key="${key}" class="${gagamSelectedPairs.has(key) ? "selected" : ""}">
          <td class="gagam-pair-check-col"><input type="checkbox" class="gagam-pair-check" data-key="${key}" ${gagamSelectedPairs.has(key) ? "checked" : ""} /></td>
          <td class="code-cell">${r.skuCode}</td>
          <td>${r.item}</td>
          <td>${r.origin === "현장" ? `<span class="gagam-origin-site">현장</span>` : `<span class="muted">본사</span>`}</td>
          <td>${gagamBucketTagHtml(r.skuCode)}</td>
          <td class="code-cell">${r.productCode}</td>
          <td>${r.productName}</td>
        </tr>`;
    }).join("");

  // 헤더 체크박스는 "지금 보이는(검색된) 행" 기준으로 동작한다
  const all = document.getElementById("gagamPairCheckAll");
  all.checked = pairs.length > 0 && pairs.every((r) => gagamSelectedPairs.has(gagamPairKey(r.skuCode, r.productCode)));
  document.getElementById("gagamPairSelectFiltered").disabled = pairs.length === 0;
  document.getElementById("gagamPairClearFiltered").disabled = pairs.length === 0;
  document.getElementById("gagamPairClearAll").disabled = gagamSelectedPairs.size === 0;
  document.getElementById("gagamGroupCreateBtn").disabled = gagamSelectedPairs.size < 2;
}

function gagamApplyToFiltered(select) {
  const pairs = gagamFilteredPairs();
  pairs.forEach((r) => {
    const key = gagamPairKey(r.skuCode, r.productCode);
    if (select) gagamSelectedPairs.add(key);
    else gagamSelectedPairs.delete(key);
  });
  renderGagamPairTable();
  return pairs.length;
}

document.getElementById("gagamPairBody").addEventListener("change", (e) => {
  const cb = e.target.closest(".gagam-pair-check");
  if (!cb) return;
  if (cb.checked) gagamSelectedPairs.add(cb.dataset.key);
  else gagamSelectedPairs.delete(cb.dataset.key);
  renderGagamPairTable();
});
document.getElementById("gagamPairCheckAll").addEventListener("change", (e) => {
  gagamApplyToFiltered(e.target.checked);
});
document.getElementById("gagamPairSearch").addEventListener("input", (e) => {
  gagamPairQuery = e.target.value;
  renderGagamPairTable();
});
document.getElementById("gagamPairSelectFiltered").addEventListener("click", () => {
  const n = gagamApplyToFiltered(true);
  showToast(`${n}건이 선택되었습니다.`);
});
document.getElementById("gagamPairClearFiltered").addEventListener("click", () => {
  const n = gagamApplyToFiltered(false);
  showToast(`${n}건의 선택이 해제되었습니다.`);
});
document.getElementById("gagamPairClearAll").addEventListener("click", () => {
  gagamSelectedPairs.clear();
  renderGagamPairTable();
  showToast("선택이 모두 해제되었습니다.");
});

/* ---- ③ 선택 정보로 가감 그룹 생성 ---- */
function gagamAutoGroupName(members) {
  const names = members.map((m) => {
    const p = DS_PRODUCT_MASTER_CATALOG.find((x) => x.code === m.productCode);
    return p ? p.name : m.productCode;
  });
  return names.length <= 2 ? names.join(" · ") : `${names[0]} 외 ${names.length - 1}개`;
}

document.getElementById("gagamGroupCreateBtn").addEventListener("click", () => {
  if (gagamSelectedPairs.size < 2) { showToast("가감이 발생할 항목을 2건 이상 선택해주세요."); return; }
  const members = [...gagamSelectedPairs].map((k) => {
    const [skuCode, productCode] = k.split("|");
    return { skuCode, productCode };
  });
  const nameInput = document.getElementById("gagamGroupNameInput");
  const name = nameInput.value.trim() || gagamAutoGroupName(members);
  gagamGroups.push({ id: gagamGroupSeq++, space: gagamSelectedSpace, name, members, createdAt: gagamToday() });
  dsAddEditLog("가감조건 관리", `가감 그룹 "${name}" 생성 (${gagamSelectedSpace} · ${members.length}건)`);
  nameInput.value = "";
  gagamSelectedPairs.clear();
  renderGagamAll();
  showToast(`가감 그룹 "${name}"이(가) 생성되었습니다. (${members.length}건)`);
});

/* ---- ④ 가감 그룹 : 안내문 스텝 기준으로 분류해 배열 ---- */
function renderGagamGroupList() {
  const list = gagamGroups.filter((g) => g.space === gagamSelectedSpace);
  document.getElementById("gagamGroupList").innerHTML = list.length === 0
    ? `<div class="gagam-category-empty">아직 만든 가감 그룹이 없습니다. 위에서 상품 × 프로덕트를 2건 이상 고르고 「가감 그룹 만들기」를 눌러주세요.</div>`
    : list.map((g) => {
      // 멤버를 안내문 스텝(현장 상품 → STEP 1 → STEP 2 → … → 미지정)으로 묶는다
      const buckets = new Map();
      g.members.forEach((m) => {
        const b = gagamBucketOf(m.skuCode);
        if (!buckets.has(b.key)) buckets.set(b.key, { ...b, members: [] });
        buckets.get(b.key).members.push(m);
      });
      const ordered = [...buckets.values()].sort((a, b) => a.order - b.order);
      return `
        <div class="gagam-group-card" data-id="${g.id}">
          <div class="gagam-group-card-head">
            <strong>${g.name}</strong>
            <span class="gagam-group-meta">${g.members.length}건 · 상호 제외 ${g.members.length * (g.members.length - 1)}건</span>
            <button type="button" class="gagam-delete-btn" data-delete-group="${g.id}">삭제</button>
          </div>
          ${ordered.map((b) => `
            <div class="gagam-bucket">
              <div class="gagam-bucket-head">
                <span class="gagam-bucket-tag ${b.key === "site" ? "site" : b.key === "none" ? "none" : "step"}">${b.label}</span>
                <span class="gagam-bucket-note">${b.note}</span>
              </div>
              <div class="gagam-category-chips">
                ${b.members.map((m) => {
                  const p = DS_PRODUCT_MASTER_CATALOG.find((x) => x.code === m.productCode);
                  const sku = skuData.find((x) => x.code === m.skuCode);
                  return `<span class="gagam-category-chip"><span class="code-cell">${m.skuCode}</span> ${sku ? getSiteSkuName(sku) : m.skuCode} <em>×</em> <span class="code-cell">${m.productCode}</span> ${p ? p.name : ""}</span>`;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>`;
    }).join("");
}

document.getElementById("gagamGroupList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-delete-group]");
  if (!btn) return;
  const id = Number(btn.dataset.deleteGroup);
  const g = gagamGroups.find((x) => x.id === id);
  if (!g) return;
  if (!window.confirm(`가감 그룹 "${g.name}"을(를) 삭제할까요?`)) return;
  gagamGroups.splice(gagamGroups.findIndex((x) => x.id === id), 1);
  dsAddEditLog("가감조건 관리", `가감 그룹 "${g.name}" 삭제`);
  renderGagamAll();
});

function renderGagamAll() {
  renderGagamSpaceTabs();
  renderGagamPairTable();
  renderGagamGroupList();
}
renderGagamAll();

/* 위 오버라이드들을 실제 화면에 즉시 반영 (script.js가 자기 자신을 로드하며
   이미 한 번 renderEverything()을 호출했으므로, 재정의된 함수들로 다시
   그린다). */
renderEverything();
