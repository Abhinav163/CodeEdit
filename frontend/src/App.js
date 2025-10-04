import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Link as RouterLink,
  useNavigate,
  useLocation,
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
  const location = useLocation();
  const token = localStorage.getItem("token");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      className="animated-gradient" // Added class for gradient
      color="white"
    >
      <Flex align="center" mr={5}>
        <Heading
          as={RouterLink}
          to="/"
          size="lg"
          letterSpacing={"-.1rem"}
          _hover={{ textDecoration: "none" }}
          className="hacker-text"
          data-text="Code - Edit" // For the text effect
        >
          Code - Edit
        </Heading>
      </Flex>
      <Box>
        {!token ? (
          !isAuthPage && (
            <>
              <Link as={RouterLink} to="/login">
                <Button variant="ghost" mr={4} _hover={{ bg: "transparent" }}>
                  Login
                </Button>
              </Link>
              <Link as={RouterLink} to="/signup">
                <Button variant="outline" _hover={{ bg: "transparent" }}>
                  Sign Up
                </Button>
              </Link>
            </>
          )
        ) : (
          <>
            <Link as={RouterLink} to="/profile">
              <Button variant="ghost" mr={4} _hover={{ bg: "transparent" }}>
                My Snippets
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              _hover={{ bg: "transparent" }}
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
