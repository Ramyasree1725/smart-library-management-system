import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bookmark, CheckCircle2, Clock, X, AlertCircle, Sparkles } from 'lucide-react';

export const StudentReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.getMyReservations();
      if (res?.reservations) {
        setReservations(res.reservations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    try {
      const res = await api.cancelReservation(id);
      if (res?.success) {
        setMsg({ type: 'info', text: 'Reservation cancelled successfully' });
        fetchReservations();
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to cancel reservation' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
          My Reserved Book Queue 🔖
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          When books are out of stock, join the queue and get automatically notified upon check-in
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs ${
          msg.type === 'info'
            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {msg.type === 'info' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading reservations...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">
            No Active Book Reservations
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Whenever a book you need is on loan, click "Reserve" in the catalog to secure your queue spot.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const isReady = res.status === 'available';

            return (
              <div
                key={res._id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${
                  isReady 
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/20' 
                    : 'border-slate-200/80 dark:border-slate-800'
                } shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isReady
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 animate-pulse'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      }`}
                    >
                      {isReady ? '✨ Ready for Pickup!' : `Waitlist Position #${res.queuePosition}`}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Reserved on {new Date(res.reservedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {res.bookTitle}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {isReady 
                      ? 'The previous borrower has returned this book. It is held for you at the front desk for 48 hours.'
                      : 'You will receive an automatic system notification the moment a copy is scanned back into inventory.'
                    }
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {res.status === 'waiting' && (
                    <button
                      onClick={() => handleCancel(res._id)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
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
