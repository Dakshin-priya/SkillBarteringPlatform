// src/pages/Login.jsx
import { auth, provider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userDoc = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userDoc);

      if (!userSnap.exists()) {
        // New user: go to role selection
        await setDoc(userDoc, {
          name: result.user.displayName,
          email: result.user.email,
          role: "",
        });
        navigate("/select-role");
      } else {
        // Existing user: go to home
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black">
      <button
        onClick={handleLogin}
        className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}
