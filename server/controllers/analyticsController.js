import { dbStore } from '../data/store.js';

export const getDashboardStats = (req, res) => {
  try {
    dbStore.refreshTransactionStatuses();

    const totalBooks = dbStore.books.length;
    const totalCopies = dbStore.books.reduce((acc, b) => acc + (b.totalCopies || 1), 0);
    const availableCopies = dbStore.books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
    
    const activeLoans = dbStore.transactions.filter(t => t.status === 'issued').length;
    const overdueLoans = dbStore.transactions.filter(t => t.status === 'overdue').length;
    const totalTransactions = dbStore.transactions.length;

    const totalFinesAccrued = dbStore.transactions.reduce((acc, t) => acc + (t.fineAmount || 0), 0);
    const totalFinesPaid = dbStore.transactions
      .filter(t => t.finePaid)
      .reduce((acc, t) => acc + (t.fineAmount || 0), 0);
    const totalFinesPending = totalFinesAccrued - totalFinesPaid;

    const totalStudents = dbStore.users.filter(u => u.role === 'student').length;
    const pendingReservations = dbStore.reservations.filter(r => r.status === 'waiting').length;

    // Monthly Borrowing Trend (Simulated + Live)
    const monthlyTrends = [
      { month: 'Apr', borrows: 38, returns: 32 },
      { month: 'May', borrows: 45, returns: 40 },
      { month: 'Jun', borrows: 28, returns: 30 },
      { month: 'Jul', borrows: 52, returns: 48 },
      { month: 'Aug', borrows: 64, returns: 58 },
      { month: 'Sep', borrows: totalTransactions + 15, returns: 22 }
    ];

    // Category Distribution
    const categoryCount = {};
    dbStore.books.forEach(b => {
      categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoryCount).map(name => ({
      name,
      value: categoryCount[name]
    }));

    // Top Most Borrowed Books
    const mostBorrowedBooks = [...dbStore.books]
      .sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0))
      .slice(0, 5)
      .map(b => ({
        id: b._id,
        title: b.title,
        author: b.author,
        borrowCount: b.borrowCount || 0,
        available: b.availableCopies,
        total: b.totalCopies
      }));

    // Active Students Borrowing Frequency
    const studentBorrowMap = {};
    dbStore.transactions.forEach(t => {
      studentBorrowMap[t.studentName] = (studentBorrowMap[t.studentName] || 0) + 1;
    });
    const topStudents = Object.keys(studentBorrowMap)
      .map(name => ({ name, count: studentBorrowMap[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Day of week borrowing pattern
    const dayOfWeekData = [
      { day: 'Mon', count: 18 },
      { day: 'Tue', count: 24 },
      { day: 'Wed', count: 32 },
      { day: 'Thu', count: 28 },
      { day: 'Fri', count: 22 },
      { day: 'Sat', count: 12 },
      { day: 'Sun', count: 5 }
    ];

    return res.json({
      success: true,
      stats: {
        totalBooks,
        totalCopies,
        availableCopies,
        activeLoans,
        overdueLoans,
        totalStudents,
        pendingReservations,
        totalFinesAccrued,
        totalFinesPaid,
        totalFinesPending
      },
      charts: {
        monthlyTrends,
        categoryDistribution,
        mostBorrowedBooks,
        topStudents,
        dayOfWeekData
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate analytics', error: error.message });
  }
};
