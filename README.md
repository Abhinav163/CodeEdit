# MERN Stack Online Code Editor

A full-stack web application that allows users to write, compile, and run code in multiple languages directly in the browser. This project features a secure authentication system, real-time collaboration, a database for saving code snippets, and a modern, "techy" user interface built with the MERN stack.

## ✨ Features

- **Real-time Collaboration**: Share a unique link to your code snippet and edit it with others in real-time.
- **Multi-Language Support**: Execute **C++**, **Python**, and **JavaScript** code on the server.
- **Intelligent Autocomplete**: Get code suggestions for C++, Python, and JavaScript as you type.
- **Secure User Authentication**: Full login/signup functionality using JSON Web Tokens (JWT) with automatic logout after 2 minutes of inactivity.
- **Code Snippet System**:
  - Authenticated users can save their code snippets to a personal profile.
  - Share snippets with a unique URL that can be accessed by other authenticated users.
  - Load saved snippets directly into the editor for individual work or a collaborative session.
- **Session Persistence**: Your personal (non-collaborative) code is automatically saved to local storage, so you won't lose your work on an accidental refresh.
- **Modern "Techy" UI**: A futuristic, responsive, and animated interface built with **Chakra UI**, featuring glowing elements, animated backgrounds, and a "hacker" aesthetic.
- **Resizable Layout**: A draggable, resizable panel layout for the editor and output windows, creating an IDE-like experience.
- **Dynamic Status Feedback**: A real-time status bar indicates whether the code is running, successful, or has an error.

---

## 🛠️ Tech Stack

### **Frontend**

- **React 18**: For building the user interface.
- **React Router v6**: For client-side routing.
- **Chakra UI**: For a professional and accessible component library.
- **Axios**: For making API requests to the backend.
- **Socket.IO Client**: For real-time WebSocket communication.
- **@uiw/react-codemirror**: A modern code editor component for React with autocomplete and theming.
- **react-resizable-panels**: For the draggable editor layout.

### **Backend**

- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for building the REST API.
- **Socket.IO**: For enabling real-time, bidirectional event-based communication.
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

| Method   | Endpoint                  | Description                          | Access  |
| :------- | :------------------------ | :----------------------------------- | :------ |
| `POST`   | `/api/auth/register`      | Register a new user                  | Public  |
| `POST`   | `/api/auth/login`         | Log in a user and get a token        | Public  |
| `POST`   | `/api/snippets`           | Save a new code snippet              | Private |
| `GET`    | `/api/snippets/user`      | Get all snippets for logged-in user  | Private |
| `GET`    | `/api/snippets/:id`       | Get a single public or owned snippet | Private |
| `PATCH`  | `/api/snippets/:id/share` | Make a snippet public for sharing    | Private |
| `DELETE` | `/api/snippets/:id`       | Delete a user's snippet              | Private |
| `POST`   | `/run`                    | Execute code                         | Private |

---

## 💡 Future Improvements

- **Dockerization**: Containerize the code execution engine for enhanced security and scalability.
- **Add More Languages**: Extend support for languages like Java, Go, or C#.
- **User Presence**: Show a list of avatars or usernames of users who are currently active in a collaborative session.
- **More Editor Themes**: Add a settings panel to allow users to choose from a variety of editor themes.
