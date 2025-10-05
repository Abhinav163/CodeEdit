import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  Flex,
  Divider,
  Link,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { FaGoogle, FaGithub } from "react-icons/fa";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleClick = () => setShow(!show);
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://codeedit-backend.onrender.com/api/auth/register",
        formData
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("lastActivity", Date.now().toString());
      navigate("/");
    } catch (err) {
      toast({
        title: "Signup Failed",
        description: "User may already exist or password is too short.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Placeholder functions for social logins
  const handleGoogleLogin = () => {
    toast({
      title: "Coming Soon!",
      description: "Google login is not yet implemented.",
      status: "info",
    });
  };
  const handleGithubLogin = () => {
    toast({
      title: "Coming Soon!",
      description: "GitHub login is not yet implemented.",
      status: "info",
    });
  };

  return (
    <Flex minH="calc(100vh - 100px)" align="center" justify="center">
      <Box className="animated-border-box">
        <Box
          maxW="md"
          w="full"
          bg="gray.800"
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="2xl"
          className="glass-card"
        >
          <Stack as="form" spacing={4} onSubmit={onSubmit}>
            <Stack align="center" mb={4}>
              <Heading fontSize="2xl" className="glitch">
                Create an Account
              </Heading>
              <Text color="gray.400">Start your coding journey with us</Text>
            </Stack>

            <Flex gap={4}>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  onChange={onChange}
                  bg="gray.700"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  onChange={onChange}
                  bg="gray.700"
                />
              </FormControl>
            </Flex>

            <FormControl isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={onChange}
                bg="gray.700"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={show ? "text" : "password"}
                  name="password"
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  onChange={onChange}
                  bg="gray.700"
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button type="submit" colorScheme="teal" width="full" mt={4}>
              Sign Up
            </Button>

            <Flex align="center" my={6}>
              <Divider />
              <Text mx={4} whiteSpace="nowrap" color="gray.400">
                or
              </Text>
              <Divider />
            </Flex>

            <Stack spacing={4}>
              <Button
                w="full"
                colorScheme="red"
                variant="outline"
                leftIcon={<FaGoogle />}
                onClick={handleGoogleLogin}
              >
                Sign up with Google
              </Button>
              <Button
                w="full"
                colorScheme="gray"
                variant="outline"
                leftIcon={<FaGithub />}
                onClick={handleGithubLogin}
              >
                Sign up with GitHub
              </Button>
            </Stack>

            <Text mt={4} textAlign="center" color="gray.400">
              Already have an account?{" "}
              <Link
                as={RouterLink}
                to="/login"
                color="teal.300"
                fontWeight="bold"
              >
                Sign In
              </Link>
            </Text>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
};

export default Signup;
