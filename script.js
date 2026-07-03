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

// Step tabs
document.querySelectorAll(".step-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".step-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Filter chip toggle (visual only, except search)
document.querySelectorAll(".filter-chip:not(#searchToggle):not(.add-filter)").forEach((btn) => {
  btn.addEventListener("click", () => btn.classList.toggle("active"));
});

// Search
const searchToggle = document.getElementById("searchToggle");
const searchRow = document.getElementById("searchRow");
const searchInput = document.getElementById("searchInput");

searchToggle.addEventListener("click", () => {
  searchRow.classList.toggle("open");
  if (searchRow.classList.contains("open")) searchInput.focus();
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    renderRows(products);
    return;
  }
  const filtered = products.filter((p) =>
    [p.code, p.nameInternal, p.nameCustomer, p.maker, p.model, p.finish]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
  renderRows(filtered);
});

// Sortable column
document.querySelector(".sortable").addEventListener("click", () => {
  productsSortState = !productsSortState;
  const sorted = [...products].sort((a, b) =>
    productsSortState ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code)
  );
  renderRows(sorted);
});
let productsSortState = true;
