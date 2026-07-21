import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ImageIcon from '@mui/icons-material/Image';
import PublicIcon from '@mui/icons-material/Public';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import waterDropsImg from '../../assets/WaterDropMenu.png';

const menuItems = [
  { id: 1, num: '01', title: 'Home', path: '/', icon: <HomeIcon /> },
  { id: 2, num: '02', title: 'Gallery', path: '/about#gallery', icon: <ImageIcon /> },
  { id: 3, num: '03', title: 'Destinations', path: '/countries', icon: <PublicIcon /> },
  { id: 4, num: '04', title: 'Visas', path: '/visas', icon: <AssignmentIcon /> },
  { id: 5, num: '05', title: 'Staff Slots', path: '/monthly-slots', icon: <EventAvailableIcon /> },
  { id: 6, num: '06', title: 'Latest Results', path: '/latest-results', icon: <TrendingUpIcon /> },
  { id: 7, num: '07', title: 'Notices', path: '/notices', icon: <NotificationsIcon /> },
  { id: 8, num: '08', title: 'Contact', path: '/contact', icon: <PhoneIcon /> },
  { id: 9, num: '09', title: 'Track Your Application', path: '/status-check', icon: <SendIcon /> },
  { id: 10, num: '10', title: 'About', path: '/about', icon: <PersonIcon /> },
];

export default function WaterDropMenu() {
  return (
    <div className="w-full max-w-[450px] mx-auto space-y-4 px-2">
      {menuItems.map((item) => (
        <Link 
          key={item.id} 
          to={item.path}
          className="relative flex items-center justify-between w-full h-[65px] sm:h-[75px] rounded-full overflow-hidden group transition-transform active:scale-95 drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)]"
        >
          {/* Background Pill Image */}
          <img 
            src={waterDropsImg} 
            alt="Menu Button Background" 
            className="absolute inset-0 w-full h-full object-fill z-0 pointer-events-none" 
          />

          {/* Absolute content overlays */}
          
          {/* Left Number */}
          <div className="absolute left-0 top-0 bottom-0 w-[22%] flex items-center justify-center z-10">
            <span className="text-white text-3xl sm:text-4xl font-black font-sans drop-shadow-md tracking-tighter">
              {item.num}
            </span>
          </div>

          {/* Title */}
          <div className="absolute left-[33%] top-0 bottom-0 flex items-center z-10">
            <span className="text-[#0a2373] text-[18px] sm:text-[21px] font-black font-sans tracking-tight leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              {item.title}
            </span>
          </div>
          
          {/* Right Icon */}
          {/* We position it over the circular dark blue part of the image */}
          <div className="absolute right-0 top-0 bottom-0 aspect-square flex items-center justify-center z-10 pr-2">
            <div className="text-white scale-90 sm:scale-100 flex items-center justify-center drop-shadow-md">
              {item.icon}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
