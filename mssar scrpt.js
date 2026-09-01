/* ============ بيانات الجامعات ============ */
const UNIVERSITIES = {
  ksu:   { name: "جامعة الملك سعود",              scaleMax: 5.0, grades: { "A+": 5.0, "A": 4.75, "B+": 4.5, "B": 4.0, "C+": 3.5, "C": 3.0, "D+": 2.5, "D": 2.0, "F": 1.0 } },
  kau:   { name: "جامعة الملك عبدالعزيز",          scaleMax: 5.0, grades: { "A+": 5.0, "A": 4.75, "B+": 4.5, "B": 4.0, "C+": 3.5, "C": 3.0, "D+": 2.5, "D": 2.0, "F": 1.0 } },
  kfupm: { name: "جامعة الملك فهد للبترول والمعادن", scaleMax: 4.0, grades: { "A+": 4.0, "A": 3.75, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0 } },
  pnu:   { name: "جامعة الأميرة نورة",             scaleMax: 5.0, grades: { "A+": 5.0, "A": 4.75, "B+": 4.5, "B": 4.0, "C+": 3.5, "C": 3.0, "D+": 2.5, "D": 2.0, "F": 1.0 } }
};
const UNI_STORAGE_KEY = "masar_university";

function getSelectedUniversity() {
  return localStorage.getItem(UNI_STORAGE_KEY) || "ksu";
}
function setSelectedUniversity(id) {
  localStorage.setItem(UNI_STORAGE_KEY, id);
}

/* ============ اختيار الجامعة (الصفحة الرئيسية) ============ */
const homeUniSelectEl = document.getElementById("homeUniSelect");
if (homeUniSelectEl) {
  homeUniSelectEl.value = getSelectedUniversity();
  homeUniSelectEl.addEventListener("change", () => {
    setSelectedUniversity(homeUniSelectEl.value);
  });
}

/* ============ حاسبة المعدل ============ */
let GRADE_POINTS = UNIVERSITIES[getSelectedUniversity()].grades;

const courseListEl = document.getElementById("courseList");
const uniSelectEl = document.getElementById("uniSelect");

function addCourseRow(name = "", hours = "", grade = "A+") {
  const row = document.createElement("div");
  row.className = "course-row";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "c-name";
  nameInput.placeholder = "اسم المادة";
  nameInput.value = name;

  const hoursInput = document.createElement("input");
  hoursInput.type = "number";
  hoursInput.className = "c-hours";
  hoursInput.placeholder = "ساعات";
  hoursInput.min = "0";
  hoursInput.step = "1";
  hoursInput.value = hours;

  const select = document.createElement("select");
  select.className = "c-grade";
  Object.keys(GRADE_POINTS).forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    option.selected = g === grade;
    select.appendChild(option);
  });

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-btn";
  remove.title = "حذف";
  remove.setAttribute("aria-label", "حذف المادة");
  remove.textContent = "×";
  remove.addEventListener("click", () => row.remove());

  row.append(nameInput, hoursInput, select, remove);
  courseListEl.appendChild(row);
}

if (courseListEl) {
  if (uniSelectEl) {
    uniSelectEl.value = getSelectedUniversity();
    applyUniversityToGpaPage(uniSelectEl.value);
    uniSelectEl.addEventListener("change", () => {
      setSelectedUniversity(uniSelectEl.value);
      applyUniversityToGpaPage(uniSelectEl.value);
    });
  }

  addCourseRow();
  addCourseRow();
  document.getElementById("addCourse").addEventListener("click", () => addCourseRow());

  const prevGpaInputEl = document.getElementById("prevGpa");
  if (prevGpaInputEl) {
    prevGpaInputEl.addEventListener("change", () => {
      const uni = UNIVERSITIES[getSelectedUniversity()];
      const val = parseFloat(prevGpaInputEl.value);
      if (!isNaN(val) && val > uni.scaleMax) prevGpaInputEl.value = uni.scaleMax;
    });
  }

  document.getElementById("calcBtn").addEventListener("click", () => {
    const prevHours = parseFloat(document.getElementById("prevHours").value) || 0;
    const currentUni = UNIVERSITIES[getSelectedUniversity()];
    let prevGpa = parseFloat(document.getElementById("prevGpa").value) || 0;
    if (prevGpa > currentUni.scaleMax) {
      prevGpa = currentUni.scaleMax;
      document.getElementById("prevGpa").value = currentUni.scaleMax;
    }

    let semHours = 0;
    let semPoints = 0;

    document.querySelectorAll(".course-row").forEach(row => {
      const hours = parseFloat(row.querySelector(".c-hours").value) || 0;
      const grade = row.querySelector(".c-grade").value;
      if (hours > 0) {
        semHours += hours;
        semPoints += hours * GRADE_POINTS[grade];
      }
    });

    const semGpa = semHours > 0 ? (semPoints / semHours) : 0;
    const totalHours = prevHours + semHours;
    const totalPoints = (prevHours * prevGpa) + semPoints;
    const cumGpa = totalHours > 0 ? (totalPoints / totalHours) : 0;

    document.getElementById("semGpa").textContent = semHours > 0 ? semGpa.toFixed(2) : "—";
    document.getElementById("cumGpa").textContent = totalHours > 0 ? cumGpa.toFixed(2) : "—";
    document.getElementById("totalHours").textContent = totalHours > 0 ? totalHours : "—";
  });
}

function applyUniversityToGpaPage(uniId) {
  const uni = UNIVERSITIES[uniId];
  GRADE_POINTS = uni.grades;

  const prevGpaInput = document.getElementById("prevGpa");
  const prevGpaLabel = document.getElementById("prevGpaLabel");
  if (prevGpaInput) {
    prevGpaInput.max = uni.scaleMax;
    prevGpaInput.placeholder = uni.scaleMax === 4.0 ? "مثال: 3.20" : "مثال: 4.20";
    // لو القيمة الحالية تتجاوز سلّم الجامعة الجديدة، صححها فورًا
    const currentVal = parseFloat(prevGpaInput.value);
    if (!isNaN(currentVal) && currentVal > uni.scaleMax) {
      prevGpaInput.value = uni.scaleMax;
    }
  }
  if (prevGpaLabel) prevGpaLabel.textContent = `معدلك التراكمي السابق (من ${uni.scaleMax.toFixed(1)})`;

  document.querySelectorAll(".course-row").forEach(row => {
    const select = row.querySelector(".c-grade");
    const current = select.value;
    select.innerHTML = Object.keys(GRADE_POINTS).map(g => `<option value="${g}" ${g === current ? "selected" : ""}>${g}</option>`).join("");
  });

  document.getElementById("semGpa").textContent = "—";
  document.getElementById("cumGpa").textContent = "—";
  document.getElementById("totalHours").textContent = "—";
}


/* ============ حاسبة الغياب ============ */
/* عدد الأسابيع: مؤكد 15 أسبوعًا لكل الجامعات الأربع (لا تدخل ضمنها فترتا التسجيل والاختبارات النهائية)
   استنادًا لـ"لائحة الدراسة والاختبارات للمرحلة الجامعية" الموحّدة، ولوائح كل جامعة:
   - KSU: مادة (2) من التعريفات — "الفصل الدراسي: مدة لا تقل عن خمسة عشر أسبوعًا"
   - KAU: القواعد التنفيذية للائحة — نفس التعريف والمدة (15 أسبوعًا)
   - KFUPM: صفحة "الدراسة بالجامعة" — "فصل أول وثاني ويحدد كل فصل بمدة خمسة عشر أسبوعًا"
   - PNU: لائحة الدراسة والاختبارات للمرحلة الجامعية — نفس التعريف الموحّد (15 أسبوعًا) */
const ABSENCE_POLICY = {
  ksu:   { ratio: 0.25, ratioConfirmed: true,  weeks: 15, weeksConfirmed: true },
  kau:   { ratio: 0.25, ratioConfirmed: true,  weeks: 15, weeksConfirmed: true },
  pnu:   { ratio: 0.25, ratioConfirmed: true,  weeks: 15, weeksConfirmed: true },
  kfupm: { ratio: 0.25, ratioConfirmed: false, weeks: 15, weeksConfirmed: true, link: "https://ses.kfupm.edu.sa" }
};

const calcAbsenceBtn = document.getElementById("calcAbsence");
if (calcAbsenceBtn) {
  const absenceUniSelectEl = document.getElementById("absenceUniSelect");
  const absenceNoticeEl = document.getElementById("absenceNotice");

  function updateAbsenceNotice() {
    const uniId = getSelectedUniversity();
    const policy = ABSENCE_POLICY[uniId];
    if (!policy.ratioConfirmed) {
      absenceNoticeEl.style.display = "block";
      absenceNoticeEl.innerHTML = `ما لقينا نسبة رسمية مؤكدة 100% لـ${UNIVERSITIES[uniId].name}. الحاسبة تستخدم 25% كتقدير مبدئي (السياسة الشائعة بالجامعات السعودية) — راجع <a href="${policy.link}" target="_blank" rel="noopener" style="color:var(--accent-ink);text-decoration:underline;">لائحة الجامعة الرسمية</a> للتأكد قبل ما تعتمد عليها.`;
    } else {
      absenceNoticeEl.style.display = "none";
    }
  }

  if (absenceUniSelectEl) {
    absenceUniSelectEl.value = getSelectedUniversity();
    updateAbsenceNotice();
    absenceUniSelectEl.addEventListener("change", () => {
      setSelectedUniversity(absenceUniSelectEl.value);
      updateAbsenceNotice();
    });
  }

  calcAbsenceBtn.addEventListener("click", () => {
    const policy = ABSENCE_POLICY[getSelectedUniversity()];
    const ALLOWED_RATIO = policy.ratio;
    const weeklyHours = parseFloat(document.getElementById("weeklyHours").value) || 0;
    const absentHours = parseFloat(document.getElementById("absentHours").value) || 0;

    const totalCourseHours = weeklyHours * policy.weeks;
    const allowedHours = totalCourseHours * ALLOWED_RATIO;
    const remaining = allowedHours - absentHours;
    const percent = totalCourseHours > 0 ? (absentHours / totalCourseHours) * 100 : 0;

    document.getElementById("totalCourseHours").textContent = totalCourseHours > 0 ? totalCourseHours.toFixed(1) : "—";
    document.getElementById("absencePercent").textContent = totalCourseHours > 0 ? percent.toFixed(1) + "%" : "—";
    document.getElementById("remainHours").textContent = totalCourseHours > 0 ? remaining.toFixed(1) : "—";

    const remainBox = document.getElementById("remainBox");
    const barFill = document.getElementById("barFill");
    const barCaption = document.getElementById("barCaption");

    remainBox.classList.remove("ok", "warn");

    if (totalCourseHours > 0) {
      const barPercent = Math.min(100, (absentHours / allowedHours) * 100);
      barFill.style.width = barPercent + "%";

      if (remaining < 0) {
        remainBox.classList.add("warn");
        barFill.classList.add("danger");
        barCaption.textContent = "تجاوزت النسبة المسموحة، راجع القبول والتسجيل.";
      } else {
        remainBox.classList.add("ok");
        barFill.classList.remove("danger");
        barCaption.textContent = `متبقٍّ لك ${remaining.toFixed(1)} ساعة قبل الوصول للحد المسموح (${allowedHours.toFixed(1)} ساعة).`;
      }
    }
  });
}

/* ============ التقويم ============ */
const calGrid = document.getElementById("calGrid");
if (calGrid) {
  const DOW = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
  const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const STORAGE_KEY = "masar_calendar_events";

  /* التقويم الجامعي الرسمي لكل جامعة — العام الجامعي 2026-2027م
     المصادر: dar.ksu.edu.sa (KSU) — ملف PDF رسمي من عمادة القبول والتسجيل (KAU)
     ملف PDF رسمي من عمادة القبول والتسجيل (KFUPM) — pnu.edu.sa/ar/AcademicCalendar (PNU) */
  const OFFICIAL_EVENTS = {
    ksu: {
      "2026-08-23": [{ title: "بداية الدراسة — الفصل الأول" }],
      "2026-09-23": [{ title: "بداية إجازة اليوم الوطني" }],
      "2026-09-27": [{ title: "بداية الدراسة بعد إجازة اليوم الوطني" }],
      "2026-11-22": [{ title: "بداية إجازة الخريف" }],
      "2026-11-29": [{ title: "بداية الدراسة بعد إجازة الخريف" }],
      "2026-12-06": [{ title: "أسبوع التعزيز الأكاديمي" }],
      "2026-12-13": [{ title: "بداية الاختبارات النهائية — الفصل الأول" }],
      "2026-12-26": [{ title: "نهاية الاختبارات النهائية — الفصل الأول" }],
      "2026-12-27": [{ title: "بداية إجازة منتصف العام" }],
      "2027-01-10": [{ title: "بداية الدراسة — الفصل الثاني" }],
      "2027-02-14": [{ title: "بداية إجازة عيد الفطر المبارك" }],
      "2027-03-14": [{ title: "بداية الدراسة بعد إجازة عيد الفطر" }],
      "2027-05-09": [{ title: "بداية إجازة عيد الأضحى المبارك" }],
      "2027-05-23": [{ title: "بداية الدراسة بعد إجازة عيد الأضحى" }],
      "2027-05-30": [{ title: "أسبوع التعزيز الأكاديمي" }],
      "2027-06-06": [{ title: "بداية الاختبارات النهائية — الفصل الثاني" }],
      "2027-06-19": [{ title: "نهاية الاختبارات النهائية — الفصل الثاني" }],
      "2027-06-20": [{ title: "بداية إجازة نهاية العام الدراسي" }],
      "2027-06-22": [{ title: "بداية الدراسة — الفصل الصيفي" }],
      "2027-08-10": [{ title: "بداية الاختبارات النهائية — الفصل الصيفي" }],
      "2027-08-12": [{ title: "نهاية الاختبارات النهائية — الفصل الصيفي" }],
      "2027-08-29": [{ title: "بداية الدراسة للعام الجامعي 2027-2028" }]
    },
    kau: {
      "2026-08-30": [{ title: "بداية الدراسة — الفصل الأول" }],
      "2026-09-23": [{ title: "إجازة اليوم الوطني" }],
      "2026-10-12": [{ title: "بداية اختبارات الدوري الأول" }],
      "2026-11-08": [{ title: "بداية اختبارات الدوري الثاني" }],
      "2026-11-22": [{ title: "بداية إجازة الخريف" }],
      "2026-11-29": [{ title: "بداية الدراسة بعد إجازة الخريف" }],
      "2026-12-20": [{ title: "بداية الاختبارات النهائية — الفصل الأول" }],
      "2027-01-07": [{ title: "نهاية الفصل الدراسي الأول" }],
      "2027-01-17": [{ title: "بداية الدراسة — الفصل الثاني" }]
    },
    kfupm: {
      "2026-08-19": [{ title: "بداية الدراسة — الفصل الأول" }],
      "2026-09-23": [{ title: "بداية إجازة اليوم الوطني" }],
      "2026-10-20": [{ title: "بداية إجازة منتصف الفصل" }],
      "2026-10-25": [{ title: "استئناف الدراسة بعد إجازة منتصف الفصل" }],
      "2026-11-22": [{ title: "بداية إجازة الخريف" }],
      "2026-12-10": [{ title: "آخر يوم دراسي بالفصل الأول" }],
      "2026-12-13": [{ title: "بداية الاختبارات النهائية — الفصل الأول" }],
      "2026-12-24": [{ title: "نهاية الاختبارات النهائية — الفصل الأول" }],
      "2026-12-26": [{ title: "حفل التخرج الرسمي" }],
      "2027-01-10": [{ title: "بداية التسجيل للفصل الثاني" }]
    },
    pnu: {
      "2026-08-23": [{ title: "بداية الدراسة — الفصل الأول" }],
      "2026-09-23": [{ title: "إجازة اليوم الوطني" }],
      "2026-11-19": [{ title: "بداية إجازة الخريف" }],
      "2026-11-29": [{ title: "بداية الدراسة بعد إجازة الخريف" }],
      "2026-12-13": [{ title: "بداية الاختبارات النهائية — الفصل الأول" }],
      "2027-01-07": [{ title: "بداية إجازة منتصف العام الدراسي" }],
      "2027-01-17": [{ title: "بداية الدراسة — الفصل الثاني" }],
      "2027-02-21": [{ title: "إجازة يوم التأسيس" }],
      "2027-02-25": [{ title: "بداية إجازة عيد الفطر المبارك" }],
      "2027-03-14": [{ title: "بداية الدراسة بعد إجازة عيد الفطر" }],
      "2027-05-06": [{ title: "بداية إجازة عيد الأضحى المبارك" }],
      "2027-05-23": [{ title: "بداية الدراسة بعد إجازة عيد الأضحى" }],
      "2027-05-30": [{ title: "بداية الاختبارات النهائية — الفصل الثاني" }],
      "2027-06-17": [{ title: "بداية إجازة نهاية العام الدراسي" }],
      "2027-06-27": [{ title: "بداية الدراسة — الفصل الصيفي" }],
      "2027-08-16": [{ title: "بداية الاختبارات النهائية — الفصل الصيفي" }],
      "2027-08-22": [{ title: "بداية العام الدراسي 1449هـ" }]
    }
  };

  const OFFICIAL_LINKS = {
    ksu: "https://dar.ksu.edu.sa/ar/current",
    kau: "https://kau.edu.sa/ar/page/detailed-calendar",
    kfupm: "https://registrar.kfupm.edu.sa",
    pnu: "https://pnu.edu.sa/ar/AcademicCalendar/Pages/default.aspx"
  };

  const calUniSelectEl = document.getElementById("calUniSelect");
  const calNoticeEl = document.getElementById("calNotice");

  function getUniEvents() {
    return OFFICIAL_EVENTS[getSelectedUniversity()] || {};
  }

  function updateCalNotice() {
    const uniId = getSelectedUniversity();
    const uniEvents = OFFICIAL_EVENTS[uniId] || {};
    if (Object.keys(uniEvents).length === 0) {
      calNoticeEl.style.display = "block";
      calNoticeEl.innerHTML = `التقويم التفصيلي لـ${UNIVERSITIES[uniId].name} قيد الإضافة حاليًا. بإمكانك إضافة مواعيدك بنفسك أدناه، أو مراجعة <a href="${OFFICIAL_LINKS[uniId]}" target="_blank" rel="noopener" style="color:var(--accent-ink);text-decoration:underline;">التقويم الرسمي</a> مباشرة.`;
    } else {
      calNoticeEl.style.display = "none";
    }
  }

  if (calUniSelectEl) {
    calUniSelectEl.value = getSelectedUniversity();
    updateCalNotice();
    calUniSelectEl.addEventListener("change", () => {
      setSelectedUniversity(calUniSelectEl.value);
      updateCalNotice();
      renderCalendar();
      selectedDate = null;
      document.getElementById("selectedDateLabel").textContent = "اختر يومًا من التقويم";
      document.getElementById("eventForm").style.display = "none";
      document.getElementById("eventList").innerHTML = "";
    });
  }

  let today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;

  function loadEvents() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }
  function dateKey(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  function getDayEvents(key) {
    const official = (getUniEvents()[key] || []).map(e => ({ ...e, official: true }));
    const personal = (loadEvents()[key] || []).map(e => ({ ...e, official: false }));
    return official.concat(personal);
  }

  function renderCalendar() {
    document.getElementById("monthLabel").textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    calGrid.innerHTML = "";

    DOW.forEach(d => {
      const el = document.createElement("div");
      el.className = "cal-dow";
      el.textContent = d;
      calGrid.appendChild(el);
    });

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "cal-day empty";
      calGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "cal-day";
      const key = dateKey(viewYear, viewMonth, d);

      const isToday = (viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate());
      if (isToday) cell.classList.add("today");

      const dayEvents = getDayEvents(key);
      const hasOfficial = !!getUniEvents()[key];
      const hasPersonal = dayEvents.some(e => !e.official);
      if (hasOfficial) cell.classList.add("official");

      cell.innerHTML = `<span>${d}</span>`;
      if (hasPersonal) {
        const dot = document.createElement("span");
        dot.className = "dot";
        cell.appendChild(dot);
      }

      cell.addEventListener("click", () => selectDate(viewYear, viewMonth, d));
      calGrid.appendChild(cell);
    }
  }

  function selectDate(y, m, d) {
    selectedDate = dateKey(y, m, d);
    const label = document.getElementById("selectedDateLabel");
    label.textContent = `${d} ${MONTHS[m]} ${y}`;

    document.getElementById("eventForm").style.display = "grid";
    renderEventList();
  }

  function renderEventList() {
    const listEl = document.getElementById("eventList");
    listEl.innerHTML = "";
    if (!selectedDate) return;

    const items = getDayEvents(selectedDate);

    if (items.length === 0) {
      listEl.innerHTML = `<div class="event-empty">لا توجد مواعيد لهذا اليوم بعد.</div>`;
      return;
    }

    items.forEach((ev, idx) => {
      const item = document.createElement("div");
      item.className = "event-item";
      item.innerHTML = `
        <span class="event-dot"></span>
        <div style="flex:1">
          <div class="etitle">${ev.title}${ev.official ? ' <span style="color:var(--muted);font-weight:400;font-size:12px;">— التقويم الجامعي</span>' : ""}</div>
          ${ev.note ? `<div class="enote">${ev.note}</div>` : ""}
        </div>
        ${ev.official ? "" : '<button type="button" class="remove-btn" title="حذف">×</button>'}
      `;
      if (!ev.official) {
        item.querySelector(".remove-btn").addEventListener("click", () => {
          const events = loadEvents();
          const personalIdx = idx - (getUniEvents()[selectedDate] || []).length;
          events[selectedDate].splice(personalIdx, 1);
          if (events[selectedDate].length === 0) delete events[selectedDate];
          saveEvents(events);
          renderEventList();
          renderCalendar();
        });
      }
      listEl.appendChild(item);
    });
  }

  document.getElementById("addEvent").addEventListener("click", () => {
    if (!selectedDate) return;
    const titleEl = document.getElementById("eventTitle");
    const noteEl = document.getElementById("eventNote");
    const title = titleEl.value.trim();
    if (!title) return;

    const events = loadEvents();
    if (!events[selectedDate]) events[selectedDate] = [];
    events[selectedDate].push({ title, note: noteEl.value.trim() });
    saveEvents(events);

    titleEl.value = "";
    noteEl.value = "";
    renderEventList();
    renderCalendar();
  });

  document.getElementById("prevMonth").addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  document.getElementById("nextMonth").addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();
}
