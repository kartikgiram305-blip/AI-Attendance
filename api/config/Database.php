<?php
namespace App\Config;

use PDO;
use PDOException;

class Database {
    private static $pdo = null;

    public static function getConnection() {
        if (self::$pdo === null) {
            $dbPath = dirname(__DIR__, 2) . '/database.sqlite';
            try {
                self::$pdo = new PDO("sqlite:" . $dbPath);
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                
                // Set pragmas
                self::$pdo->exec('PRAGMA journal_mode = WAL;');
                self::$pdo->exec('PRAGMA busy_timeout = 8000;');
                self::$pdo->exec('PRAGMA foreign_keys = ON;');
                
                self::initSchema(self::$pdo);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
                exit;
            }
        }
        return self::$pdo;
    }

    private static function initSchema($pdo) {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                preferences TEXT
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

            CREATE TABLE IF NOT EXISTS notification_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER,
                date TEXT,
                action TEXT,
                status TEXT,
                reason TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
            CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
        ");

        // Add reason column for Twilio Webhooks if it doesn't exist
        $result = $pdo->query("PRAGMA table_info(attendance)")->fetchAll();
        $hasReason = false;
        foreach ($result as $column) {
            if ($column['name'] === 'reason') {
                $hasReason = true;
                break;
            }
        }
        if (!$hasReason) {
            $pdo->exec("ALTER TABLE attendance ADD COLUMN reason TEXT;");
        }

        // Add preferences column to users if it doesn't exist
        $usersInfo = $pdo->query("PRAGMA table_info(users)")->fetchAll();
        $hasPreferences = false;
        foreach ($usersInfo as $column) {
            if ($column['name'] === 'preferences') {
                $hasPreferences = true;
                break;
            }
        }
        if (!$hasPreferences) {
            $pdo->exec("ALTER TABLE users ADD COLUMN preferences TEXT;");
        }

        // Insert default user if not exists
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = 'user1'");
        $stmt->execute();
        $existingUser = $stmt->fetch();

        if (!$existingUser) {
            $hash = password_hash('user1', PASSWORD_BCRYPT);
            $insert = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
            $insert->execute(['user1', $hash]);
        } else {
            // Update to bcrypt if it isn't already
            if (strpos($existingUser['password'], '$2') !== 0) {
                $hash = password_hash('user1', PASSWORD_BCRYPT);
                $update = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'user1'");
                $update->execute([$hash]);
            }
        }
    }
}
