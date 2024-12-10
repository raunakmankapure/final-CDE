import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Input, VStack, Text, Flex, CloseButton } from '@chakra-ui/react';
import toast from 'react-hot-toast'
const ChatModule = ({ socket, username, roomId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(1);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on('chat-message', (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });

      socket.on('user-count', (count) => {
        setUserCount(count);
      });
    }

    return () => {
      if (socket) {
        socket.off('chat-message');
        socket.off('user-count');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && socket) {
      socket.emit('send-message', { roomId, username, message });
      setMessage('');
    }
  };

  const toggleChat = () => {
    if (userCount <= 1) {
      toast.error("Add more users to App");
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <Box position="fixed" top="20px" right="20px" zIndex="1000">
      <Button colorScheme="teal" onClick={toggleChat} size="lg">
        Chat
      </Button>
      {isOpen && (
        <Box
          width="300px"
          height="400px"
          bg="white"
          borderRadius="md"
          boxShadow="lg"
          p={4}
          mt={2}
        >
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">Team Chat</Text>
            <CloseButton onClick={() => setIsOpen(false)} />
          </Flex>
          <VStack
            height="300px"
            overflowY="auto"
            spacing={2}
            align="stretch"
            mb={2}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                bg={msg.username === username ? 'teal.100' : 'gray.100'}
                p={2}
                borderRadius="md"
              >
                <Text fontWeight="bold">{msg.username}</Text>
                <Text>{msg.message}</Text>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
          <Flex>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              mr={2}
            />
            <Button onClick={handleSend} colorScheme="teal">
              Send
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default ChatModule;