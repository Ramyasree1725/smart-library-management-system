import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { QRViewerModal } from '../components/common/QRViewerModal';
import { 
  Users, 
  Search, 
  QrCode, 
  Mail, 
  Phone, 
  BookOpen, 
  GraduationCap,
  Calendar
} from 'lucide-react';

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, txRes] = await Promise.all([
        api.getStudents(),
        api.getAllTransactions()
      ]);
      if (stuRes?.users) setStudents(stuRes.users);
      if (txRes?.transactions) setTransactions(txRes.transactions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
           s.email.toLowerCase().includes(q) ||
           s.rollNumber?.toLowerCase().includes(q) ||
           s.department?.toLowerCase().includes(q);
  });

  const getStudentActiveCount = (stuId) => {
    return transactions.filter(t => t.studentId === stuId && (t.status === 'issued' || t.status === 'overdue')).length;
  };

  const handleOpenQR = (student) => {
    setSelectedStudent(student);
    setShowQRModal(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
          Student Member Registry 🎓
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Directory of registered student scholars, active borrowings, and digital QR passes
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by student name, roll number, email, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading student directory...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">No students found matching search query.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Student Scholar</th>
                  <th className="px-5 py-3.5">Roll Number</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Active Loans</th>
                  <th className="px-5 py-3.5 text-right">Digital QR Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((stu) => {
                  const activeLoans = getStudentActiveCount(stu._id);

                  return (
                    <tr key={stu._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={stu.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(stu.name)}`}
                            alt={stu.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {stu.name}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Joined {stu.joinedDate || '2024'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {stu.rollNumber}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {stu.department}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{stu.email}</span>
                        </div>
                        {stu.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{stu.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          activeLoans > 0 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'text-slate-400'
                        }`}>
                          {activeLoans} {activeLoans === 1 ? 'book' : 'books'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenQR(stu)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5 text-blue-500" />
                          <span>Show QR Pass</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {selectedStudent && (
        <QRViewerModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          data={selectedStudent}
          type="student"
        />
      )}

    </div>
  );
};
