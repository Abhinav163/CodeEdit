import React, { useEffect, useState, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link as RouterLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Editor from "./pages/Editor";
import Profile from "./pages/Profile";
import "./App.css";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [avatarColor, setAvatarColor] = useState("#000000");

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastActivity");
    setUser(null); // Explicitly clear user state
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // FIX: Set user data even if firstName is missing to prevent logout loop
        if (decodedToken.user) {
          setUser(decodedToken.user);
          const letters = "0123456789ABCDEF";
          let color = "#";
          for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          setAvatarColor(color);
        } else {
          // If token is malformed, logout
          handleLogout();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    } else {
      setUser(null);
    }
  }, [token, handleLogout]);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  const getInitials = (firstName, lastName) => {
    // FIX: Add a guard clause for missing names
    if (!firstName || !lastName) {
      return "?";
    }
    return `${firstName[0]}${lastName[0]}`;
  };

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      className="animated-gradient"
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
          data-text="Code - Edit"
        >
          Code - Edit
        </Heading>
      </Flex>
      <Box>
        {!user ? (
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
          <Flex align="center">
            <Link as={RouterLink} to="/profile">
              <Button variant="ghost" mr={4} _hover={{ bg: "transparent" }}>
                My Snippets
              </Button>
            </Link>
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                _hover={{ bg: "transparent" }}
                _active={{ bg: "transparent" }}
              >
                <Flex align="center">
                  <Avatar
                    size="sm"
                    name={getInitials(user.firstName, user.lastName)}
                    bg="white"
                    color={avatarColor}
                    mr={2}
                  />
                  {user.firstName}
                </Flex>
              </MenuButton>
              <MenuList bg="gray.800" borderColor="gray.700">
                <MenuItem onClick={handleLogout} _hover={{ bg: "gray.700" }}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const LOGOUT_TIME_MS = 2 * 60 * 1000; // 2 minutes

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
        if (timeSinceLastActivity > LOGOUT_TIME_MS) {
          localStorage.removeItem("token");
          localStorage.removeItem("lastActivity");
          navigate("/login");
        }
      }
    };

    const updateActivityTimestamp = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    checkInactivity();

    window.addEventListener("mousemove", updateActivityTimestamp);
    window.addEventListener("keydown", updateActivityTimestamp);
    window.addEventListener("scroll", updateActivityTimestamp);
    window.addEventListener("click", updateActivityTimestamp);

    const intervalId = setInterval(checkInactivity, 15000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("mousemove", updateActivityTimestamp);
      window.removeEventListener("keydown", updateActivityTimestamp);
      window.removeEventListener("scroll", updateActivityTimestamp);
      window.removeEventListener("click", updateActivityTimestamp);
    };
  }, [navigate]);

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
            path="/editor/:id"
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
