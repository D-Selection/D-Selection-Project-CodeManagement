/* 전체 화면정의서 : 이 시스템(index.html/site-menu.html/codes-standard.html/codes-landing.html)의
   모든 화면과 팝업을 한곳에 정리한 문서 도구. 화면 목록 자체는 이 파일의 SCREEN_SPEC_DATA에
   고정 데이터로 담겨 있고(코드 변경 시 사람이 갱신), 코멘트만 localStorage에 저장되어
   새로고침해도 유지되며 "저장하기"로 CSV(엑셀 호환)로 내보낼 수 있다. */

const SCREEN_SPEC_STORAGE_KEY = "dselection_screenspec_comments_v1";

const SCREEN_SPEC_DATA = [
  // ---------------- 화면 (index.html / site-menu.html : STEP 1 상품구성) ----------------
  {
    id: "scr-product",
    type: "screen",
    menu: "1. 상품구성 › 1.1 프로덕트",
    files: "index.html · site-menu.html",
    name: "1.1 프로덕트 (소분류 마스터)",
    features: [
      "대분류코드/대분류명 · 그룹명 · 중분류코드/중분류명 · 소분류코드(PK) · 상품명, 445건 표",
      "검색(코드/상품명/대분류명/중분류명) 및 대분류/그룹명/중분류 필터칩",
      "프로덕트 Excel 업로드/다운로드, \"📥 다른현장 불러오기\" (다른 현장의 소분류 데이터 복사)",
      "현장 메뉴(site-menu.html)에서는 \"현장 표기명\" 오버레이 컬럼이 추가됨 — 분양 시 원본 값은 그대로 두고 오버레이만 별도 저장/초기화(↺)",
      "1.1 확정(stage11) 전까지는 잠금 오버레이로 편집 제한",
    ],
    notes: "",
  },
  {
    id: "scr-sku",
    type: "screen",
    menu: "1. 상품구성 › 1.2 상품구성코드",
    files: "index.html · site-menu.html",
    name: "1.2 상품구성코드",
    features: [
      "상품(SKU) 20건 관리: 공간코드/공간명 · 스타일코드/스타일명 · 항목명 + \"매핑된 프로덕트\" 칩 컬럼",
      "🔗 프로덕트 매핑 팝업(검색 후 클릭)으로 프로덕트를 여러 개 매핑, 대분류/중분류/제조사는 매핑에서 자동 결정",
      "+ 상품 추가로 신규 SKU를 화면에서 바로 생성",
      "현장 메뉴에도 동일하게 적용 + \"현장 표기명\" 오버레이 컬럼 유지",
    ],
    notes: "",
  },
  {
    id: "scr-mapping",
    type: "screen",
    menu: "1. 상품구성 › 1.3 프로덕트×상품구성코드",
    files: "index.html · site-menu.html",
    name: "1.3 프로덕트×상품구성코드",
    features: [
      "\"엑셀 업로드 원본\" / \"업로드 결과 보기\" 토글로 219건 표시",
      "양식 다운로드 · Excel 업로드, 👁 안내문코드 · 공통코드보기",
      "stage13이 확정되면 🔒 잠금 태그가 표시되고 관련 편집 컨트롤이 비활성화됨",
    ],
    notes: "",
  },
  {
    id: "scr-area-current",
    type: "screen",
    menu: "1. 상품구성 › 1.4 평형그룹매핑 › 현재 방식",
    files: "index.html · site-menu.html",
    name: "1.4 평형그룹매핑 — 현재 방식",
    features: [
      "좌측: 평형 그룹 목록(고객/평형/평형옵션명 검색), 평형추가/평형삭제/상품삭제",
      "우측: 선택한 평형그룹의 상품 구성 표(상품차수·평형명·상품코드·항목명 등), Excel 다운로드",
      "↩ 뒤로가기(Ctrl+Z)로 직전 변경 취소, 🕘 매핑 이력 조회",
      "⊘ 평형그룹 매핑해제 (해당 평형의 상품 구성 매핑을 전체 해제)",
    ],
    notes: "1.4 4개 하위 화면(현재 방식/개선1안/개선2안/검수 화면)은 같은 상단 서브탭으로 전환",
  },
  {
    id: "scr-area-pivot",
    type: "screen",
    menu: "1. 상품구성 › 1.4 평형그룹매핑 › 개선1안",
    files: "index.html · site-menu.html",
    name: "1.4 평형그룹매핑 — 개선1안 · 상품×평형 매트릭스",
    features: [
      "상품(행) × 평형(열) 매트릭스에서 체크박스로 배정 상태를 한눈에 확인하고 바로 토글",
      "\"현재 방식\"과 동일한 배정 데이터(pivotAssignments)를 다른 시점(매트릭스 뷰)으로 조회/편집",
    ],
    notes: "",
  },
  {
    id: "scr-area-template",
    type: "screen",
    menu: "1. 상품구성 › 1.4 평형그룹매핑 › 개선2안",
    files: "index.html · site-menu.html",
    name: "1.4 평형그룹매핑 — 개선2안 · 템플릿 복제",
    features: [
      "대표 타입(원본 평형) 1개를 골라 복제 대상 평형(복수 선택)에 상품 구성을 그대로 복제",
      "복제 결과를 평형별로 골라 개별 수정(공간/상품코드/항목명/항목명(고객용))",
      "복제 이력 로그로 언제 어떤 평형에 복제했는지 추적",
    ],
    notes: "",
  },
  {
    id: "scr-area-review",
    type: "screen",
    menu: "1. 상품구성 › 1.4 평형그룹매핑 › 검수 화면",
    files: "index.html · site-menu.html",
    name: "1.4 평형그룹매핑 — 검수 화면 (안내문 초안 뷰어)",
    features: [
      "판매가·패키지 정보 없이, 평형 · 고객스타일별로 배정된 상품만 고객 안내문과 유사한 형식으로 미리보기",
      "\"고객스타일\" 드롭다운 — 여러 상품 스타일의 조합으로 정의(예: 스타일 미적용 + 내추럴 모던 = 고객스타일 \"네츄럴모던\")",
      "+ 고객스타일 만들기 패널에서 이름을 짓고 상품 스타일을 체크박스로 골라 즉석 생성",
      "이 화면의 고객스타일 변환/생성은 조회용 필터일 뿐이며, 실제 배정 데이터(pivotAssignments)나 다른 화면에는 영향을 주지 않고 새로고침하면 초기화됨",
    ],
    notes: "",
  },
  {
    id: "scr-category",
    type: "screen",
    menu: "1. 상품구성 › 1.5 대분류/중분류/제조사",
    files: "index.html (본사 전용, 현장 메뉴에서는 탭 자체가 숨김)",
    name: "1.5 대분류/중분류/제조사",
    features: [
      "\"분양수금 공통코드\" 소스와의 동기화 상태를 조회하는 사이드바",
      "대분류 · 중분류(대분류별) · 제조사 3개 컬럼의 마스터 코드/명칭 목록",
    ],
    notes: "본사 전용 마스터 동기화 화면",
  },

  // ---------------- 화면 (STEP 2~5, 본사/현장 공용 또는 본사 전용) ----------------
  {
    id: "scr-cost",
    type: "screen",
    menu: "STEP 2. 원가 수정",
    files: "index.html (본사 전용)",
    name: "2. 원가 수정",
    features: [
      "순번 · 평형그룹 · 상품코드 · 프로덕트코드 · 항목명 · 항목명(고객용) · 세부사항, 5398건 표",
      "원가 Excel 양식 다운로드/업로드, 순번정렬, 👁 원가 합산결과 조회",
      "평형그룹명/항목명 검색 필터",
    ],
    notes: "본사 전용 — 현장 메뉴에서는 이 STEP 자체가 숨김",
  },
  {
    id: "scr-price",
    type: "screen",
    menu: "STEP 3. 판매가 수정",
    files: "index.html (본사 전용)",
    name: "3. 「상품별」 판매가 수정",
    features: [
      "순번 · 고객명 · 평형명 · 스타일명 · 평형옵션명 · 공간명 · 항목명 · 해당품목원가, 2036건 표",
      "판매가 Excel 양식 다운로드/업로드, ▦ 프로덕트 원가합산표, 순번정렬",
      "✎ 수정하기로 선택 항목 일괄 수정",
    ],
    notes: "본사 전용",
  },
  {
    id: "scr-lang",
    type: "screen",
    menu: "STEP 4. 상품고객언어",
    files: "index.html (본사 전용)",
    name: "4. 「상품별」 고객언어 수정",
    features: [
      "순번 · 고객명 · 평형명 · 공간명 · 상품 대분류/중분류/제조사명 · 별매품 단계 · 항목명(고객용) · 세부사항(고객용) 등 2036건 표",
      "🔗 대분류/중분류/제조사 상품 맵핑, ✎ 항목명(고객용)·별매품 단계 입력, ✎ 세부사항(고객용) 입력 — 3종 대량 입력 도구(모두 팝업, 아래 참고)",
      "🗂 대분류·중분류·제조사 조회/편집 팝업으로 1.5 화면과 같은 마스터 데이터를 여기서도 조회/편집",
      "✎ 선택 항목 수정으로 별매품 단계 · 항목명(고객용) · 세부사항(고객용)을 개별 행 단위로도 수정 가능",
      "고객언어 Excel 양식 다운로드/업로드, 순번정렬",
    ],
    notes: "본사 전용. 여기서 설정한 \"고객용\" 데이터는 5.안분표 생성을 재생성해야 안분표에 반영됨",
  },
  {
    id: "scr-allocation",
    type: "screen",
    menu: "STEP 5. 안분표 생성",
    files: "index.html · site-menu.html(3.안분표 생성)",
    name: "5. 안분표",
    features: [
      "순번 · 영업별매물코드 · 고객 타입명 · 평형 · 고객스타일명 · 공간명 · 상품코드 · 항목명 · 별매품 단계 · 발송상태 등 5771건 표",
      "◉ 안분표 가생성, ☰ 안분표 설정 드롭다운(패키지 만들기/공통 패키지 만들기/스텝설정/열변경/선택 패키지 구성품 보기/패키지·상품 삭제/안분표발송)",
      "📦 패키지 이력 · 📮 발송 이력 패널",
      "전체컬럼/필수컬럼 전환, 고객·평형·고객타입명·공간·패키지구분·상품코드 필터",
    ],
    notes: "본사·현장 메뉴 공용",
  },
  {
    id: "scr-gagam",
    type: "screen",
    menu: "현장 메뉴 › 2. 가감조건 관리",
    files: "site-menu.html (현장 전용)",
    name: "가감조건 관리 (공간 중심 재구성)",
    features: [
      "공간 탭을 먼저 고르면 그 공간에 속한 상품(SKU)만 나열됨",
      "1. 안내문 스텝(우선순위) — 공간 안 상품들의 안내문 노출 순서 지정(별매품 단계 1/2/3과는 별개 값, 상품 개수만큼 자유롭게 지정)",
      "2. 프로덕트 카테고리(간섭 그룹) — 서로 대체 관계라 동시에 선택될 수 없는 프로덕트들을 검색해 카테고리로 묶으면, 카테고리 내 모든 조합에 대해 상호 제외 규칙이 자동 생성됨(수정 시 중복 없이 재생성, 삭제 시 규칙도 함께 삭제)",
      "가감조건 목록 — 소분류(상품) 단위뿐 아니라 대분류/중분류 단위(프로덕트 단위)로도 조건 등록 가능, 우선순위 숫자가 낮은 조건부터 적용, \"출처\" 컬럼으로 카테고리 자동생성/수동등록 구분(자동 규칙은 읽기 전용)",
    ],
    notes: "현장 전용 화면. 관련 팝업: 가감조건 추가/수정, 프로덕트 카테고리 추가/수정(아래 참고)",
  },

  // ---------------- 화면 (codes-standard.html / codes-landing.html) ----------------
  {
    id: "scr-codes-common",
    type: "screen",
    menu: "현장별 표준코드 › 전사공통코드",
    files: "codes-standard.html",
    name: "전사공통코드",
    features: [
      "대분류(6개) · 중분류(267개) · 소분류 사용현황 집계(445개) 3단 구성, 대분류 클릭 시 중분류 필터링",
      "신규체계(Product 마스터 v7 기준)/구버전체계(기존 AC/CW/EE/FM/FN/AP) 토글",
      "중분류 목록은 대분류 안에서 그룹명별로 소제목이 붙어 묶여 표시(신규체계만 해당)",
      "소분류 집계 표는 어느 현장이 쓰는지는 표시하지 않고 \"몇 개 현장이 쓰는지\"만 표시",
      "🏷 프로덕트 코드 추가 버튼으로 새 소분류(PK) 간편 등록 팝업 오픈(아래 참고)",
    ],
    notes: "",
  },
  {
    id: "scr-codes-site",
    type: "screen",
    menu: "현장별 표준코드 › 현장별코드",
    files: "codes-standard.html",
    name: "현장별코드",
    features: [
      "좌측에서 현장을 선택하고, 수정/삭제할 차수(예: 190197-001)를 선택",
      "고객 스타일 · 스타일 · 평형 · 평형옵션 · 선택형 평면, 5개 서브컬럼을 현장별로 개별 관리",
      "각 서브컬럼에 + 추가 버튼으로 신규 코드 등록",
    ],
    notes: "",
  },
  {
    id: "scr-codes-help",
    type: "screen",
    menu: "현장별 표준코드 › 도움말",
    files: "codes-standard.html",
    name: "도움말",
    features: [
      "현재 \"도움말 준비 중입니다\" 안내만 표시되는 빈 화면",
    ],
    notes: "콘텐츠 미구현 상태",
  },
  {
    id: "scr-codes-landing",
    type: "screen",
    menu: "현장 목록",
    files: "codes-landing.html",
    name: "현장 목록",
    features: [
      "현장코드 · 현장명 · 사업유형명 · 상품종류 · 생성일시 · 바로가기 컬럼의 현장 테이블",
      "현장별로 \"🏢 본사 메뉴\"(index.html) / \"🏗 현장 메뉴\"(site-menu.html) 버튼으로 진입",
      "📇 추가할 현장목록 버튼",
    ],
    notes: "",
  },

  // ---------------- 팝업 (모두 별도 화면으로 취급) ----------------
  {
    id: "pop-send",
    type: "popup",
    menu: "STEP 5. 안분표 생성 › ➤ 안분표발송",
    files: "index.html · site-menu.html",
    name: "➤ 안분표 발송 — 상품별 차수 분할 발송",
    features: [
      "선택된 안분표 항목을 상품별로 차수를 나누어 발송",
    ],
    notes: "트리거: 5.안분표 › ☰ 안분표 설정 › ➤ 안분표발송",
  },
  {
    id: "pop-product-load-site",
    type: "popup",
    menu: "1.1 프로덕트",
    files: "index.html · site-menu.html",
    name: "📥 다른현장 소분류 불러오기",
    features: [
      "다른 현장에서 이미 등록된 소분류(프로덕트) 데이터를 검색해 현재 화면으로 복사",
    ],
    notes: "트리거: 1.1 프로덕트 › 📥 다른현장 불러오기",
  },
  {
    id: "pop-sku-add",
    type: "popup",
    menu: "1.2 상품구성코드",
    files: "index.html · site-menu.html",
    name: "+ 상품 추가",
    features: [
      "공간/스타일/항목명 등을 입력해 신규 상품(SKU)을 생성",
    ],
    notes: "트리거: 1.2 상품구성코드 › + 상품 추가",
  },
  {
    id: "pop-sku-product",
    type: "popup",
    menu: "1.2 상품구성코드",
    files: "index.html · site-menu.html",
    name: "🔗 프로덕트 매핑",
    features: [
      "코드/상품명으로 검색 후 클릭 한 번으로 프로덕트를 추가/해제(항상 실제 마스터 데이터 중에서만 선택, 오탈자·오매핑 방지)",
      "상품 1개에 프로덕트 여러 개 매핑 가능(칩으로 표시), 대분류/중분류/제조사는 매핑에서 자동 결정",
      "상품명·매핑 개수·전체 대비 위치(예: 11/20)를 보여주는 내비게이션 바 — ←/→ 방향키로 이전/다음 상품 이동, ⏭ 다음 미매핑으로 미매핑 상품으로 바로 이동, 드롭다운으로 특정 상품 직접 선택",
    ],
    notes: "트리거: 1.2 상품구성코드 › 매핑된 프로덕트 칩/셀 클릭",
  },
  {
    id: "pop-lang-edit",
    type: "popup",
    menu: "STEP 4. 상품고객언어",
    files: "index.html",
    name: "✎ 선택 항목 수정",
    features: [
      "4.상품고객언어에서 선택한 개별 행의 별매품 단계 · 항목명(고객용) · 세부사항(고객용)을 수정",
    ],
    notes: "트리거: 4.상품고객언어 › ✎ 선택 항목 수정 (본사 전용)",
  },
  {
    id: "pop-sort-order",
    type: "popup",
    menu: "STEP 4. 상품고객언어",
    files: "index.html",
    name: "🗂 대분류 · 중분류 · 제조사 조회/편집",
    features: [
      "1.5 대분류/중분류/제조사와 동일한 마스터 데이터를 4.상품고객언어 화면에서 벗어나지 않고 조회/편집",
    ],
    notes: "트리거: 4.상품고객언어 › 🗂 대분류·중분류·제조사 조회/편집 (본사 전용)",
  },
  {
    id: "pop-major-mid-maker-map",
    type: "popup",
    menu: "STEP 4. 상품고객언어",
    files: "index.html · site-menu.html",
    name: "🔗 대분류/중분류/제조사 상품 맵핑",
    features: [
      "1.2 상품구성코드 상품 리스트를 띄워, 상품별로 대분류/중분류/제조사명을 입력",
      "\"적용\"하면 같은 상품코드를 쓰는 모든 평형별 상품 정보에 반영",
      "체크박스로 여러 행을 선택해 값 일괄 채우기 지원",
    ],
    notes: "트리거: 4.상품고객언어 › 🔗 대분류/중분류/제조사 상품 맵핑",
  },
  {
    id: "pop-item-customer-bulk",
    type: "popup",
    menu: "STEP 4. 상품고객언어",
    files: "index.html · site-menu.html",
    name: "✎ 항목명(고객용) · 별매품 단계 입력",
    features: [
      "1.2 상품구성코드 상품 리스트를 띄워, 항목명(고객용)과 별매품 단계(1/2/3)를 같은 화면에서 입력",
      "\"적용\"하면 현재까지 생성된 평형별 상품 정보와 PRODUCT_OPTION_TIER(5.안분표 생성 등에서 참조)에 자동 반영",
      "체크박스로 여러 행을 선택해 항목명(고객용)/별매품 단계 값을 일괄 채우기 지원",
    ],
    notes: "트리거: 4.상품고객언어 › ✎ 항목명(고객용)·별매품 단계 입력",
  },
  {
    id: "pop-detail-customer-bulk",
    type: "popup",
    menu: "STEP 4. 상품고객언어",
    files: "index.html · site-menu.html",
    name: "✎ 세부사항(고객용) 입력 — 상품명(고객용)",
    features: [
      "1.1 프로덕트(소분류) 리스트를 띄워 상품명(고객용)을 입력",
      "\"적용\"하면 각 상품(SKU)에 매핑된 프로덕트들의 상품명(고객용)을 +로 이어붙여 세부사항(고객용)에 자동 반영(매핑된 프로덕트가 없는 상품은 건드리지 않음)",
      "체크박스로 여러 행을 선택해 값 일괄 채우기 지원",
    ],
    notes: "트리거: 4.상품고객언어 › ✎ 세부사항(고객용) 입력",
  },
  {
    id: "pop-package",
    type: "popup",
    menu: "STEP 5. 안분표 생성",
    files: "index.html · site-menu.html",
    name: "📦 안분표 패키지 생성 (현재안 - 평형 1개씩)",
    features: [
      "평형 1개를 기준으로 패키지(상품 묶음)를 생성",
    ],
    notes: "트리거: 5.안분표 › ☰ 안분표 설정 › 📦 패키지 만들기",
  },
  {
    id: "pop-package-map",
    type: "popup",
    menu: "STEP 5. 안분표 생성",
    files: "index.html · site-menu.html",
    name: "📦 공통 패키지 생성 — 평형 일괄 매핑 (개선안)",
    features: [
      "상품을 먼저 선택한 뒤, 여러 평형에 한 번에 패키지를 일괄 매핑",
    ],
    notes: "트리거: 5.안분표 › ☰ 안분표 설정 › 📦 공통 패키지 만들기 (평형 일괄 매핑) 🆕",
  },
  {
    id: "pop-gagam",
    type: "popup",
    menu: "현장 메뉴 › 2. 가감조건 관리",
    files: "site-menu.html (현장 전용)",
    name: "➕ 가감조건 추가/수정",
    features: [
      "기준 단위(소분류/대분류/중분류)와 기준 코드, 조건구분(추가/제외), 대상 단위/코드, 우선순위, 비고를 입력해 조건을 등록/수정",
    ],
    notes: "트리거: 가감조건 관리 › + 가감조건 추가 / 목록의 수정 버튼",
  },
  {
    id: "pop-gagam-category",
    type: "popup",
    menu: "현장 메뉴 › 2. 가감조건 관리",
    files: "site-menu.html (현장 전용, 신규)",
    name: "➕ 간섭 프로덕트 선택 (프로덕트 카테고리/간섭 그룹)",
    features: [
      "현재 선택된 공간 안에서 서로 대체 관계인 프로덕트를 코드/상품명으로 검색해 체크박스로 여러 개 한 번에 선택(선택된 항목은 목록에서 \"✓ 선택됨\"으로 계속 표시되어 재검색 없이 계속 고를 수 있음)",
      "선택된 프로덕트는 칩으로 표시되고 개별 제거 가능",
      "카테고리 이름은 선택한 프로덕트명으로 자동 생성됨(예: \"A 외 2개\") — 완료 시 프로덕트 2개 이상 필수, 카테고리 내 모든 조합에 상호 제외 규칙이 자동 생성됨",
    ],
    notes: "트리거: 가감조건 관리 › + 카테고리 추가 / 카테고리 카드의 수정 버튼",
  },
  {
    id: "pop-product-quick-add",
    type: "popup",
    menu: "현장별 표준코드 › 전사공통코드",
    files: "codes-standard.html",
    name: "🏷 프로덕트 코드 추가 (소분류 · PK)",
    features: [
      "대분류 전체와 그 중분류 전체를 검색 없이 한 화면에서 클릭만으로 선택(중분류를 고르면 이미 등록된 기존 소분류 목록도 함께 표시)",
      "상품명을 입력하면 바로 저장되지 않고 오른쪽 \"대기 목록\"에 쌓이며, 자동 채번된 소분류코드(PK)를 미리 확인 가능",
      "여러 상품명을 한 번에 붙여넣는 일괄 등록 지원, 대기 목록에서 항목 제거 가능",
      "\"전체 저장\"을 눌러야 대기 목록의 모든 항목이 한 번에 실제 데이터에 반영(저장 전 닫으려 하면 확인 메시지)",
    ],
    notes: "트리거: 전사공통코드 › + 프로덕트 코드 추가",
  },
];

function ssLoadComments() {
  try {
    return JSON.parse(localStorage.getItem(SCREEN_SPEC_STORAGE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function ssSaveComment(id, text) {
  const all = ssLoadComments();
  if (text) all[id] = text;
  else delete all[id];
  localStorage.setItem(SCREEN_SPEC_STORAGE_KEY, JSON.stringify(all));
}

function ssTypeLabel(type) {
  return type === "popup" ? "팝업" : "화면";
}

function ssRenderList(filterType, query) {
  const comments = ssLoadComments();
  const q = (query || "").trim().toLowerCase();
  const filtered = SCREEN_SPEC_DATA.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (!q) return true;
    const haystack = [item.menu, item.name, item.files, ...(item.features || []), item.notes]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  document.getElementById("ssCount").textContent = `${filtered.length}개`;

  document.getElementById("ssList").innerHTML = filtered
    .map((item, idx) => {
      const savedComment = comments[item.id] || "";
      return `
        <div class="ss-card" data-id="${item.id}">
          <div class="ss-card-head">
            <span class="ss-type-tag ss-type-${item.type}">${ssTypeLabel(item.type)}</span>
            <span class="ss-menu-path">${item.menu}</span>
          </div>
          <div class="ss-card-title">
            <strong>${item.name}</strong>
            <span class="ss-files">${item.files}</span>
          </div>
          <ul class="ss-features">
            ${(item.features || []).map((f) => `<li>${f}</li>`).join("")}
          </ul>
          ${item.notes ? `<div class="ss-notes">📌 ${item.notes}</div>` : ""}
          <div class="ss-comment-field">
            <label>코멘트</label>
            <textarea class="ss-comment-input" data-id="${item.id}" placeholder="이 화면/팝업에 대한 코멘트를 입력해주세요.">${savedComment}</textarea>
          </div>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".ss-comment-input").forEach((el) => {
    el.addEventListener("input", (e) => {
      ssSaveComment(e.target.dataset.id, e.target.value);
    });
  });
}

function ssCsvEscape(value) {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

function ssExportToExcel() {
  const comments = ssLoadComments();
  const header = ["번호", "구분", "소속 메뉴", "화면/팝업명", "관련 파일", "주요 기능", "비고", "코멘트"];
  const rows = SCREEN_SPEC_DATA.map((item, idx) => [
    idx + 1,
    ssTypeLabel(item.type),
    item.menu,
    item.name,
    item.files,
    (item.features || []).map((f, i) => `${i + 1}. ${f}`).join("\n"),
    item.notes || "",
    comments[item.id] || "",
  ]);

  const csvBody = [header, ...rows]
    .map((row) => row.map(ssCsvEscape).join(","))
    .join("\r\n");
  const csv = "﻿" + csvBody; // UTF-8 BOM so Excel opens Korean text correctly

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `D-Selection_screen-spec_${ssTodayStamp()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ssTodayStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("ssSearchInput");
  const typeChips = document.querySelectorAll(".ss-type-chip");
  let currentType = "all";

  function refresh() {
    ssRenderList(currentType, searchInput.value);
  }

  typeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      typeChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      currentType = chip.dataset.type;
      refresh();
    });
  });

  searchInput.addEventListener("input", refresh);
  document.getElementById("ssSaveBtn").addEventListener("click", ssExportToExcel);

  document.getElementById("ssScreenCountTotal").textContent = SCREEN_SPEC_DATA.filter((d) => d.type === "screen").length;
  document.getElementById("ssPopupCountTotal").textContent = SCREEN_SPEC_DATA.filter((d) => d.type === "popup").length;

  refresh();
});
