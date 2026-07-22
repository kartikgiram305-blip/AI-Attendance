const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath, { timeout: 8000 });
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 8000');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER,
    name TEXT,
    email TEXT,
    contact_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    date TEXT,
    status TEXT,
    notification_sent INTEGER DEFAULT 0,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(student_id, date)
  );

  -- Performance Indexes
  CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
  CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
`);

// Add reason column for Twilio Webhooks if it doesn't exist
const tableInfo = db.pragma('table_info(attendance)');
const hasReason = tableInfo.some(column => column.name === 'reason');
if (!hasReason) {
  db.exec('ALTER TABLE attendance ADD COLUMN reason TEXT;');
}

// Insert default user if not exists
const userStmt = db.prepare("SELECT * FROM users WHERE username = 'user1'");
const existingUser = userStmt.get();
if (!existingUser) {
  const hash = bcrypt.hashSync('user1', 10);
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run('user1', hash);
} else {
  // If the user already exists but isn't hashed, we should probably update it for this refactor.
  // Wait, if it's 'user1', it won't be a bcrypt hash. Bcrypt hashes start with $2.
  if (!existingUser.password.startsWith('$2')) {
    const hash = bcrypt.hashSync('user1', 10);
    db.prepare("UPDATE users SET password = ? WHERE username = 'user1'").run(hash);
  }
}

module.exports = db;
