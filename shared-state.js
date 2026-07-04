/* =====================================================================
   두 시스템(안분표 생성 / D.Selection 코드 관리시스템)이 공유하는
   확정 관리 워크플로우 + 알림 + 이력 상태.
   localStorage에 저장되어 페이지를 이동해도(현장별코드 <-> 1~5단계)
   같은 상태를 이어서 볼 수 있다.
   작업순서 : 0. 현장별코드 → 1.3 프로덕트×상품구성코드 → 1.4 평형그룹매핑
              → 2. 원가 수정 → 3. 판매가 수정 → 4. 상품고객언어
   ===================================================================== */
const DS_STORAGE_KEY = "dselection_shared_state_v2";

const DS_ROLES = [
  { key: "owner0", name: "최유진", team: "현장관리팀", stageLabel: "0. 현장별코드" },
  { key: "owner13", name: "이도윤", team: "데이터관리팀", stageLabel: "1.3 프로덕트×상품구성코드" },
  { key: "owner14", name: "안은철", team: "설계팀", stageLabel: "1.4 평형그룹매핑" },
  { key: "owner2", name: "김민준", team: "원가팀", stageLabel: "2. 원가 수정" },
  { key: "owner4", name: "박서연", team: "영업팀", stageLabel: "3. 판매가 수정" },
  { key: "owner3", name: "장하윤", team: "고객언어팀", stageLabel: "4. 상품고객언어" },
];
const DS_STAGE_ORDER = ["s0", "s13", "s14", "s2", "s4", "s3"];

// 상태바의 단계 배지를 눌렀을 때 이동할 파일. 같은 파일이면 페이지 이동 없이
// ds:goto-stage 이벤트로 탭만 전환하고, 다른 파일이면 #goto=<key> 해시를 달아 이동한다.
const DS_STAGE_FILE = { s0: "codes-standard.html", s13: "index.html", s14: "index.html", s2: "index.html", s4: "index.html", s3: "index.html" };

function dsCurrentFile() {
  const name = location.pathname.split("/").pop();
  return name || "index.html";
}

function dsGoToStage(stageKey) {
  const file = DS_STAGE_FILE[stageKey];
  if (!file) return;
  if (dsCurrentFile() === file) {
    document.dispatchEvent(new CustomEvent("ds:goto-stage", { detail: { stageKey } }));
  } else {
    location.href = `${file}#goto=${stageKey}`;
  }
}

// 페이지 로드 시 호출: 다른 화면에서 넘어온 "#goto=stageKey" 해시가 있으면
// 그 값을 반환하고 해시는 지운다. 없으면 null.
function dsConsumeGotoHash() {
  const m = location.hash.match(/^#goto=(\w+)$/);
  if (!m) return null;
  history.replaceState(null, "", location.pathname + location.search);
  return m[1];
}

function dsRoleName(key) {
  const r = DS_ROLES.find((x) => x.key === key);
  return r ? `${r.name}(${r.team})` : key;
}

function dsStatusLabel(status) {
  return { locked: "대기(잠금)", editable: "작업중", confirmed: "확정완료", reopen_pending: "잠금해제 요청중" }[status];
}

function dsDefaultStages() {
  return {
    s0: { key: "s0", label: "0. 현장별코드", owner: "owner0", downstream: ["s13"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오전 9:15:00", pendingApprovals: [], justUnlocked: false },
    s13: { key: "s13", label: "1.3 프로덕트×상품구성코드", owner: "owner13", downstream: ["s14"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오전 11:02:10", pendingApprovals: [], justUnlocked: false },
    s14: { key: "s14", label: "1.4 평형그룹매핑", owner: "owner14", downstream: ["s2"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 1:31:21", pendingApprovals: [], justUnlocked: false },
    s2: { key: "s2", label: "2. 원가 수정", owner: "owner2", downstream: ["s4"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 5:30:20", pendingApprovals: [], justUnlocked: false },
    s4: { key: "s4", label: "3. 판매가 수정", owner: "owner4", downstream: ["s3"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 5:30:03", pendingApprovals: [], justUnlocked: false },
    s3: { key: "s3", label: "4. 상품고객언어", owner: "owner3", downstream: [], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 6:10:45", pendingApprovals: [], justUnlocked: false },
  };
}

function dsFreshState() {
  return {
    stages: dsDefaultStages(),
    notifications: [],
    workflowHistory: [],
    editHistory: [],
    currentRole: "owner0",
    notifSeq: 1,
    historySeq: 1,
    editSeq: 1,
  };
}

let dsState = null;

function dsLoad() {
  if (dsState) return dsState;
  try {
    const raw = localStorage.getItem(DS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const fresh = dsFreshState();
      dsState = Object.assign(fresh, parsed);
      // 이전 버전 저장값에 새 단계(s0, s3)가 없을 수 있으므로 보정
      if (!dsState.stages.s0) dsState.stages.s0 = dsFreshState().stages.s0;
      if (!dsState.stages.s3) dsState.stages.s3 = dsFreshState().stages.s3;
      dsState.stages.s13.downstream = ["s14"];
      dsState.stages.s0.downstream = ["s13"];
      dsState.stages.s4.downstream = ["s3"];
      dsState.stages.s4.label = "3. 판매가 수정";
      dsState.stages.s3.label = "4. 상품고객언어";
      return dsState;
    }
  } catch (e) {}
  dsState = dsFreshState();
  return dsState;
}

function dsSave() {
  localStorage.setItem(DS_STORAGE_KEY, JSON.stringify(dsState));
}

function dsGetCurrentRole() {
  return dsLoad().currentRole;
}
function dsSetCurrentRole(roleKey) {
  const s = dsLoad();
  s.currentRole = roleKey;
  dsSave();
}

function dsNowKorean() {
  const d = new Date();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  const hour24 = d.getHours();
  const ampm = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday}) ${ampm} ${hour12}:${min}`;
}

function dsAddNotification(toRoleKey, kind, text, stageKey) {
  const s = dsLoad();
  const n = { id: s.notifSeq++, to: toRoleKey, kind, text, time: dsNowKorean(), read: false, resolved: false, stageKey, approverStage: null };
  s.notifications.unshift(n);
  return n;
}

function dsAddHistory(stageKey, text) {
  const s = dsLoad();
  s.workflowHistory.unshift({ id: s.historySeq++, stageKey, text, time: dsNowKorean() });
}

// 실제 데이터 수정(코드 배정/매핑 등) 로그. 확정/재작업 이력과는 별도로,
// 1-5번 작업화면과 현장별코드 화면에 공통으로 표시된다.
function dsAddEditLog(scope, text) {
  const s = dsLoad();
  s.editHistory.unshift({ id: s.editSeq++, scope, text, time: dsNowKorean(), by: dsRoleName(s.currentRole) });
  dsSave();
}

function dsDownstreamNeedingApproval(stage) {
  const s = dsLoad();
  return stage.downstream.filter((k) => s.stages[k].status !== "locked");
}

function dsAutoResolvePendingApprovalsFor(stageKey) {
  const s = dsLoad();
  Object.values(s.stages).forEach((up) => {
    if (up.status !== "reopen_pending" || !up.pendingApprovals.includes(stageKey)) return;
    const approverStage = s.stages[stageKey];

    up.pendingApprovals = up.pendingApprovals.filter((k) => k !== stageKey);
    dsAddHistory(
      stageKey,
      `↺ ${dsRoleName(approverStage.owner)}님이 「${approverStage.label}」을(를) 직접 해제하여, 「${up.label}」의 잠금 해제 요청이 (승인 버튼 없이) 자동 완료 처리되었습니다.`
    );

    s.notifications
      .filter((n) => n.kind === "reopen_request" && n.stageKey === up.key && n.approverStage === stageKey && !n.resolved)
      .forEach((n) => { n.resolved = true; n.read = true; n.autoResolved = true; });

    if (up.pendingApprovals.length === 0) {
      up.status = "editable";
      up.confirmedAt = null;
      up.justUnlocked = true;
      dsAddNotification(up.owner, "reopen_approved", `모든 후속 작업 담당자의 잠금 해제가 완료되었습니다. 「${up.label}」을(를) 다시 수정할 수 있습니다.`, up.key);
      dsAddHistory(up.key, `🔓 잠금 해제가 모두 완료되어 「${up.label}」 재작업이 가능합니다.`);
    }
  });
}

function dsConfirmStage(stageKey) {
  const s = dsLoad();
  const stage = s.stages[stageKey];
  if (stage.status !== "editable") return;
  stage.status = "confirmed";
  stage.confirmedAt = dsNowKorean();
  stage.justUnlocked = false;
  dsAddHistory(stageKey, `✔ ${dsRoleName(stage.owner)}님이 「${stage.label}」을(를) 확정했습니다.`);
  stage.downstream.forEach((dKey) => {
    const d = s.stages[dKey];
    if (d.status === "locked") {
      d.status = "editable";
      dsAddNotification(d.owner, "confirmed", `「${stage.label}」 확정이 완료되었습니다. 이제 「${d.label}」 작업을 시작할 수 있습니다.`, dKey);
      dsAddHistory(dKey, `🔓 「${stage.label}」 확정에 따라 「${d.label}」 작업이 시작 가능해졌습니다.`);
    }
  });
  dsSave();
}

function dsRequestReopen(stageKey) {
  const s = dsLoad();
  const stage = s.stages[stageKey];
  if (stage.status !== "confirmed") return;
  const approvers = dsDownstreamNeedingApproval(stage);
  if (approvers.length === 0) {
    stage.status = "editable";
    stage.confirmedAt = null;
    dsAddHistory(stageKey, `↺ ${dsRoleName(stage.owner)}님이 「${stage.label}」 잠금을 해제하고 재작업을 시작했습니다. (후속 작업 미착수로 승인 불필요)`);
    dsAutoResolvePendingApprovalsFor(stageKey);
    dsSave();
    return;
  }
  stage.status = "reopen_pending";
  stage.pendingApprovals = approvers.slice();
  dsAddHistory(
    stageKey,
    `↺ ${dsRoleName(stage.owner)}님이 「${stage.label}」 재작업을 위해 잠금 해제를 요청했습니다. (승인 필요: ${approvers.map((k) => dsRoleName(s.stages[k].owner)).join(", ")})`
  );
  approvers.forEach((dKey) => {
    const d = s.stages[dKey];
    const n = dsAddNotification(
      d.owner,
      "reopen_request",
      `${dsRoleName(stage.owner)}님이 「${stage.label}」 재작업을 위해 잠금 해제를 요청했습니다. 승인하면 「${d.label}」은(는) 다시 확정해야 합니다.`,
      stageKey
    );
    n.approverStage = dKey;
  });
  dsAutoResolvePendingApprovalsFor(stageKey);
  dsSave();
}

function dsCancelReopenRequest(stageKey) {
  const s = dsLoad();
  const stage = s.stages[stageKey];
  if (stage.status !== "reopen_pending") return;
  stage.status = "confirmed";
  stage.pendingApprovals = [];
  dsAddHistory(stageKey, `${dsRoleName(stage.owner)}님이 「${stage.label}」 잠금 해제 요청을 취소했습니다.`);
  dsSave();
}

function dsApproveReopen(notifId) {
  const s = dsLoad();
  const notif = s.notifications.find((n) => n.id === notifId);
  if (!notif || notif.resolved || notif.kind !== "reopen_request") return;
  const stage = s.stages[notif.stageKey];
  const approverStage = s.stages[notif.approverStage];
  notif.resolved = true;
  notif.read = true;

  stage.pendingApprovals = stage.pendingApprovals.filter((k) => k !== notif.approverStage);
  approverStage.status = "locked";
  approverStage.confirmedAt = null;
  approverStage.justUnlocked = false;
  dsAddHistory(notif.approverStage, `✅ ${dsRoleName(approverStage.owner)}님이 「${stage.label}」 잠금 해제를 승인했습니다. 「${approverStage.label}」은(는) 재확정이 필요합니다.`);

  if (stage.pendingApprovals.length === 0) {
    stage.status = "editable";
    stage.confirmedAt = null;
    stage.justUnlocked = true;
    dsAddNotification(stage.owner, "reopen_approved", `모든 후속 작업 담당자가 잠금 해제를 승인했습니다. 「${stage.label}」을(를) 다시 수정할 수 있습니다.`, stage.key);
    dsAddHistory(stage.key, `🔓 잠금 해제 승인이 모두 완료되어 「${stage.label}」 재작업이 가능합니다.`);
  }
  dsSave();
}

/* ---- 공용 상태바 UI (역할 전환 / 알림 / 확정이력 / 수정로그) ----
   각 페이지는 #dsStatusStrip 컨테이너 하나만 두면 되고,
   dsRenderStatusBar()를 호출해 내용을 채운다. */
function dsRenderStatusBar(containerId, opts) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="status-strip-stages" id="dsStages"></div>
    <div class="status-strip-actions">
      <label class="role-switcher">
        현재 담당자
        <select id="dsRoleSelect"></select>
      </label>
      <div class="notif-wrap">
        <button class="notif-bell" id="dsEditLogBtn" type="button" title="수정 로그">📝 수정로그</button>
        <div class="notif-panel history-panel" id="dsEditLogPanel" hidden></div>
      </div>
      <div class="notif-wrap">
        <button class="notif-bell" id="dsHistoryBtn" type="button" title="확정/재작업 이력">🕘 이력</button>
        <div class="notif-panel history-panel" id="dsHistoryPanel" hidden></div>
      </div>
      <div class="notif-wrap">
        <button class="notif-bell" id="dsNotifBell" type="button">
          🔔<span class="notif-badge" id="dsNotifBadge" hidden>0</span>
        </button>
        <div class="notif-panel" id="dsNotifPanel" hidden></div>
      </div>
    </div>
  `;

  const roleSelect = document.getElementById("dsRoleSelect");
  roleSelect.innerHTML = DS_ROLES.map((r) => `<option value="${r.key}">${r.name} · ${r.stageLabel}</option>`).join("");
  roleSelect.value = dsGetCurrentRole();
  roleSelect.addEventListener("change", () => {
    dsSetCurrentRole(roleSelect.value);
    dsRenderStatusBar(containerId, opts);
    if (opts && opts.onRoleChange) opts.onRoleChange();
  });

  const stagesEl = document.getElementById("dsStages");
  const s = dsLoad();
  stagesEl.innerHTML = DS_STAGE_ORDER.map((key, i) => {
    const st = s.stages[key];
    const node = `
      <button type="button" class="status-node" data-stage-key="${key}" title="「${st.label}」 화면으로 이동">
        <span class="status-dot ${st.status}"></span>
        <span class="status-node-label">${st.label}</span>
        <span class="status-node-owner">· ${dsRoleName(st.owner)} · ${dsStatusLabel(st.status)}</span>
      </button>`;
    return i < DS_STAGE_ORDER.length - 1 ? node + `<span class="status-arrow">→</span>` : node;
  }).join("");
  stagesEl.querySelectorAll(".status-node").forEach((btn) => {
    btn.addEventListener("click", () => dsGoToStage(btn.dataset.stageKey));
  });

  const notifBell = document.getElementById("dsNotifBell");
  const notifPanel = document.getElementById("dsNotifPanel");
  const notifBadge = document.getElementById("dsNotifBadge");
  const historyBtn = document.getElementById("dsHistoryBtn");
  const historyPanel = document.getElementById("dsHistoryPanel");
  const editLogBtn = document.getElementById("dsEditLogBtn");
  const editLogPanel = document.getElementById("dsEditLogPanel");

  function renderNotifPanel() {
    const mine = dsLoad().notifications.filter((n) => n.to === dsGetCurrentRole());
    const unread = mine.filter((n) => !n.read).length;
    notifBadge.hidden = unread === 0;
    notifBadge.textContent = unread;
    if (mine.length === 0) {
      notifPanel.innerHTML = `<div class="notif-panel-title">알림 (${dsRoleName(dsGetCurrentRole())})</div><div class="notif-item-empty">받은 알림이 없습니다.</div>`;
      return;
    }
    notifPanel.innerHTML = `<div class="notif-panel-title">알림 (${dsRoleName(dsGetCurrentRole())})</div>` + mine.map((n) => `
      <div class="notif-item ${n.read ? "" : "unread"}">
        <div class="notif-item-text">${n.text}</div>
        <div class="notif-item-meta">${n.time}</div>
        ${n.kind === "reopen_request" && !n.resolved ? `<button class="notif-approve-btn" data-approve="${n.id}">승인</button>` : ""}
        ${n.kind === "reopen_request" && n.resolved ? `<span class="notif-resolved-tag">✓ ${n.autoResolved ? "자동 완료 (직접 해제함)" : "승인 완료"}</span>` : ""}
      </div>
    `).join("");
  }
  renderNotifPanel();

  function renderHistoryPanelInner() {
    const hist = dsLoad().workflowHistory;
    if (hist.length === 0) {
      historyPanel.innerHTML = `<div class="notif-panel-title">확정 / 재작업 이력</div><div class="notif-item-empty">아직 이력이 없습니다.</div>`;
      return;
    }
    historyPanel.innerHTML = `<div class="notif-panel-title">확정 / 재작업 이력 (전체 ${hist.length}건)</div>` + hist.map((h) => `
      <div class="notif-item">
        <div class="notif-item-text">${h.text}</div>
        <div class="notif-item-meta">${h.time}</div>
      </div>
    `).join("");
  }
  renderHistoryPanelInner();

  function renderEditLogPanelInner() {
    const log = dsLoad().editHistory;
    if (log.length === 0) {
      editLogPanel.innerHTML = `<div class="notif-panel-title">수정 로그 (모든 담당자 공개)</div><div class="notif-item-empty">아직 수정 내역이 없습니다.</div>`;
      return;
    }
    editLogPanel.innerHTML = `<div class="notif-panel-title">수정 로그 (모든 담당자 공개, 전체 ${log.length}건)</div>` + log.map((e) => `
      <div class="notif-item">
        <div class="notif-item-text">[${e.scope}] ${e.text}</div>
        <div class="notif-item-meta">${e.by} · ${e.time}</div>
      </div>
    `).join("");
  }
  renderEditLogPanelInner();

  notifBell.addEventListener("click", (e) => {
    e.stopPropagation();
    historyPanel.hidden = true;
    editLogPanel.hidden = true;
    notifPanel.hidden = !notifPanel.hidden;
    if (!notifPanel.hidden) {
      dsLoad().notifications.filter((n) => n.to === dsGetCurrentRole()).forEach((n) => { n.read = true; });
      dsSave();
      renderNotifPanel();
    }
  });
  notifPanel.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("[data-approve]");
    if (btn) {
      dsApproveReopen(Number(btn.dataset.approve));
      dsRenderStatusBar(containerId, opts);
      if (opts && opts.onStateChange) opts.onStateChange();
    }
  });

  historyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notifPanel.hidden = true;
    editLogPanel.hidden = true;
    historyPanel.hidden = !historyPanel.hidden;
    if (!historyPanel.hidden) renderHistoryPanelInner();
  });
  historyPanel.addEventListener("click", (e) => e.stopPropagation());

  editLogBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notifPanel.hidden = true;
    historyPanel.hidden = true;
    editLogPanel.hidden = !editLogPanel.hidden;
    if (!editLogPanel.hidden) renderEditLogPanelInner();
  });
  editLogPanel.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", () => {
    notifPanel.hidden = true;
    historyPanel.hidden = true;
    editLogPanel.hidden = true;
  });
}
