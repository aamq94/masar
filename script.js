/* ============ حاسبة المعدل ============ */
const GRADE_POINTS = {
  "A+": 5.0, "A": 4.75, "B+": 4.5, "B": 4.0,
  "C+": 3.5, "C": 3.0, "D+": 2.5, "D": 2.0, "F": 1.0
};

const courseListEl = document.getElementById("courseList");

function addCourseRow(name = "", hours = "", grade = "A+") {
  const row = document.createElement("div");
  row.className = "course-row";
  row.innerHTML = `
    <input type="text" class="c-name" placeholder="اسم المادة" value="${name}">
    <input type="number" class="c-hours" placeholder="ساعات" min="0" step="1" value="${hours}">
    <select class="c-grade">
      ${Object.keys(GRADE_POINTS).map(g => `<option value="${g}" ${g === grade ? "selected" : ""}>${g}</option>`).join("")}
    </select>
    <button type="button" class="remove-btn" title="حذف">×</button>
  `;
  row.querySelector(".remove-btn").addEventListener("click", () => row.remove());
  courseListEl.appendChild(row);
}

if (courseListEl) {
  addCourseRow();
  addCourseRow();
  document.getElementById("addCourse").addEventListener("click", () => addCourseRow());

  document.getElementById("calcBtn").addEventListener("click", () => {
    const prevHours = parseFloat(document.getElementById("prevHours").value) || 0;
    const prevGpa = parseFloat(document.getElementById("prevGpa").value) || 0;

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

/* ============ حاسبة الغياب ============ */
const calcAbsenceBtn = document.getElementById("calcAbsence");
if (calcAbsenceBtn) {
  const WEEKS = 15;
  const ALLOWED_RATIO = 0.25;

  calcAbsenceBtn.addEventListener("click", () => {
    const weeklyHours = parseFloat(document.getElementById("weeklyHours").value) || 0;
    const absentHours = parseFloat(document.getElementById("absentHours").value) || 0;

    const totalCourseHours = weeklyHours * WEEKS;
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

  /* التقويم الجامعي الرسمي — جامعة الملك سعود، العام الجامعي 2026-2027م
     المصدر: dar.ksu.edu.sa/ar/current (آخر تحديث: أغسطس 2026) */
  const KSU_EVENTS = {
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
  };

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
    const official = (KSU_EVENTS[key] || []).map(e => ({ ...e, official: true }));
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

      cell.innerHTML = `<span>${d}</span>`;
      if (getDayEvents(key).length > 0) {
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
          const personalIdx = idx - (KSU_EVENTS[selectedDate] || []).length;
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
