# Expense Share 💸

> **Simplify group expenses with real-time synchronization and frictionless onboarding.**

Expense Share is a full-stack financial utility application designed to solve the common headache of splitting bills among friends, roommates, and travel groups. Built with a focus on User Experience (UX), it eliminates the friction of traditional account creation by using a token-based authentication system, allowing users to create groups and invite members instantly.

## 🚀 Key Differentiators

*   **Frictionless Onboarding**: No passwords or complex sign-ups. Users gain instant access via unique group codes, with sessions secured by JWTs.
*   **Real-Time Synchronization**: Built on **Socket.io**, changes to expenses and balances are pushed instantly to all connected clients, ensuring everyone sees the same data at the same time.
*   **Production-Ready Architecture**: Deployed using a microservices-ready approach (Frontend on Vercel, Backend on Render), utilizing **MongoDB Atlas** for scalable data storage.
*   **Modern Design System**: Features a high-fidelity, responsive UI built with **Tailwind CSS** and **Framer Motion**, utilizing glassmorphism and organic animations for a premium feel.

## 🛠️ Technology Stack

**Frontend**
*   **React (Vite)**: For a high-performance, component-based UI.
*   **Tailwind CSS**: For utility-first, responsive styling.
*   **Framer Motion**: For fluid, native-like animations.
*   **Context API**: For global state management (Auth, Socket connections).

**Backend**
*   **Node.js & Express**: Robust REST API architecture.
*   **Socket.io**: Bi-directional event-based communication for real-time updates.
*   **MongoDB & Mongoose**: Flexible NoSQL schema design with strict validation.
*   **Zod**: Runtime schema validation for type-safe API inputs.

**DevOps & Security**
*   **JWT (JSON Web Tokens)**: Stateless authentication.
*   **Helmet.js**: HTTP header security.
*   **Render & Vercel**: CI/CD pipeline and cloud hosting.

## ✨ Core Features

1.  **Group Management**: Create multiple expense groups with unique shareable codes.
2.  **Expense Tracking**: Add expenses with custom logic (Equal split, variable payers).
3.  **Automatic Balancing**: "Who pays whom" logic automatically calculates the most efficient way to settle debts.
4.  **Reminders System**: Send email reminders for pending balances (Integrated logic).
5.  **Activity Log**: Transparent history of all group transactions.

## 📦 Installation & Local Development

To run this project locally for development or code review:

Prerequisites: Node.js v16+ and a MongoDB connection string.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sv0123/Expense-Share.git
    cd Expense-Share
    ```

2.  **Backend Setup**
    ```bash
    cd server
    npm install
    # Create .env file:
    # PORT=5001
    # MONGO_URI=your_mongodb_string
    # JWT_SECRET=your_secret
    npm run dev:server
    ```

3.  **Frontend Setup**
    ```bash
    # In a new terminal
    cd client
    npm install
    # Create .env file:
    # VITE_API_URL=http://localhost:5001/api
    npm run dev
    ```

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
