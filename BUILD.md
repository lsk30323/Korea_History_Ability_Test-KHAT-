# 안드로이드 앱 빌드 & 구글 플레이 배포 가이드

이 프로젝트는 `docs/`의 PWA를 **Capacitor**로 감싼 안드로이드 앱입니다.
웹 자산을 앱 안에 내장하므로 별도 웹 호스팅 없이 **오프라인으로 동작**합니다.

| 항목 | 값 |
|---|---|
| 앱 표시 이름 | 한능검 2급 대비 |
| 패키지명(applicationId) | `kr.co.vaultlife.khat` |
| 웹 자산 경로 | `docs/` |
| 최소 SDK / 타깃 SDK | 24 / 36 |

> ⚠️ `applicationId`(`kr.co.vaultlife.khat`)는 한번 게시하면 **변경 불가**입니다.

---

## 0. 빌드 환경 준비 (로컬 PC / CI)

이 저장소가 만들어진 클라우드 컨테이너는 Google 도메인이 차단되어 있어
**실제 AAB 빌드는 로컬 PC나 별도 CI에서** 진행해야 합니다.

필요한 것:

- **Node.js 18+** & npm
- **JDK 17+**
- **Android Studio** (Android SDK + 빌드 도구 포함) — 가장 쉬움
  - 또는 명령줄 도구(`sdkmanager`)로 `platforms;android-36`, `build-tools` 설치
- `ANDROID_HOME` 환경변수가 SDK 경로를 가리키도록 설정

저장소 클론 후 의존성 설치:

```bash
npm install
```

---

## 1. 웹 자산 → 네이티브 동기화

`docs/` 내용을 바꿨다면 항상 동기화합니다.

```bash
npm run sync          # = npx cap sync android
```

앱 아이콘/스플래시를 다시 만들려면(원본: `assets/icon.png`):

```bash
npm run icons         # 최상의 품질을 위해 1024×1024 PNG 권장
```

---

## 2. 서명 키스토어 생성 (최초 1회)

릴리스 빌드에는 서명이 필요합니다. **이 키는 분실하면 앱 업데이트가 불가능**하니
안전하게 백업하세요 (`*.jks`, `keystore.properties`는 `.gitignore`로 커밋에서 제외됨).

```bash
keytool -genkey -v \
  -keystore khat-release.jks \
  -alias khat \
  -keyalg RSA -keysize 2048 -validity 10000
```

저장소 루트에 `keystore.properties` 파일을 만들고 아래 내용을 채웁니다:

```properties
storeFile=../khat-release.jks
storePassword=키스토어_비밀번호
keyAlias=khat
keyPassword=키_비밀번호
```

> `keystore.properties`가 없으면 릴리스 빌드는 서명되지 않습니다.
> `android/app/build.gradle`이 이 파일을 읽어 자동으로 서명 설정을 적용합니다.

---

## 3. AAB(또는 APK) 빌드

구글 플레이 업로드용은 **AAB**입니다.

```bash
npm run build:aab
# 결과물: android/app/build/outputs/bundle/release/app-release.aab
```

기기에 직접 설치해 테스트할 APK가 필요하면:

```bash
npm run build:apk
# 결과물: android/app/build/outputs/apk/release/app-release.apk
```

Android Studio에서 작업하려면:

```bash
npm run open:android
# Build > Generate Signed Bundle / APK 메뉴 사용
```

---

## 4. 구글 플레이 콘솔 제출 (직접 진행)

1. **개발자 등록** — <https://play.google.com/console> 가입
   (최초 1회 $25, 신원 인증 필요).
2. **앱 만들기** → 앱 이름 "한능검 2급 대비", 언어 한국어, 무료 선택.
3. **앱 콘텐츠 설정** (좌측 메뉴):
   - 개인정보처리방침 URL — `docs/privacy.html`을 공개 주소로 호스팅한 링크 필요
     (예: GitHub Pages `https://lsk30323.github.io/Korea_History_Ability_Test-KHAT-/privacy.html`)
   - 콘텐츠 등급 설문, 타깃 연령, 데이터 보안(앱이 수집하는 데이터: 없음), 광고 포함 여부.
4. **스토어 등록정보**:
   - 앱 아이콘 512×512 (`docs/icon-512.png` 활용 가능)
   - 피처 그래픽 1024×500
   - 휴대전화 스크린샷 최소 2장
   - 짧은 설명 / 자세한 설명
5. **프로덕션 → 새 버전 만들기** → 위에서 만든 `app-release.aab` 업로드.
   - Play 앱 서명을 사용하면 업로드 키만 관리하면 됩니다(권장).
6. 검토 후 **제출** → 심사(보통 수일) 후 게시.

---

## 5. 버전 올리기 (업데이트 배포 시)

`android/app/build.gradle`에서 매 릴리스마다 올립니다:

```gradle
versionCode 2          // 정수, 매번 1씩 증가 (필수)
versionName "1.1"      // 사용자에게 보이는 버전 문자열
```

이후 다시 `npm run build:aab` → 콘솔에 새 버전 업로드.

---

## 참고: 서비스 워커

`docs/sw.js`는 웹(PWA) 환경용 캐시 스크립트입니다. Capacitor WebView에서는
자산이 이미 로컬에 내장되어 있어 서비스 워커가 없어도 앱은 정상 동작합니다.
문제가 생기면 `docs/index.html`의 서비스 워커 등록 부분을 비활성화해도 됩니다.
