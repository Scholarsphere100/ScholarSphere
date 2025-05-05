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

function addToDatabase(name, userId) {
  const addUser = async () => {
    try {
      // Check if the document already exists
      const docRef = db.collection("Users").doc(userId);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        // Document doesn't exist, so we add the user
        await docRef.set({
          name: name,
          isAdmin: false,
          isPending: true,
          isAccepted: null ,
          isResearcher : null ,
          isReviewer : null
        });
        console.log("User successfully added to Firestore!");
      } else {
        // Document exists, so we don't add the user
        console.log("User already exists in the Firestore.");
      }
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
    }
  };

  addUser();
}

function redirectUser(userid) {
  return (async () => {
    try {
      const docRef = db.collection("Users").doc(userid);
      const docSnapshot = await docRef.get();
      
      
      if (docSnapshot.exists) {
        const data = docSnapshot.data();

        if (data.isAdmin) {
          return 'admin.html';
  
        } 
      
        else if (data.isResearcher == null && data.isReviewer == null){
          return '/html/selectRole.html';
        }
       
        else if (data.isPending) {
          return '/html/accountUnderReview.html';
        } else if (data.isAccepted) {
          return '/html/researcher-dashboard.html';
        }
        else if (!data.isAccepted){
          return '/html/rejected.html';
        }
        
        
      }

      return null; // Fallback in case nothing matches
    } catch (error) {
      console.error("Error accessing user in Firestore:", error);
      return null;
    }
  })();
}

function redirectUserLogin(userid) {
return (async () => {
  try {
    const docRef = db.collection("Users").doc(userid);
    const docSnapshot = await docRef.get();
    
    
    if (docSnapshot.exists) {
      const data = docSnapshot.data();

      return true ;

      
    }

    return false ; // Fallback in case nothing matches
  } catch (error) {
    console.error("Error accessing user in Firestore:", error);
    return null;
  }
})();
}

let userName = "" ;
let userID = "" ;
// Google Login Functionality
document.addEventListener('DOMContentLoaded', function() {

document.getElementById('google').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  // Optional: Add additional scopes if needed
  // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  
  auth.signInWithPopup(provider)
      .then( async (result) => {
          // This gives you a Google Access Token
          const credential = result.credential;
          const token = credential.accessToken;
          
          // The signed-in user info
          const user = result.user;
          
          userName = user.displayName ;
          userID = user.uid ;
          
     
          if ( await redirectUserLogin(userID)){
            
            alert("account already exists , please login ", user);

            const redirectPath = '../html/login.html' ;
            window.location.href = redirectPath ;
          }
          else{
            await addToDatabase(userName , userID);
            htmllink = await redirectUser(userID) ;
            console.log("Successfully signed up using Google:", userName , " " ,htmllink, " ", userID);
            alert("Successfully signed up with with Google!", user);
            
            const redirectPath = await redirectUser(userID) ;
            window.location.href = redirectPath ;
          }
          
          
          
          // Redirect to dashboard or home page after successful login
          

          sessionStorage.setItem("userid",userID);
      })
      .catch((error) => {
          // Handle Errors here
          const errorCode = error.code;
          const errorMessage = error.message;
          
          // The email of the user's account used
          const email = error.email;
          
          // The AuthCredential type that was used
          const credential = error.credential;
          
          console.error("Google login error:", errorCode, errorMessage);
          
          // Show error to user
          alert(`Google login failed: ${errorMessage}`);
      });
});

});



// Close button functionality
document.querySelector('.auth-close-button').addEventListener('click', () => {
  // Redirect to home page or previous page
  window.history.back();
});

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
      // User is signed in
      console.log("User is logged in:", user);
  } else {
      // User is signed out
      console.log("User is logged out");
  }
});