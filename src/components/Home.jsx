import {React, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {v4 as uuid} from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const [roomId, setroomId] = useState("");
  const [username, setusername] = useState("");
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const navigate = useNavigate();

  const handleChange = (e) => {
    setroomId(e.target.value);
    
  }
  

  const generateRoomId = (e) => {

    e.preventDefault();
    const id = uuid();
    setroomId(id);
    toast.success("Room Id is Generated Successfully")

    
  }

  const registerUser = async (e)=>{
    e.preventDefault()

    
    
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/register`,{

      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId,
        username, 
        email, 
        password,
        role
      }),
    } )

    const data = await response.json()
    console.log(data);

    if (!roomId || !username || !email || !password || !role) {
      toast.error('Please fill in all fields or check you email if it exists');
      return;
  }

    if (data.status === 'ok') {
      toast.success('Registration Successful');
      joinRoom();
    } else {
      if (data.error && Array.isArray(data.error)) {
        data.error.forEach(errorMessage => toast.error(errorMessage));
    } else {
        toast.error('Check for existing credentials or try again later');
    }
    }

  }

  const loginUser = async (e)=>{

    e.preventDefault()

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/login`,{

      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        
        username, 
        email, 
        password,

      }),
    } )

    const data = await response.json()
    console.log(data)

    if (data.user) {
      localStorage.setItem('token', data.user)
      toast.success('Login successful');
      //redirect user to the code editor
      joinRoom();
    } else {
      if (data.error && Array.isArray(data.error)) {
        data.error.forEach(errorMessage => toast.error(errorMessage));
    } else {
        toast.error('Invalid credentials. Please try again.');
    }
    }

  }

  const joinRoom = () => {

    if(!roomId || !username){
      toast.error("Both the fields should be filled");
      return;

    }
    navigate(`/Editor/${roomId}`, {
      state: {username},
    });

    toast.success("Room is created");

    
  }
  
  
  return (

    <div className="container-fluid ">
      <div className="row flex justify-center items-center min-vh-100 min-h-screen">


        <div className='col-12 col-md-6'>
          <div className="card shadow-sm p-2 mb-5 bg-secondry rounded">
            <div className="p-10 card-body text-center border-2 border-[#9a86d4] rounded-3xl ">

              <div className='flex justify-center items-center p-10'>

                <img width={60} className='invert' src="logo.svg" alt="logo" /> <h1 className='text-white font-bold text-3xl'>CDE</h1>


              </div>
              <h4 className='text-white p-2'>Enter Room Id</h4>
              <div className="form-group">

                <input value={roomId} onChange={handleChange}  type="text" className='form-control mb-2 block w-full px-4 py-2 text-white bg-[#1a1326] border border-[#9a86d4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c6b0ff] placeholder-gray-400' placeholder='Room Id' />
                
                <input
                value={username} onChange={(e) => {
                  setusername(e.target.value)
                  
                }
                }
                type="text" className='form-control mb-2 block w-full px-4 py-2 text-white bg-[#1a1326] border border-[#9a86d4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c6b0ff] placeholder-gray-400' placeholder='Username' />

                <input 
                value={email} onChange={(e) => {
                  setEmail(e.target.value)
                  
                }
                }
                type="email" className='form-control mb-2 block w-full px-4 py-2 text-white bg-[#1a1326] border border-[#9a86d4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c6b0ff] placeholder-gray-400' placeholder='Email' />

              <input 
                value={password} onChange={(e) => {
                  setPassword(e.target.value)
                  
                }
                }
                type="password" className='form-control mb-2 block w-full px-4 py-2 text-white bg-[#1a1326] border border-[#9a86d4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c6b0ff] placeholder-gray-400' placeholder='Password' />

              <select
                value={role} onChange={(e) => {
                  setRole(e.target.value)
                  
                }
                }
                type="selectlist" className='form-control mb-2 block w-full px-4 py-2 text-white bg-[#1a1326] border border-[#9a86d4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c6b0ff] placeholder-gray-400' placeholder='ROLE' >
                  <option value="">Select Role</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Member">Member</option>
                   </select>
              </div>

              <button
              
              onClick={registerUser}
              className='m-5 px-6 py-3 bg-[#5ac18e] text-[#0f0a19] font-semibold rounded-lg shadow-md hover:bg-[#48a178] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ac18e] transition duration-300 ease-in-out'>Register</button>
               
               <button  onClick={loginUser}
              className='m-5 px-6 py-3 bg-[#5ac18e] text-[#0f0a19] font-semibold rounded-lg shadow-md hover:bg-[#48a178] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ac18e] transition duration-300 ease-in-out'>
                Login
              </button>


              <p className='mt-3 text-white'>Don't have a Room Id? <span 
              className='text-green-500 cursor-pointer'
              onClick={generateRoomId}
              
              >New Room</span></p>

             






            </div>
          </div>

        </div>


      </div>
    </div>
  )
}

export default Home
