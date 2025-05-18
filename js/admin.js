<<<<<<< Updated upstream
// Firebase config and init
=======
export function addPendingResearcher(name , userid) {
  const unorderedList = document.getElementById("pendingResearchers");

  const list = document.createElement("li");

  const paragraph = document.createElement("p");
  paragraph.textContent = name;

  const btnGroup = document.createElement("section");
  btnGroup.id = userid ;
  

 
  btnGroup.className = "btn-group";


  const approveBtn = document.createElement("button");
  approveBtn.textContent = "Approve";
  approveBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Approve';
  approveBtn.className = "approve-btn";
  approveBtn.onclick = function () {
    approve(this, "approvedResearchers");
  };

  const rejectBtn = document.createElement("button");
  rejectBtn.textContent = "Reject";
  rejectBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> Reject';
  rejectBtn.className = "reject-btn";
  rejectBtn.onclick = function () {
    reject(this);
  };

  btnGroup.appendChild(approveBtn);
  btnGroup.appendChild(rejectBtn);

  list.appendChild(paragraph);
  list.appendChild(btnGroup);
  unorderedList.appendChild(list);
}

export function addPendingReviewer(name , userid){
  const unorderedList = document.getElementById("pendingReviewers");

  const list = document.createElement("li");

  const paragraph = document.createElement("p");
  paragraph.textContent = name;

  const btnGroup = document.createElement("section");
  btnGroup.id = userid ;
  

 
  btnGroup.className = "btn-group";

  const approveBtn = document.createElement("button");
  approveBtn.textContent = "Approve";
  approveBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Approve';
  approveBtn.className = "approve-btn";
  approveBtn.onclick = function () {
    approve(this, "approvedReviewers");
  };

  const rejectBtn = document.createElement("button");
  rejectBtn.textContent = "Reject";
  rejectBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> Reject';
  rejectBtn.className = "reject-btn";
  rejectBtn.onclick = function () {
    reject(this);
  };

  btnGroup.appendChild(approveBtn);
  btnGroup.appendChild(rejectBtn);

  list.appendChild(paragraph);
  list.appendChild(btnGroup);
  unorderedList.appendChild(list);
}
>>>>>>> Stashed changes
const firebaseConfig = {
  apiKey: "AIzaSyAuBIw5tkpyEYxqJX1d7xziNaKHRoW4E9M",
  authDomain: "scholarsphere-a8c83.firebaseapp.com",
  projectId: "scholarsphere-a8c83",
  storageBucket: "scholarsphere-a8c83.firebasestorage.app",
  messagingSenderId: "841487458923",
  appId: "1:841487458923:web:b171e7057ae763fcb1472e",
  measurementId: "G-NNYQ7E1KY2"
};

<<<<<<< Updated upstream
=======
//Hope added these lines
// import firebase from "firebase/app";  // Import Firebase from 'firebase/app'
// import "firebase/auth";               // Import Firebase Auth
// import "firebase/firestore";          // Import Firebase Firestore

// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
//const auth = firebase.auth();

>>>>>>> Stashed changes
const ScholarSphere = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

<<<<<<< Updated upstream
// User management functions
function addPendingResearcher(name, userid) {
  const ul = document.getElementById("pendingResearchers");
  const li = document.createElement("li");
  const p = document.createElement("p");
  p.textContent = name;
=======
>>>>>>> Stashed changes



<<<<<<< Updated upstream
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
=======
export const getAllUsers = async () => {
>>>>>>> Stashed changes
  try {
    const usersCollection= await db.collection("Users").get();

<<<<<<< Updated upstream
    users.forEach((doc) => {
      const user = doc.data();
      if (user.isResearcher && user.isPending) addPendingResearcher(user.name, doc.id);
      else if (user.isReviewer && user.isPending) addPendingReviewer(user.name, doc.id);
=======
    if (usersCollection.empty) {
      console.log("No users found in the database.");
      return;
    }

    usersCollection.forEach((doc) => {
      const data = doc.data();
      if (data.isResearcher && data.isPending){
        addPendingResearcher(data.name , doc.id );
        console.log(`User ID: ${doc.id}`, data.name);
      }
      else if (data.isReviewer && data.isPending){
        addPendingReviewer(data.name , doc.id);
        console.log(`User ID: ${doc.id}`, data.name);
      } 
      else{
        console.log("Role is undefined ");
      }
      
     
      
>>>>>>> Stashed changes
    });
  } catch (error) {
    console.error("Error getting users:", error);
  }
};

<<<<<<< Updated upstream
function updateUsers(userId, result) {
  async function updateUser() {
=======
getAllUsers();

export function updateUsers(userid , result){
  async function updateUserName() {
    const userId = userid; // The ID of the user document you want to update

>>>>>>> Stashed changes
    try {
      
      const USER = db.collection("Users").doc(userid);

      if (result == "approve" ){
        const updatedData = {
          isAccepted : true ,
          
          isPending : false
        };
        await USER.update(updatedData);
        console.log("User successfully updated!");
      }
      else if (result == "reject"){
        const updatedData = {
          isAccepted : false,
          isPending : false 
        };
        await USER.update(updatedData);
        console.log("Users successfully deleted !");
      }
    
    } catch (error) {
      console.error("Error updating user's name: ", error);
    }
  }

  updateUserName();
}

<<<<<<< Updated upstream
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
=======

//Here starts the progress report functions
// Enhanced Project Completion Report Functions
export async function generateProjectCompletionReport() {
>>>>>>> Stashed changes
  try {
    // Get all projects and milestones in parallel for efficiency
    const [projectsSnapshot, milestonesSnapshot] = await Promise.all([
      db.collection("projects").get(),
      db.collection("milestones").get()
    ]);

    const reportData = [];
    const milestonesByProject = groupMilestonesByProject(milestonesSnapshot.docs);

<<<<<<< Updated upstream
    for (const doc of projectsSnap.docs) {
      const project = doc.data();
      const metrics = calculateProjectMetrics(project, grouped[doc.id] || []);
      report.push({
=======
    // Process each project with its milestones
    for (const projectDoc of projectsSnapshot.docs) {
      const project = projectDoc.data();
      const projectId = projectDoc.id;
      const projectMilestones = milestonesByProject[projectId] || [];

      // Calculate completion metrics
      const metrics = calculateProjectMetrics(project, projectMilestones);
      
      // Update project progress in database if different
      if (project.progress !== metrics.avgProgressValue) {
        await updateProjectProgress(projectId, metrics.avgProgressValue);
      }

      reportData.push({
>>>>>>> Stashed changes
        projectName: project.title,
        totalMilestones: metrics.totalMilestones,
        completedMilestones: metrics.completedMilestones,
        completionRate: metrics.completionRate,
        avgProgress: metrics.avgProgress,
        participants: project.collaborators?.length || 0
      });
    }

<<<<<<< Updated upstream
    latestReportData = report;
    displayCompletionReport(report);
  } catch (err) {
    console.error("Generate report failed:", err);
    alert("Failed to generate report.");
  }
}

function displayCompletionReport(data) {
=======
    // Display the reports
    displayCompletionReport(reportData);
    displayProjectsTable(reportData);
    
  } catch (error) {
    console.error("Error generating report:", error);
    alert("Failed to generate report. Please try again.");
  }
}

// Helper function to group milestones by project
export function groupMilestonesByProject(milestoneDocs) {
  return milestoneDocs.reduce((acc, doc) => {
    const milestone = doc.data();
    const projectId = milestone.projectId;
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(milestone);
    return acc;
  }, {});
}

// Enhanced metrics calculation
export function calculateProjectMetrics(project, milestones) {
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === "completed").length;
  
  const totalProgress = milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
  const avgProgressValue = totalMilestones > 0 ? Math.round(totalProgress / totalMilestones) : 0;
  
  return {
    totalMilestones,
    completedMilestones,
    completionRate: totalMilestones > 0 
      ? `${Math.round((completedMilestones / totalMilestones) * 100)}%` 
      : "N/A",
    avgProgress: `${avgProgressValue}%`,
    avgProgressValue // For database updates
  };
}

// Update project progress in Firestore
export async function updateProjectProgress(projectId, newProgress) {
  try {
    await db.collection("projects").doc(projectId).update({
      progress: newProgress,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Updated progress for project ${projectId} to ${newProgress}%`);
  } catch (error) {
    console.error(`Error updating project ${projectId}:`, error);
  }
}

// Modified display functions
export function displayCompletionReport(reportData) {
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
export function displayProjectsTable(reportData) {
  const tableBody = document.querySelector("#researchTable");
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
// Initialize with real-time updates
document.addEventListener("DOMContentLoaded", () => {
  getAllUsers();
  
  // Set up report generation button
  const reportBtn = document.getElementById("generateReportBtn");
  if (reportBtn) {
    reportBtn.addEventListener("click", generateProjectCompletionReport);
>>>>>>> Stashed changes
  }
  
  // Generate initial report
  generateProjectCompletionReport();
  
  // Set up real-time listener for milestones changes
  db.collection("milestones").onSnapshot(() => {
    console.log("Milestones changed - updating report");
    generateProjectCompletionReport();
  });
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
  
<<<<<<< Updated upstream
  // Funding Reports
  exports.generateFundingReport = generateFundingReport;
  exports.displayFundingReport = displayFundingReport;
  exports.downloadFundingReport = downloadFundingReport;
  exports.formatCurrency = formatCurrency;
}
=======
  export function updateProgress() {
    const total = approvedCount + rejectedCount;
    const percent = total === 0 ? 0 : Math.round((approvedCount / total) * 100);
    const circle = document.getElementById("circleProgress");
    const text = document.getElementById("percentageText");
  
    circle.setAttribute("stroke-dasharray", `${percent}, 100`);
    text.textContent = `${percent}%`;
  }
  
  export function approve(button, targetListId) {
    const li = button.closest('li');
    const name = li.querySelector('p').innerText;
    const approvedList = document.getElementById(targetListId);
    const newItem = document.createElement("li");
    newItem.textContent = name;
    approvedList.appendChild(newItem);
    li.remove();
    approvedCount++;
    updateProgress();

    // update database to approve the user
    const section = button.closest("section");
    if (section) {
      const userID = section.id;
      console.log("Accepting user with ID:", userID);
      updateUsers(userID, "approve");
    }else{
      console.log("section undefined ", section.id);
    }
  }
  export function reject(button) {
    const li = button.closest('li');
    li.remove();
    rejectedCount++;
    updateProgress();

    
    // update database to reject the user

    const section = button.closest("section");
    if (section) {
      const userID = section.id;
      console.log("Rejecting user with ID:", userID);
      updateUsers(userID, "reject");
    }else{
      console.log("section undefined ", section.id);
    }

  }
  
  // Initial progress state
  updateProgress();
  
>>>>>>> Stashed changes
