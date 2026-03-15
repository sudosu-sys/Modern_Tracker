"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBox,
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
  faBriefcase // ADDED for HR Icon
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
  isOpen: boolean; 
  onClose: () => void; 
  isCollapsed: boolean; 
  toggleCollapse: () => void; 
}

// User Profile interfaces to check permissions
interface SerialKeyData {
  key: string;
  allow_hr: boolean;
}

interface UserData {
  serial_key?: SerialKeyData;
}

const Sidebar = ({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) => {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  // Fetch user data to determine HR access
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/me/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user permissions", error);
      }
    };

    fetchUserData();
  }, []);

  const toggleMenu = (name: string) => {
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
        { name: "Dashboard", icon: faHome, path: "/" },
        {
          name: "Inventory", 
          icon: faBox,
          subItems: [
            { name: "Inventory List", path: "/inventory" },
            { name: "Add Item", path: "/inventory/create" },
            { name: "Reviews", path: "/inventory/reviews" }
          ],
        },
        // --- CHANGED: Categories replaced with HR & Payroll ---
        {
          name: "HR and Payroll",
          icon: faBriefcase,
          requires_hr: true, // Custom flag to hide if no permission
          subItems: [
            { name: "Employee Directory", path: "/hr#employees" },
            { name: "Time & Attendance", path: "/hr#attendance" },
            { name: "Payroll Dashboard", path: "/hr#payroll" },
            { name: "Leave Requests", path: "/hr#leaves" }
          ],
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-[#0f1535] text-gray-400 z-40 transition-all duration-300 ease-in-out overflow-y-auto custom-scrollbar
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${isCollapsed ? "w-20" : "w-64"} 
        `}
      >
        <div className={`p-6 flex items-center sticky top-0 bg-[#0f1535] z-10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
             <h1 className="text-white text-2xl font-bold tracking-wider">Modern Tracker</h1>
          )}
          
          <span className="text-xs cursor-pointer md:hidden text-white" onClick={onClose}>✕</span>

          <button 
             onClick={toggleCollapse}
             className="hidden md:block text-gray-400 hover:text-white focus:outline-none"
          >
             <FontAwesomeIcon icon={isCollapsed ? faBars : faChevronLeft} className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 px-4 pb-6">
          {menuItems.map((group, idx) => (
            <div key={idx}>
              {group.section && !isCollapsed && (
                <p className="text-[11px] font-bold text-gray-500 uppercase mt-6 mb-3 px-3 tracking-wider transition-opacity duration-300">
                  {group.section}
                </p>
              )}
              
              {group.section && isCollapsed && (
                 <div className="h-px bg-gray-800 my-4 mx-2"></div>
              )}

              {/* Conditional Rendering logic added here */}
              {group.items &&
                group.items
                  .filter((item: any) => {
                    // If the item requires HR access, ensure the user has the allow_hr boolean set to true
                    if (item.requires_hr) {
                      return user?.serial_key?.allow_hr === true;
                    }
                    return true;
                  })
                  .map((item: any) => (
                  <div key={item.name} className="mb-1">
                    <div
                      onClick={() => {
                        if (item.subItems) {
                          toggleMenu(item.name);
                        } else if (item.path) {
                          router.push(item.path);
                        }
                      }}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 
                        ${item.active ? "text-blue-500" : expandedMenu === item.name ? "text-gray-100" : "hover:bg-gray-800 hover:text-gray-200"}
                        ${isCollapsed ? "justify-center" : "justify-between"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 transition-all duration-300 ${isCollapsed ? "w-5 h-5" : ""}`} />
                        
                        {!isCollapsed && (
                           <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                        )}
                      </div>

                      {!isCollapsed && item.subItems && (
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className={`w-3 h-3 transition-transform duration-200 ${
                            expandedMenu === item.name ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </div>

                    {!isCollapsed && item.subItems && expandedMenu === item.name && (
                      <div className="mt-1 ml-4 space-y-1 pl-3 border-l border-gray-700">
                        {item.subItems.map((sub: any, subIdx: number) => (
                          <div
                            key={subIdx}
                            onClick={() => router.push(sub.path)}
                            className="flex items-center gap-2 p-2 rounded-md text-xs font-medium cursor-pointer text-gray-400 hover:text-blue-500 hover:bg-gray-800/50 transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                            {typeof sub === 'string' ? sub : sub.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}

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