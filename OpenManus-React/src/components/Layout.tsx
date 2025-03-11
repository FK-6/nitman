import { Box, Container, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <Box minH="100vh">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <Flex direction="column" gap={6}>
          <Outlet />
        </Flex>
      </Container>
    </Box>
  );
};

export default Layout;
