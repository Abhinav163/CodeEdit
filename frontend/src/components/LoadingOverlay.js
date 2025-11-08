import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Flex,
  Text,
  Progress,
  Box,
} from "@chakra-ui/react";

const LoadingOverlay = ({ isOpen }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (isOpen) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 99) {
            clearInterval(interval);
            return 99;
          }
          return Math.min(oldProgress + 1, 99);
        });
      }, 200);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent
        bg="gray.900"
        color="white"
        borderRadius="lg"
        className="glass-card"
      >
        <ModalBody p={8}>
          <Flex direction="column" align="center" justify="center">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              className="hacker-text"
              data-text="Connecting..."
            >
              Connecting...
            </Text>
            <Text color="gray.400" mt={2} mb={6}>
              Waking up the server, this may take a moment...
            </Text>
            <Box w="100%">
              <Progress
                value={progress}
                colorScheme="teal"
                hasStripe
                isAnimated
                borderRadius="md"
                size="lg"
              />
              <Text
                textAlign="center"
                mt={3}
                fontSize="xl"
                fontFamily="mono"
                color="teal.300"
              >
                {progress}%
              </Text>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoadingOverlay;
