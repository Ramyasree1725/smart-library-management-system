import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialUsers, initialBooks, initialTransactions, initialReservations, initialNotifications } from '../utils/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'db_state.json');

class DataStore {
  constructor() {
    this.users = [];
    this.books = [];
    this.transactions = [];
    this.reservations = [];
    this.notifications = [];
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.users = parsed.users || [...initialUsers];
        this.books = parsed.books || [...initialBooks];
        this.transactions = parsed.transactions || [...initialTransactions];
        this.reservations = parsed.reservations || [...initialReservations];
        this.notifications = parsed.notifications || [...initialNotifications];
      } else {
        this.reset();
      }
    } catch (e) {
      console.warn("Storage warning, initializing with defaults:", e.message);
      this.reset();
    }
  }

  save() {
    try {
      const state = {
        users: this.users,
        books: this.books,
        transactions: this.transactions,
        reservations: this.reservations,
        notifications: this.notifications,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error("Failed to save db state:", e.message);
    }
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.books = JSON.parse(JSON.stringify(initialBooks));
    this.transactions = JSON.parse(JSON.stringify(initialTransactions));
    this.reservations = JSON.parse(JSON.stringify(initialReservations));
    this.notifications = JSON.parse(JSON.stringify(initialNotifications));
    this.save();
  }

  // Dynamic automatic fine and status update on query
  refreshTransactionStatuses() {
    const now = new Date();
    const FINE_PER_DAY = 10; // ₹10 per day overdue

    let modified = false;
    this.transactions.forEach(tx => {
      if (tx.status !== 'returned') {
        const dueDate = new Date(tx.dueDate);
        if (now > dueDate) {
          const diffMs = now - dueDate;
          const overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          tx.status = 'overdue';
          tx.fineAmount = overdueDays * FINE_PER_DAY;
          tx.finePaid = false;
          modified = true;
        } else {
          tx.status = 'issued';
        }
      }
    });

    if (modified) {
      this.save();
    }
  }
}

export const dbStore = new DataStore();
