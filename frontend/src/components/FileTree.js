import React, { useState } from "react";
import {
  Box,
  VStack,
  Button,
  Heading,
  Flex,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Select,
  HStack,
  Text,
  Collapse,
  useToast,
} from "@chakra-ui/react";
import {
  FaFileCode,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaPlus,
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaChevronDown,
  FaTrash,
} from "react-icons/fa";
import { SiCplusplus, SiPython } from "react-icons/si";

const languageIcon = {
  cpp: SiCplusplus,
  python: SiPython,
  javascript: FaJs,
  html: FaHtml5,
  css: FaCss3Alt,
};

const FileTree = ({
  files,
  activeFile,
  onFileSelect,
  onAddFile,
  onDeleteFile,
  readOnly,
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(["/"]));
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState("file");
  const [newItemLanguage, setNewItemLanguage] = useState("javascript");
  const [currentPath, setCurrentPath] = useState("/");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Name required",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    const isFolder = newItemType === "folder";
    onAddFile({
      fileName: newItemName,
      path: currentPath,
      isFolder,
      language: isFolder ? undefined : newItemLanguage,
    });

    setNewItemName("");
    onClose();
  };

  const handleDelete = (file) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${file.fileName}?${
          file.isFolder ? " This will delete all files inside it." : ""
        }`,
      )
    ) {
      onDeleteFile(file.fileName, file.path);
    }
  };

  const openAddDialog = (path) => {
    setCurrentPath(path);
    setNewItemName("");
    setNewItemType("file");
    onOpen();
  };

  const getFileIcon = (file) => {
    if (file.isFolder) {
      const folderPath =
        file.path === "/"
          ? `/${file.fileName}`
          : `${file.path}/${file.fileName}`;
      return expandedFolders.has(folderPath) ? FaFolderOpen : FaFolder;
    }
    return languageIcon[file.language] || FaFileCode;
  };

  const getFullPath = (file) => {
    return file.path === "/"
      ? `/${file.fileName}`
      : `${file.path}/${file.fileName}`;
  };

  const buildTree = () => {
    const tree = {};

    files.forEach((file) => {
      const parts = file.path.split("/").filter(Boolean);
      let current = tree;

      parts.forEach((part) => {
        if (!current[part]) {
          current[part] = { __files: [] };
        }
        current = current[part];
      });

      if (!current.__files) {
        current.__files = [];
      }
      current.__files.push(file);
    });

    return tree;
  };

  const renderTree = (node, path = "/", level = 0) => {
    const items = [];
    const filesInPath = node.__files || [];

    // Sort: folders first, then files
    const folders = filesInPath.filter((f) => f.isFolder);
    const regularFiles = filesInPath.filter((f) => !f.isFolder);

    folders.forEach((folder) => {
      const folderPath =
        path === "/" ? `/${folder.fileName}` : `${path}/${folder.fileName}`;
      const isExpanded = expandedFolders.has(folderPath);
      const Icon = getFileIcon(folder);

      items.push(
        <Box key={folderPath} pl={level * 4}>
          <Flex align="center" gap={1}>
            <IconButton
              icon={isExpanded ? <FaChevronDown /> : <FaChevronRight />}
              size="xs"
              variant="ghost"
              onClick={() => toggleFolder(folderPath)}
              aria-label="Toggle folder"
            />
            <Button
              variant="ghost"
              colorScheme="gray"
              onClick={() => toggleFolder(folderPath)}
              justifyContent="flex-start"
              leftIcon={<Icon />}
              size="sm"
              flex="1"
            >
              {folder.fileName}
            </Button>
            {!readOnly && (
              <>
                <IconButton
                  icon={<FaPlus />}
                  size="xs"
                  variant="ghost"
                  onClick={() => openAddDialog(folderPath)}
                  aria-label="Add file/folder"
                  colorScheme="green"
                />
                <IconButton
                  icon={<FaTrash />}
                  size="xs"
                  variant="ghost"
                  onClick={() => handleDelete(folder)}
                  aria-label="Delete folder"
                  colorScheme="red"
                />
              </>
            )}
          </Flex>
          {isExpanded && node[folder.fileName] && (
            <Collapse in={isExpanded}>
              {renderTree(node[folder.fileName], folderPath, level + 1)}
            </Collapse>
          )}
        </Box>,
      );
    });

    regularFiles.forEach((file) => {
      const Icon = getFileIcon(file);
      const fullPath = getFullPath(file);
      const isActive = activeFile === fullPath;

      items.push(
        <Flex key={fullPath} pl={level * 4 + 8} align="center" gap={1}>
          <Button
            variant={isActive ? "solid" : "ghost"}
            colorScheme={isActive ? "teal" : "gray"}
            onClick={() => onFileSelect(fullPath)}
            justifyContent="flex-start"
            leftIcon={<Icon />}
            size="sm"
            flex="1"
          >
            {file.fileName}
          </Button>
          {!readOnly && (
            <IconButton
              icon={<FaTrash />}
              size="xs"
              variant="ghost"
              onClick={() => handleDelete(file)}
              aria-label="Delete file"
              colorScheme="red"
            />
          )}
        </Flex>,
      );
    });

    return items;
  };

  const tree = buildTree();

  return (
    <Box h="100%" w="100%" bg="gray.900" p={2} borderRadius="md">
      <Flex justify="space-between" align="center" mb={2} px={2}>
        <Heading size="sm">Files</Heading>
        {!readOnly && (
          <IconButton
            icon={<FaPlus />}
            size="sm"
            colorScheme="green"
            onClick={() => openAddDialog("/")}
            aria-label="Add file/folder"
          />
        )}
      </Flex>
      <VStack align="stretch" spacing={1} overflowY="auto">
        {renderTree(tree)}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>
            Add New {newItemType === "folder" ? "Folder" : "File"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Select
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value)}
              >
                <option value="file">File</option>
                <option value="folder">Folder</option>
              </Select>
              <Input
                placeholder={`Enter ${newItemType} name`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              {newItemType === "file" && (
                <Select
                  value={newItemLanguage}
                  onChange={(e) => setNewItemLanguage(e.target.value)}
                >
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </Select>
              )}
              <Text fontSize="sm" color="gray.400">
                Location: {currentPath}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddItem}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FileTree;
