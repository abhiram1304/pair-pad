/* client/src/lib/firebase.js -------------------------------------------- */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const app  = initializeApp({
  apiKey:             import.meta.env.VITE_FB_API_KEY,
  authDomain:         import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:          import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:      import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId:  import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId:              import.meta.env.VITE_FB_APP_ID,
});

const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

/* keep one popup at a time */
let popupPromise = null;

export async function googleSignIn () {
  if (popupPromise) return popupPromise;            // return ongoing request
  popupPromise = signInWithPopup(auth, provider)
    .then(res => res.user.getIdToken())
    .finally(() => { popupPromise = null; });
  return popupPromise;
}
