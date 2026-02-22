"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faSearch, faFilter, faEllipsisV, 
  faBoxOpen, faCheckCircle, faExclamationTriangle, faTimesCircle,
  faBarcode, faWarehouse, faChartLine, faHistory,
  faLock, faTimes, faSpinner
} from "@fortawesome/free-solid-svg-icons";

// --- TYPES ---
interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  uom: string;
  location: string;
  bin: string;
  supplier: string;
  status: string;
  isBatchTracked: boolean;
  img: string;
}

interface DashboardStats {
  total_products: number;
  low_stock_alert: number;
  inventory_valuation: number;
  items_sold_period: number;
}

// --- MAIN COMPONENT ---
export default function InventoryPage() {
  const router = useRouter();
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Modal State
  
  // Data States
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // --- FETCH DATA FUNCTION ---
  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    try {
      const headers = { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      };

      // 1. Stats
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/inventory/analytics/dashboard_stats/`, { headers });
      if (statsRes.status === 403) { setAccessDenied(true); setLoading(false); return; }
      if (statsRes.ok) setStats(await statsRes.json());

      // 2. Products
      const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/inventory/products/`, { headers });
      if (prodRes.ok) {
          const prodData = await prodRes.json();
          const mappedItems: InventoryItem[] = prodData.map((p: any) => {
              let status = "In Stock";
              if (p.total_stock <= 0) status = "Out of Stock";
              else if (p.total_stock <= p.low_stock_threshold) status = "Low Stock";

              return {
                  id: p.id,
                  name: p.name,
                  sku: p.sku,
                  category: p.category ? `Category ${p.category}` : "Uncategorized",
                  price: parseFloat(p.selling_price),
                  stock: p.total_stock,
                  uom: p.uom,
                  location: "Multiple",
                  bin: "N/A",
                  supplier: "N/A",
                  status: status,
                  isBatchTracked: p.is_batch_tracked,
                  img: "https://placehold.co/40"
              };
          });
          setItems(mappedItems);
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // --- ACCESS DENIED VIEW ---
  if (accessDenied) {
      return (
        <div className="flex bg-[#f6f9fc] min-h-screen font-sans text-slate-800">
             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
             <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-lg">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faLock} className="text-red-500 w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                        <p className="text-gray-500 mb-8">
                            Your license does not include access to the <strong>Inventory App</strong>.
                        </p>
                        <button onClick={() => router.push('/')} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
                            Back to Dashboard
                        </button>
                    </div>
                </main>
             </div>
        </div>
      );
  }

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-700 border-green-200";
      case "Low Stock": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Out of Stock": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Stock": return faCheckCircle;
      case "Low Stock": return faExclamationTriangle;
      case "Out of Stock": return faTimesCircle;
      default: return faBoxOpen;
    }
  };

  return (
    <div className="flex bg-[#f6f9fc] min-h-screen font-sans text-slate-800">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8 space-y-8 relative">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0f1535]">Inventory Management</h1>
              <p className="text-sm text-gray-500">Track stock, manage warehouses, and forecast demand.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition">
                <FontAwesomeIcon icon={faBarcode} className="w-4 h-4" />
                <span className="hidden sm:inline">Scan Item</span>
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#0f1535] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/10 transition-transform active:scale-95"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                Add Item
              </button>
            </div>
          </div>

          {/* Stats */}
          {loading ? (
             <div className="p-8 text-center text-gray-400">Loading Stats...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={faBoxOpen} title="Total SKUs" value={stats?.total_products || 0} sub="Items across all locations" color="blue" />
                <StatCard icon={faExclamationTriangle} title="Low Stock Alerts" value={stats?.low_stock_alert || 0} sub="Requires reordering" color="orange" />
                <StatCard icon={faWarehouse} title="Inventory Value" value={`$${stats?.inventory_valuation || 0}`} sub="Current asset value" color="green" />
                <StatCard icon={faChartLine} title="Sales (30d)" value={stats?.items_sold_period || 0} sub="Total items sold" color="purple" />
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
              <div className="flex bg-gray-100/80 p-1 rounded-xl w-full lg:w-auto">
                {['All', 'Low Stock', 'Bundles', 'Archived'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
                ))}
              </div>
              <div className="flex gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400 w-3 h-3" />
                  <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-400 text-sm">Loading inventory data...</div>
            ) : (
                <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                        <th className="px-6 py-4">Item Details</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Supplier</th>
                        <th className="px-6 py-4 text-center">Stock Level</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {items
                        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                            <div>
                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 rounded">{item.sku}</span>
                                {item.isBatchTracked && <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 rounded border border-blue-100">BATCH</span>}
                                </div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-xs">
                            <p className="font-bold text-gray-700">{item.location}</p>
                            <p className="text-gray-400">{item.bin}</p>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-600">{item.supplier}</td>
                        <td className="px-6 py-4 text-center">
                            <p className="text-sm font-bold text-gray-800">{item.stock}</p>
                            <p className="text-[10px] text-gray-400">{item.uom}</p>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                            <FontAwesomeIcon icon={getStatusIcon(item.status)} className="w-2.5 h-2.5" />
                            {item.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FontAwesomeIcon icon={faHistory} className="w-3.5 h-3.5" /></button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FontAwesomeIcon icon={faEllipsisV} className="w-3.5 h-3.5" /></button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
          </div>

        </main>
      </div>

      {/* --- CREATE PRODUCT MODAL --- */}
      {isCreateModalOpen && (
        <CreateProductModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onSuccess={() => { setIsCreateModalOpen(false); fetchData(); }} 
        />
      )}

    </div>
  );
}

// --- SUB COMPONENTS ---

const StatCard = ({ icon, title, value, sub, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600"
  };
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}><FontAwesomeIcon icon={icon} className="w-5 h-5" /></div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
        <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
      </div>
    </div>
  );
};

// --- NEW MODAL COMPONENT ---
const CreateProductModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const [formData, setFormData] = useState({
        name: '', sku: '', selling_price: '', cost_price: '', uom: 'Each', low_stock_threshold: 10
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem("access_token");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/inventory/products/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                onSuccess(); // Close and Refresh
            } else {
                alert("Failed to create product. Check SKU uniqueness.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Add New Product</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500"><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU</label>
                            <input required type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                                value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit (UoM)</label>
                            <input type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                                value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                        <input required type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost Price</label>
                            <input required type="number" step="0.01" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                                value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price</label>
                            <input required type="number" step="0.01" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                                value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#0f1535] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                            {submitting && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                            Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};