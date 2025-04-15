import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function MarketplacePage() {
  const { currentUser } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const serviceList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.skillsOffered && doc.id !== currentUser?.uid) {
          data.skillsOffered.forEach((skill) => {
            serviceList.push({
              userId: doc.id,
              skill,
              userName: data.displayName,
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

  const handleOffer = (userId) => {
    navigate(`/swipe?target=${userId}`);
  };

  if (!currentUser) return <div>Please log in</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Marketplace</h2>
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
            <h3 className="font-semibold">{item.skill}</h3>
            <p>Offered by: {item.userName}</p>
            <p>Points: {item.points}</p>
            <button
              onClick={() => handleOffer(item.userId)}
              className="mt-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Offer Barter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketplacePage;