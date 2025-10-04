// import React, { useState, useCallback, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import CodeMirror from "@uiw/react-codemirror";
// import { cpp } from "@codemirror/lang-cpp";
// import { python } from "@codemirror/lang-python";
// import { javascript } from "@codemirror/lang-javascript";
// import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
// import { okaidia } from "@uiw/codemirror-theme-okaidia";
// import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// import {
//   Box,
//   Flex,
//   Select,
//   Button,
//   Spinner,
//   Heading,
//   Textarea,
//   useDisclosure,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   Input,
//   useToast,
//   Tag,
//   IconButton,
// } from "@chakra-ui/react";
// import { FaTrash } from "react-icons/fa";

// const Editor = () => {
//   const location = useLocation();
//   const [language, setLanguage] = useState("cpp");
//   const [code, setCode] = useState(
//     '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}'
//   );

//   const [output, setOutput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [input, setInput] = useState("");
//   const [title, setTitle] = useState("");
//   const [status, setStatus] = useState("idle"); // idle, running, success, error

//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const toast = useToast();

//   useEffect(() => {
//     if (location.state && location.state.code && location.state.language) {
//       setCode(location.state.code);
//       setLanguage(location.state.language);
//     }
//   }, [location.state]);

//   const languageExtensions = {
//     cpp: [cpp()],
//     python: [python()],
//     javascript: [javascript({ jsx: true })],
//   };

//   const onChange = useCallback((value) => {
//     setCode(value);
//   }, []);

//   const handleRun = async () => {
//     setIsLoading(true);
//     setStatus("running");
//     setOutput("");
//     const token = localStorage.getItem("token");
//     try {
//       const response = await axios.post(
//         "https://codeedit-backend.onrender.com/run",
//         { language, code, input },
//         { headers: { "x-auth-token": token } }
//       );
//       setOutput(response.data.output);
//       const isError =
//         /error/i.test(response.data.output) ||
//         response.data.output.includes("Traceback");
//       setStatus(isError ? "error" : "success");
//     } catch (error) {
//       setOutput(
//         error.response ? error.response.data.msg : "An error occurred."
//       );
//       setStatus("error");
//     }
//     setIsLoading(false);
//   };

//   const handleSave = async () => {
//     if (!title) {
//       toast({
//         title: "Title is required",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }
//     const token = localStorage.getItem("token");
//     try {
//       await axios.post(
//         "https://codeedit-backend.onrender.com/api/snippets",
//         { title, language, code },
//         { headers: { "x-auth-token": token } }
//       );
//       toast({
//         title: "Success",
//         description: "Snippet saved successfully!",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });
//       onClose();
//       setTitle("");
//     } catch (err) {
//       toast({
//         title: "Error",
//         description: "Could not save snippet.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   const StatusTag = () => {
//     const statusConfig = {
//       idle: { label: "Idle", color: "gray" },
//       running: { label: "Running...", color: "blue" },
//       success: { label: "Success", color: "green" },
//       error: { label: "Error", color: "red" },
//     };
//     const { label, color } = statusConfig[status] || statusConfig.idle;
//     return (
//       <Tag colorScheme={color} size="md">
//         {label}
//       </Tag>
//     );
//   };
//   <CodeMirror
//     value={code}
//     height="100%"
//     extensions={languageExtensions[language]}
//     theme={tokyoNight} // Change the theme here
//     onChange={onChange}
//     style={{ height: "100%" }}
//   />;

//   return (
//     <Box>
//       <Flex justify="space-between" align="center" mb={4}>
//         <Select
//           w="150px"
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//         >
//           <option value="cpp">C++</option>
//           <option value="python">Python</option>
//           <option value="javascript">JavaScript</option>
//         </Select>
//         <Flex>
//           <Button colorScheme="blue" onClick={onOpen} mr={4}>
//             Save
//           </Button>
//           <Button colorScheme="green" onClick={handleRun} isLoading={isLoading}>
//             ▶ Run
//           </Button>
//         </Flex>
//       </Flex>

//       <PanelGroup
//         direction="horizontal"
//         style={{ height: "calc(100vh - 250px)", minHeight: "400px" }}
//       >
//         <Panel defaultSize={60} minSize={30}>
//           <Flex direction="column" h="100%" gap={4}>
//             <Box flex="3" minHeight="200px">
//               <Heading size="sm" mb={2}>
//                 Code
//               </Heading>
//               <CodeMirror
//                 value={code}
//                 height="100%"
//                 extensions={languageExtensions[language]}
//                 theme={okaidia}
//                 onChange={onChange}
//                 style={{ height: "100%" }}
//               />
//             </Box>
//             <Box flex="1" minHeight="100px">
//               {/* <Heading size="sm" mb={2}>
//                 User Input (stdin)
//               </Heading> */}
//               <Textarea
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Enter input here..."
//                 bg="gray.900"
//                 color="white"
//                 fontFamily="mono"
//                 h="100%"
//                 resize="none"
//               />
//             </Box>
//           </Flex>
//         </Panel>

//         <PanelResizeHandle className="resize-handle" />

//         <Panel defaultSize={40} minSize={20}>
//           <Flex direction="column" h="100%">
//             <Flex justify="space-between" align="center" mb={2}>
//               <Heading size="sm">Output</Heading>
//               <Flex align="center" gap={2}>
//                 <StatusTag />
//                 <IconButton
//                   aria-label="Clear output"
//                   icon={<FaTrash />}
//                   size="xs"
//                   onClick={() => setOutput("")}
//                 />
//               </Flex>
//             </Flex>
//             <Box
//               p={4}
//               bg="gray.900"
//               borderRadius="md"
//               h="100%"
//               fontFamily="mono"
//               whiteSpace="pre-wrap"
//               color="white"
//               overflowY="auto"
//             >
//               {isLoading ? <Spinner /> : output}
//             </Box>
//           </Flex>
//         </Panel>
//       </PanelGroup>

//       <Modal isOpen={isOpen} onClose={onClose} isCentered>
//         <ModalOverlay />
//         <ModalContent bg="gray.800">
//           <ModalHeader>Save Code Snippet</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <Input
//               placeholder="Enter a title for your snippet..."
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />
//           </ModalBody>
//           <ModalFooter>
//             <Button variant="ghost" mr={3} onClick={onClose}>
//               Cancel
//             </Button>
//             <Button colorScheme="blue" onClick={handleSave}>
//               Save
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default Editor;

import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
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
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";

const Editor = () => {
  const location = useLocation();
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(
    '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}'
  );
  const [output, setOutput] = useState("");
  const [displayedOutput, setDisplayedOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("idle");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (location.state && location.state.code && location.state.language) {
      setCode(location.state.code);
      setLanguage(location.state.language);
    }
  }, [location.state]);

  // Typing effect for output
  // Typing effect for output
  useEffect(() => {
    if (isLoading) {
      setDisplayedOutput("");
      return;
    }
    if (!output) {
      setDisplayedOutput("");
      return;
    }

    let i = 0;
    const intervalId = setInterval(() => {
      // Use substring for a more reliable update
      setDisplayedOutput(output.substring(0, i + 1));
      i++;
      if (i > output.length) {
        clearInterval(intervalId);
      }
    }, 10); // Typing speed in ms

    return () => clearInterval(intervalId); // Cleanup function
  }, [output, isLoading]);

  const languageExtensions = {
    cpp: [cpp()],
    python: [python()],
    javascript: [javascript({ jsx: true })],
  };

  const onChange = useCallback((value) => {
    setCode(value);
  }, []);

  const handleRun = async () => {
    setIsLoading(true);
    setStatus("running");
    setOutput("");
    setDisplayedOutput(""); // Clear displayed output immediately
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
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </Select>
        <Flex>
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
