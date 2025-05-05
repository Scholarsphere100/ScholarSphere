// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
//const auth = firebase.auth();
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

const userID = sessionStorage.getItem("userid");

function redirectUser(userid) {
    return (async () => {
      try {
        const docRef = db.collection("Users").doc(userid);
        const docSnapshot = await docRef.get();

        const data = docSnapshot.data();
  
        if(data.isPending && data.isAccepted == null){
            return window.location.href = '../html/accountUnderReview.html';

        }

        if (!data.isPending && data.isAccepted  && data.isReviewer){
            return window.location.href = '../html/reviewer-dashboard.html';
        }
        else if (!data.isPending && data.isAccepted  && data.isResearcher){
            return window.location.href = '../html/researcher-dashboard.html';
        }
        else{
            return window.location.href = '../html/accountUnderReview.html';
        }
        
        //return null; // Fallback in case nothing matches
      } catch (error) {
        console.error("Error accessing user in Firestore:", error);
        alert("someting wong")
        return window.location.href;
      }
    })();
}
document.getElementById('continue-button').addEventListener('click',async  () => {
    const selectedCard = document.querySelector('.role-card.selected');
    let selectedRole = "";
    if (selectedCard) {
        selectedRole = selectedCard.getAttribute('data-role');
        console.log("Selected role is:", selectedRole); // either "researcher" or "reviewer"
    }


    await updateUsers(userID,selectedRole);

   const linkk = await redirectUser(userID) ;
   window.location.href = linkk ;
    console.log("link ", linkk ); // either "researcher" or "reviewer"
    
});



function updateUsers(userid , result){
    async function updateOccupation() {
      const userId = userid; // The ID of the user document you want to update
  
      try {
        
        const USER = db.collection("Users").doc(userid);
  
        if (result == "reviewer" ){
          const updatedData = {
            isReviewer : true ,
            isResearcher : false
          };
          await USER.update(updatedData);
          console.log("User successfully updated!");
        }
        else if (result == "researcher"){
          const updatedData = {
            isResearcher : true,
            isReviewer : false 
          };
          await USER.update(updatedData);
          console.log("Users successfully updated !");
        }
      
      } catch (error) {
        console.error("Error updating user's name: ", error);
      }
    }
  
    updateOccupation();
  }
  