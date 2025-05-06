//Hope added the following lines of code 
//const { initializeApp } = require('firebase/app');
//const { getAuth } = require('firebase/auth');
//const { getFirestore } = require('firebase/firestore');

//done


const firebaseConfig = {
  apiKey: "AIzaSyAuBIw5tkpyEYxqJX1d7xziNaKHRoW4E9M",
  authDomain: "scholarsphere-a8c83.firebaseapp.com",
  projectId: "scholarsphere-a8c83",
  storageBucket: "scholarsphere-a8c83.firebasestorage.app",
  messagingSenderId: "841487458923",
  appId: "1:841487458923:web:b171e7057ae763fcb1472e",
  measurementId: "G-NNYQ7E1KY2"
};


// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
//const auth = firebase.auth();

const ScholarSphere = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


//const { snapshot } = require("node:test");

function redirectUser(userid) {
    return (async () => {
      try {
        const docRef = db.collection("Users").doc(userid);
        const docSnapshot = await docRef.get();
  
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
  
          if (data.isAdmin) {
            return '../html/admin.html';
    
          } 
        
          else if (data.isResearcher == null && data.isReviewer == null){
            return '../html/selectRole.html';
          }
         
          else if (data.isPending) {
            return '../html/accountUnderReview.html';
          } else if (data.isAccepted && data.isResearcher) {
            return '../html/researcher-dashboard.html';
          }
          else if (data.isAccepted && data.isReviewer){
            return '../html/reviewer-dashboard.html';
          }
          else if (!data.isAccepted){
            return '../html/rejected.html';
          }
        }
        else if (!docSnapshot.exists){
            alert("Your account does not exist , please sign up!")
            return '../html/SignUp.html' ;
        }
  
        return null; // Fallback in case nothing matches
      } catch (error) {
        console.error("Error accessing user in Firestore:", error);
        return null;
      }
    })();
}


// Google Login Functionality
document.getElementById('google-login').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
        .then(async (result) => {
            const user = result.user;
            const googletoken = result.credential.accessToken; // Get the Google access token
            console.log("Google login successful",googletoken);
            alert("Google login successful", googletoken);
            
            window.location.href = await redirectUser(user.uid);
        })
        .catch((error) => {
            console.error("Login error:", error);
            alert(`Login failed: ${error.message}`);
            
            // Sign out the user if there was an error
            auth.signOut().catch(err => {
                console.error("Sign out error:", err);
            });
        });
});

// Close button functionality
document.querySelector('.auth-close-button').addEventListener('click', () => {
    window.history.back();
});

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is logged in:", user);
        
        // Update last login timestamp
        console.log("Mocked Firestore doc update:", db.collection("Users").doc("test-user-id").update);
        db.collection('Users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.error("Error updating last login:", error);
        });
    } else {
        console.log("User is logged out");
    }
});

