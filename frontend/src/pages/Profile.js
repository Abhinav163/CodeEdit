import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Spinner,
  useToast,
  Button,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  SimpleGrid,
  Icon,
  ButtonGroup,
} from "@chakra-ui/react";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import { SiCplusplus, SiPython, SiJavascript } from "react-icons/si";

const languageMap = {
  cpp: { icon: SiCplusplus, color: "blue.400" },
  python: { icon: SiPython, color: "yellow.400" },
  javascript: { icon: SiJavascript, color: "yellow.300" },
};

const Profile = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snippetToDelete, setSnippetToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  useEffect(() => {
    const fetchSnippets = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "https://codeedit-backend.onrender.com/api/snippets/user",
          {
            headers: { "x-auth-token": token },
          }
        );
        setSnippets(res.data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not fetch snippets.",
          status: "error",
        });
      }
      setLoading(false);
    };
    fetchSnippets();
  }, [toast]);

  const openDeleteDialog = (id) => {
    setSnippetToDelete(id);
    onOpen();
  };

  const handleShare = async (snippetId) => {
    const token = localStorage.getItem("token");
    try {
      // Make the snippet public before sharing
      await axios.patch(
        `https://codeedit-backend.onrender.com/api/snippets/${snippetId}/share`,
        {},
        { headers: { "x-auth-token": token } }
      );

      const url = `${window.location.origin}/editor/${snippetId}`;
      navigator.clipboard.writeText(url);

      toast({
        title: "Link Copied!",
        description: "Collaboration link has been copied to your clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Sharing Error",
        description: "Could not make the snippet public for sharing.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://codeedit-backend.onrender.com/api/snippets/${snippetToDelete}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setSnippets(snippets.filter((s) => s._id !== snippetToDelete));
      toast({
        title: "Success",
        description: "Snippet deleted successfully.",
        status: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not delete snippet.",
        status: "error",
      });
    }
    onClose();
    setSnippetToDelete(null);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (snippets.length === 0) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        height="50vh"
        textAlign="center"
      >
        <Heading>No Snippets Yet</Heading>
        <Text mt={2} mb={4}>
          It looks a bit empty here. Why not save your first piece of code?
        </Text>
        <Button as={RouterLink} to="/" colorScheme="teal">
          Create a Snippet
        </Button>
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>My Snippets</Heading>
        <Button as={RouterLink} to="/" colorScheme="teal">
          Create New
        </Button>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {snippets.map((snippet) => {
          const langInfo = languageMap[snippet.language] || {};
          return (
            <Box className="animated-border-box" key={snippet._id}>
              <Card
                bg="gray.800"
                boxShadow="lg"
                _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
                transition="all 0.2s"
                className="glass-card"
              >
                <CardHeader>
                  <Flex align="center" justify="space-between">
                    <Heading size="md">{snippet.title}</Heading>
                    <Icon
                      as={langInfo.icon}
                      color={langInfo.color}
                      boxSize={6}
                    />
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Text
                    noOfLines={3}
                    color="gray.400"
                    bg="gray.900"
                    p={3}
                    borderRadius="md"
                    fontFamily="mono"
                  >
                    {snippet.code}
                  </Text>
                </CardBody>
                <CardFooter>
                  <ButtonGroup spacing="2">
                    <Button
                      as={RouterLink}
                      to={`/editor/${snippet._id}`}
                      variant="solid"
                      colorScheme="teal"
                    >
                      Open
                    </Button>
                    <Button
                      variant="solid"
                      colorScheme="blue"
                      onClick={() => handleShare(snippet._id)}
                    >
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => openDeleteDialog(snippet._id)}
                    >
                      Delete
                    </Button>
                  </ButtonGroup>
                </CardFooter>
              </Card>
            </Box>
          );
        })}
      </SimpleGrid>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Snippet</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Profile;
