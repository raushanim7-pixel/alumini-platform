// ===================================================================
// APEX ALUMNI OS — CLIENT-SIDE STATE & INTERACTION CONTROLLER
// ===================================================================

const API_BASE = "/api/v1";

const state = {
  currentRole: "ALUMNI", // 'ALUMNI', 'STUDENT', 'ADMIN', 'COORDINATOR', 'SUPER_ADMIN'
  activeTab: "directory",
  profiles: [],
  events: [],
  jobs: [],
  mentorshipRequests: [],
  campaigns: [],
  donations: [],
  stories: [],
  duplicates: [],
  pendingClaims: [],
  auditLogs: [],
  chartsInitialized: false
};

// Initialize Application on Page Load
document.addEventListener("DOMContentLoaded", async () => {
  lucide.createIcons();
  await loadAllInitialData();
  renderDigitalCardQR("PASS-AIST-8849-VERIFIED");
  setupRoleVisuals();
});

// -------------------------------------------------------------
// DATA LOADING
// -------------------------------------------------------------
async function loadAllInitialData() {
  try {
    await Promise.all([
      fetchProfiles(),
      fetchEvents(),
      fetchJobs(),
      fetchMentorshipRequests(),
      fetchCampaigns(),
      fetchDonations(),
      fetchStories(),
      fetchGovernanceData()
    ]);
  } catch (err) {
    console.error("Error loading platform data:", err);
    showToast("Loaded cached institutional data.", "check-circle");
  }
}

async function fetchProfiles(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/profiles?${query}`);
  const data = await res.json();
  state.profiles = data.profiles;
  renderProfilesGrid(data.profiles);
  const badge = document.getElementById("search-count-badge");
  if (badge) badge.innerText = `${data.count} Verified Alumni Records`;
}

async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  const data = await res.json();
  state.events = data.events;
  renderEventsGrid(data.events);
}

async function fetchJobs() {
  const res = await fetch(`${API_BASE}/jobs`);
  const data = await res.json();
  state.jobs = data.jobs;
  renderJobsList(data.jobs);
}

async function fetchMentorshipRequests() {
  const res = await fetch(`${API_BASE}/mentorship/requests`);
  const data = await res.json();
  state.mentorshipRequests = data.requests;
  renderMentorshipRequests(data.requests);
}

async function fetchCampaigns() {
  const res = await fetch(`${API_BASE}/campaigns`);
  const data = await res.json();
  state.campaigns = data.campaigns;
  renderCampaigns(data.campaigns);
}

async function fetchDonations() {
  const res = await fetch(`${API_BASE}/donations/recent`);
  const data = await res.json();
  state.donations = data.donations;
  renderDonationsLedger(data.donations);
}

async function fetchStories() {
  const res = await fetch(`${API_BASE}/stories`);
  const data = await res.json();
  state.stories = data.stories;
  renderStories(data.stories);
}

async function fetchGovernanceData() {
  try {
    const [dupRes, claimRes, logRes] = await Promise.all([
      fetch(`${API_BASE}/governance/duplicates`),
      fetch(`${API_BASE}/governance/pending-claims`),
      fetch(`${API_BASE}/governance/audit-logs`)
    ]);
    const dups = await dupRes.json();
    const claims = await claimRes.json();
    const logs = await logRes.json();
    
    state.duplicates = dups.duplicates;
    state.pendingClaims = claims.claims;
    state.auditLogs = logs.logs;

    renderDuplicates(dups.duplicates);
    renderPendingClaims(claims.claims);
    renderAuditLogs(logs.logs);
  } catch (e) {
    console.warn("Governance fetch failed", e);
  }
}

// -------------------------------------------------------------
// NAVIGATION & ROLE SWITCHER
// -------------------------------------------------------------
function switchTab(tabId) {
  state.activeTab = tabId;

  // Toggle active class on navigation buttons
  document.querySelectorAll(".nav-tab").forEach(tab => {
    if (tab.dataset.tab === tabId) {
      tab.classList.add("bg-brand-700", "text-white", "shadow-sm");
    } else {
      tab.classList.remove("bg-brand-700", "text-white", "shadow-sm");
    }
  });

  // Toggle section visibility
  document.querySelectorAll(".tab-view").forEach(view => {
    view.classList.add("hidden");
    view.classList.remove("block");
  });

  const target = document.getElementById(`view-${tabId}`);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("block");
  }

  // Lazy render charts on analytics tab
  if (tabId === "analytics" && !state.chartsInitialized) {
    setTimeout(initAnalyticsCharts, 100);
  }

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changeRole(role) {
  state.currentRole = role;
  setupRoleVisuals();
  showToast(`Switched active persona to ${role.replace("_", " ")}`, "user");
}

function setupRoleVisuals() {
  const role = state.currentRole;
  const displayName = document.getElementById("user-display-name");
  const roleLabel = document.getElementById("user-role-label");
  const avatar = document.getElementById("user-avatar");
  const govTab = document.getElementById("nav-governance");

  if (role === "ALUMNI") {
    displayName.innerText = "Vikramaditya Mehta";
    roleLabel.innerText = "Class of '18 • Verified Alumnus";
    avatar.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
    if (govTab) govTab.classList.remove("hidden");
  } else if (role === "STUDENT") {
    displayName.innerText = "Arjun Rathore";
    roleLabel.innerText = "3rd Year UG • CSE (Roll: 23BCS019)";
    avatar.src = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80";
    if (govTab) govTab.classList.add("hidden");
  } else if (role === "ADMIN") {
    displayName.innerText = "Dean Dr. R. K. Sharma";
    roleLabel.innerText = "Director, Alumni Affairs & Endowment";
    avatar.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80";
    if (govTab) govTab.classList.remove("hidden");
  } else if (role === "COORDINATOR") {
    displayName.innerText = "Prof. Meenakshi Sundaram";
    roleLabel.innerText = "Faculty Coordinator • CSE Dept";
    avatar.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80";
    if (govTab) govTab.classList.remove("hidden");
  } else if (role === "SUPER_ADMIN") {
    displayName.innerText = "CIO & Systems Registrar";
    roleLabel.innerText = "Super Admin • DPDP Compliance";
    avatar.src = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80";
    if (govTab) govTab.classList.remove("hidden");
  }
}

// -------------------------------------------------------------
// MODULE 1: REGISTRATION & VERIFICATION FLOW
// -------------------------------------------------------------
async function handleVerifyEnrolment() {
  const roll = document.getElementById("claim-roll").value.trim();
  const year = parseInt(document.getElementById("claim-year").value);
  const dept = document.getElementById("claim-dept").value;

  if (!roll) {
    alert("Please enter your enrolment/roll number (e.g. 14BCS042 or 16BCS099).");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/verify-enrolment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrolment_no: roll, passing_year: year, department: dept })
    });
    const data = await res.json();

    if (data.matched) {
      document.getElementById("erp-match-result").classList.remove("hidden");
      document.getElementById("matched-student-name").innerText = data.name;
      document.getElementById("matched-student-details").innerText = `${data.department} • Roll: ${data.enrolment_no}`;
      document.getElementById("matched-masked-contact").innerText = `${data.masked_email} / ${data.masked_phone}`;
      showToast("Record matched in Student Information System!", "check-circle");
    } else {
      document.getElementById("erp-match-result").classList.add("hidden");
      alert(data.message);
    }
  } catch (err) {
    alert("Error communicating with verification gateway.");
  }
}

async function handleVerifyOTP() {
  const roll = document.getElementById("claim-roll").value.trim();
  const otp = document.getElementById("claim-otp-input").value.trim();

  if (!otp || otp.length !== 6) {
    alert("Please enter a valid 6-digit OTP code (Demo OTP: 123456).");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrolment_no: roll, otp: otp })
    });
    const data = await res.json();
    if (data.success) {
      showToast("Profile Claimed & Verified Successfully!", "shield-check");
      document.getElementById("erp-match-result").classList.add("hidden");
      document.getElementById("claim-btn-text").innerText = "Verified Alumnus";
      switchTab("my-profile");
    }
  } catch (err) {
    alert("Invalid OTP code. Please enter 123456.");
  }
}

async function handleManualClaim(event) {
  event.preventDefault();
  const name = document.getElementById("manual-name").value;
  const year = parseInt(document.getElementById("manual-year").value);
  const dept = document.getElementById("manual-dept").value;
  const email = document.getElementById("manual-email").value;

  try {
    const res = await fetch(`${API_BASE}/auth/manual-claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        enrolment_no: `LEGACY-${year}`,
        department: dept,
        graduation_year: year,
        email,
        document_name: "degree_certificate.pdf"
      })
    });
    const data = await res.json();
    alert(data.message);
    event.target.reset();
    fetchGovernanceData();
  } catch (e) {
    alert("Failed to submit claim.");
  }
}

// -------------------------------------------------------------
// MODULE 2 & 3: DIRECTORY RENDERING & SEARCH
// -------------------------------------------------------------
function handleSearchFilter() {
  const search = document.getElementById("dir-search").value.trim();
  const dept = document.getElementById("dir-dept").value;
  const year = document.getElementById("dir-year").value;
  const city = document.getElementById("dir-city").value.trim();
  const mentorOnly = document.getElementById("dir-mentor-filter").checked;
  const hireOnly = document.getElementById("dir-hire-filter").checked;

  const params = {};
  if (search) params.search = search;
  if (dept) params.department = dept;
  if (year) params.graduation_year = parseInt(year);
  if (city) params.city = city;
  if (mentorOnly) params.mentor_only = true;
  if (hireOnly) params.hire_only = true;

  fetchProfiles(params);
}

function renderProfilesGrid(profiles) {
  const container = document.getElementById("alumni-grid");
  const mentorsContainer = document.getElementById("panel-mentors");
  if (!container) return;

  if (profiles.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed p-6">
        <i data-lucide="user-x" class="w-8 h-8 mx-auto text-slate-400 mb-2"></i>
        <p class="font-medium">No alumni matched your filter criteria.</p>
        <p class="text-xs text-slate-400 mt-1">Try broadening your keywords or clearing departmental filters.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = profiles.map(p => `
    <div class="bg-white rounded-xl border border-slate-200 hover:border-brand-700/50 hover:shadow-md transition p-5 flex flex-col justify-between space-y-4">
      <div>
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <img src="${p.avatar}" alt="${p.name}" class="w-12 h-12 rounded-xl object-cover border border-slate-200">
            <div>
              <div class="font-bold text-sm text-brand-900 leading-tight">${p.name}</div>
              <div class="text-xs text-slate-600 font-medium">${p.designation}</div>
              <div class="text-[11px] text-brand-800 font-semibold">${p.company}</div>
            </div>
          </div>
          <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            VERIFIED
          </span>
        </div>

        <div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-500">Degree & Dept:</span>
            <strong class="text-slate-800">${p.degree} (${p.graduation_year})</strong>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-500">Location:</span>
            <span>${p.city}, ${p.country}</span>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-1">
          ${p.skills.slice(0, 3).map(s => `<span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">${s}</span>`).join("")}
          ${p.skills.length > 3 ? `<span class="text-[10px] text-slate-400">+${p.skills.length - 3}</span>` : ""}
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          ${p.willing_to_mentor ? `<span title="Available to mentor students" class="text-xs cursor-default">🤝</span>` : ""}
          ${p.willing_to_hire ? `<span title="Hiring / Alumni Referrals" class="text-xs cursor-default">💼</span>` : ""}
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="viewProfileDetail('${p.id}')" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg transition">
            View Profile
          </button>
          ${p.willing_to_mentor ? `
            <button onclick="openMentorshipApplyModal('${p.id}', '${p.name}')" class="text-xs bg-brand-900 hover:bg-brand-800 text-white font-medium px-2.5 py-1.5 rounded-lg transition">
              Request Mentor
            </button>
          ` : `
            <button onclick="viewProfileDetail('${p.id}')" class="text-xs bg-brand-900 hover:bg-brand-800 text-white font-medium px-2.5 py-1.5 rounded-lg transition">
              Connect
            </button>
          `}
        </div>
      </div>
    </div>
  `).join("");

  // Also populate Mentors sub-tab
  if (mentorsContainer) {
    const mentors = profiles.filter(p => p.willing_to_mentor);
    mentorsContainer.innerHTML = mentors.map(m => `
      <div class="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div class="flex items-start space-x-3">
          <img src="${m.avatar}" alt="${m.name}" class="w-14 h-14 rounded-xl object-cover border border-gold-500">
          <div>
            <div class="font-bold text-sm text-brand-900">${m.name}</div>
            <div class="text-xs text-slate-700">${m.designation} @ <strong>${m.company}</strong></div>
            <div class="text-[11px] text-slate-500 mt-0.5">${m.degree} ${m.department} ('${m.graduation_year.toString().slice(2)})</div>
          </div>
        </div>
        <p class="text-xs text-slate-600 line-clamp-2">${m.bio}</p>
        <div class="pt-2 border-t flex justify-between items-center">
          <span class="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
            Accepting 2 Mentees
          </span>
          <button onclick="openMentorshipApplyModal('${m.id}', '${m.name}')" class="text-xs bg-brand-900 hover:bg-brand-800 text-white font-semibold px-3 py-1.5 rounded-lg transition">
            Apply as Mentee
          </button>
        </div>
      </div>
    `).join("");
  }

  lucide.createIcons();
}

function viewProfileDetail(profileId) {
  const p = state.profiles.find(item => item.id === profileId);
  if (!p) return;

  document.getElementById("mp-avatar").src = p.avatar;
  document.getElementById("mp-name").innerText = p.name;
  document.getElementById("mp-designation").innerText = `${p.designation} @ ${p.company}`;
  document.getElementById("mp-degree").innerText = `${p.degree} • ${p.department} (Class of ${p.graduation_year})`;
  document.getElementById("mp-loc-text").innerText = `${p.city}, ${p.country}`;
  document.getElementById("mp-bio").innerText = p.bio;
  
  // Privacy masked email demonstration
  const maskedEmail = p.privacy.email === "PUBLIC_VERIFIED" 
    ? p.email 
    : p.email.slice(0, 3) + "****@" + p.email.split("@")[1] + " (Masked via DPDP Consent)";
  document.getElementById("mp-email").innerText = maskedEmail;

  document.getElementById("mp-skills").innerHTML = p.skills.map(s => `
    <span class="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded-md border">${s}</span>
  `).join("");

  openModal("modal-profile");
}

function triggerInMail() {
  closeModal("modal-profile");
  showToast("InMail connection request delivered to alumnus inbox!", "send");
}

// -------------------------------------------------------------
// MODULE 5: EVENTS & REUNIONS
// -------------------------------------------------------------
function renderEventsGrid(events) {
  const container = document.getElementById("events-grid");
  if (!container) return;

  container.innerHTML = events.map(e => `
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        <div class="relative h-44 overflow-hidden">
          <img src="${e.image}" alt="${e.title}" class="w-full h-full object-cover">
          <span class="absolute top-3 left-3 text-[10px] font-bold bg-brand-900/90 text-gold-500 px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
            ${e.type.replace("_", " ")}
          </span>
        </div>

        <div class="p-5 space-y-3">
          <h3 class="font-bold text-base text-brand-900 leading-snug">${e.title}</h3>
          
          <div class="text-xs text-slate-600 space-y-1.5">
            <div class="flex items-center text-slate-700 font-medium">
              <i data-lucide="clock" class="w-3.5 h-3.5 mr-1.5 text-gold-600"></i>
              <span>${e.date}</span>
            </div>
            <div class="flex items-start text-slate-500">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5"></i>
              <span class="leading-tight">${e.venue}</span>
            </div>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">${e.description}</p>
        </div>
      </div>

      <div class="p-5 pt-0 border-t border-slate-100 mt-2">
        <div class="flex items-center justify-between text-xs mb-3 pt-3">
          <span class="text-slate-500">${e.registered_count} / ${e.capacity} Registered</span>
          <span class="font-bold text-brand-900">${e.ticket_price === 0 ? "FREE ENTRY" : `₹ ${e.ticket_price.toLocaleString()}`}</span>
        </div>

        <button onclick="handleBookEvent('${e.id}', '${e.title}')" class="w-full bg-brand-900 hover:bg-brand-800 text-white font-semibold py-2.5 rounded-lg text-xs transition flex items-center justify-center space-x-1.5">
          <i data-lucide="ticket" class="w-4 h-4 text-gold-500"></i>
          <span>RSVP & Get Digital QR Pass</span>
        </button>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
}

async function handleBookEvent(eventId, title) {
  try {
    const res = await fetch(`${API_BASE}/events/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: eventId,
        attendee_name: "Vikramaditya Mehta",
        enrolment_no: "14BCS042",
        ticket_type: "Standard Alumnus Pass"
      })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("tkt-number").innerText = data.ticket.ticket_id;
      renderTicketQR(data.ticket.qr_code);
      openModal("modal-ticket");
      showToast(data.message, "check-circle");
      fetchEvents();
    }
  } catch (err) {
    alert("Error booking event.");
  }
}

function showMyTicketPass() {
  document.getElementById("tkt-number").innerText = "TKT-AIST-2026-0941";
  renderTicketQR("TKT-AIST-2026-0941-VERIFIED");
  openModal("modal-ticket");
}

function renderTicketQR(qrText) {
  const container = document.getElementById("ticket-qr");
  container.innerHTML = "";
  new QRCode(container, {
    text: qrText,
    width: 120,
    height: 120,
    colorDark: "#0A2540",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// -------------------------------------------------------------
// MODULE 6: MENTORSHIP & JOBS
// -------------------------------------------------------------
function toggleMentorshipSubtab(subtab) {
  const tabs = ["mentors", "jobs", "requests"];
  tabs.forEach(t => {
    const btn = document.getElementById(`subtab-${t}`);
    const pnl = document.getElementById(`panel-${t}`);
    if (t === subtab) {
      btn.className = "pb-2 text-xs font-bold border-b-2 border-brand-900 text-brand-900";
      pnl.classList.remove("hidden");
    } else {
      btn.className = "pb-2 text-xs font-medium text-slate-500 hover:text-slate-800";
      pnl.classList.add("hidden");
    }
  });
}

function openMentorshipApplyModal(mentorId, mentorName) {
  document.getElementById("apply-mentor-id").value = mentorId;
  document.getElementById("apply-mentor-name").value = mentorName;
  openModal("modal-mentorship");
}

async function submitMentorshipApplication(event) {
  event.preventDefault();
  const mentorId = document.getElementById("apply-mentor-id").value;
  const name = document.getElementById("apply-student-name").value;
  const roll = document.getElementById("apply-student-roll").value;
  const year = document.getElementById("apply-student-year").value;
  const topic = document.getElementById("apply-topic").value;
  const message = document.getElementById("apply-message").value;

  try {
    const res = await fetch(`${API_BASE}/mentorship/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentor_id: mentorId,
        student_name: name,
        student_roll: roll,
        student_department: "Computer Science & Engineering",
        year: year,
        topic: topic,
        message: message
      })
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modal-mentorship");
      showToast(data.message, "check-circle");
      fetchMentorshipRequests();
    }
  } catch (e) {
    alert("Error submitting mentorship application.");
  }
}

function renderJobsList(jobs) {
  const container = document.getElementById("panel-jobs");
  if (!container) return;

  container.innerHTML = jobs.map(j => `
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-bold text-base text-brand-900">${j.title}</h3>
            ${j.is_alumni_referral ? `
              <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center">
                <i data-lucide="award" class="w-3 h-3 mr-1"></i> ALUMNI REFERRAL
              </span>
            ` : ""}
          </div>
          <div class="text-xs text-slate-600 font-medium mt-0.5">
            ${j.company} • <span class="text-slate-500">${j.location}</span> • <span class="text-slate-500">${j.type}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400">Posted by ${j.posted_by}</span>
        </div>
      </div>

      <p class="text-xs text-slate-600 leading-relaxed">${j.description}</p>

      <div class="pt-3 border-t flex justify-between items-center text-xs">
        <span class="text-slate-400">Required: ${j.experience}</span>
        <button onclick="applyJob('${j.id}', '${j.company}')" class="bg-brand-900 hover:bg-brand-800 text-white font-semibold px-4 py-1.5 rounded-lg transition">
          Apply with Alumni Profile
        </button>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
}

function applyJob(jobId, company) {
  showToast(`Application and verified academic transcript forwarded to ${company}!`, "send");
}

function renderMentorshipRequests(requests) {
  const container = document.getElementById("requests-list");
  if (!container) return;

  container.innerHTML = requests.map(r => `
    <div class="border rounded-lg p-3 bg-slate-50 flex items-center justify-between text-xs">
      <div>
        <div class="font-bold text-slate-800">${r.student_name} (${r.year}, Roll: ${r.student_roll})</div>
        <div class="text-slate-600 text-[11px] mt-0.5">Mentor: <strong>${r.mentor_name}</strong> • Topic: ${r.topic}</div>
        <div class="text-slate-500 text-[11px] italic mt-1">"${r.message}"</div>
      </div>
      <div>
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${r.status}
        </span>
      </div>
    </div>
  `).join("");
}

// -------------------------------------------------------------
// MODULE 7: GIVING & SECTION 80G TAX EXEMPTION
// -------------------------------------------------------------
function renderCampaigns(campaigns) {
  const container = document.getElementById("campaigns-grid");
  if (!container) return;

  container.innerHTML = campaigns.map(c => {
    const pct = Math.min(100, Math.round((c.raised_amount / c.target_amount) * 100));
    return `
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
        <div>
          <div class="h-40 overflow-hidden relative">
            <img src="${c.image}" alt="${c.title}" class="w-full h-full object-cover">
            <span class="absolute bottom-2 left-2 text-[10px] font-bold bg-brand-900/90 text-white px-2 py-0.5 rounded">
              ${c.category}
            </span>
          </div>

          <div class="p-5 space-y-3">
            <h3 class="font-bold text-sm text-brand-900 leading-snug">${c.title}</h3>
            <p class="text-xs text-slate-600 line-clamp-2">${c.description}</p>
            
            <!-- Progress Bar -->
            <div class="space-y-1.5 pt-2">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-brand-900">₹ ${(c.raised_amount / 100000).toFixed(1)} Lakhs Raised</span>
                <span class="text-slate-500">${pct}% of Goal</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-gold-500 h-2 rounded-full" style="width: ${pct}%"></div>
              </div>
              <div class="flex justify-between text-[11px] text-slate-400">
                <span>${c.donors_count} Donors</span>
                <span>Target: ₹ ${(c.target_amount / 10000000).toFixed(1)} Cr</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 pt-0">
          <button onclick="openDonationModal('${c.id}', '${c.title}')" class="w-full bg-brand-900 hover:bg-brand-800 text-white font-semibold py-2.5 rounded-lg text-xs transition flex items-center justify-center space-x-1.5">
            <i data-lucide="heart" class="w-4 h-4 text-gold-500"></i>
            <span>Contribute Now (Instant 80G)</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

function openDonationModal(campaignId, campaignTitle) {
  document.getElementById("donate-campaign-id").value = campaignId;
  document.getElementById("donate-campaign-title").value = campaignTitle;
  document.getElementById("donate-amount").value = 10000;
  openModal("modal-donation");
}

function setDonationAmt(amount) {
  document.getElementById("donate-amount").value = amount;
}

async function handleDonationSubmit(event) {
  event.preventDefault();
  const campaignId = document.getElementById("donate-campaign-id").value;
  const amount = parseFloat(document.getElementById("donate-amount").value);
  const name = document.getElementById("donate-name").value;
  const pan = document.getElementById("donate-pan").value;
  const isAnon = document.getElementById("donate-anon").checked;

  try {
    const res = await fetch(`${API_BASE}/donations/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaign_id: campaignId,
        amount: amount,
        donor_name: name,
        donor_email: "vikram.mehta@example.com",
        donor_pan: pan,
        is_anonymous: isAnon
      })
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modal-donation");
      show80GCertificate(data.donation, data.receipt);
      showToast(data.message, "award");
      fetchCampaigns();
      fetchDonations();
    }
  } catch (e) {
    alert("Donation processing error.");
  }
}

function renderDonationsLedger(donations) {
  const container = document.getElementById("donations-ledger");
  if (!container) return;

  container.innerHTML = donations.map(d => `
    <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 border text-xs">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-bold">
          <i data-lucide="award" class="w-4 h-4"></i>
        </div>
        <div>
          <div class="font-bold text-slate-800">${d.is_anonymous ? "Anonymous Patron" : d.donor_name}</div>
          <div class="text-[11px] text-slate-500">${d.campaign_title} • ${d.date}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="font-bold text-brand-900 text-sm">₹ ${d.amount.toLocaleString()}</div>
        <span class="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
          80G CERTIFIED
        </span>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
}

function show80GCertificate(donation, receipt) {
  document.getElementById("cert-receipt-no").innerText = receipt.receipt_number;
  document.getElementById("cert-date").innerText = donation.date || new Date().toISOString().split("T")[0];
  document.getElementById("cert-donor-name").innerText = donation.donor_name;
  document.getElementById("cert-donor-pan").innerText = donation.donor_pan;
  document.getElementById("cert-amount").innerText = `₹ ${donation.amount.toLocaleString()}.00`;
  document.getElementById("cert-deduction").innerText = `₹ ${(donation.amount * 0.5).toLocaleString()}.00`;
  document.getElementById("cert-campaign").innerText = donation.campaign_title;

  const qrContainer = document.getElementById("cert-qr");
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, {
    text: `AIST-80G-VERIFIED:${receipt.receipt_number}:PAN-${donation.donor_pan}:AMT-${donation.amount}`,
    width: 80,
    height: 80,
    colorDark: "#0A2540",
    colorLight: "#ffffff"
  });

  openModal("modal-80g-certificate");
}

function previewSample80G() {
  show80GCertificate({
    donor_name: "Vikramaditya Mehta",
    donor_pan: "ABCDE1234F",
    amount: 50000,
    campaign_title: "Centre for Artificial Intelligence & Quantum Computing",
    date: "2026-10-18"
  }, {
    receipt_number: "AIST/80G/2026-27/00492"
  });
}

// -------------------------------------------------------------
// MODULE 8: STORIES & ACHIEVEMENTS
// -------------------------------------------------------------
function renderStories(stories) {
  const container = document.getElementById("stories-grid");
  if (!container) return;

  container.innerHTML = stories.map(s => `
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        <div class="h-44 overflow-hidden relative">
          <img src="${s.image}" alt="${s.title}" class="w-full h-full object-cover">
          <span class="absolute top-2 left-2 text-[10px] font-bold bg-brand-900/90 text-gold-500 px-2 py-0.5 rounded uppercase">
            ${s.category}
          </span>
        </div>
        <div class="p-5 space-y-2">
          <div class="text-[11px] text-slate-400 font-semibold">${s.date} • ${s.batch}</div>
          <h3 class="font-bold text-sm text-brand-900 leading-snug">${s.title}</h3>
          <p class="text-xs text-slate-600 leading-relaxed">${s.summary}</p>
        </div>
      </div>
      <div class="p-5 pt-0 border-t border-slate-100 flex justify-between items-center text-xs">
        <span class="text-slate-400">${s.read_time}</span>
        <button onclick="showToast('Congratulatory note posted to alumna!', 'thumbs-up')" class="text-brand-900 hover:text-brand-700 font-semibold flex items-center space-x-1">
          <span>Congratulate</span> &rarr;
        </button>
      </div>
    </div>
  `).join("");
}

function openSubmitStoryModal() {
  alert("Achievement submission form: Alumni can submit new venture funding, publications, or career appointments for editorial review.");
}

// -------------------------------------------------------------
// MODULE 10: ANALYTICS DASHBOARD (CHART.JS)
// -------------------------------------------------------------
async function initAnalyticsCharts() {
  if (state.chartsInitialized) return;

  const res = await fetch(`${API_BASE}/analytics/summary`);
  const data = await res.json();

  // Chart 1: Geo Doughnut
  const ctxGeo = document.getElementById("chart-geo");
  if (ctxGeo) {
    new Chart(ctxGeo, {
      type: "doughnut",
      data: {
        labels: data.geographic_distribution.map(d => d.region),
        datasets: [{
          data: data.geographic_distribution.map(d => d.count),
          backgroundColor: ["#0A2540", "#C59B27", "#163B66", "#10B981", "#64748B"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 10 } } } }
      }
    });
  }

  // Chart 2: Sector Bar
  const ctxSector = document.getElementById("chart-sector");
  if (ctxSector) {
    new Chart(ctxSector, {
      type: "bar",
      data: {
        labels: data.industry_sectors.map(s => s.sector),
        datasets: [{
          label: "% of Alumni",
          data: data.industry_sectors.map(s => s.pct),
          backgroundColor: "#0A2540"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 50 } }
      }
    });
  }

  // Chart 3: Giving Progression Line
  const ctxGiving = document.getElementById("chart-giving");
  if (ctxGiving) {
    new Chart(ctxGiving, {
      type: "line",
      data: {
        labels: data.giving_trend.map(g => g.year),
        datasets: [{
          label: "Endowment Giving (Crores INR)",
          data: data.giving_trend.map(g => g.amount_cr),
          borderColor: "#C59B27",
          backgroundColor: "rgba(197, 155, 39, 0.1)",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  state.chartsInitialized = true;
}

// -------------------------------------------------------------
// MODULE 11: DATA GOVERNANCE & DPDP AUDIT
// -------------------------------------------------------------
function renderDuplicates(dups) {
  const container = document.getElementById("duplicate-container");
  if (!container) return;

  if (dups.length === 0 || dups[0].status === "RESOLVED") {
    container.innerHTML = `
      <div class="p-4 bg-emerald-50 rounded-lg text-xs text-emerald-800 border border-emerald-200">
        ✓ No conflicting records pending deduplication. All profiles cleanly reconciled.
      </div>
    `;
    return;
  }

  container.innerHTML = dups.map(d => `
    <div class="border border-amber-200 bg-amber-50/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div>
        <div class="font-bold text-amber-900 flex items-center space-x-1.5">
          <span>Confidence Score: ${d.confidence_score}%</span>
          <span class="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-semibold">DUPLICATE DETECTED</span>
        </div>
        <div class="text-slate-700 font-medium mt-1">${d.record_a.name} (${d.record_a.enrolment_no}) vs ${d.record_b.name}</div>
        <div class="text-[11px] text-slate-500 mt-0.5">${d.match_reason}</div>
      </div>
      <div>
        <button onclick="openModal('modal-merge')" class="bg-brand-900 hover:bg-brand-800 text-white font-semibold px-4 py-2 rounded-lg transition">
          Resolve Side-by-Side Diff
        </button>
      </div>
    </div>
  `).join("");
}

async function confirmMerge(choice) {
  try {
    const res = await fetch(`${API_BASE}/governance/duplicates/dup-701/resolve?choice=MERGE_TO_${choice}`, {
      method: "POST"
    });
    const data = await res.json();
    closeModal("modal-merge");
    showToast(data.message, "git-merge");
    fetchGovernanceData();
  } catch (e) {
    alert("Merge error.");
  }
}

function renderPendingClaims(claims) {
  const container = document.getElementById("pending-claims-container");
  if (!container) return;

  container.innerHTML = claims.map(c => `
    <div class="border rounded-lg p-3 bg-slate-50 flex items-center justify-between text-xs">
      <div>
        <div class="font-bold text-slate-800">${c.name} • ${c.enrolment_no} (${c.graduation_year}, ${c.department})</div>
        <div class="text-slate-500 text-[11px]">Submitted: ${c.submission_date} • Doc: <a href="#" class="text-brand-900 underline font-medium">${c.document_name}</a></div>
      </div>
      <div>
        ${c.status === "PENDING" ? `
          <button onclick="approveClaim('${c.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded transition">
            Approve & Issue Access
          </button>
        ` : `
          <span class="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded">APPROVED</span>
        `}
      </div>
    </div>
  `).join("");
}

async function approveClaim(claimId) {
  const res = await fetch(`${API_BASE}/governance/pending-claims/${claimId}/approve`, { method: "POST" });
  const data = await res.json();
  showToast(data.message, "check-circle");
  fetchGovernanceData();
}

function renderAuditLogs(logs) {
  const container = document.getElementById("audit-log-rows");
  if (!container) return;

  container.innerHTML = logs.map(l => `
    <tr class="hover:bg-slate-50">
      <td class="p-3 font-mono text-[11px] text-slate-500">${l.timestamp}</td>
      <td class="p-3 font-medium text-slate-800">${l.user_email}</td>
      <td class="p-3"><span class="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-mono">${l.event_type}</span></td>
      <td class="p-3 text-slate-600">${l.details}</td>
      <td class="p-3 font-mono text-[11px] text-slate-400">${l.ip_address}</td>
    </tr>
  `).join("");
}

function triggerDataRefreshCampaign() {
  showToast("Triggered automated WhatsApp profile refresh campaign to 12,400 stale contacts!", "send");
}

// -------------------------------------------------------------
// MODULE 2 & DIGITAL ALUMNI PASS
// -------------------------------------------------------------
function renderDigitalCardQR(qrText) {
  const container = document.getElementById("card-qr");
  if (!container) return;
  container.innerHTML = "";
  new QRCode(container, {
    text: qrText,
    width: 60,
    height: 60,
    colorDark: "#0A2540",
    colorLight: "#ffffff"
  });
}

function saveProfileChanges() {
  const company = document.getElementById("edit-company").value;
  const desig = document.getElementById("edit-designation").value;
  showToast("Profile and DPDP consent preferences updated successfully!", "check-circle");
}

function requestDataErasure() {
  if (confirm("Under Section 12 of India's DPDP Act 2023, you have the right to request erasure of your personal data. Proceed with filing this request with the Data Protection Officer (DPO)?")) {
    showToast("Data erasure request logged in compliance vault. Ticket #DPDP-DEL-4091 generated.", "shield");
  }
}

// -------------------------------------------------------------
// UI HELPERS & MODAL UTILITIES
// -------------------------------------------------------------
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove("hidden");
  lucide.createIcons();
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add("hidden");
}

function openVerificationModal() {
  switchTab("verification");
}

function showToast(message, icon = "check-circle") {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toast-msg");
  if (!toast) return;

  msgEl.innerText = message;
  toast.classList.remove("translate-y-24", "opacity-0", "pointer-events-none");
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add("translate-y-24", "opacity-0", "pointer-events-none");
  }, 4000);
}
