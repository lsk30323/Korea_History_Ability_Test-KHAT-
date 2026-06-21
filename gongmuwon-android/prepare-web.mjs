/* 개인용 안드로이드 앱을 위한 self-contained 웹 번들 생성기.
 *
 * gongmuwon-app 은 브라우저용으로 ../docs/data 를 참조(단일 원본)하지만,
 * 안드로이드 앱 자산은 자기 폴더 안에서 모두 해결되어야 하므로
 * 여기서 필요한 파일을 www/ 로 모으고 경로(../docs/data → ./data)를 고칩니다.
 *
 * 결과물 www/ 는 빌드 산출물이라 git 에 올리지 않습니다(.gitignore).
 * 실행: node prepare-web.mjs   (또는 npm run prepare:web)
 */
import { mkdirSync, rmSync, copyFileSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const app = join(repo, "gongmuwon-app");
const docsData = join(repo, "docs", "data");
const www = join(here, "www");
const wwwData = join(www, "data");

// 1) 초기화
rmSync(www, { recursive: true, force: true });
mkdirSync(wwwData, { recursive: true });

// 2) 앱 정적 파일 복사
for (const f of ["index.html", "app.js", "styles.css"]) {
  copyFileSync(join(app, f), join(www, f));
}
for (const f of ["bank.js", "adapter.js"]) {
  copyFileSync(join(app, "data", f), join(wwwData, f));
}
// 시대별 예상문제 뱅크(data/era/*.js) 복사
const eraSrc = join(app, "data", "era");
if (existsSync(eraSrc)) {
  const eraDst = join(wwwData, "era");
  mkdirSync(eraDst, { recursive: true });
  readdirSync(eraSrc)
    .filter(function (f) { return f.endsWith(".js"); })
    .forEach(function (f) { copyFileSync(join(eraSrc, f), join(eraDst, f)); });
}

// 3) 모의고사 데이터 복사 (exam-*.js 전부 자동 포함)
let examCount = 0;
readdirSync(docsData)
  .filter(function (f) { return /^exam-\d+\.js$/.test(f); })
  .forEach(function (f) { copyFileSync(join(docsData, f), join(wwwData, f)); examCount++; });

// 4) index.html 경로 정리: ../docs/data → ./data (자체 포함)
const idxPath = join(www, "index.html");
let html = readFileSync(idxPath, "utf8").replaceAll("../docs/data/", "./data/");
writeFileSync(idxPath, html);

if (html.includes("../docs/")) {
  console.error("✗ 경고: index.html 에 외부 경로(../docs)가 남아 있습니다.");
  process.exit(1);
}
console.log(`✓ www/ 생성 완료 — 모의고사 ${examCount}회 포함, 외부 경로 없음`);
