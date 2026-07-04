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

const majors = [
  { code: "AC", name: "악세서리" },
  { code: "CW", name: "공사성(창호 등)" },
  { code: "EE", name: "전기설비" },
  { code: "FM", name: "마감재(바닥/벽 등)" },
  { code: "FN", name: "가구" },
  { code: "AP", name: "가전" },
];
document.getElementById("majorBody").innerHTML = majors.map((m) => `
  <tr class="${m.code === "AC" ? "selected" : ""}"><td>${m.code}</td><td>${m.name}</td></tr>
`).join("");

const mids = [
  { top: "AC", code: "200", name: "국산 주방수전/워터워스유진" },
  { top: "AC", code: "201", name: "국산 주방수전/대림바스" },
  { top: "AC", code: "202", name: "국산 다용도실 하부장 수전/대림바스" },
  { top: "AC", code: "203", name: "국산 일반 세면기 수전/대림바스" },
  { top: "AC", code: "204", name: "국산 언더볼 세면기 수전/대림바스" },
  { top: "AC", code: "205", name: "국산 선반형 샤워수전/대림바스" },
  { top: "AC", code: "206", name: "국산 선반형 욕조수전/대림바스" },
  { top: "AC", code: "207", name: "국산 슬라이드바/대림바스" },
  { top: "AC", code: "208", name: "국산 안마샤워헤드/대림바스" },
  { top: "AC", code: "209", name: "국산 일반 세면기(공용욕실)/대림바스" },
  { top: "AC", code: "210", name: "국산 일반 세면기(부부욕실)/대림바스" },
  { top: "AC", code: "211", name: "국산 언더볼 세면기/대림바스" },
];
document.getElementById("midBody").innerHTML = mids.map((m) => `
  <tr class="${m.code === "200" ? "selected" : ""}"><td>${m.top}</td><td>${m.code}</td><td>${m.name}</td></tr>
`).join("");

document.getElementById("subcatBody").innerHTML = `
  <tr class="selected">
    <td class="ccode-cell">AC-200-01</td>
    <td>01</td>
    <td>D007-AC-200 ｜ D007-AC</td>
    <td>악세서리</td>
    <td>국산 주방수전/워터워스유진</td>
    <td>국산 주방수전/워터워스유진</td>
    <td>국산 주방수전/워터워스유진</td>
  </tr>
`;

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
    document.getElementById("stage0ReopenBtn").addEventListener("click", () => { dsRequestReopen("s0"); renderEverything(); });
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
