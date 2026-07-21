# AttendAI - Intelligent Attendance System

AttendAI is a modern, high-performance web application designed to simplify and streamline attendance management for educational institutions and organizations. Built with a premium "Liquid Glass" Apple-inspired UI, it offers a breathtaking user experience paired with robust backend functionality.

## 🌟 Features

- **Stunning UI/UX**: Breathtaking "liquid glass" frosted panels, mesh gradients, and buttery-smooth animations.
- **Class & Student Management**: Easily create classes, and add, edit, or remove students.
- **Bulk Import**: Effortlessly import large lists of students using CSV or Excel files.
- **Attendance Tracking**: A clean, intuitive dashboard to mark and track student attendance (Present/Absent).
- **Automated Notifications**: Built-in system to trigger SMS, Email, and Voice Call notifications for absences via Twilio and Mailjet APIs.
- **Secure Backend**: Powered by a robust PHP backend and a lightning-fast SQLite database.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You will need the following installed on your machine:
- **PHP 8.0+** (You can use [XAMPP](https://www.apachefriends.org/index.html) for Windows)
- **Composer** (PHP Dependency Manager)
- PHP Extensions enabled: `pdo_sqlite`, `gd`, `zip`

### Installation

1. Clone the repository or download the ZIP file.
2. Open a terminal and navigate to the project directory.
3. Install the required PHP dependencies using Composer:
   ```bash
   composer install
   ```
4. Create a `.env` file in the root directory (you can copy `.env.example` if it exists) and add your API keys:
   ```env
   # Twilio Credentials (SMS and Voice calls)
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   # Mailjet Credentials (Emails)
   MAILJET_API_KEY=your_mailjet_api_key
   MAILJET_API_SECRET=your_mailjet_api_secret
   MAILJET_FROM_EMAIL=your_verified_sender_email
   ```

### Running the Application (Built-in Server)

You can easily run the application using PHP's built-in web server. Open your terminal in the project directory and run:
```bash
php -S localhost:3000 router.php
```

Once the server is running, open your web browser and navigate to:
**http://localhost:3000**

### Running with Apache (XAMPP/WAMP)
1. Move the `AttendAI` folder into your `htdocs` (XAMPP) or `www` (WAMP) directory.
2. Ensure the `.htaccess` file is present in the root folder to handle the API routing.
3. Access the site via **http://localhost/AttendAI**

## 📁 Project Structure

- `api/` - Contains the PHP backend logic, including controllers, middleware, and the front controller (`index.php`).
- `router.php` - The entry script for PHP's built-in web server routing.
- `public/` - Contains the frontend CSS and JavaScript assets.
- `templates/` - Contains the application HTML files (`landing.html` and `app.html`).
- `database.sqlite` - The local SQLite database file.
- `composer.json` - Lists the PHP backend dependencies (Twilio SDK, Mailjet SDK, PhpSpreadsheet, etc.).

## 🛠 Technologies Used

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Backend**: PHP 8 (Native PDO, Object-Oriented MVC Structure)
- **Database**: SQLite
- **APIs**: Twilio (SMS & Voice calls), Mailjet (Emails)
- **File Parsing**: PhpSpreadsheet (for bulk CSV/Excel imports)
