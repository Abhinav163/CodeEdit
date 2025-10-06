import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import CodeMirror from "@uiw/react-codemirror";
import { cpp, cppLanguage } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  Avatar,
  AvatarGroup,
  Box,
  Flex,
  Select,
  Button,
  Spinner,
  Heading,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  useToast,
  Tag,
  IconButton,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { FaTrash, FaPaperPlane } from "react-icons/fa";

const cppKeywords = [
  "alignas",
  "alignof",
  "and",
  "and_eq",
  "asm",
  "auto",
  "bitand",
  "bitor",
  "bool",
  "break",
  "case",
  "catch",
  "char",
  "char8_t",
  "char16_t",
  "char32_t",
  "class",
  "compl",
  "concept",
  "const",
  "consteval",
  "constexpr",
  "constinit",
  "const_cast",
  "continue",
  "co_await",
  "co_return",
  "co_yield",
  "decltype",
  "default",
  "delete",
  "do",
  "double",
  "dynamic_cast",
  "else",
  "enum",
  "explicit",
  "export",
  "extern",
  "false",
  "float",
  "for",
  "friend",
  "goto",
  "if",
  "inline",
  "int",
  "long",
  "mutable",
  "namespace",
  "new",
  "noexcept",
  "not",
  "not_eq",
  "nullptr",
  "operator",
  "or",
  "or_eq",
  "private",
  "protected",
  "public",
  "reflexpr",
  "register",
  "reinterpret_cast",
  "requires",
  "return",
  "short",
  "signed",
  "sizeof",
  "static",
  "static_assert",
  "static_cast",
  "struct",
  "switch",
  "synchronized",
  "template",
  "this",
  "thread_local",
  "throw",
  "true",
  "try",
  "typedef",
  "typeid",
  "typename",
  "union",
  "unsigned",
  "using",
  "virtual",
  "void",
  "volatile",
  "wchar_t",
  "while",
  "xor",
  "xor_eq",
  "cout",
  "cin",
  "endl",
  "std",
  "string",
  "vector",
  "iostream",
  "#include",
].map((k) => ({ label: k, type: "keyword" }));

const DEFAULT_CODE = `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`;

const languageExtensions = {
  cpp: [cpp(), autocompletion({ override: [completeFromList(cppKeywords)] })],
  python: [python(), autocompletion()],
  javascript: [javascript({ jsx: true }), autocompletion()],
};

const Editor = () => {
  const { id: snippetId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const isRemoteChange = useRef(false);

  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [displayedOutput, setDisplayedOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("idle");
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [activeUsers, setActiveUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.user);
      } catch (e) {
        console.error("Invalid token on editor mount");
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io("https://codeedit-backend.onrender.com");
    const socket = socketRef.current;

    if (snippetId) {
      const userPayload = {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        socketId: socket.id,
      };
      socket.emit("join-room", snippetId, userPayload);

      const fetchSnippet = async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await axios.get(
            `https://codeedit-backend.onrender.com/api/snippets/${snippetId}`,
            { headers: { "x-auth-token": token } }
          );
          isRemoteChange.current = true;
          setCode(res.data.code);
          setLanguage(res.data.language);
          setIsReadOnly(res.data.readOnly);
          setChatMessages(res.data.chat || []);
        } catch (err) {
          toast({ title: "Error fetching snippet", status: "error" });
        }
      };
      fetchSnippet();
    } else {
      const savedCode = localStorage.getItem("editorCode");
      setCode(savedCode !== null ? savedCode : DEFAULT_CODE);
      setLanguage(localStorage.getItem("editorLanguage") || "cpp");
      setInput(localStorage.getItem("editorInput") || "");
    }

    socket.on("code-update", (newCode) => {
      isRemoteChange.current = true;
      setCode(newCode);
    });

    socket.on("update-user-list", (users) => {
      setActiveUsers(users);
    });

    socket.on("receive-chat-message", (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [snippetId, toast, currentUser]);

  useEffect(() => {
    if (!snippetId) {
      localStorage.setItem("editorCode", code);
    }
  }, [code, snippetId]);

  useEffect(() => {
    if (!snippetId) {
      localStorage.setItem("editorLanguage", language);
    }
  }, [language, snippetId]);

  useEffect(() => {
    if (!snippetId) {
      localStorage.setItem("editorInput", input);
    }
  }, [input, snippetId]);

  useEffect(() => {
    if (isLoading || !output) {
      setDisplayedOutput("");
      return;
    }

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedOutput(output.substring(0, i + 1));
      i++;
      if (i > output.length) {
        clearInterval(intervalId);
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, [output, isLoading]);

  const handleSendChatMessage = () => {
    if (chatInput.trim() && snippetId && currentUser) {
      const message = {
        id: Date.now(),
        sender: currentUser.firstName,
        text: chatInput,
      };
      socketRef.current.emit("send-chat-message", {
        roomId: snippetId,
        message,
      });
      setChatInput("");
    }
  };

  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const saveCode = useCallback(
    debounce(async (newCode) => {
      if (snippetId) {
        const token = localStorage.getItem("token");
        try {
          await axios.put(
            `https://codeedit-backend.onrender.com/api/snippets/${snippetId}`,
            { code: newCode },
            { headers: { "x-auth-token": token } }
          );
        } catch (err) {
          console.error("Failed to save code snippet:", err);
        }
      }
    }, 1000),
    [snippetId]
  );

  const onChange = useCallback(
    (value) => {
      if (isRemoteChange.current) {
        isRemoteChange.current = false;
        return;
      }
      setCode(value);
      if (socketRef.current && snippetId) {
        socketRef.current.emit("code-change", {
          roomId: snippetId,
          newCode: value,
        });
        saveCode(value);
      }
    },
    [snippetId, saveCode]
  );

  const handleRun = async () => {
    setIsLoading(true);
    setStatus("running");
    setOutput("");
    setDisplayedOutput("");
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "https://codeedit-backend.onrender.com/run",
        { language, code, input },
        { headers: { "x-auth-token": token } }
      );
      setOutput(response.data.output);
      const isError =
        /error/i.test(response.data.output) ||
        response.data.output.includes("Traceback");
      setStatus(isError ? "error" : "success");
    } catch (error) {
      setOutput(
        error.response ? error.response.data.msg : "An error occurred."
      );
      setStatus("error");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!title) {
      toast({
        title: "Title is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "https://codeedit-backend.onrender.com/api/snippets",
        { title, language, code },
        { headers: { "x-auth-token": token } }
      );
      toast({
        title: "Success",
        description: "Snippet saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setTitle("");
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save snippet.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLeaveSession = () => {
    localStorage.removeItem("editorCode");
    localStorage.removeItem("editorLanguage");
    localStorage.removeItem("editorInput");
    navigate("/");
  };

  const StatusTag = () => {
    const statusConfig = {
      idle: { label: "Idle", color: "gray" },
      running: { label: "Running...", color: "blue" },
      success: { label: "Success", color: "green" },
      error: { label: "Error", color: "red" },
    };
    const { label, color } = statusConfig[status] || statusConfig.idle;
    return (
      <Tag colorScheme={color} size="md">
        {label}
      </Tag>
    );
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Select
          w="150px"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          isDisabled={!!snippetId}
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </Select>
        {snippetId && (
          <Flex align="center">
            <Text mr={2}>Active users:</Text>
            <AvatarGroup size="sm" max={3}>
              {activeUsers.map((user) => (
                <Avatar
                  key={user.id}
                  name={`${user.firstName} ${user.lastName}`}
                />
              ))}
            </AvatarGroup>
          </Flex>
        )}
        <Flex>
          {snippetId && (
            <Button colorScheme="orange" onClick={handleLeaveSession} mr={4}>
              Leave Session
            </Button>
          )}
          <Button colorScheme="blue" onClick={onOpen} mr={4}>
            Save
          </Button>
          <Button
            colorScheme="green"
            onClick={handleRun}
            isLoading={isLoading}
            _hover={{
              transform: "scale(1.05)",
              boxShadow: "0 0 10px #38A169, 0 0 20px #38A169, 0 0 30px #38A169",
            }}
          >
            ▶ Run
          </Button>
        </Flex>
      </Flex>

      <PanelGroup
        direction="horizontal"
        style={{ height: "calc(100vh - 250px)", minHeight: "400px" }}
      >
        <Panel defaultSize={60} minSize={30}>
          <Flex direction="column" h="100%" gap={4}>
            <Box flex="3" minHeight="200px">
              <Heading size="sm" mb={2}>
                Code
              </Heading>
              <CodeMirror
                value={code}
                height="100%"
                extensions={languageExtensions[language]}
                theme={tokyoNight}
                onChange={onChange}
                readOnly={isReadOnly}
                style={{ height: "100%" }}
              />
            </Box>
            <Box flex="1" minHeight="100px">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input here..."
                bg="gray.900"
                color="white"
                fontFamily="mono"
                h="100%"
                resize="none"
              />
            </Box>
          </Flex>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        <Panel defaultSize={40} minSize={20}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={20}>
              <Flex direction="column" h="100%">
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="sm">Output</Heading>
                  <Flex align="center" gap={2}>
                    <StatusTag />
                    <IconButton
                      aria-label="Clear output"
                      icon={<FaTrash />}
                      size="xs"
                      onClick={() => {
                        setOutput("");
                        setDisplayedOutput("");
                      }}
                    />
                  </Flex>
                </Flex>
                <Box
                  p={4}
                  bg="gray.900"
                  borderRadius="md"
                  h="100%"
                  fontFamily="mono"
                  whiteSpace="pre-wrap"
                  color="white"
                  overflowY="auto"
                >
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <>
                      {displayedOutput}
                      {displayedOutput &&
                        displayedOutput.length === output.length && (
                          <span className="blinking-cursor">|</span>
                        )}
                    </>
                  )}
                </Box>
              </Flex>
            </Panel>
            {snippetId && (
              <PanelResizeHandle
                style={{ height: "10px", background: "#1A202C" }}
              />
            )}
            {snippetId && (
              <Panel defaultSize={40} minSize={20}>
                <Flex direction="column" h="100%">
                  <Heading size="sm" mb={2} mt={2}>
                    Chat
                  </Heading>
                  <VStack
                    flex="1"
                    overflowY="auto"
                    bg="gray.900"
                    p={2}
                    borderRadius="md"
                    align="start"
                  >
                    {chatMessages.map((msg) => (
                      <Box key={msg.id} maxW="80%">
                        <Text fontWeight="bold" fontSize="sm">
                          {msg.sender}
                        </Text>
                        <Text bg="gray.700" p={2} borderRadius="md">
                          {msg.text}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                  <HStack mt={2}>
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendChatMessage()
                      }
                    />
                    <IconButton
                      aria-label="Send message"
                      icon={<FaPaperPlane />}
                      onClick={handleSendChatMessage}
                    />
                  </HStack>
                </Flex>
              </Panel>
            )}
          </PanelGroup>
        </Panel>
      </PanelGroup>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Save Code Snippet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter a title for your snippet..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Editor;
