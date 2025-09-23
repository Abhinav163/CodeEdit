import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Link as RouterLink,
  useNavigate,
} from "react-router-dom";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Editor from "./pages/Editor";
import Profile from "./pages/Profile";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg="teal.500"
      color="white"
    >
      <Flex align="center" mr={5}>
        <Heading
          as={RouterLink}
          to="/"
          size="lg"
          letterSpacing={"-.1rem"}
          _hover={{ textDecoration: "none" }}
        >
          Code Editor
        </Heading>
      </Flex>
      <Box>
        {!token ? (
          <>
            <Link as={RouterLink} to="/login">
              <Button variant="ghost" mr={4} _hover={{ bg: "teal.600" }}>
                Login
              </Button>
            </Link>
            <Link as={RouterLink} to="/signup">
              <Button variant="outline" _hover={{ bg: "teal.600" }}>
                Sign Up
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link as={RouterLink} to="/profile">
              <Button variant="ghost" mr={4} _hover={{ bg: "teal.600" }}>
                My Snippets
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              _hover={{ bg: "teal.600" }}
            >
              Logout
            </Button>
          </>
        )}
      </Box>
    </Flex>
  );
};

function App() {
  return (
    <>
      <Navbar />
      <Box p={4}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Editor />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
