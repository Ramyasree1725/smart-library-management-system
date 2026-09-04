import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { QRScannerModal } from '../components/common/QRScannerModal';
import { 
  BookOpen, 
  Repeat, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  QrCode, 
  Plus, 
  ArrowRight, 
  Bookmark, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [dashRes, txRes] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getAllTransactions({ limit: 5 })
      ]);

      if (dashRes?.stats) setStats(dashRes.stats);
      if (dashRes?.charts) setCharts(dashRes.charts);
      if (txRes?.transactions) setRecentTransactions(txRes.transactions.slice(0, 5));
    } catch (e) {
      console.error("Admin dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

  const handleScanSuccess = (parsed) => {
    setShowScanner(false);
    navigate('/admin/circulation');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chief Librarian Executive Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Library Operations Command Center 🏛️
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time circulation metrics, inventory turnover, and automated fine control
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowScanner(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Circulation Scanner</span>
          </button>
          
          <Link
            to="/admin/books"
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Catalog Titles"
            value={stats.totalBooks}
            subtitle={`${stats.totalCopies} total copies (${stats.availableCopies} available)`}
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            title="Active Borrowings"
            value={stats.activeLoans}
            subtitle="Currently in circulation"
            icon={Repeat}
            color="indigo"
          />
          <StatCard
            title="Overdue Risk Items"
            value={stats.overdueLoans}
            subtitle="Fines being accrued"
            icon={AlertTriangle}
            color={stats.overdueLoans > 0 ? "rose" : "emerald"}
          />
          <StatCard
            title="Registered Students"
            value={stats.totalStudents}
            subtitle={`${stats.pendingReservations} pending waitlists`}
            icon={Users}
            color="emerald"
          />
        </div>
      )}

      {/* Interactive Recharts Analytics Visuals */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Monthly Borrowing & Return Velocity Area Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-heading">
                  Monthly Circulation Velocity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison between student checkouts and returns
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                +18.4% this month
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickLine={false} stroke="#94a3b8" fontSize={12} />
                  <YAxis tickLine={false} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="borrows" name="Books Borrowed" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBorrows)" />
                  <Area type="monotone" dataKey="returns" name="Books Returned" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReturns)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-heading">
                Subject Genre Share
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Catalog volume split across domains
              </p>
            </div>

            <div className="h-48 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {charts.categoryDistribution.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="truncate max-w-[90px]">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Recent Circulation Transactions Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Recent Circulation Activity
            </h2>
            <p className="text-xs text-slate-500">
              Live log of issues, returns, and overdue updates
            </p>
          </div>
          <Link
            to="/admin/circulation"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Full Circulation Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Book Title</th>
                  <th className="px-5 py-3.5">Issue Date</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((tx) => {
                  const isOverdue = tx.status === 'overdue';
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {tx.studentName}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {tx.studentRoll}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        {tx.bookTitle}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(tx.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(tx.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.status === 'returned'
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold">
                        {tx.fineAmount > 0 ? (
                          <span className={tx.finePaid ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}>
                            ₹{tx.fineAmount} {tx.finePaid ? '(Paid)' : '(Due)'}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
        title="Quick Circulation Desk Scanner"
      />

    </div>
  );
};
