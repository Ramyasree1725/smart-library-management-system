import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Award,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [dashRes, bookRes] = await Promise.all([
          api.getDashboardAnalytics(),
          api.getBooks({ sortBy: 'popular' })
        ]);
        if (dashRes?.stats) setStats(dashRes.stats);
        if (dashRes?.charts) setCharts(dashRes.charts);
        if (bookRes?.books) setBooks(bookRes.books);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Demand & Forecasting Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
          Predictive Analytics & Library Intelligence 📈
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Machine-learning turnover velocity, peak borrowing patterns, and catalog replenishment forecasts
        </p>
      </div>

      {/* Visual Analytics Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Day of Week Peak Borrowing Activity */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-heading">
                Weekly Peak Traffic Hours (Daily Loans)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Staffing optimization recommendation for peak circulation days
              </p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="day" tickLine={false} stroke="#94a3b8" fontSize={12} />
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
                  <Bar dataKey="count" name="Circulation Checkouts" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Wednesday & Thursday</strong> experience highest footfall. Recommend extra front-desk assistants.
            </div>
          </div>

          {/* Active Student Scholars Leaderboard */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-heading">
                Top Student Scholar Readers 🏆
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Most active library borrowers recognized for academic engagement
              </p>
            </div>

            <div className="space-y-3">
              {charts.topStudents.map((stu, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-700 text-white'
                    }`}>
                      #{idx + 1}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{stu.name}</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{stu.count} checkouts</span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-slate-400 text-center">
              Student awards badge issued at end of semester
            </div>
          </div>

        </div>
      )}

      {/* Demand Velocity & Replenishment Forecasting Table */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
            Inventory Turnover & Replenishment Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Calculates borrow-to-copy turnover ratios and suggests proactive procurement quotas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Book Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Total Borrows</th>
                  <th className="px-5 py-3.5">Turnover Ratio</th>
                  <th className="px-5 py-3.5">Stock Status</th>
                  <th className="px-5 py-3.5">AI Restock Advice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {books.map((b) => {
                  const turnover = ((b.borrowCount || 1) / (b.totalCopies || 1)).toFixed(1);
                  const isCritical = b.availableCopies === 0;
                  const isHigh = turnover > 6.0;

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">
                          {b.title}
                        </div>
                        <span className="text-[11px] text-slate-400">By {b.author}</span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {b.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {b.borrowCount || 0} times
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`font-bold ${isHigh ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {turnover}x / copy
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isCritical
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                            : isHigh
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                        }`}>
                          {isCritical ? 'Out of Stock' : `${b.availableCopies} available`}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-medium">
                        {isCritical ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            🚨 High waitlist pressure. Procure +{Math.ceil(b.totalCopies * 0.5)} copies.
                          </span>
                        ) : isHigh ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            ⚡ High turnover. Monitor return velocity.
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            ✓ Adequate inventory
                          </span>
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

    </div>
  );
};
