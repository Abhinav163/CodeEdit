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
import Projects from "./pages/Projects";
import "./App.css";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("lastActivity");
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("lastActivity");
    return <Navigate to="/login" replace />;
  }
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
    setUser(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.user) {
          setUser(decodedToken.user);
          const letters = "0123456789ABCDEF";
          let color = "#";
          for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          setAvatarColor(color);
        } else {
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
          size="lg"
          letterSpacing={"-.1rem"}
          _hover={{ textDecoration: "none", cursor: "pointer" }}
          className="hacker-text"
          data-text="Code - Edit"
          onClick={() => {
            if (location.pathname !== "/") {
              navigate("/");
            } else {
              window.location.assign("/");
            }
          }}
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
            <Link as={RouterLink} to="/projects">
              <Button variant="ghost" mr={4} _hover={{ bg: "transparent" }}>
                My Files
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
            path="/project/:id"
            element={
              <PrivateRoute>
                <Editor />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
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
