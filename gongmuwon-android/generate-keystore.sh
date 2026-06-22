#!/usr/bin/env bash
# 릴리스 서명용 키스토어를 새로 생성하는 스크립트.
# 한 번만 생성하고, 만들어진 .keystore 파일과 비밀번호는 안전하게 보관하세요.
# (이 키를 잃어버리면 같은 앱으로 Play 스토어에 업데이트를 올릴 수 없습니다.)
#
# 사용법:
#   bash generate-keystore.sh [출력파일명] [별칭]
# 예:
#   bash generate-keystore.sh release.keystore khat
#
# 생성 후:
#   - 로컬 빌드: android/keystore.properties 에 경로/비밀번호 기입 (keystore.properties.example 참고)
#   - CI 빌드:   아래 명령으로 base64 만들어 GitHub Secrets(KEYSTORE_BASE64)에 등록
#       base64 -w0 release.keystore   (mac: base64 -i release.keystore)
set -euo pipefail

OUT="${1:-release.keystore}"
ALIAS="${2:-khat}"

read -r -s -p "키스토어 비밀번호 입력: " PW; echo
read -r -s -p "비밀번호 다시 입력: " PW2; echo
if [ "$PW" != "$PW2" ]; then echo "비밀번호가 일치하지 않습니다."; exit 1; fi

keytool -genkeypair -v \
  -keystore "$OUT" \
  -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$PW" -keypass "$PW" \
  -dname "CN=KHAT, OU=Personal, O=VaultLife, L=Seoul, ST=Seoul, C=KR"

echo
echo "✓ 생성 완료: $OUT  (별칭: $ALIAS)"
echo "  CI용 base64:  base64 -w0 $OUT"
