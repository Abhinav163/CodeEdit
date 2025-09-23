# MERN Stack Online Code Editor

A full-stack web application that allows users to write, compile, and run code in multiple languages directly in the browser. This project features a secure authentication system, a database for saving code snippets, and a modern, professional user interface built with the MERN stack.

## ✨ Features

- **Multi-Language Support**: Execute **C++**, **Python**, and **JavaScript** code on the server.
- **Secure User Authentication**: Full login and signup functionality using JSON Web Tokens (JWT).
- **Code Snippet Saving**: Authenticated users can save their code snippets with a title to their personal profile.
- **Profile Page**: A dedicated "My Snippets" dashboard for users to view and manage their saved code.
- **Load Snippets into Editor**: Users can open their saved snippets directly in the editor.
- **User Input (stdin)**: A dedicated input box to provide standard input to interactive programs.
- **Professional UI**: A modern, responsive, and attractive interface built with **Chakra UI**.
- **Resizable Layout**: A draggable, resizable panel layout for the editor and output windows, creating an IDE-like experience.
- **Dynamic Status Feedback**: A real-time status bar indicates whether the code is running, successful, or has an error.

---

## 🛠️ Tech Stack

### **Frontend**

- **React 18**: For building the user interface.
- **React Router v6**: For client-side routing.
- **Chakra UI**: For a professional and accessible component library.
- **Axios**: For making API requests to the backend.
- **@uiw/react-codemirror**: A modern code editor component for React.
- **react-resizable-panels**: For the draggable editor layout.

### **Backend**

- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for building the REST API.
- **MongoDB**: NoSQL database for storing user and snippet data.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB.
- **jsonwebtoken (JWT)**: For generating and verifying authentication tokens.
- **bcryptjs**: For hashing user passwords securely.
- **child_process**: For safely executing user-submitted code in separate processes.

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### **Prerequisites**

You must have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running.
- **C++ Compiler** (g++)
- **Python** (python)

### **Installation & Setup**

1.  **Clone the repository:**

    ```sh
    git clone <your-repository-url>
    cd <project-folder>
    ```

2.  **Setup the Backend:**

    ```sh
    cd backend
    npm install
    ```

    Create a `.env` file in the `backend` directory and add the following variables:

    ```env
    MONGO_URI=mongodb://localhost:27017/code_editor
    JWT_SECRET=your_super_long_and_random_secret_key_here
    ```

    Start the backend server:

    ```sh
    npm start
    ```

    The backend will be running on `http://localhost:5000`.

3.  **Setup the Frontend:**
    Open a new terminal window.
    ```sh
    cd frontend
    npm install
    ```
    Start the frontend development server:
    ```sh
    npm start
    ```
    The frontend will be running on `http://localhost:3000`.

---

## 📝 API Endpoints

A brief overview of the available API routes.

| Method   | Endpoint             | Description                         | Access  |
| :------- | :------------------- | :---------------------------------- | :------ |
| `POST`   | `/api/auth/register` | Register a new user                 | Public  |
| `POST`   | `/api/auth/login`    | Log in a user and get a token       | Public  |
| `POST`   | `/api/snippets`      | Save a new code snippet             | Private |
| `GET`    | `/api/snippets/user` | Get all snippets for logged-in user | Private |
| `DELETE` | `/api/snippets/:id`  | Delete a user's snippet             | Private |
| `POST`   | `/run`               | Execute code                        | Private |

---

## 💡 Future Improvements

- **Real-time Collaboration**: Use WebSockets to allow multiple users to edit code simultaneously.
- **Dockerization**: Containerize the code execution engine for enhanced security and scalability.
- **Add More Languages**: Extend support for languages like Java, Go, or C#.
- **Shareable Snippets**: Implement the public sharing feature for saved snippets.

