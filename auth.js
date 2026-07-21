import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

window.registerUser = async function(email, password){

    return await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

}

window.loginUser = async function(email,password){

    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}

window.logoutUser = async function(){

    await signOut(auth);

}
