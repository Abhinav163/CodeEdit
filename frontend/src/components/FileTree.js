import React from "react";
import { Box, VStack, Button, Heading, Flex } from "@chakra-ui/react";
import { FaFileCode, FaHtml5, FaCss3Alt, FaJs } from "react-icons/fa";
import { SiCplusplus, SiPython } from "react-icons/si";

const languageIcon = {
  cpp: SiCplusplus,
  python: SiPython,
  javascript: FaJs,
  html: FaHtml5,
  css: FaCss3Alt,
};

const FileTree = ({ files, activeFile, onFileSelect }) => {
  return (
    <Box h="100%" w="100%" bg="gray.900" p={2} borderRadius="md">
      <Flex justify="space-between" align="center" mb={2} px={2}>
        <Heading size="sm">Files</Heading>
      </Flex>
      <VStack align="stretch" spacing={1}>
        {files.map((file) => {
          const Icon = languageIcon[file.language] || FaFileCode;
          return (
            <Button
              key={file.fileName}
              variant={activeFile === file.fileName ? "solid" : "ghost"}
              colorScheme={activeFile === file.fileName ? "teal" : "gray"}
              onClick={() => onFileSelect(file.fileName)}
              justifyContent="flex-start"
              leftIcon={<Icon />}
              size="sm"
            >
              {file.fileName}
            </Button>
          );
        })}
      </VStack>
    </Box>
  );
};

export default FileTree;
