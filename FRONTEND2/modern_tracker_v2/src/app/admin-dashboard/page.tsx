// src/app/admin-dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShieldAlt, faHistory, faClock, faUserTag, faUsers, 
  faPlus, faEdit, faTrash, faTimes, faSpinner, 
  faChartLine, faArrowTrendUp, faArrowTrendDown 
} from "@fortawesome/free-solid-svg-icons";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Added 'analytics' tab
  const [activeTab, setActiveTab] = useState<'audit' | 'team' | 'analytics'>('audit');
  
  const [logs, setLogs] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  
  // State for the new Mover Analysis
  const [movers, setMovers] = useState<{fast_movers: any[], slow_movers: any[]}>({ fast_movers: [], slow_movers: [] });
  
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [formData, setFormData] = useState({ phone_number: '', email: '', first_name: '', last_name: '', password: '', role: 'CASHIER' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    try {
      // Fetch Logs
      const resLogs = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/admin-dashboard/`, { headers: { "Authorization": `Bearer ${token}` } });
      if (resLogs.status === 403) {
          alert("Unauthorized. Admins only.");
          router.push("/");
          return;
      }
      if (resLogs.ok) {
        const data = await resLogs.json();
        setLogs(data.logs);
        setShopName(data.shop_name);
      }

      // Fetch Team
      const resTeam = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/shop-employees/`, { headers: { "Authorization": `Bearer ${token}` } });
      if (resTeam.ok) setTeam(await resTeam.json());

      // Fetch Mover Analysis
      const resMovers = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/inventory/analytics/mover_analysis/`, { headers: { "Authorization": `Bearer ${token}` } });
      if (resMovers.ok) setMovers(await resMovers.json());

    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Remove this user? They will immediately lose access to the shop.")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/shop-employees/${id}/`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("access_token");
    const method = editUser ? 'PUT' : 'POST';
    const url = editUser ? `${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/shop-employees/${editUser.id}/` : `${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/shop-employees/`;

    const payload: any = { ...formData };
    if (editUser && !payload.password) delete payload.password;

    try {
      const res = await fetch(url, {
        method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditUser(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(JSON.stringify(err));
      }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const openAddModal = () => {
      setEditUser(null);
      setFormData({ phone_number: '', email: '', first_name: '', last_name: '', password: '', role: 'CASHIER' });
      setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
      setEditUser(user);
      setFormData({ phone_number: user.phone_number, email: user.email || '', first_name: user.first_name || '', last_name: user.last_name || '', password: '', role: user.role });
      setIsModalOpen(true);
  };

  const getActionColor = (action: string) => {
      if (action === 'ADDED_ITEM') return 'bg-purple-100 text-purple-700';
      if (action === 'RECEIVED_ITEM') return 'bg-green-100 text-green-700';
      if (action === 'SOLD_ITEM') return 'bg-blue-100 text-blue-700';
      return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex bg-[#f6f9fc] min-h-screen font-sans text-slate-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8 space-y-8">
          <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FontAwesomeIcon icon={faShieldAlt} className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0f1535]">{shopName} - Admin Portal</h1>
              <p className="text-sm text-gray-500">Security, Audit Trails, Team & Analytics</p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-6 border-b border-gray-200">
             <button onClick={() => setActiveTab('audit')} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                <FontAwesomeIcon icon={faHistory} className="mr-2" /> Audit Trail
             </button>
             <button onClick={() => setActiveTab('team')} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'team' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                <FontAwesomeIcon icon={faUsers} className="mr-2" /> Team Management
             </button>
             <button onClick={() => setActiveTab('analytics')} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                <FontAwesomeIcon icon={faChartLine} className="mr-2" /> Reports & Analytics
             </button>
          </div>

          {loading ? (
             <div className="p-12 text-center text-gray-400">Loading data...</div>
          ) : (
             <>
                {/* AUDIT TRAIL TAB */}
                {activeTab === 'audit' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animation-fade-in-up">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-bold">
                                <tr>
                                    <th className="px-6 py-4"><FontAwesomeIcon icon={faClock} className="mr-2"/> Timestamp</th>
                                    <th className="px-6 py-4"><FontAwesomeIcon icon={faUserTag} className="mr-2"/> User</th>
                                    <th className="px-6 py-4">Action Type</th>
                                    <th className="px-6 py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">No activity recorded yet.</td></tr>
                                ) : logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{log.user_name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide ${getActionColor(log.action)}`}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </div>
                )}

                {/* TEAM MANAGEMENT TAB */}
                {activeTab === 'team' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animation-fade-in-up">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800">Shop Users</h2>
                        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm">
                            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add User
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-bold">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Phone Number</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {team.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">No users found. Create one to get started.</td></tr>
                                ) : team.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">{member.first_name} {member.last_name}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">{member.phone_number}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wide bg-blue-50 text-blue-700">{member.role}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEditModal(member)} className="p-2 text-gray-400 hover:text-blue-600"><FontAwesomeIcon icon={faEdit} /></button>
                                            <button onClick={() => handleDeleteUser(member.id)} className="p-2 text-gray-400 hover:text-red-600"><FontAwesomeIcon icon={faTrash} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </div>
                )}

                {/* ANALYTICS / VELOCITY TAB */}
                {activeTab === 'analytics' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animation-fade-in-up">
                    
                    {/* Fast Movers */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-green-50/30 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <FontAwesomeIcon icon={faArrowTrendUp} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800">Top 5 Fast Movers</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Highest Sales (30 Days)</p>
                            </div>
                        </div>
                        <div className="p-0">
                            {movers.fast_movers.length === 0 ? (
                                <p className="p-6 text-center text-sm text-gray-400">No sales data found for the last 30 days.</p>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {movers.fast_movers.map((item, idx) => (
                                        <li key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-300 font-bold text-lg w-4">{idx + 1}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">SKU: {item.sku}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-green-600">{item.sold_last_30_days} Sold</p>
                                                <p className="text-[10px] text-gray-400">Stock: {item.current_stock}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Dead Stock */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-red-50/30 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <FontAwesomeIcon icon={faArrowTrendDown} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800">Dead Stock Watchlist</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Highest Stock, Zero/Low Sales</p>
                            </div>
                        </div>
                        <div className="p-0">
                            {movers.slow_movers.length === 0 ? (
                                <p className="p-6 text-center text-sm text-gray-400">Your inventory is healthy! No dead stock found.</p>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {movers.slow_movers.map((item, idx) => (
                                        <li key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-300 font-bold text-lg w-4">{idx + 1}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">SKU: {item.sku}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-red-500">{item.current_stock} in Stock</p>
                                                <p className="text-[10px] text-gray-400">Sold: {item.sold_last_30_days}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                  </div>
                )}
             </>
          )}
        </main>
      </div>

      {/* --- ADD/EDIT USER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">{editUser ? 'Edit User' : 'Add New User'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
                            <input type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
                            <input type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number (Login ID)</label>
                            <input required type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                            <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="MANAGER">Manager</option>
                                <option value="CLERK">Inventory Clerk</option>
                                <option value="CASHIER">Cashier</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password {editUser && <span className="text-[10px] text-gray-400">(Leave blank to keep unchanged)</span>}</label>
                        <input type="password" required={!editUser} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                            {submitting && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                            {editUser ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}