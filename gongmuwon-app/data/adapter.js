/* 어댑터: docs/data/exam-*.js 의 window.EXAM_DATA(모의고사 20회)를
 * 이 앱이 쓰는 window.QUESTION_BANK 스키마로 변환해 합칩니다.
 *
 * 원본은 docs/data 단일本을 참조하므로 문항 중복 저장이 없습니다.
 * index.html 에서 exam-1~20.js 다음, app.js 앞에 로드됩니다.
 */
(function () {
  "use strict";
  window.QUESTION_BANK = window.QUESTION_BANK || [];
  var ED = window.EXAM_DATA || {};

  // 회차 번호 오름차순
  Object.keys(ED)
    .sort(function (a, b) { return Number(a) - Number(b); })
    .forEach(function (round) {
      (ED[round] || []).forEach(function (it) {
        window.QUESTION_BANK.push({
          id: it.src || ("exam-" + round + "-" + it.n),
          area: it.area,
          source: "모의 " + round + "회",
          origin: "자체제작 모의고사 " + round + "회 " + (it.n != null ? it.n + "번" : ""),
          passage: it.passage || "",
          q: it.q,
          options: it.options,
          answer: it.answer,
          reason: it.reason,
          wrong: it.wrong,
          keyword: it.keyword
        });
      });
    });
})();
