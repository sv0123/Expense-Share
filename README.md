# Expense Share 💸

A modern, real-time expense sharing application designed to make splitting bills with friends stress-free. 


## ✨ Features

- **Real-Time Updates**: powered by Socket.io, see expenses added instantly without refreshing.
- **Seamless Authentication**: No separate login screen. Creating or joining a group automatically logs you in securely via JWT.
- **User Dashboard**: Keep track of all your groups in one place.
- **Smart Validation**: Robust backend validation using Zod ensures data integrity.
- **Modern UI**: Beautiful, glassmorphism-inspired interface built with Tailwind CSS, `Outfit` (headings) and `Plus Jakarta Sans` (body) fonts.
- **Secure**: Helmet.js for security headers, bcrypt for password hashing, and HTTP-only-style token management.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Socket.io Client
*   **Backend**: Node.js, Express, Socket.io
*   **Database**: MongoDB (Mongoose)
*   **Validation**: Zod
*   **Authentication**: JWT (JSON Web Tokens)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or higher)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sv0123/Expense-Share.git
    cd Expense-Share
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    ```
    *   Create a `.env` file in the `server` folder:
        ```env
        PORT=5001
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_super_secret_key
        ```

3.  **Setup Frontend**
    ```bash
    cd ../client
    npm install
    ```

## 🏃‍♂️ Running the App

You need to run both the server and the client.

1.  **Start the Backend** (Terminal 1)
    ```bash
    cd server
    npm run dev:server
    ```
    *   Server runs on `http://localhost:5001`

2.  **Start the Frontend** (Terminal 2)
    ```bash
    cd client
    npm run dev
    ```
    *   Client runs on `http://localhost:5173`

3.  Open your browser and navigate to `http://localhost:5173`.

## 📁 Project Structure

```
/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Layout, etc.)
│   │   ├── context/        # React Context (Auth, Socket, Theme)
│   │   ├── pages/          # Main application pages (Home, Dashboard)
│   │   └── services/       # API integration
│   └── tailwind.config.js  # Styling configuration
│
└── server/                 # Node.js Backend
    ├── models/             # Mongoose Schemas (User, Group, Expense)
    ├── routes/             # API Endpoints
    ├── middleware/         # Auth & Validation Middleware
    └── index.js            # Entry point & Socket.io setup
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
