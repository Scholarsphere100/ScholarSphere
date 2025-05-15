// Firebase config and init
const firebaseConfig = {
  apiKey: "AIzaSyAuBIw5tkpyEYxqJX1d7xziNaKHRoW4E9M",
  authDomain: "scholarsphere-a8c83.firebaseapp.com",
  projectId: "scholarsphere-a8c83",
  storageBucket: "scholarsphere-a8c83.firebasestorage.app",
  messagingSenderId: "841487458923",
  appId: "1:841487458923:web:b171e7057ae763fcb1472e",
  measurementId: "G-NNYQ7E1KY2"
};

const ScholarSphere = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Pending researcher/reviewer DOM creation
function addPendingResearcher(name, userid) {
  const ul = document.getElementById("pendingResearchers");
  const li = document.createElement("li");
  const p = document.createElement("p");
  p.textContent = name;

  const section = document.createElement("section");
  section.className = "btn-group";
  section.id = userid;

  const approveBtn = document.createElement("button");
  approveBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
  approveBtn.className = "approve-btn";
  approveBtn.onclick = () => approve(approveBtn, "approvedResearchers");

  const rejectBtn = document.createElement("button");
  rejectBtn.innerHTML = '<i class="fas fa-times"></i> Reject';
  rejectBtn.className = "reject-btn";
  rejectBtn.onclick = () => reject(rejectBtn);

  section.appendChild(approveBtn);
  section.appendChild(rejectBtn);
  li.appendChild(p);
  li.appendChild(section);
  ul.appendChild(li);
}

function addPendingReviewer(name, userid) {
  const ul = document.getElementById("pendingReviewers");
  const li = document.createElement("li");
  const p = document.createElement("p");
  p.textContent = name;

  const section = document.createElement("section");
  section.className = "btn-group";
  section.id = userid;

  const approveBtn = document.createElement("button");
  approveBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
  approveBtn.className = "approve-btn";
  approveBtn.onclick = () => approve(approveBtn, "approvedReviewers");

  const rejectBtn = document.createElement("button");
  rejectBtn.innerHTML = '<i class="fas fa-times"></i> Reject';
  rejectBtn.className = "reject-btn";
  rejectBtn.onclick = () => reject(rejectBtn);

  section.appendChild(approveBtn);
  section.appendChild(rejectBtn);
  li.appendChild(p);
  li.appendChild(section);
  ul.appendChild(li);
}

// Get pending users
async function getAllUsers() {
  try {
    const users = await db.collection("Users").get();
    if (users.empty) return;

    users.forEach((doc) => {
      const user = doc.data();
      if (user.isResearcher && user.isPending) addPendingResearcher(user.name, doc.id);
      else if (user.isReviewer && user.isPending) addPendingReviewer(user.name, doc.id);
    });
  } catch (err) {
    console.error("Error getting users:", err);
  }
}

getAllUsers();

// Update approval status
function updateUsers(userId, result) {
  async function updateUser() {
    try {
      const userRef = db.collection("Users").doc(userId);
      const updated = result === "approve"
        ? { isAccepted: true, isPending: false }
        : { isAccepted: false, isPending: false };
      await userRef.update(updated);
      console.log("User updated:", userId);
    } catch (err) {
      console.error("Update error:", err);
    }
  }
  updateUser();
}

// Progress ring updater
let approvedCount = 0;
let rejectedCount = 0;

function updateProgress() {
  const total = approvedCount + rejectedCount;
  const percent = total ? Math.round((approvedCount / total) * 100) : 0;
  document.getElementById("circleProgress").setAttribute("stroke-dasharray", `${percent}, 100`);
  document.getElementById("percentageText").textContent = `${percent}%`;
}

// Approve / Reject actions
function approve(btn, targetId) {
  const li = btn.closest("li");
  const name = li.querySelector("p").textContent;
  const approvedList = document.getElementById(targetId);

  const newItem = document.createElement("li");
  newItem.textContent = name;
  approvedList.appendChild(newItem);

  const section = btn.closest("section");
  if (section) updateUsers(section.id, "approve");

  li.remove();
  approvedCount++;
  updateProgress();
}

function reject(btn) {
  const li = btn.closest("li");
  const section = btn.closest("section");
  if (section) updateUsers(section.id, "reject");

  li.remove();
  rejectedCount++;
  updateProgress();
}

updateProgress();

// Group milestones by project
function groupMilestonesByProject(milestoneDocs) {
  return milestoneDocs.reduce((acc, doc) => {
    const data = doc.data();
    if (!acc[data.projectId]) acc[data.projectId] = [];
    acc[data.projectId].push(data);
    return acc;
  }, {});
}

// Compute metrics
function calculateProjectMetrics(project, milestones) {
  const total = milestones.length;
  const completed = milestones.filter(m => m.status === "completed").length;
  const totalProgress = milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
  const avg = total ? Math.round(totalProgress / total) : 0;

  return {
    totalMilestones: total,
    completedMilestones: completed,
    completionRate: total ? `${Math.round((completed / total) * 100)}%` : "N/A",
    avgProgress: `${avg}%`,
    avgProgressValue: avg
  };
}

// Update project document
async function updateProjectProgress(projectId, progress) {
  await db.collection("projects").doc(projectId).update({
    progress,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Store report
let latestReportData = [];

async function generateProjectCompletionReport() {
  try {
    const [projectsSnap, milestonesSnap] = await Promise.all([
      db.collection("projects").get(),
      db.collection("milestones").get()
    ]);

    const grouped = groupMilestonesByProject(milestonesSnap.docs);
    const report = [];

    for (const doc of projectsSnap.docs) {
      const project = doc.data();
      const metrics = calculateProjectMetrics(project, grouped[doc.id] || []);
      if (project.progress !== metrics.avgProgressValue) {
        await updateProjectProgress(doc.id, metrics.avgProgressValue);
      }

      report.push({
        projectName: project.title,
        totalMilestones: metrics.totalMilestones,
        completedMilestones: metrics.completedMilestones,
        completionRate: metrics.completionRate,
        avgProgress: metrics.avgProgress,
        participants: project.collaborators?.length || 0
      });
    }

    latestReportData = report;
    displayReportModal(report);
  } catch (err) {
    console.error("Generate report failed:", err);
    alert("Failed to generate report.");
  }
}

// Simple alert popup for report
function displayReportModal(data) {
  let text = "Project Completion Report:\n\n";
  data.forEach(p => {
    text += `${p.projectName} - ${p.completionRate} (${p.completedMilestones}/${p.totalMilestones})\n`;
  });
  alert(text);
}

// DOMContentLoaded setup
document.addEventListener("DOMContentLoaded", () => {
  getAllUsers();

  const generateBtn = document.getElementById("generateReportBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", generateProjectCompletionReport);
  }

  const downloadBtn = document.getElementById("downloadReportBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!latestReportData.length) {
        alert("Please generate the report first.");
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Project Milestone Report", 10, 10);

      const headers = ["Project", "Total", "Completed", "Rate", "Progress", "Participants"];
      const rows = latestReportData.map(proj => [
        proj.projectName,
        proj.totalMilestones,
        proj.completedMilestones,
        proj.completionRate,
        proj.avgProgress,
        proj.participants
      ]);

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 20,
        styles: { fontSize: 10 }
      });

      doc.save("project_report.pdf");
    });
  }
});
