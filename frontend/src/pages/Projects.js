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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  IconButton,
  InputGroup,
  InputRightElement,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Checkbox,
  Tag,
  HStack,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaTrash,
  FaClipboard,
  FaFolder,
  FaFileCode,
} from "react-icons/fa";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import { SiCplusplus, SiPython, SiJavascript } from "react-icons/si";

const languageIconMap = {
  cpp: SiCplusplus,
  python: SiPython,
  javascript: SiJavascript,
  html: FaFileCode,
  css: FaFileCode,
};

const ProjectCard = ({ project, onShareClick, onDeleteClick }) => {
  const isWebProject = project.projectType === "web";
  const mainFile =
    project.files.find((f) => f.fileName === "index.html") || project.files[0];
  const langInfo = languageIconMap[mainFile.language] || FaFileCode;

  return (
    <Box className="animated-border-box" key={project._id}>
      <Card
        bg="gray.800"
        boxShadow="lg"
        _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
        transition="all 0.2s"
        className="glass-card"
      >
        <CardHeader>
          <Flex align="center" justify="space-between">
            <Heading size="md">{project.title}</Heading>
            <Icon
              as={isWebProject ? FaFolder : langInfo}
              color="teal.300"
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
            {mainFile.code || "// Empty file"}
          </Text>
          <HStack mt={2} spacing={2} overflowX="auto">
            {project.files.map((file) => (
              <Tag
                size="sm"
                key={file.fileName}
                variant="subtle"
                colorScheme="gray"
              >
                {file.fileName}
              </Tag>
            ))}
          </HStack>
        </CardBody>
        <CardFooter>
          <ButtonGroup spacing="2">
            <Button
              as={RouterLink}
              to={`/project/${project._id}`}
              variant="solid"
              colorScheme="teal"
            >
              Open
            </Button>
            <Button
              variant="solid"
              colorScheme="blue"
              onClick={() => onShareClick(project)}
            >
              Share
            </Button>
            <Button
              variant="ghost"
              colorScheme="red"
              onClick={() => onDeleteClick(project._id)}
            >
              Delete
            </Button>
          </ButtonGroup>
        </CardFooter>
      </Card>
    </Box>
  );
};

const Projects = () => {
  const [myProjects, setMyProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);

  const [myFolders, setMyFolders] = useState([]);
  const [mySnippets, setMySnippets] = useState([]);
  const [sharedFolders, setSharedFolders] = useState([]);
  const [sharedSnippets, setSharedSnippets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToShare, setProjectToShare] = useState(null);
  const [collaboratorEmails, setCollaboratorEmails] = useState([""]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isShareOpen,
    onOpen: onShareOpen,
    onClose: onShareClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  const filterProjects = (projects, isShared = false) => {
    const folders = projects.filter((p) => p.projectType === "web");
    const snippets = projects.filter((p) => p.projectType === "code");
    if (isShared) {
      setSharedFolders(folders);
      setSharedSnippets(snippets);
    } else {
      setMyFolders(folders);
      setMySnippets(snippets);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const [myProjectsRes, sharedProjectsRes] = await Promise.all([
          axios.get("https://codeedit-backend.onrender.com/api/projects/user", {
            headers: { "x-auth-token": token },
          }),
          axios.get(
            "https://codeedit-backend.onrender.com/api/projects/shared",
            {
              headers: { "x-auth-token": token },
            }
          ),
        ]);
        setMyProjects(myProjectsRes.data);
        setSharedProjects(sharedProjectsRes.data);
        filterProjects(myProjectsRes.data, false);
        filterProjects(sharedProjectsRes.data, true);
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not fetch projects.",
          status: "error",
        });
      }
      setLoading(false);
    };
    fetchProjects();
  }, [toast]);

  const openDeleteDialog = (id) => {
    setProjectToDelete(id);
    onDeleteOpen();
  };

  const handleShareClick = (project) => {
    setProjectToShare(project);
    setIsReadOnly(project.readOnly || false);
    setCollaboratorEmails([""]);
    onShareOpen();
  };

  const handleShare = async () => {
    if (!projectToShare) return;
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `https://codeedit-backend.onrender.com/api/projects/${projectToShare._id}/share`,
        {
          emails: collaboratorEmails.filter((email) => email),
          readOnly: isReadOnly,
        },
        { headers: { "x-auth-token": token } }
      );
      const url = `${window.location.origin}/project/${projectToShare._id}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Collaboration link has been copied and invites sent.",
        status: "success",
      });
      onShareClose();
      setCollaboratorEmails([""]);
      setProjectToShare(null);
    } catch (err) {
      toast({ title: "Sharing Error", status: "error" });
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://codeedit-backend.onrender.com/api/projects/${projectToDelete}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const newMyProjects = myProjects.filter((p) => p._id !== projectToDelete);
      setMyProjects(newMyProjects);
      filterProjects(newMyProjects, false);
      toast({ title: "Success", description: "Project deleted." });
    } catch (err) {
      toast({ title: "Error", description: "Could not delete project." });
    }
    onDeleteClose();
    setProjectToDelete(null);
  };

  const handleCollaboratorEmailChange = (index, value) => {
    const newEmails = [...collaboratorEmails];
    newEmails[index] = value;
    setCollaboratorEmails(newEmails);
  };

  const addCollaboratorField = () => {
    setCollaboratorEmails([...collaboratorEmails, ""]);
  };

  const removeCollaboratorField = (index) => {
    const newEmails = collaboratorEmails.filter((_, i) => i !== index);
    setCollaboratorEmails(newEmails);
  };

  const renderProjectGrid = (projects, typeName) => {
    if (projects.length > 0) {
      return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onShareClick={handleShareClick}
              onDeleteClick={openDeleteDialog}
            />
          ))}
        </SimpleGrid>
      );
    }
    return <Text>You don't have any {typeName} yet.</Text>;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>My Files</Heading>
        <Button as={RouterLink} to="/" colorScheme="teal">
          Create New
        </Button>
      </Flex>

      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Folders (Web Projects)</Tab>
          <Tab>Snippets (Code Files)</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Tabs isFitted variant="soft-rounded" colorScheme="teal">
              <TabList mb="1em">
                <Tab>My Folders</Tab>
                <Tab>Shared Folders</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>{renderProjectGrid(myFolders, "folders")}</TabPanel>
                <TabPanel>
                  {renderProjectGrid(sharedFolders, "shared folders")}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>

          <TabPanel>
            <Tabs isFitted variant="soft-rounded" colorScheme="blue">
              <TabList mb="1em">
                <Tab>My Snippets</Tab>
                <Tab>Shared Snippets</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>{renderProjectGrid(mySnippets, "snippets")}</TabPanel>
                <TabPanel>
                  {renderProjectGrid(sharedSnippets, "shared snippets")}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Project</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={isShareOpen} onClose={onShareClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Share Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Shareable Link:
                </Text>
                <InputGroup>
                  <Input
                    value={`${window.location.origin}/project/${projectToShare?._id}`}
                    isReadOnly
                    bg="gray.700"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Copy link"
                      icon={<FaClipboard />}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/project/${projectToShare?._id}`
                        );
                        toast({
                          title: "Link Copied!",
                          status: "success",
                          duration: 2000,
                        });
                      }}
                    />
                  </InputRightElement>
                </InputGroup>
                <Checkbox
                  isChecked={isReadOnly}
                  onChange={(e) => setIsReadOnly(e.target.checked)}
                  mt={2}
                >
                  Read-Only
                </Checkbox>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Invite Collaborators by Email:
                </Text>
                {collaboratorEmails.map((email, index) => (
                  <InputGroup key={index} mb={2}>
                    <Input
                      type="email"
                      placeholder="collaborator@example.com"
                      value={email}
                      onChange={(e) =>
                        handleCollaboratorEmailChange(index, e.target.value)
                      }
                      bg="gray.700"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Remove collaborator"
                        icon={<FaTrash />}
                        size="sm"
                        onClick={() => removeCollaboratorField(index)}
                        isDisabled={collaboratorEmails.length === 1}
                      />
                    </InputRightElement>
                  </InputGroup>
                ))}
                <Button
                  leftIcon={<FaPlus />}
                  onClick={addCollaboratorField}
                  size="sm"
                  mt={2}
                >
                  Add another
                </Button>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onShareClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleShare}>
              Share & Copy Link
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Projects;
