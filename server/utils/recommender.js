/**
 * Smart Content-Based Recommendation Engine
 * Calculates multi-dimensional similarity between a student's reading profile and library catalog.
 */

export function generateRecommendations(studentId, allBooks, allTransactions) {
  // 1. Fetch user's borrowed & returned book history
  const userTransactions = allTransactions.filter(tx => tx.studentId === studentId);
  const borrowedBookIds = new Set(userTransactions.map(tx => tx.bookId));

  // If new user with no history, recommend top-rated & most popular books
  if (userTransactions.length === 0) {
    const popularBooks = [...allBooks]
      .sort((a, b) => (b.borrowCount * 0.6 + b.rating * 10 * 0.4) - (a.borrowCount * 0.6 + a.rating * 10 * 0.4))
      .slice(0, 4)
      .map(book => ({
        ...book,
        recommendationScore: 95,
        recommendationReason: "Trending across the University library this semester"
      }));
    return popularBooks;
  }

  // 2. Build User Preference Profile
  const categoryFreq = {};
  const subjectFreq = {};
  const authorFreq = {};
  const tagFreq = {};
  const readBooksDetails = [];

  userTransactions.forEach(tx => {
    const book = allBooks.find(b => b._id === tx.bookId);
    if (book) {
      readBooksDetails.push(book);
      categoryFreq[book.category] = (categoryFreq[book.category] || 0) + 3;
      subjectFreq[book.subject] = (subjectFreq[book.subject] || 0) + 4;
      authorFreq[book.author] = (authorFreq[book.author] || 0) + 3;
      
      if (Array.isArray(book.tags)) {
        book.tags.forEach(tag => {
          tagFreq[tag] = (tagFreq[tag] || 0) + 2;
        });
      }
    }
  });

  // 3. Score candidate books (books the user hasn't borrowed yet)
  const candidateBooks = allBooks.filter(book => !borrowedBookIds.has(book._id));

  const scoredBooks = candidateBooks.map(book => {
    let score = 0;
    const reasons = [];

    // Category match
    if (categoryFreq[book.category]) {
      score += categoryFreq[book.category] * 5;
      reasons.push(`matches your interest in ${book.category}`);
    }

    // Subject match
    if (subjectFreq[book.subject]) {
      score += subjectFreq[book.subject] * 7;
      reasons.push(`related to ${book.subject}`);
    }

    // Author match
    if (authorFreq[book.author]) {
      score += authorFreq[book.author] * 8;
      reasons.push(`more works by ${book.author}`);
    }

    // Tag overlap
    let tagMatches = 0;
    if (Array.isArray(book.tags)) {
      book.tags.forEach(t => {
        if (tagFreq[t]) {
          score += tagFreq[t] * 3;
          tagMatches++;
        }
      });
    }

    if (tagMatches > 0 && reasons.length === 0) {
      reasons.push(`shares topics with your previous readings`);
    }

    // Popularity & Rating bonus
    score += (book.rating || 4.0) * 4;
    score += Math.min(book.borrowCount || 0, 30) * 0.5;

    // Normalizing confidence percentage (capped at 99%)
    const confidence = Math.min(99, Math.max(65, Math.round(50 + score * 0.7)));

    // Formulate humanized explanation
    let mainReason = reasons.length > 0 
      ? `Because you read ${readBooksDetails[0]?.title ? `"${readBooksDetails[0].title.slice(0, 25)}..."` : 'similar books'} and ${reasons[0]}`
      : "Highly rated title matching your academic department";

    return {
      ...book,
      recommendationScore: confidence,
      recommendationReason: mainReason
    };
  });

  // Sort by highest recommendation score
  scoredBooks.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return scoredBooks.slice(0, 4);
}
