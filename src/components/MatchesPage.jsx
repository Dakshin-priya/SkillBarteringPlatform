import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

function MatchesPage() {
  const { currentUser } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const fetchMatches = async () => {
        const querySnapshot = await getDocs(collection(db, 'matches'));
        const matchList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.user1 === currentUser.uid || data.user2 === currentUser.uid) {
            matchList.push({ id: doc.id, ...data });
          }
        });
        setMatches(matchList);
      };
      fetchMatches();
    }
  }, [currentUser]);

  const handleAccept = async (matchId) => {
    await updateDoc(doc(db, 'matches', matchId), { status: 'accepted' });
    setMatches(matches.map((m) => (m.id === matchId ? { ...m, status: 'accepted' } : m)));
  };

  const handleComplete = async (matchId) => {
    await updateDoc(doc(db, 'matches', matchId), { status: 'completed' });
    const userDoc = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userDoc);
    await setDoc(userDoc, { ...userSnap.data(), points: (userSnap.data().points || 0) + 10 });
    setMatches(matches.map((m) => (m.id === matchId ? { ...m, status: 'completed' } : m)));
  };

  if (!currentUser) return <div>Please log in</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="p-4 border rounded shadow">
            <p>Match with User ID: {match.user1 === currentUser.uid ? match.user2 : match.user1}</p>
            <p>Status: {match.status}</p>
            {match.status === 'pending' && (
              <button
                onClick={() => handleAccept(match.id)}
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mr-2"
              >
                Accept
              </button>
            )}
            {match.status === 'accepted' && (
              <>
                <button
                  onClick={() => handleComplete(match.id)}
                  className="bg-green-600 text-white p-2 rounded hover:bg-green-700 mr-2"
                >
                  Complete Trade
                </button>
                <Link
                  to={`/chat/${match.id}`}
                  className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                  Chat
                </Link>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchesPage;