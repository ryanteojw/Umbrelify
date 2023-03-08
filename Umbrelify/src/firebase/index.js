import { initializeApp } from "firebase/app"
import { browserLocalPersistence, getAuth, setPersistence, signInWithEmailAndPassword} from "firebase/auth"
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAkfyeLx1NBJBiwnnN55ES06fqIZHDKZO0",
  authDomain: "umbrellify.firebaseapp.com",
  projectId: "umbrellify",
  storageBucket: "umbrellify.appspot.com",
  messagingSenderId: "267114931166",
  appId: "1:267114931166:web:10885ae4baa51b3a69b34f"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth }
export { db }

setPersistence(auth, browserLocalPersistence)