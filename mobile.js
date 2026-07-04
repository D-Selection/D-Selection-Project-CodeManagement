(function () {
  "use strict";

  /* ---------------------------------------------------------
   * Icons (inline SVG, line-icon style matching source screens)
   * --------------------------------------------------------- */
  const ICONS = {
    gongjong: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="13" height="17" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 9h5M8 12.5h5M8 16h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M15 17l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M17.5 15.5l3 3-1.5 1.5-3-3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    hp: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3c3 3 5 5.8 5 9a5 5 0 0 1-10 0c0-3.2 2-6 5-9z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="18.5" cy="6.5" r="1.4" fill="currentColor"/></svg>',
    quality: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M17 3.5v3M18.5 5h-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 17V6M8 10l4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    option: '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="7" width="6" height="13" stroke="currentColor" stroke-width="1.4"/><rect x="13" y="10" width="6" height="10" stroke="currentColor" stroke-width="1.4"/><path d="M7 10.5h2M7 13.5h2M15 13h2M15 16h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="11" height="14" rx="1.2" stroke="currentColor" stroke-width="1.4"/><path d="M7 8h5M7 11h5M7 14h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="16.5" cy="15.5" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M18.8 17.8L21 20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    fetch: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 15a4 4 0 0 1 .7-7.9A5.5 5.5 0 0 1 18 9a3.8 3.8 0 0 1-.6 7.5H7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 11v6M9.5 14.5L12 17l2.5-2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    confirm: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    confirmSend: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 16a4 4 0 0 1 .7-7.9A5.5 5.5 0 0 1 18 10a3.8 3.8 0 0 1-.6 7.5H7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 16v-6M9.5 12.5L12 10l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    flag: '<svg viewBox="0 0 20 20" fill="none"><path d="M4 3v14M4 3h9l-2 3.5L13 10H4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    attach: '<svg viewBox="0 0 20 20" fill="none"><path d="M4 6h9a2 2 0 0 1 0 4H6a2 2 0 0 1 0-4h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><rect x="3" y="4" width="14" height="12" rx="1.2" stroke="currentColor" stroke-width="1.3"/></svg>',
    camera: '<svg viewBox="0 0 20 20" fill="none"><rect x="2.5" y="6" width="15" height="10.5" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M7 6l1.2-2h3.6L13 6" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="10" cy="11.2" r="3" stroke="currentColor" stroke-width="1.4"/></svg>',
    save: '<svg viewBox="0 0 20 20" fill="none"><path d="M4 3h9l3 3v11H4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><rect x="6.5" y="3" width="5" height="4.5" stroke="currentColor" stroke-width="1.3"/><rect x="6" y="11" width="8" height="5.5" stroke="currentColor" stroke-width="1.3"/></svg>',
  };

  function mountIcons() {
    const map = {
      "icon-gongjong": ICONS.gongjong,
      "icon-hp": ICONS.hp,
      "icon-quality": ICONS.quality,
      "icon-send": ICONS.send,
      "icon-option": ICONS.option,
      "icon-search": ICONS.search,
      "icon-fetch": ICONS.fetch,
      "icon-confirm": ICONS.confirm,
      "icon-confirm-send": ICONS.confirmSend,
      "icon-flag": ICONS.flag,
      "icon-attach": ICONS.attach,
      "icon-camera": ICONS.camera,
      "icon-save": ICONS.save,
    };
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = map[id];
    });
  }

  /* ---------------------------------------------------------
   * Mock data
   * --------------------------------------------------------- */
  const SITE = { name: "아크로 리츠카운티 현장(19C)" };

  const HP_ITEMS = {
    general: [
      { id: "g1", name: "1) 창호 실리콘 마감" },
      { id: "g2", name: "2) 걸레받이 마감" },
      { id: "g3", name: "3) 스위치/콘센트 위치" },
      { id: "g4", name: "4) 도배 접합부" },
    ],
    option: [
      { id: "o1", name: "1) 아일랜드장 전기배관" },
      { id: "o2", name: "2) 화장대 벽부등 전기배관" },
      { id: "o3", name: "3) 다용도실 배수구 위치" },
      { id: "o4", name: "4) 세면대 배수 위치" },
    ],
  };

  // Building shape: floor -> unit suffix list (matches reference heatmap silhouette)
  const BUILDING_SHAPE = {
    27: [], 26: [], 25: [], 24: [], 23: [], 22: [], 21: [], 20: [], 19: [],
    18: ["02"],
    17: ["02"],
    16: [],
    15: ["01", "02", "03", "04"],
    14: ["02", "03", "04"],
    13: ["01", "02", "03", "04"],
    12: ["02", "03", "04"],
    11: ["01", "02", "03", "04"],
    10: ["01", "02", "03", "04"],
    9: ["01", "02", "03", "04"],
    8: ["01", "02", "03", "04"],
    7: ["01", "02", "03", "04"],
    6: ["03"],
    5: ["01", "02", "03", "04"],
    4: ["02", "03", "04"],
    3: ["01", "02"],
    2: ["01"],
    1: ["01"],
  };
  const FLOORS_DESC = Object.keys(BUILDING_SHAPE).map(Number).sort((a, b) => b - a);

  const HP_STATUS_OVERRIDES = {
    "1001": "ok", "1002": "issue", "0901": "issue", "1101": "issue", "1203": "issue",
  };
  const OPTION_STATUS_OVERRIDES = { "1204": "done" };

  const HP_STATUS_LABELS = {
    ok: "점검완료(이상무)",
    issue: "점검완료(이상유)",
    progress: "점검중",
    none: "미점검",
  };
  const HP_STATUS_COLOR = { ok: "--hp-ok", issue: "--hp-issue", progress: "--hp-progress", none: "--hp-none" };

  const OPTION_STATUS_LABELS = {
    contract: "계약", material: "자재양중", notstarted: "미착수",
    progress: "진행중", wrong: "오시공", done: "시공완료",
  };
  const OPTION_STATUS_COLOR = {
    contract: "--opt-contract", material: "--opt-material", notstarted: "--opt-notstarted",
    progress: "--opt-progress", wrong: "--opt-wrong", done: "--opt-done",
  };

  const OPTION_DETAIL_MOCK = {
    unitTitle: "0101동 1204호 (44)",
    items: [
      {
        text: "44/[모던 내추럴(Modern Natural)]스타일 선택(모던 내추럴)_원목마루(캄리 아이보리), 신발장(PET(리바트/이탈리아산, 푸투라)), 팬트리 도어(이탈리아산 수입가구(푸트라)), 주방 상하부장(PET(리바트/이탈리아산, 푸투라)), 상판 + 벽(엔지니어드스톤(골든쇼어)), 조리대 조명(LED 조명), 냉장고장(PET(리바트/이탈리아산, 푸투라))",
        selected: true,
      },
      { text: "44/발코니확장", selected: false },
    ],
    products: [
      {
        name: "가구 도어(FUTURA)/ 모던 내추럴 / 리바트 ( Model : FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이)",
        status: "done",
        checked: true,
      },
      { name: "가구 조명 / -", status: "notstarted", checked: false },
    ],
  };

  /* ---------------------------------------------------------
   * Navigation state
   * --------------------------------------------------------- */
  const SCREEN_TITLES = {
    home: "mBASS",
    "hp-type": "HP점검유형선택",
    "hp-select": "HP점검 동층호 선택",
    "hp-detail": "HP점검",
    "hp-status": "HP점검현황",
    "option-status": "별매품 시공점검",
    "option-detail": "별매품 시공점검",
    thumbnail: "디버추얼 썸네일보기",
  };

  const state = {
    stack: ["home"],
    hpTab: "option",
    hpSelectedItem: HP_ITEMS.option[0],
    dong: "101동",
    floor: null,
    unit: null,
  };

  function currentScreen() {
    return state.stack[state.stack.length - 1];
  }

  function showScreen(name, opts) {
    opts = opts || {};
    document.querySelectorAll(".screen-m").forEach((el) => el.classList.remove("active"));
    const el = document.getElementById("screen-" + name);
    if (el) el.classList.add("active");
    document.getElementById("headerTitle").textContent = SCREEN_TITLES[name] || "mBASS";
    document.getElementById("backBtn").hidden = name === "home";
    if (opts.render) opts.render();
  }

  function pushScreen(name, opts) {
    state.stack.push(name);
    showScreen(name, opts);
  }

  function goBack() {
    if (state.stack.length <= 1) return;
    state.stack.pop();
    showScreen(currentScreen());
  }

  function goHome() {
    state.stack = ["home"];
    showScreen("home");
  }

  let toastTimer = null;
  function toast(msg) {
    let el = document.querySelector(".toast-m");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast-m";
      document.querySelector(".phone").appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1600);
  }

  /* ---------------------------------------------------------
   * Screen renderers
   * --------------------------------------------------------- */
  function renderHpTypeList() {
    const list = document.getElementById("hpTypeList");
    const items = HP_ITEMS[state.hpTab];
    list.innerHTML = "";
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "radio-item" + (state.hpSelectedItem && state.hpSelectedItem.id === item.id ? " selected" : "");
      row.innerHTML = `<span class="radio-circle"></span><span class="radio-text">${item.name}</span>`;
      row.addEventListener("click", () => {
        state.hpSelectedItem = item;
        renderHpTypeList();
      });
      list.appendChild(row);
    });
  }

  function setHpTab(tab) {
    state.hpTab = tab;
    state.hpSelectedItem = HP_ITEMS[tab][0];
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("active", b.dataset.seg === tab));
    renderHpTypeList();
  }

  function renderHpSelect() {
    document.getElementById("hpSelectDropdownLabel").textContent = state.hpSelectedItem.name;

    const dongCol = document.getElementById("dongCol");
    dongCol.innerHTML = "";
    ["101동"].forEach((d) => {
      const row = document.createElement("div");
      row.className = "select-row" + (state.dong === d ? " selected" : "");
      row.textContent = d;
      row.addEventListener("click", () => {
        state.dong = d;
        renderHpSelect();
      });
      dongCol.appendChild(row);
    });

    const floorCol = document.getElementById("floorCol");
    floorCol.innerHTML = "";
    if (state.floor === null) {
      const firstNonEmpty = FLOORS_DESC.find((f) => BUILDING_SHAPE[f].length > 0);
      state.floor = firstNonEmpty;
      state.unit = BUILDING_SHAPE[firstNonEmpty][0];
    }
    FLOORS_DESC.forEach((f) => {
      const row = document.createElement("div");
      const disabled = BUILDING_SHAPE[f].length === 0;
      row.className = "select-row" + (state.floor === f ? " selected" : "") + (disabled ? " disabled" : "");
      row.textContent = String(f).padStart(2, "0") + "층";
      if (!disabled) {
        row.addEventListener("click", () => {
          state.floor = f;
          state.unit = BUILDING_SHAPE[f][0];
          renderHpSelect();
        });
      }
      floorCol.appendChild(row);
    });

    const unitCol = document.getElementById("unitCol");
    unitCol.innerHTML = "";
    (BUILDING_SHAPE[state.floor] || []).forEach((u) => {
      const row = document.createElement("div");
      row.className = "select-row" + (state.unit === u ? " selected" : "");
      row.textContent = u + "호";
      row.addEventListener("click", () => {
        state.unit = u;
        renderHpSelect();
      });
      unitCol.appendChild(row);
    });

    fixInfoStrip();
  }

  function unitCode() {
    return String(state.floor).padStart(2, "0") + String(state.unit).padStart(2, "0");
  }
  function fixInfoStrip() {
    document.getElementById("hpSelectInfoStrip").textContent =
      `${state.dong} ${unitCode()}호(75A_J) → 입주예정 → 0건`;
  }

  function renderHpDetail() {
    document.getElementById("hpDetailDropdownLabel").textContent = state.hpSelectedItem.name;
    document.getElementById("hpDetailUnitLabel").textContent = `${state.dong} ${unitCode()}호(75A_J)`;
    document.getElementById("hpDetailVendor").textContent = "> 일반전기공사 / 승아전기(주)";

    const body = document.getElementById("hpDetailTableBody");
    body.innerHTML = "";
    const rows = [
      { loc: "주방/식당(완료)", part: "(h) 전열배관(바닥)" },
      { loc: "발코니(확장)", part: "(h) 조명배관(천장)" },
    ];
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.loc}</td>
        <td>${r.part}</td>
        <td>
          <select>
            <option>이상없음(시공)</option>
            <option>미시공</option>
            <option>이상있음</option>
          </select>
        </td>`;
      body.appendChild(tr);
    });
  }

  function renderHpStatus() {
    document.getElementById("hpStatusItemLabel").textContent = state.hpSelectedItem.name;
    document.getElementById("hpStatusDongLabel").textContent = state.dong;

    const legend = document.getElementById("hpLegend");
    legend.innerHTML = "";
    Object.keys(HP_STATUS_LABELS).forEach((key) => {
      const item = document.createElement("span");
      item.className = "legend-item";
      item.innerHTML = `<span class="legend-dot" style="background:var(${HP_STATUS_COLOR[key]})"></span>${HP_STATUS_LABELS[key]}`;
      legend.appendChild(item);
    });

    renderHeatmap("hpHeatmap", HP_STATUS_OVERRIDES, "none", HP_STATUS_COLOR, (floor, unit) => {
      state.floor = floor;
      state.unit = unit;
      pushScreen("hp-detail", { render: renderHpDetail });
    });
  }

  function renderOptionStatus() {
    document.getElementById("optionStatusItemLabel").textContent = "44/[모던 내추럴(Modern Natural)]스타일 선택(모던 내추럴)_원목마루(캄리 아이보리),";
    document.getElementById("optionStatusProductLabel").textContent = "가구 도어(FUTURA)/모던 내추럴 / 리바트 ( Model : FUTURA : YQ4902-G3_WV /";
    document.getElementById("optionDongLabel").textContent = state.dong;

    const legend = document.getElementById("optionLegend");
    legend.innerHTML = "";
    Object.keys(OPTION_STATUS_LABELS).forEach((key) => {
      const item = document.createElement("span");
      item.className = "legend-item";
      item.innerHTML = `<span class="legend-dot" style="background:var(${OPTION_STATUS_COLOR[key]})"></span>${OPTION_STATUS_LABELS[key]}`;
      legend.appendChild(item);
    });

    renderHeatmap("optionHeatmap", OPTION_STATUS_OVERRIDES, "notstarted", OPTION_STATUS_COLOR, (floor, unit) => {
      state.floor = floor;
      state.unit = unit;
      pushScreen("option-detail", { render: renderOptionDetail });
    });
  }

  function renderHeatmap(containerId, overrides, defaultStatus, colorMap, onCellClick) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const table = document.createElement("table");
    table.className = "heatmap-table";
    const maxCols = Math.max(...Object.values(BUILDING_SHAPE).map((u) => u.length), 4);

    FLOORS_DESC.forEach((f) => {
      const tr = document.createElement("tr");
      const labelTd = document.createElement("td");
      labelTd.className = "floor-label";
      labelTd.textContent = String(f).padStart(2, "0") + "층";
      tr.appendChild(labelTd);

      const units = BUILDING_SHAPE[f];
      for (let i = 0; i < maxCols; i++) {
        const td = document.createElement("td");
        if (units[i]) {
          const code = String(f).padStart(2, "0") + units[i];
          const status = overrides[code] || defaultStatus;
          td.className = "unit-cell";
          td.style.background = `var(${colorMap[status]})`;
          td.textContent = code;
          td.addEventListener("click", () => onCellClick(f, units[i]));
        } else {
          td.className = "unit-cell empty";
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    });
    container.appendChild(table);
  }

  function renderOptionDetail() {
    document.getElementById("optionDetailUnitTitle").textContent = OPTION_DETAIL_MOCK.unitTitle;

    const itemList = document.getElementById("optionItemList");
    itemList.innerHTML = "";
    OPTION_DETAIL_MOCK.items.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "option-item-row" + (item.selected ? " selected" : "");
      row.innerHTML = `<span class="option-checkbox"></span><span>${item.text}</span>`;
      row.addEventListener("click", () => {
        OPTION_DETAIL_MOCK.items.forEach((it, i) => (it.selected = i === idx));
        renderOptionDetail();
      });
      itemList.appendChild(row);
    });

    const body = document.getElementById("productTableBody");
    body.innerHTML = "";
    OPTION_DETAIL_MOCK.products.forEach((p, idx) => {
      const tr = document.createElement("tr");
      if (p.checked) tr.classList.add("checked");
      const options = Object.keys(OPTION_STATUS_LABELS)
        .map((k) => `<option value="${k}" ${p.status === k ? "selected" : ""}>${OPTION_STATUS_LABELS[k]}</option>`)
        .join("");
      tr.innerHTML = `
        <td><span class="option-checkbox${p.checked ? " selected" : ""}" style="display:inline-block;${p.checked ? "background:var(--blue);border-color:var(--blue);" : ""}"></span></td>
        <td>${p.name} <button class="thumb-link-btn" data-thumb-idx="${idx}">🖼</button></td>
        <td><select data-product-idx="${idx}">${options}</select></td>`;
      body.appendChild(tr);
    });

    body.querySelectorAll("select[data-product-idx]").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const i = Number(e.target.dataset.productIdx);
        OPTION_DETAIL_MOCK.products[i].status = e.target.value;
      });
    });
    body.querySelectorAll(".thumb-link-btn").forEach((btn) => {
      btn.addEventListener("click", () => pushScreen("thumbnail", { render: renderThumbnail }));
    });
  }

  function renderThumbnail() {
    document.getElementById("thumbMainImage").innerHTML = '<span class="mark-v">V</span>';
    const gallery = document.getElementById("thumbGallery");
    gallery.innerHTML = "";
    [1].forEach(() => {
      const item = document.createElement("div");
      item.className = "thumb-gallery-item";
      item.innerHTML = '<span class="mark-v">V</span>';
      gallery.appendChild(item);
    });
  }

  /* ---------------------------------------------------------
   * Wiring
   * --------------------------------------------------------- */
  function init() {
    mountIcons();

    document.getElementById("backBtn").addEventListener("click", goBack);
    document.getElementById("menuBtn").addEventListener("click", () => toast("메뉴 (준비중)"));
    document.getElementById("siteDownloadBtn").addEventListener("click", () => toast("현장정보를 다운로드했습니다."));

    document.querySelectorAll(".menu-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        const nav = tile.dataset.nav;
        if (tile.dataset.action === "placeholder") {
          toast("준비중인 기능입니다.");
          return;
        }
        if (nav === "hp-type") pushScreen("hp-type", { render: () => setHpTab(state.hpTab) });
        else if (nav === "hp-status") pushScreen("hp-status", { render: renderHpStatus });
        else if (nav === "option-status") pushScreen("option-status", { render: renderOptionStatus });
      });
    });

    document.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => setHpTab(btn.dataset.seg));
    });

    document.getElementById("hpTypeConfirmBtn").addEventListener("click", () => {
      pushScreen("hp-select", { render: renderHpSelect });
    });

    document.getElementById("hpSelectDropdown").addEventListener("click", () => goBack());
    document.getElementById("hpStatusLinkBtn").addEventListener("click", () => pushScreen("hp-status", { render: renderHpStatus }));
    document.getElementById("hpSelectConfirmBtn").addEventListener("click", () => pushScreen("hp-detail", { render: renderHpDetail }));

    document.getElementById("hpDetailDropdown").addEventListener("click", () => goBack());
    document.getElementById("hpDetailPlanBtn").addEventListener("click", () => toast("평면도 (준비중)"));
    document.getElementById("hpDetailCompleteBtn").addEventListener("click", () => toast("점검완료 처리되었습니다."));

    document.getElementById("hpStatusItemDropdown").addEventListener("click", () => goBack());
    document.getElementById("hpStatusDongDropdown").addEventListener("click", () => toast("동 선택 (준비중)"));

    document.getElementById("optionStatusItemDropdown").addEventListener("click", () => toast("항목 선택 (준비중)"));
    document.getElementById("optionStatusProductDropdown").addEventListener("click", () => toast("Product 선택 (준비중)"));
    document.getElementById("optionTargetSetBtn").addEventListener("click", () => toast("점검대상설정 (준비중)"));

    document.getElementById("thumbnailBtn").addEventListener("click", () => pushScreen("thumbnail", { render: renderThumbnail }));
    document.getElementById("defectRegisterBtn").addEventListener("click", () => toast("하자등록 (준비중)"));
    document.getElementById("optionSaveBtn").addEventListener("click", () => toast("저장되었습니다."));

    document.getElementById("siteName").textContent = SITE.name;

    showScreen("home");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
