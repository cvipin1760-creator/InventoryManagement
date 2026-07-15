import React, { useState, useRef, useEffect } from 'react';
import { Box, Fab, Paper, Typography, IconButton, TextField, Button, CircularProgress } from '@mui/material';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your AI Business Assistant. How can I help you with StockPilot today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    api.sendChatMessage(input)
      .then(res => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: res.response || 'I am sorry, I do not have a response right now.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      })
      .catch(err => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Error communicating with AI service.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: 80,
              right: 24,
              zIndex: 9999,
            }}
          >
            <Paper
              elevation={6}
              sx={{
                width: 350,
                height: 500,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0px 10px 40px rgba(0,0,0,0.1)'
              }}
            >
              {/* Header */}
              <Box sx={{
                p: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Bot size={24} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    AI Assistant
                  </Typography>
                </Box>
                <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
                  <X size={20} />
                </IconButton>
              </Box>

              {/* Chat Area */}
              <Box sx={{
                flexGrow: 1,
                p: 2,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: 'background.default'
              }}>
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        backgroundColor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                        color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 3,
                        borderTopRightRadius: msg.sender === 'user' ? 4 : 12,
                        borderTopLeftRadius: msg.sender === 'user' ? 12 : 4,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Typography variant="body2">{msg.text}</Typography>
                    </Paper>
                  </Box>
                ))}
                {isLoading && (
                  <Box sx={{ alignSelf: 'flex-start' }}>
                    <CircularProgress size={20} />
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 20,
                    }
                  }}
                />
                <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || isLoading}>
                  <Send size={20} />
                </IconButton>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Fab
        color="primary"
        aria-label="chat"
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
        }}
      >
        <MessageCircle />
      </Fab>
    </>
  );
};

export default Chatbot;
