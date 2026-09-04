import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  Calendar, 
  BookOpen, 
  AlertCircle,
  FileText
} from 'lucide-react';

export const StudentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active | returned
  const [actionMsg, setActionMsg] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getMyTransactions();
      if (res?.transactions) {
        setTransactions(res.transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRenew = async (txId) => {
    setActionMsg(null);
    try {
      const res = await api.renewBook(txId);
      if (res?.success) {
        setActionMsg({ type: 'success', text: res.message });
        fetchTransactions();
      }
    } catch (e) {
      setActionMsg({ type: 'error', text: e.message || 'Renewal failed' });
    }
  };

  const activeLoans = transactions.filter(t => t.status === 'issued' || t.status === 'overdue');
  const pastReturns = transactions.filter(t => t.status === 'returned');

  const displayedList = activeTab === 'active' ? activeLoans : pastReturns;

  const getDaysDiff = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
          My Borrowing History & Due Dates ⏳
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track active checkouts, countdowns, renewal requests, and historical receipts
        </p>
      </div>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs ${
          actionMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Checkouts ({activeLoans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returned')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'returned'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Returned History ({pastReturns.length})</span>
        </button>
      </div>

      {/* Transactions Table / Cards */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading loan records...</p>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">
            {activeTab === 'active' ? 'No active book loans on your account.' : 'No returned books in history yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((tx) => {
            const daysLeft = getDaysDiff(tx.dueDate);
            const isOverdue = tx.status === 'overdue' || (tx.status === 'issued' && daysLeft < 0);

            return (
              <div
                key={tx._id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/10'
                    : 'border-slate-200/80 dark:border-slate-800'
                } shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'returned'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                      }`}
                    >
                      {tx.status === 'returned'
                        ? 'Returned'
                        : isOverdue
                        ? `Overdue by ${Math.abs(daysLeft)} days`
                        : `${daysLeft} days remaining`}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {tx._id} • ISBN: {tx.bookIsbn}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {tx.bookTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Issued: {new Date(tx.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5" />
                      Due Date: {new Date(tx.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    {tx.returnDate && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Returned on: {new Date(tx.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Status / Actions */}
                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {tx.fineAmount > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Accrued Fine
                      </span>
                      <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                        ₹{tx.fineAmount} {tx.finePaid ? '(Paid)' : '(Unpaid)'}
                      </span>
                    </div>
                  )}

                  {tx.status !== 'returned' && (
                    <button
                      onClick={() => handleRenew(tx._id)}
                      className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-blue-200 dark:border-blue-800"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Renew (+14d)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
