// Import the required Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyReplaceWithYourOwnKeySnehaVidya",
  authDomain: "sneha-vidya-samste-demo.firebaseapp.com",
  projectId: "sneha-vidya-samste-demo",
  storageBucket: "sneha-vidya-samste-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:ab12cd34ef56gh78ij90kl",
};

// Initialize Firebase
let app, auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn(
    "Firebase config is mock setup. Using simulated system fallback gracefully.",
    e,
  );
}

// ==========================================
// UI CORE UTILITIES & STATE CONTROLLERS
// ==========================================
const navheaderwrapper = document.getElementById("navheaderwrapper");
const navhamburgermenu = document.getElementById("navhamburgermenu");
const navnavbarmenu = document.getElementById("navnavbarmenu");
const navmobilenavoverlay = document.getElementById("navmobilenavoverlay");
const navaboutdropdown = document.getElementById("navaboutdropdown");
const navdropdowntoggle = document.getElementById("navdropdowntoggle");
const navadminloginbtn = document.getElementById("navadminloginbtn");
const navloginbtntext = document.getElementById("navloginbtntext");
const navloginmodal = document.getElementById("navloginmodal");
const navmodalclosebtn = document.getElementById("navmodalclosebtn");
const navloginform = document.getElementById("navloginform");
const navloginemail = document.getElementById("navloginemail");
const navloginpassword = document.getElementById("navloginpassword");
const navsubmitloginbtn = document.getElementById("navsubmitloginbtn");

// Admin editable fields indicators
const naveventeditstatus = document.getElementById("naveventeditstatus");
const navtimetableeditstatus = document.getElementById(
  "navtimetableeditstatus",
);
const navaddeventbtn = document.getElementById("navaddeventbtn");
const navedittimetablebtn = document.getElementById("navedittimetablebtn");

// Simulate localized database state for demo robustness
let currentAdminUser = null;

// Toast notification engine
function showToast(message, type = "navsuccess") {
  const container = document.getElementById("navtoastcontainer");
  const toast = document.createElement("div");
  toast.className = `navtoast ${type}`;

  const iconClass =
    type === "navsuccess" ? "fa-check-circle" : "fa-exclamation-circle";
  toast.innerHTML = `
        <i class="fas ${iconClass} navtoasticon"></i>
        <span class="navtoastmessage">${message}</span>
      `;

  container.appendChild(toast);

  // Animate entry
  setTimeout(() => toast.classList.add("navshow"), 10);

  // Remove automatically
  setTimeout(() => {
    toast.classList.remove("navshow");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Sticky Scroll Action Transition
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navheaderwrapper.classList.add("navscrolled");
  } else {
    navheaderwrapper.classList.remove("navscrolled");
  }
});

// Helper functions to Toggle Mobile Sidebar Drawer smoothly
const openMobileMenu = () => {
  navhamburgermenu.classList.add("navopen");
  navnavbarmenu.classList.add("navopen");
  navmobilenavoverlay.classList.add("navopen");
  document.body.classList.add("navmenuopen");
};

const closeMobileMenu = () => {
  navhamburgermenu.classList.remove("navopen");
  navnavbarmenu.classList.remove("navopen");
  navmobilenavoverlay.classList.remove("navopen");
  document.body.classList.remove("navmenuopen");
};

// Mobile Hamburger & Overlay Control Handlers
navhamburgermenu.addEventListener("click", () => {
  if (navnavbarmenu.classList.contains("navopen")) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

navmobilenavoverlay.addEventListener("click", closeMobileMenu);

// Close Mobile menu when clicking any matching menu link targets
document
  .querySelectorAll(".navnavbarlink:not(.navdropdowntoggle)")
  .forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();

      // Active Link Highlighting Switcher
      document
        .querySelectorAll(".navnavbarlink")
        .forEach((navLink) => navLink.classList.remove("navactive"));
      link.classList.add("navactive");
    });
  });

// Mobile Accordion Dropdown Toggle Logic
navdropdowntoggle.addEventListener("click", (e) => {
  if (window.innerWidth < 1024) {
    e.preventDefault();
    navaboutdropdown.classList.toggle("navopenaccordion");
  }
});

// Handle Dropdown close when clicking outside
document.addEventListener("click", (e) => {
  if (!navaboutdropdown.contains(e.target)) {
    navaboutdropdown.classList.remove("navopenaccordion");
  }
});

// Admin CTA Button Click Logic
navadminloginbtn.addEventListener("click", () => {
  // Close mobile drawer if open to keep UI clean
  closeMobileMenu();

  if (currentAdminUser) {
    // If logged in, execute signout logic
    handleLogout();
  } else {
    openLoginModal();
  }
});

navmodalclosebtn.addEventListener("click", closeLoginModal);

// Click outside modal to close
navloginmodal.addEventListener("click", (e) => {
  if (e.target === navloginmodal) {
    closeLoginModal();
  }
});

// ==========================================
// BACKEND LOGIN ENGINE (Auth State Rules)
// ==========================================

// Dynamic Permission & UI State Update
function updateAccessControl(user) {
  if (user) {
    currentAdminUser = user;
    navloginbtntext.textContent = "LOGOUT";
    navadminloginbtn.classList.add("navbtnlogout");

    // Change Event & Timetable Section Visual State
    naveventeditstatus.classList.add("navactive");
    naveventeditstatus.innerHTML =
      '<i class="fas fa-unlock"></i> <span>Editing Unlocked</span>';
    navtimetableeditstatus.classList.add("navactive");
    navtimetableeditstatus.innerHTML =
      '<i class="fas fa-unlock"></i> <span>Editing Unlocked</span>';

    navaddeventbtn.style.display = "inline-flex";
    navedittimetablebtn.style.display = "inline-flex";
  } else {
    currentAdminUser = null;
    navloginbtntext.textContent = "ADMIN LOGIN";
    navadminloginbtn.classList.remove("navbtnlogout");

    naveventeditstatus.classList.remove("navactive");
    naveventeditstatus.innerHTML =
      '<i class="fas fa-lock"></i> <span>Editing Locked</span>';
    navtimetableeditstatus.classList.remove("navactive");
    navtimetableeditstatus.innerHTML =
      '<i class="fas fa-lock"></i> <span>Editing Locked</span>';

    navaddeventbtn.style.display = "none";
    navedittimetablebtn.style.display = "none";
  }
}

// Monitor Firebase Auth State or Fallback Storage state on initialization
if (auth) {
  onAuthStateChanged(auth, (user) => {
    updateAccessControl(user);
  });
} else {
  // In-Memory simulated persistence if Firebase setup isn't resolved
  const localSession = sessionStorage.getItem("sneha_admin_session");
  if (localSession) {
    updateAccessControl(JSON.parse(localSession));
  }
}

// Handle Authentication Request
navloginform.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = navloginemail.value.trim();
  const password = navloginpassword.value;

  // Update Button State to loading
  navsubmitloginbtn.disabled = true;
  navsubmitloginbtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

  // Demo/Fallback verification credentials
  const demoEmail = "demo@snehaportal.edu";
  const demoPassword = "snehavidya123";

  if (auth && email !== demoEmail) {
    // Attempt realistic Firebase Login if credentials differ from mockup credentials
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      updateAccessControl(userCredential.user);
      showToast(`Welcome back, Administrator!`, "navsuccess");
      closeLoginModal();
      navloginform.reset();
    } catch (error) {
      showToast(error.message || "Failed to authenticate.", "naverror");
    } finally {
      navsubmitloginbtn.disabled = false;
      navsubmitloginbtn.innerHTML =
        '<span>SECURE SYSTEM LOGIN</span> <i class="fas fa-arrow-right"></i>';
    }
  } else {
    // Evaluate Simulated Environment / Sandbox credentials
    setTimeout(() => {
      if (email === demoEmail && password === demoPassword) {
        const simulatedUser = {
          uid: "admin-snehaportal-id",
          email: demoEmail,
          displayName: "Sneha Admin",
        };

        // Persist session locally using SessionStorage
        sessionStorage.setItem(
          "sneha_admin_session",
          JSON.stringify(simulatedUser),
        );
        updateAccessControl(simulatedUser);

        showToast("Authenticated as administrator successfully!", "navsuccess");
        closeLoginModal();
        navloginform.reset();
      } else {
        showToast("Invalid administrative credentials provided.", "naverror");
      }

      navsubmitloginbtn.disabled = false;
      navsubmitloginbtn.innerHTML =
        '<span>SECURE SYSTEM LOGIN</span> <i class="fas fa-arrow-right"></i>';
    }, 1200); // Realistic micro delay for luxury feedback loop
  }
});

// Handle Logout Sequence
async function handleLogout() {
  if (auth) {
    try {
      await signOut(auth);
      sessionStorage.removeItem("sneha_admin_session");
      updateAccessControl(null);
      showToast("Admin logged out successfully.", "navsuccess");
    } catch (error) {
      showToast("Error processing sign-out action.", "naverror");
    }
  } else {
    // Fallback cleanup
    sessionStorage.removeItem("sneha_admin_session");
    updateAccessControl(null);
    showToast("Logged out from admin workspace.", "navsuccess");
  }
}

// Action clicks on editable buttons
navaddeventbtn.addEventListener("click", () => {
  showToast("Access Granted: Create Event dialog loaded.", "navsuccess");
});

navedittimetablebtn.addEventListener("click", () => {
  showToast("Access Granted: Edit Timetable workspace unlocked.", "navsuccess");
});
