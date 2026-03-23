'use client';

import {
  Box,
  Button,
  Heading,
  Text,
  Badge,
  Flex,
  Stack,
  Grid,
} from '@chakra-ui/react';

export default function ChakraUIShowcase() {
  return (
    <Box py={8}>
      <Heading as="h2" size="xl" mb={6} color="gray.900">
        Chakra UI Components
      </Heading>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6} mb={6}>
        <Box bg="white" p={6} rounded="lg" shadow="md">
          <Heading size="md" mb={4}>
            Student Profile
          </Heading>
          <Stack>
            <Flex gap={4}>
              <Text fontWeight="bold">Name:</Text>
              <Text>John Doe</Text>
            </Flex>
            <Flex gap={4}>
              <Text fontWeight="bold">Roll No:</Text>
              <Text>12345</Text>
            </Flex>
            <Flex gap={4}>
              <Text fontWeight="bold">Status:</Text>
              <Badge colorScheme="green">Active</Badge>
            </Flex>
          </Stack>
        </Box>

        <Box bg="white" p={6} rounded="lg" shadow="md">
          <Heading size="md" mb={4}>
            Quick Stats
          </Heading>
          <Stack gap={4}>
            <Box>
              <Text fontSize="sm" mb={2}>
                Course Progress
              </Text>
              <Box bg="blue.100" h="8px" rounded="full" w="80%" />
            </Box>
            <Box>
              <Text fontSize="sm" mb={2}>
                Assignment Completion
              </Text>
              <Box bg="green.100" h="8px" rounded="full" w="65%" />
            </Box>
          </Stack>
        </Box>
      </Grid>

      <Box bg="white" p={6} rounded="lg" shadow="md">
        <Heading size="md" mb={4}>
          Button Variants
        </Heading>
        <Flex gap={4} wrap="wrap">
          <Button colorScheme="blue">Primary</Button>
          <Button colorScheme="green">Success</Button>
          <Button colorScheme="red">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </Flex>
      </Box>
    </Box>
  );
}
