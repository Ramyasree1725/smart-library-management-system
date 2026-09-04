import { dbStore } from '../data/store.js';

export const issueBook = (req, res) => {
  try {
    const { studentId, bookId, days = 14 } = req.body;
    const issuerName = req.user?.name || 'Librarian Desk';

    if (!studentId || !bookId) {
      return res.status(400).json({ success: false, message: 'Student ID and Book ID are required' });
    }

    const student = dbStore.users.find(u => u._id === studentId || u.rollNumber?.toLowerCase() === studentId.toLowerCase());
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in registry' });
    }

    const book = dbStore.books.find(b => b._id === bookId || b.isbn === bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found in catalog' });
    }

    // Check availability
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: `No available copies for "${book.title}". You can place a reservation instead.`
      });
    }

    // Check if student currently has this book issued or overdue
    const alreadyIssued = dbStore.transactions.find(
      tx => tx.studentId === student._id && tx.bookId === book._id && (tx.status === 'issued' || tx.status === 'overdue')
    );
    if (alreadyIssued) {
      return res.status(400).json({
        success: false,
        message: `Student "${student.name}" already has an active loan for this book.`
      });
    }

    // Calculate dates
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(days));

    // Decrement available copies, increment borrowCount
    book.availableCopies -= 1;
    book.borrowCount = (book.borrowCount || 0) + 1;

    // Create transaction
    const newTransaction = {
      _id: `tx_${Date.now()}`,
      studentId: student._id,
      studentName: student.name,
      studentRoll: student.rollNumber,
      bookId: book._id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      status: 'issued',
      fineAmount: 0,
      finePaid: true,
      issuedBy: issuerName
    };

    dbStore.transactions.unshift(newTransaction);

    // If student had a reservation for this book, fulfill it
    const resv = dbStore.reservations.find(r => r.studentId === student._id && r.bookId === book._id && (r.status === 'waiting' || r.status === 'available'));
    if (resv) {
      resv.status = 'fulfilled';
    }

    // Add confirmation notification
    dbStore.notifications.unshift({
      _id: `notif_${Date.now()}`,
      userId: student._id,
      title: 'Book Issued Successfully',
      message: `"${book.title}" has been issued to you. Due date: ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    });

    dbStore.save();

    return res.status(201).json({
      success: true,
      message: `Successfully issued "${book.title}" to ${student.name}`,
      transaction: newTransaction,
      book
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to issue book', error: error.message });
  }
};

export const returnBook = (req, res) => {
  try {
    const { transactionId, bookId, studentId } = req.body;

    dbStore.refreshTransactionStatuses();

    let tx = null;
    if (transactionId) {
      tx = dbStore.transactions.find(t => t._id === transactionId);
    } else if (bookId && studentId) {
      tx = dbStore.transactions.find(
        t => (t.bookId === bookId || t.bookIsbn === bookId) && 
             (t.studentId === studentId || t.studentRoll?.toLowerCase() === studentId.toLowerCase()) && 
             (t.status === 'issued' || t.status === 'overdue')
      );
    }

    if (!tx) {
      return res.status(404).json({ success: false, message: 'Active borrowing transaction not found' });
    }

    if (tx.status === 'returned') {
      return res.status(400).json({ success: false, message: 'This book has already been returned' });
    }

    const book = dbStore.books.find(b => b._id === tx.bookId);
    const student = dbStore.users.find(u => u._id === tx.studentId);

    const returnDate = new Date();
    const dueDate = new Date(tx.dueDate);
    let fineAmount = 0;

    if (returnDate > dueDate) {
      const diffMs = returnDate - dueDate;
      const overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      fineAmount = overdueDays * 10; // ₹10 per day
    }

    tx.returnDate = returnDate.toISOString();
    tx.status = 'returned';
    tx.fineAmount = fineAmount;
    if (fineAmount === 0) tx.finePaid = true;

    // Restore copy
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, (book.availableCopies || 0) + 1);
    }

    // Check if another student reserved this book
    const waitingReservation = dbStore.reservations.find(r => r.bookId === tx.bookId && r.status === 'waiting');
    if (waitingReservation) {
      waitingReservation.status = 'available';
      // notify next student
      dbStore.notifications.unshift({
        _id: `notif_${Date.now()}`,
        userId: waitingReservation.studentId,
        title: 'Reserved Book Is Ready!',
        message: `Good news! "${book?.title || 'Your reserved book'}" is now available at the circulation desk. Please collect it within 48 hours.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    // Notify returning student
    if (student) {
      dbStore.notifications.unshift({
        _id: `notif_${Date.now() + 1}`,
        userId: student._id,
        title: 'Book Return Confirmed',
        message: `Thank you for returning "${tx.bookTitle}". ${fineAmount > 0 ? `Outstanding fine: ₹${fineAmount}.` : 'No fines accrued.'}`,
        type: fineAmount > 0 ? 'warning' : 'info',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    dbStore.save();

    return res.json({
      success: true,
      message: `"${tx.bookTitle}" returned successfully.`,
      transaction: tx,
      fineAmount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process return', error: error.message });
  }
};

export const renewBook = (req, res) => {
  try {
    const { transactionId } = req.body;
    const tx = dbStore.transactions.find(t => t._id === transactionId);

    if (!tx || tx.status === 'returned') {
      return res.status(404).json({ success: false, message: 'Active transaction not found' });
    }

    // Check if book has pending reservations by other students
    const hasReservations = dbStore.reservations.some(r => r.bookId === tx.bookId && r.status === 'waiting');
    if (hasReservations) {
      return res.status(400).json({
        success: false,
        message: 'Cannot renew: Other students are on the waitlist for this title.'
      });
    }

    const currentDue = new Date(tx.dueDate);
    currentDue.setDate(currentDue.getDate() + 14);
    tx.dueDate = currentDue.toISOString();
    tx.status = 'issued';

    dbStore.save();

    return res.json({
      success: true,
      message: `Book loan renewed until ${currentDue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      transaction: tx
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to renew book' });
  }
};

export const reserveBook = (req, res) => {
  try {
    const { bookId } = req.body;
    const studentId = req.user._id;

    const book = dbStore.books.find(b => b._id === bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const existingRes = dbStore.reservations.find(
      r => r.studentId === studentId && r.bookId === bookId && (r.status === 'waiting' || r.status === 'available')
    );
    if (existingRes) {
      return res.status(400).json({ success: false, message: 'You have already reserved this book' });
    }

    const queueCount = dbStore.reservations.filter(r => r.bookId === bookId && r.status === 'waiting').length;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);

    const newReservation = {
      _id: `res_${Date.now()}`,
      studentId,
      studentName: req.user.name,
      studentRoll: req.user.rollNumber,
      bookId: book._id,
      bookTitle: book.title,
      reservedAt: new Date().toISOString(),
      status: 'waiting',
      queuePosition: queueCount + 1,
      expiryDate: expiry.toISOString()
    };

    dbStore.reservations.unshift(newReservation);
    dbStore.save();

    return res.status(201).json({
      success: true,
      message: `Reservation placed! You are #${newReservation.queuePosition} in queue for "${book.title}".`,
      reservation: newReservation
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reserve book', error: error.message });
  }
};

export const cancelReservation = (req, res) => {
  try {
    const { id } = req.params;
    const index = dbStore.reservations.findIndex(r => r._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    dbStore.reservations.splice(index, 1);
    dbStore.save();

    return res.json({ success: true, message: 'Reservation cancelled' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel reservation' });
  }
};

export const payFine = (req, res) => {
  try {
    const { transactionId } = req.body;
    const tx = dbStore.transactions.find(t => t._id === transactionId);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    tx.finePaid = true;
    dbStore.save();

    return res.json({ success: true, message: `Fine of ₹${tx.fineAmount} marked as paid.`, transaction: tx });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update fine status' });
  }
};

export const getAllTransactions = (req, res) => {
  try {
    dbStore.refreshTransactionStatuses();
    const { status = 'all', search = '' } = req.query;

    let list = [...dbStore.transactions];

    if (status !== 'all') {
      list = list.filter(tx => tx.status === status);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        tx => tx.bookTitle.toLowerCase().includes(q) ||
              tx.studentName.toLowerCase().includes(q) ||
              tx.studentRoll?.toLowerCase().includes(q) ||
              tx.bookIsbn?.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: list.length, transactions: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};

export const getStudentTransactions = (req, res) => {
  try {
    dbStore.refreshTransactionStatuses();
    const studentId = req.user._id;
    const list = dbStore.transactions.filter(tx => tx.studentId === studentId);
    return res.json({ success: true, count: list.length, transactions: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student transactions' });
  }
};

export const getStudentReservations = (req, res) => {
  try {
    const studentId = req.user._id;
    const list = dbStore.reservations.filter(r => r.studentId === studentId);
    return res.json({ success: true, count: list.length, reservations: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student reservations' });
  }
};
