/**
 * Smart Book Availability & Demand Velocity Predictor
 */

export function analyzeBookDemand(book, allTransactions) {
  const bookTx = allTransactions.filter(tx => tx.bookId === book._id);
  const activeLoans = bookTx.filter(tx => tx.status === 'issued' || tx.status === 'overdue');
  
  const totalCopies = book.totalCopies || 1;
  const availableCopies = book.availableCopies ?? (totalCopies - activeLoans.length);
  const turnoverRatio = parseFloat(((book.borrowCount || bookTx.length) / totalCopies).toFixed(2));
  
  // Demand level determination
  let demandLevel = "Normal";
  let badgeColor = "blue";
  if (availableCopies === 0) {
    demandLevel = "Critical (Out of Stock)";
    badgeColor = "red";
  } else if (availableCopies <= 1 || turnoverRatio > 7.0) {
    demandLevel = "High Demand";
    badgeColor = "amber";
  } else if (turnoverRatio > 3.0) {
    demandLevel = "Moderate";
    badgeColor = "emerald";
  }

  // Calculate estimated return date if 0 copies available
  let estimatedAvailableDate = null;
  if (availableCopies === 0 && activeLoans.length > 0) {
    // Sort active loans by nearest due date
    const sortedDues = [...activeLoans].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    estimatedAvailableDate = sortedDues[0].dueDate;
  }

  // Acquisition recommendation
  let restockRecommendation = "Stock adequate for current semester enrollment";
  if (availableCopies === 0 && activeLoans.length >= totalCopies) {
    restockRecommendation = `Procure +${Math.ceil(totalCopies * 0.5)} additional copies immediately due to waitlist pressure.`;
  } else if (turnoverRatio > 6.0 && availableCopies <= 1) {
    restockRecommendation = `Consider adding +2 copies to ease shelf congestion.`;
  }

  return {
    bookId: book._id,
    title: book.title,
    totalCopies,
    availableCopies,
    activeLoansCount: activeLoans.length,
    turnoverRatio,
    demandLevel,
    badgeColor,
    estimatedAvailableDate,
    restockRecommendation
  };
}
