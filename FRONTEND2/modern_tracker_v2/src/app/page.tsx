// src/app/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

const COLORS = ["#3b82f6", "#e5e7eb"];
const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"]; // Green, Orange, Red

export default function Home() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsFilter, setAnalyticsFilter] = useState<'Yearly' | 'Monthly' | 'Weekly' | 'Daily'>('Yearly');

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/landing");
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/inventory/analytics/main_dashboard/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

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
          {loading ? (
             <div className="flex items-center justify-center h-[60vh] text-gray-400 font-medium text-lg">
                Loading Real-Time Dashboard...
             </div>
          ) : (
          <>
          {/* TOP ROW: Welcome + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Welcome Widget */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col justify-center">
              <div className="z-10">
                <h2 className="text-blue-500 font-medium mb-1">Good Morning, {dashboardData?.header?.user_name || 'User'}!</h2>
                <p className="text-gray-500 text-sm mb-6">Here's what happening with your store today!</p>
                <div className="mb-2">
                  <span className="text-2xl font-bold block">{dashboardData?.header?.today_items_sold || 0}</span>
                  <span className="text-xs text-gray-400">Items Sold Today</span>
                </div>
                <div>
                  <span className="text-2xl font-bold block">ETB {dashboardData?.header?.today_sales?.toLocaleString() || "0.00"}</span>
                  <span className="text-xs text-gray-400">Today's total sales</span>
                </div>
              </div>
              
              {/* Welcome Image: Hidden on mobile, visible on Desktop (lg and up) */}
              <div className="hidden lg:block absolute right-0 bottom-0 h-full w-1/2 pointer-events-none">
                 <div className="relative w-full h-full">
                    <Image 
                      src="/welcome.svg" 
                      alt="" 
                      fill 
                      className="object-contain object-right-bottom pb-4 pr-8"
                      priority
                    />
                 </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <StatCard title="Sold Items" value={dashboardData?.stat_cards?.sold_items || 0} sub="Total Units Delivered" trend="--" up={true} />
              <StatCard title="Inventory Value" value={`ETB ${dashboardData?.stat_cards?.inventory_valuation?.toLocaleString() || 0}`} sub="Total Asset Worth" trend="--" up={true} />
            </div>
          </div>

          {/* MIDDLE ROW: 2 Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">

            <ChartWidget title="Weekly Sales" value="7 Days" trend="--" up={true}>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={dashboardData?.charts?.weekly || []}><Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={8} /></BarChart>
              </ResponsiveContainer>
            </ChartWidget>

            <ChartWidget title="Product Status" value={dashboardData?.charts?.in_stock_count || 0} note="Distinct products with at least 1 item in stock">
              <div className="relative h-20 w-20 mx-auto">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={dashboardData?.charts?.pie || []} innerRadius={25} outerRadius={35} dataKey="value" stroke="none">
                      {(dashboardData?.charts?.pie || []).map((e: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', padding: '4px 8px' }} itemStyle={{ color: '#334155' }} />
                  </PieChart>
                </ResponsiveContainer>
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
                    <span className="w-2 h-2 rounded-full bg-green-400"></span> Profit
                 </div>
                 <select 
                    value={analyticsFilter}
                    onChange={(e) => setAnalyticsFilter(e.target.value as any)}
                    className="text-xs bg-transparent border-none outline-none text-gray-500 font-medium cursor-pointer hover:text-blue-500 transition"
                 >
                    <option value="Yearly">Yearly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Daily">Daily</option>
                 </select>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.charts?.analytics?.[analyticsFilter] || []} barGap={4} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={6} />
                  <Bar dataKey="expense" fill="#64748b" radius={[4, 4, 0, 0]} barSize={6} />
                  <Bar dataKey="profit" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={6} />
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
                         {dashboardData?.recent_purchases?.length === 0 ? (
                           <tr><td colSpan={4} className="py-8 text-center text-gray-400">No recent purchases found.</td></tr>
                         ) : (dashboardData?.recent_purchases || []).map((item: any, index: number) => (
                            <tr key={index} className="text-sm text-gray-600 border-b border-gray-50">
                               <td className="py-4">{item.id}</td>
                               <td className="py-4 font-medium text-gray-800">{item.product}</td>
                               <td className="py-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>{item.status}</span>
                               </td>
                               <td className="py-4 text-right font-bold">{item.amount}</td>
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
                         {dashboardData?.stock_out_products?.length === 0 ? (
                           <tr><td colSpan={3} className="py-8 text-center text-gray-400">Inventory is fully stocked!</td></tr>
                         ) : (dashboardData?.stock_out_products || []).map((item: any, index: number) => (
                            <tr key={index} className="text-sm text-gray-600 border-b border-gray-50">
                               <td className="py-4 font-medium text-gray-800">{item.product}</td>
                               <td className="py-4 text-center"><span className="bg-red-50 text-red-500 px-2 py-1 rounded-lg text-xs font-bold">{item.stock}</span></td>
                               <td className="py-4 text-right font-bold">{item.amount}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
          </>
          )}
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

const ChartWidget = ({ title, value, trend, up, note, children }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col justify-between h-40">
    <div className="flex justify-between items-start h-full">
      <div className="flex flex-col justify-between h-full">
        <div>
           <p className="text-gray-500 text-xs font-medium mb-1">{title}</p>
           <h4 className="text-lg font-bold text-gray-800">{value}</h4>
        </div>
        {note ? (
          <span className="text-[9px] text-gray-400 mt-2 max-w-[120px] leading-tight">{note}</span>
        ) : (
          <span className={`text-xs flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
             <FontAwesomeIcon icon={up ? faArrowUp : faArrowDown} className="w-2 h-2" /> {trend}
          </span>
        )}
      </div>
      <div className="w-20 h-full flex items-center">{children}</div>
    </div>
  </div>
);