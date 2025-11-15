import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { FaTrash, FaPaperPlane, FaCode, FaGlobe } from "react-icons/fa";
import FileTree from "../components/FileTree";

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

const defaultWebFiles = [
  {
    fileName: "index.html",
    language: "html",
    code: `<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>`,
  },
  {
    fileName: "style.css",
    language: "css",
    code: `body {\n  font-family: sans-serif;\n  background-color: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}`,
  },
  {
    fileName: "script.js",
    language: "javascript",
    code: `console.log("Hello from script.js!");\n\ndocument.querySelector('h1').textContent = 'Hello from JS!';`,
  },
];

const boilerplateCode = {
  cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
  python: `def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()`,
  javascript: `console.log("Hello, World!");`,
};

const languageExtensions = {
  cpp: [cpp(), autocompletion({ override: [completeFromList(cppKeywords)] })],
  python: [python(), autocompletion()],
  javascript: [javascript({ jsx: true }), autocompletion()],
  html: [html(), autocompletion()],
  css: [css(), autocompletion()],
};

const NewProjectChooser = ({ onSelect }) => {
  const [language, setLanguage] = useState("javascript");

  const handleSnippetCreate = () => {
    let fileName = `main.${language}`;
    if (language === "python") fileName = "main.py";
    if (language === "cpp") fileName = "main.cpp";

    onSelect("code", [
      {
        fileName,
        language,
        code: boilerplateCode[language],
      },
    ]);
  };

  return (
    <Flex justify="center" align="center" h="calc(100vh - 200px)">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Box
          className="animated-border-box"
          onClick={() => onSelect("web", defaultWebFiles)}
          cursor="pointer"
        >
          <Flex
            direction="column"
            align="center"
            justify="center"
            p={10}
            bg="gray.800"
            borderRadius="lg"
            className="glass-card"
            minH="250px"
            h="100%"
          >
            <Icon as={FaGlobe} boxSize={16} color="teal.300" />
            <Heading size="lg" mt={4}>
              Create Web Project
            </Heading>
            <Text color="gray.400" mt={2} textAlign="center">
              (HTML, CSS, JS)
            </Text>
            <Text color="gray.500" mt={2} textAlign="center">
              Multi-file editor with a live preview.
            </Text>
          </Flex>
        </Box>

        <Box className="animated-border-box">
          <Flex
            direction="column"
            align="center"
            justify="center"
            p={10}
            bg="gray.800"
            borderRadius="lg"
            className="glass-card"
            minH="250px"
          >
            <Icon as={FaCode} boxSize={16} color="blue.300" />
            <Heading size="lg" mt={4}>
              Create Code Snippet
            </Heading>
            <Select
              w="200px"
              mt={4}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </Select>
            <Button
              colorScheme="blue"
              mt={4}
              onClick={(e) => {
                e.stopPropagation();
                handleSnippetCreate();
              }}
            >
              Create
            </Button>
          </Flex>
        </Box>
      </SimpleGrid>
    </Flex>
  );
};

const Editor = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const isRemoteChange = useRef(false);

  const [projectType, setProjectType] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

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

  const activeFileObject = useMemo(() => {
    return files.find((f) => f.fileName === activeFile);
  }, [files, activeFile]);

  const activeLanguage = useMemo(() => {
    return activeFileObject?.language || "javascript";
  }, [activeFileObject]);

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

    if (projectId) {
      const userPayload = {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        socketId: socket.id,
      };
      socket.emit("join-room", projectId, userPayload);

      const fetchProject = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        try {
          const res = await axios.get(
            `https://codeedit-backend.onrender.com/api/projects/${projectId}`,
            { headers: { "x-auth-token": token } }
          );
          isRemoteChange.current = true;
          setFiles(res.data.files);
          setProjectType(res.data.projectType);
          setActiveFile(res.data.files[0].fileName);
          setIsReadOnly(res.data.readOnly);
          setChatMessages(res.data.chat || []);
        } catch (err) {
          toast({ title: "Error fetching project", status: "error" });
          navigate("/");
        }
        setIsLoading(false);
      };
      fetchProject();
    } else {
      setProjectType(null);
      setFiles([]);
    }

    socket.on("code-update", ({ fileName, newCode }) => {
      isRemoteChange.current = true;
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.fileName === fileName ? { ...file, code: newCode } : file
        )
      );
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
  }, [projectId, toast, currentUser, navigate]);

  const srcDoc = useMemo(() => {
    if (projectType !== "web" || !files.length) return "";

    const htmlFile = files.find((f) => f.fileName.match(/index\.html$/i));
    if (!htmlFile) return "<html><body>No index.html file found.</body></html>";

    let html = htmlFile.code;
    const cssFiles = files.filter((f) => f.fileName.endsWith(".css"));
    let css = "";
    for (const cssFile of cssFiles) {
      css += `<style type"text/css">${cssFile.code}</style>`;
      const re = new RegExp(
        `<link[^>]*href=["']${cssFile.fileName}["'][^>]*>`,
        "i"
      );
      html = html.replace(re, "");
    }

    const jsFiles = files.filter((f) => f.fileName.endsWith(".js"));
    let js = "";
    for (const jsFile of jsFiles) {
      js += `<script>${jsFile.code}</script>`;
      const re = new RegExp(
        `<script[^>]*src=["']${jsFile.fileName}["'][^>]*></script>`,
        "i"
      );
      html = html.replace(re, "");
    }

    html = html.replace("</head>", `${css}\n</head>`);
    html = html.replace("</body>", `${js}\n</body>`);

    return html;
  }, [files, projectType]);

  useEffect(() => {
    if (isLoading || !output) {
      setDisplayedOutput("");
      return;
    }
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedOutput(output.substring(0, i + 1));
      i++;
      if (i > output.length) clearInterval(intervalId);
    }, 10);
    return () => clearInterval(intervalId);
  }, [output, isLoading]);

  const handleSendChatMessage = () => {
    if (chatInput.trim() && projectId && currentUser) {
      const message = {
        id: Date.now(),
        sender: currentUser.firstName,
        text: chatInput,
      };
      socketRef.current.emit("send-chat-message", {
        roomId: projectId,
        message,
      });
      setChatMessages((prev) => [...prev, message]);
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
    debounce(async (fileName, newCode) => {
      if (projectId) {
        const token = localStorage.getItem("token");
        try {
          await axios.put(
            `https://codeedit-backend.onrender.com/api/projects/${projectId}/file`,
            { fileName, newCode },
            { headers: { "x-auth-token": token } }
          );
        } catch (err) {
          console.error("Failed to save code:", err);
        }
      }
    }, 1000),
    [projectId]
  );

  const onChange = useCallback(
    (value) => {
      if (isRemoteChange.current) {
        isRemoteChange.current = false;
        return;
      }

      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.fileName === activeFile ? { ...file, code: value } : file
        )
      );

      if (socketRef.current && projectId) {
        socketRef.current.emit("code-change", {
          roomId: projectId,
          fileName: activeFile,
          newCode: value,
        });
        saveCode(activeFile, value);
      }
    },
    [projectId, saveCode, activeFile]
  );

  const handleRun = async () => {
    setIsLoading(true);
    setStatus("running");
    setOutput("");
    setDisplayedOutput("");
    const token = localStorage.getItem("token");

    if (activeLanguage === "html" || activeLanguage === "css") {
      setOutput("Use the 'Preview' tab to see web project output.");
      setStatus("idle");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://codeedit-backend.onrender.com/run",
        { language: activeLanguage, code: activeFileObject.code, input },
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
      });
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "https://codeedit-backend.onrender.com/api/projects",
        { title, files, projectType },
        { headers: { "x-auth-token": token } }
      );
      toast({
        title: "Success",
        description: "Project saved successfully!",
        status: "success",
      });
      onClose();
      setTitle("");
      navigate(`/project/${res.data._id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save project.",
        status: "error",
      });
    }
  };

  const handleLeaveSession = () => {
    navigate("/");
  };

  const handleNewProjectSelect = (type, initialFiles) => {
    setProjectType(type);
    setFiles(initialFiles);
    setActiveFile(initialFiles[0].fileName);
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

  if (!projectId && !projectType) {
    return <NewProjectChooser onSelect={handleNewProjectSelect} />;
  }

  if (isLoading && projectId) {
    return (
      <Flex justify="center" align="center" height="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const isWebProject = projectType === "web";

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          {projectId && (
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
        </Box>
        <Flex>
          {projectId && (
            <Button colorScheme="orange" onClick={handleLeaveSession} mr={4}>
              Leave Session
            </Button>
          )}
          {!projectId && (
            <Button colorScheme="blue" onClick={onOpen} mr={4}>
              Save Project
            </Button>
          )}
          <Button
            colorScheme="green"
            onClick={handleRun}
            isLoading={isLoading}
            isDisabled={activeLanguage === "html" || activeLanguage === "css"}
            _hover={{
              transform: "scale(1.05)",
              boxShadow: "0 0 10px #38A169, 0 0 20px #38A169, 0 0 30px #38A169",
            }}
          >
            ▶ Run Active File
          </Button>
        </Flex>
      </Flex>

      <PanelGroup
        direction="horizontal"
        style={{ height: "calc(100vh - 250px)", minHeight: "400px" }}
      >
        {isWebProject && (
          <>
            <Panel defaultSize={15} minSize={10}>
              <FileTree
                files={files}
                activeFile={activeFile}
                onFileSelect={setActiveFile}
              />
            </Panel>
            <PanelResizeHandle className="resize-handle" />
          </>
        )}

        <Panel defaultSize={isWebProject ? 50 : 60} minSize={30}>
          <Flex direction="column" h="100%" gap={4}>
            <Box flex="3" minHeight="200px" h="calc(100% - 100px - 1rem)">
              <Heading size="sm" mb={2}>
                {activeFileObject?.fileName}
              </Heading>
              <CodeMirror
                value={activeFileObject?.code || ""}
                height="100%"
                extensions={languageExtensions[activeLanguage] || []}
                theme={tokyoNight}
                onChange={onChange}
                readOnly={isReadOnly}
                style={{ height: "100%", overflow: "auto" }}
              />
            </Box>
            <Box flex="1" minHeight="100px">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isWebProject
                    ? "Input for console.log()..."
                    : "Enter input for C++, Python, or JS runs..."
                }
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

        <Panel defaultSize={isWebProject ? 35 : 40} minSize={20}>
          <Flex direction="column" h="100%">
            <Tabs h="100%" display="flex" flexDirection="column">
              <TabList>
                {isWebProject && <Tab>Preview</Tab>}
                <Tab>Output</Tab>
                {projectId && <Tab>Chat</Tab>}
              </TabList>

              <TabPanels flex="1" overflow="auto" h="calc(100% - 40px)">
                {isWebProject && (
                  <TabPanel h="100%" p={0}>
                    <iframe
                      srcDoc={srcDoc}
                      title="Preview"
                      sandbox="allow-scripts allow-modals allow-popups allow-forms"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "white",
                      }}
                    />
                  </TabPanel>
                )}

                <TabPanel h="100%">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="sm">Console Output</Heading>
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
                    h="calc(100% - 40px)"
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
                </TabPanel>

                {projectId && (
                  <TabPanel h="100%">
                    <Flex direction="column" h="100%">
                      <Heading size="sm" mb={2} mt={-2}>
                        Chat
                      </Heading>
                      <VStack
                        flex="1"
                        overflowY="auto"
                        bg="gray.900"
                        p={2}
                        borderRadius="md"
                        align="start"
                        maxH="calc(100% - 50px)"
                      >
                        {chatMessages.map((msg, index) => (
                          <Box key={msg.id || index} maxW="80%">
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
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </Flex>
        </Panel>
      </PanelGroup>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Save New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter a title for your project..."
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
