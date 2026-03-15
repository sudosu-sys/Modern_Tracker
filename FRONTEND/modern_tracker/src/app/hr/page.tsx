"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faClock, faCheck, faTimes, 
  faFileInvoiceDollar, faUserPlus, faTrash, faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";

export default function HRPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // --- DATA STATES ---
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);

  // --- MODAL & FORM STATES ---
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [isAddPayrollModalOpen, setIsAddPayrollModalOpen] = useState(false);
  const [isRequestLeaveModalOpen, setIsRequestLeaveModalOpen] = useState(false);

  const [empForm, setEmpForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    employment_type: "FT",
    pay_type: "SALARY",
    base_pay: "",
    hire_date: new Date().toISOString().split("T")[0],
  });

  const [payrollForm, setPayrollForm] = useState({
    start_date: "",
    end_date: "",
  });

  const [leaveForm, setLeaveForm] = useState({
    employee: "",
    leave_type: "VACATION",
    start_date: "",
    end_date: "",
    reason: "",
  });

  // --- FETCH DATA (GET) ---
  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const [empRes, attRes, leaveRes, payRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/employees/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/attendance/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/leaves/`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/payroll/`, { headers })
      ]);

      if (empRes.ok) setEmployees(await empRes.json());
      if (attRes.ok) setAttendance(await attRes.json());
      if (leaveRes.ok) setLeaves(await leaveRes.json());
      if (payRes.ok) setPayrolls(await payRes.json());
    } catch (error) {
      console.error("Error fetching HR data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---
  
  // 1. Add Employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/employees/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(empForm),
      });

      if (res.ok) {
        setIsAddEmpModalOpen(false);
        setEmpForm({
          first_name: "", last_name: "", email: "", phone: "",
          job_title: "", employment_type: "FT", pay_type: "SALARY",
          base_pay: "", hire_date: new Date().toISOString().split("T")[0],
        });
        fetchData(); 
      } else {
        const errorData = await res.json();
        alert(JSON.stringify(errorData)); 
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the server.");
    }
  };

  // 2. Delete Employee
  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to remove this employee? This will also remove their attendance and leave records.")) return;
    
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/employees/${id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete employee.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Punch Clock
  const handlePunch = async (employeeId: number, actionType: 'in' | 'out') => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/attendance/punch/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employee_id: employeeId, action: actionType }),
      });
      if (res.ok) {
        fetchData(); 
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to punch clock.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Create Payroll Run
  const handleCreatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/payroll/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payrollForm),
      });

      if (res.ok) {
        setIsAddPayrollModalOpen(false);
        setPayrollForm({ start_date: "", end_date: "" });
        fetchData(); 
      } else {
        const errorData = await res.json();
        alert(JSON.stringify(errorData)); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Delete Payroll Run
  const handleDeletePayroll = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payroll run? This will remove all generated paystubs associated with it.")) return;
    
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/payroll/${id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete payroll run.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Generate Paystubs
  const handleGenerateStubs = async (payrollId: number) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/payroll/${payrollId}/generate_stubs/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.error || "Failed to generate stubs.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Request Leave
  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/leaves/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leaveForm),
      });

      if (res.ok) {
        setIsRequestLeaveModalOpen(false);
        setLeaveForm({ employee: "", leave_type: "VACATION", start_date: "", end_date: "", reason: "" });
        fetchData(); 
      } else {
        const errorData = await res.json();
        alert(JSON.stringify(errorData)); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Update Leave Status
  const updateLeaveStatus = async (leaveId: number, status: 'APPROVED' | 'REJECTED') => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/hr/leaves/${leaveId}/update_status/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

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

        <main className="p-4 md:p-8 space-y-12 h-screen overflow-y-auto scroll-smooth pb-32">
          
          {/* SECTION 1: EMPLOYEES */}
          <section id="employees" className="scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-800">Employee Directory</h2>
               <button 
                  onClick={() => setIsAddEmpModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition"
               >
                 <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Add Employee
               </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                     <tr className="text-xs text-gray-500 uppercase tracking-wider">
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Job Title</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {employees.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-gray-400">No employees found.</td></tr>
                     ) : (
                        employees.map((emp) => (
                          <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                             <td className="p-4 font-medium text-gray-800">{emp.first_name} {emp.last_name}</td>
                             <td className="p-4 text-gray-600">{emp.job_title}</td>
                             <td className="p-4 text-gray-600">{emp.pay_type}</td>
                             <td className="p-4">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${emp.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                   {emp.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                             </td>
                             <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  className="text-red-400 hover:text-red-600 transition p-2"
                                  title="Delete Employee"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                </button>
                             </td>
                          </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
          </section>

          {/* SECTION 2: ATTENDANCE */}
          <section id="attendance" className="scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-800">Time & Attendance</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex gap-4 items-center bg-blue-50/50 border border-blue-100">
               <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                 <FontAwesomeIcon icon={faClock} />
               </div>
               <div className="flex-1">
                 <p className="text-sm font-bold text-gray-800">Quick Punch</p>
                 <p className="text-xs text-gray-500">Select an employee to clock in or out for today.</p>
               </div>
               <div className="flex gap-2">
                 <select id="quickPunchEmp" className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none">
                    <option value="">Select Employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                 </select>
                 <button 
                    onClick={() => {
                      const val = (document.getElementById('quickPunchEmp') as HTMLSelectElement).value;
                      if(val) handlePunch(Number(val), 'in');
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition">
                    Clock In
                 </button>
                 <button 
                    onClick={() => {
                      const val = (document.getElementById('quickPunchEmp') as HTMLSelectElement).value;
                      if(val) handlePunch(Number(val), 'out');
                    }}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 transition">
                    Clock Out
                 </button>
               </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                     <tr className="text-xs text-gray-500 uppercase tracking-wider">
                        <th className="p-4 font-medium">Employee</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Clock In</th>
                        <th className="p-4 font-medium">Clock Out</th>
                        <th className="p-4 font-medium">Hours</th>
                     </tr>
                  </thead>
                  <tbody>
                     {attendance.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-gray-400">No attendance records.</td></tr>
                     ) : (
                        attendance.map((att) => (
                          <tr key={att.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                             <td className="p-4 font-medium text-gray-800">{att.employee_name}</td>
                             <td className="p-4 text-gray-600">{att.date}</td>
                             <td className="p-4 text-gray-600">{att.clock_in ? new Date(att.clock_in).toLocaleTimeString() : '--'}</td>
                             <td className="p-4 text-gray-600">{att.clock_out ? new Date(att.clock_out).toLocaleTimeString() : '--'}</td>
                             <td className="p-4 font-bold text-blue-600">{att.hours_worked}h</td>
                          </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
          </section>

          {/* SECTION 3: PAYROLL */}
          <section id="payroll" className="scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-800">Payroll Dashboard</h2>
               <button 
                 onClick={() => setIsAddPayrollModalOpen(true)}
                 className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
               >
                 <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-3 h-3" /> New Payroll Run
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {payrolls.length === 0 ? (
                 <p className="text-gray-400 text-sm">No payroll runs generated yet.</p>
               ) : (
                 payrolls.map((run) => (
                   <div key={run.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative group">
                     
                     <button 
                        onClick={() => handleDeletePayroll(run.id)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        title="Delete Payroll Run"
                     >
                       <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                     </button>

                     <div>
                       <div className="flex justify-between items-start mb-4 pr-6">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold ${run.status === 'PAID' ? 'bg-green-100 text-green-700' : run.status === 'PROCESSED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                           {run.status}
                         </span>
                         <span className="text-xs text-gray-400">Run #{run.id}</span>
                       </div>
                       <p className="text-sm font-bold text-gray-800 mb-1">Period: {run.start_date} to {run.end_date}</p>
                       <p className="text-xs text-gray-500 mb-4">{run.paystubs?.length || 0} Paystubs Generated</p>
                     </div>
                     {run.status === 'DRAFT' && (
                       <button 
                         onClick={() => handleGenerateStubs(run.id)}
                         className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                       >
                         Generate Stubs
                       </button>
                     )}
                   </div>
                 ))
               )}
            </div>
          </section>

          {/* SECTION 4: LEAVES */}
          <section id="leaves" className="scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-800">Leave Requests</h2>
               <button 
                 onClick={() => setIsRequestLeaveModalOpen(true)}
                 className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
               >
                 Request Leave
               </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                     <tr className="text-xs text-gray-500 uppercase tracking-wider">
                        <th className="p-4 font-medium">Employee</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Dates</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {leaves.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-gray-400">No leave requests.</td></tr>
                     ) : (
                        leaves.map((leave) => (
                          <tr key={leave.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                             <td className="p-4 font-medium text-gray-800">{leave.employee_name}</td>
                             <td className="p-4 text-gray-600">{leave.leave_type}</td>
                             <td className="p-4 text-gray-600">{leave.start_date} to {leave.end_date}</td>
                             <td className="p-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                  leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                   {leave.status}
                                </span>
                             </td>
                             <td className="p-4 text-right">
                               {leave.status === 'PENDING' ? (
                                 <div className="flex justify-end gap-2">
                                   <button onClick={() => updateLeaveStatus(leave.id, 'APPROVED')} className="w-8 h-8 rounded bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center">
                                     <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                                   </button>
                                   <button onClick={() => updateLeaveStatus(leave.id, 'REJECTED')} className="w-8 h-8 rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center">
                                     <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                                   </button>
                                 </div>
                               ) : (
                                 <span className="text-xs text-gray-400">Processed</span>
                               )}
                             </td>
                          </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
          </section>

        </main>
      </div>

      {/* --- ADD EMPLOYEE MODAL --- */}
      {isAddEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddEmpModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 overflow-hidden animation-scale-up">
            
            <button onClick={() => setIsAddEmpModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
               <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>

            <div className="mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                 <FontAwesomeIcon icon={faUserPlus} className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Add New Employee</h2>
                <p className="text-sm text-gray-500">Enter the core details to set up this employee.</p>
              </div>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">First Name</label>
                  <input type="text" required value={empForm.first_name} onChange={e => setEmpForm({...empForm, first_name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Last Name</label>
                  <input type="text" required value={empForm.last_name} onChange={e => setEmpForm({...empForm, last_name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" required value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone</label>
                  <input type="text" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Job Title</label>
                <input type="text" required value={empForm.job_title} onChange={e => setEmpForm({...empForm, job_title: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status</label>
                  <select value={empForm.employment_type} onChange={e => setEmpForm({...empForm, employment_type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="FT">Full Time</option>
                    <option value="PT">Part Time</option>
                    <option value="CT">Contractor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Pay Type</label>
                  <select value={empForm.pay_type} onChange={e => setEmpForm({...empForm, pay_type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="SALARY">Salary</option>
                    <option value="HOURLY">Hourly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Base Pay</label>
                  <input type="number" step="0.01" required value={empForm.base_pay} onChange={e => setEmpForm({...empForm, base_pay: e.target.value})} placeholder="e.g. 50000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddEmpModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition transform active:scale-[0.98]"
                >
                  Save Employee
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* --- ADD PAYROLL RUN MODAL --- */}
      {isAddPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddPayrollModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animation-scale-up">
            
            <button onClick={() => setIsAddPayrollModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
               <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>

            <div className="mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                 <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">New Payroll Run</h2>
                <p className="text-sm text-gray-500">Set the pay period for this cycle.</p>
              </div>
            </div>

            <form onSubmit={handleCreatePayroll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Start Date</label>
                <input 
                  type="date" 
                  required 
                  value={payrollForm.start_date} 
                  onChange={e => setPayrollForm({...payrollForm, start_date: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">End Date</label>
                <input 
                  type="date" 
                  required 
                  value={payrollForm.end_date} 
                  onChange={e => setPayrollForm({...payrollForm, end_date: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddPayrollModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition transform active:scale-[0.98]"
                >
                  Create Run
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* --- REQUEST LEAVE MODAL --- */}
      {isRequestLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRequestLeaveModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animation-scale-up">
            
            <button onClick={() => setIsRequestLeaveModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
               <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>

            <div className="mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                 <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Request Leave</h2>
                <p className="text-sm text-gray-500">Submit a new time-off request.</p>
              </div>
            </div>

            <form onSubmit={handleRequestLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Employee</label>
                <select 
                  required 
                  value={leaveForm.employee} 
                  onChange={e => setLeaveForm({...leaveForm, employee: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Leave Type</label>
                <select 
                  value={leaveForm.leave_type} 
                  onChange={e => setLeaveForm({...leaveForm, leave_type: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="VACATION">Vacation</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={leaveForm.start_date} 
                    onChange={e => setLeaveForm({...leaveForm, start_date: e.target.value})} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">End Date</label>
                  <input 
                    type="date" 
                    required 
                    value={leaveForm.end_date} 
                    onChange={e => setLeaveForm({...leaveForm, end_date: e.target.value})} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Reason (Optional)</label>
                <textarea 
                  rows={3}
                  value={leaveForm.reason} 
                  onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsRequestLeaveModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition transform active:scale-[0.98]"
                >
                  Submit Request
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}