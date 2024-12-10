import React, { useState } from 'react';
import { Box, Text, Button, VStack, Portal } from '@chakra-ui/react';

const tutorialSteps = [
  { id: 'language', message: "Select your language", position: { top: '60px', left: '20px' } },
  { id: 'roomId', message: "Copy roomId to add users", position: { bottom: '120px', left: '20px' } },
  { id: 'runCode', message: "Run your code", position: { top: '60px', right: '20px' } },
  { id: 'chatAI', message: "Chat with AI", position: { bottom: '20px', right: '20px' } },
  { id: 'users', message: "See the connected users", position: { top: '100px', left: '20px' } },
  { id: 'saveLeave', message: "Don't forget to save the code before leaving", position: { bottom: '20px', left: '20px' } },
];

const Tutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <Portal>
      {/* Background overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0,0,0,0.5)"
        zIndex={1000}
      />
      
      {/* Tutorial steps */}
      {tutorialSteps.map((step, index) => (
        <Box
          key={step.id}
          position="fixed"
          {...step.position}
          backgroundColor="white"
          padding={4}
          borderRadius="md"
          boxShadow="lg"
          zIndex={1001}
          display={index === currentStep ? 'block' : 'none'}
        >
          <Text>{step.message}</Text>
          <Button onClick={nextStep} mt={2}>
            {index < tutorialSteps.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </Box>
      ))}
    </Portal>
  );
};

export default Tutorial;