import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function SeekerPage() {
  const { currentUser } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      if (!currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userLocation = userDoc.data()?.location || '';
      const querySnapshot = await getDocs(collection(db, 'users'));
      const serviceList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.location === userLocation && doc.id !== currentUser?.uid && data.skillsOffered?.length > 0) {
          data.skillsOffered.forEach((skill) => {
            serviceList.push({
              userId: doc.id,
              skill,
              userName: data.displayName,
              photoURL: data.photoURL,
              skillsNeeded: data.skillsNeeded,
              points: data.points || 0
            });
          });
        }
      });
      setServices(serviceList);
    };
    fetchServices();
  }, [currentUser]);

  const filteredServices = services.filter((item) =>
    item.skill.toLowerCase().includes(search.toLowerCase()) &&
    (category ? item.skill.includes(category) : true)
  );

  const handleChat = (providerId) => {
    const matchId = [currentUser.uid, providerId].sort().join('_');
    navigate(`/chat/${matchId}`);
  };

  if (!currentUser) return <div>Please log in</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Available Services in {currentUser?.location || 'Your Area'}</h2>
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="flex-1 p-2 border rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="Design">Design</option>
          <option value="Coding">Coding</option>
          <option value="Tutoring">Tutoring</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow">
            <img src={item.photoURL || 'https://via.placeholder.com/100'} alt="Provider" className="w-24 h-24 rounded-full mb-2 object-cover" />
            <h3 className="font-semibold">{item.skill}</h3>
            <p>Offered by: {item.userName}</p>
            <p>Points: {item.points}</p>
            <h4 className="font-medium mt-2">Expected in Return:</h4>
            <ul className="list-disc pl-5">
              {item.skillsNeeded.map((need, i) => (
                <li key={i}>{need}</li>
              ))}
            </ul>
            <button
              onClick={() => handleChat(item.userId)}
              className="mt-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Chat with Provider
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeekerPage;