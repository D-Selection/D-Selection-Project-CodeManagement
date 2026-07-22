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
   신규 체계는 "Product 마스터 v7(260709)" 원본 파일 기준으로 갱신했다
   (대분류 6개 / 중분류 267개 / 소분류 445개). 중분류는 대분류 안에서
   더 세분화된 "그룹명"으로도 묶이는데, 화면 구조(대분류→중분류→소분류)는
   그대로 유지하고 그룹명은 각 항목에 참고용 groupName으로만 붙여둔다.
   기존(구버전) 현장은 계속 구버전 체계로 조회 · 관리하고, 신규 현장부터는
   신규 체계만 사용한다 — 그래서 두 체계를 모두 보관하고, 사이트 코드로
   어느 체계를 써야 하는지 판별한다(dsSiteCodeScheme).
   신규 체계는 DS_PRODUCT_MASTER_CATALOG(= 1.1 프로덕트의 소분류 마스터)에
   실제로 쓰이는 대분류/중분류 코드·명칭과 동일하다.
   ===================================================================== */
const DS_PRODUCT_MAJORS_NEW = [
  { code: "AC", name: "악세서리" },
  { code: "CW", name: "공사성(창호 등)" },
  { code: "EE", name: "전기설비" },
  { code: "FM", name: "마감재(바닥/벽 등)" },
  { code: "FN", name: "가구" },
  { code: "HA", name: "가전" },
];
const DS_PRODUCT_MIDS_NEW = [
  { majorCode: "AC", code: "299", name: "설비공사", groupName: "설비공사" },
  { majorCode: "AC", code: "200", name: "국산 주방수전/워터웍스유진", groupName: "주방/다용도실 수전" },
  { majorCode: "AC", code: "201", name: "국산 주방수전/대림바스", groupName: "주방/다용도실 수전" },
  { majorCode: "AC", code: "202", name: "국산 다용도실 하부장 수전/대림바스", groupName: "주방/다용도실 수전" },
  { majorCode: "AC", code: "203", name: "국산 일반 세면기 수전/대림바스", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "204", name: "국산 언더볼 세면기 수전/대림바스", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "205", name: "국산 선반형 샤워수전/대림바스", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "206", name: "국산 선반형 욕조수전/대림바스", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "207", name: "국산 슬라이드바/대림바스", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "208", name: "국산 안마샤워헤드/대림바스", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "209", name: "국산 일반 세면기(공용욕실)/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "210", name: "국산 일반 세면기(부부욕실)/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "211", name: "국산 언더볼 세면기/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "212", name: "국산 탑볼 세면기/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "213", name: "국산 양변기/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "214", name: "국산 양변기(벽배수)/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "215", name: "국산 양변기(벽걸이형)/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "216", name: "국산 비데일체형 양변기/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "217", name: "국산 비데일체형 양변기(벽배수)/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "218", name: "국산 분리형 비데/대림바스", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "219", name: "국산 세라믹 욕조", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "220", name: "국산 아크릴 욕조", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "221", name: "국산 일반 수건걸이/대림바스", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "222", name: "국산 슬림형 수건걸이/대림바스", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "223", name: "외산 주방수전/한스그로헤", groupName: "주방/다용도실 수전" },
  { majorCode: "AC", code: "224", name: "외산 일반,언더볼 세면기 수전/한스그로헤", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "225", name: "외산 탑볼 세면기 수전/한스그로헤", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "226", name: "외산 선반형 샤워수전/한스그로헤", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "227", name: "외산 선반형 욕조수전/한스그로헤", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "228", name: "외산 슬라이드바/한스그로헤", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "229", name: "외산 안마샤워헤드/한스그로헤", groupName: "욕실 수전/악세서리" },
  { majorCode: "AC", code: "230", name: "외산 일반 세면기/아메리칸스탠다드", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "231", name: "외산 언더볼 세면기/아메리칸스탠다드", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "232", name: "외산 탑볼 세면기/아메리칸스탠다드", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "233", name: "외산 양변기", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "234", name: "외산 양변기(벽배수)", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "235", name: "외산 양변기(벽걸이형)/게버릿", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "236", name: "외산 비데일체형 양변기", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "237", name: "외산 비데일체형 양변기(벽배수)/아메리칸스탠다드", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "238", name: "외산 세라믹 욕조", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "239", name: "외산 아크릴 욕조", groupName: "욕실 도기/위생기구" },
  { majorCode: "AC", code: "240", name: "무선 물내림 스마트 스위치", groupName: "욕실 스마트 스위치" },
  { majorCode: "AC", code: "241", name: "기본 욕실팬/고효율 3단", groupName: "욕실 환기팬" },
  { majorCode: "AC", code: "242", name: "기본 욕실팬/고효율 1단", groupName: "욕실 환기팬" },
  { majorCode: "AC", code: "243", name: "기본 욕실팬/정풍량", groupName: "욕실 환기팬" },
  { majorCode: "AC", code: "244", name: "복합환풍기", groupName: "욕실 환기팬" },
  { majorCode: "AC", code: "245", name: "실별 환기시스템(D-Air Planner)", groupName: "실별 환기시스템/전열교환기" },
  { majorCode: "AC", code: "246", name: "고효율 전열교환기", groupName: "실별 환기시스템/전열교환기" },
  { majorCode: "AC", code: "247", name: "공기청정형 전열교환기", groupName: "실별 환기시스템/전열교환기" },
  { majorCode: "AC", code: "248", name: "안티바이러스 공기청정형 전열교환기", groupName: "실별 환기시스템/전열교환기" },
  { majorCode: "AC", code: "249", name: "렌지후드(일반침니형)", groupName: "주방 렌지후드" },
  { majorCode: "AC", code: "250", name: "렌지후드(디사일런트)", groupName: "주방 렌지후드" },
  { majorCode: "AC", code: "251", name: "제습기(덕트 연결형)", groupName: "제습기" },
  { majorCode: "AC", code: "252", name: "제습기(단독 장비형)", groupName: "제습기" },
  { majorCode: "CW", code: "001", name: "발코니 확장", groupName: "발코니 확장" },
  { majorCode: "CW", code: "002", name: "시스템 창호", groupName: "외부창호" },
  { majorCode: "CW", code: "003", name: "건식 벽체", groupName: "건식 벽체" },
  { majorCode: "CW", code: "004", name: "방화도어", groupName: "공사성 도어(현관도어/방화도어)" },
  { majorCode: "CW", code: "005", name: "우물천정", groupName: "우물천정" },
  { majorCode: "CW", code: "006", name: "주방 레이아웃 변경", groupName: "레이아웃 변경" },
  { majorCode: "CW", code: "007", name: "침실-복도 레이아웃 변경", groupName: "레이아웃 변경" },
  { majorCode: "CW", code: "008", name: "유리난간 매립형 시스템창호", groupName: "외부창호" },
  { majorCode: "EE", code: "399", name: "전기공사", groupName: "전기공사" },
  { majorCode: "EE", code: "300", name: "직부등", groupName: "조명" },
  { majorCode: "EE", code: "301", name: "거실 디밍 제어시스템(12단계 밝기 조절)", groupName: "조명특화" },
  { majorCode: "EE", code: "302", name: "거실 커튼박스 간접조명", groupName: "조명특화" },
  { majorCode: "EE", code: "303", name: "거실/주방/복도 조명 다운라이트 특화", groupName: "조명특화" },
  { majorCode: "EE", code: "304", name: "현관/거실/주방/복도 조명 다운라이트 특화(NGR)", groupName: "조명특화" },
  { majorCode: "EE", code: "305", name: "복도 스텝등", groupName: "조명특화" },
  { majorCode: "EE", code: "306", name: "침실 디밍 제어시스템(12단계 색온도,밝기 조절)", groupName: "조명특화" },
  { majorCode: "EE", code: "307", name: "매입형 욕실장 하부 간접조명", groupName: "조명특화" },
  { majorCode: "EE", code: "308", name: "욕실 센서미등 겸용 다운라이트", groupName: "조명특화" },
  { majorCode: "EE", code: "309", name: "거실 스마트 디스플레이 스위치 V1", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "310", name: "거실 스마트 디스플레이 스위치 V2", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "311", name: "침실 스마트 디스플레이 스위치 V1", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "312", name: "침실 스마트 디스플레이 스위치 V2", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "313", name: "벽등/내추럴 모던", groupName: "조명" },
  { majorCode: "EE", code: "314", name: "벽등/소프트 클래식", groupName: "조명" },
  { majorCode: "EE", code: "315", name: "벽등/내추럴 클래식", groupName: "조명" },
  { majorCode: "EE", code: "316", name: "벽등/블랑 클래식", groupName: "조명" },
  { majorCode: "EE", code: "317", name: "독서등(사이드테이블*1)", groupName: "조명" },
  { majorCode: "EE", code: "318", name: "독서등(사이드테이블*2)", groupName: "조명" },
  { majorCode: "EE", code: "319", name: "통합컨트롤 조명제어시스템(사이드테이블*1)", groupName: "조명특화" },
  { majorCode: "EE", code: "320", name: "통합컨트롤 조명제어시스템(사이드테이블*2)", groupName: "조명특화" },
  { majorCode: "EE", code: "321", name: "스마트 전동커튼레일 2열", groupName: "조명특화" },
  { majorCode: "EE", code: "322", name: "침실1 다운라이트 특화", groupName: "조명특화" },
  { majorCode: "EE", code: "323", name: "다운라이트", groupName: "조명" },
  { majorCode: "EE", code: "324", name: "무선충전 상판매입 콘센트", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "325", name: "상판매입 콘센트", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "326", name: "밥솥장 콘센트", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "327", name: "가구 조명", groupName: "조명" },
  { majorCode: "EE", code: "328", name: "통합형 콘센트", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "329", name: "콘센트", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "330", name: "콘센트(방우)", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "331", name: "유럽형 콘센트", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "332", name: "유럽형 콘센트(방우)", groupName: "배선기구(콘센트/스위치)" },
  { majorCode: "EE", code: "333", name: "주방TV", groupName: "주방TV" },
  { majorCode: "EE", code: "334", name: "우물천장 간접조명(12단계 밝기 제어)", groupName: "조명특화" },
  { majorCode: "EE", code: "335", name: "마그네틱 트랙조명", groupName: "조명특화" },
  { majorCode: "EE", code: "336", name: "실링팬", groupName: "실링팬" },
  { majorCode: "FM", code: "100", name: "강마루", groupName: "마루" },
  { majorCode: "FM", code: "101", name: "광폭 강마루", groupName: "마루" },
  { majorCode: "FM", code: "102", name: "원목마루", groupName: "마루" },
  { majorCode: "FM", code: "103", name: "외산 원목마루", groupName: "마루" },
  { majorCode: "FM", code: "104", name: "디자인 월", groupName: "디자인 월/세라믹패널" },
  { majorCode: "FM", code: "105", name: "세라믹 패널", groupName: "디자인 월/세라믹패널" },
  { majorCode: "FM", code: "106", name: "목창호(튜블러 손잡이 포함)", groupName: "도어(목창호/인피니티도어/터닝도어)" },
  { majorCode: "FM", code: "107", name: "목창호(모티스 손잡이 포함)", groupName: "도어(목창호/인피니티도어/터닝도어)" },
  { majorCode: "FM", code: "108", name: "디자인 월 인피니티 도어", groupName: "도어(목창호/인피니티도어/터닝도어)" },
  { majorCode: "FM", code: "109", name: "디자인 월 인피니티 도어(튜블러 손잡이 포함)", groupName: "도어(목창호/인피니티도어/터닝도어)" },
  { majorCode: "FM", code: "110", name: "디자인 월 인피니티 도어(모티스 손잡이 포함)", groupName: "도어(목창호/인피니티도어/터닝도어)" },
  { majorCode: "FM", code: "111", name: "세라믹 패널 인피니티 도어(튜블러 손잡이 포함)", groupName: "도어(목창호/인피니티도어/터닝도어)" },
  { majorCode: "FM", code: "112", name: "세라믹 패널 인피니티 도어(모티스 손잡이 포함)", groupName: "도어(목창호/인피니티도어/터닝도어)" },
  { majorCode: "FM", code: "113", name: "도장", groupName: "도장/탄성코트" },
  { majorCode: "FM", code: "114", name: "탄성코트", groupName: "도장/탄성코트" },
  { majorCode: "FM", code: "115", name: "세라믹 탄성코트", groupName: "도장/탄성코트" },
  { majorCode: "FM", code: "116", name: "천장지", groupName: "벽지/천장지" },
  { majorCode: "FM", code: "117", name: "벽지", groupName: "벽지/천장지" },
  { majorCode: "FM", code: "118", name: "자기질 타일", groupName: "타일" },
  { majorCode: "FM", code: "119", name: "도기질 타일", groupName: "타일" },
  { majorCode: "FM", code: "120", name: "포세린 타일", groupName: "타일" },
  { majorCode: "FM", code: "121", name: "엔지니어드 스톤-스탠다드", groupName: "엔지니어드 스톤/인조대리석" },
  { majorCode: "FM", code: "122", name: "엔지니어드 스톤-프리미엄", groupName: "엔지니어드 스톤/인조대리석" },
  { majorCode: "FM", code: "123", name: "엔지니어드 스톤-프레스티지", groupName: "엔지니어드 스톤/인조대리석" },
  { majorCode: "FM", code: "124", name: "엔지니어드 스톤-칸스톤", groupName: "엔지니어드 스톤/인조대리석" },
  { majorCode: "FM", code: "130", name: "엔지니어드 스톤", groupName: "엔지니어드 스톤/인조대리석" },
  { majorCode: "FM", code: "125", name: "MMA", groupName: "엔지니어드 스톤/인조대리석" },
  { majorCode: "FM", code: "126", name: "컴파운드스톤", groupName: "엔지니어드 스톤/인조대리석" },
  { majorCode: "FM", code: "127", name: "패널형마감재", groupName: "패널형마감재" },
  { majorCode: "FM", code: "128", name: "터닝도어", groupName: "도어(목창호/인피니티도어/터닝도어)" },
  { majorCode: "FM", code: "129", name: "시트패널", groupName: "시트패널" },
  { majorCode: "FN", code: "500", name: "현관중문 스윙 도어", groupName: "중문" },
  { majorCode: "FN", code: "501", name: "현관중문 슬라이딩 도어", groupName: "중문" },
  { majorCode: "FN", code: "502", name: "현관중문 3연동 도어", groupName: "중문" },
  { majorCode: "FN", code: "503", name: "4도어 슬라이딩", groupName: "중문" },
  { majorCode: "FN", code: "504", name: "신발장(pp)", groupName: "신발장" },
  { majorCode: "FN", code: "505", name: "신발장(PET)", groupName: "신발장" },
  { majorCode: "FN", code: "506", name: "신발장(FUTURA)", groupName: "신발장" },
  { majorCode: "FN", code: "507", name: "오픈형 신발장(PET)", groupName: "신발장" },
  { majorCode: "FN", code: "508", name: "오픈형 신발장(FUTURA)", groupName: "신발장" },
  { majorCode: "FN", code: "509", name: "에어브러시", groupName: "신발장" },
  { majorCode: "FN", code: "510", name: "신발살균기", groupName: "신발장" },
  { majorCode: "FN", code: "511", name: "가구 도어(PP)", groupName: "가구성 도어" },
  { majorCode: "FN", code: "512", name: "가구 도어(PET)", groupName: "가구성 도어" },
  { majorCode: "FN", code: "513", name: "가구 도어(FUTURA)", groupName: "가구성 도어" },
  { majorCode: "FN", code: "514", name: "포스트형 시스템 선반", groupName: "시스템 선반" },
  { majorCode: "FN", code: "515", name: "벽 찬넬형 시스템 선반", groupName: "시스템 선반" },
  { majorCode: "FN", code: "516", name: "벽 패널형 시스템 선반", groupName: "시스템 선반" },
  { majorCode: "FN", code: "517", name: "다용도실 수납장(PET)", groupName: "다용도실 수납가구" },
  { majorCode: "FN", code: "518", name: "상,하부장(PET)", groupName: "주방 상부장/하부장" },
  { majorCode: "FN", code: "519", name: "상,하부장(FUTURA)", groupName: "주방 상부장/하부장" },
  { majorCode: "FN", code: "520", name: "아일랜드장 기본형(PET)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "521", name: "아일랜드장 기본형(FUTURA)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "522", name: "아일랜드장 바 타입형(PET)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "523", name: "아일랜드장 바 타입형(FUTURA)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "524", name: "아일랜드장 식탁결합형(PET)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "525", name: "아일랜드장 식탁결합형(FUTURA)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "526", name: "아일랜드장 양면수납형(PET)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "527", name: "아일랜드장 양면수납형(FUTURA)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "528", name: "아일랜드장 양면수납 식탁결합형(PET)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "529", name: "아일랜드장 양면수납 식탁결합형(FUTURA)", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "530", name: "냉장고장 기본형(PET)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "531", name: "냉장고장 기본형(FUTURA)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "532", name: "선반 수납형 키큰장(PET)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "533", name: "선반 수납형 키큰장(FUTURA)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "534", name: "인출식 수납형 키큰장(PET)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "535", name: "인출식 수납형 키큰장(FUTURA)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "536", name: "대형 선반 수납형 키큰장(PET)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "537", name: "대형 선반 수납형 키큰장(FUTURA)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "538", name: "대형 인출식 수납형 키큰장(PET)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "539", name: "대형 인출식 수납형 키큰장(FUTURA)", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "540", name: "홈바 수납형(PET)", groupName: "주방 홈바" },
  { majorCode: "FN", code: "541", name: "홈바 수납형(FUTURA)", groupName: "주방 홈바" },
  { majorCode: "FN", code: "542", name: "홈바 윈도우형(PET)", groupName: "주방 홈바" },
  { majorCode: "FN", code: "543", name: "홈바 윈도우형(FUTURA)", groupName: "주방 홈바" },
  { majorCode: "FN", code: "544", name: "상부장", groupName: "주방 상부장/하부장" },
  { majorCode: "FN", code: "545", name: "하부장", groupName: "주방 상부장/하부장" },
  { majorCode: "FN", code: "546", name: "손빨래 하부장", groupName: "다용도실 수납가구" },
  { majorCode: "FN", code: "547", name: "세탁기장(수직형)", groupName: "다용도실 수납가구" },
  { majorCode: "FN", code: "548", name: "세탁기장(수직형+키큰장 결합형)", groupName: "다용도실 수납가구" },
  { majorCode: "FN", code: "549", name: "세탁기장(병렬형)", groupName: "다용도실 수납가구" },
  { majorCode: "FN", code: "550", name: "도어형 붙박이장(PP)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "551", name: "도어형 붙박이장(PET)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "552", name: "도어형 붙박이장(FUTURA)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "553", name: "침대", groupName: "침대/매트리스" },
  { majorCode: "FN", code: "554", name: "매트리스/ACE SUITE GRAND(킹사이즈, 가로1600, 세로2000, 높이320)", groupName: "침대/매트리스" },
  { majorCode: "FN", code: "555", name: "매트리스/ACE SUITE ROYAL-PLUS(킹사이즈, 가로1600, 세로2000, 높이350)", groupName: "침대/매트리스" },
  { majorCode: "FN", code: "556", name: "매트리스/ACE SUITE COZY(슈퍼싱글사이즈, 가로1100, 세로2000, 높이270)", groupName: "침대/매트리스" },
  { majorCode: "FN", code: "557", name: "데스크(PET)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "578", name: "데스크(FUTURA)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "558", name: "데스크+침대프레임(PET)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "559", name: "화장대(PP)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "560", name: "화장대(PET)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "561", name: "화장대(FUTURA)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "562", name: "측면수납형 화장대(PET)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "563", name: "측면수납형 화장대(FUTURA)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "564", name: "건식세면대(PET)", groupName: "건식세면대" },
  { majorCode: "FN", code: "565", name: "건식세면대(FUTURA)", groupName: "건식세면대" },
  { majorCode: "FN", code: "566", name: "시스템 선반 의류관리기장", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "567", name: "의류관리기장(PET)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "568", name: "의류관리기장(FUTURA)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "569", name: "오픈형 행거+서랍장(PET)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "570", name: "오픈형 행거+서랍장(FUTURA)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "571", name: "오픈형 책장(PET)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "572", name: "오픈형 책장(FUTURA)", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "573", name: "드레스룸 유리도어(PET)", groupName: "가구성 도어" },
  { majorCode: "FN", code: "574", name: "드레스룸 유리도어(FUTURA)", groupName: "가구성 도어" },
  { majorCode: "FN", code: "575", name: "샤워 부스", groupName: "욕실 샤워부스/하부장" },
  { majorCode: "FN", code: "576", name: "고급형 샤워부스", groupName: "욕실 샤워부스/하부장" },
  { majorCode: "FN", code: "577", name: "카운터형 욕실 하부장", groupName: "욕실 샤워부스/하부장" },
  { majorCode: "FN", code: "579", name: "책상 측면 옵션장_상부찬넬형", groupName: "붙박이장/화장대/데스크" },
  { majorCode: "FN", code: "900", name: "상,하부장", groupName: "주방 상부장/하부장" },
  { majorCode: "FN", code: "901", name: "아일랜드장", groupName: "주방 아일랜드장" },
  { majorCode: "FN", code: "902", name: "냉장고장 기본형", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "903", name: "선반 수납형 키큰장", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "904", name: "인출식 수납형 키큰장", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "FN", code: "905", name: "홈바 수납형", groupName: "주방 홈바" },
  { majorCode: "FN", code: "906", name: "상부장 전동 플랩장", groupName: "주방 상부장/하부장" },
  { majorCode: "FN", code: "907", name: "전기오븐장", groupName: "주방 전기오븐장" },
  { majorCode: "FN", code: "908", name: "가전 맞춤형 빌트인 냉장고장", groupName: "주방 냉장고장/키큰장" },
  { majorCode: "HA", code: "400", name: "에어컨/LG", groupName: "에어컨" },
  { majorCode: "HA", code: "401", name: "에어컨/삼성", groupName: "에어컨" },
  { majorCode: "HA", code: "402", name: "프리미엄 에어컨/LG", groupName: "에어컨" },
  { majorCode: "HA", code: "403", name: "프리미엄 에어컨/삼성", groupName: "에어컨" },
  { majorCode: "HA", code: "414", name: "건조기", groupName: "세탁기/건조기" },
  { majorCode: "HA", code: "413", name: "세탁기", groupName: "세탁기/건조기" },
  { majorCode: "HA", code: "412", name: "의류관리기/LG 스타일러 5벌", groupName: "의류관리기" },
  { majorCode: "HA", code: "445", name: "의류관리기/LG 스타일러 3벌", groupName: "의류관리기" },
  { majorCode: "HA", code: "442", name: "빌트인 냉장고/LG 시그니처 냉장+냉동(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "419", name: "빌트인 냉장고/LG 시그니처 냉장+냉동+와인(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "443", name: "빌트인 냉장고/LG 오브제 1도어 냉장+냉동+김치(FIT&MAX)(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "415", name: "빌트인 냉장고/LG 오브제 1도어 냉장+냉동+김치(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "418", name: "빌트인 냉장고/LG 오브제 4도어", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "437", name: "빌트인 냉장고/LG 오브제 4도어(FIT&MAX)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "416", name: "빌트인 냉장고/LG 오브제 4도어(FIT&MAX)+3도어 김치(FIT&MAX)(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "417", name: "빌트인 냉장고/LG 오브제 4도어+김치(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "434", name: "빌트인 냉장고/삼성 비스포크 4도어 키친핏", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "438", name: "빌트인 냉장고/삼성 비스포크 4도어 키친핏+삼성 비스포크 김치(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "421", name: "빌트인 냉장고/삼성 비스포크 냉장+냉동+김치(Cotta)(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "420", name: "빌트인 냉장고/삼성 비스포크 냉장+냉동+김치(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "422", name: "빌트인 냉장고/삼성 비스포크 냉장+변온+김치(설치키트 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "424", name: "빌트인 냉장고/삼성 인피니트 냉장+냉동+김치(설치키트,정수필터 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "423", name: "빌트인 냉장고/삼성 인피니트 냉장+냉동+와인(설치키트,정수필터 포함)", groupName: "빌트인 냉장고" },
  { majorCode: "HA", code: "407", name: "빌트인 식기세척기/LG 디오스 14인용(DIE6PT)", groupName: "빌트인 식기세척기" },
  { majorCode: "HA", code: "433", name: "빌트인 식기세척기/LG 디오스 14인용(DUE5NSE)", groupName: "빌트인 식기세척기" },
  { majorCode: "HA", code: "444", name: "빌트인 식기세척기/LG 디오스 14인용(DIE5PT)", groupName: "빌트인 식기세척기" },
  { majorCode: "HA", code: "436", name: "빌트인 식기세척기/LG 시그니처 12인용(DBS12)-방배", groupName: "빌트인 식기세척기" },
  { majorCode: "HA", code: "409", name: "빌트인 식기세척기/LG 시그니처 14인용(DBS14)", groupName: "빌트인 식기세척기" },
  { majorCode: "HA", code: "408", name: "빌트인 식기세척기/LG 오브제 14인용(DUE6BG)", groupName: "빌트인 식기세척기" },
  { majorCode: "HA", code: "410", name: "빌트인 식기세척기/삼성 12인용(DW60T7065SS)", groupName: "빌트인 식기세척기" },
  { majorCode: "HA", code: "411", name: "빌트인 식기세척기/삼성 12인용(DW80F71Y1SEW)", groupName: "빌트인 식기세척기" },
  { majorCode: "HA", code: "447", name: "빌트인 식기세척기/LG 디오스 12인용(DUB22SB2)", groupName: "빌트인 식기세척기" },
  { majorCode: "HA", code: "405", name: "빌트인 전기오븐/LG 광파오븐", groupName: "빌트인 전기오븐" },
  { majorCode: "HA", code: "404", name: "빌트인 전기오븐/나비엔 매직 컨벡션 스팀 오븐", groupName: "빌트인 전기오븐" },
  { majorCode: "HA", code: "406", name: "빌트인 전기오븐/삼성 전기오븐", groupName: "빌트인 전기오븐" },
  { majorCode: "HA", code: "430", name: "하이브리드 쿡탑 인덕션/LG 인덕션 2구+하이라이트 1구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "431", name: "하이브리드 쿡탑 인덕션/LG 인덕션 3구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "435", name: "하이브리드 쿡탑 인덕션/나비엔 매직 가스 2구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "425", name: "하이브리드 쿡탑 인덕션/나비엔 매직 가스 3구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "429", name: "하이브리드 쿡탑 인덕션/나비엔 매직 보더리스 인덕션 4구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "446", name: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 3구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "426", name: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 2구+가스 1구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "428", name: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 2구+하이라이트 1구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "439", name: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 2구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "427", name: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 2구+가스 1구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "440", name: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 3구", groupName: "하이브리드 쿡탑 인덕션" },
  { majorCode: "HA", code: "432", name: "하이브리드 쿡탑 인덕션/삼성 인덕션 3구", groupName: "하이브리드 쿡탑 인덕션" },
];

/* 대분류 안에서 중분류를 한 번 더 묶는 "그룹명" 단위(대분류 → 그룹명 → 중분류 → 소분류).
   그룹명은 원본 코드북 파일의 컬럼을 그대로 살린 참고용 분류라 별도 마스터 배열로
   관리하지 않고, DS_PRODUCT_MIDS_NEW에 붙은 groupName을 그때그때 묶어서 쓴다. 같은
   그룹명이 파일 안에서 떨어져 나타나도(연속되지 않아도) 하나의 그룹으로 합친다. */
function dsGroupMidsByGroupName(mids) {
  const groups = [];
  const byName = new Map();
  mids.forEach((m) => {
    const key = m.groupName || "";
    if (!byName.has(key)) {
      const g = { groupName: key, mids: [] };
      byName.set(key, g);
      groups.push(g);
    }
    byName.get(key).mids.push(m);
  });
  return groups;
}

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
  { no: 1, majorCode: "CW", majorName: "공사성(창호 등)", midCode: "001", midName: "발코니 확장", code: "CW-001-01", name: "발코니 확장", groupName: "발코니 확장" },
  { no: 2, majorCode: "CW", majorName: "공사성(창호 등)", midCode: "002", midName: "시스템 창호", code: "CW-002-01", name: "시스템 창호", groupName: "외부창호" },
  { no: 3, majorCode: "CW", majorName: "공사성(창호 등)", midCode: "003", midName: "건식 벽체", code: "CW-003-01", name: "건식 벽체", groupName: "건식 벽체" },
  { no: 4, majorCode: "CW", majorName: "공사성(창호 등)", midCode: "004", midName: "방화도어", code: "CW-004-01", name: "방화도어", groupName: "공사성 도어(현관도어/방화도어)" },
  { no: 5, majorCode: "CW", majorName: "공사성(창호 등)", midCode: "005", midName: "우물천정", code: "CW-005-01", name: "우물천정", groupName: "우물천정" },
  { no: 6, majorCode: "CW", majorName: "공사성(창호 등)", midCode: "006", midName: "주방 레이아웃 변경", code: "CW-006-01", name: "주방 레이아웃 변경(ㄱ자형)", groupName: "레이아웃 변경" },
  { no: 7, majorCode: "CW", majorName: "공사성(창호 등)", midCode: "006", midName: "주방 레이아웃 변경", code: "CW-006-02", name: "주방 레이아웃 변경(一자형)", groupName: "레이아웃 변경" },
  { no: 8, majorCode: "CW", majorName: "공사성(창호 등)", midCode: "007", midName: "침실-복도 레이아웃 변경", code: "CW-007-01", name: "침실-복도 레이아웃 변경(통합형)", groupName: "레이아웃 변경" },
  { no: 9, majorCode: "CW", majorName: "공사성(창호 등)", midCode: "008", midName: "유리난간 매립형 시스템창호", code: "CW-008-01", name: "유리난간 매립형 시스템창호", groupName: "외부창호" },
  { no: 10, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "100", midName: "강마루", code: "FM-100-01", name: "강마루", groupName: "마루", maker: "이건산업", model: "DL-MISTY GREY", finish: "강마루", size: "7.5*115*800" },
  { no: 11, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "101", midName: "광폭 강마루", code: "FM-101-01", name: "광폭 강마루", groupName: "마루", maker: "이건산업", model: "DL-MISTY FLEX", finish: "광폭 강마루", size: "10.5*143*1200" },
  { no: 12, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "102", midName: "원목마루", code: "FM-102-01", name: "원목마루/캄리아이보리(11.5t)", groupName: "마루", maker: "이건산업", model: "DL-CALMLY IVORY", finish: "원목마루", size: "11.5*150*1200" },
  { no: 13, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "102", midName: "원목마루", code: "FM-102-02", name: "원목마루/딤그레이(11.5t)", groupName: "마루", maker: "이건산업", model: "DL-DIM GREY", finish: "원목마루", size: "11.5*150*1200" },
  { no: 14, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "102", midName: "원목마루", code: "FM-102-03", name: "원목마루/캄리아이보리(12.5t)", groupName: "마루", maker: "이건산업", model: "DL-CALMLY IVORY", finish: "원목마루", size: "12.5*150*1200" },
  { no: 15, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "102", midName: "원목마루", code: "FM-102-04", name: "원목마루/딤그레이(12.5t)", groupName: "마루", maker: "이건산업", model: "DL-DIM GREY", finish: "원목마루", size: "12.5*150*1200" },
  { no: 16, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "102", midName: "원목마루", code: "FM-102-05", name: "원목마루/캄리아이보리(노량진-조합)", groupName: "마루", maker: "이건산업", model: "DL-CALMLY IVORY", finish: "원목마루", size: "190*1900" },
  { no: 17, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "102", midName: "원목마루", code: "FM-102-06", name: "원목마루/딤그레이(노량진-조합)", groupName: "마루", maker: "이건산업", model: "DL-DIM GREY", finish: "원목마루", size: "190*1900" },
  { no: 18, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "103", midName: "외산 원목마루", code: "FM-103-01", name: "외산 원목마루", groupName: "마루", maker: "파나제", model: "Café Cream", finish: "원목마루" },
  { no: 19, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "104", midName: "디자인 월", code: "FM-104-01", name: "디자인 월/e편한세상", groupName: "디자인 월/세라믹패널", maker: "동화기업", model: "A042 Lilt Gray(前 SAHARA LIGHT)", finish: "디자인 월", size: "1000*2400(2500)*9T / 660*2400(2500)*9T / 495*2400(2500)*9T" },
  { no: 20, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "104", midName: "디자인 월", code: "FM-104-02", name: "디자인 월/아크로", groupName: "디자인 월/세라믹패널", maker: "동화기업", model: "A043 Lilt Blanc(前 SAHARA BLANC)", finish: "디자인 월", size: "1000*2400(2500)*9T / 660*2400(2500)*9T / 495*2400(2500)*9T" },
  { no: 21, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "104", midName: "디자인 월", code: "FM-104-03", name: "디자인 월/e편한세상 목창호 패턴", groupName: "디자인 월/세라믹패널", maker: "동화기업", model: "A039 MAISON WHITE", finish: "디자인 월", size: "1000*2400(2500)*9T / 660*2400(2500)*9T / 495*2400(2500)*9T" },
  { no: 22, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "104", midName: "디자인 월", code: "FM-104-04", name: "디자인 월/아크로 목창호 패턴", groupName: "디자인 월/세라믹패널", maker: "동화기업", model: "A03V SOLID WOOD", finish: "디자인 월", size: "1000*2400(2500)*9T / 660*2400(2500)*9T / 495*2400(2500)*9T" },
  { no: 23, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "105", midName: "세라믹 패널", code: "FM-105-01", name: "세라믹 패널/ARLES BLANCO", groupName: "디자인 월/세라믹패널", maker: "코아스", model: "ARLES BLANCO", finish: "세라믹 패널", size: "1200*2600*5.6T" },
  { no: 24, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "105", midName: "세라믹 패널", code: "FM-105-02", name: "세라믹 패널/LASA DELUXE", groupName: "디자인 월/세라믹패널", maker: "코아스", model: "LASA DELUXE", finish: "세라믹 패널", size: "1200*2600*5.6T" },
  { no: 25, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "106", midName: "목창호(튜블러 손잡이 포함)", code: "FM-106-01", name: "목창호(튜블러 손잡이 포함)", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "본공사입찰", model: "기본사양 확인 필요" },
  { no: 26, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "107", midName: "목창호(모티스 손잡이 포함)", code: "FM-107-01", name: "목창호(모티스 손잡이 포함)", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "본공사입찰", model: "기본사양 확인 필요" },
  { no: 27, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "108", midName: "디자인 월 인피니티 도어", code: "FM-108-01", name: "디자인 월 인피니티 도어/e편한세상", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "도어 디자인월 : 동화기업 / 히든도어 철물 : 가비온 / 도어레버 : 대흥건철", model: "벽/도어 : A042 Lilt Gray / 도어레버 : 대흥건철 P-801H SN 디자인 기준 / 손끼임방지 포함 현장 확인 필요", finish: "디자인 월 / 손잡이" },
  { no: 28, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "108", midName: "디자인 월 인피니티 도어", code: "FM-108-02", name: "디자인 월 인피니티 도어(모티스 손잡이 포함)/e편한세상", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "도어 디자인월 : 동화기업 / 히든도어 철물 : 가비온 / 도어레버 : 대흥건철", model: "벽/도어 : A042 Lilt Gray / 도어레버 : 대흥건철 HD02SN 디자인 기준 / 손끼임방지 포함 현장 확인 필요", finish: "디자인 월 / 손잡이" },
  { no: 29, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "109", midName: "디자인 월 인피니티 도어(튜블러 손잡이 포함)", code: "FM-109-01", name: "디자인 월 인피니티 도어(튜블러 손잡이 포함)/아크로", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "도어 디자인월 : 동화기업 / 히든도어 철물 : 가비온 / 도어레버 : 대흥건철", model: "벽/도어 : A043 Lilt Blanc / 도어레버 : 대흥건철 P-801H SN 디자인 기준 / 손끼임방지 포함 현장 확인 필요", finish: "디자인 월 / 손잡이" },
  { no: 30, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "110", midName: "디자인 월 인피니티 도어(모티스 손잡이 포함)", code: "FM-110-01", name: "디자인 월 인피니티 도어(모티스 손잡이 포함)/아크로", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "도어 디자인월 : 동화기업 / 히든도어 철물 : 가비온 / 도어레버 : 대흥건철", model: "벽/도어 : A043 Lilt Blanc / 도어레버 : 대흥건철 HD02SN 디자인 기준 / 손끼임방지 포함 현장 확인 필요", finish: "디자인 월 / 손잡이" },
  { no: 31, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "111", midName: "세라믹 패널 인피니티 도어(튜블러 손잡이 포함)", code: "FM-111-01", name: "세라믹 패널 인피니티 도어(튜블러 손잡이 포함)/ARLES BLANCO", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "도어 세라믹패널 : 코아스 / 히든도어 철물 : 가비온 / 도어레버 : 대흥건철", model: "벽/도어 : ARLES BLANCO / 도어레버 : 대흥건철 P-801H SN 디자인 기준 / 손끼임방지 포함 현장 확인 필요", finish: "세라믹 패널 / 손잡이" },
  { no: 32, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "111", midName: "세라믹 패널 인피니티 도어(튜블러 손잡이 포함)", code: "FM-111-02", name: "세라믹 패널 인피니티 도어(튜블러 손잡이 포함)/LASA DELUXE", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "도어 세라믹패널 : 코아스 / 히든도어 철물 : 가비온 / 도어레버 : 대흥건철", model: "벽/도어 : LASA DELUX / 도어레버 : 대흥건철 P-801H SN 디자인 기준 / 손끼임방지 포함 현장 확인 필요", finish: "세라믹 패널 / 손잡이" },
  { no: 33, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "112", midName: "세라믹 패널 인피니티 도어(모티스 손잡이 포함)", code: "FM-112-01", name: "세라믹 패널 인피니티 도어(모티스 손잡이 포함)/ARLES BLANCO", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "도어 세라믹패널 : 코아스 / 히든도어 철물 : 가비온 / 도어레버 : 대흥건철", model: "벽/도어 : ARLES BLANCO / 도어레버 : 대흥건철 HD02SN 디자인 기준 / 손끼임방지 포함 현장 확인 필요", finish: "세라믹 패널 / 손잡이" },
  { no: 34, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "112", midName: "세라믹 패널 인피니티 도어(모티스 손잡이 포함)", code: "FM-112-02", name: "세라믹 패널 인피니티 도어(모티스 손잡이 포함)/LASA DELUXE", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "도어 세라믹패널 : 코아스 / 히든도어 철물 : 가비온 / 도어레버 : 대흥건철", model: "벽/도어 : LASA DELUX / 도어레버 : 대흥건철 HD02SN 디자인 기준 / 손끼임방지 포함 현장 확인 필요", finish: "세라믹 패널 / 손잡이" },
  { no: 35, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "113", midName: "도장", code: "FM-113-01", name: "도장", groupName: "도장/탄성코트", finish: "도장" },
  { no: 36, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "114", midName: "탄성코트", code: "FM-114-01", name: "탄성코트", groupName: "도장/탄성코트", maker: "노루페인트", model: "예그리나 탄성코트 DL 진주A", finish: "탄성코트" },
  { no: 37, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "115", midName: "세라믹 탄성코트", code: "FM-115-01", name: "세라믹 탄성코트", groupName: "도장/탄성코트", maker: "노루페인트", model: "DL 세라코트 진주 (CeraCoat Pearl)", finish: "탄성코트" },
  { no: 38, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "116", midName: "천장지", code: "FM-116-01", name: "천장지", groupName: "벽지/천장지", finish: "벽지" },
  { no: 39, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "117", midName: "벽지", code: "FM-117-01", name: "벽지", groupName: "벽지/천장지", finish: "벽지" },
  { no: 40, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "118", midName: "자기질 타일", code: "FM-118-01", name: "자기질 타일", groupName: "타일", maker: "대동산업", model: "DF 4576(DLU_DF  BEIGE 2024W)", finish: "자기질 타일", size: "300*300" },
  { no: 41, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "119", midName: "도기질 타일", code: "FM-119-01", name: "도기질 타일", groupName: "타일", maker: "대동산업", model: "DW 9538S2", finish: "자기질 타일", size: "300*600" },
  { no: 42, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "120", midName: "포세린 타일", code: "FM-120-01", name: "포세린 타일/가영세라믹스", groupName: "타일", maker: "가영세라믹스", model: "SLOW ROCK", finish: "포세린 타일", size: "600*600" },
  { no: 43, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "120", midName: "포세린 타일", code: "FM-120-02", name: "포세린 타일/대동산업", groupName: "타일", maker: "대동산업", model: "SJG 449NX1", finish: "포세린 타일", size: "600*600" },
  { no: 44, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "120", midName: "포세린 타일", code: "FM-120-03", name: "포세린 타일/건식세탁실", groupName: "타일", maker: "대동산업", model: "SJG391", finish: "포세린 타일", size: "600*600" },
  { no: 45, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "121", midName: "엔지니어드 스톤-스탠다드", code: "FM-121-01", name: "엔지니어드 스톤-스탠다드/실버쉐이드", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "SS746 실버쉐이드", finish: "엔지니어드 스톤" },
  { no: 46, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "121", midName: "엔지니어드 스톤-스탠다드", code: "FM-121-02", name: "엔지니어드 스톤-스탠다드/골든쇼어", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "GS750 골든쇼어", finish: "엔지니어드 스톤" },
  { no: 47, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "121", midName: "엔지니어드 스톤-스탠다드", code: "FM-121-03", name: "엔지니어드 스톤-스탠다드/마터호른", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "MA130 마터호른", finish: "엔지니어드 스톤" },
  { no: 48, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "122", midName: "엔지니어드 스톤-프리미엄", code: "FM-122-01", name: "엔지니어드 스톤-프리미엄/솔라로", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "SR264 솔라로", finish: "엔지니어드 스톤" },
  { no: 49, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "122", midName: "엔지니어드 스톤-프리미엄", code: "FM-122-02", name: "엔지니어드 스톤-프리미엄/델라카토", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "DC710 델라카토", finish: "엔지니어드 스톤" },
  { no: 50, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "123", midName: "엔지니어드 스톤-프레스티지", code: "FM-123-01", name: "엔지니어드 스톤-프레스티지/나폴리베이지", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "NB278 나폴리베이지", finish: "엔지니어드 스톤" },
  { no: 51, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "123", midName: "엔지니어드 스톤-프레스티지", code: "FM-123-02", name: "엔지니어드 스톤-프레스티지/몬테비소", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "MV355 몬테비소", finish: "엔지니어드 스톤" },
  { no: 52, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "123", midName: "엔지니어드 스톤-프레스티지", code: "FM-123-03", name: "엔지니어드 스톤-프레스티지/에트나스노우", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "ES235 에트나스노우", finish: "엔지니어드 스톤" },
  { no: 53, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "124", midName: "엔지니어드 스톤-칸스톤", code: "FM-124-01", name: "엔지니어드 스톤-칸스톤/르블랑", groupName: "엔지니어드 스톤/인조대리석", maker: "현대 L&C", model: "K5405 르블랑", finish: "엔지니어드 스톤" },
  { no: 54, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "124", midName: "엔지니어드 스톤-칸스톤", code: "FM-124-02", name: "엔지니어드 스톤-칸스톤/루나화이트", groupName: "엔지니어드 스톤/인조대리석", maker: "현대 L&C", model: "W1763 루나화이트", finish: "엔지니어드 스톤" },
  { no: 55, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "130", midName: "엔지니어드 스톤", code: "FM-130-01", name: "엔지니어드 스톤-미존/사비아베이지", groupName: "엔지니어드 스톤/인조대리석", maker: "미존", model: "사비아베이지", finish: "엔지니어드 스톤" },
  { no: 56, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "125", midName: "MMA", code: "FM-125-01", name: "MMA/샌디드구스", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "SG428 샌디드구스", finish: "인조대리석" },
  { no: 57, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "125", midName: "MMA", code: "FM-125-02", name: "MMA/콜리나차이", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "PC829 콜리나차이", finish: "인조대리석" },
  { no: 58, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "126", midName: "컴파운드스톤", code: "FM-126-01", name: "컴파운드스톤/아부루조", groupName: "엔지니어드 스톤/인조대리석", maker: "롯데 케미칼", model: "아부루조 H002", finish: "인조대리석" },
  { no: 59, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "127", midName: "패널형마감재", code: "FM-127-01", name: "패널형마감재/콜렉트월 라임스톤화이트", groupName: "패널형마감재", maker: "한솔홈데코", model: "콜렉트월 라임스톤화이트", finish: "패널형마감재" },
  { no: 60, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "127", midName: "패널형마감재", code: "FM-127-02", name: "패널형마감재/콜렉트월 318", groupName: "패널형마감재", maker: "한솔홈데코", model: "콜렉트월 318", finish: "패널형마감재" },
  { no: 61, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "128", midName: "터닝도어", code: "FM-128-01", name: "터닝도어/e편한세상 목창호 패턴", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "바우텍", model: "PNW481VL(데코밸리 DKG481)", finish: "PP" },
  { no: 62, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "128", midName: "터닝도어", code: "FM-128-02", name: "터닝도어/아크로 목창호 패턴", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "바우텍", model: "PPSA77VL(데코밸리 DKG077)", finish: "PP" },
  { no: 63, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "128", midName: "터닝도어", code: "FM-128-03", name: "터닝도어/e편한세상 디자인월 패턴", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "바우텍", model: "PNWA90VL(데코밸리 DKG090)", finish: "PP" },
  { no: 64, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "128", midName: "터닝도어", code: "FM-128-04", name: "터닝도어/아크로 디자인월 패턴", groupName: "도어(목창호/인피니티도어/터닝도어)", maker: "바우텍", model: "PNWA91VL(데코밸리 DKG091)", finish: "PP" },
  { no: 65, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "129", midName: "시트패널", code: "FM-129-01", name: "시트패널/e편한세상 목창호 패턴", groupName: "시트패널", model: "PNW481VL(데코밸리 DKG481)", finish: "PP" },
  { no: 66, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "129", midName: "시트패널", code: "FM-129-02", name: "시트패널/아크로 목창호 패턴", groupName: "시트패널", model: "PPSA77VL(데코밸리 DKG077)", finish: "PP" },
  { no: 67, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "129", midName: "시트패널", code: "FM-129-03", name: "시트패널/e편한세상 디자인월 패턴", groupName: "시트패널", model: "PNWA90VL(데코밸리 DKG090)", finish: "PP" },
  { no: 68, majorCode: "FM", majorName: "마감재(바닥/벽 등)", midCode: "129", midName: "시트패널", code: "FM-129-04", name: "시트패널/아크로 디자인월 패턴", groupName: "시트패널", model: "PNWA91VL(데코밸리 DKG091)", finish: "PP" },
  { no: 69, majorCode: "AC", majorName: "악세서리", midCode: "299", midName: "설비공사", code: "AC-299-01", name: "설비공사", groupName: "설비공사" },
  { no: 70, majorCode: "AC", majorName: "악세서리", midCode: "200", midName: "국산 주방수전/워터웍스유진", code: "AC-200-01", name: "국산 주방수전/워터웍스유진", groupName: "주방/다용도실 수전", maker: "워터웍스유진", model: "YJ7515", finish: "주방 수전" },
  { no: 71, majorCode: "AC", majorName: "악세서리", midCode: "201", midName: "국산 주방수전/대림바스", code: "AC-201-01", name: "국산 주방수전/대림바스", groupName: "주방/다용도실 수전", maker: "대림바스", model: "DL-K6219", finish: "주방 수전" },
  { no: 72, majorCode: "AC", majorName: "악세서리", midCode: "202", midName: "국산 다용도실 하부장 수전/대림바스", code: "AC-202-01", name: "국산 다용도실 하부장 수전/대림바스", groupName: "주방/다용도실 수전", maker: "대림바스", model: "DL-K1417", finish: "다용도실 수전" },
  { no: 73, majorCode: "AC", majorName: "악세서리", midCode: "203", midName: "국산 일반 세면기 수전/대림바스", code: "AC-203-01", name: "국산 일반 세면기 수전/대림바스", groupName: "욕실 수전/악세서리", maker: "대림바스", model: "DL-L5110", finish: "세면기 수전" },
  { no: 74, majorCode: "AC", majorName: "악세서리", midCode: "204", midName: "국산 언더볼 세면기 수전/대림바스", code: "AC-204-01", name: "국산 언더볼 세면기 수전/대림바스", groupName: "욕실 수전/악세서리", maker: "대림바스", model: "DL-L5610", finish: "세면기 수전" },
  { no: 75, majorCode: "AC", majorName: "악세서리", midCode: "205", midName: "국산 선반형 샤워수전/대림바스", code: "AC-205-01", name: "국산 선반형 샤워수전/대림바스", groupName: "욕실 수전/악세서리", maker: "대림바스", model: "DL-B7010", finish: "샤워 수전" },
  { no: 76, majorCode: "AC", majorName: "악세서리", midCode: "206", midName: "국산 선반형 욕조수전/대림바스", code: "AC-206-01", name: "국산 선반형 욕조수전/대림바스", groupName: "욕실 수전/악세서리", maker: "대림바스", model: "DL-B7014SD", finish: "욕조 수전" },
  { no: 77, majorCode: "AC", majorName: "악세서리", midCode: "207", midName: "국산 슬라이드바/대림바스", code: "AC-207-01", name: "국산 슬라이드바/대림바스", groupName: "욕실 수전/악세서리", maker: "대림바스", model: "DL-S4106", finish: "슬라이드바" },
  { no: 78, majorCode: "AC", majorName: "악세서리", midCode: "208", midName: "국산 안마샤워헤드/대림바스", code: "AC-208-01", name: "국산 안마샤워헤드/대림바스", groupName: "욕실 수전/악세서리", maker: "대림바스", model: "DL-S4551", finish: "안마샤워헤드" },
  { no: 79, majorCode: "AC", majorName: "악세서리", midCode: "209", midName: "국산 일반 세면기(공용욕실)/대림바스", code: "AC-209-01", name: "국산 일반 세면기(공용욕실)/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", model: "CL-339", finish: "세면기" },
  { no: 80, majorCode: "AC", majorName: "악세서리", midCode: "210", midName: "국산 일반 세면기(부부욕실)/대림바스", code: "AC-210-01", name: "국산 일반 세면기(부부욕실)/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", model: "CL-336", finish: "세면기" },
  { no: 81, majorCode: "AC", majorName: "악세서리", midCode: "211", midName: "국산 언더볼 세면기/대림바스", code: "AC-211-01", name: "국산 언더볼 세면기/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", model: "CL-605", finish: "세면기" },
  { no: 82, majorCode: "AC", majorName: "악세서리", midCode: "212", midName: "국산 탑볼 세면기/대림바스", code: "AC-212-01", name: "국산 탑볼 세면기/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", finish: "세면기" },
  { no: 83, majorCode: "AC", majorName: "악세서리", midCode: "213", midName: "국산 양변기/대림바스", code: "AC-213-01", name: "국산 양변기/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", model: "CC-767", finish: "양변기" },
  { no: 84, majorCode: "AC", majorName: "악세서리", midCode: "214", midName: "국산 양변기(벽배수)/대림바스", code: "AC-214-01", name: "국산 양변기(벽배수)/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", model: "CC-730P", finish: "양변기" },
  { no: 85, majorCode: "AC", majorName: "악세서리", midCode: "215", midName: "국산 양변기(벽걸이형)/대림바스", code: "AC-215-01", name: "국산 양변기(벽걸이형)/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", model: "CC-420P", finish: "양변기" },
  { no: 86, majorCode: "AC", majorName: "악세서리", midCode: "216", midName: "국산 비데일체형 양변기/대림바스", code: "AC-216-01", name: "국산 비데일체형 양변기/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", model: "DST-660", finish: "양변기" },
  { no: 87, majorCode: "AC", majorName: "악세서리", midCode: "217", midName: "국산 비데일체형 양변기(벽배수)/대림바스", code: "AC-217-01", name: "국산 비데일체형 양변기(벽배수)/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", finish: "양변기" },
  { no: 88, majorCode: "AC", majorName: "악세서리", midCode: "218", midName: "국산 분리형 비데/대림바스", code: "AC-218-01", name: "국산 분리형 비데/대림바스", groupName: "욕실 도기/위생기구", maker: "대림바스", model: "DST-1300", finish: "분리형 비데" },
  { no: 89, majorCode: "AC", majorName: "악세서리", midCode: "219", midName: "국산 세라믹 욕조", code: "AC-219-01", name: "국산 세라믹 욕조", groupName: "욕실 도기/위생기구", maker: "사전입찰", finish: "욕조" },
  { no: 90, majorCode: "AC", majorName: "악세서리", midCode: "220", midName: "국산 아크릴 욕조", code: "AC-220-01", name: "국산 아크릴 욕조", groupName: "욕실 도기/위생기구", maker: "사전입찰", finish: "욕조" },
  { no: 91, majorCode: "AC", majorName: "악세서리", midCode: "221", midName: "국산 일반 수건걸이/대림바스", code: "AC-221-01", name: "국산 일반 수건걸이/대림바스", groupName: "욕실 수전/악세서리", maker: "대림바스", model: "BN-2060", finish: "수건걸이" },
  { no: 92, majorCode: "AC", majorName: "악세서리", midCode: "222", midName: "국산 슬림형 수건걸이/대림바스", code: "AC-222-01", name: "국산 슬림형 수건걸이/대림바스", groupName: "욕실 수전/악세서리", maker: "대림바스", model: "DA-160", finish: "수건걸이" },
  { no: 93, majorCode: "AC", majorName: "악세서리", midCode: "223", midName: "외산 주방수전/한스그로헤", code: "AC-223-01", name: "외산 주방수전/한스그로헤", groupName: "주방/다용도실 수전", maker: "Hansgrohe", model: "#72800", finish: "주방 수전" },
  { no: 94, majorCode: "AC", majorName: "악세서리", midCode: "224", midName: "외산 일반,언더볼 세면기 수전/한스그로헤", code: "AC-224-01", name: "외산 일반,언더볼 세면기 수전/한스그로헤-서초(단종)", groupName: "욕실 수전/악세서리", maker: "Hansgrohe", model: "#31607", finish: "세면기 수전" },
  { no: 95, majorCode: "AC", majorName: "악세서리", midCode: "224", midName: "외산 일반,언더볼 세면기 수전/한스그로헤", code: "AC-224-02", name: "외산 일반,언더볼 세면기 수전/한스그로헤-방배(단종)", groupName: "욕실 수전/악세서리", maker: "Hansgrohe", model: "#71251", finish: "세면기 수전" },
  { no: 96, majorCode: "AC", majorName: "악세서리", midCode: "224", midName: "외산 일반,언더볼 세면기 수전/한스그로헤", code: "AC-224-03", name: "외산 일반,언더볼 세면기 수전/한스그로헤", groupName: "욕실 수전/악세서리", maker: "Hansgrohe", model: "#31509", finish: "세면기 수전" },
  { no: 97, majorCode: "AC", majorName: "악세서리", midCode: "225", midName: "외산 탑볼 세면기 수전/한스그로헤", code: "AC-225-01", name: "외산 탑볼 세면기 수전/한스그로헤", groupName: "욕실 수전/악세서리", maker: "Hansgrohe", model: "#72583", finish: "세면기 수전" },
  { no: 98, majorCode: "AC", majorName: "악세서리", midCode: "226", midName: "외산 선반형 샤워수전/한스그로헤", code: "AC-226-01", name: "외산 선반형 샤워수전/한스그로헤", groupName: "욕실 수전/악세서리", maker: "Hansgrohe", model: "#24221000", finish: "샤워 수전" },
  { no: 99, majorCode: "AC", majorName: "악세서리", midCode: "227", midName: "외산 선반형 욕조수전/한스그로헤", code: "AC-227-01", name: "외산 선반형 욕조수전/한스그로헤", groupName: "욕실 수전/악세서리", maker: "Hansgrohe", model: "#24340", finish: "욕조 수전" },
  { no: 100, majorCode: "AC", majorName: "악세서리", midCode: "228", midName: "외산 슬라이드바/한스그로헤", code: "AC-228-01", name: "외산 슬라이드바/한스그로헤", groupName: "욕실 수전/악세서리", maker: "Hansgrohe", model: "#26503", finish: "슬라이드바" },
  { no: 101, majorCode: "AC", majorName: "악세서리", midCode: "229", midName: "외산 안마샤워헤드/한스그로헤", code: "AC-229-01", name: "외산 안마샤워헤드/한스그로헤", groupName: "욕실 수전/악세서리", maker: "Hansgrohe", model: "#24111", finish: "안마샤워헤드" },
  { no: 102, majorCode: "AC", majorName: "악세서리", midCode: "230", midName: "외산 일반 세면기/아메리칸스탠다드", code: "AC-230-01", name: "외산 일반 세면기/아메리칸스탠다드", groupName: "욕실 도기/위생기구", maker: "American Standard", model: "CCASF515", finish: "세면기" },
  { no: 103, majorCode: "AC", majorName: "악세서리", midCode: "231", midName: "외산 언더볼 세면기/아메리칸스탠다드", code: "AC-231-01", name: "외산 언더볼 세면기/아메리칸스탠다드", groupName: "욕실 도기/위생기구", maker: "American Standard", model: "CCAS0440", finish: "세면기" },
  { no: 104, majorCode: "AC", majorName: "악세서리", midCode: "232", midName: "외산 탑볼 세면기/아메리칸스탠다드", code: "AC-232-01", name: "외산 탑볼 세면기/아메리칸스탠다드", groupName: "욕실 도기/위생기구", maker: "American Standard", model: "CCAS0628", finish: "세면기" },
  { no: 105, majorCode: "AC", majorName: "악세서리", midCode: "233", midName: "외산 양변기", code: "AC-233-01", name: "외산 양변기", groupName: "욕실 도기/위생기구", finish: "양변기" },
  { no: 106, majorCode: "AC", majorName: "악세서리", midCode: "234", midName: "외산 양변기(벽배수)", code: "AC-234-01", name: "외산 양변기(벽배수)", groupName: "욕실 도기/위생기구", finish: "양변기" },
  { no: 107, majorCode: "AC", majorName: "악세서리", midCode: "235", midName: "외산 양변기(벽걸이형)/게버릿", code: "AC-235-01", name: "외산 양변기(벽걸이형)/게버릿", groupName: "욕실 도기/위생기구", maker: "GEBERIT", model: "C101G", finish: "양변기" },
  { no: 108, majorCode: "AC", majorName: "악세서리", midCode: "236", midName: "외산 비데일체형 양변기", code: "AC-236-01", name: "외산 비데일체형 양변기", groupName: "욕실 도기/위생기구", finish: "양변기" },
  { no: 109, majorCode: "AC", majorName: "악세서리", midCode: "237", midName: "외산 비데일체형 양변기(벽배수)/아메리칸스탠다드", code: "AC-237-01", name: "외산 비데일체형 양변기(벽배수)/아메리칸스탠다드", groupName: "욕실 도기/위생기구", maker: "American Standard", model: "C834000E / C364000B", finish: "양변기" },
  { no: 110, majorCode: "AC", majorName: "악세서리", midCode: "238", midName: "외산 세라믹 욕조", code: "AC-238-01", name: "외산 세라믹 욕조", groupName: "욕실 도기/위생기구", finish: "욕조" },
  { no: 111, majorCode: "AC", majorName: "악세서리", midCode: "239", midName: "외산 아크릴 욕조", code: "AC-239-01", name: "외산 아크릴 욕조", groupName: "욕실 도기/위생기구", finish: "욕조" },
  { no: 112, majorCode: "AC", majorName: "악세서리", midCode: "240", midName: "무선 물내림 스마트 스위치", code: "AC-240-01", name: "무선 물내림 스마트 스위치", groupName: "욕실 스마트 스위치", maker: "스카이시스템", finish: "무선 물내림 스마트 스위치" },
  { no: 113, majorCode: "AC", majorName: "악세서리", midCode: "241", midName: "기본 욕실팬/고효율 3단", code: "AC-241-01", name: "기본 욕실팬/고효율 3단", groupName: "욕실 환기팬", maker: "힘펠", model: "FZD-C120_D", finish: "기본 욕실팬" },
  { no: 114, majorCode: "AC", majorName: "악세서리", midCode: "242", midName: "기본 욕실팬/고효율 1단", code: "AC-242-01", name: "기본 욕실팬/고효율 1단", groupName: "욕실 환기팬", maker: "힘펠", model: "FZD-C90S", finish: "기본 욕실팬" },
  { no: 115, majorCode: "AC", majorName: "악세서리", midCode: "243", midName: "기본 욕실팬/정풍량", code: "AC-243-01", name: "기본 욕실팬/정풍량", groupName: "욕실 환기팬", maker: "힘펠", model: "HV3-80X(MD-N)", finish: "기본 욕실팬" },
  { no: 116, majorCode: "AC", majorName: "악세서리", midCode: "244", midName: "복합환풍기", code: "AC-244-01", name: "복합환풍기", groupName: "욕실 환기팬", maker: "힘펠", model: "휴젠뜨3", finish: "복합환풍기" },
  { no: 117, majorCode: "AC", majorName: "악세서리", midCode: "245", midName: "실별 환기시스템(D-Air Planner)", code: "AC-245-01", name: "실별 환기시스템(D-Air Planner)", groupName: "실별 환기시스템/전열교환기", maker: "힘펠", model: "D-AirPlanner", finish: "실별 환기시스템" },
  { no: 118, majorCode: "AC", majorName: "악세서리", midCode: "246", midName: "고효율 전열교환기", code: "AC-246-01", name: "고효율 전열교환기", groupName: "실별 환기시스템/전열교환기", maker: "힘펠", model: "HRD1-150EPI_B", finish: "전열교환기" },
  { no: 119, majorCode: "AC", majorName: "악세서리", midCode: "247", midName: "공기청정형 전열교환기", code: "AC-247-01", name: "공기청정형 전열교환기", groupName: "실별 환기시스템/전열교환기", maker: "힘펠", model: "HRD-EP150IBC", finish: "전열교환기" },
  { no: 120, majorCode: "AC", majorName: "악세서리", midCode: "248", midName: "안티바이러스 공기청정형 전열교환기", code: "AC-248-01", name: "안티바이러스 공기청정형 전열교환기", groupName: "실별 환기시스템/전열교환기", maker: "힘펠", finish: "전열교환기" },
  { no: 121, majorCode: "AC", majorName: "악세서리", midCode: "249", midName: "렌지후드(일반침니형)", code: "AC-249-01", name: "렌지후드(일반침니형)", groupName: "주방 렌지후드", maker: "사전입찰", finish: "렌지후드" },
  { no: 122, majorCode: "AC", majorName: "악세서리", midCode: "250", midName: "렌지후드(디사일런트)", code: "AC-250-01", name: "렌지후드(디사일런트)", groupName: "주방 렌지후드", maker: "힘펠", model: "FDD2-C350I_MD", finish: "렌지후드" },
  { no: 123, majorCode: "AC", majorName: "악세서리", midCode: "251", midName: "제습기(덕트 연결형)", code: "AC-251-01", name: "제습기(덕트 연결형)", groupName: "제습기", maker: "힘펠" },
  { no: 124, majorCode: "AC", majorName: "악세서리", midCode: "252", midName: "제습기(단독 장비형)", code: "AC-252-01", name: "제습기(단독 장비형)", groupName: "제습기", maker: "힘펠" },
  { no: 125, majorCode: "EE", majorName: "전기설비", midCode: "399", midName: "전기공사", code: "EE-399-01", name: "전기공사", groupName: "전기공사" },
  { no: 126, majorCode: "EE", majorName: "전기설비", midCode: "300", midName: "직부등", code: "EE-300-01", name: "직부등", groupName: "조명", maker: "알토" },
  { no: 127, majorCode: "EE", majorName: "전기설비", midCode: "301", midName: "거실 디밍 제어시스템(12단계 밝기 조절)", code: "EE-301-01", name: "거실 디밍 제어시스템(12단계 밝기 조절)", groupName: "조명특화", maker: "알토" },
  { no: 128, majorCode: "EE", majorName: "전기설비", midCode: "302", midName: "거실 커튼박스 간접조명", code: "EE-302-01", name: "거실 커튼박스 간접조명", groupName: "조명특화", maker: "알토" },
  { no: 129, majorCode: "EE", majorName: "전기설비", midCode: "303", midName: "거실/주방/복도 조명 다운라이트 특화", code: "EE-303-01", name: "거실/주방/복도 조명 다운라이트 특화", groupName: "조명특화" },
  { no: 130, majorCode: "EE", majorName: "전기설비", midCode: "304", midName: "현관/거실/주방/복도 조명 다운라이트 특화(NGR)", code: "EE-304-01", name: "현관/거실/주방/복도 조명 다운라이트 특화(NGR)", groupName: "조명특화" },
  { no: 131, majorCode: "EE", majorName: "전기설비", midCode: "305", midName: "복도 스텝등", code: "EE-305-01", name: "복도 스텝등", groupName: "조명특화", maker: "알토" },
  { no: 132, majorCode: "EE", majorName: "전기설비", midCode: "306", midName: "침실 디밍 제어시스템(12단계 색온도,밝기 조절)", code: "EE-306-01", name: "침실 디밍 제어시스템(12단계 색온도,밝기 조절)", groupName: "조명특화" },
  { no: 133, majorCode: "EE", majorName: "전기설비", midCode: "307", midName: "매입형 욕실장 하부 간접조명", code: "EE-307-01", name: "매입형 욕실장 하부 간접조명", groupName: "조명특화", maker: "알토" },
  { no: 134, majorCode: "EE", majorName: "전기설비", midCode: "308", midName: "욕실 센서미등 겸용 다운라이트", code: "EE-308-01", name: "욕실 센서미등 겸용 다운라이트", groupName: "조명특화", maker: "알토" },
  { no: 135, majorCode: "EE", majorName: "전기설비", midCode: "309", midName: "거실 스마트 디스플레이 스위치 V1", code: "EE-309-01", name: "거실 스마트 디스플레이 스위치 V1", groupName: "배선기구(콘센트/스위치)", maker: "신동아이에스" },
  { no: 136, majorCode: "EE", majorName: "전기설비", midCode: "310", midName: "거실 스마트 디스플레이 스위치 V2", code: "EE-310-01", name: "거실 스마트 디스플레이 스위치 V2", groupName: "배선기구(콘센트/스위치)", maker: "신동아이에스" },
  { no: 137, majorCode: "EE", majorName: "전기설비", midCode: "311", midName: "침실 스마트 디스플레이 스위치 V1", code: "EE-311-01", name: "침실 스마트 디스플레이 스위치 V1", groupName: "배선기구(콘센트/스위치)", maker: "신동아이에스" },
  { no: 138, majorCode: "EE", majorName: "전기설비", midCode: "312", midName: "침실 스마트 디스플레이 스위치 V2", code: "EE-312-01", name: "침실 스마트 디스플레이 스위치 V2", groupName: "배선기구(콘센트/스위치)", maker: "신동아이에스" },
  { no: 139, majorCode: "EE", majorName: "전기설비", midCode: "313", midName: "벽등/내추럴 모던", code: "EE-313-01", name: "벽등/내추럴 모던", groupName: "조명", maker: "알토" },
  { no: 140, majorCode: "EE", majorName: "전기설비", midCode: "314", midName: "벽등/소프트 클래식", code: "EE-314-01", name: "벽등/소프트 클래식", groupName: "조명", maker: "알토" },
  { no: 141, majorCode: "EE", majorName: "전기설비", midCode: "315", midName: "벽등/내추럴 클래식", code: "EE-315-01", name: "벽등/내추럴 클래식", groupName: "조명", maker: "알토" },
  { no: 142, majorCode: "EE", majorName: "전기설비", midCode: "316", midName: "벽등/블랑 클래식", code: "EE-316-01", name: "벽등/블랑 클래식", groupName: "조명", maker: "알토" },
  { no: 143, majorCode: "EE", majorName: "전기설비", midCode: "317", midName: "독서등(사이드테이블*1)", code: "EE-317-01", name: "독서등(사이드테이블*1)", groupName: "조명", maker: "알토" },
  { no: 144, majorCode: "EE", majorName: "전기설비", midCode: "318", midName: "독서등(사이드테이블*2)", code: "EE-318-01", name: "독서등(사이드테이블*2)", groupName: "조명", maker: "알토" },
  { no: 145, majorCode: "EE", majorName: "전기설비", midCode: "319", midName: "통합컨트롤 조명제어시스템(사이드테이블*1)", code: "EE-319-01", name: "통합컨트롤 조명제어시스템(사이드테이블*1)", groupName: "조명특화", maker: "JUNG" },
  { no: 146, majorCode: "EE", majorName: "전기설비", midCode: "320", midName: "통합컨트롤 조명제어시스템(사이드테이블*2)", code: "EE-320-01", name: "통합컨트롤 조명제어시스템(사이드테이블*2)", groupName: "조명특화", maker: "JUNG" },
  { no: 147, majorCode: "EE", majorName: "전기설비", midCode: "321", midName: "스마트 전동커튼레일 2열", code: "EE-321-01", name: "스마트 전동커튼레일 2열", groupName: "조명특화", maker: "제일오토테크" },
  { no: 148, majorCode: "EE", majorName: "전기설비", midCode: "322", midName: "침실1 다운라이트 특화", code: "EE-322-01", name: "침실1 다운라이트 특화", groupName: "조명특화", maker: "알토" },
  { no: 149, majorCode: "EE", majorName: "전기설비", midCode: "323", midName: "다운라이트", code: "EE-323-01", name: "다운라이트", groupName: "조명", maker: "알토" },
  { no: 150, majorCode: "EE", majorName: "전기설비", midCode: "324", midName: "무선충전 상판매입 콘센트", code: "EE-324-01", name: "무선충전 상판매입 콘센트", groupName: "배선기구(콘센트/스위치)", maker: "SP팩토리", model: "SP-KF-020", finish: "아일랜드장" },
  { no: 151, majorCode: "EE", majorName: "전기설비", midCode: "325", midName: "상판매입 콘센트", code: "EE-325-01", name: "상판매입 콘센트", groupName: "배선기구(콘센트/스위치)", maker: "SP팩토리", model: "SP-KF-020N", finish: "책상결합형 붙박이장, 홈바" },
  { no: 152, majorCode: "EE", majorName: "전기설비", midCode: "326", midName: "밥솥장 콘센트", code: "EE-326-01", name: "밥솥장 콘센트", groupName: "배선기구(콘센트/스위치)", finish: "아일랜드장, 가전소물장" },
  { no: 153, majorCode: "EE", majorName: "전기설비", midCode: "327", midName: "가구 조명", code: "EE-327-01", name: "가구 조명", groupName: "조명" },
  { no: 154, majorCode: "EE", majorName: "전기설비", midCode: "328", midName: "통합형 콘센트", code: "EE-328-01", name: "통합형 콘센트", groupName: "배선기구(콘센트/스위치)", maker: "신동아이에스" },
  { no: 155, majorCode: "EE", majorName: "전기설비", midCode: "329", midName: "콘센트", code: "EE-329-01", name: "콘센트", groupName: "배선기구(콘센트/스위치)", maker: "신동아이에스" },
  { no: 156, majorCode: "EE", majorName: "전기설비", midCode: "330", midName: "콘센트(방우)", code: "EE-330-01", name: "콘센트(방우)", groupName: "배선기구(콘센트/스위치)", maker: "신동아이에스" },
  { no: 157, majorCode: "EE", majorName: "전기설비", midCode: "331", midName: "유럽형 콘센트", code: "EE-331-01", name: "유럽형 콘센트", groupName: "배선기구(콘센트/스위치)", maker: "JUNG", model: "LS990 플라스틱 도장" },
  { no: 158, majorCode: "EE", majorName: "전기설비", midCode: "332", midName: "유럽형 콘센트(방우)", code: "EE-332-01", name: "유럽형 콘센트(방우)", groupName: "배선기구(콘센트/스위치)", maker: "JUNG", model: "LS990 플라스틱 도장 방우형" },
  { no: 159, majorCode: "EE", majorName: "전기설비", midCode: "333", midName: "주방TV", code: "EE-333-01", name: "주방TV", groupName: "주방TV" },
  { no: 160, majorCode: "EE", majorName: "전기설비", midCode: "334", midName: "우물천장 간접조명(12단계 밝기 제어)", code: "EE-334-01", name: "우물천장 간접조명(12단계 밝기 제어)", groupName: "조명특화" },
  { no: 161, majorCode: "EE", majorName: "전기설비", midCode: "335", midName: "마그네틱 트랙조명", code: "EE-335-01", name: "마그네틱 트랙조명", groupName: "조명특화" },
  { no: 162, majorCode: "EE", majorName: "전기설비", midCode: "336", midName: "실링팬", code: "EE-336-01", name: "실링팬", groupName: "실링팬" },
  { no: 163, majorCode: "HA", majorName: "가전", midCode: "400", midName: "에어컨/LG", code: "HA-400-01", name: "에어컨/LG", groupName: "에어컨", maker: "LG", finish: "에어컨" },
  { no: 164, majorCode: "HA", majorName: "가전", midCode: "401", midName: "에어컨/삼성", code: "HA-401-01", name: "에어컨/삼성", groupName: "에어컨", maker: "삼성", finish: "에어컨" },
  { no: 165, majorCode: "HA", majorName: "가전", midCode: "402", midName: "프리미엄 에어컨/LG", code: "HA-402-01", name: "프리미엄 에어컨/LG", groupName: "에어컨", maker: "LG", finish: "프리미엄 에어컨" },
  { no: 166, majorCode: "HA", majorName: "가전", midCode: "403", midName: "프리미엄 에어컨/삼성", code: "HA-403-01", name: "프리미엄 에어컨/삼성", groupName: "에어컨", maker: "삼성", finish: "프리미엄 에어컨" },
  { no: 167, majorCode: "HA", majorName: "가전", midCode: "414", midName: "건조기", code: "HA-414-01", name: "건조기", groupName: "세탁기/건조기", finish: "건조기" },
  { no: 168, majorCode: "HA", majorName: "가전", midCode: "413", midName: "세탁기", code: "HA-413-01", name: "세탁기", groupName: "세탁기/건조기", finish: "세탁기" },
  { no: 169, majorCode: "HA", majorName: "가전", midCode: "412", midName: "의류관리기/LG 스타일러 5벌", code: "HA-412-01", name: "의류관리기/LG 스타일러 5벌", groupName: "의류관리기", maker: "LG", model: "SC5MBR53", finish: "의류관리기" },
  { no: 170, majorCode: "HA", majorName: "가전", midCode: "445", midName: "의류관리기/LG 스타일러 3벌", code: "HA-445-01", name: "의류관리기/LG 스타일러 3벌", groupName: "의류관리기", maker: "LG", model: "S3HFB", finish: "의류관리기" },
  { no: 171, majorCode: "HA", majorName: "가전", midCode: "442", midName: "빌트인 냉장고/LG 시그니처 냉장+냉동(설치키트 포함)", code: "HA-442-01", name: "빌트인 냉장고/LG 시그니처 냉장+냉동(설치키트 포함)", groupName: "빌트인 냉장고", maker: "LG", model: "CL24+CF24+CP-J99C(1set)", finish: "냉장고" },
  { no: 172, majorCode: "HA", majorName: "가전", midCode: "419", midName: "빌트인 냉장고/LG 시그니처 냉장+냉동+와인(설치키트 포함)", code: "HA-419-01", name: "빌트인 냉장고/LG 시그니처 냉장+냉동+와인(설치키트 포함)", groupName: "빌트인 냉장고", maker: "LG", model: "CL24+CF24+CW24L/R+CP-J99C(2set)", finish: "냉장고" },
  { no: 173, majorCode: "HA", majorName: "가전", midCode: "443", midName: "빌트인 냉장고/LG 오브제 1도어 냉장+냉동+김치(FIT&MAX)(설치키트 포함)", code: "HA-443-01", name: "빌트인 냉장고/LG 오브제 1도어 냉장+냉동+김치(FIT&MAX)(설치키트 포함)", groupName: "빌트인 냉장고", maker: "LG", model: "BC1L4AA.AKOR(G)+BC1F4AA.AKOR(G)+BC1K4AAAKOR(G)+OC-KIT5(2set)", finish: "냉장고" },
  { no: 174, majorCode: "HA", majorName: "가전", midCode: "415", midName: "빌트인 냉장고/LG 오브제 1도어 냉장+냉동+김치(설치키트 포함)", code: "HA-415-01", name: "빌트인 냉장고/LG 오브제 1도어 냉장+냉동+김치(설치키트 포함)", groupName: "빌트인 냉장고", maker: "LG", model: "BC1L2AA(G)+BC1F2AA(G)+BC1K2AA(G)+OC-KIT(2set)", finish: "냉장고" },
  { no: 175, majorCode: "HA", majorName: "가전", midCode: "418", midName: "빌트인 냉장고/LG 오브제 4도어", code: "HA-418-01", name: "빌트인 냉장고/LG 오브제 4도어", groupName: "빌트인 냉장고", maker: "LG", model: "BC4S1AA1(G)", finish: "냉장고" },
  { no: 176, majorCode: "HA", majorName: "가전", midCode: "437", midName: "빌트인 냉장고/LG 오브제 4도어(FIT&MAX)", code: "HA-437-01", name: "빌트인 냉장고/LG 오브제 4도어(FIT&MAX)", groupName: "빌트인 냉장고", maker: "LG", model: "M62BAAA332(G)", finish: "냉장고" },
  { no: 177, majorCode: "HA", majorName: "가전", midCode: "416", midName: "빌트인 냉장고/LG 오브제 4도어(FIT&MAX)+3도어 김치(FIT&MAX)(설치키트 포함)", code: "HA-416-01", name: "빌트인 냉장고/LG 오브제 4도어(FIT&MAX)+3도어 김치(FIT&MAX)(설치키트 포함)", groupName: "빌트인 냉장고", maker: "LG", model: "M62BAAA332(G)+Z334AAA151(G)+OC-KIT4(1set)", finish: "냉장고" },
  { no: 178, majorCode: "HA", majorName: "가전", midCode: "417", midName: "빌트인 냉장고/LG 오브제 4도어+김치(설치키트 포함)", code: "HA-417-01", name: "빌트인 냉장고/LG 오브제 4도어+김치(설치키트 포함)", groupName: "빌트인 냉장고", maker: "LG", model: "BC4S1AA1(G)+BC3K1AA1(G)+OC-KIT(1set)", finish: "냉장고" },
  { no: 179, majorCode: "HA", majorName: "가전", midCode: "434", midName: "빌트인 냉장고/삼성 비스포크 4도어 키친핏", code: "HA-434-01", name: "빌트인 냉장고/삼성 비스포크 4도어 키친핏", groupName: "빌트인 냉장고", maker: "삼성", model: "RM70F64Q1XJ(Satin)", finish: "냉장고" },
  { no: 180, majorCode: "HA", majorName: "가전", midCode: "438", midName: "빌트인 냉장고/삼성 비스포크 4도어 키친핏+삼성 비스포크 김치(설치키트 포함)", code: "HA-438-01", name: "빌트인 냉장고/삼성 비스포크 4도어 키친핏+삼성 비스포크 김치(설치키트 포함)", groupName: "빌트인 냉장고", maker: "삼성", model: "RM70F64Q1XJ(Satin)+RQ34C7(9/8)45AP(Satin)+RA-C00K1DAA(1set)", finish: "냉장고" },
  { no: 181, majorCode: "HA", majorName: "가전", midCode: "421", midName: "빌트인 냉장고/삼성 비스포크 냉장+냉동+김치(Cotta)(설치키트 포함)", code: "HA-421-01", name: "빌트인 냉장고/삼성 비스포크 냉장+냉동+김치(Cotta)(설치키트 포함)", groupName: "빌트인 냉장고", maker: "삼성", model: "RR39A7695AP(Cotta)+RZ32A7665AP(Cotta)+RQ32C7645AP(Cotta)+RA-C00K1DAA(2set)", finish: "냉장고" },
  { no: 182, majorCode: "HA", majorName: "가전", midCode: "420", midName: "빌트인 냉장고/삼성 비스포크 냉장+냉동+김치(설치키트 포함)", code: "HA-420-01", name: "빌트인 냉장고/삼성 비스포크 냉장+냉동+김치(설치키트 포함)", groupName: "빌트인 냉장고", maker: "삼성", model: "RR40C7(9/8)95AP(Satin)+RZ34C7(9/8)65AP(Satin)+RQ34C7(9/8)45AP(Satin)+RA-C00K1DAA(2set)", finish: "냉장고" },
  { no: 183, majorCode: "HA", majorName: "가전", midCode: "422", midName: "빌트인 냉장고/삼성 비스포크 냉장+변온+김치(설치키트 포함)", code: "HA-422-01", name: "빌트인 냉장고/삼성 비스포크 냉장+변온+김치(설치키트 포함)", groupName: "빌트인 냉장고", maker: "삼성", model: "RZ24C5(9/8)GOAP (Satin)+RR40C7(9/8)95AP(Satin)+RQ34C7(9/8)45AP(Satin)+RA-C00K1DAA(2set)", finish: "냉장고" },
  { no: 184, majorCode: "HA", majorName: "가전", midCode: "424", midName: "빌트인 냉장고/삼성 인피니트 냉장+냉동+김치(설치키트,정수필터 포함)", code: "HA-424-01", name: "빌트인 냉장고/삼성 인피니트 냉장+냉동+김치(설치키트,정수필터 포함)", groupName: "빌트인 냉장고", maker: "삼성", model: "RR40C9981APG(Timeless Metal)+RZ38C9891APG(Timeless Metal)+RQ38C9991APG(Timeless Metal)+RA-C00K1CAA(2set)+RWP70010TWW(1EA)", finish: "냉장고" },
  { no: 185, majorCode: "HA", majorName: "가전", midCode: "423", midName: "빌트인 냉장고/삼성 인피니트 냉장+냉동+와인(설치키트,정수필터 포함)", code: "HA-423-01", name: "빌트인 냉장고/삼성 인피니트 냉장+냉동+와인(설치키트,정수필터 포함)", groupName: "빌트인 냉장고", maker: "삼성", model: "RR40C9981APG(Timeless Metal)+RZ38C9891APG(Timeless Metal)+RW33C99B1TFG(Timeless Metal)+RA-C00K1CAA(2set)+RWP70010TWW(1EA)", finish: "냉장고" },
  { no: 186, majorCode: "HA", majorName: "가전", midCode: "407", midName: "빌트인 식기세척기/LG 디오스 14인용(DIE6PT)", code: "HA-407-01", name: "빌트인 식기세척기/LG 디오스 14인용(DIE6PT)", groupName: "빌트인 식기세척기", maker: "LG", model: "DIE6PT", finish: "식기세척기" },
  { no: 187, majorCode: "HA", majorName: "가전", midCode: "433", midName: "빌트인 식기세척기/LG 디오스 14인용(DUE5NSE)", code: "HA-433-01", name: "빌트인 식기세척기/LG 디오스 14인용(DUE5NSE)", groupName: "빌트인 식기세척기", maker: "LG", model: "DUE5NSE", finish: "식기세척기" },
  { no: 188, majorCode: "HA", majorName: "가전", midCode: "444", midName: "빌트인 식기세척기/LG 디오스 14인용(DIE5PT)", code: "HA-444-01", name: "빌트인 식기세척기/LG 디오스 14인용(DIE5PT)", groupName: "빌트인 식기세척기", maker: "LG", model: "DIE5PT", finish: "식기세척기" },
  { no: 189, majorCode: "HA", majorName: "가전", midCode: "436", midName: "빌트인 식기세척기/LG 시그니처 12인용(DBS12)-방배", code: "HA-436-01", name: "빌트인 식기세척기/LG 시그니처 12인용(DBS12)-방배", groupName: "빌트인 식기세척기", maker: "LG", model: "DBS12", finish: "식기세척기" },
  { no: 190, majorCode: "HA", majorName: "가전", midCode: "409", midName: "빌트인 식기세척기/LG 시그니처 14인용(DBS14)", code: "HA-409-01", name: "빌트인 식기세척기/LG 시그니처 14인용(DBS14)", groupName: "빌트인 식기세척기", maker: "LG", model: "DBS14", finish: "식기세척기" },
  { no: 191, majorCode: "HA", majorName: "가전", midCode: "408", midName: "빌트인 식기세척기/LG 오브제 14인용(DUE6BG)", code: "HA-408-01", name: "빌트인 식기세척기/LG 오브제 14인용(DUE6BG)", groupName: "빌트인 식기세척기", maker: "LG", model: "DUE6BG", finish: "식기세척기" },
  { no: 192, majorCode: "HA", majorName: "가전", midCode: "410", midName: "빌트인 식기세척기/삼성 12인용(DW60T7065SS)", code: "HA-410-01", name: "빌트인 식기세척기/삼성 12인용(DW60T7065SS)", groupName: "빌트인 식기세척기", maker: "삼성", model: "DW60T7065SS", finish: "식기세척기" },
  { no: 193, majorCode: "HA", majorName: "가전", midCode: "411", midName: "빌트인 식기세척기/삼성 12인용(DW80F71Y1SEW)", code: "HA-411-01", name: "빌트인 식기세척기/삼성 12인용(DW80F71Y1SEW)", groupName: "빌트인 식기세척기", maker: "삼성", model: "DW80F71Y1SEW", finish: "식기세척기" },
  { no: 194, majorCode: "HA", majorName: "가전", midCode: "447", midName: "빌트인 식기세척기/LG 디오스 12인용(DUB22SB2)", code: "HA-447-01", name: "빌트인 식기세척기/LG 디오스 12인용(DUB22SB2)", groupName: "빌트인 식기세척기", maker: "LG", model: "DUB22SB2", finish: "식기세척기" },
  { no: 195, majorCode: "HA", majorName: "가전", midCode: "405", midName: "빌트인 전기오븐/LG 광파오븐", code: "HA-405-01", name: "빌트인 전기오븐/LG 광파오븐", groupName: "빌트인 전기오븐", maker: "LG", model: "MZ385EBTA", finish: "전기오븐" },
  { no: 196, majorCode: "HA", majorName: "가전", midCode: "404", midName: "빌트인 전기오븐/나비엔 매직 컨벡션 스팀 오븐", code: "HA-404-01", name: "빌트인 전기오븐/나비엔 매직 컨벡션 스팀 오븐", groupName: "빌트인 전기오븐", maker: "나비엔 매직", model: "EOB-5004", finish: "전기오븐" },
  { no: 197, majorCode: "HA", majorName: "가전", midCode: "406", midName: "빌트인 전기오븐/삼성 전기오븐", code: "HA-406-01", name: "빌트인 전기오븐/삼성 전기오븐", groupName: "빌트인 전기오븐", maker: "삼성", model: "NQ50T8539BK", finish: "전기오븐" },
  { no: 198, majorCode: "HA", majorName: "가전", midCode: "430", midName: "하이브리드 쿡탑 인덕션/LG 인덕션 2구+하이라이트 1구", code: "HA-430-01", name: "하이브리드 쿡탑 인덕션/LG 인덕션 2구+하이라이트 1구", groupName: "하이브리드 쿡탑 인덕션", maker: "LG", model: "BEY3GSBI", finish: "쿡탑" },
  { no: 199, majorCode: "HA", majorName: "가전", midCode: "431", midName: "하이브리드 쿡탑 인덕션/LG 인덕션 3구", code: "HA-431-01", name: "하이브리드 쿡탑 인덕션/LG 인덕션 3구", groupName: "하이브리드 쿡탑 인덕션", maker: "LG", model: "BEI3GQBI", finish: "쿡탑" },
  { no: 200, majorCode: "HA", majorName: "가전", midCode: "431", midName: "하이브리드 쿡탑 인덕션/LG 인덕션 3구", code: "HA-431-02", name: "하이브리드 쿡탑 인덕션/LG 인덕션 3구 25년5월~26년4월", groupName: "하이브리드 쿡탑 인덕션", maker: "LG", model: "BEI3ASB4BI", finish: "쿡탑" },
  { no: 201, majorCode: "HA", majorName: "가전", midCode: "435", midName: "하이브리드 쿡탑 인덕션/나비엔 매직 가스 2구", code: "HA-435-01", name: "하이브리드 쿡탑 인덕션/나비엔 매직 가스 2구", groupName: "하이브리드 쿡탑 인덕션", maker: "나비엔 매직", model: "GRB-1002", finish: "쿡탑" },
  { no: 202, majorCode: "HA", majorName: "가전", midCode: "425", midName: "하이브리드 쿡탑 인덕션/나비엔 매직 가스 3구", code: "HA-425-01", name: "하이브리드 쿡탑 인덕션/나비엔 매직 가스 3구", groupName: "하이브리드 쿡탑 인덕션", maker: "나비엔 매직", model: "GRB-5103", finish: "쿡탑" },
  { no: 203, majorCode: "HA", majorName: "가전", midCode: "429", midName: "하이브리드 쿡탑 인덕션/나비엔 매직 보더리스 인덕션 4구", code: "HA-429-01", name: "하이브리드 쿡탑 인덕션/나비엔 매직 보더리스 인덕션 4구", groupName: "하이브리드 쿡탑 인덕션", maker: "나비엔 매직", model: "ERI-7704", finish: "쿡탑" },
  { no: 204, majorCode: "HA", majorName: "가전", midCode: "446", midName: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 3구", code: "HA-446-01", name: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 3구", groupName: "하이브리드 쿡탑 인덕션", maker: "나비엔 매직", model: "ERI-6023", finish: "쿡탑" },
  { no: 205, majorCode: "HA", majorName: "가전", midCode: "426", midName: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 2구+가스 1구", code: "HA-426-01", name: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 2구+가스 1구", groupName: "하이브리드 쿡탑 인덕션", maker: "나비엔 매직", model: "ERG-5103", finish: "쿡탑" },
  { no: 206, majorCode: "HA", majorName: "가전", midCode: "428", midName: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 2구+하이라이트 1구", code: "HA-428-01", name: "하이브리드 쿡탑 인덕션/나비엔 매직 인덕션 2구+하이라이트 1구", groupName: "하이브리드 쿡탑 인덕션", maker: "나비엔 매직", model: "ERH-3903", finish: "쿡탑" },
  { no: 207, majorCode: "HA", majorName: "가전", midCode: "439", midName: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 2구", code: "HA-439-01", name: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 2구", groupName: "하이브리드 쿡탑 인덕션", maker: "나비엔 매직", model: "ERH-1902", finish: "쿡탑" },
  { no: 208, majorCode: "HA", majorName: "가전", midCode: "427", midName: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 2구+가스 1구", code: "HA-427-01", name: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 2구+가스 1구", groupName: "하이브리드 쿡탑 인덕션", maker: "나비엔 매직", model: "ERG-2013", finish: "쿡탑" },
  { no: 209, majorCode: "HA", majorName: "가전", midCode: "440", midName: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 3구", code: "HA-440-01", name: "하이브리드 쿡탑 인덕션/나비엔 매직 하이라이트 3구", groupName: "하이브리드 쿡탑 인덕션", maker: "나비엔 매직", model: "ERH-2803", finish: "쿡탑" },
  { no: 210, majorCode: "HA", majorName: "가전", midCode: "432", midName: "하이브리드 쿡탑 인덕션/삼성 인덕션 3구", code: "HA-432-01", name: "하이브리드 쿡탑 인덕션/삼성 인덕션 3구", groupName: "하이브리드 쿡탑 인덕션", maker: "삼성", model: "NZ63B5056AK", finish: "쿡탑" },
  { no: 211, majorCode: "FN", majorName: "가구", midCode: "500", midName: "현관중문 스윙 도어", code: "FN-500-01", name: "현관중문 스윙 도어/LX하우시스 F.3180", groupName: "중문", maker: "LX하우시스", model: "프레임컬러 : F.3180 / 유리 : LX-SF-BC02 (좁은 스트라이프 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 212, majorCode: "FN", majorName: "가구", midCode: "500", midName: "현관중문 스윙 도어", code: "FN-500-02", name: "현관중문 스윙 도어/LX하우시스 F.3373", groupName: "중문", maker: "LX하우시스", model: "프레임컬러 : F.3373 / 유리 : LX-SF-BC02 (좁은 스트라이프 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 213, majorCode: "FN", majorName: "가구", midCode: "500", midName: "현관중문 스윙 도어", code: "FN-500-03", name: "현관중문 스윙 도어/KCC글라스 F.3373", groupName: "중문", maker: "KCC글라스", model: "프레임컬러 : F.3373 / 유리 : KCC글라스 B-02 (좁은 스트라이프 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 214, majorCode: "FN", majorName: "가구", midCode: "501", midName: "현관중문 슬라이딩 도어", code: "FN-501-01", name: "현관중문 슬라이딩 도어/LX하우시스 F.3180", groupName: "중문", maker: "LX하우시스", model: "프레임컬러 : F.3180 / 유리 : LX-SF-BC01 (중간 스트라이프 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 215, majorCode: "FN", majorName: "가구", midCode: "501", midName: "현관중문 슬라이딩 도어", code: "FN-501-02", name: "현관중문 슬라이딩 도어/LX하우시스 F.3373", groupName: "중문", maker: "LX하우시스", model: "프레임컬러 : F.3373 / 유리 : LX-SF-BC01 (중간 스트라이프 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 216, majorCode: "FN", majorName: "가구", midCode: "501", midName: "현관중문 슬라이딩 도어", code: "FN-501-03", name: "현관중문 슬라이딩 도어/KCC글라스 F.3373", groupName: "중문", maker: "KCC글라스", model: "프레임컬러 : F.3373 / 유리 : KCC글라스 B-03 (중간 스트라이프 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 217, majorCode: "FN", majorName: "가구", midCode: "502", midName: "현관중문 3연동 도어", code: "FN-502-01", name: "현관중문 3연동 도어/LX하우시스 F.3180", groupName: "중문", maker: "LX하우시스", model: "프레임컬러 : F.3180 / 유리 : LX-SF-BC03 (넓은 스트라이프 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 218, majorCode: "FN", majorName: "가구", midCode: "502", midName: "현관중문 3연동 도어", code: "FN-502-02", name: "현관중문 3연동 도어/LX하우시스 F.3373", groupName: "중문", maker: "LX하우시스", model: "프레임컬러 : F.3373 / 유리 : LX-SF-BC03 (넓은 스트라이프 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 219, majorCode: "FN", majorName: "가구", midCode: "502", midName: "현관중문 3연동 도어", code: "FN-502-03", name: "현관중문 3연동 도어/KCC글라스 F.3373", groupName: "중문", maker: "KCC글라스", model: "프레임컬러 : F.3373 / 유리 : KCC글라스 B-13 (넓은 스트라이프 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 220, majorCode: "FN", majorName: "가구", midCode: "503", midName: "4도어 슬라이딩", code: "FN-503-01", name: "4도어 슬라이딩", groupName: "중문", maker: "중산", model: "프레임컬러 : F.3180 / 유리 : MDG-CNC#MF2 (메탈패턴 브론즈 클리어)", finish: "AL 프레임 / 패턴유리", size: "유리 : 5.76T" },
  { no: 221, majorCode: "FN", majorName: "가구", midCode: "504", midName: "신발장(pp)", code: "FN-504-01", name: "신발장(pp)/e편한세상", groupName: "신발장", maker: "리바트", model: "LTDRP481X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 222, majorCode: "FN", majorName: "가구", midCode: "504", midName: "신발장(pp)", code: "FN-504-02", name: "신발장(pp)/아크로", groupName: "신발장", maker: "리바트", model: "LTDRP077X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 223, majorCode: "FN", majorName: "가구", midCode: "504", midName: "신발장(pp)", code: "FN-504-03", name: "신발장(pp)/e편한세상(추가)", groupName: "신발장", maker: "리바트", model: "LTDRP077X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 224, majorCode: "FN", majorName: "가구", midCode: "504", midName: "신발장(pp)", code: "FN-504-04", name: "신발장(pp)/아크로(추가)", groupName: "신발장", maker: "리바트", model: "LTDRP077X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 225, majorCode: "FN", majorName: "가구", midCode: "505", midName: "신발장(PET)", code: "FN-505-01", name: "신발장(PET)/미니멀", groupName: "신발장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 226, majorCode: "FN", majorName: "가구", midCode: "505", midName: "신발장(PET)", code: "FN-505-02", name: "신발장(PET)/미니멀(추가)", groupName: "신발장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 227, majorCode: "FN", majorName: "가구", midCode: "506", midName: "신발장(FUTURA)", code: "FN-506-01", name: "신발장(FUTURA)/내추럴 모던", groupName: "신발장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 228, majorCode: "FN", majorName: "가구", midCode: "506", midName: "신발장(FUTURA)", code: "FN-506-02", name: "신발장(FUTURA)/소프트 클래식", groupName: "신발장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 229, majorCode: "FN", majorName: "가구", midCode: "506", midName: "신발장(FUTURA)", code: "FN-506-03", name: "신발장(FUTURA)/내추럴 클래식", groupName: "신발장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 손잡이 : 내추럴 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 230, majorCode: "FN", majorName: "가구", midCode: "506", midName: "신발장(FUTURA)", code: "FN-506-04", name: "신발장(FUTURA)/블랑 클래식", groupName: "신발장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 블랑 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 231, majorCode: "FN", majorName: "가구", midCode: "506", midName: "신발장(FUTURA)", code: "FN-506-05", name: "신발장(FUTURA)/모던 내추럴", groupName: "신발장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 232, majorCode: "FN", majorName: "가구", midCode: "506", midName: "신발장(FUTURA)", code: "FN-506-06", name: "신발장(FUTURA)/내추럴 모던(추가)", groupName: "신발장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 233, majorCode: "FN", majorName: "가구", midCode: "506", midName: "신발장(FUTURA)", code: "FN-506-07", name: "신발장(FUTURA)/소프트 클래식(추가)", groupName: "신발장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 234, majorCode: "FN", majorName: "가구", midCode: "506", midName: "신발장(FUTURA)", code: "FN-506-08", name: "신발장(FUTURA)/내추럴 클래식(추가)", groupName: "신발장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 손잡이 : 내추럴 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 235, majorCode: "FN", majorName: "가구", midCode: "506", midName: "신발장(FUTURA)", code: "FN-506-09", name: "신발장(FUTURA)/블랑 클래식(추가)", groupName: "신발장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 블랑 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 236, majorCode: "FN", majorName: "가구", midCode: "507", midName: "오픈형 신발장(PET)", code: "FN-507-01", name: "오픈형 신발장(PET)/미니멀", groupName: "신발장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 237, majorCode: "FN", majorName: "가구", midCode: "508", midName: "오픈형 신발장(FUTURA)", code: "FN-508-01", name: "오픈형 신발장(FUTURA)/내추럴 모던", groupName: "신발장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 238, majorCode: "FN", majorName: "가구", midCode: "508", midName: "오픈형 신발장(FUTURA)", code: "FN-508-02", name: "오픈형 신발장(FUTURA)/소프트 클래식", groupName: "신발장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 239, majorCode: "FN", majorName: "가구", midCode: "508", midName: "오픈형 신발장(FUTURA)", code: "FN-508-03", name: "오픈형 신발장(FUTURA)/내추럴 클래식", groupName: "신발장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 240, majorCode: "FN", majorName: "가구", midCode: "508", midName: "오픈형 신발장(FUTURA)", code: "FN-508-04", name: "오픈형 신발장(FUTURA)/블랑 클래식", groupName: "신발장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 241, majorCode: "FN", majorName: "가구", midCode: "508", midName: "오픈형 신발장(FUTURA)", code: "FN-508-05", name: "오픈형 신발장(FUTURA)/모던 내추럴", groupName: "신발장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 242, majorCode: "FN", majorName: "가구", midCode: "509", midName: "에어브러시", code: "FN-509-01", name: "에어브러시", groupName: "신발장", maker: "리바트" },
  { no: 243, majorCode: "FN", majorName: "가구", midCode: "510", midName: "신발살균기", code: "FN-510-01", name: "신발살균기", groupName: "신발장", maker: "리바트" },
  { no: 244, majorCode: "FN", majorName: "가구", midCode: "511", midName: "가구 도어(PP)", code: "FN-511-01", name: "가구 도어(PP)/e편한세상 목창호 패턴", groupName: "가구성 도어", maker: "리바트", model: "LTDRP481X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 245, majorCode: "FN", majorName: "가구", midCode: "511", midName: "가구 도어(PP)", code: "FN-511-02", name: "가구 도어(PP)/아크로 목창호 패턴", groupName: "가구성 도어", maker: "리바트", model: "LTDRP077X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 246, majorCode: "FN", majorName: "가구", midCode: "511", midName: "가구 도어(PP)", code: "FN-511-03", name: "가구 도어(PP)/e편한세상 디자인월 패턴", groupName: "가구성 도어", maker: "리바트", model: "LTDRP090X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 247, majorCode: "FN", majorName: "가구", midCode: "511", midName: "가구 도어(PP)", code: "FN-511-04", name: "가구 도어(PP)/아크로 디자인월 패턴", groupName: "가구성 도어", maker: "리바트", model: "LTDRP091X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 248, majorCode: "FN", majorName: "가구", midCode: "512", midName: "가구 도어(PET)", code: "FN-512-01", name: "가구 도어(PET)/미니멀", groupName: "가구성 도어", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 249, majorCode: "FN", majorName: "가구", midCode: "513", midName: "가구 도어(FUTURA)", code: "FN-513-01", name: "가구 도어(FUTURA)/내추럴 모던", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 250, majorCode: "FN", majorName: "가구", midCode: "513", midName: "가구 도어(FUTURA)", code: "FN-513-02", name: "가구 도어(FUTURA)/소프트 클래식", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 251, majorCode: "FN", majorName: "가구", midCode: "513", midName: "가구 도어(FUTURA)", code: "FN-513-03", name: "가구 도어(FUTURA)/내추럴 클래식", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 손잡이 : 내추럴 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 252, majorCode: "FN", majorName: "가구", midCode: "513", midName: "가구 도어(FUTURA)", code: "FN-513-04", name: "가구 도어(FUTURA)/블랑 클래식", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 블랑 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 253, majorCode: "FN", majorName: "가구", midCode: "513", midName: "가구 도어(FUTURA)", code: "FN-513-05", name: "가구 도어(FUTURA)/모던 내추럴", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 254, majorCode: "FN", majorName: "가구", midCode: "514", midName: "포스트형 시스템 선반", code: "FN-514-01", name: "포스트형 시스템 선반/070", groupName: "시스템 선반", maker: "통합 입찰", model: "데코밸리 DKG070", finish: "PP" },
  { no: 255, majorCode: "FN", majorName: "가구", midCode: "514", midName: "포스트형 시스템 선반", code: "FN-514-02", name: "포스트형 시스템 선반/048", groupName: "시스템 선반", maker: "통합 입찰", model: "데코밸리 DKG048", finish: "PP" },
  { no: 256, majorCode: "FN", majorName: "가구", midCode: "514", midName: "포스트형 시스템 선반", code: "FN-514-03", name: "포스트형 시스템 선반/샤트데코", groupName: "시스템 선반", maker: "통합 입찰", model: "샤트데코 GREY 16-246060", finish: "PP" },
  { no: 257, majorCode: "FN", majorName: "가구", midCode: "514", midName: "포스트형 시스템 선반", code: "FN-514-04", name: "후면 포스트형 시스템 선반", groupName: "시스템 선반", maker: "통합 입찰", model: "데코밸리 R003201-V2 / UNIFUR SC-1575(M/MEDIUM BRONZE)", finish: "PP / AL포스트" },
  { no: 258, majorCode: "FN", majorName: "가구", midCode: "515", midName: "벽 찬넬형 시스템 선반", code: "FN-515-01", name: "벽 찬넬형 시스템 선반", groupName: "시스템 선반", maker: "통합 입찰", model: "데코밸리 DKG070", finish: "PP" },
  { no: 259, majorCode: "FN", majorName: "가구", midCode: "516", midName: "벽 패널형 시스템 선반", code: "FN-516-01", name: "벽 패널형 시스템 선반", groupName: "시스템 선반", maker: "통합 입찰", model: "효산 HS0927DL(UK)", finish: "상판 : LPM" },
  { no: 260, majorCode: "FN", majorName: "가구", midCode: "517", midName: "다용도실 수납장(PET)", code: "FN-517-01", name: "다용도실 수납장(PET)", groupName: "다용도실 수납가구", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 261, majorCode: "FN", majorName: "가구", midCode: "518", midName: "상,하부장(PET)", code: "FN-518-01", name: "상,하부장(PET)/미니멀", groupName: "주방 상부장/하부장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 262, majorCode: "FN", majorName: "가구", midCode: "519", midName: "상,하부장(FUTURA)", code: "FN-519-01", name: "상,하부장(FUTURA)/내추럴 모던", groupName: "주방 상부장/하부장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 263, majorCode: "FN", majorName: "가구", midCode: "519", midName: "상,하부장(FUTURA)", code: "FN-519-02", name: "상,하부장(FUTURA)/소프트 클래식", groupName: "주방 상부장/하부장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 264, majorCode: "FN", majorName: "가구", midCode: "519", midName: "상,하부장(FUTURA)", code: "FN-519-03", name: "상,하부장(FUTURA)/내추럴 클래식", groupName: "주방 상부장/하부장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 265, majorCode: "FN", majorName: "가구", midCode: "519", midName: "상,하부장(FUTURA)", code: "FN-519-04", name: "상,하부장(FUTURA)/블랑 클래식", groupName: "주방 상부장/하부장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 266, majorCode: "FN", majorName: "가구", midCode: "519", midName: "상,하부장(FUTURA)", code: "FN-519-05", name: "상,하부장(FUTURA)/모던 내추럴", groupName: "주방 상부장/하부장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 267, majorCode: "FN", majorName: "가구", midCode: "520", midName: "아일랜드장 기본형(PET)", code: "FN-520-01", name: "아일랜드장 기본형(PET)/미니멀", groupName: "주방 아일랜드장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 268, majorCode: "FN", majorName: "가구", midCode: "521", midName: "아일랜드장 기본형(FUTURA)", code: "FN-521-01", name: "아일랜드장 기본형(FUTURA)/내추럴 모던", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 269, majorCode: "FN", majorName: "가구", midCode: "521", midName: "아일랜드장 기본형(FUTURA)", code: "FN-521-02", name: "아일랜드장 기본형(FUTURA)/소프트 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 270, majorCode: "FN", majorName: "가구", midCode: "521", midName: "아일랜드장 기본형(FUTURA)", code: "FN-521-03", name: "아일랜드장 기본형(FUTURA)/내추럴 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 271, majorCode: "FN", majorName: "가구", midCode: "521", midName: "아일랜드장 기본형(FUTURA)", code: "FN-521-04", name: "아일랜드장 기본형(FUTURA)/블랑 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 272, majorCode: "FN", majorName: "가구", midCode: "521", midName: "아일랜드장 기본형(FUTURA)", code: "FN-521-05", name: "아일랜드장 기본형(FUTURA)/모던 내추럴", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 273, majorCode: "FN", majorName: "가구", midCode: "522", midName: "아일랜드장 바 타입형(PET)", code: "FN-522-01", name: "아일랜드장 바 타입형(PET)/미니멀", groupName: "주방 아일랜드장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 274, majorCode: "FN", majorName: "가구", midCode: "523", midName: "아일랜드장 바 타입형(FUTURA)", code: "FN-523-01", name: "아일랜드장 바 타입형(FUTURA)/내추럴 모던", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 275, majorCode: "FN", majorName: "가구", midCode: "523", midName: "아일랜드장 바 타입형(FUTURA)", code: "FN-523-02", name: "아일랜드장 바 타입형(FUTURA)/소프트 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 276, majorCode: "FN", majorName: "가구", midCode: "523", midName: "아일랜드장 바 타입형(FUTURA)", code: "FN-523-03", name: "아일랜드장 바 타입형(FUTURA)/내추럴 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 277, majorCode: "FN", majorName: "가구", midCode: "523", midName: "아일랜드장 바 타입형(FUTURA)", code: "FN-523-04", name: "아일랜드장 바 타입형(FUTURA)/블랑 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 278, majorCode: "FN", majorName: "가구", midCode: "523", midName: "아일랜드장 바 타입형(FUTURA)", code: "FN-523-05", name: "아일랜드장 바 타입형(FUTURA)/모던 내추럴", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 279, majorCode: "FN", majorName: "가구", midCode: "524", midName: "아일랜드장 식탁결합형(PET)", code: "FN-524-01", name: "아일랜드장 식탁결합형(PET)/미니멀", groupName: "주방 아일랜드장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 280, majorCode: "FN", majorName: "가구", midCode: "525", midName: "아일랜드장 식탁결합형(FUTURA)", code: "FN-525-01", name: "아일랜드장 식탁결합형(FUTURA)/내추럴 모던", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 281, majorCode: "FN", majorName: "가구", midCode: "525", midName: "아일랜드장 식탁결합형(FUTURA)", code: "FN-525-02", name: "아일랜드장 식탁결합형(FUTURA)/소프트 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 282, majorCode: "FN", majorName: "가구", midCode: "525", midName: "아일랜드장 식탁결합형(FUTURA)", code: "FN-525-03", name: "아일랜드장 식탁결합형(FUTURA)/내추럴 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 283, majorCode: "FN", majorName: "가구", midCode: "525", midName: "아일랜드장 식탁결합형(FUTURA)", code: "FN-525-04", name: "아일랜드장 식탁결합형(FUTURA)/블랑 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 284, majorCode: "FN", majorName: "가구", midCode: "525", midName: "아일랜드장 식탁결합형(FUTURA)", code: "FN-525-05", name: "아일랜드장 식탁결합형(FUTURA)/모던 내추럴", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 285, majorCode: "FN", majorName: "가구", midCode: "526", midName: "아일랜드장 양면수납형(PET)", code: "FN-526-01", name: "아일랜드장 양면수납형(PET)/미니멀", groupName: "주방 아일랜드장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 286, majorCode: "FN", majorName: "가구", midCode: "527", midName: "아일랜드장 양면수납형(FUTURA)", code: "FN-527-01", name: "아일랜드장 양면수납형(FUTURA)/내추럴 모던", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 287, majorCode: "FN", majorName: "가구", midCode: "527", midName: "아일랜드장 양면수납형(FUTURA)", code: "FN-527-02", name: "아일랜드장 양면수납형(FUTURA)/소프트 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 288, majorCode: "FN", majorName: "가구", midCode: "527", midName: "아일랜드장 양면수납형(FUTURA)", code: "FN-527-03", name: "아일랜드장 양면수납형(FUTURA)/내추럴 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 289, majorCode: "FN", majorName: "가구", midCode: "527", midName: "아일랜드장 양면수납형(FUTURA)", code: "FN-527-04", name: "아일랜드장 양면수납형(FUTURA)/블랑 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 290, majorCode: "FN", majorName: "가구", midCode: "527", midName: "아일랜드장 양면수납형(FUTURA)", code: "FN-527-05", name: "아일랜드장 양면수납형(FUTURA)/모던 내추럴", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 291, majorCode: "FN", majorName: "가구", midCode: "528", midName: "아일랜드장 양면수납 식탁결합형(PET)", code: "FN-528-01", name: "아일랜드장 양면수납 식탁결합형(PET)/미니멀", groupName: "주방 아일랜드장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 292, majorCode: "FN", majorName: "가구", midCode: "529", midName: "아일랜드장 양면수납 식탁결합형(FUTURA)", code: "FN-529-01", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/내추럴 모던", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 293, majorCode: "FN", majorName: "가구", midCode: "529", midName: "아일랜드장 양면수납 식탁결합형(FUTURA)", code: "FN-529-02", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/소프트 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 294, majorCode: "FN", majorName: "가구", midCode: "529", midName: "아일랜드장 양면수납 식탁결합형(FUTURA)", code: "FN-529-03", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/내추럴 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 295, majorCode: "FN", majorName: "가구", midCode: "529", midName: "아일랜드장 양면수납 식탁결합형(FUTURA)", code: "FN-529-04", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/블랑 클래식", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 296, majorCode: "FN", majorName: "가구", midCode: "529", midName: "아일랜드장 양면수납 식탁결합형(FUTURA)", code: "FN-529-05", name: "아일랜드장 양면수납 식탁결합형(FUTURA)/모던 내추럴", groupName: "주방 아일랜드장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 297, majorCode: "FN", majorName: "가구", midCode: "530", midName: "냉장고장 기본형(PET)", code: "FN-530-01", name: "냉장고장 기본형(PET)/미니멀", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 298, majorCode: "FN", majorName: "가구", midCode: "531", midName: "냉장고장 기본형(FUTURA)", code: "FN-531-01", name: "냉장고장 기본형(FUTURA)/내추럴 모던", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 299, majorCode: "FN", majorName: "가구", midCode: "531", midName: "냉장고장 기본형(FUTURA)", code: "FN-531-02", name: "냉장고장 기본형(FUTURA)/소프트 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 300, majorCode: "FN", majorName: "가구", midCode: "531", midName: "냉장고장 기본형(FUTURA)", code: "FN-531-03", name: "냉장고장 기본형(FUTURA)/내추럴 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 301, majorCode: "FN", majorName: "가구", midCode: "531", midName: "냉장고장 기본형(FUTURA)", code: "FN-531-04", name: "냉장고장 기본형(FUTURA)/블랑 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 302, majorCode: "FN", majorName: "가구", midCode: "531", midName: "냉장고장 기본형(FUTURA)", code: "FN-531-05", name: "냉장고장 기본형(FUTURA)/모던 내추럴", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 303, majorCode: "FN", majorName: "가구", midCode: "532", midName: "선반 수납형 키큰장(PET)", code: "FN-532-01", name: "선반 수납형 키큰장(PET)/미니멀", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 304, majorCode: "FN", majorName: "가구", midCode: "533", midName: "선반 수납형 키큰장(FUTURA)", code: "FN-533-01", name: "선반 수납형 키큰장(FUTURA)/내추럴 모던", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 305, majorCode: "FN", majorName: "가구", midCode: "533", midName: "선반 수납형 키큰장(FUTURA)", code: "FN-533-02", name: "선반 수납형 키큰장(FUTURA)/소프트 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 306, majorCode: "FN", majorName: "가구", midCode: "533", midName: "선반 수납형 키큰장(FUTURA)", code: "FN-533-03", name: "선반 수납형 키큰장(FUTURA)/내추럴 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 307, majorCode: "FN", majorName: "가구", midCode: "533", midName: "선반 수납형 키큰장(FUTURA)", code: "FN-533-04", name: "선반 수납형 키큰장(FUTURA)/블랑 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 308, majorCode: "FN", majorName: "가구", midCode: "533", midName: "선반 수납형 키큰장(FUTURA)", code: "FN-533-05", name: "선반 수납형 키큰장(FUTURA)/모던 내추럴", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 309, majorCode: "FN", majorName: "가구", midCode: "534", midName: "인출식 수납형 키큰장(PET)", code: "FN-534-01", name: "인출식 수납형 키큰장(PET)/미니멀", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 310, majorCode: "FN", majorName: "가구", midCode: "535", midName: "인출식 수납형 키큰장(FUTURA)", code: "FN-535-01", name: "인출식 수납형 키큰장(FUTURA)/내추럴 모던", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 311, majorCode: "FN", majorName: "가구", midCode: "535", midName: "인출식 수납형 키큰장(FUTURA)", code: "FN-535-02", name: "인출식 수납형 키큰장(FUTURA)/소프트 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 312, majorCode: "FN", majorName: "가구", midCode: "535", midName: "인출식 수납형 키큰장(FUTURA)", code: "FN-535-03", name: "인출식 수납형 키큰장(FUTURA)/내추럴 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 313, majorCode: "FN", majorName: "가구", midCode: "535", midName: "인출식 수납형 키큰장(FUTURA)", code: "FN-535-04", name: "인출식 수납형 키큰장(FUTURA)/블랑 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 314, majorCode: "FN", majorName: "가구", midCode: "535", midName: "인출식 수납형 키큰장(FUTURA)", code: "FN-535-05", name: "인출식 수납형 키큰장(FUTURA)/모던 내추럴", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 315, majorCode: "FN", majorName: "가구", midCode: "536", midName: "대형 선반 수납형 키큰장(PET)", code: "FN-536-01", name: "대형 선반 수납형 키큰장(PET)/미니멀", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 316, majorCode: "FN", majorName: "가구", midCode: "537", midName: "대형 선반 수납형 키큰장(FUTURA)", code: "FN-537-01", name: "대형 선반 수납형 키큰장(FUTURA)/내추럴 모던", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 317, majorCode: "FN", majorName: "가구", midCode: "537", midName: "대형 선반 수납형 키큰장(FUTURA)", code: "FN-537-02", name: "대형 선반 수납형 키큰장(FUTURA)/소프트 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 318, majorCode: "FN", majorName: "가구", midCode: "537", midName: "대형 선반 수납형 키큰장(FUTURA)", code: "FN-537-03", name: "대형 선반 수납형 키큰장(FUTURA)/내추럴 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 손잡이 : 내추럴 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 319, majorCode: "FN", majorName: "가구", midCode: "537", midName: "대형 선반 수납형 키큰장(FUTURA)", code: "FN-537-04", name: "대형 선반 수납형 키큰장(FUTURA)/블랑 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 블랑 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 320, majorCode: "FN", majorName: "가구", midCode: "537", midName: "대형 선반 수납형 키큰장(FUTURA)", code: "FN-537-05", name: "대형 선반 수납형 키큰장(FUTURA)/모던 내추럴", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 321, majorCode: "FN", majorName: "가구", midCode: "538", midName: "대형 인출식 수납형 키큰장(PET)", code: "FN-538-01", name: "대형 인출식 수납형 키큰장(PET)/미니멀", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 322, majorCode: "FN", majorName: "가구", midCode: "539", midName: "대형 인출식 수납형 키큰장(FUTURA)", code: "FN-539-01", name: "대형 인출식 수납형 키큰장(FUTURA)/내추럴 모던", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 323, majorCode: "FN", majorName: "가구", midCode: "539", midName: "대형 인출식 수납형 키큰장(FUTURA)", code: "FN-539-02", name: "대형 인출식 수납형 키큰장(FUTURA)/소프트 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 324, majorCode: "FN", majorName: "가구", midCode: "539", midName: "대형 인출식 수납형 키큰장(FUTURA)", code: "FN-539-03", name: "대형 인출식 수납형 키큰장(FUTURA)/내추럴 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 손잡이 : 내추럴 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 325, majorCode: "FN", majorName: "가구", midCode: "539", midName: "대형 인출식 수납형 키큰장(FUTURA)", code: "FN-539-04", name: "대형 인출식 수납형 키큰장(FUTURA)/블랑 클래식", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 블랑 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 326, majorCode: "FN", majorName: "가구", midCode: "539", midName: "대형 인출식 수납형 키큰장(FUTURA)", code: "FN-539-05", name: "대형 인출식 수납형 키큰장(FUTURA)/모던 내추럴", groupName: "주방 냉장고장/키큰장", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 327, majorCode: "FN", majorName: "가구", midCode: "540", midName: "홈바 수납형(PET)", code: "FN-540-01", name: "홈바 수납형(PET)/미니멀", groupName: "주방 홈바", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "PET" },
  { no: 328, majorCode: "FN", majorName: "가구", midCode: "541", midName: "홈바 수납형(FUTURA)", code: "FN-541-01", name: "홈바 수납형(FUTURA)/내추럴 모던", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "외산 푸트라 PET" },
  { no: 329, majorCode: "FN", majorName: "가구", midCode: "541", midName: "홈바 수납형(FUTURA)", code: "FN-541-02", name: "홈바 수납형(FUTURA)/소프트 클래식", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "외산 푸트라 PET" },
  { no: 330, majorCode: "FN", majorName: "가구", midCode: "541", midName: "홈바 수납형(FUTURA)", code: "FN-541-03", name: "홈바 수납형(FUTURA)/내추럴 클래식", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "외산 푸트라 PET" },
  { no: 331, majorCode: "FN", majorName: "가구", midCode: "541", midName: "홈바 수납형(FUTURA)", code: "FN-541-04", name: "홈바 수납형(FUTURA)/블랑 클래식", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "외산 푸트라 PET" },
  { no: 332, majorCode: "FN", majorName: "가구", midCode: "541", midName: "홈바 수납형(FUTURA)", code: "FN-541-05", name: "홈바 수납형(FUTURA)/모던 내추럴", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "외산 푸트라 PET" },
  { no: 333, majorCode: "FN", majorName: "가구", midCode: "542", midName: "홈바 윈도우형(PET)", code: "FN-542-01", name: "홈바 윈도우형(PET)/미니멀", groupName: "주방 홈바", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 334, majorCode: "FN", majorName: "가구", midCode: "543", midName: "홈바 윈도우형(FUTURA)", code: "FN-543-01", name: "홈바 윈도우형(FUTURA)/내추럴 모던", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 335, majorCode: "FN", majorName: "가구", midCode: "543", midName: "홈바 윈도우형(FUTURA)", code: "FN-543-02", name: "홈바 윈도우형(FUTURA)/소프트 클래식", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 336, majorCode: "FN", majorName: "가구", midCode: "543", midName: "홈바 윈도우형(FUTURA)", code: "FN-543-03", name: "홈바 윈도우형(FUTURA)/내추럴 클래식", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 337, majorCode: "FN", majorName: "가구", midCode: "543", midName: "홈바 윈도우형(FUTURA)", code: "FN-543-04", name: "홈바 윈도우형(FUTURA)/블랑 클래식", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 338, majorCode: "FN", majorName: "가구", midCode: "543", midName: "홈바 윈도우형(FUTURA)", code: "FN-543-05", name: "홈바 윈도우형(FUTURA)/모던 내추럴", groupName: "주방 홈바", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 339, majorCode: "FN", majorName: "가구", midCode: "544", midName: "상부장", code: "FN-544-01", name: "상부장", groupName: "주방 상부장/하부장" },
  { no: 340, majorCode: "FN", majorName: "가구", midCode: "545", midName: "하부장", code: "FN-545-01", name: "하부장", groupName: "주방 상부장/하부장" },
  { no: 341, majorCode: "FN", majorName: "가구", midCode: "546", midName: "손빨래 하부장", code: "FN-546-01", name: "손빨래 하부장", groupName: "다용도실 수납가구", maker: "리바트", model: "LTDRT027 유사 컬러", finish: "PS" },
  { no: 342, majorCode: "FN", majorName: "가구", midCode: "547", midName: "세탁기장(수직형)", code: "FN-547-01", name: "세탁기장(수직형)", groupName: "다용도실 수납가구", maker: "리바트", model: "LTDRT027 유사 컬러", finish: "PS" },
  { no: 343, majorCode: "FN", majorName: "가구", midCode: "548", midName: "세탁기장(수직형+키큰장 결합형)", code: "FN-548-01", name: "세탁기장(수직형+키큰장 결합형)", groupName: "다용도실 수납가구", maker: "리바트", model: "LTDRT027 유사 컬러", finish: "PS" },
  { no: 344, majorCode: "FN", majorName: "가구", midCode: "549", midName: "세탁기장(병렬형)", code: "FN-549-01", name: "세탁기장(병렬형)", groupName: "다용도실 수납가구", maker: "리바트", model: "LTDRT027 유사 컬러", finish: "PS" },
  { no: 345, majorCode: "FN", majorName: "가구", midCode: "550", midName: "도어형 붙박이장(PP)", code: "FN-550-01", name: "도어형 붙박이장(PP)/e편한세상 목창호 패턴", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRP481X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 346, majorCode: "FN", majorName: "가구", midCode: "550", midName: "도어형 붙박이장(PP)", code: "FN-550-02", name: "도어형 붙박이장(PP)/아크로 목창호 패턴", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRP077X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 347, majorCode: "FN", majorName: "가구", midCode: "551", midName: "도어형 붙박이장(PET)", code: "FN-551-01", name: "도어형 붙박이장(PET)/미니멀", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 348, majorCode: "FN", majorName: "가구", midCode: "551", midName: "도어형 붙박이장(PET)", code: "FN-551-02", name: "도어형 붙박이장(PET)/미니멀(추가)", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 349, majorCode: "FN", majorName: "가구", midCode: "552", midName: "도어형 붙박이장(FUTURA)", code: "FN-552-01", name: "도어형 붙박이장(FUTURA)/내추럴 모던", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 350, majorCode: "FN", majorName: "가구", midCode: "552", midName: "도어형 붙박이장(FUTURA)", code: "FN-552-02", name: "도어형 붙박이장(FUTURA)/소프트 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 351, majorCode: "FN", majorName: "가구", midCode: "552", midName: "도어형 붙박이장(FUTURA)", code: "FN-552-03", name: "도어형 붙박이장(FUTURA)/내추럴 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 손잡이 : 내추럴 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 352, majorCode: "FN", majorName: "가구", midCode: "552", midName: "도어형 붙박이장(FUTURA)", code: "FN-552-04", name: "도어형 붙박이장(FUTURA)/블랑 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 블랑 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 353, majorCode: "FN", majorName: "가구", midCode: "552", midName: "도어형 붙박이장(FUTURA)", code: "FN-552-05", name: "도어형 붙박이장(FUTURA)/모던 내추럴", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 354, majorCode: "FN", majorName: "가구", midCode: "553", midName: "침대", code: "FN-553-01", name: "침대(내추럴 헤드보드+사이드테이블*1)", groupName: "침대/매트리스", maker: "리바트", model: "가구 : 1015-007 / 페브릭 : IDT-PEARL", finish: "LPM / 페브릭" },
  { no: 355, majorCode: "FN", majorName: "가구", midCode: "553", midName: "침대", code: "FN-553-02", name: "침대(내추럴 헤드보드+사이드테이블*2)", groupName: "침대/매트리스", maker: "리바트", model: "가구 : 1015-007 / 페브릭 : IDT-PEARL", finish: "LPM / 페브릭" },
  { no: 356, majorCode: "FN", majorName: "가구", midCode: "553", midName: "침대", code: "FN-553-03", name: "침대(브라운 헤드보드+사이드테이블*1)", groupName: "침대/매트리스", maker: "리바트", model: "가구 : 9039-009 / 페브릭 : IDT-HABANA", finish: "LPM / 페브릭" },
  { no: 357, majorCode: "FN", majorName: "가구", midCode: "553", midName: "침대", code: "FN-553-04", name: "침대(브라운 헤드보드+사이드테이블*2)", groupName: "침대/매트리스", maker: "리바트", model: "가구 : 9039-009 / 페브릭 : IDT-HABANA", finish: "LPM / 페브릭" },
  { no: 358, majorCode: "FN", majorName: "가구", midCode: "554", midName: "매트리스/ACE SUITE GRAND(킹사이즈, 가로1600, 세로2000, 높이320)", code: "FN-554-01", name: "매트리스/ACE SUITE GRAND(킹사이즈, 가로1600, 세로2000, 높이320)", groupName: "침대/매트리스", maker: "에이스", model: "ACE SUITE GRAND", finish: "매트리스", size: "1600*2000*320" },
  { no: 359, majorCode: "FN", majorName: "가구", midCode: "555", midName: "매트리스/ACE SUITE ROYAL-PLUS(킹사이즈, 가로1600, 세로2000, 높이350)", code: "FN-555-01", name: "매트리스/ACE SUITE ROYAL-PLUS(킹사이즈, 가로1600, 세로2000, 높이350)", groupName: "침대/매트리스", maker: "에이스", model: "ACE SUITE ROYAL-PLUS", finish: "매트리스", size: "1600*2000*350" },
  { no: 360, majorCode: "FN", majorName: "가구", midCode: "556", midName: "매트리스/ACE SUITE COZY(슈퍼싱글사이즈, 가로1100, 세로2000, 높이270)", code: "FN-556-01", name: "매트리스/ACE SUITE COZY(슈퍼싱글사이즈, 가로1100, 세로2000, 높이270)", groupName: "침대/매트리스", maker: "에이스", model: "ACE SUITE COZY", finish: "매트리스", size: "1100*2000*270" },
  { no: 361, majorCode: "FN", majorName: "가구", midCode: "557", midName: "데스크(PET)", code: "FN-557-01", name: "데스크(PET)", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027", finish: "PET" },
  { no: 362, majorCode: "FN", majorName: "가구", midCode: "578", midName: "데스크(FUTURA)", code: "FN-578-01", name: "데스크(FUTURA)/내추럴 모던", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "외산 푸트라 PET" },
  { no: 363, majorCode: "FN", majorName: "가구", midCode: "578", midName: "데스크(FUTURA)", code: "FN-578-02", name: "데스크(FUTURA)/소프트 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "외산 푸트라 PET" },
  { no: 364, majorCode: "FN", majorName: "가구", midCode: "578", midName: "데스크(FUTURA)", code: "FN-578-03", name: "데스크(FUTURA)/내추럴 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "외산 푸트라 PET" },
  { no: 365, majorCode: "FN", majorName: "가구", midCode: "578", midName: "데스크(FUTURA)", code: "FN-578-04", name: "데스크(FUTURA)/블랑 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "외산 푸트라 PET" },
  { no: 366, majorCode: "FN", majorName: "가구", midCode: "558", midName: "데스크+침대프레임(PET)", code: "FN-558-01", name: "데스크+침대프레임(PET)", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027", finish: "PET" },
  { no: 367, majorCode: "FN", majorName: "가구", midCode: "559", midName: "화장대(PP)", code: "FN-559-01", name: "화장대(PP)/e편한세상", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRP481X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 368, majorCode: "FN", majorName: "가구", midCode: "559", midName: "화장대(PP)", code: "FN-559-02", name: "화장대(PP)/아크로", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRP077X / 손잡이 : 도어 유사컬러 도장", finish: "PP" },
  { no: 369, majorCode: "FN", majorName: "가구", midCode: "560", midName: "화장대(PET)", code: "FN-560-01", name: "화장대(PET)/미니멀", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 370, majorCode: "FN", majorName: "가구", midCode: "561", midName: "화장대(FUTURA)", code: "FN-561-01", name: "화장대(FUTURA)/내추럴 모던", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 371, majorCode: "FN", majorName: "가구", midCode: "561", midName: "화장대(FUTURA)", code: "FN-561-02", name: "화장대(FUTURA)/소프트 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 372, majorCode: "FN", majorName: "가구", midCode: "561", midName: "화장대(FUTURA)", code: "FN-561-03", name: "화장대(FUTURA)/내추럴 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 373, majorCode: "FN", majorName: "가구", midCode: "561", midName: "화장대(FUTURA)", code: "FN-561-04", name: "화장대(FUTURA)/블랑 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 374, majorCode: "FN", majorName: "가구", midCode: "561", midName: "화장대(FUTURA)", code: "FN-561-05", name: "화장대(FUTURA)/모던 내추럴", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 375, majorCode: "FN", majorName: "가구", midCode: "562", midName: "측면수납형 화장대(PET)", code: "FN-562-01", name: "측면수납형 화장대(PET)/미니멀", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장 / 타원형거울", finish: "PET" },
  { no: 376, majorCode: "FN", majorName: "가구", midCode: "563", midName: "측면수납형 화장대(FUTURA)", code: "FN-563-01", name: "측면수납형 화장대(FUTURA)/내추럴 모던", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이 / 타원형거울", finish: "외산 푸트라 PET" },
  { no: 377, majorCode: "FN", majorName: "가구", midCode: "563", midName: "측면수납형 화장대(FUTURA)", code: "FN-563-02", name: "측면수납형 화장대(FUTURA)/소프트 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이 / 타원형거울", finish: "외산 푸트라 PET" },
  { no: 378, majorCode: "FN", majorName: "가구", midCode: "563", midName: "측면수납형 화장대(FUTURA)", code: "FN-563-03", name: "측면수납형 화장대(FUTURA)/내추럴 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 손잡이 : 내추럴 클래식 노출손잡이 / 타원형거울", finish: "외산 푸트라 PET" },
  { no: 379, majorCode: "FN", majorName: "가구", midCode: "563", midName: "측면수납형 화장대(FUTURA)", code: "FN-563-04", name: "측면수납형 화장대(FUTURA)/블랑 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 블랑 클래식 노출손잡이 / 타원형거울", finish: "외산 푸트라 PET" },
  { no: 380, majorCode: "FN", majorName: "가구", midCode: "563", midName: "측면수납형 화장대(FUTURA)", code: "FN-563-05", name: "측면수납형 화장대(FUTURA)/모던 내추럴", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이 / 타원형거울", finish: "외산 푸트라 PET" },
  { no: 381, majorCode: "FN", majorName: "가구", midCode: "564", midName: "건식세면대(PET)", code: "FN-564-01", name: "건식세면대(PET)/미니멀", groupName: "건식세면대", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 382, majorCode: "FN", majorName: "가구", midCode: "565", midName: "건식세면대(FUTURA)", code: "FN-565-01", name: "건식세면대(FUTURA)/내추럴 모던", groupName: "건식세면대", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 383, majorCode: "FN", majorName: "가구", midCode: "565", midName: "건식세면대(FUTURA)", code: "FN-565-02", name: "건식세면대(FUTURA)/소프트 클래식", groupName: "건식세면대", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 소프트 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 384, majorCode: "FN", majorName: "가구", midCode: "565", midName: "건식세면대(FUTURA)", code: "FN-565-03", name: "건식세면대(FUTURA)/내추럴 클래식", groupName: "건식세면대", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 손잡이 : 내추럴 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 385, majorCode: "FN", majorName: "가구", midCode: "565", midName: "건식세면대(FUTURA)", code: "FN-565-04", name: "건식세면대(FUTURA)/블랑 클래식", groupName: "건식세면대", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 블랑 클래식 노출손잡이", finish: "외산 푸트라 PET" },
  { no: 386, majorCode: "FN", majorName: "가구", midCode: "565", midName: "건식세면대(FUTURA)", code: "FN-565-05", name: "건식세면대(FUTURA)/모던 내추럴", groupName: "건식세면대", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 387, majorCode: "FN", majorName: "가구", midCode: "566", midName: "시스템 선반 의류관리기장", code: "FN-566-01", name: "시스템 선반 의류관리기장", groupName: "붙박이장/화장대/데스크", maker: "동성사", model: "효산 HS0927DL(UK)", finish: "LPM" },
  { no: 388, majorCode: "FN", majorName: "가구", midCode: "567", midName: "의류관리기장(PET)", code: "FN-567-01", name: "의류관리기장(PET)/미니멀", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 389, majorCode: "FN", majorName: "가구", midCode: "568", midName: "의류관리기장(FUTURA)", code: "FN-568-01", name: "의류관리기장(FUTURA)/내추럴 모던", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 390, majorCode: "FN", majorName: "가구", midCode: "568", midName: "의류관리기장(FUTURA)", code: "FN-568-02", name: "의류관리기장(FUTURA)/소프트 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 391, majorCode: "FN", majorName: "가구", midCode: "568", midName: "의류관리기장(FUTURA)", code: "FN-568-03", name: "의류관리기장(FUTURA)/내추럴 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 392, majorCode: "FN", majorName: "가구", midCode: "568", midName: "의류관리기장(FUTURA)", code: "FN-568-04", name: "의류관리기장(FUTURA)/블랑 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 393, majorCode: "FN", majorName: "가구", midCode: "568", midName: "의류관리기장(FUTURA)", code: "FN-568-05", name: "의류관리기장(FUTURA)/모던 내추럴", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 394, majorCode: "FN", majorName: "가구", midCode: "569", midName: "오픈형 행거+서랍장(PET)", code: "FN-569-01", name: "오픈형 행거+서랍장(PET)/미니멀", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 395, majorCode: "FN", majorName: "가구", midCode: "570", midName: "오픈형 행거+서랍장(FUTURA)", code: "FN-570-01", name: "오픈형 행거+서랍장(FUTURA)/내추럴 모던", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 396, majorCode: "FN", majorName: "가구", midCode: "570", midName: "오픈형 행거+서랍장(FUTURA)", code: "FN-570-02", name: "오픈형 행거+서랍장(FUTURA)/소프트 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 397, majorCode: "FN", majorName: "가구", midCode: "570", midName: "오픈형 행거+서랍장(FUTURA)", code: "FN-570-03", name: "오픈형 행거+서랍장(FUTURA)/내추럴 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 398, majorCode: "FN", majorName: "가구", midCode: "570", midName: "오픈형 행거+서랍장(FUTURA)", code: "FN-570-04", name: "오픈형 행거+서랍장(FUTURA)/블랑 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 399, majorCode: "FN", majorName: "가구", midCode: "570", midName: "오픈형 행거+서랍장(FUTURA)", code: "FN-570-05", name: "오픈형 행거+서랍장(FUTURA)/모던 내추럴", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 400, majorCode: "FN", majorName: "가구", midCode: "571", midName: "오픈형 책장(PET)", code: "FN-571-01", name: "오픈형 책장(PET)/미니멀", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027_PL / 손잡이 : 도어 유사컬러 도장", finish: "PET" },
  { no: 401, majorCode: "FN", majorName: "가구", midCode: "572", midName: "오픈형 책장(FUTURA)", code: "FN-572-01", name: "오픈형 책장(FUTURA)/내추럴 모던", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 402, majorCode: "FN", majorName: "가구", midCode: "572", midName: "오픈형 책장(FUTURA)", code: "FN-572-02", name: "오픈형 책장(FUTURA)/소프트 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_SF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 403, majorCode: "FN", majorName: "가구", midCode: "572", midName: "오픈형 책장(FUTURA)", code: "FN-572-03", name: "오픈형 책장(FUTURA)/내추럴 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : GM401-4T_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 404, majorCode: "FN", majorName: "가구", midCode: "572", midName: "오픈형 책장(FUTURA)", code: "FN-572-04", name: "오픈형 책장(FUTURA)/블랑 클래식", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : LTDRT027_BF / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 405, majorCode: "FN", majorName: "가구", midCode: "572", midName: "오픈형 책장(FUTURA)", code: "FN-572-05", name: "오픈형 책장(FUTURA)/모던 내추럴", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 손잡이 : 도어 동일 매입손잡이", finish: "외산 푸트라 PET" },
  { no: 406, majorCode: "FN", majorName: "가구", midCode: "573", midName: "드레스룸 유리도어(PET)", code: "FN-573-01", name: "드레스룸 유리도어(PET)/미니멀", groupName: "가구성 도어", maker: "리바트", model: "LTDRT027_PL / 프레임 : IK-A38 / 유리 : KCC-BS-N40 (패턴 브론즈 사틴)", finish: "PET / AL 프레임 / 패턴유리" },
  { no: 407, majorCode: "FN", majorName: "가구", midCode: "574", midName: "드레스룸 유리도어(FUTURA)", code: "FN-574-01", name: "드레스룸 유리도어(FUTURA)/내추럴 모던", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : GM401-4T_WV / 프레임 : IK-A38 / 유리 : KCC-BS-N40 (패턴 브론즈 사틴)", finish: "외산 푸트라 PET / AL 프레임 / 패턴유리" },
  { no: 408, majorCode: "FN", majorName: "가구", midCode: "574", midName: "드레스룸 유리도어(FUTURA)", code: "FN-574-02", name: "드레스룸 유리도어(FUTURA)/소프트 클래식", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : LTDRT027_SF / 프레임 : IK-A38 / 유리 : KCC-BS-N40 (패턴 브론즈 사틴)", finish: "외산 푸트라 PET / AL 프레임 / 패턴유리" },
  { no: 409, majorCode: "FN", majorName: "가구", midCode: "574", midName: "드레스룸 유리도어(FUTURA)", code: "FN-574-03", name: "드레스룸 유리도어(FUTURA)/내추럴 클래식", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : GM401-4T_BF / 프레임 : IK-A38 / 유리 : KCC-BS-N40 (패턴 브론즈 사틴)", finish: "외산 푸트라 PET / AL 프레임 / 패턴유리" },
  { no: 410, majorCode: "FN", majorName: "가구", midCode: "574", midName: "드레스룸 유리도어(FUTURA)", code: "FN-574-04", name: "드레스룸 유리도어(FUTURA)/블랑 클래식", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : LTDRT027_BF / 프레임 : IK-A38 / 유리 : KCC-BS-N40 (패턴 브론즈 사틴)", finish: "외산 푸트라 PET / AL 프레임 / 패턴유리" },
  { no: 411, majorCode: "FN", majorName: "가구", midCode: "574", midName: "드레스룸 유리도어(FUTURA)", code: "FN-574-05", name: "드레스룸 유리도어(FUTURA)/모던 내추럴", groupName: "가구성 도어", maker: "리바트", model: "FUTURA : YQ4902-G3_WV / 프레임 : IK-A38 / 유리 : KCC-BS-N40 (패턴 브론즈 사틴)", finish: "외산 푸트라 PET / AL 프레임 / 패턴유리" },
  { no: 412, majorCode: "FN", majorName: "가구", midCode: "575", midName: "샤워 부스", code: "FN-575-01", name: "샤워 부스", groupName: "욕실 샤워부스/하부장", maker: "후 입찰", finish: "AL 프레임 / 접합유리" },
  { no: 413, majorCode: "FN", majorName: "가구", midCode: "576", midName: "고급형 샤워부스", code: "FN-576-01", name: "고급형 샤워부스/F.3373", groupName: "욕실 샤워부스/하부장", maker: "후 입찰", model: "프레임 : F.3373 / 유리 : 투명 강화 접합유리", finish: "AL 프레임 / 접합유리", size: "유리 : 8.76T" },
  { no: 414, majorCode: "FN", majorName: "가구", midCode: "576", midName: "고급형 샤워부스", code: "FN-576-02", name: "고급형 샤워부스/F.3180", groupName: "욕실 샤워부스/하부장", maker: "후 입찰", model: "프레임 : F.3180 / 유리 : 투명 강화 접합유리", finish: "AL 프레임 / 접합유리", size: "유리 : 8.76T" },
  { no: 415, majorCode: "FN", majorName: "가구", midCode: "577", midName: "카운터형 욕실 하부장", code: "FN-577-01", name: "카운터형 욕실 하부장", groupName: "욕실 샤워부스/하부장", maker: "후 입찰 / 연단가", model: "LTDRT027 유사 컬러", finish: "PS" },
  { no: 416, majorCode: "FN", majorName: "가구", midCode: "579", midName: "책상 측면 옵션장_상부찬넬형", code: "FN-579-01", name: "책상 측면 옵션장_상부찬넬형", groupName: "붙박이장/화장대/데스크", maker: "리바트", model: "LTDRT027", finish: "PET" },
  { no: 417, majorCode: "FN", majorName: "가구", midCode: "900", midName: "상,하부장", code: "FN-900-01", name: "상,하부장/한샘 U1", groupName: "주방 상부장/하부장", maker: "한샘", model: "상부장 : KCC-PDR27 / 하부장 : 한샘 쉘베이지 / 손잡이 : 일광산업 AA-539 IK44 칼라", finish: "상부장 : 도장 / 하부장 : 무늬목" },
  { no: 418, majorCode: "FN", majorName: "가구", midCode: "900", midName: "상,하부장", code: "FN-900-02", name: "상,하부장/한샘 U2", groupName: "주방 상부장/하부장", maker: "한샘", model: "상,하부장 : KCC-PDR27 / 손잡이 : 일광산업 AA-539 IK44 칼라", finish: "상,하부장 : 도장" },
  { no: 419, majorCode: "FN", majorName: "가구", midCode: "900", midName: "상,하부장", code: "FN-900-03", name: "상,하부장/라이히트", groupName: "주방 상부장/하부장", maker: "라이히트", model: "상부장 : TOPOS(Veneer)_H309 Bergamo elm / 하부장 : PEARL(Acrylic glass)_PM 071 Opal / 손잡이 : CONCEPT 715 (steel black)", finish: "상부장 : 무늬목 / 하부장 : 아크릴글라스" },
  { no: 420, majorCode: "FN", majorName: "가구", midCode: "900", midName: "상,하부장", code: "FN-900-04", name: "상,하부장/베네타쿠치네 U1", groupName: "주방 상부장/하부장", maker: "베네타쿠치네", model: "가구도어 : BEIGE ECRU 084 / 바디 : BIANCO 180 / 찬넬,걸레받이 : TITANIO 847", finish: "가구도어 : 도장 / 바디 : LPM / 찬넬 : AL / 걸레받이 : PVC" },
  { no: 421, majorCode: "FN", majorName: "가구", midCode: "900", midName: "상,하부장", code: "FN-900-05", name: "상,하부장/베네타쿠치네 U2", groupName: "주방 상부장/하부장", maker: "베네타쿠치네", model: "가구도어 : GRIGIO CORDA 476 / 바디 : BIANCO 180 / 찬넬,걸레받이 : TITANIO 847", finish: "가구도어 : 도장 / 바디 : LPM / 찬넬 : AL / 걸레받이 : PVC" },
  { no: 422, majorCode: "FN", majorName: "가구", midCode: "900", midName: "상,하부장", code: "FN-900-06", name: "상,하부장/해커 U1", groupName: "주방 상부장/하부장", maker: "해커" },
  { no: 423, majorCode: "FN", majorName: "가구", midCode: "900", midName: "상,하부장", code: "FN-900-07", name: "상,하부장/해커 U2", groupName: "주방 상부장/하부장", maker: "해커" },
  { no: 424, majorCode: "FN", majorName: "가구", midCode: "901", midName: "아일랜드장", code: "FN-901-01", name: "아일랜드장/한샘 U1", groupName: "주방 아일랜드장", maker: "한샘", model: "하부장 : 한샘 쉘베이지 / 손잡이 : 일광산업 AA-539 IK44 칼라", finish: "하부장 : 무늬목" },
  { no: 425, majorCode: "FN", majorName: "가구", midCode: "901", midName: "아일랜드장", code: "FN-901-02", name: "아일랜드장/한샘 U2", groupName: "주방 아일랜드장", maker: "한샘", model: "하부장 : KCC-PDR27 / 손잡이 : 일광산업 AA-539 IK44 칼라", finish: "하부장 : 도장" },
  { no: 426, majorCode: "FN", majorName: "가구", midCode: "901", midName: "아일랜드장", code: "FN-901-03", name: "아일랜드장/라이히트", groupName: "주방 아일랜드장", maker: "라이히트", model: "하부장 : PEARL(Acrylic glass)_PM 071 Opal / 손잡이 : CONCEPT 715 (steel black)", finish: "아크릴글라스" },
  { no: 427, majorCode: "FN", majorName: "가구", midCode: "901", midName: "아일랜드장", code: "FN-901-04", name: "아일랜드장/베네타쿠치네 U1", groupName: "주방 아일랜드장", maker: "베네타쿠치네", model: "가구도어 : BEIGE ECRU 084 / 바디 : BIANCO 180 / 찬넬,걸레받이 : TITANIO 847", finish: "가구도어 : 도장 / 바디 : LPM / 찬넬 : AL / 걸레받이 : PVC" },
  { no: 428, majorCode: "FN", majorName: "가구", midCode: "901", midName: "아일랜드장", code: "FN-901-05", name: "아일랜드장/베네타쿠치네 U2", groupName: "주방 아일랜드장", maker: "베네타쿠치네", model: "가구도어 : GRIGIO CORDA 476 / 바디 : BIANCO 180 / 찬넬,걸레받이 : TITANIO 847", finish: "가구도어 : 도장 / 바디 : LPM / 찬넬 : AL / 걸레받이 : PVC" },
  { no: 429, majorCode: "FN", majorName: "가구", midCode: "901", midName: "아일랜드장", code: "FN-901-06", name: "아일랜드장/해커 U1", groupName: "주방 아일랜드장", maker: "해커" },
  { no: 430, majorCode: "FN", majorName: "가구", midCode: "901", midName: "아일랜드장", code: "FN-901-07", name: "아일랜드장/해커 U2", groupName: "주방 아일랜드장", maker: "해커" },
  { no: 431, majorCode: "FN", majorName: "가구", midCode: "902", midName: "냉장고장 기본형", code: "FN-902-01", name: "냉장고장 기본형/한샘", groupName: "주방 냉장고장/키큰장", maker: "한샘", model: "KCC-PDR27 / 손잡이 : 일광산업 AA-539 IK44 칼라", finish: "도장" },
  { no: 432, majorCode: "FN", majorName: "가구", midCode: "902", midName: "냉장고장 기본형", code: "FN-902-02", name: "냉장고장 기본형/라이히트", groupName: "주방 냉장고장/키큰장", maker: "라이히트", model: "PEARL(Acrylic glass)_PM 071 Opal / 손잡이 : CONCEPT 715 (steel black)", finish: "아크릴글라스" },
  { no: 433, majorCode: "FN", majorName: "가구", midCode: "903", midName: "선반 수납형 키큰장", code: "FN-903-01", name: "선반 수납형 키큰장/한샘", groupName: "주방 냉장고장/키큰장", maker: "한샘", model: "KCC-PDR27 / 손잡이 : 일광산업 AA-539 IK44 칼라", finish: "도장" },
  { no: 434, majorCode: "FN", majorName: "가구", midCode: "903", midName: "선반 수납형 키큰장", code: "FN-903-02", name: "선반 수납형 키큰장/라이히트", groupName: "주방 냉장고장/키큰장", maker: "라이히트", model: "PEARL(Acrylic glass)_PM 071 Opal / 손잡이 : CONCEPT 715 (steel black)", finish: "아크릴글라스" },
  { no: 435, majorCode: "FN", majorName: "가구", midCode: "904", midName: "인출식 수납형 키큰장", code: "FN-904-01", name: "인출식 수납형 키큰장/한샘", groupName: "주방 냉장고장/키큰장", maker: "한샘", model: "KCC-PDR27 / 손잡이 : 일광산업 AA-539 IK44 칼라", finish: "도장" },
  { no: 436, majorCode: "FN", majorName: "가구", midCode: "904", midName: "인출식 수납형 키큰장", code: "FN-904-02", name: "인출식 수납형 키큰장/라이히트", groupName: "주방 냉장고장/키큰장", maker: "라이히트", model: "PEARL(Acrylic glass)_PM 071 Opal / 손잡이 : CONCEPT 715 (steel black)", finish: "아크릴글라스" },
  { no: 437, majorCode: "FN", majorName: "가구", midCode: "905", midName: "홈바 수납형", code: "FN-905-01", name: "홈바 수납형/한샘 U1", groupName: "주방 홈바", maker: "한샘", model: "하부장 : 한샘 쉘베이지 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "하부장 : 무늬목" },
  { no: 438, majorCode: "FN", majorName: "가구", midCode: "905", midName: "홈바 수납형", code: "FN-905-02", name: "홈바 수납형/한샘 U2", groupName: "주방 홈바", maker: "한샘", model: "하부장 : KCC-PDR27 / 유리프레임 : 봉적/B CHE N / 유리 : CNG BL-B-004(세로결)", finish: "하부장 : 도장" },
  { no: 439, majorCode: "FN", majorName: "가구", midCode: "906", midName: "상부장 전동 플랩장", code: "FN-906-01", name: "상부장 전동 플랩장/한샘", groupName: "주방 상부장/하부장", maker: "한샘", model: "KCC-PDR27", finish: "도장" },
  { no: 440, majorCode: "FN", majorName: "가구", midCode: "907", midName: "전기오븐장", code: "FN-907-01", name: "전기오븐장/베네타쿠치네 U1", groupName: "주방 전기오븐장", maker: "베네타쿠치네", model: "가구도어 : BEIGE ECRU 084 / 바디 : BIANCO 180 / 찬넬,걸레받이 : TITANIO 847", finish: "가구도어 : 도장 / 바디 : LPM / 찬넬 : AL / 걸레받이 : PVC" },
  { no: 441, majorCode: "FN", majorName: "가구", midCode: "907", midName: "전기오븐장", code: "FN-907-02", name: "전기오븐장/베네타쿠치네 U2", groupName: "주방 전기오븐장", maker: "베네타쿠치네", model: "가구도어 : GRIGIO CORDA 476 / 바디 : BIANCO 180 / 찬넬,걸레받이 : TITANIO 847", finish: "가구도어 : 도장 / 바디 : LPM / 찬넬 : AL / 걸레받이 : PVC" },
  { no: 442, majorCode: "FN", majorName: "가구", midCode: "908", midName: "가전 맞춤형 빌트인 냉장고장", code: "FN-908-01", name: "가전 맞춤형 빌트인 냉장고장/베네타쿠치네 U1", groupName: "주방 냉장고장/키큰장", maker: "베네타쿠치네", model: "가구도어 : BEIGE ECRU 084 / 바디 : BIANCO 180 / 찬넬,걸레받이 : TITANIO 847", finish: "가구도어 : 도장 / 바디 : LPM / 찬넬 : AL / 걸레받이 : PVC" },
  { no: 443, majorCode: "FN", majorName: "가구", midCode: "908", midName: "가전 맞춤형 빌트인 냉장고장", code: "FN-908-02", name: "가전 맞춤형 빌트인 냉장고장/베네타쿠치네 U2", groupName: "주방 냉장고장/키큰장", maker: "베네타쿠치네", model: "가구도어 : GRIGIO CORDA 476 / 바디 : BIANCO 180 / 찬넬,걸레받이 : TITANIO 847", finish: "가구도어 : 도장 / 바디 : LPM / 찬넬 : AL / 걸레받이 : PVC" },
  { no: 444, majorCode: "FN", majorName: "가구", midCode: "908", midName: "가전 맞춤형 빌트인 냉장고장", code: "FN-908-03", name: "가전 맞춤형 빌트인 냉장고장/해커 U1", groupName: "주방 냉장고장/키큰장", maker: "해커" },
  { no: 445, majorCode: "FN", majorName: "가구", midCode: "908", midName: "가전 맞춤형 빌트인 냉장고장", code: "FN-908-04", name: "가전 맞춤형 빌트인 냉장고장/해커 U2", groupName: "주방 냉장고장/키큰장", maker: "해커" },
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

/* 사용자가 전사공통코드 화면에서 직접 등록한 신규 중분류도, 소분류(PK)와 같은
   방식으로 새로고침 후에도 유지되도록 별도 저장해두고 DS_PRODUCT_MIDS_NEW 뒤에
   이어붙인다. */
const DS_CUSTOM_MID_STORAGE_KEY = "dselection_custom_mids_v1";
function dsLoadCustomMids() {
  try {
    const raw = JSON.parse(localStorage.getItem(DS_CUSTOM_MID_STORAGE_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}
function dsSaveCustomMids(list) {
  localStorage.setItem(DS_CUSTOM_MID_STORAGE_KEY, JSON.stringify(list));
}
dsLoadCustomMids().forEach((row) => DS_PRODUCT_MIDS_NEW.push(row));

function dsAddCustomMidCode(row) {
  DS_PRODUCT_MIDS_NEW.push(row);
  const custom = dsLoadCustomMids();
  custom.push(row);
  dsSaveCustomMids(custom);
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
