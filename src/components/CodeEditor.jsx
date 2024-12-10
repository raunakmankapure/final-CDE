import { Box, ChakraProvider, HStack } from "@chakra-ui/react";
import { React, useRef, useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import UserDisplay from "./UsersDisplay";
import "bootstrap/dist/css/bootstrap.min.css";
import Client from "./Client";
import {
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from "react-router-dom";
import { initSocket } from "../socket";
import toast from "react-hot-toast";
import { throttle } from "lodash";
import { jwtDecode } from "jwt-decode";
import { debounce } from "lodash";
import ChatBot from "./chatBot";
import Tutorial from "./Tutorial";
import ChatModule from "./ChatModule";

const CodeEditor = () => {
  const [clients, setclients] = useState([]);
  const editorRef = useRef();
  const valueRef = useRef("");
  const [value, setvalue] = useState("");
  const [language, setlanguage] = useState("javascript");
  const codeRef = useRef(null);
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);

  // Request editor lock when user starts editing
  const requestLock = () => {
    if (socketRef.current) {
      socketRef.current.emit("request-lock", {
        roomId,
        username: location.state?.username,
      });
    }
  };

  // Release the lock when user stops editing (e.g., unfocus or leaves)
  const releaseLock = () => {
    if (socketRef.current) {
      socketRef.current.emit("release-lock", {
        roomId,
        username: location.state?.username,
      });
    }
  };

  const saveToken = async () => {
    const req = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/quote`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });

    const data = await req.json();
    console.log(data);
  };

  const handleError = (e) => {
    console.log("socket error=>", e);
    toast.error("socket connection failed");
    navigate("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tutorialCompleted = localStorage.getItem("tutorialCompleted");

    if (token) {
      try {
        const user = jwtDecode(token);

        if (!user) {
          localStorage.removeItem("token");
          navigate("/");
        } else {
          saveToken();
          setShowTutorial(true);
        }
      } catch (error) {
        console.log("Invalid token", error);
        navigate("/");
      }
    }

    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => {
        handleError(err);
      });
      socketRef.current.on("connect_failed", (err) => {
        handleError(err);
      });

      socketRef.current.emit("join", {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on("joined", ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined`);
        }

        setclients(clients);

        //sending latest code to newly joined User
      });

      // Listen for editor lock updates
      socketRef.current.on("editor-locked", ({ lockedBy }) => {
        setIsLocked(true);
        setLockedBy(lockedBy);
        if (lockedBy !== location.state?.username) {
          toast(`${lockedBy} is editing, you can't edit right now.`);
        }
      });

      socketRef.current.on("editor-unlocked", () => {
        setIsLocked(false);
        setLockedBy(null);
        if (lockedBy !== location.state?.username) {
          toast("You can edit now.");
        }
      });

      socketRef.current.on("lock-failed", ({ lockedBy }) => {
        setIsLocked(true);
        setLockedBy(lockedBy);
        if (lockedBy !== location.state?.username) {
          toast(`Editor is locked by ${lockedBy}.`);
        }
      });

      //disconnecting the users

      socketRef.current.on("disconnected", async ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setclients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });

      socketRef.current.on("disconnect", async () => {
        toast.error("DISCONNECTED From Server");

        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}api/save-code-on-disconnect`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": localStorage.getItem("token"),
              },

              body: JSON.stringify({
                roomId,
                code: valueRef.current,
                email: jwtDecode(localStorage.getItem("token")).email,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to save code on disconnect");
          }
        } catch (error) {
          console.error("ERROR SAVING CODE", error);
        }
      });

      socketRef.current.on("code-change", ({ code }) => {
        console.log("Received Code change", code);
        if (editorRef.current) {
          const currentValue = editorRef.current.getValue();
          if (code !== currentValue) {
            editorRef.current.setValue(code);
            valueRef.current = code;
            setvalue(code);
          }
        }
      });

      // Sync code when a new user joins
      socketRef.current.on("sync-code", ({ code }) => {
        if (
          editorRef.current &&
          code !== undefined &&
          typeof code === "string"
        ) {
          const currentValue = editorRef.current.getValue();
          if (code !== currentValue) {
            editorRef.current.setValue(code);
            valueRef.current = code;
            setvalue(code);
          }
        }
      });

      const fetchIntialCode = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}api/get-code/${roomId}`,
            {
              headers: {
                "x-access-token": localStorage.getItem("token"),
              },
            }
          );

          const data = await response.json();

          if (data.status === "ok" && data.code) {
            if (editorRef.current) {
              editorRef.current.setValue(data.code);
            }

            setvalue(data.code);

            socketRef.current.emit("code-change", { roomId, code: data.code });
          }
        } catch (error) {
          console.log("Error Fetching Code:", error);
        }
      };

      fetchIntialCode();
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect_error", handleError);
        socketRef.current.off("connect_failed", handleError);
        socketRef.current.off("joined");

        socketRef.current.off("join");
        socketRef.current.off("disconnected");
        socketRef.current.off("code-change");
        socketRef.current.off("sync-code");
        releaseLock();

        socketRef.current.disconnect();
      }
    };
  }, [roomId, location.state]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    if (value) {
      editor.setValue(value);
    }

    editor.onDidChangeModelContent((event) => {
      const codeValue = editor.getValue();
      valueRef.current = codeValue;
      throttledEmit(codeValue);

      const { origin } = codeValue;
      const code = codeValue;

      const newValue = editor.getValue();
      onChange(newValue);

      if (!isLocked || lockedBy === location.state?.username) {
        // If the editor is not locked or the current user has the lock, request the lock
        requestLock();
      }
    });

    editor.onDidBlurEditorText(() => {
      releaseLock(); // Release the lock when the user stops editing
    });
  };

  const throttledEmit = throttle((codeValue) => {
    if (socketRef.current) {
      socketRef.current.emit("code-change", {
        roomId,
        code: codeValue,
      });
    }
  }, 1000);

  //     editor.onDidChangeModelContent((event) => {
  //

  //     });
  // };

  const onSelect = (language) => {
    setlanguage(language);
    setvalue(CODE_SNIPPETS[language]);
  };

  const onChange = (value) => {
    if (value !== valueRef.current) {
      console.log("code changed");
      valueRef.current = value;
      setvalue(value);
      throttledEmit(value);
    }

    // if (socketRef.current) {
    //     socketRef.current.emit('code-change', {
    //         roomId,
    //         code: value,
    //     });
    // }

    //throttleEmit(value);
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("roomId is copied");
    } catch (error) {
      toast.error("ERROR");
    }
  };

  const leaveRoom = async () => {
    const code = valueRef.current;

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}api/save-code`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-access-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ roomId, code }),
      }
    );

    if (response.ok) {
      navigate("/");
    } else {
      const errorData = await response.json();
      console.log("ERROR SAVING CODE", errorData);
    }
  };

  return (
    <ChakraProvider>
      <div className="container-fluid vh-100">
        {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
        <div className="row h-100">
          <div
            className="col-md-2  text-gray-200  flex flex-col h-screen m-0 p-0"
            style={{ boxShadow: "2px 0px 4px rgba(0,0,0,0.1)" }}
          >
            <div className="font-semibold text-lg flex flex-col flex-grow">
              <div className="flex justify-center items-center p-1">
                <img width={40} className="invert" src="/logo.svg" alt="logo" />
                <h1 className="text-white font-bold text-2xl">CDE</h1>
              </div>
              <hr style={{ marginTop: "-0rem" }} />

              <div className="flex flex-col overflow-auto custom-scrollbar">
                {/* client lists */}

                {clients.map((client) => {
                  const isEditing = lockedBy === client.username; // Determine if the client is the editor
                  return (
                    <Client
                      key={client.socketId}
                      username={client.username}
                      isEditing={isEditing}
                    />
                  );
                })}
              </div>

              <div className="mt-auto flex flex-col p-4">
                <hr className="p-2" />
                <button
                  onClick={copyRoomId}
                  className="mb-4 px-6 py-3 bg-[#5ac18e] text-[#0f0a19] font-semibold rounded-lg shadow-md hover:bg-[#48a178] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ac18e] transition duration-300 ease-in-out"
                >
                  Copy Room Id
                </button>

                <button
                  onClick={leaveRoom}
                  className=" mb-4 px-6 py-3 bg-[#f01808] text-[#0f0a19] font-semibold rounded-lg shadow-md hover:bg-[#823803] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ac18e] transition duration-300 ease-in-out"
                >
                  Save & Leave Room
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-10 flex flex-col h-100">
            <Box>
              <HStack spacing={4}>
                <Box w="50%">
                  <LanguageSelector language={language} onSelect={onSelect} />
                  <Editor
                    id="codeEditor"
                    height="85vh"
                    theme="vs-dark"
                    language={language}
                    defaultValue={CODE_SNIPPETS[language]}
                    value={value}
                    onMount={onMount}
                    onChange={onChange}
                    options={{
                      readOnly:
                        isLocked && lockedBy !== location.state?.username, // Disable editor for other users
                    }}
                  />
                  ;
                </Box>

                <Output editorRef={editorRef} language={language} />
              </HStack>
            </Box>
          </div>
        </div>

        <ChatBot />
        <ChatModule
          socket={socketRef.current}
          username={location.state?.username}
          roomId={roomId}
        />
      </div>
    </ChakraProvider>
  );
};

export default CodeEditor;
