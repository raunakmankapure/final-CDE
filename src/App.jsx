import "bootstrap/dist/css/bootstrap.min.css";
import { Box, Code } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";
import Home from "./components/Home";
import { Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme.js";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-center"></Toaster>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/Editor/:roomId"
          element={
            <ChakraProvider theme={theme}>
              {" "}
              <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
                <CodeEditor />{" "}
              </Box>
            </ChakraProvider>
          }
        />
      </Routes>
    </>
  );
}

export default App;
