import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../utils/AuthContext';

const CustomNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {token,logout} = useAuth();

  const handleLogout = ()=>{
    logout();
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='w-full bg-white border-b border-gray-200'>
      <nav className='max-w-4xl mx-auto flex w-full h-16 items-center justify-between px-4 text-black'>
        <div className='flex items-center'>
          <Link to={'/'}>
            <h2 className='text-3xl font-medium'>webdevmonk</h2>
          </Link>
        </div>
        
        <div className='hidden md:flex items-center gap-6'>
          <Link 
            to={'/tutorials'} 
            className='text-lg hover:underline'
          >
            Tutorials
          </Link>
          
          <Link 
            to={'/projects'} 
            className='text-lg hover:underline'
          >
            Projects
          </Link>
          {token && 
          <Link 
            to={'/dashboard'} 
            className='text-lg hover:underline'
          >
            Dashboard
          </Link>
          } 
          {token && 
            <button
            onClick={handleLogout}
            className='text-lg hover:underline'
          >
            Logout
          </button>
          }
        </div>
        
        <div className='md:hidden flex items-center'>
          <button onClick={toggleMenu} className='focus:outline-none p-1'>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      
      {isOpen && (
        <div className='md:hidden border-t border-gray-100'>
          <div className='max-w-4xl mx-auto flex flex-col'>
            <Link 
              to={'/tutorials'} 
              className='py-3 px-4 border-b border-gray-50 text-sm'
            >
              Tutorials
            </Link>
            <Link 
              to={'/projects'} 
              className='py-3 px-4 text-sm'
            >
              Projects
            </Link>
            {token && 
          <Link 
            to={'/dashboard'} 
            className='py-3 px-4 text-sm'
          >
            Dashboard
          </Link>
          } 
          {token && 
            <button
            onClick={handleLogout}
            className='py-3 px-4 text-sm'
          >
            Logout
          </button>
          }
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CustomNavbar;