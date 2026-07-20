# AttendAI - Intelligent Attendance System

AttendAI is a modern, high-performance web application designed to simplify and streamline attendance management for educational institutions and organizations. Built with a premium "Liquid Glass" Apple-inspired UI, it offers a breathtaking user experience paired with robust backend functionality.

## 🌟 Features

- **Stunning UI/UX**: Breathtaking "liquid glass" frosted panels, mesh gradients, and buttery-smooth animations.
- **Class & Student Management**: Easily create classes, and add, edit, or remove students.
- **Bulk Import**: Effortlessly import large lists of students using CSV or Excel files.
- **Attendance Tracking**: A clean, intuitive dashboard to mark and track student attendance (Present/Absent).
- **Automated Notifications**: Built-in system to trigger SMS, Email, and call notifications for absences.
- **Secure Backend**: Powered by Node.js, Express, and a lightning-fast SQLite database.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You will need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository or download the ZIP file.
2. Open a terminal and navigate to the project directory.
3. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the server using npm:
```bash
npm start
```

Once the server is running, open your web browser and navigate to:
**http://localhost:3000**

## 📁 Project Structure

- `server.js` - The main Express backend server and SQLite database configuration.
- `public/` - Contains the frontend CSS and JavaScript.
- `templates/` - Contains the application HTML files (`landing.html` and `app.html`).
- `assets/` - Directory for tracking static images and template files.
- `uploads/` - Temporary directory used by the application to process bulk CSV/Excel imports.

## 🛠 Technologies Used

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Backend**: Node.js, Express.js
- **Database**: SQLite (via `better-sqlite3`)
- **File Parsing**: `multer` and `xlsx`
