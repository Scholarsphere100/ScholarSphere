<<<<<<< HEAD
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
>>>>>>> 119e69b8134be607ef2eb3c6031d8c8be278a8df
const firebaseConfig = {
  apiKey: "AIzaSyAuBIw5tkpyEYxqJX1d7xziNaKHRoW4E9M",
  authDomain: "scholarsphere-a8c83.firebaseapp.com",
  projectId: "scholarsphere-a8c83",
  storageBucket: "scholarsphere-a8c83.firebasestorage.app",
  messagingSenderId: "841487458923",
  appId: "1:841487458923:web:b171e7057ae763fcb1472e",
  measurementId: "G-NNYQ7E1KY2"
};

<<<<<<< HEAD
=======
//Hope added these lines
// import firebase from "firebase/app";  // Import Firebase from 'firebase/app'
// import "firebase/auth";               // Import Firebase Auth
// import "firebase/firestore";          // Import Firebase Firestore

// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
//const auth = firebase.auth();

>>>>>>> 119e69b8134be607ef2eb3c6031d8c8be278a8df
const ScholarSphere = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();

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

<<<<<<< HEAD
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
=======
export const getAllUsers = async () => {
>>>>>>> 119e69b8134be607ef2eb3c6031d8c8be278a8df
  try {
    const users = await db.collection("Users").get();
    if (users.empty) return;

<<<<<<< HEAD
    users.forEach((doc) => {
      const user = doc.data();
      if (user.isResearcher && user.isPending) addPendingResearcher(user.name, doc.id);
      else if (user.isReviewer && user.isPending) addPendingReviewer(user.name, doc.id);
=======
    if (usersCollection.empty) {
      console.log("No users found in the database.");
      return;
    }

    usersCollection.docs.forEach((doc) => {
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
      
     
      
>>>>>>> 119e69b8134be607ef2eb3c6031d8c8be278a8df
    });
  } catch (err) {
    console.error("Error getting users:", err);
  }
}

getAllUsers();

<<<<<<< HEAD
// Update approval status
function updateUsers(userId, result) {
  async function updateUser() {
=======
export function updateUsers(userid , result){
  async function updateUserName() {
    const userId = userid; // The ID of the user document you want to update

>>>>>>> 119e69b8134be607ef2eb3c6031d8c8be278a8df
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

<<<<<<< HEAD
async function generateProjectCompletionReport() {
=======
//Here starts the progress report functions
// Enhanced Project Completion Report Functions
export async function generateProjectCompletionReport() {
>>>>>>> 119e69b8134be607ef2eb3c6031d8c8be278a8df
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

<<<<<<< HEAD
// Simple alert popup for report
function displayReportModal(data) {
  let text = "Project Completion Report:\n\n";
  data.forEach(p => {
    text += `${p.projectName} - ${p.completionRate} (${p.completedMilestones}/${p.totalMilestones})\n`;
=======
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
  const tableBody = document.querySelector("#completionReportTable tbody");
  tableBody.innerHTML = "";
  
  reportData.forEach(project => {
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
>>>>>>> 119e69b8134be607ef2eb3c6031d8c8be278a8df
  });
  alert(text);
}

<<<<<<< HEAD
// DOMContentLoaded setup
=======
export function displayProjectsTable(reportData) {
  const tableBody = document.querySelector("#researchTable");
  tableBody.innerHTML = "";
  
  reportData.forEach(project => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${project.projectName}</td>
      <td>${project.participants}</td>
      <td>
        <progress value="${project.avgProgress.replace('%','')}" max="100"></progress>
        ${project.avgProgress}
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Initialize with real-time updates
>>>>>>> 119e69b8134be607ef2eb3c6031d8c8be278a8df
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
<<<<<<< HEAD
=======

// Thatos program
export function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("mainContent");
    sidebar.classList.toggle("inactive");
  }
  
  let approvedCount = 0;
  let rejectedCount = 0;
  
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
  
>>>>>>> 119e69b8134be607ef2eb3c6031d8c8be278a8df
