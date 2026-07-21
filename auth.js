import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase instances from firebase.js
const auth = window.firebaseAuth;
const db = window.firebaseDB;

/**
 * Handle Auth Submit (Login & Registration)
 */
export async function handleAuthSubmit() {
  const authCompany = document.getElementById("authCompany");
  const authName = document.getElementById("authName");
  const authEmpId = document.getElementById("authEmpId");
  const authEmail = document.getElementById("authEmail");
  const authPass = document.getElementById("authPass");
  const authPassConfirm = document.getElementById("authPassConfirm");
  const authError = document.getElementById("authError");
  const authSubmitBtn = document.getElementById("authSubmitBtn");

  if (!authEmail || !authPass) return;

  const email = authEmail.value.trim();
  const password = authPass.value;
  const isRegisterMode = authName && authName.style.display !== "none";

  authError.textContent = "";

  if (!email) {
    authError.textContent = "Please enter your Email Address.";
    return;
  }
  if (!password || password.length < 6) {
    authError.textContent = "Password must be at least 6 characters.";
    return;
  }

  try {
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = "PROCESSING...";

    if (isRegisterMode) {
      // 1. REGISTRATION MODE
      const company = authCompany ? authCompany.value.trim() : "";
      const fullName = authName ? authName.value.trim() : "";
      const empId = authEmpId ? authEmpId.value.trim() : "";
      const confirmPass = authPassConfirm ? authPassConfirm.value : "";

      if (!fullName) {
        authError.textContent = "Please enter your Full Name.";
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = "REGISTER";
        return;
      }
      if (!empId) {
        authError.textContent = "Please enter your Employee ID.";
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = "REGISTER";
        return;
      }
      if (password !== confirmPass) {
        authError.textContent = "Passwords do not match.";
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = "REGISTER";
        return;
      }

      // Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save User Profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        companyName: company,
        fullName: fullName,
        employeeId: empId,
        email: email,
        createdAt: new Date().toISOString()
      });

    } else {
      // 2. LOGIN MODE
      await signInWithEmailAndPassword(auth, email, password);
    }

  } catch (error) {
    console.error("Auth Error:", error);
    let msg = "Authentication failed.";
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      msg = "Invalid Email or Password.";
    } else if (error.code === "auth/email-already-in-use") {
      msg = "This email is already registered.";
    } else if (error.code === "auth/invalid-email") {
      msg = "Please enter a valid email address.";
    }
    authError.textContent = msg;
  } finally {
    authSubmitBtn.disabled = false;
    authSubmitBtn.textContent = isRegisterMode ? "REGISTER" : "LOGIN";
  }
}

/**
 * Handle Logout
 */
export async function handleLogout() {
  try {
    await signOut(auth);
    localStorage.removeItem("ot-auth-session-v1");
    if (typeof window.showAuthScreen === "function") {
      window.showAuthScreen();
    } else {
      window.location.reload();
    }
  } catch (error) {
    console.error("Logout Error:", error);
  }
}

/**
 * Fetch and return Firestore User Profile Data
 */
export async function getUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

// Global scope attachment for HTML inline listener compatibilities if needed
window.handleAuthSubmit = handleAuthSubmit;
window.handleLogout = handleLogout;
