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
const firebaseConfig = {
  apiKey: "AIzaSyAuBIw5tkpyEYxqJX1d7xziNaKHRoW4E9M",
  authDomain: "scholarsphere-a8c83.firebaseapp.com",
  projectId: "scholarsphere-a8c83",
  storageBucket: "scholarsphere-a8c83.firebasestorage.app",
  messagingSenderId: "841487458923",
  appId: "1:841487458923:web:b171e7057ae763fcb1472e",
  measurementId: "G-NNYQ7E1KY2"
};

//Hope added these lines
// import firebase from "firebase/app";  // Import Firebase from 'firebase/app'
// import "firebase/auth";               // Import Firebase Auth
// import "firebase/firestore";          // Import Firebase Firestore

// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
//const auth = firebase.auth();

const ScholarSphere = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();




export const getAllUsers = async () => {
  try {
    const usersCollection= await db.collection("Users").get();

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
      
     
      
    });
  } catch (error) {
    console.error("Error getting users:", error);
  }
};

getAllUsers();

export function updateUsers(userid , result){
  async function updateUserName() {
    const userId = userid; // The ID of the user document you want to update

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


//Here starts the progress report functions
// Enhanced Project Completion Report Functions
export async function generateProjectCompletionReport() {
  try {
    // Get all projects and milestones in parallel for efficiency
    const [projectsSnapshot, milestonesSnapshot] = await Promise.all([
      db.collection("projects").get(),
      db.collection("milestones").get()
    ]);

    const reportData = [];
    const milestonesByProject = groupMilestonesByProject(milestonesSnapshot.docs);

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
        projectName: project.title,
        totalMilestones: metrics.totalMilestones,
        completedMilestones: metrics.completedMilestones,
        completionRate: metrics.completionRate,
        avgProgress: metrics.avgProgress,
        participants: project.collaborators?.length || 0
      });
    }

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
  });
}

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
document.addEventListener("DOMContentLoaded", () => {
  getAllUsers();
  
  // Set up report generation button
  const reportBtn = document.getElementById("generateReportBtn");
  if (reportBtn) {
    reportBtn.addEventListener("click", generateProjectCompletionReport);
  }
  
  // Generate initial report
  generateProjectCompletionReport();
  
  // Set up real-time listener for milestones changes
  db.collection("milestones").onSnapshot(() => {
    console.log("Milestones changed - updating report");
    generateProjectCompletionReport();
  });
});

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
  