/* 공무원 한능검 문제집 (개인용) — 풀기/채점/과목분류/오답노트 */
(function () {
  "use strict";

  var BANK = (window.QUESTION_BANK || []).slice();
  var LS_WRONG = "khat_gm_wrong";    // 오답노트: 틀린 문항 id 목록
  var LS_STATE = "khat_gm_state";    // 진행 중 세션 저장
  var LS_STATS = "khat_gm_stats";    // 과목별 누적 통계 {area:{seen,correct}}
  var LS_ROUNDS = "khat_gm_rounds";  // 회차별 누적 통계 {source:{seen,correct}}

  // ---------- 유틸 ----------
  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function areas() {
    var set = {};
    BANK.forEach(function (q) { if (q.area) set[q.area] = (set[q.area] || 0) + 1; });
    return set;
  }

  // ---------- 상태 ----------
  var session = null; // { items:[], idx, picks:{id:choice} }
  var selectedAreas = {};

  // ---------- 홈 ----------
  function renderHome() {
    showScreen("home");
    var counts = areas();
    var total = BANK.length;
    $("#bankInfo").textContent =
      total + "문항 수록 · " + Object.keys(counts).length + "개 과목";

    var wrap = $("#areaChips");
    wrap.innerHTML = "";
    Object.keys(counts).forEach(function (area) {
      var chip = el("span", "chip" + (selectedAreas[area] ? " on" : ""),
        area + " (" + counts[area] + ")");
      chip.addEventListener("click", function () {
        selectedAreas[area] = !selectedAreas[area];
        chip.classList.toggle("on");
      });
      wrap.appendChild(chip);
    });

    // 회차(source) 선택지 — 회차 번호 오름차순, 숫자 없는 항목(샘플 등)은 뒤로
    var roundSel = $("#round");
    var prev = roundSel.value;
    var sources = {};
    BANK.forEach(function (q) { if (q.source) sources[q.source] = (sources[q.source] || 0) + 1; });
    var keys = Object.keys(sources).sort(function (a, b) {
      var na = parseInt((a.match(/\d+/) || ["9999"])[0], 10);
      var nb = parseInt((b.match(/\d+/) || ["9999"])[0], 10);
      return na - nb;
    });
    roundSel.innerHTML = '<option value="">전체 회차</option>';
    keys.forEach(function (k) {
      var o = el("option", null, k + " (" + sources[k] + ")");
      o.value = k;
      roundSel.appendChild(o);
    });
    if (prev) roundSel.value = prev;

    var wrong = loadJSON(LS_WRONG, []);
    $("#wrongInfo").textContent = wrong.length
      ? "오답 " + wrong.length + "문항이 저장되어 있습니다."
      : "아직 저장된 오답이 없습니다.";
    $("#viewWrongBtn").disabled = wrong.length === 0;
    $("#exportWrongBtn").disabled = wrong.length === 0;

    var st = totalStats();
    $("#statSummary").textContent = st.seen
      ? "누적 " + st.seen + "문항 · 정답률 " + Math.round(st.correct / st.seen * 100) + "%"
      : "아직 푼 문항이 없습니다.";
    $("#viewStatsBtn").disabled = st.seen === 0;
  }

  function pickPool() {
    var chosen = Object.keys(selectedAreas).filter(function (a) { return selectedAreas[a]; });
    var pool = BANK.slice();
    if ($("#onlyWrong").checked) {
      var wrong = loadJSON(LS_WRONG, []);
      pool = pool.filter(function (q) { return wrong.indexOf(q.id) !== -1; });
    }
    if (chosen.length) {
      pool = pool.filter(function (q) { return chosen.indexOf(q.area) !== -1; });
    }
    var round = $("#round").value;
    if (round) {
      pool = pool.filter(function (q) { return q.source === round; });
    }
    return pool;
  }

  function startQuiz() {
    var pool = pickPool();
    if (!pool.length) {
      alert("선택한 조건에 해당하는 문항이 없습니다.");
      return;
    }
    if ($("#shuffle").checked) shuffle(pool);
    var n = parseInt($("#count").value, 10);
    if (n > 0) pool = pool.slice(0, n);

    session = { items: pool, idx: 0, picks: {} };
    saveJSON(LS_STATE, session);
    renderQuestion();
  }

  // ---------- 풀이 ----------
  function renderQuestion() {
    showScreen("quiz");
    var q = session.items[session.idx];
    var total = session.items.length;

    $("#progressBar").style.width = ((session.idx) / total * 100) + "%";
    $("#qIndex").textContent = (session.idx + 1) + " / " + total;
    $("#qArea").textContent = q.area || "";
    $("#qSource").textContent = q.source || "";
    $("#passage").textContent = q.passage || "";
    $("#passage").style.display = q.passage ? "" : "none";
    $("#question").textContent = q.q || "";

    var ul = $("#options");
    ul.innerHTML = "";
    var picked = session.picks[q.id];
    q.options.forEach(function (opt, i) {
      var num = i + 1;
      var li = el("li");
      var span = el("span", "num", "①②③④⑤".charAt(i) || (num + "."));
      li.appendChild(span);
      li.appendChild(document.createTextNode(opt));
      if (picked != null) {
        li.classList.add("locked");
        if (num === q.answer) li.classList.add("correct");
        if (num === picked && picked !== q.answer) li.classList.add("incorrect");
      } else {
        li.addEventListener("click", function () { choose(q, num); });
      }
      ul.appendChild(li);
    });

    if (picked != null) showFeedback(q, picked); else hideFeedback();

    $("#prevBtn").disabled = session.idx === 0;
    $("#nextBtn").textContent = (session.idx === total - 1) ? "채점하기" : "다음";
  }

  function choose(q, num) {
    session.picks[q.id] = num;
    saveJSON(LS_STATE, session);
    // 과목별·회차별 누적 통계 갱신
    bumpStats(q, num === q.answer);
    // 오답노트 갱신
    var wrong = loadJSON(LS_WRONG, []);
    var has = wrong.indexOf(q.id) !== -1;
    if (num !== q.answer && !has) { wrong.push(q.id); saveJSON(LS_WRONG, wrong); }
    if (num === q.answer && has) { wrong.splice(wrong.indexOf(q.id), 1); saveJSON(LS_WRONG, wrong); }
    renderQuestion();
  }

  function showFeedback(q, picked) {
    var fb = $("#feedback");
    fb.classList.remove("hidden", "ok", "no");
    var correct = picked === q.answer;
    fb.classList.add(correct ? "ok" : "no");
    fb.innerHTML = "";
    fb.appendChild(el("h4", null, correct ? "정답입니다" : "오답입니다 (정답 " + "①②③④⑤".charAt(q.answer - 1) + ")"));
    if (q.reason) fb.appendChild(el("p", "reason", q.reason));
    if (!correct && q.wrong && q.wrong[String(picked)]) {
      fb.appendChild(el("p", "reason", "· 내가 고른 보기: " + q.wrong[String(picked)]));
    }
    if (q.keyword) fb.appendChild(el("p", "key", "핵심: " + q.keyword));
  }
  function hideFeedback() { $("#feedback").classList.add("hidden"); }

  function nextQuestion() {
    if (session.idx === session.items.length - 1) { grade(); return; }
    session.idx++;
    saveJSON(LS_STATE, session);
    renderQuestion();
  }
  function prevQuestion() {
    if (session.idx > 0) { session.idx--; saveJSON(LS_STATE, session); renderQuestion(); }
  }

  // ---------- 채점 ----------
  function grade() {
    showScreen("result");
    var items = session.items, correct = 0, wrongItems = [];
    items.forEach(function (q) {
      var p = session.picks[q.id];
      if (p === q.answer) correct++;
      else wrongItems.push({ q: q, picked: p });
    });
    var total = items.length;
    var pct = Math.round(correct / total * 100);
    $("#scoreBig").textContent = correct + " / " + total;
    $("#scoreText").textContent = "정답률 " + pct + "% · 오답 " + wrongItems.length + "문항";

    renderReview(wrongItems);
    localStorage.removeItem(LS_STATE);
  }

  function renderReview(wrongItems) {
    var box = $("#reviewList");
    box.innerHTML = "";
    if (!wrongItems.length) {
      box.appendChild(el("p", "muted", "틀린 문항이 없습니다. 훌륭합니다!"));
      return;
    }
    wrongItems.forEach(function (w) {
      var q = w.q;
      var item = el("div", "review-item");
      item.appendChild(el("span", "tag", q.area || ""));
      item.appendChild(el("p", "q", q.q));
      var ans = el("p", "ans");
      ans.innerHTML =
        '<span class="yours">내 답: ' + (w.picked ? "①②③④⑤".charAt(w.picked - 1) : "미응답") + "</span> · " +
        '<span class="right">정답: ' + "①②③④⑤".charAt(q.answer - 1) + "</span>";
      item.appendChild(ans);
      if (q.reason) item.appendChild(el("p", "muted", q.reason));
      box.appendChild(item);
    });
  }

  // ---------- 통계 ----------
  function _bump(key, k, correct) {
    if (!k) return;
    var s = loadJSON(key, {});
    if (!s[k]) s[k] = { seen: 0, correct: 0 };
    s[k].seen++;
    if (correct) s[k].correct++;
    saveJSON(key, s);
  }
  function bumpStats(q, correct) {
    _bump(LS_STATS, q.area, correct);     // 과목별
    _bump(LS_ROUNDS, q.source, correct);  // 회차별
  }
  function roundNum(name) {
    var m = String(name).match(/\d+/);
    return m ? parseInt(m[0], 10) : 9999;
  }
  function totalStats() {
    var s = loadJSON(LS_STATS, {});
    var seen = 0, correct = 0;
    Object.keys(s).forEach(function (a) { seen += s[a].seen; correct += s[a].correct; });
    return { seen: seen, correct: correct };
  }
  function renderBars(box, data, sortFn) {
    Object.keys(data).sort(sortFn).forEach(function (k) {
      var d = data[k];
      var pct = Math.round(d.correct / d.seen * 100);
      var row = el("div", "stat-row");
      var head = el("div", "stat-head");
      head.appendChild(el("span", "stat-area", k));
      head.appendChild(el("span", "stat-num", d.correct + " / " + d.seen + " · " + pct + "%"));
      row.appendChild(head);
      var bar = el("div", "stat-bar");
      var fill = el("div", "stat-fill " + (pct < 60 ? "low" : pct < 80 ? "mid" : "high"));
      fill.style.width = pct + "%";
      bar.appendChild(fill);
      row.appendChild(bar);
      box.appendChild(row);
    });
  }
  function renderStats() {
    showScreen("stats");
    var areas = loadJSON(LS_STATS, {});
    var rounds = loadJSON(LS_ROUNDS, {});
    var box = $("#statsTable");
    box.innerHTML = "";
    if (!Object.keys(areas).length) {
      box.appendChild(el("p", "muted", "아직 푼 문항이 없습니다."));
      return;
    }
    // 과목별 — 정답률 오름차순(약점 먼저)
    box.appendChild(el("h3", "stat-group-title", "과목별 정답률 (약점순)"));
    renderBars(box, areas, function (a, b) {
      return (areas[a].correct / areas[a].seen) - (areas[b].correct / areas[b].seen);
    });
    // 회차별 추이 — 회차 번호 오름차순
    if (Object.keys(rounds).length) {
      box.appendChild(el("h3", "stat-group-title", "회차별 추이"));
      renderBars(box, rounds, function (a, b) { return roundNum(a) - roundNum(b); });
    }
    // 전체 합계
    var tSeen = 0, tCorrect = 0;
    Object.keys(areas).forEach(function (a) { tSeen += areas[a].seen; tCorrect += areas[a].correct; });
    var tPct = Math.round(tCorrect / tSeen * 100);
    box.appendChild(el("p", "stat-total", "전체  " + tCorrect + " / " + tSeen + " · " + tPct + "%"));
  }

  // ---------- 오답노트 CSV 내보내기 ----------
  function csvCell(v) {
    v = String(v == null ? "" : v);
    return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function exportWrongCSV() {
    var ids = loadJSON(LS_WRONG, []);
    var items = BANK.filter(function (q) { return ids.indexOf(q.id) !== -1; });
    if (!items.length) { alert("내보낼 오답이 없습니다."); return; }
    var rows = [["과목", "회차", "문제", "보기1", "보기2", "보기3", "보기4", "보기5", "정답", "해설", "핵심"]];
    items.forEach(function (q) {
      var o = (q.options || []).slice();
      while (o.length < 5) o.push("");
      rows.push([q.area, q.source, q.q, o[0], o[1], o[2], o[3], o[4],
        "①②③④⑤".charAt((q.answer || 0) - 1) || "", q.reason, q.keyword]);
    });
    var csv = rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
    // BOM(﻿) → Excel 한글 깨짐 방지
    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "오답노트_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // 오답노트 단독 보기
  function viewWrongNote() {
    var ids = loadJSON(LS_WRONG, []);
    var items = BANK.filter(function (q) { return ids.indexOf(q.id) !== -1; });
    showScreen("result");
    $("#scoreBig").textContent = items.length + "문항";
    $("#scoreText").textContent = "오답노트";
    renderReview(items.map(function (q) { return { q: q, picked: null }; }));
  }

  // ---------- 화면 전환 ----------
  function showScreen(name) {
    ["home", "quiz", "result", "stats"].forEach(function (s) {
      $("#" + s).classList.toggle("hidden", s !== name);
    });
    window.scrollTo(0, 0);
  }

  // ---------- 초기화 ----------
  function init() {
    if (!BANK.length) {
      $("#bankInfo").textContent = "문제 은행이 비어 있습니다. data/bank.js 를 확인하세요.";
    }
    $("#startBtn").addEventListener("click", startQuiz);
    $("#nextBtn").addEventListener("click", nextQuestion);
    $("#prevBtn").addEventListener("click", prevQuestion);
    $("#homeBtn").addEventListener("click", renderHome);
    $("#reviewBtn").addEventListener("click", function () {
      $("#reviewList").scrollIntoView({ behavior: "smooth" });
    });
    $("#viewWrongBtn").addEventListener("click", viewWrongNote);
    $("#exportWrongBtn").addEventListener("click", exportWrongCSV);
    $("#viewStatsBtn").addEventListener("click", renderStats);
    $("#statsHomeBtn").addEventListener("click", renderHome);
    $("#resetBtn").addEventListener("click", function () {
      if (confirm("진행상황·오답노트·통계를 모두 초기화할까요?")) {
        localStorage.removeItem(LS_WRONG);
        localStorage.removeItem(LS_STATE);
        localStorage.removeItem(LS_STATS);
        localStorage.removeItem(LS_ROUNDS);
        renderHome();
      }
    });

    // 진행 중 세션 복원
    var saved = loadJSON(LS_STATE, null);
    if (saved && saved.items && saved.items.length) {
      if (confirm("이전에 풀던 문제가 있습니다. 이어서 풀까요?")) {
        session = saved;
        renderQuestion();
        return;
      }
      localStorage.removeItem(LS_STATE);
    }
    renderHome();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
