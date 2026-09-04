import { dbStore } from '../data/store.js';
import { analyzeBookDemand } from '../utils/predictor.js';

export const getBooks = (req, res) => {
  try {
    const { 
      search = '', 
      category = 'All', 
      availability = 'all', 
      sortBy = 'popular',
      department = 'All'
    } = req.query;

    let filtered = [...dbStore.books];

    // 1. Smart Multi-field text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(b => {
        const inTitle = b.title.toLowerCase().includes(q);
        const inAuthor = b.author.toLowerCase().includes(q);
        const inIsbn = b.isbn.toLowerCase().includes(q);
        const inSubject = b.subject.toLowerCase().includes(q);
        const inTags = Array.isArray(b.tags) && b.tags.some(t => t.toLowerCase().includes(q));
        const inDesc = b.description?.toLowerCase().includes(q);
        return inTitle || inAuthor || inIsbn || inSubject || inTags || inDesc;
      });
    }

    // 2. Category filter
    if (category && category !== 'All') {
      filtered = filtered.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }

    // 3. Department filter
    if (department && department !== 'All') {
      filtered = filtered.filter(b => b.department?.toLowerCase() === department.toLowerCase());
    }

    // 4. Availability filter
    if (availability === 'available') {
      filtered = filtered.filter(b => b.availableCopies > 0);
    } else if (availability === 'borrowed') {
      filtered = filtered.filter(b => b.availableCopies === 0);
    }

    // 5. Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'popular') return (b.borrowCount || 0) - (a.borrowCount || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return (b.publishedYear || 0) - (a.publishedYear || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    // Unique categories list for filters
    const categories = ['All', ...new Set(dbStore.books.map(b => b.category))];
    const departments = ['All', ...new Set(dbStore.books.map(b => b.department).filter(Boolean))];

    return res.json({
      success: true,
      count: filtered.length,
      categories,
      departments,
      books: filtered
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch books', error: error.message });
  }
};

export const getBookById = (req, res) => {
  try {
    const { id } = req.params;
    const book = dbStore.books.find(b => b._id === id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Include demand analytics and live active loan status
    const demandAnalytics = analyzeBookDemand(book, dbStore.transactions);

    return res.json({
      success: true,
      book,
      demandAnalytics
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch book', error: error.message });
  }
};

export const createBook = (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      subject,
      department,
      description,
      totalCopies = 3,
      shelfLocation,
      publishedYear,
      publisher,
      coverImage,
      tags = []
    } = req.body;

    if (!title || !author || !isbn) {
      return res.status(400).json({ success: false, message: 'Title, Author, and ISBN are mandatory' });
    }

    const existing = dbStore.books.find(b => b.isbn === isbn);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A book with this ISBN already exists' });
    }

    const newBook = {
      _id: `book_${Date.now()}`,
      title,
      author,
      isbn,
      category: category || 'General Science',
      subject: subject || 'General',
      department: department || 'General',
      description: description || 'No summary available.',
      totalCopies: Number(totalCopies) || 1,
      availableCopies: Number(totalCopies) || 1,
      shelfLocation: shelfLocation || 'Main Hall Rack 1',
      publishedYear: publishedYear ? Number(publishedYear) : new Date().getFullYear(),
      publisher: publisher || 'Academic Press',
      rating: 4.5,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [],
      borrowCount: 0
    };

    dbStore.books.unshift(newBook);
    dbStore.save();

    return res.status(201).json({
      success: true,
      message: `Book "${newBook.title}" added to library catalog!`,
      book: newBook
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add book', error: error.message });
  }
};

export const updateBook = (req, res) => {
  try {
    const { id } = req.params;
    const index = dbStore.books.findIndex(b => b._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const current = dbStore.books[index];
    const updated = {
      ...current,
      ...req.body,
      _id: current._id // preserve ID
    };

    if (req.body.tags && typeof req.body.tags === 'string') {
      updated.tags = req.body.tags.split(',').map(t => t.trim());
    }

    dbStore.books[index] = updated;
    dbStore.save();

    return res.json({
      success: true,
      message: 'Book updated successfully',
      book: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update book' });
  }
};

export const deleteBook = (req, res) => {
  try {
    const { id } = req.params;
    const index = dbStore.books.findIndex(b => b._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if currently issued
    const hasActiveLoans = dbStore.transactions.some(tx => tx.bookId === id && (tx.status === 'issued' || tx.status === 'overdue'));
    if (hasActiveLoans) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active or overdue borrow transactions. Return all copies first.'
      });
    }

    const deleted = dbStore.books.splice(index, 1)[0];
    dbStore.save();

    return res.json({
      success: true,
      message: `Book "${deleted.title}" deleted from catalog.`,
      book: deleted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete book' });
  }
};
