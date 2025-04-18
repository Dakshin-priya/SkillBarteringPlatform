import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { blue, grey } from '@mui/material/colors';

function ChatPage() {
  const { currentUser } = useContext(AuthContext);
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [messageToEdit, setMessageToEdit] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState(null);

  // Fetch messages from Firestore
  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, `chats/${matchId}/messages`),
        orderBy('timestamp')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgList = [];
        snapshot.forEach((doc) => {
          msgList.push({ id: doc.id, ...doc.data() });
        });
        setMessages(msgList); // Update state with real-time messages
      });
      return () => unsubscribe();
    }
  }, [currentUser, matchId]);

  // Send a new message
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, `chats/${matchId}/messages`), {
        text: newMessage,
        sender: currentUser.uid,
        timestamp: new Date(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Chat error:', error);
      alert(error.message);
    }
  };

  // Edit an existing message
  const handleEditMessage = async () => {
    if (!messageToEdit.trim() || !selectedMessageId) return;

    try {
      // Update the message in Firestore
      await updateDoc(doc(db, `chats/${matchId}/messages`, selectedMessageId), {
        text: messageToEdit,
        timestamp: new Date(), // Force update to trigger UI refresh
      });

      // Immediately update the message in the local state to reflect the change
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === selectedMessageId ? { ...msg, text: messageToEdit } : msg
        )
      );

      // Reset the editing state
      setEditingMessage(false);
      setMessageToEdit('');
      setSelectedMessageId(null);
    } catch (error) {
      console.error('Edit message error:', error);
      alert(error.message);
    }
  };

  // Delete a message
  const handleDeleteMessage = async () => {
    if (!selectedMessageId) return;

    try {
      await deleteDoc(doc(db, `chats/${matchId}/messages`, selectedMessageId));

      // Remove the deleted message from the local state immediately
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== selectedMessageId)
      );

      setEditingMessage(false);
      setMessageToEdit('');
      setSelectedMessageId(null);
      setAnchorEl(null);
    } catch (error) {
      console.error('Delete message error:', error);
      alert(error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleMenuClick = (event, messageId, currentText) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
    setMessageToEdit(currentText);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessageId(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(false);
    setMessageToEdit('');
    setSelectedMessageId(null);
  };

  const handleReadMore = (messageId) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  const handleTextAreaChange = (e) => {
    setMessageToEdit(e.target.value);
  };

  if (!currentUser) return <div>Please log in</div>;

  return (
    <Box sx={{ maxWidth: '90%', margin: '2rem auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          Skill Bartering Chat
        </Typography>

        <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent:
                  msg.sender === currentUser.uid ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  width: '30%',
                  maxWidth: '30%',
                  backgroundColor:
                    msg.sender === currentUser.uid ? blue[100] : grey[100],
                  borderRadius: 2,
                  boxShadow: 2,
                  p: 2,
                }}
              >
                <Box sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                  <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                    {expandedMessageId === msg.id
                      ? msg.text
                      : msg.text.length > 100
                      ? `${msg.text.slice(0, 100)}...`
                      : msg.text}
                  </Typography>
                  {msg.text.length > 100 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: 'right',
                        color: blue[600],
                        cursor: 'pointer',
                      }}
                      onClick={() => handleReadMore(msg.id)}
                    >
                      {expandedMessageId === msg.id ? 'Read Less' : 'Read More'}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', textAlign: 'right', color: grey[600] }}
                  >
                    {new Date(msg.timestamp?.seconds * 1000).toLocaleTimeString()}
                  </Typography>
                </Box>

                {msg.sender === currentUser.uid && (
                  <IconButton
                    onClick={(e) => handleMenuClick(e, msg.id, msg.text)}
                    size="small"
                    sx={{ position: 'absolute', top: 5, right: 5 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && selectedMessageId === msg.id}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    setEditingMessage(true);
                    setAnchorEl(null);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteMessage}>Delete</MenuItem>
              </Menu>
            </Box>
          ))}
        </Box>

        {editingMessage && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={messageToEdit}
              onChange={handleTextAreaChange}
              multiline
              placeholder="Edit your message"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                onClick={handleEditMessage}
                variant="contained"
                color="primary"
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button onClick={handleCancelEdit} variant="outlined" color="secondary">
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Type a message..."
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <IconButton color="primary" onClick={handleSend} sx={{ ml: 1 }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default ChatPage;
