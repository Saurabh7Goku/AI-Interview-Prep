import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where,} from "firebase/firestore";
import { signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Define the Interview interface to match the data structure
export interface Interview {
  id: string;
  userId: string;
  questions: string[];
  answers: { [key: number]: string };
  feedbacks: { [key: number]: string };
  scores: { [key: number]: number };
  timestamp: string;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function saveInterview(userId: string, interviewData: {
  questions: string[];
  answers: { [key: number]: string };
  feedbacks: { [key: number]: string };
  scores: { [key: number]: number };
  timestamp: string;
}) {
  try {
    const docRef = await addDoc(collection(db, "interviews"), {
      userId,
      ...interviewData,
      timestamp: interviewData.timestamp || new Date().toISOString(),
    });
    console.log("Interview saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving interview:", error);
    throw error;
  }
}

export async function getInterviewHistory(userId: string): Promise<Interview[]> {
  try {
    const q = query(collection(db, "interviews"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const interviews: Interview[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      userId: doc.data().userId || "",
      questions: doc.data().questions || [],
      answers: doc.data().answers || {},
      feedbacks: doc.data().feedbacks || {},
      scores: doc.data().scores || {},
      timestamp: doc.data().timestamp || "",
    }));
    console.log("Fetched interviews:", interviews);
    return interviews;
  } catch (error) {
    console.error("Error fetching interview history:", error);
    throw error;
  }
}

export{signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword};