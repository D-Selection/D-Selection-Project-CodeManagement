/* ===================== 탭 전환 ===================== */
document.querySelectorAll(".ctab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ctab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".ctab-panel").forEach((p) => p.classList.remove("active"));
    document.getElementById(`cpanel-${btn.dataset.tab}`).classList.add("active");
  });
});

/* ===================== 전사공통코드 ===================== */
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

const custStyles = [
  { code: "MM", name: "미니멀" },
  { code: "MN", name: "모던 내추럴" },
  { code: "NN", name: "스타일 미적용 - None" },
  { code: "SC", name: "소프트클래식" },
  { code: "U1", name: "조합기본1" },
  { code: "U2", name: "조합기본2" },
];
document.getElementById("custStyleBody").innerHTML = custStyles.map((c) => `
  <tr><td>${c.code}</td><td>${c.name}</td></tr>
`).join("");

const styles = [
  { code: "MM", name: "미니멀 - Minimal" },
  { code: "MN", name: "모던 내추럴 - Modern Natural" },
  { code: "NN", name: "스타일 미적용 - None" },
  { code: "SC", name: "소프트 클래식 - Soft Classic" },
  { code: "U1", name: "조합 1안 - Union 1" },
  { code: "U2", name: "조합 2안 - Union 2" },
];
document.getElementById("styleBody").innerHTML = styles.map((s) => `
  <tr><td>${s.code}</td><td>${s.name}</td></tr>
`).join("");

const pyeongs = ["0044:44", "0059:59", "0144:144", "075A:75A", "075B:75B", "084A:84A", "084B:84B", "084C:84C", "084D:84D", "110A:110A", "110B:110B", "110C:110C", "121A:121A", "121B:121B", "138A:138A", "138B:138B"]
  .map((s) => { const [code, name] = s.split(":"); return { code, name }; });
document.getElementById("pyeongBody").innerHTML = pyeongs.map((p) => `
  <tr><td>${p.code}</td><td>${p.name}</td></tr>
`).join("");

document.getElementById("pyeongOptionBody").innerHTML = `<tr><td>NNNN</td><td>기본</td></tr>`;

const plans = [
  { code: "00", name: "미적용" },
  { code: "01", name: "一자형 주방구조 선택시" },
  { code: "02", name: "ㄱ자형 주방구조 선택시" },
];
document.getElementById("planBody").innerHTML = plans.map((p) => `
  <tr><td>${p.code}</td><td>${p.name}</td></tr>
`).join("");

document.getElementById("siteSelectBody").addEventListener("click", (e) => {
  const tr = e.target.closest("tr[data-code]");
  if (!tr) return;
  document.querySelectorAll("#siteSelectBody tr").forEach((r) => r.classList.remove("selected"));
  tr.classList.add("selected");
  const site = sitesCompact.find((s) => s.code === tr.dataset.code);
  document.getElementById("siteHeaderName").textContent = `${site.name} (${site.code})`;
  document.getElementById("batchSelect").innerHTML = `<option>${site.code}-001</option>`;
});
