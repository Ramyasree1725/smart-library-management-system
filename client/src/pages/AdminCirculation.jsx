import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';
import { QRScannerModal } from '../components/common/QRScannerModal';
import { 
  Repeat, 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  BookOpen, 
  DollarSign, 
  Clock,
  AlertCircle,
  Sparkles,
  Plus
} from 'lucide-react';

export const AdminCirculation = () => {
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // all | issued | overdue | returned
  const [search, setSearch] = useState('');

  // Modals
  const [showScanner, setShowScanner] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Issue Form State
  const [issueData, setIssueData] = useState({
    studentId: '',
    bookId: '',
    days: 14
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, stuRes, bkRes] = await Promise.all([
        api.getAllTransactions({ status: statusFilter, search }),
        api.getStudents().catch(() => ({ users: [] })),
        api.getBooks({ availability: 'all' }).catch(() => ({ books: [] }))
      ]);

      if (txRes?.transactions) setTransactions(txRes.transactions);
      if (stuRes?.users) setStudents(stuRes.users);
      if (bkRes?.books) setBooks(bkRes.books);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // QR Scan Handler
  const handleQRScanSuccess = async (parsed, raw) => {
    setShowScanner(false);
    setFeedback(null);

    // If scanned a student pass
    if (parsed?.type === 'student' || parsed?.roll) {
      const targetRoll = parsed.roll || parsed.id;
      const foundStudent = students.find(s => s._id === parsed.id || s.rollNumber === targetRoll);
      if (foundStudent) {
        setIssueData(prev => ({ ...prev, studentId: foundStudent._id }));
        setShowIssueModal(true);
        setFeedback({ type: 'info', text: `Scanned student: ${foundStudent.name} (${foundStudent.rollNumber})` });
        return;
      }
    }

    // If scanned a book QR
    if (parsed?.type === 'book' || parsed?.isbn) {
      const targetIsbn = parsed.isbn || parsed.id;
      const foundBook = books.find(b => b._id === parsed.id || b.isbn === targetIsbn);
      if (foundBook) {
        setIssueData(prev => ({ ...prev, bookId: foundBook._id }));
        setShowIssueModal(true);
        setFeedback({ type: 'info', text: `Scanned book: ${foundBook.title}` });
        return;
      }
    }

    // Default fallback: search query
    setSearch(raw);
    fetchData();
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await api.issueBook(issueData);
      if (res?.success) {
        setFeedback({ type: 'success', text: res.message });
        setShowIssueModal(false);
        setIssueData({ studentId: '', bookId: '', days: 14 });
        fetchData();
      }
    } catch (e) {
      setFeedback({ type: 'error', text: e.message || 'Failed to issue book' });
    }
  };

  const handleReturnBook = async (transactionId, bookTitle) => {
    setFeedback(null);
    try {
      const res = await api.returnBook({ transactionId });
      if (res?.success) {
        setFeedback({
          type: 'success',
          text: `"${bookTitle}" returned successfully! ${res.fineAmount > 0 ? `Accrued fine: ₹${res.fineAmount}.` : 'No fine accrued.'}`
        });
        fetchData();
      }
    } catch (e) {
      setFeedback({ type: 'error', text: e.message || 'Failed to return book' });
    }
  };

  const handlePayFine = async (transactionId) => {
    try {
      const res = await api.payFine(transactionId);
      if (res?.success) {
        setFeedback({ type: 'success', text: res.message });
        fetchData();
      }
    } catch (e) {
      setFeedback({ type: 'error', text: e.message || 'Failed to settle fine' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Circulation Desk & QR Checkouts ⚡
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rapid 1-second checkouts, return reconciliation, waitlist releases, and fine settlements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowScanner(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Student / Book QR</span>
          </button>

          <button
            onClick={() => {
              setFeedback(null);
              setShowIssueModal(true);
            }}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Issue</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : feedback.type === 'info'
            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search student roll, name, book title, or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg"
            >
              Search
            </button>
          </div>
        </form>

        <div className="inline-flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {['all', 'issued', 'overdue', 'returned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Circulation Table */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading circulation records...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <Repeat className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">No circulation transactions found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Book Title</th>
                  <th className="px-5 py-3.5">Issue / Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Fine Accrued</th>
                  <th className="px-5 py-3.5 text-right">Circulation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((tx) => {
                  const isOverdue = tx.status === 'overdue';
                  const isReturned = tx.status === 'returned';

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {tx.studentName}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Roll: {tx.studentRoll}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                          {tx.bookTitle}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ISBN: {tx.bookIsbn}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        <div>Issued: {new Date(tx.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          Due: {new Date(tx.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isReturned
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 animate-pulse'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {tx.fineAmount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-extrabold ${tx.finePaid ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              ₹{tx.fineAmount}
                            </span>
                            {!tx.finePaid && (
                              <button
                                onClick={() => handlePayFine(tx._id)}
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 rounded text-[10px] font-bold"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => handleReturnBook(tx._id, tx.bookTitle)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                          >
                            Process Return
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">
                            Completed
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
      )}

      {/* Issue Book Modal */}
      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title="Issue Book to Student"
        subtitle="Select registered student and catalog title"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Select Student *
            </label>
            <select
              required
              value={issueData.studentId}
              onChange={(e) => setIssueData({ ...issueData, studentId: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Choose Registered Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.rollNumber}) - {s.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Select Book Title *
            </label>
            <select
              required
              value={issueData.bookId}
              onChange={(e) => setIssueData({ ...issueData, bookId: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Choose Book from Catalog --</option>
              {books.map((b) => (
                <option key={b._id} value={b._id} disabled={b.availableCopies <= 0}>
                  {b.title} (Avail: {b.availableCopies}/{b.totalCopies}) - {b.shelfLocation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Loan Duration (Days)
            </label>
            <select
              value={issueData.days}
              onChange={(e) => setIssueData({ ...issueData, days: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={7}>7 Days (1 Week)</option>
              <option value={14}>14 Days (Standard 2 Weeks)</option>
              <option value={30}>30 Days (Semester Special)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowIssueModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Confirm & Issue Book
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleQRScanSuccess}
        title="Circulation Desk Scanner"
      />

    </div>
  );
};
