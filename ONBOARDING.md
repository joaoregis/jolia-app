# 🏠 Jolia's House - Developer Onboarding

Welcome to the **Jolia's House** project! This document provides an overview of the project's architecture, key technologies, and instructions on how to get started.

## 🌟 Project Overview

**Jolia's House** is a comprehensive personal finance and household management application. It allows users to track expenses/income, manage media watchlists (movies/series), creating shopping wishlists, and manage multiple user profiles (Subprofiles).

**Key Features:**
- **Finance Dashboard:** Track transactions, balances, and recurring expenses.
- **Media Watchlist:** Keep track of movies and series to watch.
- **Wishlist:** Manage shopping items and desires.
- **Profile System:** Support for multiple family members/subprofiles.
- **Data Portability:** Import/Export functionality (CSV/Excel).

## 🏗️ Architecture

The project is built as a **Single Page Application (SPA)** using **React** and **Vite**, hosted on **Firebase**.

### 📂 Folder Structure (`src/`)

- **`components/`**: Reusable UI components (e.g., `TransactionTable`, `Card`, `Modals`).
- **`screens/`**: Main page views rooted in the router:
  - `DashboardScreen`: Main finance overview.
  - `MediaScreen`: Entertainment tracker.
  - `WishlistScreen`: Shopping lists.
  - `SettingsScreen` & `ProfileSelector`: Configuration and user management.
- **`contexts/`**: Global state management using React Context API (e.g., `AuthContext`, `ThemeContext`).
- **`hooks/`**: Custom React hooks for logic reuse (e.g., `useTransactions`, `useTheme`).
- **`lib/`**: Utility libraries and configuration:
  - `firebase.ts`: Firebase SDK initialization and configuration.
  - `themes.ts`: Theme definitions and color palettes.
- **`types/`**: TypeScript type definitions ensuring type safety across the app.

## 🛠️ Key Technologies

The project relies on a modern stack:

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Core** | [React](https://react.dev/) | `^18.2.0` | UI Library (Functional Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5.2.2` | Static Typing |
| **Build Tool** | [Vite](https://vitejs.dev/) | `^5.2.0` | Fast Development Server & Bundler |
| **Routing** | [React Router](https://reactrouter.com/) | `^7.6.2` | Client-side Routing |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^3.4.3` | Utility-first CSS Framework |
| **Database/Auth**| [Firebase](https://firebase.google.com/) | `^11.9.1` | Backend-as-a-Service (Firestore, Auth) |
| **Icons** | [Lucide React](https://lucide.dev/) | `^0.517.0` | Iconography |
| **State/Utils** | [Date-fns](https://date-fns.org/) | `^4.1.0` | Date utility library |

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Ensure you have a recent version of Node.js installed (v18+ recommended).
- **Firebase Account**: You will need access to the Firebase project environment.

### Installation

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Environment Setup

Create a `.env.local` file in the root directory to store your Firebase configuration keys. Retrieve these from the Firebase Console.

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the Development Server

Start the local development server with HMR (Hot Module Replacement):

```bash
npm run dev
```

The app will typically run at `http://localhost:5173`.

### 🧪 Tests

Run the test suite using Vitest:

```bash
npm run test
```

## 📦 Dependency Analysis

A scan of `package.json` reveals a healthy and modern ecosystem.

### ✅ Up-to-Date
- **React & Vite**: Using stable, modern versions.
- **Firebase**: Using the latest modular SDK (v11).
- **Tailwind CSS**: Using v3.4 (Latest Stable).

### ⚠️ Observations & Recommendations

| Dependency | Current Status | Recommendation |
|------------|----------------|----------------|
| **`xlsx`** | `^0.18.5` | This version is quite standard but older. If you encounter issues with complex Excel exports, consider migrating to **`exceljs`** or the pro version of SheetJS. For simple exports, it remains robust. |
| **`react-router-dom`** | `^7.6.2` | You are using the very latest version (v7). Ensure you are utilizing the new data router capabilities for best performance, though legacy `Routes/Route` components still work. |
| **`framer-motion`** | `^12.23.24` | Excellent choice for animations. Ensure you utilize the `layout` prop for smooth FLIP animations in your lists. |
