import {GoogleAuthProvider, signOut} from "firebase/auth";
import {auth} from "../src/firebase.js";
import {signInWithPopup} from "firebase/auth";
import {signInWithRedirect} from "firebase/auth";
import {getRedirectResult} from "firebase/auth";
import {getAuth} from "firebase/auth";
import {initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";


const provider = new GoogleAuthProvider();
const auth = getAuth();

signInWithPopup(auth, provider)
.then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    console.log(user);
}).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
});



signOut(auth).then(() => {
    // Sign-out successful.
}
).catch((error) => {
    // An error happened.
}
);