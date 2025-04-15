import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

function ChatPage() {
  const { currentUser } = useContext(AuthContext);
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, `chats/${matchId}/messages`), orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgList = [];
        snapshot.forEach((doc) => {
          msgList.push(doc.data());
        });
        setMessages(msgList);
      });
      return () => unsubscribe();
    }
  }, [currentUser, matchId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, `chats/${matchId}/messages`), {
        text: newMessage,
        sender: currentUser.uid,
        timestamp: new Date()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Chat error:', error);
      alert(error.message);
    }
  };

  if (!currentUser) return <div>Please log in</div>;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      <div className="border rounded p-4 h-96 overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded ${msg.sender === currentUser.uid ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}
          >
            <p>{msg.text}</p>
            <p className="text-xs text-gray-500">{new Date(msg.timestamp?.seconds * 1000).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPage;