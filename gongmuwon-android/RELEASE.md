# Play 스토어 배포 가이드 (서명된 릴리스 AAB)

공무원 한능검 문제집 앱을 Google Play 스토어에 올리기 위한 **서명된 AAB** 빌드 방법입니다.

> ⚠️ 이 저장소는 **공개(public)** 입니다. 키스토어 파일(`*.keystore`/`*.jks`),
> `keystore.properties`, 비밀번호는 **절대 커밋하지 마세요.** (`.gitignore` 에 이미 제외돼 있습니다.)

---

## 0. 앱 아이콘 / 스플래시

- 원본 이미지: `gongmuwon-android/assets/`
  - `icon-foreground.png`, `icon-background.png`, `icon-only.png` (1024×1024)
  - `splash.png`, `splash-dark.png` (2732×2732)
- 디자인: 네이비(#1e3a5f) 배경 + 펼친 책 + 금색 체크(채점) 엠블럼
- 원본을 바꾼 뒤 아래로 모든 해상도를 다시 생성합니다.

```bash
cd gongmuwon-android
npm install
npm run assets        # android/app/src/main/res 의 아이콘·스플래시 전부 재생성
```

생성된 리소스는 커밋되어 있어 APK/AAB 빌드에 바로 반영됩니다.

---

## 1. 키스토어 준비 (최초 1회)

서명 키는 앱의 **신원**입니다. 잃어버리면 같은 앱으로 업데이트를 올릴 수 없으니 안전하게 보관하세요.

### 새로 만들기
```bash
cd gongmuwon-android
bash generate-keystore.sh release.keystore khat
# 비밀번호를 입력하면 release.keystore 가 생성됩니다.
```

이미 발급받은 키스토어가 있다면 그 파일을 그대로 사용하면 됩니다.

---

## 2-A. GitHub Actions 로 빌드 (권장)

### ① 저장소 Secrets 등록
GitHub 저장소 → **Settings → Secrets and variables → Actions → New repository secret** 에서 4개 등록:

| Secret 이름 | 값 |
|---|---|
| `KEYSTORE_BASE64` | `base64 -w0 release.keystore` 출력값 (mac: `base64 -i release.keystore`) |
| `KEYSTORE_PASSWORD` | 키스토어 비밀번호 |
| `KEY_ALIAS` | 키 별칭 (예: `khat`) |
| `KEY_PASSWORD` | 키 비밀번호 |

### ② 워크플로 실행
**Actions** 탭 → **"Build 공무원 한능검 문제집 AAB (release, signed)"** → **Run workflow**.

완료되면 **Artifacts** 에서 `gongmuwon-khat-release-aab` (= `app-release.aab`) 를 내려받아
Play Console 에 업로드합니다.

---

## 2-B. 로컬에서 빌드

```bash
cd gongmuwon-android/android
cp keystore.properties.example keystore.properties
# keystore.properties 를 열어 storeFile(절대경로)/storePassword/keyAlias/keyPassword 입력
cd ..
npm install
npm run build:aab
# 결과물: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 3. Play Console 업로드

1. https://play.google.com/console 에서 개발자 등록(최초 1회 등록비 $25)
2. 앱 만들기 → 앱 이름·언어·앱/게임·무료 설정
3. **프로덕션 → 새 버전 만들기** 에서 `app-release.aab` 업로드
4. 스토어 등록정보(설명·스크린샷·아이콘 512×512·그래픽 이미지), 콘텐츠 등급,
   개인정보 처리방침, 데이터 보안 양식 작성
5. 검토 제출

> 참고: 버전을 올릴 때마다 `android/app/build.gradle` 의 `versionCode` 를 1씩 증가,
> `versionName` 도 함께 갱신해야 합니다. (현재 versionCode 1 / versionName "1.0")

---

## 서명 설정 동작 방식

`android/app/build.gradle` 의 release 서명은 다음 우선순위로 값을 읽습니다.
1. `android/keystore.properties` 파일이 있으면 그 값(로컬 빌드)
2. 없으면 환경 변수 `KEYSTORE_FILE` / `KEYSTORE_PASSWORD` / `KEY_ALIAS` / `KEY_PASSWORD`(CI)

서명 정보가 전혀 없으면 release 서명은 적용되지 않으며, 기존 디버그 APK 빌드
(`build-gongmuwon-apk.yml`)에는 아무 영향이 없습니다.
