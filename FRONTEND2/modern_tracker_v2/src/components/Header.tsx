// src/components/Header.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faBell, faUser, faBars, faGlobe,
  faCog, faSignOutAlt, faUserCircle, faSignInAlt,
  faKey, faExclamationTriangle, faTimes 
} from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
  onMenuClick: () => void;
}

interface SerialKeyData {
  key: string;
  start_date: string;
  end_date: string;
  is_valid: boolean;
  allow_hr: boolean; 
  allow_finance: boolean; // ADDED: So the frontend knows about Finance access
}

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  employer_shop?: number;
  serial_key?: SerialKeyData;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const router = useRouter();
  
  // -- UI STATES --
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false); 
  const [renewalKey, setRenewalKey] = useState("");                
  const [selectedPlan, setSelectedPlan] = useState<{title: string, price: string} | null>(null);
  
  // -- DATA STATES --
  const [user, setUser] = useState<UserData | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasActiveTimer, setHasActiveTimer] = useState(false);
  const [isExpired, setIsExpired] = useState(false); 
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchUserData();
  }, []);

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
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  // -- TIMER LOGIC --
  useEffect(() => {
    if (!user?.serial_key?.end_date) {
      setHasActiveTimer(false);
      setIsExpired(false);
      return;
    }

    const targetDate = new Date(user.serial_key.end_date).getTime();
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setHasActiveTimer(true);
        setIsExpired(false);
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        setHasActiveTimer(false);
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  // -- KEY INPUT FORMATTER --
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (raw.length > 16) raw = raw.slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    const formatted = parts ? parts.join("-") : raw;
    setRenewalKey(formatted);
  };

  const handleRenewSubmit = async () => {
    if (!renewalKey) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/activate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ key: renewalKey }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("License Activated Successfully!");
        setIsRenewModalOpen(false);
        setSelectedPlan(null);
        setRenewalKey("");
        fetchUserData(); 
      } else {
        alert(data.error || "Activation failed.");
      }
    } catch (error) {
      console.error("Activation Error:", error);
      alert("Something went wrong connecting to the server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");
    setUser(null);
    router.push("/login");
  };

  const getDisplayName = () => {
    if (!user) return "Guest";
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    return user.phone_number;
  };

  return (
    <>
      <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden text-gray-500 hover:text-blue-600 focus:outline-none">
            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
          </button>
          <button className="hidden md:flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition">
            <FontAwesomeIcon icon={faGlobe} className="w-3 h-3" />
            Browse Website
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative hidden sm:block">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-40 md:w-64 text-gray-900" />
          </div>

          <div className="relative cursor-pointer">
            <FontAwesomeIcon icon={faBell} className="text-gray-500 w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2 border border-white"></span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-green-200 transition focus:outline-none ${user ? 'bg-green-100' : 'bg-gray-100'}`}
            >
               <FontAwesomeIcon icon={faUser} className={`${user ? 'text-green-600' : 'text-gray-500'} w-4 h-4`} />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 z-20 overflow-hidden animation-fade-in-up">
                  
                  {user ? (
                    <>
                      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-800">{getDisplayName()}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">{user.role}</span>
                      </div>

                      {isMounted && (
                        <div className={`px-5 py-3 border-b border-gray-100 ${hasActiveTimer ? 'bg-blue-50/50' : isExpired ? 'bg-red-50' : 'bg-gray-50'}`}>
                          
                          {hasActiveTimer && (
                            <>
                              <p className="text-[10px] uppercase font-bold text-blue-800 mb-2 tracking-wider text-center">License Expires In</p>
                              <div className="flex justify-between items-center gap-2 text-center">
                                {['Days', 'Hrs', 'Min', 'Sec'].map((label, i) => (
                                  <div key={label} className="flex flex-col items-center bg-white p-2 rounded-lg shadow-sm w-14">
                                    <span className="text-lg font-bold text-blue-600 leading-none">
                                      {Object.values(timeLeft)[i]}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-medium uppercase mt-1">{label}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 text-center">
                                  <span className="text-[10px] text-gray-400 font-mono bg-white px-2 py-1 rounded border border-gray-100">KEY: {user.serial_key?.key}</span>
                              </div>
                            </>
                          )}

                          {isExpired && (
                            <div className="text-center py-2">
                              <div className="flex justify-center mb-2">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 w-5 h-5" />
                                </div>
                              </div>
                              <p className="text-sm font-bold text-red-600 mb-1">License Expired</p>
                              <p className="text-[10px] text-gray-500 mb-3">Your serial key is no longer valid.</p>
                              <button 
                                onClick={() => { setIsProfileOpen(false); setIsRenewModalOpen(true); }}
                                className="w-full bg-red-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-600 transition shadow-sm"
                              >
                                Renew License
                              </button>
                            </div>
                          )}

                          {!hasActiveTimer && !isExpired && (
                             <div className="text-center py-2">
                               <FontAwesomeIcon icon={faKey} className="text-gray-300 w-6 h-6 mb-2" />
                               <p className="text-xs text-gray-500 font-medium">No Active License</p>
                               <button 
                                  onClick={() => { setIsProfileOpen(false); setIsRenewModalOpen(true); }}
                                  className="mt-2 text-[10px] text-blue-600 font-bold hover:underline"
                               >
                                  Enter Serial Key
                               </button>
                             </div>
                          )}
                        </div>
                      )}

                      <div className="py-2">
                        {user.role === 'ADMIN' ? (
                          <button onClick={() => { setIsProfileOpen(false); router.push("/admin-dashboard"); }} className="w-full text-left px-5 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors font-bold">
                            <FontAwesomeIcon icon={faUserCircle} className="w-4 h-4 text-blue-500" />
                            Admin Dashboard
                          </button>
                        ) : (
                          <button className="w-full text-left px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-3 transition-colors">
                            <FontAwesomeIcon icon={faUserCircle} className="w-3 h-3" />
                            My Profile
                          </button>
                        )}
                        <button className="w-full text-left px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-3 transition-colors">
                          <FontAwesomeIcon icon={faCog} className="w-3 h-3" />
                          Account Settings
                        </button>
                      </div>

                      <div className="border-t border-gray-100 py-2">
                        <button onClick={handleLogout} className="w-full text-left px-5 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
                          <FontAwesomeIcon icon={faSignOutAlt} className="w-3 h-3" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500 mb-4">You are not logged in.</p>
                      <button onClick={() => router.push("/login")} className="w-full bg-[#0f1535] text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faSignInAlt} className="w-3 h-3" />
                        Login Now
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRenewModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 md:p-8 overflow-hidden animation-scale-up">
            
            <button 
              onClick={() => {
                setIsRenewModalOpen(false);
                setSelectedPlan(null);
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
               <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FontAwesomeIcon icon={faKey} className="text-blue-600 w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Choose a Plan or Activate</h2>
              <p className="text-sm text-gray-500 mt-1">Select a subscription plan below, or enter a serial key if you already have one.</p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* 1 Month */}
                <div 
                  onClick={() => setSelectedPlan({title: '1 Month', price: '999 Birr'})}
                  className={`bg-white border-2 rounded-xl p-5 text-center transition-colors cursor-pointer group shadow-sm hover:shadow-md ${selectedPlan?.title === '1 Month' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100 hover:border-gray-300'}`}
                >
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">1 Month</p>
                    <p className="text-2xl font-bold text-[#0f1535] mt-3">999<span className="text-sm text-gray-400 ml-1">Birr</span></p>
                </div>
                
                {/* 3 Months */}
                <div 
                  onClick={() => setSelectedPlan({title: '3 Months', price: '2,997 Birr'})}
                  className={`bg-white border-2 rounded-xl p-5 text-center transition-colors cursor-pointer group shadow-sm hover:shadow-md ${selectedPlan?.title === '3 Months' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100 hover:border-gray-300'}`}
                >
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">3 Months</p>
                    <p className="text-2xl font-bold text-[#0f1535] mt-3">2,997<span className="text-sm text-gray-400 ml-1">Birr</span></p>
                </div>

                {/* 6 Months */}
                <div 
                  onClick={() => setSelectedPlan({title: '6 Months', price: '4,995 Birr'})}
                  className={`bg-blue-50 border-2 rounded-xl p-5 text-center transition-colors cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md ${selectedPlan?.title === '6 Months' ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-blue-200 hover:border-blue-400'}`}
                >
                    <div className="absolute top-0 inset-x-0 bg-blue-500 text-white text-[10px] font-bold py-1 uppercase tracking-widest">1 Month Free</div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mt-4">6 Months</p>
                    <p className="text-2xl font-bold text-blue-900 mt-3">4,995<span className="text-sm text-blue-600/70 ml-1">Birr</span></p>
                </div>

                {/* 12 Months */}
                <div 
                  onClick={() => setSelectedPlan({title: '12 Months', price: '9,990 Birr'})}
                  className={`bg-green-50 border-2 rounded-xl p-5 text-center transition-colors cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md ${selectedPlan?.title === '12 Months' ? 'border-green-600 ring-2 ring-green-500/30' : 'border-green-200 hover:border-green-400'}`}
                >
                    <div className="absolute top-0 inset-x-0 bg-green-500 text-white text-[10px] font-bold py-1 uppercase tracking-widest">2 Months Free</div>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mt-4">12 Months</p>
                    <p className="text-2xl font-bold text-green-900 mt-3">9,990<span className="text-sm text-green-600/70 ml-1">Birr</span></p>
                </div>
            </div>

            {/* Payment Details Section */}
            {selectedPlan && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8 text-left animate-in fade-in duration-300">
                <h3 className="font-bold text-gray-800 mb-2">Complete payment for {selectedPlan.title} ({selectedPlan.price})</h3>
                <p className="text-xs text-gray-600 mb-4">Transfer the total amount using one of the methods below, then contact our support team with a screenshot of your receipt to receive your activation key.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Telebirr */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Telebirr</p>
                    <p className="font-mono text-lg font-bold text-[#00B4D8]">0911234567</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Name: Modern Tracker</p>
                  </div>
                  
                  {/* CBE */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">CBE (Commercial Bank)</p>
                    <p className="font-mono text-lg font-bold text-[#5A189A]">1000123456789</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Name: Modern Tracker</p>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Already have a key?</span>
                <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={renewalKey}
                onChange={handleKeyChange}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full text-center text-lg font-mono tracking-widest py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-800 placeholder-gray-300 uppercase transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsRenewModalOpen(false);
                  setSelectedPlan(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleRenewSubmit}
                className="flex-1 py-3 bg-[#0f1535] text-white rounded-xl font-bold text-sm hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition transform active:scale-[0.98]"
              >
                Activate Key
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Header;