/* ===================== 탭 전환 ===================== */
document.querySelectorAll(".ctab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ctab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".ctab-panel").forEach((p) => p.classList.remove("active"));
    document.getElementById(`cpanel-${btn.dataset.tab}`).classList.add("active");
  });
});

/* ===================== 전사공통코드: 고객 / 공간 (변경 없음) ===================== */
const customers = [
  { code: "C", name: "일반 - Customer" },
  { code: "U", name: "조합 - Union" },
];
document.getElementById("customerBody").innerHTML = customers.map((c) => `
  <tr><td>${c.code}</td><td>${c.name}</td><td><span class="cdot"></span></td></tr>
`).join("");

const spaces = [
  { code: "AL", name: "복도 - Aisle" },
  { code: "AR", name: "알파룸 - Alpha Room" },
  { code: "AS", name: "알파공간 - Alpha Space" },
  { code: "B1", name: "욕실1 - Bath Room" },
  { code: "B2", name: "욕실2 - Bath Room" },
  { code: "B3", name: "욕실3 - Bath Room" },
  { code: "BA", name: "욕실 공통 - Bath All" },
  { code: "BL", name: "발코니 - Balcony" },
  { code: "EN", name: "현관 - Entrance" },
  { code: "F1", name: "가족실1 - Family Room" },
  { code: "F2", name: "가족실2 - Family Room" },
  { code: "GA", name: "전체 공간 - General Area" },
  { code: "KC", name: "주방 - Kitchen" },
  { code: "LV", name: "거실 - Living Room" },
  { code: "OD", name: "실외기실 - Outdoor unit Room" },
  { code: "R1", name: "침실1 - Bed Room" },
  { code: "R2", name: "침실2 - Bed Room" },
  { code: "R3", name: "침실3 - Bed Room" },
  { code: "R4", name: "침실4 - Bed Room" },
  { code: "PT", name: "팬트리 - Pantry" },
  { code: "DR", name: "드레스룸 - Dress Room" },
  { code: "UT", name: "다용도실 - Utility Room" },
];
document.getElementById("spaceBody").innerHTML = spaces.map((s) => `
  <tr class="${s.code === "EN" ? "selected" : ""}"><td>${s.code}</td><td>${s.name}</td></tr>
`).join("");

/* ===================== 전사공통코드: 대분류 / 중분류 =====================
   1.1 프로덕트(script.js의 DS_PRODUCT_MASTER_CATALOG)와 동일한 체계를
   shared-state.js에서 함께 참조한다. 신규 체계가 기본값이고, 개편 이전부터
   있던 현장을 위해 구버전 체계도 그대로 조회할 수 있게 남겨둔다 — 기존
   현장 데이터는 구버전 방식대로, 신규 현장 데이터만 신규 방식으로 관리. */
let categoryScheme = "new";
let selectedMajorCode = null;

function currentMajors() { return categoryScheme === "new" ? DS_PRODUCT_MAJORS_NEW : DS_PRODUCT_MAJORS_LEGACY; }
function currentMids() { return categoryScheme === "new" ? DS_PRODUCT_MIDS_NEW : DS_PRODUCT_MIDS_LEGACY; }

function renderMajorBody() {
  const majors = currentMajors();
  document.getElementById("majorCount").textContent = majors.length;
  document.getElementById("majorBody").innerHTML = majors.map((m) => `
    <tr class="${m.code === selectedMajorCode ? "selected" : ""}" data-code="${m.code}"><td>${m.code}</td><td>${m.name}</td></tr>
  `).join("");
}

function renderMidBody() {
  const mids = currentMids().filter((m) => !selectedMajorCode || m.majorCode === selectedMajorCode);
  document.getElementById("midCount").textContent = mids.length;
  document.getElementById("midBody").innerHTML = mids.map((m) => `
    <tr><td>${m.majorCode}</td><td>${m.code}</td><td>${m.name}</td></tr>
  `).join("");
}

function renderCategoryScheme() {
  document.querySelectorAll(".cscheme-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.scheme === categoryScheme));
  document.getElementById("categorySchemeNote").hidden = categoryScheme !== "legacy";
  renderMajorBody();
  renderMidBody();
}

document.getElementById("majorBody").addEventListener("click", (e) => {
  const tr = e.target.closest("tr[data-code]");
  if (!tr) return;
  selectedMajorCode = selectedMajorCode === tr.dataset.code ? null : tr.dataset.code;
  renderMajorBody();
  renderMidBody();
});

document.querySelectorAll(".cscheme-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.scheme === categoryScheme) return;
    categoryScheme = btn.dataset.scheme;
    selectedMajorCode = null;
    renderCategoryScheme();
  });
});

renderCategoryScheme();

/* ===================== 전사공통코드: 소분류(PK) 전체 현장 집계 =====================
   소분류(PK)는 여전히 "현장별 관리 항목"이라 표준은 아니지만, 실제로 각 현장이
   입력해 쓰고 있는 소분류를 현장명은 빼고 사용 현장 수만 모아 참고용으로 보여준다.
   DS_PRODUCT_MASTER_CATALOG(1.1 프로덕트 소분류 마스터)와 현장별 배정 데모
   데이터(DS_OTHER_SITE_PRODUCT_SETS)를 합쳐서 코드별 사용 현장 수를 집계한다. */
const SUB_AGG_SITE_SETS = [
  { codes: DS_PRODUCT_MASTER_CATALOG.map((r) => r.code) }, // 현재 현장(아크로 서초) : 마스터 전량 보유
  ...DS_OTHER_SITE_PRODUCT_SETS.map((s) => ({ codes: s.codes })),
];

function buildSubCategoryAggregate() {
  const usageCount = {};
  SUB_AGG_SITE_SETS.forEach((set) => {
    set.codes.forEach((code) => { usageCount[code] = (usageCount[code] || 0) + 1; });
  });
  return DS_PRODUCT_MASTER_CATALOG
    .filter((r) => usageCount[r.code])
    .map((r) => Object.assign({}, r, { siteUsage: usageCount[r.code] }));
}
const subCategoryAggregate = buildSubCategoryAggregate();

function renderSubAggBody(list) {
  document.getElementById("subAggCount").textContent = list.length;
  document.getElementById("subAggBody").innerHTML = list.map((r) => `
    <tr>
      <td>${r.majorCode}</td><td>${r.majorName}</td><td>${r.midCode}</td><td>${r.midName}</td>
      <td class="ccode-cell">${r.code}</td><td>${r.name}</td><td>${r.siteUsage}개 현장</td>
    </tr>
  `).join("");
}
renderSubAggBody(subCategoryAggregate);

let subAggSortAsc = true;
document.querySelector("#subAggTable .sortable").addEventListener("click", () => {
  subAggSortAsc = !subAggSortAsc;
  const sorted = [...subCategoryAggregate].sort((a, b) =>
    subAggSortAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code)
  );
  renderSubAggBody(sorted);
});

function cqaApplySubAggFilter() {
  const q = document.getElementById("subAggSearch").value.trim().toLowerCase();
  const filtered = !q ? subCategoryAggregate : subCategoryAggregate.filter((r) =>
    [r.code, r.name, r.majorName, r.midName].join(" ").toLowerCase().includes(q)
  );
  renderSubAggBody(filtered);
}

document.getElementById("subAggSearch").addEventListener("input", cqaApplySubAggFilter);

/* =====================================================================
   전사공통코드: 프로덕트 코드(소분류/PK) 간편 추가
   -----------------------------------------------------------------------
   대분류>중분류를 각각 테이블에서 찾아 클릭해야 하는 기존 방식 대신, 이름으로
   검색해 대분류·중분류를 한 번에 고르고 소분류코드는 자동 채번해서 추가한다.
   코드를 직접 입력하지 않으므로 오탈자·중복 걱정이 없고, 여러 상품명을 한 번에
   붙여넣어 일괄 등록할 수도 있다. 기존 화면(대분류/중분류/소분류집계 테이블)은
   그대로 두고, 이 모달만 새로 추가한 것이다.
   ===================================================================== */
function cqaShowMsg(text) {
  let el = document.getElementById("cqaToast");
  if (!el) {
    el = document.createElement("div");
    el.id = "cqaToast";
    el.className = "cqa-toast";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(cqaShowMsg._t);
  cqaShowMsg._t = setTimeout(() => el.classList.remove("show"), 2400);
}

const productQuickAddModal = document.getElementById("productQuickAddModal");
const cqaCategorySearchInput = document.getElementById("cqaCategorySearchInput");
const cqaCategoryResults = document.getElementById("cqaCategoryResults");
const cqaCategoryPicked = document.getElementById("cqaCategoryPicked");
const cqaAddStep = document.getElementById("cqaAddStep");
const cqaNextCode = document.getElementById("cqaNextCode");
const cqaAddedStep = document.getElementById("cqaAddedStep");
const cqaAddedList = document.getElementById("cqaAddedList");
const cqaAddedCount = document.getElementById("cqaAddedCount");

let cqaSelectedMajor = null;
let cqaSelectedMid = null;
let cqaAddedThisSession = [];

function cqaMidOptionsWithMajorName() {
  return DS_PRODUCT_MIDS_NEW.map((m) => {
    const major = DS_PRODUCT_MAJORS_NEW.find((x) => x.code === m.majorCode);
    return { majorCode: m.majorCode, majorName: major ? major.name : m.majorCode, code: m.code, name: m.name };
  });
}

function cqaNextSeq(majorCode, midCode) {
  const nums = DS_PRODUCT_MASTER_CATALOG
    .filter((r) => r.majorCode === majorCode && r.midCode === midCode)
    .map((r) => parseInt(r.code.split("-")[2], 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1).padStart(2, "0");
}

function cqaRenderCategoryResults(query) {
  const q = query.trim().toLowerCase();
  if (!q) { cqaCategoryResults.innerHTML = ""; return; }
  const matches = cqaMidOptionsWithMajorName()
    .filter((m) => [m.majorName, m.name].join(" ").toLowerCase().includes(q))
    .slice(0, 30);
  cqaCategoryResults.innerHTML = matches.length === 0
    ? `<div class="cqa-category-results-hint">일치하는 대분류/중분류가 없습니다.</div>`
    : matches.map((m) => `
      <button type="button" class="cqa-category-result" data-major-code="${m.majorCode}" data-mid-code="${m.code}">
        <span class="cqa-category-result-major">${m.majorCode} · ${m.majorName}</span>
        <span class="cqa-category-result-mid">${m.code} · ${m.name}</span>
      </button>
    `).join("");
}

function cqaRefreshNextCode() {
  if (cqaSelectedMajor && cqaSelectedMid) {
    cqaNextCode.textContent = `${cqaSelectedMajor.code}-${cqaSelectedMid.code}-${cqaNextSeq(cqaSelectedMajor.code, cqaSelectedMid.code)}`;
  }
}

function cqaSelectCategory(majorCode, midCode) {
  const major = DS_PRODUCT_MAJORS_NEW.find((m) => m.code === majorCode);
  const mid = DS_PRODUCT_MIDS_NEW.find((m) => m.majorCode === majorCode && m.code === midCode);
  if (!major || !mid) return;
  cqaSelectedMajor = major;
  cqaSelectedMid = mid;
  cqaCategoryPicked.hidden = false;
  cqaCategoryPicked.innerHTML = `
    <span>선택됨: <strong>${major.code} ${major.name}</strong> &gt; <strong>${mid.code} ${mid.name}</strong></span>
    <button type="button" class="cqa-category-picked-change" id="cqaCategoryChangeBtn">변경</button>
  `;
  document.getElementById("cqaCategoryChangeBtn").addEventListener("click", cqaResetCategory);
  cqaCategorySearchInput.value = "";
  cqaCategoryResults.innerHTML = "";
  cqaCategorySearchInput.hidden = true;
  cqaAddStep.hidden = false;
  cqaRefreshNextCode();
  const nameInput = document.getElementById("cqaSingleNameInput");
  nameInput.value = "";
  nameInput.focus();
}

function cqaResetCategory() {
  cqaSelectedMajor = null;
  cqaSelectedMid = null;
  cqaCategoryPicked.hidden = true;
  cqaCategoryPicked.innerHTML = "";
  cqaCategorySearchInput.hidden = false;
  cqaCategorySearchInput.value = "";
  cqaCategorySearchInput.focus();
  cqaCategoryResults.innerHTML = "";
  cqaAddStep.hidden = true;
}

cqaCategorySearchInput.addEventListener("input", (e) => cqaRenderCategoryResults(e.target.value));
cqaCategoryResults.addEventListener("click", (e) => {
  const btn = e.target.closest(".cqa-category-result");
  if (!btn) return;
  cqaSelectCategory(btn.dataset.majorCode, btn.dataset.midCode);
});

document.querySelectorAll(".cqa-mode-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cqa-mode-tab").forEach((b) => b.classList.toggle("active", b === btn));
    document.getElementById("cqaSingleMode").hidden = btn.dataset.mode !== "single";
    document.getElementById("cqaBulkMode").hidden = btn.dataset.mode !== "bulk";
  });
});

function cqaAddOne(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const seq = cqaNextSeq(cqaSelectedMajor.code, cqaSelectedMid.code);
  const code = `${cqaSelectedMajor.code}-${cqaSelectedMid.code}-${seq}`;
  const row = {
    no: DS_PRODUCT_MASTER_CATALOG.length + 1,
    majorCode: cqaSelectedMajor.code, majorName: cqaSelectedMajor.name,
    midCode: cqaSelectedMid.code, midName: cqaSelectedMid.name,
    code, name: trimmed,
  };
  dsAddCustomProductCode(row);
  SUB_AGG_SITE_SETS[0].codes.push(code);
  subCategoryAggregate.push(Object.assign({}, row, { siteUsage: 1 }));
  dsAddEditLog("전사공통코드(프로덕트코드)", `신규 프로덕트 코드 추가: ${code} (${trimmed})`);
  return row;
}

function cqaRenderAdded() {
  cqaAddedStep.hidden = cqaAddedThisSession.length === 0;
  cqaAddedCount.textContent = cqaAddedThisSession.length;
  cqaAddedList.innerHTML = cqaAddedThisSession.map((r) => `
    <div class="cqa-added-item">
      <span class="ccode-cell">${r.code}</span>
      <span class="cqa-added-name">${r.name}</span>
      <button type="button" class="cqa-added-undo-btn" data-code="${r.code}" title="되돌리기">✕ 되돌리기</button>
    </div>
  `).join("");
}

cqaAddedList.addEventListener("click", (e) => {
  const btn = e.target.closest(".cqa-added-undo-btn");
  if (!btn) return;
  const code = btn.dataset.code;
  dsRemoveCustomProductCode(code);
  SUB_AGG_SITE_SETS[0].codes = SUB_AGG_SITE_SETS[0].codes.filter((c) => c !== code);
  const idx = subCategoryAggregate.findIndex((r) => r.code === code);
  if (idx !== -1) subCategoryAggregate.splice(idx, 1);
  cqaAddedThisSession = cqaAddedThisSession.filter((r) => r.code !== code);
  dsAddEditLog("전사공통코드(프로덕트코드)", `방금 추가한 프로덕트 코드 되돌림: ${code}`);
  cqaRenderAdded();
  cqaApplySubAggFilter();
  cqaRefreshNextCode();
});

document.getElementById("cqaSingleAddBtn").addEventListener("click", () => {
  const input = document.getElementById("cqaSingleNameInput");
  if (!input.value.trim()) { cqaShowMsg("상품명을 입력해주세요."); return; }
  const row = cqaAddOne(input.value);
  cqaAddedThisSession.unshift(row);
  cqaRenderAdded();
  cqaApplySubAggFilter();
  cqaRefreshNextCode();
  input.value = "";
  input.focus();
});

document.getElementById("cqaBulkAddBtn").addEventListener("click", () => {
  const textarea = document.getElementById("cqaBulkTextarea");
  const lines = textarea.value.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) { cqaShowMsg("등록할 상품명을 입력해주세요."); return; }
  const added = lines.map((line) => cqaAddOne(line)).filter(Boolean);
  cqaAddedThisSession.unshift(...added.slice().reverse());
  cqaRenderAdded();
  cqaApplySubAggFilter();
  cqaRefreshNextCode();
  textarea.value = "";
  cqaShowMsg(`${added.length}건 등록되었습니다.`);
});

document.getElementById("productQuickAddBtn").addEventListener("click", () => {
  cqaResetCategory();
  cqaAddedThisSession = [];
  cqaRenderAdded();
  productQuickAddModal.hidden = false;
});
document.getElementById("productQuickAddClose").addEventListener("click", () => {
  productQuickAddModal.hidden = true;
});

/* =====================================================================
   전사공통코드: 고객스타일 / 스타일 / 평형 / 평형옵션 / 선택형평면 마스터
   -> 현장별코드에서는 이 마스터 목록 중에서 "선택"해서 배정한다.
   ===================================================================== */
const masterData = {
  custStyles: [
    { code: "MM", name: "미니멀" },
    { code: "MN", name: "모던 내추럴" },
    { code: "NN", name: "스타일 미적용 - None" },
    { code: "SC", name: "소프트클래식" },
    { code: "U1", name: "조합기본1" },
    { code: "U2", name: "조합기본2" },
  ],
  styles: [
    { code: "MM", name: "미니멀 - Minimal" },
    { code: "MN", name: "모던 내추럴 - Modern Natural" },
    { code: "NN", name: "스타일 미적용 - None" },
    { code: "SC", name: "소프트 클래식 - Soft Classic" },
    { code: "U1", name: "조합 1안 - Union 1" },
    { code: "U2", name: "조합 2안 - Union 2" },
  ],
  pyeongs: ["0044:44", "0059:59", "0144:144", "075A:75A", "075B:75B", "084A:84A", "084B:84B", "084C:84C", "084D:84D", "110A:110A", "110B:110B", "110C:110C", "121A:121A", "121B:121B", "138A:138A", "138B:138B"]
    .map((s) => { const [code, name] = s.split(":"); return { code, name }; }),
  pyeongOptions: [{ code: "NNNN", name: "기본" }],
  plans: [
    { code: "00", name: "미적용" },
    { code: "01", name: "一자형 주방구조 선택시" },
    { code: "02", name: "ㄱ자형 주방구조 선택시" },
  ],
};

const MASTER_META = {
  custStyles: { section: "masterCustStyle" },
  styles: { section: "masterStyle" },
  pyeongs: { section: "masterPyeong" },
  pyeongOptions: { section: "masterPyeongOption" },
  plans: { section: "masterPlan" },
};

function renderMasterSection(key) {
  const meta = MASTER_META[key];
  document.getElementById(`${meta.section}Count`).textContent = masterData[key].length;
  document.getElementById(`${meta.section}Body`).innerHTML = masterData[key].map((item) => `
    <tr><td>${item.code}</td><td>${item.name}</td></tr>
  `).join("");
}
Object.keys(masterData).forEach(renderMasterSection);

document.querySelectorAll(".cmaster-add-btn[data-master]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.master;
    const meta = MASTER_META[key];
    const body = document.getElementById(`${meta.section}Body`);
    if (body.querySelector(".cinline-add-row")) return;

    const tr = document.createElement("tr");
    tr.className = "cinline-add-row";
    tr.innerHTML = `
      <td><input type="text" placeholder="코드" class="cnew-code" /></td>
      <td>
        <div style="display:flex; gap:4px;">
          <input type="text" placeholder="명칭" class="cnew-name" />
          <div class="cinline-add-actions">
            <button class="cinline-confirm-btn">추가</button>
            <button class="cinline-cancel-btn">취소</button>
          </div>
        </div>
      </td>
    `;
    body.prepend(tr);
    tr.querySelector(".cnew-code").focus();

    tr.querySelector(".cinline-cancel-btn").addEventListener("click", () => tr.remove());
    tr.querySelector(".cinline-confirm-btn").addEventListener("click", () => {
      const code = tr.querySelector(".cnew-code").value.trim();
      const name = tr.querySelector(".cnew-name").value.trim();
      if (!code || !name) return;
      if (masterData[key].some((m) => m.code === code)) { alert("이미 존재하는 코드입니다."); return; }
      masterData[key].push({ code, name });
      renderMasterSection(key);
      dsAddEditLog("전사공통코드", `"현장코드" 마스터에 ${code} ${name} 신규 등록`);
    });
  });
});

/* ===================== 현장별코드 ===================== */
const sitesCompact = [
  { code: "001108", name: "ACROHILLS 논현 현장" },
  { code: "040104", name: "e편한세상 가재울 현장" },
  { code: "070925", name: "e편한세상 광교 현장" },
  { code: "080394", name: "e편한세상 부천 어반스퀘어 현장" },
  { code: "150120", name: "구리역 하이니티 리버파크 현장" },
  { code: "170020", name: "아크로 서초 현장" },
  { code: "170374", name: "e편한세상 센텀 하이베뉴 현장" },
  { code: "180247", name: "아크로 리버스카이 현장" },
  { code: "180258", name: "e편한세상 강동 프레스티지원 현장" },
  { code: "190197", name: "아크로 리츠카운티 현장" },
  { code: "200160", name: "e편한세상 당산 리버파크 현장" },
  { code: "210114", name: "e편한세상 분당 퍼스트빌리지 현장" },
  { code: "210115", name: "e편한세상 동탄 파크아너스 현장" },
  { code: "230028", name: "e편한세상 성성호수공원 현장" },
  { code: "230146", name: "안양 에버포레 자연&e편한세상 현장" },
  { code: "230160", name: "e편한세상 동탄역 어반원 현장" },
  { code: "240196", name: "e편한세상 내포 에듀플라츠 현장" },
];
document.getElementById("siteSelectBody").innerHTML = sitesCompact.map((s) => `
  <tr class="${s.code === "190197" ? "selected" : ""}" data-code="${s.code}">
    <td>${s.code}</td><td>${s.name}</td>
  </tr>
`).join("");

const SITE_COL_META = {
  custStyles: { section: "custStyle", label: "고객 스타일" },
  styles: { section: "style", label: "스타일" },
  pyeongs: { section: "pyeong", label: "평형" },
  pyeongOptions: { section: "pyeongOption", label: "평형옵션" },
  plans: { section: "plan", label: "선택형 평면" },
};

// 현장별로 배정된 코드 목록(마스터 코드 참조). 190197은 목업과 동일하게 전량 배정된 상태로 시작.
const siteAssignments = {};
function getSiteAssignment(siteCode) {
  if (!siteAssignments[siteCode]) {
    siteAssignments[siteCode] = {
      custStyles: masterData.custStyles.map((m) => m.code),
      styles: masterData.styles.map((m) => m.code),
      pyeongs: masterData.pyeongs.map((m) => m.code),
      pyeongOptions: masterData.pyeongOptions.map((m) => m.code),
      plans: masterData.plans.map((m) => m.code),
    };
  }
  return siteAssignments[siteCode];
}

let currentSiteCode = "190197";

function isSiteEditable() {
  return dsLoad().stages.s0.status === "editable";
}

function renderSiteColumn(key) {
  const meta = SITE_COL_META[key];
  const assignment = getSiteAssignment(currentSiteCode);
  const codes = assignment[key];
  const editable = isSiteEditable();
  document.getElementById(`${meta.section}Count`).textContent = codes.length;
  document.getElementById(`${meta.section}Body`).innerHTML = codes.map((code) => {
    const item = masterData[key].find((m) => m.code === code);
    return `
      <tr data-code="${code}">
        <td>${code}</td>
        <td>${item ? item.name : ""}</td>
        <td><button class="cremove-btn" data-remove-master="${key}" data-remove-code="${code}" ${editable ? "" : "disabled"}>✕</button></td>
      </tr>
    `;
  }).join("");
}
function renderAllSiteColumns() {
  Object.keys(SITE_COL_META).forEach(renderSiteColumn);
}
function renderSiteEditLock() {
  const editable = isSiteEditable();
  document.querySelectorAll(".cmaster-add-btn[data-site-master]").forEach((el) => { el.disabled = !editable; });
}
renderAllSiteColumns();

document.querySelector(".csite-cols").addEventListener("click", (e) => {
  const removeBtn = e.target.closest("[data-remove-master]");
  if (removeBtn && isSiteEditable()) {
    const key = removeBtn.dataset.removeMaster;
    const code = removeBtn.dataset.removeCode;
    const meta = SITE_COL_META[key];
    const item = masterData[key].find((m) => m.code === code);
    const assignment = getSiteAssignment(currentSiteCode);
    assignment[key] = assignment[key].filter((c) => c !== code);
    renderSiteColumn(key);
    const site = sitesCompact.find((s) => s.code === currentSiteCode);
    dsAddEditLog("현장별코드", `${site.name}(${currentSiteCode}) - ${meta.label}에서 ${code} ${item ? item.name : ""} 배정 해제`);
  }
});

document.querySelectorAll(".cmaster-add-btn[data-site-master]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!isSiteEditable()) return;
    const key = btn.dataset.siteMaster;
    const meta = SITE_COL_META[key];
    const body = document.getElementById(`${meta.section}Body`);
    if (body.querySelector(".cinline-add-row")) return;

    const assignment = getSiteAssignment(currentSiteCode);
    const available = masterData[key].filter((m) => !assignment[key].includes(m.code));
    if (available.length === 0) {
      alert(`전사공통코드에 등록된 "${meta.label}" 코드가 모두 이미 배정되어 있습니다.\n새 코드는 전사공통코드 탭에서 추가해 주세요.`);
      return;
    }

    const tr = document.createElement("tr");
    tr.className = "cinline-add-row";
    tr.innerHTML = `
      <td colspan="2">
        <select class="cnew-select">
          ${available.map((m) => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join("")}
        </select>
      </td>
      <td class="cinline-add-actions">
        <button class="cinline-confirm-btn">추가</button>
        <button class="cinline-cancel-btn">취소</button>
      </td>
    `;
    body.prepend(tr);

    tr.querySelector(".cinline-cancel-btn").addEventListener("click", () => tr.remove());
    tr.querySelector(".cinline-confirm-btn").addEventListener("click", () => {
      const code = tr.querySelector(".cnew-select").value;
      const item = masterData[key].find((m) => m.code === code);
      assignment[key].push(code);
      renderSiteColumn(key);
      const site = sitesCompact.find((s) => s.code === currentSiteCode);
      dsAddEditLog("현장별코드", `${site.name}(${currentSiteCode}) - ${meta.label}에 ${code} ${item ? item.name : ""} 배정 추가`);
    });
  });
});

document.getElementById("siteSelectBody").addEventListener("click", (e) => {
  const tr = e.target.closest("tr[data-code]");
  if (!tr) return;
  document.querySelectorAll("#siteSelectBody tr").forEach((r) => r.classList.remove("selected"));
  tr.classList.add("selected");
  currentSiteCode = tr.dataset.code;
  const site = sitesCompact.find((s) => s.code === currentSiteCode);
  document.getElementById("siteHeaderName").textContent = `${site.name} (${site.code})`;
  document.getElementById("batchSelect").innerHTML = `<option>${site.code}-001</option>`;
  renderAllSiteColumns();
});

/* ===================== 0. 현장별코드 확정 관리 (shared-state.js) ===================== */
function renderStage0Box() {
  const box = document.getElementById("stage0Box");
  const s = dsLoad().stages.s0;
  const isOwner = dsGetCurrentRole() === s.owner;

  if (s.status === "editable") {
    box.innerHTML = `
      ${s.justUnlocked ? `<span class="stage-approved-badge">✅ 잠금해제 승인 완료</span>` : ""}
      <button class="ghost-btn green" id="stage0ConfirmBtn" ${isOwner ? "" : "disabled"}>✔ 현장별코드 확정하기</button>
      ${isOwner ? "" : `<span class="stage-role-hint">담당자(${dsRoleName(s.owner)})만 확정할 수 있습니다</span>`}`;
    document.getElementById("stage0ConfirmBtn").addEventListener("click", () => { dsConfirmStage("s0"); renderEverything(); });
  } else if (s.status === "confirmed") {
    box.innerHTML = `
      <div class="confirm-box">
        <span class="confirm-badge">현장별<br />코드 확정</span>
        <div class="confirm-info">
          <p>확정자 : ${dsRoleName(s.owner)}</p>
          <p>확정일 : ${s.confirmedAt}</p>
        </div>
      </div>
      <button class="danger-btn" id="stage0ReopenBtn" ${isOwner ? "" : "disabled"}>↺ 현장별코드 확정 강제취소</button>`;
    document.getElementById("stage0ReopenBtn").addEventListener("click", () => { if (dsPromptAndRequestReopen("s0")) renderEverything(); });
  } else if (s.status === "reopen_pending") {
    box.innerHTML = `
      <span class="stage-pending-badge">⏳ 잠금 해제 승인 대기 중 (${s.pendingApprovals.map((k) => dsRoleName(dsLoad().stages[k].owner)).join(", ")})</span>
      <button class="toolbar-btn" id="stage0CancelReopenBtn" ${isOwner ? "" : "disabled"}>요청 취소</button>`;
    document.getElementById("stage0CancelReopenBtn").addEventListener("click", () => { dsCancelReopenRequest("s0"); renderEverything(); });
  }

  renderSiteEditLock();
  renderAllSiteColumns();
}

function renderEverything() {
  dsRenderStatusBar("dsStatusStrip", { onRoleChange: renderStage0Box, onStateChange: renderStage0Box });
  renderStage0Box();
}
renderEverything();

// 상태바의 단계 배지를 눌러 이동해 왔을 때(같은 페이지 내 이동 + 다른 페이지에서 넘어온 경우 모두) 해당 화면으로 전환
function applyStageNavigation(stageKey) {
  if (stageKey !== "s0") return;
  const tabBtn = document.querySelector('.ctab[data-tab="site"]');
  if (tabBtn) tabBtn.click();
}

document.addEventListener("ds:goto-stage", (e) => applyStageNavigation(e.detail.stageKey));
const dsPendingGoto = dsConsumeGotoHash();
if (dsPendingGoto) applyStageNavigation(dsPendingGoto);
