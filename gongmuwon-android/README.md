# 공무원 한능검 문제집 — 개인 설치용 안드로이드 앱

`gongmuwon-app`(개인용 문제집 웹앱)을 **개인 설치용 안드로이드 앱**으로 빌드하는
별도 Capacitor 프로젝트입니다. 스토어용 앱과 **다른 패키지명**이라 같은 기기에 함께 설치됩니다.

| 항목 | 값 |
|---|---|
| 앱 이름 | 공무원 한능검 문제집 |
| 패키지명 | `kr.co.vaultlife.khat.gongmuwon` |
| 스토어용 앱(별개) | `kr.co.vaultlife.khat` (`/android`) |
| 웹 자산 | `www/` (빌드 시 생성, git 미포함) |

> 개인 학습용입니다. 스토어 배포 대상이 아니며, 수록 문항은 프로젝트 자체 제작
> 모의고사(1~20회)와 샘플뿐 — 기출 원문은 포함하지 않습니다.

## 동작 방식

`gongmuwon-app`은 브라우저용으로 `../docs/data`(단일 원본)를 참조합니다.
안드로이드 앱은 자산이 자기 폴더 안에서 해결돼야 하므로, 빌드 전
`prepare-web.mjs`가 필요한 파일을 모아 경로를 고친 **self-contained `www/`** 를 만듭니다.

```
gongmuwon-app/ (+docs/data) ──prepare-web.mjs──▶ www/ ──cap sync──▶ android assets
```

## 빌드 (로컬 PC / CI — Android SDK 필요)

> 이 저장소가 만들어진 클라우드 환경은 Google 도메인 차단 + Android SDK 미설치라
> 실제 빌드는 로컬에서 하세요. 준비물: Node 18+, JDK 17+, Android Studio(SDK 포함).

```bash
cd gongmuwon-android
npm install

# 개인 설치용 디버그 APK (서명 불필요 — 가장 간단)
npm run build:apk
# 결과물: android/app/build/outputs/apk/debug/app-debug.apk
```

만든 APK를 휴대전화로 옮겨 설치하면 됩니다(설정에서 "출처를 알 수 없는 앱 설치" 허용).
또는 USB 연결 후:

```bash
cd android && ./gradlew installDebug   # 연결된 기기에 바로 설치
```

Android Studio로 작업하려면:

```bash
npm run open:android
```

## 콘텐츠 갱신

`docs/data` 또는 `gongmuwon-app`을 수정한 뒤 다시 빌드하면 반영됩니다
(`npm run build:apk`가 `prepare:web` → `cap sync`를 자동 수행).

## 서명 릴리스(선택)

개인 설치는 디버그 APK로 충분합니다. 서명된 릴리스가 필요하면
루트 `BUILD.md`의 키스토어/`keystore.properties` 방식을 동일하게 적용하고
`npm run build:aab` 를 사용하세요.
