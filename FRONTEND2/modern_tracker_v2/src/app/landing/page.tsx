"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight,
  faCheckCircle,
  faPlayCircle
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { BarChart, Bar, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";

const progressData = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 60 },
  { name: 'Wed', value: 85 },
  { name: 'Thu', value: 100 },
  { name: 'Fri', value: 75 },
  { name: 'Sat', value: 45 },
];

const financeData = [
  { name: 'W1', uv: 2000 },
  { name: 'W2', uv: 3500 },
  { name: 'W3', uv: 3000 },
  { name: 'W4', uv: 5500 },
  { name: 'W5', uv: 4500 },
  { name: 'W6', uv: 7000 },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-100 overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-6 pb-20 lg:pt-10 lg:pb-32 overflow-hidden">
        {/* Soft Ambient Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-blue-50/80 via-purple-50/30 to-white -z-10 pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[500px] rounded-full bg-blue-400/20 blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[400px] rounded-full bg-purple-400/10 blur-[100px] -z-10 pointer-events-none"></div>

        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto bg-white/40 backdrop-blur-md rounded-full border border-white/60 shadow-sm mb-16 lg:mb-24">
          <div className="flex items-center gap-2 px-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Ensure your logo file is named logo.png and placed in the public folder */}
              <Image src="/logo.png" alt="Modern Tracker Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-bold text-[#0f1535] tracking-wide">Modern Tracker</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#benefits" className="hover:text-blue-600 transition-colors">Benefits</a>
            <a href="#steps" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/login')} 
              className="text-sm font-bold text-[#0f1535] hover:text-blue-600 transition-colors px-4"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/signup')} 
              className="bg-[#0f1535] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-900 transition-transform active:scale-95 shadow-md shadow-[#0f1535]/10"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto px-6 text-center z-10 relative">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0f1535] leading-[1.1] tracking-tight mb-6">
            Simplify Business Management <br className="hidden md:block" />
            Boost Productivity
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
            Easily manage inventory, automate HR payroll, and handle accounting from start to finish in one unified platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={() => router.push('/signup')} 
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-transform active:scale-95 shadow-lg shadow-blue-600/20"
            >
              Get Started Free
            </button>
            <button 
              className="w-full sm:w-auto bg-white text-[#0f1535] border border-gray-200 px-8 py-3.5 rounded-full text-sm font-bold hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <FontAwesomeIcon icon={faPlayCircle} className="w-4 h-4 text-blue-600" /> Book a Demo
            </button>
          </div>
        </div>

        {/* Central Dashboard Mockup */}
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="rounded-2xl md:rounded-[2.5rem] bg-white/80 p-2 md:p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 backdrop-blur-xl">
            <div className="rounded-xl md:rounded-3xl bg-[#f8f9fc] border border-gray-100 w-full relative overflow-hidden flex flex-col">
              {/* Browser Header */}
              <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-2 bg-white shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-4 h-6 w-48 bg-gray-100 rounded-md"></div>
              </div>
              {/* Image Area */}
              <div className="relative w-full aspect-video bg-gray-50">
                <Image 
                  src="/dashboard-preview.png" 
                  alt="Modern Tracker Dashboard Preview" 
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        
      </section>

      {/* --- FEATURES (BENTO BOX) --- */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f1535] mb-4 tracking-tight">
            Unlock Premium Benefits With<br/>Our Advanced Features.
          </h2>
          <p className="text-gray-500 font-medium">Unlock premium benefits with advanced features designed to scale your operations effortlessly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Card 1: Spans 1 col */}
          <div className="bg-gray-50 rounded-3xl p-8 flex flex-col overflow-hidden border border-gray-100 group relative">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Smart Inventory Organization</h3>
            <p className="text-sm text-gray-500 mb-4 relative z-10">Track, categorize, and prioritize stock levels using flexible bins, locations, and thresholds.</p>
            <div className="mt-auto bg-white rounded-t-xl border border-gray-200 border-b-0 p-4 shadow-sm translate-y-2 group-hover:-translate-y-2 transition-transform flex flex-col gap-4 h-[220px] overflow-hidden">
               {/* Item 1 */}
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-gray-700">Premium Shirt</span>
                   <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">In Stock</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                   <div className="bg-green-500 h-1.5 rounded-full w-3/4"></div>
                 </div>
                 <p className="text-[9px] text-gray-400 text-right font-medium">300 / 400 Units</p>
               </div>
               {/* Item 2 */}
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-gray-700">Aavic Headphone</span>
                   <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">Low Stock</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                   <div className="bg-orange-400 h-1.5 rounded-full w-1/5"></div>
                 </div>
                 <p className="text-[9px] text-gray-400 text-right font-medium">12 / 60 Units</p>
               </div>
               {/* Item 3 */}
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-gray-700">Nike Shoes</span>
                   <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">In Stock</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                   <div className="bg-green-500 h-1.5 rounded-full w-[90%]"></div>
                 </div>
                 <p className="text-[9px] text-gray-400 text-right font-medium">45 / 50 Units</p>
               </div>
            </div>
          </div>

          {/* Card 2: Spans 1 col */}
          <div className="bg-blue-50/50 rounded-3xl p-8 flex flex-col overflow-hidden border border-blue-100 group relative">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Automated HR Workflows</h3>
            <p className="text-sm text-gray-500 mb-4 relative z-10">Streamline your workforce with automated payroll, attendance, and leave tracking.</p>
            <div className="mt-auto flex flex-col gap-2.5 translate-y-2 group-hover:-translate-y-2 transition-transform">
               {/* User 1 */}
               <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">JS</div>
                 <div className="flex-1">
                   <p className="text-xs font-bold text-gray-800">John Smith</p>
                   <p className="text-[9px] font-medium text-green-600 mt-0.5">Clocked In - 09:00 AM</p>
                 </div>
               </div>
               {/* User 2 */}
               <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs flex-shrink-0">EW</div>
                 <div className="flex-1">
                   <p className="text-xs font-bold text-gray-800">Emily Wong</p>
                   <p className="text-[9px] font-medium text-orange-500 mt-0.5">On Leave - Vacation</p>
                 </div>
               </div>
               {/* User 3 */}
               <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs flex-shrink-0">MJ</div>
                 <div className="flex-1">
                   <p className="text-xs font-bold text-gray-800">Michael Johnson</p>
                   <p className="text-[9px] font-medium text-gray-400 mt-0.5">Clocked Out - 05:00 PM</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Card 3: Spans 1 col, 2 rows */}
          <div className="bg-[#0f1535] rounded-3xl p-8 flex flex-col overflow-hidden border border-gray-800 group relative md:row-span-2">
            <h3 className="text-lg font-bold text-white mb-2">Full Financial Oversight</h3>
            <p className="text-sm text-gray-400 mb-8 relative z-10">Control your ledgers, monitor AP/AR aging, and auto-process receipts with AI-driven OCR.</p>
            <div className="flex-1 bg-white/5 rounded-t-xl border border-white/10 p-0 mt-auto translate-y-8 group-hover:translate-y-4 transition-transform flex flex-col h-48 overflow-hidden">
                <div className="flex justify-between items-center px-5 pt-5 pb-2">
                  <span className="text-xs font-medium text-gray-400">Net Profit</span>
                  <span className="text-sm font-bold text-green-400">+24.5%</span>
                </div>
                <div className="px-5 pb-2">
                  <span className="text-2xl font-bold text-white">$12,450.00</span>
                </div>
                <div className="flex-1 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financeData}>
                      <Area type="monotone" dataKey="uv" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>
          </div>

          {/* Card 4: Spans 2 cols */}
          <div className="bg-gray-50 rounded-3xl p-8 flex flex-col md:flex-row overflow-hidden border border-gray-100 group relative md:col-span-2 items-center gap-8">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Real-Time Progress Tracking</h3>
              <p className="text-sm text-gray-500">Track deadlines, milestones, and performance with live status updates and visual indicators.</p>
            </div>
            <div className="flex-1 w-full bg-white rounded-xl h-40 border border-gray-200 p-4 shadow-sm group-hover:-translate-x-2 transition-transform">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={progressData}>
                   <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                     {progressData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index === 3 ? '#2563eb' : '#dbeafe'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section id="benefits" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#0f1535] mb-4">Why Teams Choose Modern Tracker</h2>
          <p className="text-gray-500">Trusted by teams to manage work efficiently. Designed to help teams do their best work.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-6 md:p-8 rounded-3xl flex flex-col">
            <div className="flex justify-end mb-4"><div className="w-2 h-2 rounded-full bg-blue-400"></div></div>
            <p className="text-4xl md:text-5xl font-black text-[#0f1535] mb-4">40%</p>
            <p className="text-xs font-medium text-gray-500 mt-auto leading-relaxed">Faster Task Completion and automated workflows.</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-6 md:p-8 rounded-3xl flex flex-col mt-4 md:mt-8">
             <div className="flex justify-end mb-4"><div className="w-2 h-2 rounded-full bg-gray-300"></div></div>
            <p className="text-4xl md:text-5xl font-black text-[#0f1535] mb-4">3x</p>
            <p className="text-xs font-medium text-gray-500 mt-auto leading-relaxed">Higher team alignment and cross-team visibility.</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-6 md:p-8 rounded-3xl flex flex-col">
            <div className="flex justify-end mb-4"><div className="w-2 h-2 rounded-full bg-blue-400"></div></div>
            <p className="text-4xl md:text-5xl font-black text-[#0f1535] mb-4">100%</p>
            <p className="text-xs font-medium text-gray-500 mt-auto leading-relaxed">Real-time insights on inventory and financials.</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-6 md:p-8 rounded-3xl flex flex-col mt-4 md:mt-8">
            <div className="flex justify-end mb-4"><div className="w-2 h-2 rounded-full bg-gray-300"></div></div>
            <p className="text-4xl md:text-5xl font-black text-[#0f1535] mb-4">10k+</p>
            <p className="text-xs font-medium text-gray-500 mt-auto leading-relaxed">Active businesses, agencies, and growing stores.</p>
          </div>
        </div>
      </section>

      {/* --- STEPS SECTION --- */}
      <section id="steps" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#0f1535] mb-4">Get Started In Just 3 Easy Steps</h2>
          <p className="text-gray-500">Get started in just 3 easy steps with a guided onboarding experience designed for speed and simplicity.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left Mockup */}
          <div className="flex-1 w-full bg-gradient-to-br from-blue-100 via-blue-50 to-white rounded-[2rem] p-6 shadow-sm border border-blue-100 flex items-center justify-center min-h-[400px]">
             <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-100 flex p-4 overflow-hidden gap-4">
                {/* Sidebar Mock */}
                <div className="w-14 bg-gray-50 rounded-xl h-full flex flex-col items-center py-4 gap-4 border border-gray-100">
                   <div className="w-8 h-8 rounded-full bg-blue-600 mb-2"></div>
                   <div className="w-6 h-6 rounded bg-gray-200"></div>
                   <div className="w-6 h-6 rounded bg-blue-200"></div>
                   <div className="w-6 h-6 rounded bg-gray-200"></div>
                </div>
                {/* Content Mock */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="h-8 flex items-center">
                     <span className="text-gray-800 font-bold text-sm">Dashboard Overview</span>
                  </div>
                  <div className="h-24 bg-blue-50 border border-blue-100 rounded-xl w-full flex flex-col justify-center px-5">
                     <span className="text-blue-800 font-bold text-sm">Welcome back, Team!</span>
                     <span className="text-blue-600/70 text-xs font-medium mt-1">Your store is running smoothly today.</span>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl w-full border border-gray-100 flex flex-col items-center justify-center p-4">
                     <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                       <div className="bg-blue-400 h-1.5 rounded-full w-2/3"></div>
                     </div>
                     <span className="text-gray-400 text-xs font-medium">System Initialization: 100%</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Right Steps */}
          <div className="flex-1 space-y-6 w-full">
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Simple And Fast Setup</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Create your account and define your shop parameters in under 2 minutes.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-default">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Work Together Effortlessly</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Invite your team, assign roles, and distribute permissions securely.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-default">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Monitor Your Progress</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Use the master dashboard to watch your sales and analytics update live.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="px-6 py-24 max-w-7xl mx-auto border-t border-gray-100 mt-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#0f1535] mb-4">Transparent Pricing</h2>
          <p className="text-gray-500">Pick the plan that works for you. All modules included.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PricingCard 
            title="1 Month" 
            price="999" 
            features={["Full Module Access", "Unlimited Users", "24/7 Support"]} 
          />
          <PricingCard 
            title="3 Months" 
            price="2,997" 
            features={["Full Module Access", "Unlimited Users", "24/7 Support"]} 
          />
          <PricingCard 
            title="6 Months" 
            price="4,995" 
            badge="1 Month Free"
            isPopular={true}
            features={["Full Module Access", "Unlimited Users", "24/7 Support", "Priority Support"]} 
          />
          <PricingCard 
            title="12 Months" 
            price="9,990" 
            badge="2 Months Free"
            features={["Full Module Access", "Unlimited Users", "Dedicated Account Manager"]} 
          />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <Image src="/logo.png" alt="Modern Tracker Logo" fill className="object-contain" priority />
            </div>
            <span className="font-bold text-[#0f1535]">Modern Tracker</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms of Service</a>
            <a href="#" className="hover:text-blue-600">Contact Us</a>
          </div>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Modern Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const PricingCard = ({ title, price, features, badge, isPopular }: any) => {
  const router = useRouter();
  
  return (
    <div className={`relative p-8 rounded-[2rem] border-2 bg-white flex flex-col ${isPopular ? 'border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10' : 'border-gray-100 hover:border-gray-200'}`}>
      {badge && (
        <div className={`absolute top-0 inset-x-0 text-white text-[10px] font-bold py-1.5 uppercase tracking-widest text-center rounded-t-[1.8rem] ${isPopular ? 'bg-blue-500' : 'bg-gray-800'}`}>
          {badge}
        </div>
      )}
      <div className={`mt-${badge ? '6' : '0'} mb-8`}>
        <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isPopular ? 'text-blue-600' : 'text-gray-500'}`}>{title}</p>
        <p className="text-4xl font-extrabold text-[#0f1535]">{price} <span className="text-sm text-gray-400 font-medium">Birr</span></p>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 w-4 h-4" /> {f}
          </li>
        ))}
      </ul>
      <button onClick={() => router.push('/signup')} className={`w-full py-4 rounded-full font-bold text-sm transition-transform active:scale-95 ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'}`}>
        Choose Plan
      </button>
    </div>
  );
};