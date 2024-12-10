import React from 'react'
import Avatar from 'react-avatar';
import { Box } from 'lucide-react';

const Client = ({username, isEditing}) => {
  return (
    <div className='flex items-center mb-3'>

        <Avatar name={username.toString() } size={50} round="14px" 
        className='mr-3 p-4'
        />

        <span className='mx-2 p-2 text-xl'>{username.toString()}</span>
        <Box
        style={{
          width: '30px',
          height: '20px',
          borderRadius: '80%',
          backgroundColor: isEditing ? 'green' : 'transparent',
          marginRight: '8px',
        }}
      />
      
    </div>
  )
}

export default Client
