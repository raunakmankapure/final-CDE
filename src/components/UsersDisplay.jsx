import { Box, Text, Avatar, Stack } from '@chakra-ui/react';
import React from 'react';

const UserDisplay = () => {
    // Sample user avatars
    const avatars = [
        'https://bit.ly/sage-adebayo',
        'https://bit.ly/prosper-baba',
        'https://bit.ly/ryan-florence',
        // Add more avatar URLs as needed
    ];

    return (
        <Box
            position="absolute"
            top={0}
            right={0}
            bg="#0f0a19"
            p={3} // Adjust padding
            borderBottom="1px solid"
            borderColor="gray.700"
            textAlign="center"
            zIndex={10}
            width="auto" // Adjust width
            maxWidth="300px" // Limit the maximum width
            display="flex"
            flexDirection="column" // Arrange text and avatars vertically
            alignItems="center"
            boxShadow="md" // Add subtle shadow for better separation
        >
            <Text 
                color="white" 
                fontSize="lg" // Font size to keep it readable
                fontWeight="bold"
                mb={2} // Margin bottom for spacing
            >
                Users
            </Text>
            <Stack direction="row" spacing={-2} align="center">
                {avatars.map((src, index) => (
                    <Avatar key={index} size="sm" src={src} /> // Avatar size
                ))}
            </Stack>
        </Box>
    );
};

export default UserDisplay;
