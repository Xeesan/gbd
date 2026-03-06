<h1 align="center">Good Bye Dopamine (GBD) Student Dashboard</h1>

<p align="center">
  <strong>A futuristic, all-in-one academic and personal dashboard built for the ultimate student experience.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-Web-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/License-MIT-orange" alt="License" />
</p>

---

## 🌟 Overview

The **Good Bye Dopamine (GBD)** Dashboard is an incredibly powerful, fully client-side web application designed to help students track their academic progress, finances, and mental clarity in one stunning interface. 

It features a unique, futuristic cyberpunk aesthetic with fluid animations, native dark-mode styling, and—best of all—**no database or backend required**. All of your data is stored completely privately and directly inside your browser's local storage.

## ✨ Core Features

### 📅 The Planner
- **Intelligent Kanban Board**: Separate tasks between *To Do*, *In Progress*, and *Done*.
- **Drag & Drop**: Native, ultra-smooth drag and drop capability across columns.
- **Urgency Tags**: Tag assignments by severity (Low, Medium, High) with visual color coordination.

### 🏫 Class Routine & Exams Tracker
- **Visual Schedule Grid**: See exactly what classes you have on any given day.
- **Smart Exam Tracker**: Log upcoming tests, their target grades, and their credit weightings.
- **🪄 ✨ Magic AI Import**:
  - Don't want to type your routine out? Just snap a picture of your class routine or exam schedule.
  - The built-in **Gemini Multimodal Vision API** will scan the image, perfectly rebuild the table structure, and automatically import every class directly into your planner.

### 🎓 Academic Hub
- **CGPA Calculator**: Track your cumulative GPA over multiple semesters.
- **Semester Tracking**: Keep track of every course taken, its credit weight, and your final grade to simulate the exact impact on your target GPA graduation goal.

### 💰 Finance Tracker
- **Smart Dashboard**: Instantly view your total balance, recent spending, and a beautiful financial chart.
- **Transactions**: Add expenses and incomes to see where your money is going.
- **Debts (Lend & Borrow)**: Keep a ledger of friends who owe you money or money you owe others.
- **Savings Goals**: Set up distinct goals (like an emergency fund or a new laptop) and contribute to them visually over time.

### 🧘 Digital Detox & Notes
- **Focus Timer**: Lock in and get work done with a completely un-interruptable focus mode. Stop scrolling and start building.
- **Rich Text Notes**: Maintain an active log of your thoughts, lecture notes, and ideas with a futuristic markdown editor.

### 🎮 Gamification
- Every task completed, exam scheduled, and focus hour achieved earns you **XP**. Level up your dashboard profile as you crush your academic goals.

## 🚀 How to Run

This project is a deeply optimized, zero-dependency static site. There is no complicated `npm install`, `node`, or Docker container required.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/gbd-app.git
   ```
2. **Open `index.html`:**
   Simply double click the `index.html` file in the folder, or serve it using any ultra-light static server (e.g. VSCode Live Server).
3. **Alternatively, Host it Free:**
   Upload the folder to **GitHub Pages**, **Vercel**, or **Netlify** for instant, free, permanent hosting.

## 🔑 AI Features Privacy Note
The "Magic AI Import" routine feature utilizes the Google Gemini Vision API to instantly process images into schedule data. 

**This app respects your privacy.**
- You must generate a free Gemini API key from Google AI Studio.
- The app asks you to paste it into the UI.
- The key is **only ever stored in your local browser storage**. It is never sent to a backend server (because there is no backend server!). It talks directly from your browser to Google.

## 🤝 Contributing
Contributions are always welcome. If you want to add a new tab, enhance the dark mode, or fix a bug, feel free to fork the repository and submit a Pull Request.

## 📝 License
This project is open-source and freely available under the [MIT License](LICENSE).
