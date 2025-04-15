import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function SwipePage() {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser?.uid) {
          userList.push({ id: doc.id, ...doc.data() });
        }
      });
      setUsers(userList);
    };
    fetchUsers();
  }, [currentUser]);

  const handleSwipe = async (direction) => {
    if (!currentUser || currentIndex >= users.length) return;
    const targetUser = users[currentIndex];
    if (direction === 'right') {
      await setDoc(doc(db, 'matches', `${currentUser.uid}_${targetUser.id}`), {
        user1: currentUser.uid,
        user2: targetUser.id,
        status: 'pending'
      });
    }
    setCurrentIndex(currentIndex + 1);
  };

  if (!currentUser) return <div>Please log in</div>;
  if (currentIndex >= users.length) return <div>No more users to swipe</div>;

  const currentUserProfile = users[currentIndex];

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Swipe to Match</h2>
      <div className="border rounded p-4 shadow">
        <h3 className="font-semibold">{currentUserProfile?.displayName}</h3>
        <p>Offers: {currentUserProfile?.skillsOffered?.join(', ')}</p>
        <p>Needs: {currentUserProfile?.skillsNeeded?.join(', ')}</p>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => handleSwipe('left')}
            className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
          >
            Pass
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Like
          </button>
        </div>
      </div>
    </div>
  );
}

export default SwipePage;