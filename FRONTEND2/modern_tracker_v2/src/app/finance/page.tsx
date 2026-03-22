// src/app/finance/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLock, faBookOpen, faFileInvoiceDollar, faReceipt, faChartBar, 
  faUpload, faSpinner, faPlus, faTimes, faBuilding, faUserTie
} from "@fortawesome/free-solid-svg-icons";

export default function FinancePage() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // --- DATA STATES ---
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  const [plData, setPlData] = useState<any>(null);
  const [bsData, setBsData] = useState<any>(null);
  const [agingData, setAgingData] = useState<any>(null);
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);

  // --- MODAL & FORM STATES ---
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const [accountForm, setAccountForm] = useState({ name: "", code: "", account_type: "ASSET" });
  const [invoiceForm, setInvoiceForm] = useState({ customer_name: "", amount: "", due_date: "" });
  const [billForm, setBillForm] = useState({ vendor_name: "", amount: "", due_date: "" });

  // --- FETCH DATA ---
  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    const headers = { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    try {
      const [plRes, bsRes, agingRes, accRes, invRes, billRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/finance/reports/profit_and_loss/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/finance/reports/balance_sheet/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/finance/reports/ap_ar_aging/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/finance/accounts/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/finance/invoices/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/finance/bills/`, { headers })
      ]);

      if (plRes.status === 403) { 
        setAccessDenied(true); 
        setLoading(false); 
        return; 
      }

      if (plRes.ok) setPlData(await plRes.json());
      if (bsRes.ok) setBsData(await bsRes.json());
      if (agingRes.ok) setAgingData(await agingRes.json());
      if (accRes.ok) setAccounts(await accRes.json());
      if (invRes.ok) setInvoices(await invRes.json());
      if (billRes.ok) setBills(await billRes.json());

    } catch (error) {
      console.error("Error fetching Finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // --- ACTIONS (CREATE DATA) ---

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/finance/accounts/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(accountForm)
      });
      if (res.ok) {
        setIsAddAccountModalOpen(false);
        setAccountForm({ name: "", code: "", account_type: "ASSET" });
        fetchData(); // Refresh UI
      } else {
        alert("Failed to add account. Check if code is unique.");
      }
    } catch (err) { console.error(err); }
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/finance/invoices/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...invoiceForm, issue_date: new Date().toISOString().split("T")[0] })
      });
      if (res.ok) {
        setIsAddInvoiceModalOpen(false);
        setInvoiceForm({ customer_name: "", amount: "", due_date: "" });
        fetchData(); // Will dynamically update AR Aging!
      }
    } catch (err) { console.error(err); }
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/finance/bills/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...billForm, issue_date: new Date().toISOString().split("T")[0] })
      });
      if (res.ok) {
        setIsAddBillModalOpen(false);
        setBillForm({ vendor_name: "", amount: "", due_date: "" });
        fetchData(); // Will dynamically update AP Aging!
      }
    } catch (err) { console.error(err); }
  };

  const handleOCRUpload = async () => {
    setOcrLoading(true);
    setTimeout(async () => {
      alert("Receipt processed! Extracted Vendor: OFFICE DEPOT, Amount: $150.00");
      setOcrLoading(false);
    }, 2000);
  };

  // --- RENDER ---
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
                  <p className="text-gray-500 mb-8">Your license does not include access to the <strong>Finance App</strong>.</p>
                  <button onClick={() => router.push('/')} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">Back to Dashboard</button>
              </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#f6f9fc] min-h-screen font-sans text-slate-800 scroll-smooth">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8 space-y-12 h-screen overflow-y-auto pb-32">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0f1535]">Finance & Accounting</h1>
              <p className="text-sm text-gray-500">Track ledgers, payables, receivables, and real-time reports.</p>
            </div>
          </div>

          {loading ? (
             <div className="p-12 text-center text-gray-400">Loading Financial Data...</div>
          ) : (
            <>
              {/* SECTION 1: REPORTS SUMMARY */}
              <section id="reports" className="scroll-mt-24">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartBar} className="text-blue-500" /> Executive Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* P&L */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Profit & Loss (Live)</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Total Revenue</span>
                        <span className="font-bold text-green-600">${plData?.total_revenue || "0.00"}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Total Expenses</span>
                        <span className="font-bold text-red-500">-${plData?.total_expenses || "0.00"}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-gray-800">Net Profit</span>
                        <span className="text-lg font-bold text-[#0f1535]">${plData?.net_profit || "0.00"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Sheet */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Balance Sheet (Live)</p>
                       {bsData?.is_balanced ? (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold">BALANCED</span>
                       ) : (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded font-bold">UNBALANCED</span>
                       )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Assets</span>
                        <span className="font-bold text-blue-600">${bsData?.assets || "0.00"}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Liabilities</span>
                        <span className="font-bold text-gray-800">${bsData?.liabilities || "0.00"}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-600">Equity</span>
                        <span className="font-bold text-gray-800">${bsData?.equity || "0.00"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: AP/AR AGING & TABLES */}
              <section id="apar" className="scroll-mt-24 space-y-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-purple-500" /> Payables & Receivables
                </h2>
                
                {/* Aging Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                        <th className="p-4">Account Type</th>
                        <th className="p-4 text-right">0-30 Days</th>
                        <th className="p-4 text-right">31-60 Days</th>
                        <th className="p-4 text-right">61-90 Days</th>
                        <th className="p-4 text-right text-red-500">90+ Days</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-4 font-bold text-gray-800">Accounts Receivable (AR)</td>
                        <td className="p-4 text-right">${agingData?.accounts_receivable?.['0_30'] || 0}</td>
                        <td className="p-4 text-right">${agingData?.accounts_receivable?.['31_60'] || 0}</td>
                        <td className="p-4 text-right">${agingData?.accounts_receivable?.['61_90'] || 0}</td>
                        <td className="p-4 text-right text-red-500 font-bold">${agingData?.accounts_receivable?.['90_plus'] || 0}</td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-4 font-bold text-gray-800">Accounts Payable (AP)</td>
                        <td className="p-4 text-right">${agingData?.accounts_payable?.['0_30'] || 0}</td>
                        <td className="p-4 text-right">${agingData?.accounts_payable?.['31_60'] || 0}</td>
                        <td className="p-4 text-right">${agingData?.accounts_payable?.['61_90'] || 0}</td>
                        <td className="p-4 text-right text-red-500 font-bold">${agingData?.accounts_payable?.['90_plus'] || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Invoices (AR) Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800">Invoices (Money Owed To You)</h3>
                      <button onClick={() => setIsAddInvoiceModalOpen(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faPlus} /> Add Invoice
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                          <tr><th className="pb-2">Customer</th><th className="pb-2">Due Date</th><th className="pb-2">Status</th><th className="pb-2 text-right">Balance</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {invoices.length === 0 ? <tr><td colSpan={4} className="py-4 text-center text-gray-400">No invoices found.</td></tr> : 
                           invoices.map(inv => (
                            <tr key={inv.id}>
                              <td className="py-3 font-medium text-gray-800">{inv.customer_name}</td>
                              <td className="py-3 text-gray-600">{inv.due_date}</td>
                              <td className="py-3"><span className="px-2 py-1 rounded text-[10px] bg-gray-100">{inv.status}</span></td>
                              <td className="py-3 text-right font-bold">${inv.balance_due}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bills (AP) Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800">Bills (Money You Owe)</h3>
                      <button onClick={() => setIsAddBillModalOpen(true)} className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={faPlus} /> Add Bill
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                          <tr><th className="pb-2">Vendor</th><th className="pb-2">Due Date</th><th className="pb-2">Status</th><th className="pb-2 text-right">Balance</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {bills.length === 0 ? <tr><td colSpan={4} className="py-4 text-center text-gray-400">No bills found.</td></tr> : 
                           bills.map(bill => (
                            <tr key={bill.id}>
                              <td className="py-3 font-medium text-gray-800">{bill.vendor_name}</td>
                              <td className="py-3 text-gray-600">{bill.due_date}</td>
                              <td className="py-3"><span className="px-2 py-1 rounded text-[10px] bg-gray-100">{bill.status}</span></td>
                              <td className="py-3 text-right font-bold">${bill.balance_due}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: GENERAL LEDGER (CHART OF ACCOUNTS) */}
              <section id="ledger" className="scroll-mt-24">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBookOpen} className="text-green-500" /> Chart of Accounts
                  </h2>
                  <button onClick={() => setIsAddAccountModalOpen(true)} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> New Account
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                        <th className="p-4">Code</th>
                        <th className="p-4">Account Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {accounts.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-gray-400">No accounts configured.</td></tr> : 
                       accounts.map(acc => (
                        <tr key={acc.id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-mono text-gray-500">{acc.code}</td>
                          <td className="p-4 font-bold text-gray-800">{acc.name}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">{acc.account_type}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${acc.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {acc.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SECTION 4: EXPENSE OCR */}
              <section id="expenses" className="scroll-mt-24">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faReceipt} className="text-orange-500" /> Smart Expense Upload (OCR)
                </h2>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center border-dashed border-2">
                   <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faUpload} className="text-blue-500 w-6 h-6" />
                   </div>
                   <h3 className="font-bold text-gray-800 mb-2">Upload Receipt for Auto-Processing</h3>
                   <p className="text-xs text-gray-500 mb-6">Our AI will extract the vendor, date, and total amount automatically.</p>
                   
                   <button 
                     onClick={handleOCRUpload}
                     disabled={ocrLoading}
                     className="bg-[#0f1535] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 mx-auto disabled:opacity-70"
                   >
                     {ocrLoading ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Analyzing Image...</> : "Simulate Receipt Upload"}
                   </button>
                </div>
              </section>

            </>
          )}

        </main>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Add Account Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddAccountModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animation-scale-up">
            <button onClick={() => setIsAddAccountModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><FontAwesomeIcon icon={faTimes} /></button>
            <div className="mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><FontAwesomeIcon icon={faBookOpen} className="text-green-600" /></div>
              <div><h2 className="text-xl font-bold text-gray-800">Add Account</h2><p className="text-sm text-gray-500">Create a new ledger account.</p></div>
            </div>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Account Name</label>
                <input type="text" required value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} placeholder="e.g. Office Supplies" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Code</label>
                  <input type="text" required value={accountForm.code} onChange={e => setAccountForm({...accountForm, code: e.target.value})} placeholder="e.g. 5000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Type</label>
                  <select value={accountForm.account_type} onChange={e => setAccountForm({...accountForm, account_type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="ASSET">Asset</option><option value="LIABILITY">Liability</option><option value="EQUITY">Equity</option><option value="REVENUE">Revenue</option><option value="EXPENSE">Expense</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition">Save Account</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Invoice Modal */}
      {isAddInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddInvoiceModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animation-scale-up">
            <button onClick={() => setIsAddInvoiceModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><FontAwesomeIcon icon={faTimes} /></button>
            <div className="mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><FontAwesomeIcon icon={faUserTie} className="text-blue-600" /></div>
              <div><h2 className="text-xl font-bold text-gray-800">New Invoice (AR)</h2><p className="text-sm text-gray-500">Bill a customer for goods/services.</p></div>
            </div>
            <form onSubmit={handleAddInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer Name</label>
                <input type="text" required value={invoiceForm.customer_name} onChange={e => setInvoiceForm({...invoiceForm, customer_name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount ($)</label>
                  <input type="number" step="0.01" required value={invoiceForm.amount} onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Due Date</label>
                  <input type="date" required value={invoiceForm.due_date} onChange={e => setInvoiceForm({...invoiceForm, due_date: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition">Create Invoice</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Bill Modal */}
      {isAddBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddBillModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animation-scale-up">
            <button onClick={() => setIsAddBillModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><FontAwesomeIcon icon={faTimes} /></button>
            <div className="mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><FontAwesomeIcon icon={faBuilding} className="text-gray-800" /></div>
              <div><h2 className="text-xl font-bold text-gray-800">New Bill (AP)</h2><p className="text-sm text-gray-500">Record an incoming bill from a vendor.</p></div>
            </div>
            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vendor Name</label>
                <input type="text" required value={billForm.vendor_name} onChange={e => setBillForm({...billForm, vendor_name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount ($)</label>
                  <input type="number" step="0.01" required value={billForm.amount} onChange={e => setBillForm({...billForm, amount: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Due Date</label>
                  <input type="date" required value={billForm.due_date} onChange={e => setBillForm({...billForm, due_date: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition">Log Bill</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}