/* =========================
   PAGE LOADER
   ========================= */

window.addEventListener("load", () => {
  const loader = document.getElementById("svsLoader");

  // Hide loader after page is loaded
  setTimeout(() => {
    loader.classList.add("svsHide");
  }, 2000); // 2 sec after load
});

// Safety fallback: never exceed 5 seconds
setTimeout(() => {
  const loader = document.getElementById("svsLoader");
  if (loader) {
    loader.classList.add("svsHide");
  }
}, 5000);

// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll(".hm-hero-slide");
setInterval(() => {
  slides[currentSlide].classList.remove("hm-active");
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add("hm-active");
}, 4000);

// Video Player
document.getElementById("hmplaybtn").addEventListener("click", function () {
  document.getElementById("hmvideoframe").classList.remove("hidden");
  document.getElementById("hmvideoframe").src += "&autoplay=1";
  document.getElementById("hmvideooverlay").classList.add("hidden");
});

const facilities = [
  {
    title: "Friendly Environment",
    icon: `<path d="M12 2v20M2 12h20M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="url(#g1)"/><rect x="7" y="7" width="10" height="10" rx="1" fill="#EDE9FE"/>`,
  },
  {
    title: "Science Labs",
    icon: `<path d="M2 20h20M12 2l-6 18M12 2l6 18" stroke="url(#g1)"/><circle cx="12" cy="2" r="2" fill="#FBBF24"/>`,
  },
  {
    title: "Computer Labs",
    icon: `<rect x="2" y="4" width="20" height="14" rx="2" stroke="url(#g1)"/><path d="M7 22h10M12 18v4" stroke="url(#g1)"/>`,
  },
  {
    title: "Library",
    icon: `<path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14M6 19h12" stroke="url(#g1)"/><path d="M8 8h8M8 12h8" stroke="url(#g1)"/>`,
  },
  {
    title: "Sports Complex",
    icon: `<circle cx="12" cy="12" r="10" stroke="url(#g1)"/><path d="M12 2v20M2 12h20" stroke="url(#g1)"/>`,
  },
  {
    title: "Transportation",
    icon: `<path d="M4 17h16M4 8h16v9H4z" stroke="url(#g1)"/><circle cx="7" cy="20" r="2"/><circle cx="17" cy="20" r="2"/>`,
  },
  {
    title: "Activity Rooms",
    icon: `<path d="M12 2l10 8-10 8-10-8z" stroke="url(#g1)"/><circle cx="12" cy="10" r="3" fill="#EDE9FE"/>`,
  },
  {
    title: "Digital Hub",
    icon: `<path d="M3 3h18v18H3zM3 9h18M9 3v18" stroke="url(#g1)"/>`,
  },
];
const playBtn = document.getElementById("hmplaybtn");
const overlay = document.getElementById("hmvideooverlay");
const iframe = document.getElementById("hmcampusvideo");

playBtn.addEventListener("click", () => {
  iframe.src = "https://www.youtube.com/embed/BNrJSCsTvbg?autoplay=1&rel=0";
  overlay.style.display = "none";
});
const grid = document.getElementById("hmfacgrid");
grid.innerHTML = facilities
  .map(
    (f, i) => `
            <div class="hmfaccard p-8 rounded-3xl group">
                <svg class="hmfac-icon-svg w-12 h-12 mb-8 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="24" y2="24">
                            <stop offset="0%" stop-color="#4C1D95"/>
                            <stop offset="100%" stop-color="#8B5CF6"/>
                        </linearGradient>
                    </defs>
                    ${f.icon}
                </svg>
                <h3 class="text-xl font-semibold mb-2">${f.title}</h3>
                <div class="hmfac-gold-line mb-4"></div>
                <p class="text-slate-500 text-sm leading-relaxed mb-6">Premium environment designed for student growth and success.</p>
                <a href="./facilities.html" class="inline-flex items-center text-sm font-bold text-indigo-900 group-hover:text-amber-500 transition-colors">
                    Learn More <span class="ml-2">→</span>
                </a>
            </div>
        `,
  )
  .join("");

// ========== FIREBASE CONFIG (REPLACE WITH YOUR CREDENTIALS) ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbAIvFLcTsnmewhi-GO9lYMcwhO6hqyTc",
  authDomain: "sneha-vidya-samste.firebaseapp.com",
  projectId: "sneha-vidya-samste",
  storageBucket: "sneha-vidya-samste.firebasestorage.app",
  messagingSenderId: "1004783308147",
  appId: "1:1004783308147:web:2a6908c35c7764df0c4906",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const eventsCollection = collection(db, "events");
const q = query(eventsCollection, orderBy("date", "asc"));

// State
let currentUser = null;
let eventsArray = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDateString = null;

// DOM elements
const monthYearEl = document.getElementById("hmevtmonthyear");
const daysContainer = document.getElementById("hmevtcaldays");
const eventListContainer = document.getElementById("hmevteventlistcontainer");
const adminExtraDiv = document.getElementById("hmevtadminextra");
const floatBtn = document.getElementById("hmevtadminfloatbtn");

// ---------- Realtime Firestore Listener ----------
onSnapshot(q, (snapshot) => {
  eventsArray = [];
  snapshot.forEach((docSnap) => {
    eventsArray.push({ id: docSnap.id, ...docSnap.data() });
  });
  renderCalendar();
  renderEventList();
});

// ---------- Render Calendar ----------
function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  monthYearEl.innerText = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long", year: "numeric" },
  );

  let html = "";
  for (let i = 0; i < 42; i++) {
    let dayNum,
      isCurrentMonth = true;
    let year = currentYear,
      month = currentMonth;
    if (i < startWeekday) {
      dayNum = prevMonthDays - startWeekday + i + 1;
      isCurrentMonth = false;
      month = currentMonth - 1;
      if (month < 0) {
        month = 11;
        year = currentYear - 1;
      }
    } else if (i >= startWeekday + daysInMonth) {
      dayNum = i - (startWeekday + daysInMonth) + 1;
      isCurrentMonth = false;
      month = currentMonth + 1;
      if (month > 11) {
        month = 0;
        year = currentYear + 1;
      }
    } else {
      dayNum = i - startWeekday + 1;
    }
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const hasEvent = eventsArray.some((ev) => ev.date === dateStr);
    const isToday = (() => {
      const today = new Date();
      return (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === dayNum
      );
    })();
    const isSelected = selectedDateString === dateStr;
    let className = "hmevtday";
    if (!isCurrentMonth) className += " hmevtothermonth";
    if (isToday) className += " hmevtcurrent";
    if (hasEvent && isCurrentMonth && !isToday) className += " hmevteventdate";
    if (isSelected) className += " hmevtselected";
    html += `<div class="${className}" data-date="${dateStr}">
                        <span>${dayNum}</span>
                        ${hasEvent && isCurrentMonth ? '<span class="hmevtdaydot"></span>' : ""}
                    </div>`;
  }
  daysContainer.innerHTML = html;
  document.querySelectorAll(".hmevtday").forEach((el) => {
    el.addEventListener("click", () => {
      selectedDateString = el.getAttribute("data-date");
      renderCalendar();
      renderEventList();
    });
  });
}

// ---------- Render Event List (right panel) ----------
function renderEventList() {
  let filtered = [...eventsArray];
  if (selectedDateString) {
    filtered = filtered.filter((ev) => ev.date === selectedDateString);
  } else {
    filtered = filtered.filter((ev) => {
      const [y, m] = ev.date.split("-");
      return parseInt(y) === currentYear && parseInt(m) - 1 === currentMonth;
    });
  }
  filtered.sort((a, b) => a.date.localeCompare(b.date));
  if (filtered.length === 0) {
    eventListContainer.innerHTML = `<div class="hmevtempty">✨ No events for this period</div>`;
    return;
  }
  eventListContainer.innerHTML = filtered
    .map((ev) => {
      const d = new Date(ev.date);
      const day = d.getDate();
      const monthShort = d.toLocaleString("default", { month: "short" });
      const isAdmin = !!currentUser;
      return `
                <div class="hmevteventcard" data-id="${ev.id}">
                    <div class="hmevtcardtop">
                        <div class="hmevtdatebox"><div class="hmevtdaynum">${day}</div><div class="hmevtmonthname">${monthShort}</div></div>
                        <div class="hmevtcatbadge">${ev.category || "General"}</div>
                    </div>
                    <div class="hmevttitle">${escapeHtml(ev.title) || "Untitled"}</div>
                    <div class="hmevtdesc">${escapeHtml(ev.description) || "No description"}</div>
                    <div class="hmevtmetainfo"><span>🕒 ${ev.time || "TBD"}</span><span>📍 ${ev.location || "Campus"}</span></div>
                    ${
                      isAdmin
                        ? `<div class="hmevtadminactions">
                        <button class="hmevtadminicon edit-event" data-id="${ev.id}">✏️ Edit</button>
                        <button class="hmevtadminicon delete-event" data-id="${ev.id}">🗑️ Delete</button>
                    </div>`
                        : ""
                    }
                </div>
            `;
    })
    .join("");
  // Attach edit/delete handlers if admin
  if (currentUser) {
    document.querySelectorAll(".edit-event").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = btn.getAttribute("data-id");
        openEditModal(id);
      });
    });
    document.querySelectorAll(".delete-event").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = btn.getAttribute("data-id");
        if (confirm("⚠️ Delete this event permanently?")) {
          await deleteDoc(doc(db, "events", id));
        }
      });
    });
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

// ---------- Admin UI & Auth ----------
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    floatBtn.classList.add("adminactive");
    floatBtn.innerHTML = "🛡️";
    adminExtraDiv.innerHTML = `<button class="hmevtaddbtn" id="hmevtglobaladdbtn">➕ Add Event</button>`;
    document
      .getElementById("hmevtglobaladdbtn")
      ?.addEventListener("click", () => openAddModal());
  } else {
    floatBtn.classList.remove("adminactive");
    floatBtn.innerHTML = "🔒";
    adminExtraDiv.innerHTML = "";
  }
  renderEventList(); // refresh admin action buttons
  renderCalendar(); // refresh highlights (no change needed but safe)
});

// Login / Logout
floatBtn.addEventListener("click", () => {
  if (currentUser) {
    signOut(auth);
  } else {
    document.getElementById("hmevtloginmodal").style.display = "flex";
  }
});
document
  .getElementById("hmevtcloselogin")
  .addEventListener(
    "click",
    () => (document.getElementById("hmevtloginmodal").style.display = "none"),
  );
document.getElementById("hmevtloginbtn").addEventListener("click", async () => {
  const email = document.getElementById("hmevtloginemail").value;
  const pwd = document.getElementById("hmevtloginpass").value;
  try {
    await signInWithEmailAndPassword(auth, email, pwd);
    document.getElementById("hmevtloginmodal").style.display = "none";
    document.getElementById("hmevtloginerror").innerText = "";
  } catch (err) {
    document.getElementById("hmevtloginerror").innerText =
      "Invalid credentials";
  }
});

// ---------- ADD EVENT (FIXED) ----------
function openAddModal() {
  document.getElementById("hmevtaddmodal").style.display = "flex";
  // Clear fields
  document.getElementById("hmevteventtitle").value = "";
  document.getElementById("hmevteventdesc").value = "";
  document.getElementById("hmevteventdate").value = "";
  document.getElementById("hmevteventtime").value = "";
  document.getElementById("hmevteventlocation").value = "";
  document.getElementById("hmevteventcategory").value = "";
}

async function saveNewEvent() {
  if (!currentUser) {
    alert("You must be logged in as admin to add events.");
    return;
  }
  const title = document.getElementById("hmevteventtitle").value.trim();
  const date = document.getElementById("hmevteventdate").value;
  if (!title || !date) {
    alert("Event Title and Date are required.");
    return;
  }

  try {
    await addDoc(eventsCollection, {
      title,
      description: document.getElementById("hmevteventdesc").value.trim(),
      date,
      time: document.getElementById("hmevteventtime").value,
      location: document.getElementById("hmevteventlocation").value.trim(),
      category: document.getElementById("hmevteventcategory").value.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    document.getElementById("hmevtaddmodal").style.display = "none";
  } catch (error) {
    console.error("🔥 Firestore Error:", error); // ← THIS WILL SHOW THE REAL REASON
    alert("Failed to save event. Check console (F12) for details.");
  }
}

document
  .getElementById("hmevtsaveevent")
  .addEventListener("click", saveNewEvent);
document
  .getElementById("hmevtcloseadd")
  .addEventListener(
    "click",
    () => (document.getElementById("hmevtaddmodal").style.display = "none"),
  );

// ---------- Edit Event ----------
function openEditModal(id) {
  const ev = eventsArray.find((e) => e.id === id);
  if (!ev) return;
  document.getElementById("hmevtedittitle").value = ev.title || "";
  document.getElementById("hmevteditdesc").value = ev.description || "";
  document.getElementById("hmevteditdate").value = ev.date || "";
  document.getElementById("hmevtedittime").value = ev.time || "";
  document.getElementById("hmevteditlocation").value = ev.location || "";
  document.getElementById("hmevteditcategory").value = ev.category || "";
  document.getElementById("hmevteditid").value = id;
  document.getElementById("hmevteditmodal").style.display = "flex";
}

document
  .getElementById("hmevtupdateevent")
  .addEventListener("click", async () => {
    if (!currentUser) return;
    const id = document.getElementById("hmevteditid").value;
    const updatedData = {
      title: document.getElementById("hmevtedittitle").value,
      description: document.getElementById("hmevteditdesc").value,
      date: document.getElementById("hmevteditdate").value,
      time: document.getElementById("hmevtedittime").value,
      location: document.getElementById("hmevteditlocation").value,
      category: document.getElementById("hmevteditcategory").value,
      updatedAt: serverTimestamp(),
    };
    if (!updatedData.date) return alert("Date is required");
    await updateDoc(doc(db, "events", id), updatedData);
    document.getElementById("hmevteditmodal").style.display = "none";
  });
document
  .getElementById("hmevtcloseedit")
  .addEventListener(
    "click",
    () => (document.getElementById("hmevteditmodal").style.display = "none"),
  );

// Month navigation
document.getElementById("hmevtprevmonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  selectedDateString = null;
  renderCalendar();
  renderEventList();
});
document.getElementById("hmevtnextmonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  selectedDateString = null;
  renderCalendar();
  renderEventList();
});

// Close modals on backdrop click
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("hmevtmodal"))
    e.target.style.display = "none";
});

// Initial render
renderCalendar();
renderEventList();

// Parents Review Data
const reviews = [
  {
    name: "Rajesh Kumar",
    grade: "Grade 8",
    review:
      "The school provides an excellent learning environment with caring teachers and outstanding facilities.",
  },
  {
    name: "Priya Sharma",
    grade: "Grade 5",
    review:
      "My daughter has grown so much in confidence and academic interest. Exceptional guidance.",
  },
  {
    name: "Amit Patel",
    grade: "Grade 9",
    review:
      "A perfect blend of technology-driven curriculum and traditional values. Very satisfied.",
  },
  {
    name: "Sunita Reddy",
    grade: "Grade 4",
    review:
      "The staff is incredibly attentive and the infrastructure is truly top-tier.",
  },
  {
    name: "Vikram Singh",
    grade: "Grade 10",
    review:
      "The best choice we made for our son's future. The environment is safe and truly inspiring.",
  },
  {
    name: "Ananya Rao",
    grade: "Grade 6",
    review:
      "Highly recommended for any parent seeking a modern, holistic educational experience.",
  },
];

// Partners Data
const partners = [
  {
    name: "Google Education",
    desc: "Cloud-based learning and collaboration tools.",
  },
  {
    name: "Microsoft Education",
    desc: "Digital classroom solutions and skill training.",
  },
  {
    name: "Cisco Networking",
    desc: "Advanced network academy and IT certification.",
  },
  {
    name: "Intel Education",
    desc: "Innovative hardware for advanced learning.",
  },
  {
    name: "Adobe Education",
    desc: "Creative cloud platforms for digital arts.",
  },
  {
    name: "AWS Educate",
    desc: "Cloud computing and professional development.",
  },
];

// Populate Sliders
function setupSlider(containerId, items, templateFn, repeat = 2) {
  const container = document.getElementById(containerId);
  let html = "";
  for (let i = 0; i < repeat; i++) {
    items.forEach((item) => {
      html += templateFn(item);
    });
  }
  container.innerHTML = html;
}

setupSlider(
  "hmreviewslider",
  reviews,
  (item) => `
            <div class="hmreviewcard">
                <div class="hmreviewmeta">
                    <img src="https://placehold.co/100x100/4C1D95/white?text=P" class="hmreviewphoto" alt="Parent">
                    <div>
                        <h4 style="font-weight:700;">${item.name}</h4>
                        <p style="font-size:0.8rem; color:var(--hmprimary);">${item.grade}</p>
                    </div>
                </div>
                <div class="hmstars">★★★★★</div>
                <div class="hmquote">"</div>
                <p class="hmreviewtext">${item.review}</p>
            </div>
        `,
);

setupSlider(
  "hmtechslider",
  partners,
  (item) => `
            <div class="hmtechcard">
                <svg class="hmtechlogo" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <h4 class="hmtechname">${item.name}</h4>
                <p class="hmtechdesc">${item.desc}</p>
            </div>
        `,
);
