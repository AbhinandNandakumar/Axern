import React from 'react'
import GradientText from './GradientText'
import { User } from 'lucide-react';

const Navbar = ({user}) => {
  console.log(user.photoURL);

  return (
    <div>
      <div className="navbar bg-gray-900/30 border-b-2 border-b-cyan-800 backdrop-blur-xl fixed z-30">
  <div className="navbar-start">
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-gray-900/50 rounded-box z-[1] mt-3 w-52 p-2">
        <li><a>Homepage</a></li>
        <li><a>History</a></li>
      </ul>
    </div>
  </div>
  <div className="navbar-center">
  <h1 className="text-2xl font-semibold mb-2"><GradientText
  colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
  animationSpeed={3}
  showBorder={false}
  className="custom-class p-2"
>
  Axern AI
</GradientText></h1>
  </div>
  <div className="navbar-end">
  {user.photoURL ? (
            <div className="flex items-center gap-3">
              <img 
                src={user.photoURL} 
                alt="User Profile" 
                className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-md"
              />
            </div>
          ) : (
            <button className='p-2 rounded-full mr-2'>
              <User className="w-6 h-6   shadow-md " />
            </button>
            
          )}
  </div>
</div>
    </div>
  )
}

export default Navbar