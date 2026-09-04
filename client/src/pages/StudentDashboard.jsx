import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { QRViewerModal } from '../components/common/QRViewerModal';
import { 
  BookOpen, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  Bookmark, 
  QrCode, 
  ArrowRight, 
  Calendar,
  Star,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [recRes, txRes, resvRes] = await Promise.all([
          api.getRecommendations().catch(() => ({ recommendations: [] })),
          api.getMyTransactions().catch(() => ({ transactions: [] })),
          api.getMyReservations().catch(() => ({ reservations: [] }))
        ]);

        if (recRes?.recommendations) setRecommendations(recRes.recommendations);
        if (txRes?.transactions) {
          setActiveLoans(txRes.transactions.filter(t => t.status === 'issued' || t.status === 'overdue'));
        }
        if (resvRes?.reservations) {
          setReservations(resvRes.reservations.filter(r => r.status === 'waiting' || r.status === 'available'));
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const overdueCount = activeLoans.filter(l => l.status === 'overdue').length;
  const totalFine = activeLoans.reduce((acc, l) => acc + (l.fineAmount || 0), 0);

  // Helper to calculate days remaining until due
  const getDaysLeft = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Welcome Banner with Student QR Pass Button */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Academic Session 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Welcome back, {user?.name?.split(' ')[0]}! 📚
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            {user?.department} • Roll No: {user?.rollNumber}. You have {activeLoans.length} active books checked out.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setShowQRModal(true)}
            className="px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Show Digital ID QR</span>
          </button>
        </div>

        {/* Decorative Background Circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Overdue Warning Alert */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Action Required: You have {overdueCount} overdue {overdueCount === 1 ? 'book' : 'books'}!
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Current outstanding fine: ₹{totalFine}. Please return at the circulation desk or renew online.
              </p>
            </div>
          </div>
          <Link
            to="/history"
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl flex-shrink-0 transition-colors"
          >
            View Loans
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Loans"
          value={activeLoans.length}
          subtitle="Currently in possession"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Overdue Items"
          value={overdueCount}
          subtitle={overdueCount > 0 ? "Penalty ₹10/day" : "All loans on schedule"}
          icon={Clock}
          color={overdueCount > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Active Reservations"
          value={reservations.length}
          subtitle="Waitlist queue active"
          icon={Bookmark}
          color="amber"
        />
        <StatCard
          title="Total Fine Due"
          value={`₹${totalFine}`}
          subtitle={totalFine === 0 ? "Clean record" : "Pay at library desk"}
          icon={TrendingUp}
          color={totalFine > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* AI Recommendation Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                Recommended For You
              </h2>
              <p className="text-xs text-slate-500">
                Personalized using content similarity from your reading profile & department
              </p>
            </div>
          </div>

          <Link
            to="/catalog"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            Start borrowing books to unlock deeper personalized AI recommendations!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendations.map((book) => (
              <div
                key={book._id}
                onClick={() => navigate(`/catalog?id=${book._id}`)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 bg-slate-100 relative">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600/90 backdrop-blur-md rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{book.recommendationScore}% Match</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {book.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1 line-clamp-1">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {book.author}
                  </p>

                  <div className="mt-2 p-2 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg text-[10px] text-blue-700 dark:text-blue-300 italic line-clamp-2">
                    💡 {book.recommendationReason}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className={`font-semibold text-[11px] ${book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Out of stock'}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {book.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Borrowings Live List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
            Current Borrowed Books & Due Deadlines
          </h2>
          <Link
            to="/history"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            History & Renewals →
          </Link>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              You currently have no active books issued.
            </p>
            <Link
              to="/catalog"
              className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => {
              const daysLeft = getDaysLeft(loan.dueDate);
              const isOverdue = loan.status === 'overdue' || daysLeft < 0;

              return (
                <div
                  key={loan._id}
                  className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${
                    isOverdue
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                      : 'border-slate-200/80 dark:border-slate-800'
                  } shadow-sm flex items-start justify-between gap-4`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                        }`}
                      >
                        {isOverdue ? `Overdue (${Math.abs(daysLeft)}d)` : `${daysLeft} days left`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ISBN: {loan.bookIsbn}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {loan.bookTitle}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {new Date(loan.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {isOverdue && (
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          Fine: ₹{loan.fineAmount}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/history"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors flex-shrink-0"
                    title="Manage Loan"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Student QR Modal */}
      {user && (
        <QRViewerModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          data={user}
          type="student"
        />
      )}

    </div>
  );
};
