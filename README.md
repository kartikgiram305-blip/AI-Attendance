# AttendAI - Intelligent Attendance System

![PHP Version](https://img.shields.io/badge/PHP-8.0%2B-777BB4?style=flat-square&logo=php)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)
![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-brightgreen.svg?style=flat-square)
![Dependencies](https://img.shields.io/badge/Dependencies-Composer-blue?style=flat-square&logo=composer)

AttendAI is a modern, high-performance web application designed to simplify and streamline attendance management for educational institutions and organizations. Built with a premium "Liquid Glass" Apple-inspired UI, it offers a breathtaking user experience paired with robust backend functionality.

<div align="center">
  <img src="assets/dashboard-preview.png" alt="AttendAI Dashboard Preview" width="800"/>
  <br/>
  <em>Replace this image with a screenshot of your stunning dashboard!</em>
</div>

## 📑 Table of Contents

- [🌟 Features](#-features)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application (Built-in Server)](#running-the-application-built-in-server)
  - [Running with Apache (XAMPP/WAMP)](#running-with-apache-xamppwamp)
- [📁 Project Structure](#-project-structure)
- [🛠 Technologies Used](#-technologies-used)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Features

- **Stunning UI/UX**: Modern "liquid glass" frosted panels, mesh gradients, and smooth animations.
- **Interactive Dashboard**: Real-time statistics and visualizations powered by Chart.js.
- **Secure Authentication**: Stateless, robust security powered by Firebase JWT (JSON Web Tokens).
- **Class & Student Management**: Easily create classes, and add, edit, or remove students.
- **Bulk Import**: Effortlessly import large lists of students using CSV or Excel files.
- **Attendance Tracking**: A clean, intuitive dashboard to mark and track student attendance (Present/Absent).
- **Data Export**: Easily export monthly attendance data to CSV, Excel (XLSX), and PDF for offline records and reports.
- **Automated Notifications**: Built-in system to trigger SMS, Email, and Voice Call notifications for absences via Twilio and Mailjet APIs. Includes a Two-Way Twilio IVR that collects and logs spoken absence reasons from parents via speech-to-text webhooks.
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
   
   # JWT Configuration
   JWT_SECRET=super_secret_attendai_key_change_me_in_prod
   ```

   **Environment Variables Details:**
   | Variable | Description | Required |
   |----------|-------------|----------|
   | `TWILIO_ACCOUNT_SID` | Your Twilio SID for SMS/Voice | Yes |
   | `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | Yes |
   | `TWILIO_PHONE_NUMBER` | Your Twilio Phone Number | Yes |
   | `MAILJET_API_KEY` | Mailjet Key for Email alerts | Yes |
   | `MAILJET_API_SECRET` | Mailjet Secret for Email alerts | Yes |
   | `MAILJET_FROM_EMAIL` | Verified sender email for Mailjet | Yes |
   | `JWT_SECRET` | Secret key for JWT Token signing | Recommended |

### Running the Application (Built-in Server)

You can easily run the application using PHP's built-in web server. Open your terminal in the project directory and run:
```bash
php -S localhost:3000 router.php
```

> **Note for Windows/XAMPP Users:** If you get an error saying `php is not recognized`, it means PHP is not in your system's PATH. If you have XAMPP installed, you can start the server by using the full path to PHP instead:
> ```powershell
> C:\xampp\php\php.exe -S localhost:3000 router.php
> ```

Once the server is running, open your web browser and navigate to:
**http://localhost:3000**

**Default Login Credentials:**
- **Username:** `user1`
- **Password:** `user1`

*(Make sure to change the password or add a secure user in production!)*

To stop the server, go back to your terminal window and press `Ctrl + C`.

### Running with Apache (XAMPP/WAMP)
1. Move the `AttendAI` folder into your `htdocs` (XAMPP) or `www` (WAMP) directory.
2. Ensure the `.htaccess` file is present in the root folder to handle the API routing.
3. Access the site via **http://localhost/AttendAI**

## 📁 Project Structure

- `api/` - Contains the PHP backend logic, including controllers, middleware, and the front controller (`index.php`).
- `router.php` - The entry script for PHP's built-in web server routing.
- `src/` - TypeScript source files for the frontend functionality (`main.ts`).
- `public/` - Compiled frontend JavaScript (`script.js`) and CSS stylesheets.
- `index.html` - The main entry point for the application interface.
- `templates/` - Contains additional HTML templates (e.g., `landing.html`).
- `database.sqlite` - The local SQLite database file.
- `composer.json` - Lists the PHP backend dependencies.

## 🛠 Technologies Used

- **Frontend**: TypeScript, HTML5, CSS3, Chart.js, SheetJS, jsPDF
- **Backend**: PHP 8 (Native PDO, Object-Oriented MVC Structure)
- **Security**: Firebase JWT for secure API authentication
- **Database**: SQLite
- **APIs**: Twilio (SMS & Voice calls), Mailjet (Emails)
- **File Parsing & Generation**: PhpSpreadsheet (backend), SheetJS (frontend bulk import/export), jsPDF (frontend PDF generation)

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
