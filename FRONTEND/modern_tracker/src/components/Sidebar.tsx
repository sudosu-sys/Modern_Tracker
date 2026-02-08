// src/components/Sidebar.tsx
"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBox,
  faTags,
  faLayerGroup,
  faShoppingCart,
  faUsers,
  faUndo,
  faStore,
  faWallet,
  faComments,
  faCog,
  faTicketAlt,
  faUserCircle,
  faChevronRight,
  faGlobe,
  faSignOutAlt,
  faChevronLeft,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
  isOpen: boolean; // Mobile state
  onClose: () => void; // Mobile close
  isCollapsed: boolean; // Desktop collapsed state
  toggleCollapse: () => void; // Toggle desktop collapse
}

const Sidebar = ({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    // If collapsed, clicking an item shouldn't try to expand the sub-menu inline
    // You might want to auto-expand the sidebar here, but for now we'll just return
    if (isCollapsed) return;

    if (expandedMenu === name) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(name);
    }
  };

  const menuItems = [
    { section: "ADMIN", items: [] },
    {
      items: [
        { name: "Dashboard", icon: faHome, active: true },
        {
          name: "Products",
          icon: faBox,
          subItems: ["Product List", "Create Product", "Product Reviews"],
        },
        {
          name: "Categories",
          icon: faTags,
          subItems: ["Category List", "Add Category"],
        },
        {
          name: "Brands",
          icon: faLayerGroup,
          subItems: ["Brand List", "Add Brand"],
        },
        {
          name: "Orders",
          icon: faShoppingCart,
          subItems: ["Order List", "Order Details", "Invoice"],
        },
        { name: "Customers", icon: faUsers },
        {
          name: "Refunds",
          icon: faUndo,
          subItems: ["Refund Requests", "Approved Refunds"],
        },
        {
          name: "Sellers",
          icon: faStore,
          subItems: ["Seller List", "Seller Payouts", "Seller Reviews"],
        },
      ],
    },
    { section: "VENDOR", items: [] },
    {
      items: [
        {
          name: "Earnings",
          icon: faWallet,
          subItems: ["Earning History", "Payouts"],
        },
        { name: "Refund Request", icon: faUndo },
        { name: "Reviews", icon: faComments },
        { name: "Shop Setting", icon: faCog },
        { name: "Support Tickets", icon: faTicketAlt },
        { name: "Account Settings", icon: faUserCircle },
        { name: "Site Settings", icon: faGlobe },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#0f1535] text-gray-400 z-40 transition-all duration-300 ease-in-out overflow-y-auto custom-scrollbar
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${isCollapsed ? "w-20" : "w-64"} 
        `}
      >
        {/* Logo Area */}
        <div className={`p-6 flex items-center sticky top-0 bg-[#0f1535] z-10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {/* Logo Text (Hidden when collapsed) */}
          {!isCollapsed && (
             <h1 className="text-white text-2xl font-bold tracking-wider">Modern Tracker</h1>
          )}
          
          {/* Mobile Close Button */}
          <span className="text-xs cursor-pointer md:hidden text-white" onClick={onClose}>✕</span>

          {/* Desktop Collapse Button (The Arrow) */}
          <button 
             onClick={toggleCollapse}
             className="hidden md:block text-gray-400 hover:text-white focus:outline-none"
          >
             <FontAwesomeIcon icon={isCollapsed ? faBars : faChevronLeft} className="w-4 h-4" />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 px-4 pb-6">
          {menuItems.map((group, idx) => (
            <div key={idx}>
              {/* Section Header (Hidden when collapsed) */}
              {group.section && !isCollapsed && (
                <p className="text-[11px] font-bold text-gray-500 uppercase mt-6 mb-3 px-3 tracking-wider transition-opacity duration-300">
                  {group.section}
                </p>
              )}
              
              {/* Divider for collapsed mode to separate sections */}
              {group.section && isCollapsed && (
                 <div className="h-px bg-gray-800 my-4 mx-2"></div>
              )}

              {/* Menu Items */}
              {group.items &&
                group.items.map((item) => (
                  <div key={item.name} className="mb-1">
                    {/* Parent Item */}
                    <div
                      onClick={() =>
                        item.subItems ? toggleMenu(item.name) : null
                      }
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 
                        ${item.active ? "text-blue-500" : expandedMenu === item.name ? "text-gray-100" : "hover:bg-gray-800 hover:text-gray-200"}
                        ${isCollapsed ? "justify-center" : "justify-between"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 transition-all duration-300 ${isCollapsed ? "w-5 h-5" : ""}`} />
                        
                        {/* Text Label (Hidden when collapsed) */}
                        {!isCollapsed && (
                           <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                        )}
                      </div>

                      {/* Dropdown Arrow (Hidden when collapsed) */}
                      {!isCollapsed && item.subItems && (
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className={`w-3 h-3 transition-transform duration-200 ${
                            expandedMenu === item.name ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </div>

                    {/* Sub Menu Items (Hidden when collapsed) */}
                    {!isCollapsed && item.subItems && expandedMenu === item.name && (
                      <div className="mt-1 ml-4 space-y-1 pl-3 border-l border-gray-700">
                        {item.subItems.map((sub, subIdx) => (
                          <div
                            key={subIdx}
                            className="flex items-center gap-2 p-2 rounded-md text-xs font-medium cursor-pointer text-gray-400 hover:text-blue-500 hover:bg-gray-800/50 transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                            {sub}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}

          {/* Logout Button */}
          <div className={`mt-6 pt-6 border-t border-gray-800 px-3 ${isCollapsed ? '' : ''}`}>
            <div className={`flex items-center p-3 rounded-lg cursor-pointer text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors ${isCollapsed ? "justify-center" : "gap-3"}`}>
               <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
               {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;