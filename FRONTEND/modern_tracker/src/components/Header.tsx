"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell, faUser, faBars, faGlobe } from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      {/* Left: Browse & Menu */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden text-gray-500 hover:text-blue-600 focus:outline-none"
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
        </button>

        <button className="hidden md:flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition">
          <FontAwesomeIcon icon={faGlobe} className="w-3 h-3" />
          Browse Website
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Search Bar (Hidden on small mobile) */}
        <div className="relative hidden sm:block">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-40 md:w-64"
          />
        </div>

        {/* Icons */}
        <div className="relative cursor-pointer">
          <FontAwesomeIcon icon={faBell} className="text-gray-500 w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2 border border-white"></span>
        </div>

        {/* Profile */}
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center cursor-pointer">
           <FontAwesomeIcon icon={faUser} className="text-green-600 w-4 h-4" />
        </div>
      </div>
    </header>
  );
};

export default Header;