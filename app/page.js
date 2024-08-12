"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CohereClient } from "cohere-ai";

const client = new CohereClient({
  token: `${process.env.COHERE_API_KEY}`,
});

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm the Headstarter support assistant. How can I help you today?",
      type: "bot",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages([...messages, { text: userMessage, type: "user" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await client.chat({
        message: userMessage,
        model: "command-r-plus",
        preamble:
          "You are an AI-assistant chatbot. You are trained to assist users by providing thorough and helpful responses to their queries.",
      });

      setMessages([
        ...messages,
        { text: userMessage, type: "user" },
        { text: response.text, type: "bot" },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...messages,
        { text: userMessage, type: "user" },
        {
          text: "I'm sorry, but I encountered an error. Please try again later.",
          type: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f5f5f5"
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "600px",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: "auto",
            backgroundColor: "#fafafa",
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.type === "user" ? "flex-end" : "flex-start"}
              mb={1.5}
            >
              <Box
                sx={{
                  bgcolor: msg.type === "user" ? "#d1e7dd" : "#f8d7da",
                  color: "black",
                  borderRadius: 2,
                  p: 1.5,
                  maxWidth: "80%",
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Box
          sx={{ p: 2, borderTop: "1px solid #e0e0e0", backgroundColor: "#fff" }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", alignItems: "center" }}
          >
            <TextField
              label="Type your message..."
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSubmit(e)
              }
              disabled={isLoading}
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ ml: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Send"}
            </Button>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}
