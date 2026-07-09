/* =====================================================================
   두 시스템(안분표 생성 / D.Selection 코드 관리시스템)이 공유하는
   확정 관리 워크플로우 + 알림 + 이력 상태.
   localStorage에 저장되어 페이지를 이동해도(현장별코드 <-> 1~5단계)
   같은 상태를 이어서 볼 수 있다.
   작업순서 : 0. 현장별코드 → 1.1 프로덕트 → 1.3 프로덕트×상품구성코드 → 1.4 평형그룹매핑
              → 2. 원가 수정 → 3. 판매가 수정 → 4. 상품고객언어
   ===================================================================== */
// 현장 메뉴(site-menu.html)는 본사 확정 데이터를 "가져오기(복사)"한 뒤 독립적으로
// 관리해야 하므로, 본사 워크플로우와는 별도의 localStorage 키를 쓴다. 현장 메뉴는
// shared-state.js를 불러오기 전에 window.DS_STORAGE_KEY_OVERRIDE를 지정해 이 기본값을
// 덮어쓴다 — 본사 화면(index.html/codes-standard.html)은 이 값을 설정하지 않으므로
// 기존 동작에는 영향이 없다.
const DS_STORAGE_KEY = (typeof window !== "undefined" && window.DS_STORAGE_KEY_OVERRIDE) || "dselection_shared_state_v2";

/* =====================================================================
   상품 대분류/중분류 코드체계 (전사공통코드 <-> 1.1 프로덕트 공유)
   -----------------------------------------------------------------------
   2026년 프로덕트 코드체계 개편으로 대분류/중분류 코드·명칭이 바뀌었다.
   기존(구버전) 현장은 계속 구버전 체계로 조회 · 관리하고, 신규 현장부터는
   신규 체계만 사용한다 — 그래서 두 체계를 모두 보관하고, 사이트 코드로
   어느 체계를 써야 하는지 판별한다(dsSiteCodeScheme).
   신규 체계는 DS_PRODUCT_MASTER_CATALOG(= 1.1 프로덕트의 소분류 마스터)에
   실제로 쓰이는 대분류/중분류 코드·명칭과 동일하다.
   ===================================================================== */
const DS_PRODUCT_MAJORS_NEW = [
  { code: "AC", name: "위생기구/수전 액세서리" },
  { code: "CW", name: "구조변경/창호" },
  { code: "EE", name: "전기(조명/스위치/콘센트)" },
  { code: "FM", name: "마감재" },
  { code: "FN", name: "가구" },
  { code: "HA", name: "가전" },
];
const DS_PRODUCT_MIDS_NEW = [
  { majorCode: "AC", code: "001", name: "수전/샤워 액세서리" },
  { majorCode: "AC", code: "002", name: "세면기류" },
  { majorCode: "AC", code: "003", name: "양변기/비데류" },
  { majorCode: "AC", code: "004", name: "욕조류" },
  { majorCode: "AC", code: "005", name: "수건걸이류" },
  { majorCode: "AC", code: "006", name: "스마트 기기" },
  { majorCode: "AC", code: "007", name: "환기/공조기기" },
  { majorCode: "AC", code: "008", name: "설비공사" },
  { majorCode: "CW", code: "001", name: "구조변경" },
  { majorCode: "CW", code: "002", name: "수납가구(클로젯)" },
  { majorCode: "EE", code: "001", name: "조명기기" },
  { majorCode: "EE", code: "002", name: "조명제어/스위치" },
  { majorCode: "EE", code: "003", name: "커튼시스템" },
  { majorCode: "EE", code: "004", name: "콘센트류" },
  { majorCode: "EE", code: "005", name: "기타 전기기기" },
  { majorCode: "EE", code: "006", name: "환기기기" },
  { majorCode: "EE", code: "007", name: "전기공사" },
  { majorCode: "FM", code: "001", name: "바닥재(마루)" },
  { majorCode: "FM", code: "002", name: "벽면 마감재(패널)" },
  { majorCode: "FM", code: "003", name: "도어/창호 마감재" },
  { majorCode: "FM", code: "004", name: "도장 마감재" },
  { majorCode: "FM", code: "005", name: "도배 마감재" },
  { majorCode: "FM", code: "006", name: "타일류" },
  { majorCode: "FM", code: "007", name: "인조대리석/스톤 마감재" },
  { majorCode: "FN", code: "001", name: "주방가전(HA 이관대상)" },
  { majorCode: "FN", code: "002", name: "현관중문" },
  { majorCode: "FN", code: "003", name: "신발장/현관수납" },
  { majorCode: "FN", code: "004", name: "가구 도어" },
  { majorCode: "FN", code: "005", name: "시스템 선반" },
  { majorCode: "FN", code: "006", name: "세탁실 가구" },
  { majorCode: "FN", code: "007", name: "주방/수납 가구" },
  { majorCode: "FN", code: "008", name: "붙박이장" },
  { majorCode: "FN", code: "009", name: "침실가구(침대/매트리스)" },
  { majorCode: "FN", code: "010", name: "데스크/책상" },
  { majorCode: "FN", code: "011", name: "화장대" },
  { majorCode: "FN", code: "012", name: "건식세면대" },
  { majorCode: "FN", code: "013", name: "드레스룸 수납가구" },
  { majorCode: "FN", code: "014", name: "샤워부스" },
  { majorCode: "FN", code: "015", name: "프리미엄 브랜드 주방가구(한샘/라이히트 등)" },
  { majorCode: "FN", code: "016", name: "데이터오류(삭제대상)" },
  { majorCode: "HA", code: "001", name: "냉방기기" },
  { majorCode: "HA", code: "002", name: "주방가전" },
  { majorCode: "HA", code: "003", name: "세탁/의류관리기기" },
  { majorCode: "HA", code: "004", name: "냉장고" },
];

// 구버전 체계(개편 이전) — 기존 현장은 계속 이 체계로 조회한다.
const DS_PRODUCT_MAJORS_LEGACY = [
  { code: "AC", name: "악세서리" },
  { code: "CW", name: "공사성(창호 등)" },
  { code: "EE", name: "전기설비" },
  { code: "FM", name: "마감재(바닥/벽 등)" },
  { code: "FN", name: "가구" },
  { code: "AP", name: "가전" },
];
const DS_PRODUCT_MIDS_LEGACY = [
  { majorCode: "AC", code: "200", name: "국산 주방수전/워터워스유진" },
  { majorCode: "AC", code: "201", name: "국산 주방수전/대림바스" },
  { majorCode: "AC", code: "202", name: "국산 다용도실 하부장 수전/대림바스" },
  { majorCode: "AC", code: "203", name: "국산 일반 세면기 수전/대림바스" },
  { majorCode: "AC", code: "204", name: "국산 언더볼 세면기 수전/대림바스" },
  { majorCode: "AC", code: "205", name: "국산 선반형 샤워수전/대림바스" },
  { majorCode: "AC", code: "206", name: "국산 선반형 욕조수전/대림바스" },
  { majorCode: "AC", code: "207", name: "국산 슬라이드바/대림바스" },
  { majorCode: "AC", code: "208", name: "국산 안마샤워헤드/대림바스" },
  { majorCode: "AC", code: "209", name: "국산 일반 세면기(공용욕실)/대림바스" },
  { majorCode: "AC", code: "210", name: "국산 일반 세면기(부부욕실)/대림바스" },
  { majorCode: "AC", code: "211", name: "국산 언더볼 세면기/대림바스" },
];

// 구버전 체계로 남아있는(=개편 이전에 이미 있던) 현장 코드 목록.
// 이 목록에 있는 현장은 계속 구버전 체계로 관리하고, 목록에 없는(신규) 현장은
// 신규 체계를 기본으로 사용한다.
const DS_LEGACY_SITE_CODES = [
  "001108", "040104", "070925", "080394", "150120", "170020", "170374",
  "180247", "180258", "190197", "200160", "210114", "210115", "230028",
  "230146", "230160", "240196",
];
function dsSiteCodeScheme(siteCode) {
  return DS_LEGACY_SITE_CODES.includes(siteCode) ? "legacy" : "new";
}

/* =====================================================================
   상품 소분류(PK) 마스터 카탈로그 + 현장별 배정 데모 데이터
   -----------------------------------------------------------------------
   1.1 프로덕트 화면과 현장별 표준코드 > 전사공통코드 화면이 함께 참조한다.
   소분류(PK)는 "현장별 관리 항목"이라 표준은 아니지만, 전사공통코드
   화면에서는 현장명을 노출하지 않고 전체 현장의 사용 현황만 집계해 보여준다.
   ===================================================================== */
const DS_PRODUCT_MASTER_CATALOG = [
  { no: 1, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-01", name: "국산 주방수전/워터웍스유진" },
  { no: 2, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-02", name: "국산 주방수전/대림바스" },
  { no: 3, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-03", name: "국산 다용도실 하부장 수전/대림바스" },
  { no: 4, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-04", name: "국산 일반 세면기 수전/대림바스" },
  { no: 5, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-05", name: "국산 언더볼 세면기 수전/대림바스" },
  { no: 6, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-06", name: "국산 선반형 샤워수전/대림바스" },
  { no: 7, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-07", name: "국산 선반형 욕조수전/대림바스" },
  { no: 8, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-08", name: "국산 슬라이드바/대림바스" },
  { no: 9, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-09", name: "국산 안마샤워헤드/대림바스" },
  { no: 10, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "002", midName: "세면기류", code: "AC-002-01", name: "국산 일반 세면기(공용욕실)/대림바스" },
  { no: 11, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "002", midName: "세면기류", code: "AC-002-02", name: "국산 일반 세면기(부부욕실)/대림바스" },
  { no: 12, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "002", midName: "세면기류", code: "AC-002-03", name: "국산 언더볼 세면기/대림바스" },
  { no: 13, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "002", midName: "세면기류", code: "AC-002-04", name: "국산 탑볼 세면기/대림바스" },
  { no: 14, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-01", name: "국산 양변기/대림바스" },
  { no: 15, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-02", name: "국산 양변기(벽배수)/대림바스" },
  { no: 16, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-03", name: "국산 양변기(벽걸이형)/대림바스" },
  { no: 17, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-04", name: "국산 비데일체형 양변기/대림바스" },
  { no: 18, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-05", name: "국산 비데일체형 양변기(벽배수)/대림바스" },
  { no: 19, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-06", name: "국산 분리형 비데/대림바스" },
  { no: 20, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "004", midName: "욕조류", code: "AC-004-01", name: "국산 세라믹 욕조" },
  { no: 21, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "004", midName: "욕조류", code: "AC-004-02", name: "국산 아크릴 욕조" },
  { no: 22, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "005", midName: "수건걸이류", code: "AC-005-01", name: "국산 일반 수건걸이/대림바스" },
  { no: 23, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "005", midName: "수건걸이류", code: "AC-005-02", name: "국산 슬림형 수건걸이/대림바스" },
  { no: 24, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-10", name: "외산 주방수전/한스그로헤" },
  { no: 25, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-11", name: "외산 일반,언더볼 세면기 수전/한스그로헤-서초(단종)" },
  { no: 26, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-12", name: "외산 일반,언더볼 세면기 수전/한스그로헤-방배(단종)" },
  { no: 27, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-13", name: "외산 일반,언더볼 세면기 수전/한스그로헤" },
  { no: 28, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-14", name: "외산 탑볼 세면기 수전/한스그로헤" },
  { no: 29, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-15", name: "외산 선반형 샤워수전/한스그로헤" },
  { no: 30, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-16", name: "외산 선반형 욕조수전/한스그로헤" },
  { no: 31, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-17", name: "외산 슬라이드바/한스그로헤" },
  { no: 32, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "001", midName: "수전/샤워 액세서리", code: "AC-001-18", name: "외산 안마샤워헤드/한스그로헤" },
  { no: 33, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "002", midName: "세면기류", code: "AC-002-05", name: "외산 일반 세면기/아메리칸스탠다드" },
  { no: 34, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "002", midName: "세면기류", code: "AC-002-06", name: "외산 언더볼 세면기/아메리칸스탠다드" },
  { no: 35, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "002", midName: "세면기류", code: "AC-002-07", name: "외산 탑볼 세면기/아메리칸스탠다드" },
  { no: 36, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-07", name: "외산 양변기" },
  { no: 37, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-08", name: "외산 양변기(벽배수)" },
  { no: 38, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-09", name: "외산 양변기(벽걸이형)/게버릿" },
  { no: 39, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-10", name: "외산 비데일체형 양변기" },
  { no: 40, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "003", midName: "양변기/비데류", code: "AC-003-11", name: "외산 비데일체형 양변기(벽배수)/아메리칸스탠다드" },
  { no: 41, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "004", midName: "욕조류", code: "AC-004-03", name: "외산 세라믹 욕조" },
  { no: 42, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "004", midName: "욕조류", code: "AC-004-04", name: "외산 아크릴 욕조" },
  { no: 43, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "006", midName: "스마트 기기", code: "AC-006-01", name: "무선 물내림 스마트 스위치" },
  { no: 44, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-01", name: "기본 욕실팬/고효율 3단" },
  { no: 45, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-02", name: "기본 욕실팬/고효율 1단" },
  { no: 46, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-03", name: "기본 욕실팬/정풍량" },
  { no: 47, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-04", name: "복합환풍기" },
  { no: 48, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-05", name: "실별 환기시스템(D-Air Planner)" },
  { no: 49, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-06", name: "고효율 전열교환기" },
  { no: 50, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-07", name: "공기청정형 전열교환기" },
  { no: 51, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-08", name: "안티바이러스 공기청정형 전열교환기" },
  { no: 52, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-09", name: "렌지후드(일반침니형)" },
  { no: 53, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-10", name: "렌지후드(디사일런트)" },
  { no: 54, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-11", name: "제습기(덕트 연결형)" },
  { no: 55, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "007", midName: "환기/공조기기", code: "AC-007-12", name: "제습기(단독 장비형)" },
  { no: 56, majorCode: "AC", majorName: "위생기구/수전 액세서리", midCode: "008", midName: "설비공사", code: "AC-008-01", name: "설비공사" },
  { no: 57, majorCode: "CW", majorName: "구조변경/창호", midCode: "001", midName: "구조변경", code: "CW-001-01", name: "발코니 확장" },
  { no: 58, majorCode: "CW", majorName: "구조변경/창호", midCode: "001", midName: "구조변경", code: "CW-001-02", name: "시스템 창호" },
  { no: 59, majorCode: "CW", majorName: "구조변경/창호", midCode: "001", midName: "구조변경", code: "CW-001-03", name: "건식 벽체" },
  { no: 60, majorCode: "CW", majorName: "구조변경/창호", midCode: "001", midName: "구조변경", code: "CW-001-04", name: "방화도어" },
  { no: 61, majorCode: "CW", majorName: "구조변경/창호", midCode: "001", midName: "구조변경", code: "CW-001-05", name: "우물천정" },
  { no: 62, majorCode: "CW", majorName: "구조변경/창호", midCode: "001", midName: "구조변경", code: "CW-001-06", name: "주방 레이아웃 변경(ㄱ자형)" },
  { no: 63, majorCode: "CW", majorName: "구조변경/창호", midCode: "001", midName: "구조변경", code: "CW-001-07", name: "주방 레이아웃 변경(一자형)" },
  { no: 64, majorCode: "CW", majorName: "구조변경/창호", midCode: "002", midName: "수납가구(클로젯)", code: "CW-002-01", name: "R1 Closet" },
  { no: 65, majorCode: "CW", majorName: "구조변경/창호", midCode: "002", midName: "수납가구(클로젯)", code: "CW-002-02", name: "R1 Closet Dress" },
  { no: 66, majorCode: "CW", majorName: "구조변경/창호", midCode: "002", midName: "수납가구(클로젯)", code: "CW-002-03", name: "R2 Closet" },
  { no: 67, majorCode: "CW", majorName: "구조변경/창호", midCode: "002", midName: "수납가구(클로젯)", code: "CW-002-04", name: "R3 Closet" },
  { no: 68, majorCode: "CW", majorName: "구조변경/창호", midCode: "002", midName: "수납가구(클로젯)", code: "CW-002-05", name: "R4 Closet" },
  { no: 69, majorCode: "CW", majorName: "구조변경/창호", midCode: "002", midName: "수납가구(클로젯)", code: "CW-002-06", name: "R4 Closet Dress" },
  { no: 70, majorCode: "CW", majorName: "구조변경/창호", midCode: "002", midName: "수납가구(클로젯)", code: "CW-002-07", name: "Alpha Closet" },
  { no: 71, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-01", name: "직부등" },
  { no: 72, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "002", midName: "조명제어/스위치", code: "EE-002-01", name: "거실 디밍 제어시스템(12단계 밝기 조절)" },
  { no: 73, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "003", midName: "커튼시스템", code: "EE-003-01", name: "거실 커튼박스 간접조명" },
  { no: 74, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-02", name: "거실/주방/복도 조명 다운라이트 특화" },
  { no: 75, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-03", name: "현관/거실/주방/복도 조명 다운라이트 특화(NGR)" },
  { no: 76, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-04", name: "복도 스텝등" },
  { no: 77, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "002", midName: "조명제어/스위치", code: "EE-002-02", name: "침실 디밍 제어시스템(12단계 색온도,밝기 조절)" },
  { no: 78, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-05", name: "매입형 욕실장 하부 간접조명" },
  { no: 79, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-06", name: "욕실 센서미등 겸용 다운라이트" },
  { no: 80, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "002", midName: "조명제어/스위치", code: "EE-002-03", name: "거실 스마트 디스플레이 스위치 V1" },
  { no: 81, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "002", midName: "조명제어/스위치", code: "EE-002-04", name: "거실 스마트 디스플레이 스위치 V2" },
  { no: 82, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "002", midName: "조명제어/스위치", code: "EE-002-05", name: "침실 스마트 디스플레이 스위치 V1" },
  { no: 83, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "002", midName: "조명제어/스위치", code: "EE-002-06", name: "침실 스마트 디스플레이 스위치 V2" },
  { no: 84, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-07", name: "벽등/내추럴 모던" },
  { no: 85, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-08", name: "벽등/소프트 클래식" },
  { no: 86, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-09", name: "벽등/내추럴 클래식" },
  { no: 87, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-10", name: "벽등/블랑 클래식" },
  { no: 88, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-11", name: "독서등(사이드테이블*1)" },
  { no: 89, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-12", name: "독서등(사이드테이블*2)" },
  { no: 90, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "002", midName: "조명제어/스위치", code: "EE-002-07", name: "통합컨트롤 조명제어시스템(사이드테이블*1)" },
  { no: 91, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "002", midName: "조명제어/스위치", code: "EE-002-08", name: "통합컨트롤 조명제어시스템(사이드테이블*2)" },
  { no: 92, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "003", midName: "커튼시스템", code: "EE-003-02", name: "스마트 전동커튼레일 2열" },
  { no: 93, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-13", name: "침실1 다운라이트 특화" },
  { no: 94, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-14", name: "다운라이트" },
  { no: 95, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "004", midName: "콘센트류", code: "EE-004-01", name: "무선충전 상판매입 콘센트" },
  { no: 96, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "004", midName: "콘센트류", code: "EE-004-02", name: "상판매입 콘센트" },
  { no: 97, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "004", midName: "콘센트류", code: "EE-004-03", name: "밥솥장 콘센트" },
  { no: 98, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-15", name: "가구 조명" },
  { no: 99, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "004", midName: "콘센트류", code: "EE-004-04", name: "통합형 콘센트" },
  { no: 100, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "004", midName: "콘센트류", code: "EE-004-05", name: "콘센트" },
  { no: 101, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "004", midName: "콘센트류", code: "EE-004-06", name: "콘센트(방우)" },
  { no: 102, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "004", midName: "콘센트류", code: "EE-004-07", name: "유럽형 콘센트" },
  { no: 103, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "004", midName: "콘센트류", code: "EE-004-08", name: "유럽형 콘센트(방우)" },
  { no: 104, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "005", midName: "기타 전기기기", code: "EE-005-01", name: "주방TV" },
  { no: 105, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-16", name: "우물천장 간접조명(12단계 밝기 제어)" },
  { no: 106, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "001", midName: "조명기기", code: "EE-001-17", name: "마그네틱 트랙조명" },
  { no: 107, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "006", midName: "환기기기", code: "EE-006-01", name: "실링팬" },
  { no: 108, majorCode: "EE", majorName: "전기(조명/스위치/콘센트)", midCode: "007", midName: "전기공사", code: "EE-007-01", name: "전기공사" },
  { no: 109, majorCode: "FM", majorName: "마감재", midCode: "001", midName: "바닥재(마루)", code: "FM-001-01", name: "강마루" },
  { no: 110, majorCode: "FM", majorName: "마감재", midCode: "001", midName: "바닥재(마루)", code: "FM-001-02", name: "광폭 강마루" },
  { no: 111, majorCode: "FM", majorName: "마감재", midCode: "001", midName: "바닥재(마루)", code: "FM-001-03", name: "원목마루/캄리아이보리(11.5t)" },
  { no: 112, majorCode: "FM", majorName: "마감재", midCode: "001", midName: "바닥재(마루)", code: "FM-001-04", name: "원목마루/딤그레이(11.5t)" },
  { no: 113, majorCode: "FM", majorName: "마감재", midCode: "001", midName: "바닥재(마루)", code: "FM-001-05", name: "원목마루/캄리아이보리(12.5t)" },
  { no: 114, majorCode: "FM", majorName: "마감재", midCode: "001", midName: "바닥재(마루)", code: "FM-001-06", name: "원목마루/딤그레이(12.5t)" },
  { no: 115, majorCode: "FM", majorName: "마감재", midCode: "001", midName: "바닥재(마루)", code: "FM-001-07", name: "원목마루/캄리아이보리(노량진-조합)" },
  { no: 116, majorCode: "FM", majorName: "마감재", midCode: "001", midName: "바닥재(마루)", code: "FM-001-08", name: "원목마루/딤그레이(노량진-조합)" },
  { no: 117, majorCode: "FM", majorName: "마감재", midCode: "001", midName: "바닥재(마루)", code: "FM-001-09", name: "외산 원목마루" },
  { no: 118, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-01", name: "디자인 월/e편한세상" },
  { no: 119, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-02", name: "디자인 월/아크로" },
  { no: 120, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-03", name: "디자인 월/e편한세상 목창호 패턴" },
  { no: 121, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-04", name: "디자인 월/아크로 목창호 패턴" },
  { no: 122, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-05", name: "세라믹 패널/ARLES BLANCO" },
  { no: 123, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-06", name: "세라믹 패널/LASA DELUXE" },
  { no: 124, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-01", name: "목창호(튜블러 손잡이 포함)" },
  { no: 125, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-02", name: "목창호(모티스 손잡이 포함)" },
  { no: 126, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-07", name: "디자인 월 인피니티 도어/e편한세상" },
  { no: 127, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-08", name: "디자인 월 인피니티 도어(튜블러 손잡이 포함)/아크로" },
  { no: 128, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-09", name: "디자인 월 인피니티 도어(모티스 손잡이 포함)/아크로" },
  { no: 129, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-10", name: "세라믹 패널 인피니티 도어(튜블러 손잡이 포함)/ARLES BLANCO" },
  { no: 130, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-11", name: "세라믹 패널 인피니티 도어(튜블러 손잡이 포함)/LASA DELUXE" },
  { no: 131, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-12", name: "세라믹 패널 인피니티 도어(모티스 손잡이 포함)/ARLES BLANCO" },
  { no: 132, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-13", name: "세라믹 패널 인피니티 도어(모티스 손잡이 포함)/LASA DELUXE" },
  { no: 133, majorCode: "FM", majorName: "마감재", midCode: "004", midName: "도장 마감재", code: "FM-004-01", name: "도장" },
  { no: 134, majorCode: "FM", majorName: "마감재", midCode: "004", midName: "도장 마감재", code: "FM-004-02", name: "탄성코트" },
  { no: 135, majorCode: "FM", majorName: "마감재", midCode: "004", midName: "도장 마감재", code: "FM-004-03", name: "세라믹 탄성코트" },
  { no: 136, majorCode: "FM", majorName: "마감재", midCode: "005", midName: "도배 마감재", code: "FM-005-01", name: "천장지" },
  { no: 137, majorCode: "FM", majorName: "마감재", midCode: "005", midName: "도배 마감재", code: "FM-005-02", name: "벽지" },
  { no: 138, majorCode: "FM", majorName: "마감재", midCode: "006", midName: "타일류", code: "FM-006-01", name: "자기질 타일" },
  { no: 139, majorCode: "FM", majorName: "마감재", midCode: "006", midName: "타일류", code: "FM-006-02", name: "도기질 타일" },
  { no: 140, majorCode: "FM", majorName: "마감재", midCode: "006", midName: "타일류", code: "FM-006-03", name: "포세린 타일/가영세라믹스" },
  { no: 141, majorCode: "FM", majorName: "마감재", midCode: "006", midName: "타일류", code: "FM-006-04", name: "포세린 타일/대동산업" },
  { no: 142, majorCode: "FM", majorName: "마감재", midCode: "006", midName: "타일류", code: "FM-006-05", name: "포세린 타일/건식세탁실" },
  { no: 143, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-01", name: "엔지니어드 스톤-스탠다드/실버쉐이드" },
  { no: 144, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-02", name: "엔지니어드 스톤-스탠다드/골든쇼어" },
  { no: 145, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-03", name: "엔지니어드 스톤-스탠다드/마터호른" },
  { no: 146, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-04", name: "엔지니어드 스톤-프리미엄/솔라로" },
  { no: 147, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-05", name: "엔지니어드 스톤-프리미엄/델라카토" },
  { no: 148, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-06", name: "엔지니어드 스톤-프레스티지/나폴리베이지" },
  { no: 149, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-07", name: "엔지니어드 스톤-프레스티지/몬테비소" },
  { no: 150, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-08", name: "엔지니어드 스톤-칸스톤/르블랑" },
  { no: 151, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-09", name: "엔지니어드 스톤-칸스톤/루나화이트" },
  { no: 152, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-10", name: "MMA/샌디드구스" },
  { no: 153, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-11", name: "MMA/콜리나차이" },
  { no: 154, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-12", name: "컴파운드스톤/아부루조" },
  { no: 155, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-14", name: "패널형마감재/콜렉트월 라임스톤화이트" },
  { no: 156, majorCode: "FM", majorName: "마감재", midCode: "002", midName: "벽면 마감재(패널)", code: "FM-002-15", name: "패널형마감재/콜렉트월 318" },
  { no: 157, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-03", name: "터닝도어/e편한세상 목창호 패턴" },
  { no: 158, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-04", name: "터닝도어/아크로 목창호 패턴" },
  { no: 159, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-05", name: "터닝도어/e편한세상 디자인월 패턴" },
  { no: 160, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-06", name: "터닝도어/아크로 디자인월 패턴" },
  { no: 161, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-07", name: "시트패널/e편한세상 목창호 패턴" },
  { no: 162, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-08", name: "시트패널/아크로 목창호 패턴" },
  { no: 163, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-09", name: "시트패널/e편한세상 디자인월 패턴" },
  { no: 164, majorCode: "FM", majorName: "마감재", midCode: "003", midName: "도어/창호 마감재", code: "FM-003-10", name: "시트패널/아크로 디자인월 패턴" },
  { no: 165, majorCode: "FM", majorName: "마감재", midCode: "007", midName: "인조대리석/스톤 마감재", code: "FM-007-13", name: "엔지니어드 스톤-미존/사비아베이지" },
  { no: 166, majorCode: "FN", majorName: "가구", midCode: "001", midName: "주방가전(HA 이관대상)", code: "FN-001-01", name: "빌트인 식기세척기/LG 디오스 14인용(DUE5NSE)" },
  { no: 167, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-01", name: "현관중문 스윙 도어/LX하우시스 F.3180" },
  { no: 168, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-02", name: "현관중문 스윙 도어/LX하우시스 F.3373" },
  { no: 169, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-03", name: "현관중문 스윙 도어/KCC글라스 F.3373" },
  { no: 170, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-04", name: "현관중문 슬라이딩 도어/LX하우시스 F.3180" },
  { no: 171, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-05", name: "현관중문 슬라이딩 도어/LX하우시스 F.3373" },
  { no: 172, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-06", name: "현관중문 슬라이딩 도어/KCC글라스 F.3373" },
  { no: 173, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-07", name: "현관중문 3연동 도어/LX하우시스 F.3180" },
  { no: 174, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-08", name: "현관중문 3연동 도어/LX하우시스 F.3373" },
  { no: 175, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-09", name: "현관중문 3연동 도어/KCC글라스 F.3373" },
  { no: 176, majorCode: "FN", majorName: "가구", midCode: "002", midName: "현관중문", code: "FN-002-10", name: "4도어 슬라이딩" },
  { no: 177, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-01", name: "신발장(pp)/e편한세상" },
  { no: 178, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-02", name: "신발장(pp)/아크로" },
  { no: 179, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-03", name: "신발장(pp)/e편한세상(추가)" },
  { no: 180, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-04", name: "신발장(pp)/아크로(추가)" },
  { no: 181, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-05", name: "신발장(PET)/미니멀" },
  { no: 182, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-06", name: "신발장(PET)/미니멀(추가)" },
  { no: 183, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-07", name: "신발장(FUTURA)/내추럴 모던" },
  { no: 184, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-08", name: "신발장(FUTURA)/소프트 클래식" },
  { no: 185, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-09", name: "신발장(FUTURA)/내추럴 클래식" },
  { no: 186, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-10", name: "신발장(FUTURA)/블랑 클래식" },
  { no: 187, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-11", name: "신발장(FUTURA)/모던 내추럴" },
  { no: 188, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-12", name: "신발장(FUTURA)/내추럴 모던(추가)" },
  { no: 189, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-13", name: "신발장(FUTURA)/소프트 클래식(추가)" },
  { no: 190, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-14", name: "신발장(FUTURA)/내추럴 클래식(추가)" },
  { no: 191, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-15", name: "신발장(FUTURA)/블랑 클래식(추가)" },
  { no: 192, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-16", name: "오픈형 신발장(PET)/미니멀" },
  { no: 193, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-17", name: "오픈형 신발장(FUTURA)/내추럴 모던" },
  { no: 194, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-18", name: "오픈형 신발장(FUTURA)/소프트 클래식" },
  { no: 195, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-19", name: "오픈형 신발장(FUTURA)/내추럴 클래식" },
  { no: 196, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-20", name: "오픈형 신발장(FUTURA)/블랑 클래식" },
  { no: 197, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-21", name: "오픈형 신발장(FUTURA)/모던 내추럴" },
  { no: 198, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-22", name: "에어브러시" },
  { no: 199, majorCode: "FN", majorName: "가구", midCode: "003", midName: "신발장/현관수납", code: "FN-003-23", name: "신발살균기" },
  { no: 200, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-01", name: "가구 도어(PP)/e편한세상 목창호 패턴" },
  { no: 201, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-02", name: "가구 도어(PP)/아크로 목창호 패턴" },
  { no: 202, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-03", name: "가구 도어(PP)/e편한세상 디자인월 패턴" },
  { no: 203, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-04", name: "가구 도어(PP)/아크로 디자인월 패턴" },
  { no: 204, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-05", name: "가구 도어(PET)/미니멀" },
  { no: 205, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-06", name: "가구 도어(FUTURA)/내추럴 모던" },
  { no: 206, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-07", name: "가구 도어(FUTURA)/소프트 클래식" },
  { no: 207, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-08", name: "가구 도어(FUTURA)/내추럴 클래식" },
  { no: 208, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-09", name: "가구 도어(FUTURA)/블랑 클래식" },
  { no: 209, majorCode: "FN", majorName: "가구", midCode: "004", midName: "가구 도어", code: "FN-004-10", name: "가구 도어(FUTURA)/모던 내추럴" },
  { no: 210, majorCode: "FN", majorName: "가구", midCode: "005", midName: "시스템 선반", code: "FN-005-01", name: "포스트형 시스템 선반/070" },
  { no: 211, majorCode: "FN", majorName: "가구", midCode: "005", midName: "시스템 선반", code: "FN-005-02", name: "포스트형 시스템 선반/048" },
  { no: 212, majorCode: "FN", majorName: "가구", midCode: "005", midName: "시스템 선반", code: "FN-005-03", name: "포스트형 시스템 선반/샤트데코" },
  { no: 213, majorCode: "FN", majorName: "가구", midCode: "005", midName: "시스템 선반", code: "FN-005-04", name: "후면 포스트형 시스템 선반" },
  { no: 214, majorCode: "FN", majorName: "가구", midCode: "005", midName: "시스템 선반", code: "FN-005-05", name: "벽 찬넬형 시스템 선반" },
  { no: 215, majorCode: "FN", majorName: "가구", midCode: "005", midName: "시스템 선반", code: "FN-005-06", name: "벽 패널형 시스템 선반" },
  { no: 216, majorCode: "FN", majorName: "가구", midCode: "006", midName: "세탁실 가구", code: "FN-006-01", name: "다용도실 수납장(PET)" },
  { no: 217, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-01", name: "상,하부장(PET)/미니멀" },
  { no: 218, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-02", name: "상,하부장(FUTURA)/내추럴 모던" },
  { no: 219, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-03", name: "상,하부장(FUTURA)/소프트 클래식" },
  { no: 220, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-04", name: "상,하부장(FUTURA)/내추럴 클래식" },
  { no: 221, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-05", name: "상,하부장(FUTURA)/블랑 클래식" },
  { no: 222, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-06", name: "상,하부장(FUTURA)/모던 내추럴" },
  { no: 223, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-07", name: "아일랜드장 기본형(PET)/미니멀" },
  { no: 224, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-08", name: "아일랜드장 기본형(FUTURA)/내추럴 모던" },
  { no: 225, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-09", name: "아일랜드장 기본형(FUTURA)/소프트 클래식" },
  { no: 226, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-10", name: "아일랜드장 기본형(FUTURA)/내추럴 클래식" },
  { no: 227, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-11", name: "아일랜드장 기본형(FUTURA)/블랑 클래식" },
  { no: 228, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-12", name: "아일랜드장 기본형(FUTURA)/모던 내추럴" },
  { no: 229, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-13", name: "아일랜드장 바 타입형(PET)/미니멀" },
  { no: 230, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-14", name: "아일랜드장 바 타입형(FUTURA)/내추럴 모던" },
  { no: 231, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-15", name: "아일랜드장 바 타입형(FUTURA)/소프트 클래식" },
  { no: 232, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-16", name: "아일랜드장 바 타입형(FUTURA)/내추럴 클래식" },
  { no: 233, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-17", name: "아일랜드장 바 타입형(FUTURA)/블랑 클래식" },
  { no: 234, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-18", name: "아일랜드장 바 타입형(FUTURA)/모던 내추럴" },
  { no: 235, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-19", name: "아일랜드장 식탁결합형(PET)/미니멀" },
  { no: 236, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-20", name: "아일랜드장 식탁결합형(FUTURA)/내추럴 모던" },
  { no: 237, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-21", name: "아일랜드장 식탁결합형(FUTURA)/소프트 클래식" },
  { no: 238, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-22", name: "아일랜드장 식탁결합형(FUTURA)/내추럴 클래식" },
  { no: 239, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-23", name: "아일랜드장 식탁결합형(FUTURA)/블랑 클래식" },
  { no: 240, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-24", name: "아일랜드장 식탁결합형(FUTURA)/모던 내추럴" },
  { no: 241, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-25", name: "아일랜드장 양면수납형(PET)/미니멀" },
  { no: 242, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-26", name: "아일랜드장 양면수납형(FUTURA)/내추럴 모던" },
  { no: 243, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-27", name: "아일랜드장 양면수납형(FUTURA)/소프트 클래식" },
  { no: 244, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-28", name: "아일랜드장 양면수납형(FUTURA)/내추럴 클래식" },
  { no: 245, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-29", name: "아일랜드장 양면수납형(FUTURA)/블랑 클래식" },
  { no: 246, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-30", name: "아일랜드장 양면수납형(FUTURA)/모던 내추럴" },
  { no: 247, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-31", name: "아일랜드장 양면수납 식탁결합형(PET)/미니멀" },
  { no: 248, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-32", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/내추럴 모던" },
  { no: 249, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-33", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/소프트 클래식" },
  { no: 250, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-34", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/내추럴 클래식" },
  { no: 251, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-35", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/블랑 클래식" },
  { no: 252, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-36", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/모던 내추럴" },
  { no: 253, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-37", name: "냉장고장 기본형(PET)/미니멀" },
  { no: 254, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-38", name: "냉장고장 기본형(FUTURA)/내추럴 모던" },
  { no: 255, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-39", name: "냉장고장 기본형(FUTURA)/소프트 클래식" },
  { no: 256, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-40", name: "냉장고장 기본형(FUTURA)/내추럴 클래식" },
  { no: 257, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-41", name: "냉장고장 기본형(FUTURA)/블랑 클래식" },
  { no: 258, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-42", name: "냉장고장 기본형(FUTURA)/모던 내추럴" },
  { no: 259, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-43", name: "선반 수납형 키큰장(PET)/미니멀" },
  { no: 260, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-44", name: "선반 수납형 키큰장(FUTURA)/내추럴 모던" },
  { no: 261, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-45", name: "선반 수납형 키큰장(FUTURA)/소프트 클래식" },
  { no: 262, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-46", name: "선반 수납형 키큰장(FUTURA)/내추럴 클래식" },
  { no: 263, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-47", name: "선반 수납형 키큰장(FUTURA)/블랑 클래식" },
  { no: 264, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-48", name: "선반 수납형 키큰장(FUTURA)/모던 내추럴" },
  { no: 265, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-49", name: "인출식 수납형 키큰장(PET)/미니멀" },
  { no: 266, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-50", name: "인출식 수납형 키큰장(FUTURA)/내추럴 모던" },
  { no: 267, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-51", name: "인출식 수납형 키큰장(FUTURA)/소프트 클래식" },
  { no: 268, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-52", name: "인출식 수납형 키큰장(FUTURA)/내추럴 클래식" },
  { no: 269, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-53", name: "인출식 수납형 키큰장(FUTURA)/블랑 클래식" },
  { no: 270, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-54", name: "인출식 수납형 키큰장(FUTURA)/모던 내추럴" },
  { no: 271, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-55", name: "대형 선반 수납형 키큰장(PET)/미니멀" },
  { no: 272, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-56", name: "대형 선반 수납형 키큰장(FUTURA)/내추럴 모던" },
  { no: 273, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-57", name: "대형 선반 수납형 키큰장(FUTURA)/소프트 클래식" },
  { no: 274, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-58", name: "대형 선반 수납형 키큰장(FUTURA)/내추럴 클래식" },
  { no: 275, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-59", name: "대형 선반 수납형 키큰장(FUTURA)/블랑 클래식" },
  { no: 276, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-60", name: "대형 선반 수납형 키큰장(FUTURA)/모던 내추럴" },
  { no: 277, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-61", name: "대형 인출식 수납형 키큰장(PET)/미니멀" },
  { no: 278, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-62", name: "대형 인출식 수납형 키큰장(FUTURA)/내추럴 모던" },
  { no: 279, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-63", name: "대형 인출식 수납형 키큰장(FUTURA)/소프트 클래식" },
  { no: 280, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-64", name: "대형 인출식 수납형 키큰장(FUTURA)/내추럴 클래식" },
  { no: 281, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-65", name: "대형 인출식 수납형 키큰장(FUTURA)/블랑 클래식" },
  { no: 282, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-66", name: "대형 인출식 수납형 키큰장(FUTURA)/모던 내추럴" },
  { no: 283, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-67", name: "홈바 수납형(PET)/미니멀" },
  { no: 284, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-68", name: "홈바 수납형(FUTURA)/내추럴 모던" },
  { no: 285, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-69", name: "홈바 수납형(FUTURA)/소프트 클래식" },
  { no: 286, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-70", name: "홈바 수납형(FUTURA)/내추럴 클래식" },
  { no: 287, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-71", name: "홈바 수납형(FUTURA)/블랑 클래식" },
  { no: 288, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-72", name: "홈바 수납형(FUTURA)/모던 내추럴" },
  { no: 289, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-73", name: "홈바 윈도우형(PET)/미니멀" },
  { no: 290, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-74", name: "홈바 윈도우형(FUTURA)/내추럴 모던" },
  { no: 291, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-75", name: "홈바 윈도우형(FUTURA)/소프트 클래식" },
  { no: 292, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-76", name: "홈바 윈도우형(FUTURA)/내추럴 클래식" },
  { no: 293, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-77", name: "홈바 윈도우형(FUTURA)/블랑 클래식" },
  { no: 294, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-78", name: "홈바 윈도우형(FUTURA)/모던 내추럴" },
  { no: 295, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-79", name: "상부장" },
  { no: 296, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-80", name: "하부장" },
  { no: 297, majorCode: "FN", majorName: "가구", midCode: "006", midName: "세탁실 가구", code: "FN-006-02", name: "손빨래 하부장" },
  { no: 298, majorCode: "FN", majorName: "가구", midCode: "006", midName: "세탁실 가구", code: "FN-006-03", name: "세탁기장(수직형)" },
  { no: 299, majorCode: "FN", majorName: "가구", midCode: "006", midName: "세탁실 가구", code: "FN-006-04", name: "세탁기장(수직형+키큰장 결합형)" },
  { no: 300, majorCode: "FN", majorName: "가구", midCode: "006", midName: "세탁실 가구", code: "FN-006-05", name: "세탁기장(병렬형)" },
  { no: 301, majorCode: "FN", majorName: "가구", midCode: "008", midName: "붙박이장", code: "FN-008-01", name: "도어형 붙박이장(PP)/e편한세상 목창호 패턴" },
  { no: 302, majorCode: "FN", majorName: "가구", midCode: "008", midName: "붙박이장", code: "FN-008-02", name: "도어형 붙박이장(PP)/아크로 목창호 패턴" },
  { no: 303, majorCode: "FN", majorName: "가구", midCode: "008", midName: "붙박이장", code: "FN-008-03", name: "도어형 붙박이장(PET)/미니멀" },
  { no: 304, majorCode: "FN", majorName: "가구", midCode: "008", midName: "붙박이장", code: "FN-008-04", name: "도어형 붙박이장(PET)/미니멀(추가)" },
  { no: 305, majorCode: "FN", majorName: "가구", midCode: "008", midName: "붙박이장", code: "FN-008-05", name: "도어형 붙박이장(FUTURA)/내추럴 모던" },
  { no: 306, majorCode: "FN", majorName: "가구", midCode: "008", midName: "붙박이장", code: "FN-008-06", name: "도어형 붙박이장(FUTURA)/소프트 클래식" },
  { no: 307, majorCode: "FN", majorName: "가구", midCode: "008", midName: "붙박이장", code: "FN-008-07", name: "도어형 붙박이장(FUTURA)/내추럴 클래식" },
  { no: 308, majorCode: "FN", majorName: "가구", midCode: "008", midName: "붙박이장", code: "FN-008-08", name: "도어형 붙박이장(FUTURA)/블랑 클래식" },
  { no: 309, majorCode: "FN", majorName: "가구", midCode: "008", midName: "붙박이장", code: "FN-008-09", name: "도어형 붙박이장(FUTURA)/모던 내추럴" },
  { no: 310, majorCode: "FN", majorName: "가구", midCode: "009", midName: "침실가구(침대/매트리스)", code: "FN-009-01", name: "침대(내추럴 헤드보드+사이드테이블*1)" },
  { no: 311, majorCode: "FN", majorName: "가구", midCode: "009", midName: "침실가구(침대/매트리스)", code: "FN-009-02", name: "침대(내추럴 헤드보드+사이드테이블*2)" },
  { no: 312, majorCode: "FN", majorName: "가구", midCode: "009", midName: "침실가구(침대/매트리스)", code: "FN-009-03", name: "침대(브라운 헤드보드+사이드테이블*1)" },
  { no: 313, majorCode: "FN", majorName: "가구", midCode: "009", midName: "침실가구(침대/매트리스)", code: "FN-009-04", name: "침대(브라운 헤드보드+사이드테이블*2)" },
  { no: 314, majorCode: "FN", majorName: "가구", midCode: "009", midName: "침실가구(침대/매트리스)", code: "FN-009-05", name: "매트리스/ACE SUITE GRAND(킹사이즈, 가로1600, 세로2000, 높이320)" },
  { no: 315, majorCode: "FN", majorName: "가구", midCode: "009", midName: "침실가구(침대/매트리스)", code: "FN-009-06", name: "매트리스/ACE SUITE ROYAL-PLUS(킹사이즈, 가로1600, 세로2000, 높이350)" },
  { no: 316, majorCode: "FN", majorName: "가구", midCode: "009", midName: "침실가구(침대/매트리스)", code: "FN-009-07", name: "매트리스/ACE SUITE COZY(슈퍼싱글사이즈, 가로1100, 세로2000, 높이270)" },
  { no: 317, majorCode: "FN", majorName: "가구", midCode: "010", midName: "데스크/책상", code: "FN-010-01", name: "데스크(PET)" },
  { no: 318, majorCode: "FN", majorName: "가구", midCode: "009", midName: "침실가구(침대/매트리스)", code: "FN-009-08", name: "데스크+침대프레임(PET)" },
  { no: 319, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-01", name: "화장대(PP)/e편한세상" },
  { no: 320, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-02", name: "화장대(PP)/아크로" },
  { no: 321, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-03", name: "화장대(PET)/미니멀" },
  { no: 322, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-04", name: "화장대(FUTURA)/내추럴 모던" },
  { no: 323, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-05", name: "화장대(FUTURA)/소프트 클래식" },
  { no: 324, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-06", name: "화장대(FUTURA)/내추럴 클래식" },
  { no: 325, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-07", name: "화장대(FUTURA)/블랑 클래식" },
  { no: 326, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-08", name: "화장대(FUTURA)/모던 내추럴" },
  { no: 327, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-09", name: "측면수납형 화장대(PET)/미니멀" },
  { no: 328, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-10", name: "측면수납형 화장대(FUTURA)/내추럴 모던" },
  { no: 329, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-11", name: "측면수납형 화장대(FUTURA)/소프트 클래식" },
  { no: 330, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-12", name: "측면수납형 화장대(FUTURA)/내추럴 클래식" },
  { no: 331, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-13", name: "측면수납형 화장대(FUTURA)/블랑 클래식" },
  { no: 332, majorCode: "FN", majorName: "가구", midCode: "011", midName: "화장대", code: "FN-011-14", name: "측면수납형 화장대(FUTURA)/모던 내추럴" },
  { no: 333, majorCode: "FN", majorName: "가구", midCode: "012", midName: "건식세면대", code: "FN-012-01", name: "건식세면대(PET)/미니멀" },
  { no: 334, majorCode: "FN", majorName: "가구", midCode: "012", midName: "건식세면대", code: "FN-012-02", name: "건식세면대(FUTURA)/내추럴 모던" },
  { no: 335, majorCode: "FN", majorName: "가구", midCode: "012", midName: "건식세면대", code: "FN-012-03", name: "건식세면대(FUTURA)/소프트 클래식" },
  { no: 336, majorCode: "FN", majorName: "가구", midCode: "012", midName: "건식세면대", code: "FN-012-04", name: "건식세면대(FUTURA)/내추럴 클래식" },
  { no: 337, majorCode: "FN", majorName: "가구", midCode: "012", midName: "건식세면대", code: "FN-012-05", name: "건식세면대(FUTURA)/블랑 클래식" },
  { no: 338, majorCode: "FN", majorName: "가구", midCode: "012", midName: "건식세면대", code: "FN-012-06", name: "건식세면대(FUTURA)/모던 내추럴" },
  { no: 339, majorCode: "FN", majorName: "가구", midCode: "005", midName: "시스템 선반", code: "FN-005-07", name: "시스템 선반 의류관리기장" },
  { no: 340, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-01", name: "의류관리기장(PET)/미니멀" },
  { no: 341, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-02", name: "의류관리기장(FUTURA)/내추럴 모던" },
  { no: 342, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-03", name: "의류관리기장(FUTURA)/소프트 클래식" },
  { no: 343, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-04", name: "의류관리기장(FUTURA)/내추럴 클래식" },
  { no: 344, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-05", name: "의류관리기장(FUTURA)/블랑 클래식" },
  { no: 345, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-06", name: "의류관리기장(FUTURA)/모던 내추럴" },
  { no: 346, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-07", name: "오픈형 행거+서랍장(PET)/미니멀" },
  { no: 347, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-08", name: "오픈형 행거+서랍장(FUTURA)/내추럴 모던" },
  { no: 348, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-09", name: "오픈형 행거+서랍장(FUTURA)/소프트 클래식" },
  { no: 349, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-10", name: "오픈형 행거+서랍장(FUTURA)/내추럴 클래식" },
  { no: 350, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-11", name: "오픈형 행거+서랍장(FUTURA)/블랑 클래식" },
  { no: 351, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-12", name: "오픈형 행거+서랍장(FUTURA)/모던 내추럴" },
  { no: 352, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-13", name: "오픈형 책장(PET)/미니멀" },
  { no: 353, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-14", name: "오픈형 책장(FUTURA)/내추럴 모던" },
  { no: 354, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-15", name: "오픈형 책장(FUTURA)/소프트 클래식" },
  { no: 355, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-16", name: "오픈형 책장(FUTURA)/내추럴 클래식" },
  { no: 356, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-17", name: "오픈형 책장(FUTURA)/블랑 클래식" },
  { no: 357, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-18", name: "오픈형 책장(FUTURA)/모던 내추럴" },
  { no: 358, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-19", name: "드레스룸 유리도어(PET)/미니멀" },
  { no: 359, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-20", name: "드레스룸 유리도어(FUTURA)/내추럴 모던" },
  { no: 360, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-21", name: "드레스룸 유리도어(FUTURA)/소프트 클래식" },
  { no: 361, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-22", name: "드레스룸 유리도어(FUTURA)/내추럴 클래식" },
  { no: 362, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-23", name: "드레스룸 유리도어(FUTURA)/블랑 클래식" },
  { no: 363, majorCode: "FN", majorName: "가구", midCode: "013", midName: "드레스룸 수납가구", code: "FN-013-24", name: "드레스룸 유리도어(FUTURA)/모던 내추럴" },
  { no: 364, majorCode: "FN", majorName: "가구", midCode: "014", midName: "샤워부스", code: "FN-014-01", name: "샤워 부스" },
  { no: 365, majorCode: "FN", majorName: "가구", midCode: "014", midName: "샤워부스", code: "FN-014-02", name: "고급형 샤워부스/F.3373" },
  { no: 366, majorCode: "FN", majorName: "가구", midCode: "014", midName: "샤워부스", code: "FN-014-03", name: "고급형 샤워부스/F.3180" },
  { no: 367, majorCode: "FN", majorName: "가구", midCode: "007", midName: "주방/수납 가구", code: "FN-007-81", name: "카운터형 욕실 하부장" },
  { no: 368, majorCode: "FN", majorName: "가구", midCode: "010", midName: "데스크/책상", code: "FN-010-02", name: "데스크(FUTURA)/내추럴 모던" },
  { no: 369, majorCode: "FN", majorName: "가구", midCode: "010", midName: "데스크/책상", code: "FN-010-03", name: "데스크(FUTURA)/소프트 클래식" },
  { no: 370, majorCode: "FN", majorName: "가구", midCode: "010", midName: "데스크/책상", code: "FN-010-04", name: "데스크(FUTURA)/내추럴 클래식" },
  { no: 371, majorCode: "FN", majorName: "가구", midCode: "010", midName: "데스크/책상", code: "FN-010-05", name: "데스크(FUTURA)/블랑 클래식" },
  { no: 372, majorCode: "FN", majorName: "가구", midCode: "010", midName: "데스크/책상", code: "FN-010-06", name: "책상 측면 옵션장_상부찬넬형" },
  { no: 373, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-01", name: "상,하부장/한샘 U1" },
  { no: 374, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-02", name: "상,하부장/한샘 U2" },
  { no: 375, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-03", name: "상,하부장/라이히트" },
  { no: 376, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-04", name: "상,하부장/베네타쿠치네 U1" },
  { no: 377, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-05", name: "상,하부장/베네타쿠치네 U2" },
  { no: 378, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-06", name: "상,하부장/해커 U1" },
  { no: 379, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-07", name: "상,하부장/해커 U2" },
  { no: 380, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-08", name: "아일랜드장/한샘 U1" },
  { no: 381, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-09", name: "아일랜드장/한샘 U2" },
  { no: 382, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-10", name: "아일랜드장/라이히트" },
  { no: 383, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-11", name: "아일랜드장/베네타쿠치네 U1" },
  { no: 384, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-12", name: "아일랜드장/베네타쿠치네 U2" },
  { no: 385, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-13", name: "아일랜드장/해커 U1" },
  { no: 386, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-14", name: "아일랜드장/해커 U2" },
  { no: 387, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-15", name: "냉장고장 기본형/한샘" },
  { no: 388, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-16", name: "냉장고장 기본형/라이히트" },
  { no: 389, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-17", name: "냉장고장 기본형/베네타쿠치네 U1" },
  { no: 390, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-18", name: "냉장고장 기본형/베네타쿠치네 U2" },
  { no: 391, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-19", name: "선반 수납형 키큰장/한샘" },
  { no: 392, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-20", name: "선반 수납형 키큰장/라이히트" },
  { no: 393, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-21", name: "인출식 수납형 키큰장/한샘" },
  { no: 394, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-22", name: "인출식 수납형 키큰장/라이히트" },
  { no: 395, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-23", name: "홈바 수납형/한샘 U1" },
  { no: 396, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-24", name: "홈바 수납형/한샘 U2" },
  { no: 397, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-25", name: "상부장 전동 플랩장/한샘" },
  { no: 398, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-26", name: "전기오븐장/베네타쿠치네 U1" },
  { no: 399, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-27", name: "전기오븐장/베네타쿠치네 U2" },
  { no: 400, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-28", name: "가전 맞춤형 빌트인 냉장고장/베네타쿠치네 U1" },
  { no: 401, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-29", name: "가전 맞춤형 빌트인 냉장고장/베네타쿠치네 U2" },
  { no: 402, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-30", name: "가전 맞춤형 빌트인 냉장고장/해커 U1" },
  { no: 403, majorCode: "FN", majorName: "가구", midCode: "015", midName: "프리미엄 브랜드 주방가구(한샘/라이히트 등)", code: "FN-015-31", name: "가전 맞춤형 빌트인 냉장고장/해커 U2" },
  { no: 404, majorCode: "FN", majorName: "가구", midCode: "016", midName: "데이터오류(삭제대상)", code: "FN-016-01", name: "998" },
  { no: 405, majorCode: "FN", majorName: "가구", midCode: "016", midName: "데이터오류(삭제대상)", code: "FN-016-02", name: "999" },
  { no: 406, majorCode: "HA", majorName: "가전", midCode: "001", midName: "냉방기기", code: "HA-001-01", name: "에어컨/LG" },
  { no: 407, majorCode: "HA", majorName: "가전", midCode: "001", midName: "냉방기기", code: "HA-001-02", name: "에어컨/삼성" },
  { no: 408, majorCode: "HA", majorName: "가전", midCode: "001", midName: "냉방기기", code: "HA-001-03", name: "프리미엄 에어컨/LG" },
  { no: 409, majorCode: "HA", majorName: "가전", midCode: "001", midName: "냉방기기", code: "HA-001-04", name: "프리미엄 에어컨/삼성" },
  { no: 410, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-01", name: "빌트인 전기오븐/나비엔 매직 컨벡션 스팀 오븐" },
  { no: 411, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-02", name: "빌트인 전기오븐/LG 광파오븐" },
  { no: 412, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-03", name: "빌트인 전기오븐/삼성 전기오븐" },
  { no: 413, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-04", name: "빌트인 식기세척기/LG 디오스 14인용(DIE6PT)" },
  { no: 414, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-05", name: "빌트인 식기세척기/LG 오브제 14인용(DUE6BG)" },
  { no: 415, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-06", name: "빌트인 식기세척기/LG 시그니처 14인용(DBS14)" },
  { no: 416, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-07", name: "빌트인 식기세척기/삼성 12인용(DW60T7065SS)" },
  { no: 417, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-08", name: "빌트인 식기세척기/삼성 12인용(DW80F71Y1SEW)" },
  { no: 418, majorCode: "HA", majorName: "가전", midCode: "003", midName: "세탁/의류관리기기", code: "HA-003-01", name: "의류관리기/LG 스타일러 5벌" },
  { no: 419, majorCode: "HA", majorName: "가전", midCode: "003", midName: "세탁/의류관리기기", code: "HA-003-02", name: "세탁기" },
  { no: 420, majorCode: "HA", majorName: "가전", midCode: "003", midName: "세탁/의류관리기기", code: "HA-003-03", name: "건조기" },
  { no: 421, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-01", name: "빌트인 냉장고/LG 오브제 1도어 냉장+냉동+김치(설치키트 포함)" },
  { no: 422, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-02", name: "빌트인 냉장고/LG 오브제 4도어(FIT&MAX)+3도어 김치(FIT&MAX)(설치키트 포함)" },
  { no: 423, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-03", name: "빌트인 냉장고/LG 오브제 4도어+김치(설치키트 포함)" },
  { no: 424, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-04", name: "빌트인 냉장고/LG 오브제 4도어" },
  { no: 425, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-05", name: "빌트인 냉장고/LG 시그니처 냉장+냉동+와인(설치키트 포함)" },
  { no: 426, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-06", name: "빌트인 냉장고/삼성 비스포크 냉장+냉동+김치(설치키트 포함)" },
  { no: 427, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-07", name: "빌트인 냉장고/삼성 비스포크 냉장+냉동+김치(Cotta)(설치키트 포함)" },
  { no: 428, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-08", name: "빌트인 냉장고/삼성 비스포크 냉장+변온+김치(설치키트 포함)" },
  { no: 429, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-09", name: "빌트인 냉장고/삼성 인피니트 냉장+냉동+와인(설치키트,정수필터 포함)" },
  { no: 430, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-10", name: "빌트인 냉장고/삼성 인피니트 냉장+냉동+김치(설치키트,정수필터 포함)" },
  { no: 431, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-09", name: "하이브리드 쿡탑 인덕션/나비엔 매직 가스 3구" },
  { no: 432, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-10", name: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 2구+가스 1구" },
  { no: 433, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-11", name: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 2구+가스 1구" },
  { no: 434, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-12", name: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 2구+하이라이트 1구" },
  { no: 435, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-13", name: "하이브리드 쿡탑 인덕션/나비엔 매직 보더리스 인덕션 4구" },
  { no: 436, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-14", name: "하이브리드 쿡탑 인덕션/LG 인덕션 2구+하이라이트 1구" },
  { no: 437, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-15", name: "하이브리드 쿡탑 인덕션/LG 인덕션 3구" },
  { no: 438, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-16", name: "하이브리드 쿡탑 인덕션/LG 인덕션 3구 25년5월~26년4월" },
  { no: 439, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-17", name: "하이브리드 쿡탑 인덕션/삼성 인덕션 3구" },
  { no: 440, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-18", name: "빌트인 식기세척기/LG 디오스 14인용(DUE5NSE)" },
  { no: 441, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-11", name: "빌트인 냉장고/삼성 비스포크 4도어 키친핏" },
  { no: 442, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-19", name: "하이브리드 쿡탑 인덕션/나비엔 매직 가스 2구" },
  { no: 443, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-20", name: "빌트인 식기세척기/LG 시그니처 12인용(DBS12)-방배" },
  { no: 444, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-12", name: "빌트인 냉장고/LG 오브제 4도어(FIT&MAX)" },
  { no: 445, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-13", name: "빌트인 냉장고/삼성 비스포크 4도어 키친핏+삼성 비스포크 김치(설치키트 포함)" },
  { no: 446, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-21", name: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 2구/단종" },
  { no: 447, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-22", name: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 3구" },
  { no: 448, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-14", name: "빌트인 냉장고/LG 시그니처 냉장+냉동(설치키트 포함)" },
  { no: 449, majorCode: "HA", majorName: "가전", midCode: "004", midName: "냉장고", code: "HA-004-15", name: "빌트인 냉장고/LG 오브제 1도어 냉장+냉동+김치(FIT&MAX)(설치키트 포함)" },
  { no: 450, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-23", name: "빌트인 식기세척기/LG 디오스 14인용(DIE5PT)" },
  { no: 451, majorCode: "HA", majorName: "가전", midCode: "003", midName: "세탁/의류관리기기", code: "HA-003-04", name: "의류관리기/LG 스타일러 3벌" },
  { no: 452, majorCode: "HA", majorName: "가전", midCode: "002", midName: "주방가전", code: "HA-002-24", name: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 3구" },
];

// "다른현장 불러오기"로 가져올 수 있는 예시 현장들 — 각 현장이 마스터 카탈로그 중
// 서로 다른 부분집합을 소분류로 보유한다는 것을 보여주기 위한 데모 데이터.
// 반드시 아래 신규 등록 코드 병합보다 먼저 계산해야 한다 — 그렇지 않으면 방금
// 새로 등록한 코드까지 이 고정된 데모 현장들이 "보유"한 것으로 잘못 집계된다.
const DS_OTHER_SITE_PRODUCT_SETS = [
  { name: "e편한세상 강동 프레스티지 현장", codes: DS_PRODUCT_MASTER_CATALOG.filter((r) => r.majorCode !== "HA").map((r) => r.code) },
  { name: "아크로 리버스카이 현장", codes: DS_PRODUCT_MASTER_CATALOG.filter((r) => ["AC", "FM", "FN"].includes(r.majorCode)).map((r) => r.code) },
  { name: "e편한세상 분당 퍼스트빌리지 현장", codes: DS_PRODUCT_MASTER_CATALOG.filter((r) => r.no % 2 === 1).map((r) => r.code) },
];

/* 사용자가 전사공통코드 화면에서 직접 등록한 신규 프로덕트 코드(소분류/PK)는
   새로고침·다른 화면 이동 후에도 유지되도록 localStorage에 별도로 저장해두고,
   불러올 때 마스터 카탈로그 뒤에 이어붙인다. index.html/site-menu.html/
   codes-standard.html 모두 이 카탈로그를 그대로 공유하므로, 한 화면에서 추가하면
   다른 화면에도 그대로 보인다. */
const DS_CUSTOM_PRODUCT_STORAGE_KEY = "dselection_custom_products_v1";
function dsLoadCustomProducts() {
  try {
    const raw = JSON.parse(localStorage.getItem(DS_CUSTOM_PRODUCT_STORAGE_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}
function dsSaveCustomProducts(list) {
  localStorage.setItem(DS_CUSTOM_PRODUCT_STORAGE_KEY, JSON.stringify(list));
}
dsLoadCustomProducts().forEach((row) => DS_PRODUCT_MASTER_CATALOG.push(row));

function dsAddCustomProductCode(row) {
  DS_PRODUCT_MASTER_CATALOG.push(row);
  const custom = dsLoadCustomProducts();
  custom.push(row);
  dsSaveCustomProducts(custom);
}
function dsRemoveCustomProductCode(code) {
  const idx = DS_PRODUCT_MASTER_CATALOG.findIndex((r) => r.code === code);
  if (idx !== -1) DS_PRODUCT_MASTER_CATALOG.splice(idx, 1);
  dsSaveCustomProducts(dsLoadCustomProducts().filter((r) => r.code !== code));
}


const DS_ROLES = [
  { key: "owner0", name: "최유진", team: "현장관리팀", stageLabel: "0. 현장별코드" },
  { key: "owner11", name: "서지훈", team: "구매기획팀", stageLabel: "1.1 프로덕트" },
  { key: "owner13", name: "이도윤", team: "데이터관리팀", stageLabel: "1.3 프로덕트×상품구성코드" },
  { key: "owner14", name: "안은철", team: "설계팀", stageLabel: "1.4 평형그룹매핑" },
  { key: "owner2", name: "김민준", team: "원가팀", stageLabel: "2. 원가 수정" },
  { key: "owner4", name: "박서연", team: "영업팀", stageLabel: "3. 판매가 수정" },
  { key: "owner3", name: "장하윤", team: "고객언어팀", stageLabel: "4. 상품고객언어" },
];
const DS_STAGE_ORDER = ["s0", "s11", "s13", "s14", "s2", "s4", "s3"];

// 상태바의 단계 배지를 눌렀을 때 이동할 파일. 같은 파일이면 페이지 이동 없이
// ds:goto-stage 이벤트로 탭만 전환하고, 다른 파일이면 #goto=<key> 해시를 달아 이동한다.
const DS_STAGE_FILE = { s0: "codes-standard.html", s11: "index.html", s13: "index.html", s14: "index.html", s2: "index.html", s4: "index.html", s3: "index.html" };

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
    s0: { key: "s0", label: "0. 현장별코드", owner: "owner0", downstream: ["s11"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오전 9:15:00", pendingApprovals: [], justUnlocked: false, round: 1 },
    s11: { key: "s11", label: "1.1 프로덕트", owner: "owner11", downstream: ["s13"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오전 10:20:00", pendingApprovals: [], justUnlocked: false, round: 1 },
    s13: { key: "s13", label: "1.3 프로덕트×상품구성코드", owner: "owner13", downstream: ["s14"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오전 11:02:10", pendingApprovals: [], justUnlocked: false, round: 1 },
    s14: { key: "s14", label: "1.4 평형그룹매핑", owner: "owner14", downstream: ["s2"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 1:31:21", pendingApprovals: [], justUnlocked: false, round: 1 },
    s2: { key: "s2", label: "2. 원가 수정", owner: "owner2", downstream: ["s4"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 5:30:20", pendingApprovals: [], justUnlocked: false, round: 1 },
    s4: { key: "s4", label: "3. 판매가 수정", owner: "owner4", downstream: ["s3"], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 5:30:03", pendingApprovals: [], justUnlocked: false, round: 1 },
    s3: { key: "s3", label: "4. 상품고객언어", owner: "owner3", downstream: [], status: "confirmed", confirmedAt: "2026년 6월 29일 (월) 오후 6:10:45", pendingApprovals: [], justUnlocked: false, round: 1 },
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
      // 이전 버전 저장값에 새 단계(s0, s3, s11)가 없을 수 있으므로 보정
      if (!dsState.stages.s0) dsState.stages.s0 = dsFreshState().stages.s0;
      if (!dsState.stages.s3) dsState.stages.s3 = dsFreshState().stages.s3;
      if (!dsState.stages.s11) dsState.stages.s11 = dsFreshState().stages.s11;
      dsState.stages.s0.downstream = ["s11"];
      dsState.stages.s11.downstream = ["s13"];
      dsState.stages.s13.downstream = ["s14"];
      dsState.stages.s4.downstream = ["s3"];
      dsState.stages.s4.label = "3. 판매가 수정";
      dsState.stages.s3.label = "4. 상품고객언어";
      // 이전 버전 저장값에는 확정 차수(round)가 없을 수 있으므로 보정
      DS_STAGE_ORDER.forEach((k) => {
        if (typeof dsState.stages[k].round !== "number") dsState.stages[k].round = 1;
      });
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

function dsAddHistory(stageKey, text, extra) {
  const s = dsLoad();
  s.workflowHistory.unshift(Object.assign({ id: s.historySeq++, stageKey, text, time: dsNowKorean() }, extra || {}));
}

// 실제 데이터 수정(코드 배정/매핑 등) 로그. 확정/재작업 이력과는 별도로,
// 1-5번 작업화면과 현장별코드 화면에 공통으로 표시된다. 현재 담당자 본인
// 단계의 "확정 차수"를 함께 남겨, 페이지별 변경이 몇 차수에 발생했는지 추적한다.
function dsAddEditLog(scope, text) {
  const s = dsLoad();
  const myStage = Object.values(s.stages).find((st) => st.owner === s.currentRole);
  s.editHistory.unshift({
    id: s.editSeq++,
    scope,
    text,
    time: dsNowKorean(),
    by: dsRoleName(s.currentRole),
    round: myStage ? (myStage.round || 1) : null,
  });
  dsSave();
}

// 단계 순서(DS_STAGE_ORDER) 상에서 이 단계보다 뒤(후행)/앞(선행)에 있는
// 모든 단계 키를 돌려준다. 이 파이프라인은 선형이라 "후행"은 직접 다음
// 단계 하나가 아니라 그 뒤에 있는 모든 단계를 뜻한다.
function dsAllDownstreamKeys(stageKey) {
  const idx = DS_STAGE_ORDER.indexOf(stageKey);
  return idx === -1 ? [] : DS_STAGE_ORDER.slice(idx + 1);
}
function dsAllUpstreamKeys(stageKey) {
  const idx = DS_STAGE_ORDER.indexOf(stageKey);
  return idx <= 0 ? [] : DS_STAGE_ORDER.slice(0, idx);
}

// 잠금(locked, 아직 시작 전) 상태가 아닌 후행 단계만 "관련자"로 본다 —
// 이미 시작했거나 확정된 단계는 선행 작업이 바뀌면 영향을 받기 때문이다.
function dsDownstreamNeedingApproval(stage) {
  const s = dsLoad();
  return dsAllDownstreamKeys(stage.key).filter((k) => s.stages[k].status !== "locked");
}

// 선행 단계의 잠금이 풀려 재작업이 시작되면, 그 사이(및 최종 승인자 본인
// 포함)에 있던 이미 시작/확정된 후행 단계들은 선행 데이터가 바뀌는 동안
// 유효하지 않으므로 모두 "대기(잠금)" 상태로 되돌린다. exceptKey로 넘긴
// 단계는 이미 별도 절차(자기 자신의 재작업 요청 등)로 처리 중이므로 건드리지 않는다.
function dsLockRelatedForRework(stage, exceptKey) {
  const s = dsLoad();
  dsDownstreamNeedingApproval(stage).forEach((k) => {
    if (k === exceptKey) return;
    const d = s.stages[k];
    if (d.status === "locked") return;
    d.status = "locked";
    d.confirmedAt = null;
    d.pendingApprovals = [];
    d.justUnlocked = false;
    d.forceLockedForRework = true;
    dsAddNotification(
      d.owner,
      "reopen_unlocked_fyi",
      `「${stage.label}」의 잠금 해제가 완료되어 재작업이 시작됩니다. 「${d.label}」은(는) 재확정이 필요한 대기 상태로 전환되었습니다.`,
      stage.key
    );
    dsAddHistory(k, `⏸ 「${stage.label}」 재작업 시작에 따라 「${d.label}」이(가) 대기(재확정 필요) 상태로 전환되었습니다.`);
  });
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
      up.round = (up.round || 1) + 1;
      dsAddNotification(up.owner, "reopen_approved", `모든 후속 작업 담당자의 잠금 해제가 완료되었습니다. 「${up.label}」을(를) 다시 수정할 수 있습니다. (${up.round}차)`, up.key);
      dsAddHistory(up.key, `🔓 잠금 해제가 모두 완료되어 「${up.label}」 재작업이 가능합니다. (${up.round}차)`);
      // stageKey 자신은 별도 절차로 이미 재작업 중이므로 잠금 대상에서 제외
      dsLockRelatedForRework(up, stageKey);
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
  dsAddHistory(stageKey, `✔ ${dsRoleName(stage.owner)}님이 「${stage.label}」을(를) 확정했습니다. (${stage.round || 1}차)`);
  stage.downstream.forEach((dKey) => {
    const d = s.stages[dKey];
    if (d.status === "locked") {
      d.status = "editable";
      if (d.forceLockedForRework) {
        d.round = (d.round || 1) + 1;
        d.forceLockedForRework = false;
      }
      dsAddNotification(d.owner, "confirmed", `「${stage.label}」 확정이 완료되었습니다. 이제 「${d.label}」 작업을 시작할 수 있습니다.`, dKey);
      dsAddHistory(dKey, `🔓 「${stage.label}」 확정에 따라 「${d.label}」 작업이 시작 가능해졌습니다.`);
    }
  });

  // 재작업(2차 이상) 끝에 다시 확정한 경우, 바로 다음 단계 외에 더 뒤에 있는
  // 모든 담당자에게도 "선행 작업이 다시 확정됐다"는 참고 알림을 보낸다.
  if ((stage.round || 1) > 1) {
    dsAllDownstreamKeys(stageKey).forEach((k) => {
      if (stage.downstream.includes(k)) return; // 바로 다음 단계는 위에서 이미 알림
      dsAddNotification(
        s.stages[k].owner,
        "upstream_reconfirmed",
        `선행 작업 「${stage.label}」이(가) 재작업 후 다시 확정되었습니다. (${stage.round}차) 관련 작업에 영향이 없는지 확인해주세요.`,
        stageKey
      );
    });
  }
  dsSave();
}

function dsRequestReopen(stageKey, reason) {
  const s = dsLoad();
  const stage = s.stages[stageKey];
  if (stage.status !== "confirmed") return;
  const related = dsDownstreamNeedingApproval(stage);
  const reasonText = reason ? ` 사유: ${reason}` : "";

  if (related.length === 0) {
    stage.status = "editable";
    stage.confirmedAt = null;
    stage.round = (stage.round || 1) + 1;
    dsAddHistory(
      stageKey,
      `↺ ${dsRoleName(stage.owner)}님이 「${stage.label}」 잠금을 해제하고 재작업을 시작했습니다. (후속 작업 미착수로 승인 불필요)${reasonText}`,
      { reason: reason || "" }
    );
    dsAutoResolvePendingApprovalsFor(stageKey);
    dsSave();
    return;
  }

  // 관련자 전원(related)에게 알리되, 실제 승인은 그 중 "가장 마지막(가장 뒤 단계)"
  // 담당자 1명만 하면 된다 — 그 사람이 승인하는 시점엔 그 사이 모든 단계가
  // 이미 확정을 마쳤다는 뜻이므로, 선행 작업의 잠금을 대표로 풀어줄 수 있다.
  const finalApprover = related[related.length - 1];
  stage.status = "reopen_pending";
  stage.pendingApprovals = [finalApprover];

  dsAddHistory(
    stageKey,
    `↺ ${dsRoleName(stage.owner)}님이 「${stage.label}」 재작업을 위해 잠금 해제를 요청했습니다.${reasonText} (최종 승인자: ${dsRoleName(s.stages[finalApprover].owner)})`,
    { reason: reason || "" }
  );

  related.forEach((k) => {
    const d = s.stages[k];
    if (k === finalApprover) {
      const n = dsAddNotification(
        d.owner,
        "reopen_request",
        `${dsRoleName(stage.owner)}님이 「${stage.label}」 재작업을 위해 잠금 해제를 요청했습니다.${reasonText} 승인하면 「${stage.label}」이(가) 재작업 가능한 상태로 바뀝니다.`,
        stageKey
      );
      n.approverStage = k;
    } else {
      dsAddNotification(
        d.owner,
        "reopen_fyi",
        `${dsRoleName(stage.owner)}님이 「${stage.label}」 재작업을 위해 잠금 해제를 요청했습니다.${reasonText} (최종 승인은 ${dsRoleName(s.stages[finalApprover].owner)}님이 진행하며, 참고로 안내드립니다)`,
        stageKey
      );
    }
  });
  dsAutoResolvePendingApprovalsFor(stageKey);
  dsSave();
}

// "확정 강제취소(재작업 요청)" 버튼은 어느 화면에서 누르든 항상 사유를
// 먼저 물어봐야 하므로, 각 화면의 버튼 클릭 핸들러가 공통으로 이 함수를
// 부르게 한다. 사유를 입력하지 않고 취소하면 아무 것도 바꾸지 않는다.
function dsPromptAndRequestReopen(stageKey) {
  const s = dsLoad();
  const stage = s.stages[stageKey];
  const reason = window.prompt(`「${stage.label}」을(를) 재작업해야 하는 사유를 입력해주세요.`, "");
  if (reason === null) return false;
  if (!reason.trim()) { alert("사유를 입력해야 확정을 취소할 수 있습니다."); return false; }
  dsRequestReopen(stageKey, reason.trim());
  return true;
}

function dsCancelReopenRequest(stageKey) {
  const s = dsLoad();
  const stage = s.stages[stageKey];
  if (stage.status !== "reopen_pending") return;
  stage.status = "confirmed";
  stage.pendingApprovals = [];
  s.notifications
    .filter((n) => n.kind === "reopen_request" && n.stageKey === stageKey && !n.resolved)
    .forEach((n) => { n.resolved = true; n.read = true; n.autoResolved = true; });
  dsAddHistory(stageKey, `${dsRoleName(stage.owner)}님이 「${stage.label}」 잠금 해제 요청을 취소했습니다.`);
  dsSave();
}

function dsApproveReopen(notifId) {
  const s = dsLoad();
  const notif = s.notifications.find((n) => n.id === notifId);
  if (!notif || notif.resolved || notif.kind !== "reopen_request") return;
  const stage = s.stages[notif.stageKey];
  notif.resolved = true;
  notif.read = true;
  if (stage.status !== "reopen_pending") return; // 이미 취소되었거나 처리된 요청

  const approverStage = s.stages[notif.approverStage];
  stage.pendingApprovals = [];
  stage.status = "editable";
  stage.confirmedAt = null;
  stage.justUnlocked = true;
  stage.round = (stage.round || 1) + 1;

  dsAddHistory(notif.approverStage, `✅ ${dsRoleName(approverStage.owner)}님이 「${stage.label}」 잠금 해제를 승인했습니다.`);
  dsAddNotification(
    stage.owner,
    "reopen_approved",
    `${dsRoleName(approverStage.owner)}님의 승인으로 잠금 해제가 완료되었습니다. 「${stage.label}」을(를) 다시 수정할 수 있습니다. (${stage.round}차)`,
    stage.key
  );
  dsAddHistory(stage.key, `🔓 ${dsRoleName(approverStage.owner)}님의 승인으로 「${stage.label}」 재작업이 가능합니다. (${stage.round}차)`);

  // 승인한 사람의 단계를 포함해, 그 사이에 있던 모든 후행 단계를 대기
  // (재확정 필요) 상태로 되돌린다 — 승인자도 예외 없이 포함된다.
  dsLockRelatedForRework(stage);

  dsSave();
}

// 후행 작업자가 선행(이미 확정된) 단계의 담당자에게 재작업을 요청한다.
// 상태는 바꾸지 않고 알림/이력만 남긴다 — 실제로 재작업을 시작할지는
// 선행 담당자가 자신의 "확정 강제취소" 버튼을 직접 눌러 결정한다.
function dsRequestReworkFrom(requesterStageKey, targetStageKey, reason) {
  const s = dsLoad();
  const requester = s.stages[requesterStageKey];
  const target = s.stages[targetStageKey];
  if (!requester || !target || !reason) return;
  dsAddNotification(
    target.owner,
    "rework_requested",
    `${dsRoleName(requester.owner)}님이 「${requester.label}」 작업 중 「${target.label}」의 재작업이 필요하다고 요청했습니다. 사유: ${reason}`,
    targetStageKey
  );
  dsAddHistory(
    targetStageKey,
    `📮 ${dsRoleName(requester.owner)}님이 「${requester.label}」 작업 중 「${target.label}」의 재작업을 요청했습니다. 사유: ${reason}`,
    { reason, fromStage: requesterStageKey }
  );
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
        <button class="notif-bell" id="dsReworkBtn" type="button" title="선행 작업에 재작업 요청">🔁 재작업 요청</button>
        <div class="notif-panel rework-panel" id="dsReworkPanel" hidden></div>
      </div>
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
        <span class="status-node-owner">· ${dsRoleName(st.owner)} · ${dsStatusLabel(st.status)}${(st.round || 1) > 1 ? ` · ${st.round}차` : ""}</span>
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
  const reworkBtn = document.getElementById("dsReworkBtn");
  const reworkPanel = document.getElementById("dsReworkPanel");

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
      <div class="notif-item notif-item-clickable ${n.read ? "" : "unread"}" data-stage-key="${n.stageKey || ""}" title="「${n.stageKey ? dsLoad().stages[n.stageKey].label : ""}」 화면으로 이동">
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
        <div class="notif-item-text">[${e.scope}${e.round ? ` · ${e.round}차` : ""}] ${e.text}</div>
        <div class="notif-item-meta">${e.by} · ${e.time}</div>
      </div>
    `).join("");
  }
  renderEditLogPanelInner();

  // 선행 단계에 재작업을 요청하는 폼. 현재 담당자 본인 단계보다 앞(선행)에
  // 있으면서 이미 확정된 단계만 대상으로 고를 수 있다.
  function renderReworkPanel() {
    const myStage = Object.values(dsLoad().stages).find((st) => st.owner === dsGetCurrentRole());
    const targets = myStage
      ? dsAllUpstreamKeys(myStage.key).map((k) => dsLoad().stages[k]).filter((st) => st.status === "confirmed")
      : [];
    if (!myStage || targets.length === 0) {
      reworkPanel.innerHTML = `<div class="notif-panel-title">재작업 요청</div><div class="notif-item-empty">요청할 수 있는 선행(확정된) 단계가 없습니다.</div>`;
      return;
    }
    reworkPanel.innerHTML = `
      <div class="notif-panel-title">재작업 요청 — 어느 선행 단계를 수정해야 하나요?</div>
      <div class="rework-form">
        <select id="reworkTargetSelect">
          ${targets.map((st) => `<option value="${st.key}">${st.label} · ${dsRoleName(st.owner)}</option>`).join("")}
        </select>
        <textarea id="reworkReasonInput" rows="3" placeholder="어떤 수정이 필요한지 사유를 입력해주세요."></textarea>
        <button class="notif-approve-btn" id="reworkSendBtn" type="button">요청 보내기</button>
      </div>
    `;
  }

  notifBell.addEventListener("click", (e) => {
    e.stopPropagation();
    historyPanel.hidden = true;
    editLogPanel.hidden = true;
    reworkPanel.hidden = true;
    notifPanel.hidden = !notifPanel.hidden;
    if (!notifPanel.hidden) {
      dsLoad().notifications.filter((n) => n.to === dsGetCurrentRole()).forEach((n) => { n.read = true; });
      dsSave();
      renderNotifPanel();
    }
  });
  notifPanel.addEventListener("click", (e) => {
    e.stopPropagation();
    const approveBtn = e.target.closest("[data-approve]");
    if (approveBtn) {
      dsApproveReopen(Number(approveBtn.dataset.approve));
      dsRenderStatusBar(containerId, opts);
      if (opts && opts.onStateChange) opts.onStateChange();
      return;
    }
    const item = e.target.closest(".notif-item-clickable[data-stage-key]");
    if (item && item.dataset.stageKey) dsGoToStage(item.dataset.stageKey);
  });

  historyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notifPanel.hidden = true;
    editLogPanel.hidden = true;
    reworkPanel.hidden = true;
    historyPanel.hidden = !historyPanel.hidden;
    if (!historyPanel.hidden) renderHistoryPanelInner();
  });
  historyPanel.addEventListener("click", (e) => e.stopPropagation());

  editLogBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notifPanel.hidden = true;
    historyPanel.hidden = true;
    reworkPanel.hidden = true;
    editLogPanel.hidden = !editLogPanel.hidden;
    if (!editLogPanel.hidden) renderEditLogPanelInner();
  });
  editLogPanel.addEventListener("click", (e) => e.stopPropagation());

  reworkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notifPanel.hidden = true;
    historyPanel.hidden = true;
    editLogPanel.hidden = true;
    reworkPanel.hidden = !reworkPanel.hidden;
    if (!reworkPanel.hidden) renderReworkPanel();
  });
  reworkPanel.addEventListener("click", (e) => {
    e.stopPropagation();
    const sendBtn = e.target.closest("#reworkSendBtn");
    if (!sendBtn) return;
    const targetKey = document.getElementById("reworkTargetSelect").value;
    const reason = document.getElementById("reworkReasonInput").value.trim();
    if (!reason) { alert("어떤 수정이 필요한지 사유를 입력해주세요."); return; }
    const myStage = Object.values(dsLoad().stages).find((st) => st.owner === dsGetCurrentRole());
    dsRequestReworkFrom(myStage.key, targetKey, reason);
    reworkPanel.hidden = true;
    dsRenderStatusBar(containerId, opts);
    if (opts && opts.onStateChange) opts.onStateChange();
  });

  document.addEventListener("click", () => {
    notifPanel.hidden = true;
    historyPanel.hidden = true;
    editLogPanel.hidden = true;
    reworkPanel.hidden = true;
  });
}
