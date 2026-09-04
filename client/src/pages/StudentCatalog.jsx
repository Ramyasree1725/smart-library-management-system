import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { QRViewerModal } from '../components/common/QRViewerModal';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Star, 
  MapPin, 
  Bookmark, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  Info
} from 'lucide-react';

export const StudentCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [departments, setDepartments] = useState(['All']);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [availability, setAvailability] = useState('all'); // all | available | borrowed
  const [sortBy, setSortBy] = useState('popular');

  // Selected Book Detail Modal State
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookDemand, setSelectedBookDemand] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(null);
  const [reserveError, setReserveError] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.getBooks({
        search,
        category: selectedCategory,
        department: selectedDepartment,
        availability,
        sortBy
      });

      if (res?.books) {
        setBooks(res.books);
        if (res.categories) setCategories(res.categories);
        if (res.departments) setDepartments(res.departments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory, selectedDepartment, availability, sortBy]);

  // Handle URL query parameter if present on mount
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearch(q);
      fetchBooks();
    }
    const bookId = searchParams.get('id');
    if (bookId) {
      handleOpenDetail(bookId);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleOpenDetail = async (bookOrId) => {
    const id = typeof bookOrId === 'string' ? bookOrId : bookOrId._id;
    setReserveSuccess(null);
    setReserveError(null);
    try {
      const res = await api.getBookById(id);
      if (res?.book) {
        setSelectedBook(res.book);
        setSelectedBookDemand(res.demandAnalytics);
        setShowDetailModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReserve = async () => {
    if (!selectedBook) return;
    setReserving(true);
    setReserveError(null);
    setReserveSuccess(null);
    try {
      const res = await api.reserveBook(selectedBook._id);
      if (res?.success) {
        setReserveSuccess(res.message);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (e) {
      setReserveError(e.message || 'Failed to reserve book');
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Academic Book Catalog 📖
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search across {books.length} curated university volumes, research texts, and syllabi
          </p>
        </div>
      </div>

      {/* Smart Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by Title, Author, ISBN, Subject, or Tags (e.g. Distributed Systems, CLRS, Clean Code)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex-shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category Pills & Filters */}
      <div className="flex flex-col gap-3">
        {/* Horizontal Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sub-Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Availability Radio Pills */}
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setAvailability('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  availability === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setAvailability('available')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  availability === 'available' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Available Now
              </button>
              <button
                onClick={() => setAvailability('borrowed')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  availability === 'borrowed' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                On Loan
              </button>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="popular">Most Borrowed</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest Edition</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading books catalog...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No Books Found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => {
            const isAvailable = book.availableCopies > 0;

            return (
              <div
                key={book._id}
                onClick={() => handleOpenDetail(book)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group"
              >
                <div>
                  {/* Book Cover */}
                  <div className="aspect-[3/4] w-full rounded-xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-800 relative shadow-inner">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{book.rating}</span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                          isAvailable
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-rose-600/90 text-white'
                        }`}
                      >
                        {isAvailable ? `${book.availableCopies} in stock` : 'Waitlist / Out'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {book.category}
                  </span>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 line-clamp-2 leading-snug">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                    By {book.author}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{book.shelfLocation}</span>
                  </div>

                  {/* Tags */}
                  {Array.isArray(book.tags) && book.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {book.tags.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    ISBN: {book.isbn.split('-')[0]}...
                  </span>
                  <button className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
                    Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={selectedBook.title}
          subtitle={`By ${selectedBook.author} • Published by ${selectedBook.publisher} (${selectedBook.publishedYear})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover & Shelf Location Badge */}
              <div className="sm:w-44 flex-shrink-0 flex flex-col items-center">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-full aspect-[3/4] object-cover rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800"
                />
                
                <button
                  onClick={() => setShowQRModal(true)}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <QrCode className="w-4 h-4 text-blue-500" />
                  <span>View Book QR</span>
                </button>
              </div>

              {/* Information Columns */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold">
                    {selectedBook.category}
                  </span>
                  <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold">
                    {selectedBook.department}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 ml-auto">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{selectedBook.rating} Rating</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Subject Area
                  </h4>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedBook.subject}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Overview
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                    {selectedBook.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ISBN:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedBook.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Physical Location:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{selectedBook.shelfLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Copies:</span>
                    <span className="font-semibold">{selectedBook.totalCopies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Copies:</span>
                    <span className={`font-bold ${selectedBook.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {selectedBook.availableCopies} of {selectedBook.totalCopies}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Smart Demand & Turnover Prediction Box */}
            {selectedBookDemand && (
              <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Availability & Demand Prediction</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    Demand: {selectedBookDemand.demandLevel}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {selectedBook.availableCopies > 0
                    ? `Ready for immediate physical pickup at Shelf: ${selectedBook.shelfLocation}.`
                    : `Currently out of stock. Estimated earliest return date: ${selectedBookDemand.estimatedAvailableDate ? new Date(selectedBookDemand.estimatedAvailableDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '3-5 days'}.`
                  }
                </p>
              </div>
            )}

            {/* Reservation Status & Feedback */}
            {reserveSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{reserveSuccess}</span>
              </div>
            )}

            {reserveError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{reserveError}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                {selectedBook.availableCopies > 0 
                  ? "Visit library desk to scan QR pass for checkout" 
                  : "Join waitlist to be automatically notified upon return"
                }
              </span>

              {selectedBook.availableCopies === 0 ? (
                <button
                  onClick={handleReserve}
                  disabled={reserving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{reserving ? 'Placing Waitlist...' : 'Reserve This Book'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show Book Barcode</span>
                </button>
              )}
            </div>

          </div>
        </Modal>
      )}

      {/* Book QR Modal */}
      {selectedBook && (
        <QRViewerModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          data={selectedBook}
          type="book"
        />
      )}

    </div>
  );
};
