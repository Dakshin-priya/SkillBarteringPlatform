import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function SkillListingPage() {
  const { currentUser } = useContext(AuthContext);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const skillList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.skillsOffered && doc.id !== currentUser?.uid) {
          data.skillsOffered.forEach((skill) => {
            skillList.push({ userId: doc.id, skill, userName: data.displayName });
          });
        }
      });
      setSkills(skillList);
    };
    fetchSkills();
  }, [currentUser]);

  const filteredSkills = skills.filter((item) =>
    item.skill.toLowerCase().includes(search.toLowerCase()) &&
    (category ? item.skill.includes(category) : true)
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Browse Skills</h2>
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
        {filteredSkills.map((item, idx) => (
          <div key={idx} className="p-4 border rounded shadow">
            <h3 className="font-semibold">{item.skill}</h3>
            <p>Offered by: {item.userName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillListingPage;