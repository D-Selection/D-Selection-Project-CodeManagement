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
   대분류/중분류를 검색 없이 한 화면에서 전부 보고 클릭으로 고른다. 상품명을
   입력해 추가하면 실제 데이터에 바로 반영되지 않고 오른쪽 "대기 목록"에
   쌓이기만 하며, 대분류/중분류를 자유롭게 바꿔가며 여러 건을 계속 쌓을 수
   있다. 소분류코드(PK)는 항상 자동 채번되고(코드를 직접 입력하지 않으므로
   오탈자·중복 걱정이 없다) 대기 목록에 채번된 번호가 바로 보인다. "전체 저장"을
   눌러야 그 시점까지 쌓인 모든 항목이 한 번에 실제 데이터에 반영된다. 기존
   화면(대분류/중분류/소분류집계 테이블)은 그대로 두고, 이 모달만 새로 추가한
   것이다. */
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
const cqaMajorTabs = document.getElementById("cqaMajorTabs");
const cqaMidList = document.getElementById("cqaMidList");
const cqaMidCount = document.getElementById("cqaMidCount");
const cqaSelectedRow = document.getElementById("cqaSelectedRow");
const cqaSelectedLabel = document.getElementById("cqaSelectedLabel");
const cqaNextCode = document.getElementById("cqaNextCode");
const cqaAddControls = document.getElementById("cqaAddControls");
const cqaSingleMode = document.getElementById("cqaSingleMode");
const cqaBulkMode = document.getElementById("cqaBulkMode");
const cqaPendingList = document.getElementById("cqaPendingList");
const cqaPendingCount = document.getElementById("cqaPendingCount");
const cqaSaveBtn = document.getElementById("cqaSaveBtn");
const cqaSaveBtnCount = document.getElementById("cqaSaveBtnCount");

let cqaSelectedMajor = null;
let cqaSelectedMid = null;
let cqaPendingItems = []; // 저장 전 대기 목록: { majorCode, majorName, midCode, midName, name, code }

function cqaNextSeq(majorCode, midCode) {
  const fromCatalog = DS_PRODUCT_MASTER_CATALOG
    .filter((r) => r.majorCode === majorCode && r.midCode === midCode)
    .map((r) => parseInt(r.code.split("-")[2], 10));
  const fromPending = cqaPendingItems
    .filter((r) => r.majorCode === majorCode && r.midCode === midCode)
    .map((r) => parseInt(r.code.split("-")[2], 10));
  const nums = fromCatalog.concat(fromPending).filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1).padStart(2, "0");
}

function cqaRenderMajorTabs() {
  cqaMajorTabs.innerHTML = DS_PRODUCT_MAJORS_NEW.map((m) => `
    <button type="button" class="cqa-major-tab ${cqaSelectedMajor && cqaSelectedMajor.code === m.code ? "active" : ""}" data-code="${m.code}">${m.code} · ${m.name}</button>
  `).join("");
}

function cqaRenderMidList() {
  if (!cqaSelectedMajor) {
    cqaMidCount.textContent = "0";
    cqaMidList.innerHTML = `<div class="cqa-mid-list-hint">먼저 대분류를 선택해주세요.</div>`;
    return;
  }
  const mids = DS_PRODUCT_MIDS_NEW.filter((m) => m.majorCode === cqaSelectedMajor.code);
  cqaMidCount.textContent = mids.length;
  cqaMidList.innerHTML = mids.map((m) => `
    <button type="button" class="cqa-mid-row ${cqaSelectedMid && cqaSelectedMid.code === m.code ? "selected" : ""}" data-code="${m.code}">
      <span class="cqa-mid-row-code">${m.code}</span>
      <span class="cqa-mid-row-name">${m.name}</span>
    </button>
  `).join("");
}

function cqaRefreshSelectedInfo() {
  if (!cqaSelectedMajor || !cqaSelectedMid) {
    cqaSelectedRow.hidden = true;
    cqaAddControls.hidden = true;
    cqaSingleMode.hidden = true;
    cqaBulkMode.hidden = true;
    return;
  }
  cqaSelectedRow.hidden = false;
  cqaAddControls.hidden = false;
  cqaSelectedLabel.textContent = `${cqaSelectedMajor.code} ${cqaSelectedMajor.name} > ${cqaSelectedMid.code} ${cqaSelectedMid.name}`;
  cqaNextCode.textContent = `${cqaSelectedMajor.code}-${cqaSelectedMid.code}-${cqaNextSeq(cqaSelectedMajor.code, cqaSelectedMid.code)}`;
  const activeTab = document.querySelector(".cqa-mode-tab.active");
  cqaSingleMode.hidden = !activeTab || activeTab.dataset.mode !== "single";
  cqaBulkMode.hidden = !activeTab || activeTab.dataset.mode !== "bulk";
}

function cqaSelectMajor(majorCode) {
  const major = DS_PRODUCT_MAJORS_NEW.find((m) => m.code === majorCode);
  if (!major) return;
  cqaSelectedMajor = major;
  cqaSelectedMid = null;
  cqaRenderMajorTabs();
  cqaRenderMidList();
  cqaRefreshSelectedInfo();
}

function cqaSelectMid(midCode) {
  const mid = DS_PRODUCT_MIDS_NEW.find((m) => m.majorCode === cqaSelectedMajor.code && m.code === midCode);
  if (!mid) return;
  cqaSelectedMid = mid;
  cqaRenderMidList();
  cqaRefreshSelectedInfo();
  const nameInput = document.getElementById("cqaSingleNameInput");
  nameInput.value = "";
  nameInput.focus();
}

cqaMajorTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".cqa-major-tab");
  if (!btn) return;
  cqaSelectMajor(btn.dataset.code);
});
cqaMidList.addEventListener("click", (e) => {
  const btn = e.target.closest(".cqa-mid-row");
  if (!btn) return;
  cqaSelectMid(btn.dataset.code);
});

document.querySelectorAll(".cqa-mode-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cqa-mode-tab").forEach((b) => b.classList.toggle("active", b === btn));
    cqaSingleMode.hidden = btn.dataset.mode !== "single";
    cqaBulkMode.hidden = btn.dataset.mode !== "bulk";
  });
});

function cqaRenderPendingList() {
  cqaPendingCount.textContent = cqaPendingItems.length;
  cqaSaveBtnCount.textContent = cqaPendingItems.length;
  cqaSaveBtn.disabled = cqaPendingItems.length === 0;
  cqaPendingList.innerHTML = cqaPendingItems.length === 0
    ? `<div class="cqa-pending-empty">아직 대기중인 항목이 없습니다.<br/>왼쪽에서 대분류·중분류를 고르고 상품명을 추가해보세요.</div>`
    : cqaPendingItems.map((r, i) => `
      <div class="cqa-pending-item">
        <span class="ccode-cell">${r.code}</span>
        <span class="cqa-pending-cat">${r.majorName} &gt; ${r.midName}</span>
        <span class="cqa-pending-name">${r.name}</span>
        <button type="button" class="cqa-pending-remove-btn" data-index="${i}" title="대기 목록에서 제거">✕</button>
      </div>
    `).join("");
}

function cqaAddToPending(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const seq = cqaNextSeq(cqaSelectedMajor.code, cqaSelectedMid.code);
  const code = `${cqaSelectedMajor.code}-${cqaSelectedMid.code}-${seq}`;
  const row = {
    majorCode: cqaSelectedMajor.code, majorName: cqaSelectedMajor.name,
    midCode: cqaSelectedMid.code, midName: cqaSelectedMid.name,
    code, name: trimmed,
  };
  cqaPendingItems.push(row);
  return row;
}

cqaPendingList.addEventListener("click", (e) => {
  const btn = e.target.closest(".cqa-pending-remove-btn");
  if (!btn) return;
  cqaPendingItems.splice(Number(btn.dataset.index), 1);
  cqaRenderPendingList();
  cqaRefreshSelectedInfo();
});

document.getElementById("cqaSingleAddBtn").addEventListener("click", () => {
  const input = document.getElementById("cqaSingleNameInput");
  if (!input.value.trim()) { cqaShowMsg("상품명을 입력해주세요."); return; }
  cqaAddToPending(input.value);
  cqaRenderPendingList();
  cqaRefreshSelectedInfo();
  input.value = "";
  input.focus();
});
document.getElementById("cqaSingleNameInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("cqaSingleAddBtn").click();
});

document.getElementById("cqaBulkAddBtn").addEventListener("click", () => {
  const textarea = document.getElementById("cqaBulkTextarea");
  const lines = textarea.value.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) { cqaShowMsg("등록할 상품명을 입력해주세요."); return; }
  lines.forEach((line) => cqaAddToPending(line));
  cqaRenderPendingList();
  cqaRefreshSelectedInfo();
  textarea.value = "";
  cqaShowMsg(`${lines.length}건 대기 목록에 추가되었습니다.`);
});

cqaSaveBtn.addEventListener("click", () => {
  if (cqaPendingItems.length === 0) return;
  const savedCodes = [];
  cqaPendingItems.forEach((item) => {
    const row = { no: DS_PRODUCT_MASTER_CATALOG.length + 1, ...item };
    dsAddCustomProductCode(row);
    SUB_AGG_SITE_SETS[0].codes.push(row.code);
    subCategoryAggregate.push(Object.assign({}, row, { siteUsage: 1 }));
    savedCodes.push(row.code);
  });
  dsAddEditLog("전사공통코드(프로덕트코드)", `신규 프로덕트 코드 ${savedCodes.length}건 저장: ${savedCodes.join(", ")}`);
  cqaShowMsg(`${savedCodes.length}건 저장되었습니다.`);
  cqaPendingItems = [];
  cqaRenderPendingList();
  cqaRefreshSelectedInfo();
  cqaApplySubAggFilter();
});

function cqaResetModal() {
  cqaSelectedMajor = null;
  cqaSelectedMid = null;
  cqaPendingItems = [];
  cqaRenderMajorTabs();
  cqaRenderMidList();
  cqaRefreshSelectedInfo();
  cqaRenderPendingList();
  document.querySelectorAll(".cqa-mode-tab").forEach((b) => b.classList.toggle("active", b.dataset.mode === "single"));
}

document.getElementById("productQuickAddBtn").addEventListener("click", () => {
  cqaResetModal();
  productQuickAddModal.hidden = false;
});
document.getElementById("productQuickAddClose").addEventListener("click", () => {
  if (cqaPendingItems.length > 0 && !window.confirm(`저장하지 않은 ${cqaPendingItems.length}건이 있습니다. 저장하지 않고 닫으시겠습니까?`)) return;
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
