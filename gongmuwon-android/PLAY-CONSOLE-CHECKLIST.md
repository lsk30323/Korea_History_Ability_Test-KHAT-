# Play Console 등록 단계별 체크리스트 — 공무원 한능검 문제집

화면 순서대로 "어디에 무엇을 넣는지" 정리했습니다. 값/문구는 `STORE-LISTING.md`,
그래픽은 `assets/store/`, AAB는 GitHub Actions 아티팩트에서 가져옵니다.

준비물 요약
- 서명된 AAB: Actions → "Build … AAB (release, signed)" 최신 성공 빌드 → Artifacts → `app-release.aab`
- 아이콘 512: `assets/store/play-icon-512.png`
- 피처 그래픽 1024×500: `assets/store/feature-graphic-1024x500.png`
- 폰 스크린샷 ×5: `assets/store/screenshots/01~05.png`
- 개인정보처리방침 URL: `https://lsk30323.github.io/Korea_History_Ability_Test-KHAT-/privacy-gongmuwon.html`

---

## 0단계. 개발자 계정 (최초 1회)
- https://play.google.com/console 가입 → 등록비 **$25**(1회) 결제 → 본인 확인.

## 1단계. 앱 만들기  (모든 앱 → 앱 만들기)
- 앱 이름: **공무원 한능검 문제집**
- 기본 언어: **한국어(대한민국)**
- 앱 또는 게임: **앱**
- 무료/유료: **무료**
- 정책/수출법 동의 체크 → **앱 만들기**

## 2단계. 대시보드 "앱 설정" 작업들  (왼쪽 메뉴: 정책 및 프로그램 / 앱 콘텐츠)
아래 항목을 하나씩 "완료" 처리합니다.

1) **앱 액세스 권한 (App access)**
   - "모든 기능을 특별한 액세스 없이 사용할 수 있음" 선택 (로그인 없음)

2) **광고 (Ads)**
   - "아니요, 앱에 광고가 없습니다" 선택

3) **콘텐츠 등급 (Content rating)**
   - 이메일 입력 → 카테고리 **참고/교육용** → 설문 전부 **아니요/없음** → 설문 제출
   - 결과: **전체 이용가** 등급 발급

4) **타겟층 및 콘텐츠 (Target audience)**
   - 대상 연령: **13세 이상** (아동 대상 아님 → "아니요")

5) **데이터 보안 (Data safety)**  ← STORE-LISTING.md 4번 표 그대로
   - 데이터 수집/공유: **아니요**
   - 수집 데이터 유형: **없음**
   - 데이터 삭제 요청 방법: 앱 내 ‘초기화’/삭제로 가능
   - 광고 ID: **아니요**

6) **개인정보처리방침 (Privacy policy)**
   - URL 입력: `https://lsk30323.github.io/Korea_History_Ability_Test-KHAT-/privacy-gongmuwon.html`

7) (해당 시 자동 표시되는 선언) **정부 앱/금융 기능/건강 등**: 모두 **아니요**

## 3단계. 스토어 등록정보  (왼쪽 메뉴: 성장 → 스토어 등록정보 → 기본 스토어 등록정보)
- 앱 이름: **공무원 한능검 문제집**
- 짧은 설명: STORE-LISTING.md 2번 복사
- 자세한 설명: STORE-LISTING.md 3번 복사
- **앱 아이콘**: `play-icon-512.png` (512×512)
- **그래픽 이미지(피처 그래픽)**: `feature-graphic-1024x500.png` (1024×500)
- **휴대전화 스크린샷**: `screenshots/01~05.png` (최소 2장, 5장 모두 권장)
- 저장

## 4단계. 앱 카테고리 / 연락처  (스토어 설정)
- 앱 카테고리: **교육(Education)**
- 태그(선택): 한국사, 공무원, 한능검, 수험
- 개발자 연락처 이메일: `lsk123456@vaultlife.co.kr`

## 5단계. 릴리스 만들기  (왼쪽 메뉴: 출시 → 프로덕션)
> 처음엔 **내부 테스트(Internal testing)** 로 먼저 올려 본인 기기에서 확인한 뒤
> 프로덕션으로 승격하는 것을 권장합니다. (절차는 동일)

- "새 버전 만들기" 클릭
- **앱 무결성/서명**: Google Play 앱 서명 사용(권장) → 우리가 만든 키로 서명된 AAB를 업로드하면
  Google이 업로드 키로 인식하고 배포용 서명을 관리합니다.
- **App bundle 업로드**: `app-release.aab` 끌어다 놓기
  - versionCode/versionName은 자동(커밋 수 기반)으로 들어가 있음
- 출시명: 예) `1.0 (최초 출시)`
- 출시 노트: 예) `최초 출시 — 시대별 예상문제, 채점, 오답노트, 과목별 통계`

## 6단계. 국가/지역 & 검토 제출
- 배포 국가: **대한민국**(또는 원하는 국가) 선택
- "검토를 위해 출시" → 제출
- 신규 개발자 계정은 검토에 며칠~2주가량 걸릴 수 있습니다.

---

## 업데이트할 때 (2회차부터)
1. `gongmuwon-app/` 내용 수정 → `main`에 커밋·푸시
2. Actions → AAB 워크플로 **Run workflow** (versionCode 자동 증가)
3. 새 `app-release.aab` 다운로드 → 프로덕션 새 버전으로 업로드 → 출시

## 참고
- 키스토어(`release.keystore`)와 비밀번호는 안전 보관 필수(분실 시 업데이트 불가).
- 스크린샷/아이콘/그래픽을 바꾸려면 `assets/` 원본 수정 후 `npm run assets`(앱 아이콘·스플래시) 또는
  스크린샷 재생성 후 다시 업로드.
