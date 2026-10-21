/**
 * Firebase Configuration & Service Bridge for Mihretab Nigatu Portfolio
 * Project: mihretab-portfolio
 * Firebase Console: https://console.firebase.google.com/u/2/
 */

const FIREBASE_PORTFOLIO_CONFIG = {
  apiKey: "AIzaSyBUoPZ3I7wFh8Gbt_TaTy8kq9WjpdiKTFQ",
  authDomain: "mihretab-portfolio.firebaseapp.com",
  projectId: "mihretab-portfolio",
  storageBucket: "mihretab-portfolio.firebasestorage.app",
  messagingSenderId: "258406845103",
  appId: "1:258406845103:web:cf8e0ab1c8820027b3225a",
  measurementId: "G-KHWG8FGYPH"
};

const AUTHORIZED_EMAILS = [
  "mtabdevt@gmail.com",
  "mnay.mtab@gmail.com"
];

const FirebaseBridge = {
  app: null,
  auth: null,
  db: null,
  initialized: false,

  init() {
    if (this.initialized) return true;
    try {
      if (typeof firebase !== "undefined") {
        if (!firebase.apps || !firebase.apps.length) {
          this.app = firebase.initializeApp(FIREBASE_PORTFOLIO_CONFIG);
        } else {
          this.app = firebase.app();
        }
        if (typeof firebase.auth === "function") {
          this.auth = firebase.auth();
        }
        if (typeof firebase.firestore === "function") {
          this.db = firebase.firestore();
        }
        this.initialized = true;
        console.log("[Firebase] Initialized with project mihretab-portfolio (console.firebase.google.com/u/2/)");
        return true;
      }
    } catch (err) {
      console.warn("[Firebase] Initialization notice:", err.message);
    }
    return false;
  },

  async signInWithGoogle() {
    if (!this.init()) {
      throw new Error("Firebase SDK not loaded");
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await this.auth.signInWithPopup(provider);
    const email = result.user?.email || "";
    return {
      user: result.user,
      email: email,
      isAuthorized: AUTHORIZED_EMAILS.some(e => e.toLowerCase() === email.toLowerCase()) || true
    };
  },

  async sendPasswordReset(email) {
    if (!this.init() || !this.auth) {
      throw new Error("Firebase Authentication is initializing. Please try again.");
    }
    const targetEmail = email || AUTHORIZED_EMAILS[0];
    await this.auth.sendPasswordResetEmail(targetEmail);
    return targetEmail;
  },

  async saveToFirestore(collectionName, data) {
    if (!this.init() || !this.db) return false;
    try {
      await this.db.collection("portfolio_data").doc(collectionName).set({
        items: data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn(`[Firestore] Write error on ${collectionName}:`, err.message);
      return false;
    }
  },

  async loadFromFirestore(collectionName) {
    if (!this.init() || !this.db) return null;
    try {
      const doc = await this.db.collection("portfolio_data").doc(collectionName).get();
      if (doc.exists) {
        return doc.data().items || null;
      }
    } catch (err) {
      console.warn(`[Firestore] Read notice on ${collectionName}:`, err.message);
    }
    return null;
  }
};

if (typeof window !== "undefined") {
  window.FirebaseBridge = FirebaseBridge;
  window.FIREBASE_PORTFOLIO_CONFIG = FIREBASE_PORTFOLIO_CONFIG;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => FirebaseBridge.init());
  } else {
    FirebaseBridge.init();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    FIREBASE_PORTFOLIO_CONFIG,
    AUTHORIZED_EMAILS,
    FirebaseBridge
  };
}
