// src/app/page.tsx

"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

// --- Dummy Data (Same as before) ---
const dataWeekly = [
  { name: "M", val: 40 }, { name: "T", val: 30 }, { name: "W", val: 50 },
  { name: "T", val: 45 }, { name: "F", val: 60 }, { name: "S", val: 55 },
];
const dataArea = [
  { name: "A", uv: 4000 }, { name: "B", uv: 3000 }, { name: "C", uv: 5000 },
  { name: "D", uv: 2780 }, { name: "E", uv: 1890 }, { name: "F", uv: 2390 },
  { name: "G", uv: 3490 },
];
const dataPie = [{ name: "A", value: 400 }, { name: "B", value: 100 }];
const COLORS = ["#3b82f6", "#e5e7eb"];

const dataYearly = [
  { name: "Jan", sales: 40, expense: 24 }, { name: "Feb", sales: 30, expense: 13 },
  { name: "Mar", sales: 20, expense: 58 }, { name: "Apr", sales: 27, expense: 39 },
  { name: "May", sales: 18, expense: 48 }, { name: "Jun", sales: 23, expense: 38 },
  { name: "Jul", sales: 34, expense: 43 }, { name: "Aug", sales: 60, expense: 20 },
  { name: "Sep", sales: 40, expense: 24 }, { name: "Oct", sales: 50, expense: 24 },
  { name: "Nov", sales: 30, expense: 13 }, { name: "Dec", sales: 20, expense: 10 },
];

const recentPurchases = [
  { id: "#6d3wedo5", product: "Aavic Headphone", status: "Success", amount: "$152.25" },
  { id: "#6d3wedo6", product: "Nike Shoes", status: "Pending", amount: "$125.25" },
  { id: "#6d3wedo7", product: "Premium Shirt", status: "Success", amount: "$115.25" },
  { id: "#6d3wedo8", product: "Polo T-shirt", status: "Pending", amount: "$97.25" },
  { id: "#6d3wedo9", product: "Jeans Pant", status: "Success", amount: "$255.25" },
];
const stockOutProducts = [
  { product: "Samsung Galaxy-M1", stock: "00", amount: "$152.25" },
  { product: "Nike Shoes", stock: "00", amount: "$125.25" },
  { product: "Premium Shirt", stock: "00", amount: "$115.25" },
  { product: "Polo T-shirt", stock: "00", amount: "$97.25" },
  { product: "Jeans Pant", stock: "00", amount: "$255.25" },
];

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop state

  return (
    <div className="flex bg-[#f6f9fc] min-h-screen font-sans text-slate-800">
      
      {/* Sidebar with Desktop Collapse Logic */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Layout */}
      {/* Dynamic left margin: md:ml-20 if collapsed, md:ml-64 if expanded */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8 space-y-6 md:space-y-8">
          
          {/* TOP ROW: Welcome + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Welcome Widget */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col justify-center">
              <div className="z-10">
                <h2 className="text-blue-500 font-medium mb-1">Good Morning, Maruf!</h2>
                <p className="text-gray-500 text-sm mb-6">Here's what happening with your store today!</p>
                <div className="mb-2">
                  <span className="text-2xl font-bold block">15,350.25</span>
                  <span className="text-xs text-gray-400">Today's Visit</span>
                </div>
                <div>
                  <span className="text-2xl font-bold block">$10,360.66</span>
                  <span className="text-xs text-gray-400">Today's total sales</span>
                </div>
              </div>
              
              {/* Welcome Image: Hidden on mobile, visible on Desktop (lg and up) */}
              <div className="hidden lg:block absolute right-0 bottom-0 h-full w-1/2 pointer-events-none">
                 <div className="relative w-full h-full">
                    <Image 
                      src="/welcome.svg" 
                      alt="Welcome Illustration" 
                      fill 
                      className="object-contain object-right-bottom pb-4 pr-8"
                      priority
                    />
                 </div>
              </div>
            </div>

            {/* 4 Stats Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard title="Order" value="32,350" sub="9350" trend="25.25%" up={true} />
              <StatCard title="Sold Items" value="2,360" sub="1350" trend="2.65%" up={false} />
              <StatCard title="Gross Sale" value="$12.4k" sub="11350" trend="10.25%" up={true} />
              <StatCard title="Shipping" value="$6,240" sub="4350" trend="13.15%" up={false} />
            </div>
          </div>

          {/* MIDDLE ROW: 4 Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <ChartWidget title="Weekly Sales" value="$10.2k" trend="25%" up={true}>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={dataWeekly}><Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={8} /></BarChart>
              </ResponsiveContainer>
            </ChartWidget>

            <ChartWidget title="Product Share" value="39.56%" trend="10%" up={true}>
              <div className="relative h-20 w-20 mx-auto">
                <ResponsiveContainer><PieChart><Pie data={dataPie} innerRadius={25} outerRadius={35} dataKey="value">{dataPie.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie></PieChart></ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600">75%</div>
              </div>
            </ChartWidget>

            <ChartWidget title="Total Order" value="$12.2k" trend="2.6%" up={true}>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={dataArea}><Area type="monotone" dataKey="uv" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} /></AreaChart>
              </ResponsiveContainer>
            </ChartWidget>

             <ChartWidget title="Market Share" value="$14.2k" trend="2.6%" up={true}>
               <div className="relative h-20 w-20 mx-auto">
                <ResponsiveContainer>
                  <PieChart>
                    {/* Inner Ring: Solid Grey Background */}
                    <Pie data={[{ value: 100 }]} innerRadius={20} outerRadius={24} dataKey="value" isAnimationActive={false}>
                      <Cell fill="#e5e7eb" stroke="none" />
                    </Pie>
                    {/* Middle Ring: Orange Data */}
                    <Pie data={[{ value: 65 }, { value: 35 }]} innerRadius={28} outerRadius={32} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill="#f59e0b" stroke="none" /><Cell fill="transparent" stroke="none" />
                    </Pie>
                    {/* Outer Ring: Blue Data */}
                    <Pie data={[{ value: 80 }, { value: 20 }]} innerRadius={36} outerRadius={40} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill="#3b82f6" stroke="none" /><Cell fill="transparent" stroke="none" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600">166</div>
              </div>
            </ChartWidget>
          </div>

          {/* ANALYTICS CHART */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-700">Analytics</h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sales
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span> Expense
                 </div>
                 <select className="text-xs bg-transparent border-none outline-none text-gray-500 font-medium cursor-pointer hover:text-blue-500 transition">
                    <option>Yearly</option>
                 </select>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataYearly} barGap={8} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={8} />
                  <Bar dataKey="expense" fill="#64748b" radius={[4, 4, 0, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BOTTOM TABLES ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
             {/* Recent Purchases */}
             <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col h-96">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-semibold text-gray-700">Recent Purchases</h3>
                   <button className="text-blue-500 text-xs border border-blue-200 px-3 py-1 rounded-md">All Orders</button>
                </div>
                <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                   <table className="w-full text-left relative min-w-[400px]">
                      <thead className="sticky top-0 bg-white z-10">
                         <tr className="text-gray-400 text-xs border-b border-gray-100">
                            <th className="pb-3 pt-2 font-medium">Order ID</th>
                            <th className="pb-3 pt-2 font-medium">Product</th>
                            <th className="pb-3 pt-2 font-medium">Payment</th>
                            <th className="pb-3 pt-2 font-medium text-right">Amount</th>
                         </tr>
                      </thead>
                      <tbody>
                         {[...recentPurchases, ...recentPurchases].map((item, index) => (
                            <tr key={index} className="text-sm text-gray-600 border-b border-gray-50">
                               <td className="py-4">{item.id}</td>
                               <td className="py-4 font-medium text-gray-800">{item.product}</td>
                               <td className="py-4">
                                  <span className={`px-2 py-1 rounded text-[10px] ${item.status==='Success'?'bg-green-50 text-green-600':'bg-red-50 text-red-500'}`}>{item.status}</span>
                               </td>
                               <td className="py-4 text-right">{item.amount}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             {/* Stock Out */}
             <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col h-96">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-semibold text-gray-700">Stock Out Products</h3>
                </div>
                <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                   <table className="w-full text-left relative min-w-[300px]">
                      <thead className="sticky top-0 bg-white z-10">
                         <tr className="text-gray-400 text-xs border-b border-gray-100">
                            <th className="pb-3 pt-2 font-medium">Product</th>
                            <th className="pb-3 pt-2 font-medium text-center">Stock</th>
                            <th className="pb-3 pt-2 font-medium text-right">Amount</th>
                         </tr>
                      </thead>
                      <tbody>
                         {[...stockOutProducts, ...stockOutProducts].map((item, index) => (
                            <tr key={index} className="text-sm text-gray-600 border-b border-gray-50">
                               <td className="py-4 font-medium text-gray-800">{item.product}</td>
                               <td className="py-4 text-center"><span className="bg-red-50 text-red-500 px-2 py-1 rounded-lg text-xs">{item.stock}</span></td>
                               <td className="py-4 text-right">{item.amount}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

        </main>
      </div>
    </div>
  );
}

// --- Minimal Stat Component Wrappers ---
const StatCard = ({ title, value, sub, trend, up }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
    <p className="text-gray-500 text-xs font-medium mb-2">{title}</p>
    <div>
      <h4 className="text-xl font-bold text-gray-800 mb-1">{value}</h4>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{sub}</span>
        <span className={`text-xs flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
          <FontAwesomeIcon icon={up ? faArrowUp : faArrowDown} className="w-2 h-2" /> {trend}
        </span>
      </div>
    </div>
  </div>
);

const ChartWidget = ({ title, value, trend, up, children }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col justify-between h-40">
    <div className="flex justify-between items-start h-full">
      <div className="flex flex-col justify-between h-full">
        <div>
           <p className="text-gray-500 text-xs font-medium mb-1">{title}</p>
           <h4 className="text-lg font-bold text-gray-800">{value}</h4>
        </div>
        <span className={`text-xs flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
           <FontAwesomeIcon icon={up ? faArrowUp : faArrowDown} className="w-2 h-2" /> {trend}
        </span>
      </div>
      <div className="w-20 h-full flex items-center">{children}</div>
    </div>
  </div>
);