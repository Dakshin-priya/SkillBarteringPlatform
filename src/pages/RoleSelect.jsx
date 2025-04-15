// src/pages/RoleSelect.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function RoleSelect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const selectRole = async (role) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { role });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h2 className="text-2xl mb-4">Select Your Role</h2>
      <div className="space-x-6">
        <button
          onClick={() => selectRole("seeker")}
          className="px-5 py-2 bg-white text-black rounded-lg font-semibold"
        >
          I am a Seeker
        </button>
        <button
          onClick={() => selectRole("provider")}
          className="px-5 py-2 bg-white text-black rounded-lg font-semibold"
        >
          I am a Provider
        </button>
      </div>
    </div>
  );
}
