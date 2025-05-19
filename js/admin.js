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

// User management functions
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

// Progress tracking
let approvedCount = 0;
let rejectedCount = 0;

function updateProgress() {
  const total = approvedCount + rejectedCount;
  const percent = total ? Math.round((approvedCount / total) * 100) : 0;
  document.getElementById("circleProgress").setAttribute("stroke-dasharray", `${percent}, 100`);
  document.getElementById("percentageText").textContent = `${percent}%`;
}
//sign out functionality
const signOutBtn = document.getElementById('sign-out-btn');
if (signOutBtn) {
    signOutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to sign out?')) {
            // In a real application, this would call an API to invalidate the session
            console.log('User signed out');
            // Redirect to login page
            alert('You have been signed out successfully.');
            window.location.href = '../index.html'; // In the real app, this would go to the landing page
        }
    });
}



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

// Project Report Functions
let latestReportData = [];

function groupMilestonesByProject(milestoneDocs) {
  return milestoneDocs.reduce((acc, doc) => {
    const data = doc.data();
    if (!acc[data.projectId]) acc[data.projectId] = [];
    acc[data.projectId].push(data);
    return acc;
  }, {});
}

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
    displayCompletionReport(report);
  } catch (err) {
    console.error("Generate report failed:", err);
    alert("Failed to generate report.");
  }
}

function displayCompletionReport(data) {
  const tableBody = document.querySelector("#completionReportTable tbody");
  tableBody.innerHTML = "";
  
  data.forEach(project => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${project.projectName}</td>
      <td>${project.totalMilestones}</td>
      <td>${project.completedMilestones}</td>
      <td>${project.completionRate}</td>
      <td>${project.avgProgress}</td>
      <td>${project.participants}</td>
    `;
    tableBody.appendChild(row);
  });
}

function downloadProjectReport() {
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
}

// Funding Report Functions
let latestFundingReportData = [];

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount);
}

async function generateFundingReport() {
  try {
    const [grantsSnap, expensesSnap] = await Promise.all([
      db.collection("grants").get(),
      db.collection("expenses").where("status", "==", "approved").get()
    ]);

    const grants = grantsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      amount: typeof doc.data().amount === 'number' ? doc.data().amount : Number(doc.data().amount)
    }));

    const expenses = expensesSnap.docs.map(doc => ({
      ...doc.data(),
      amount: typeof doc.data().amount === 'number' ? doc.data().amount : Number(doc.data().amount)
    }));
    
    const report = grants.map(grant => {
      const grantExpenses = expenses.filter(exp => exp.grant === grant.title);
      const usedAmount = grantExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const available = grant.amount - usedAmount;
      const utilization = grant.amount > 0 ? (usedAmount / grant.amount) * 100 : 0;
      
      return {
        grantName: grant.title,
        grantAgency: grant.agency || 'N/A',
        totalAmount: formatCurrency(grant.amount, grant.currency),
        usedAmount: formatCurrency(usedAmount, grant.currency),
        available: formatCurrency(available, grant.currency),
        utilization: `${utilization.toFixed(1)}%`,
        startDate: grant.startDate || 'N/A'
      };
    });

    latestFundingReportData = report;
    displayFundingReport(report);
  } catch (err) {
    console.error("Error generating funding report:", err);
    alert("Failed to generate funding report.");
  }
}

function displayFundingReport(data) {
  const tableBody = document.querySelector("#fundingReportTable tbody");
  tableBody.innerHTML = "";
  
  data.forEach(grant => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${grant.grantName}</td>
      <td>${grant.grantAgency}</td>
      <td>${grant.totalAmount}</td>
      <td>${grant.usedAmount}</td>
      <td>${grant.available}</td>
      <td>${grant.utilization}</td>
      <td>${grant.startDate}</td>
    `;
    tableBody.appendChild(row);
  });
}

function downloadFundingReport() {
  if (!latestFundingReportData.length) {
    alert("Please generate the report first.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text("Funding Utilization Report", 10, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 22);
  
  const headers = [
    "Grant Name",
    "Agency",
    "Total Amount", 
    "Used Amount", 
    "Available", 
    "Utilization %",
    "Start Date"
  ];
  
  const rows = latestFundingReportData.map(grant => [
    grant.grantName,
    grant.grantAgency,
    grant.totalAmount,
    grant.usedAmount,
    grant.available,
    grant.utilization,
    grant.startDate
  ]);
  
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      6: { cellWidth: 20 }
    }
  });
  
  doc.save("funding_report.pdf");
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  getAllUsers();
  updateProgress();

  // Project Report Buttons
  const generateReportBtn = document.getElementById("generateReportBtn");
  if (generateReportBtn) {
    generateReportBtn.addEventListener("click", generateProjectCompletionReport);
  }

  const downloadReportBtn = document.getElementById("downloadReportBtn");
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener("click", downloadProjectReport);
  }

  // Funding Report Buttons
  const generateFundingBtn = document.getElementById("generateFundingReportBtn");
  if (generateFundingBtn) {
    generateFundingBtn.addEventListener("click", generateFundingReport);
  }

  const downloadFundingBtn = document.getElementById("downloadFundingReportBtn");
  if (downloadFundingBtn) {
    downloadFundingBtn.addEventListener("click", downloadFundingReport);
  }
});

// Export all functions for testing
if (typeof exports !== 'undefined') {
  // User management
  exports.addPendingResearcher = addPendingResearcher;
  exports.addPendingReviewer = addPendingReviewer;
  exports.getAllUsers = getAllUsers;
  exports.updateUsers = updateUsers;
  exports.approve = approve;
  exports.reject = reject;
  exports.updateProgress = updateProgress;
  
  // Project Reports
  exports.generateProjectCompletionReport = generateProjectCompletionReport;
  exports.groupMilestonesByProject = groupMilestonesByProject;
  exports.calculateProjectMetrics = calculateProjectMetrics;
  exports.displayCompletionReport = displayCompletionReport;
  exports.downloadProjectReport = downloadProjectReport;
  
  // Funding Reports
  exports.generateFundingReport = generateFundingReport;
  exports.displayFundingReport = displayFundingReport;
  exports.downloadFundingReport = downloadFundingReport;
  exports.formatCurrency = formatCurrency;
}