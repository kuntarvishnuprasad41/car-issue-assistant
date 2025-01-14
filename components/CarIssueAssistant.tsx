"use client";

import React, { useState, useEffect } from "react";
import carData from "../app/data/carData.json";

type Message = {
  text: string;
  sender: "user" | "bot";
  options?: string[];
};

export default function CarIssueAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome! Please enter your car model:", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [currentCar, setCurrentCar] = useState("");

  const findSimilarModels = (input: string): string[] => {
    const inputLower = input.toLowerCase();
    return carData.cars.filter(
      (model) =>
        model.toLowerCase().includes(inputLower) ||
        inputLower.includes(model.toLowerCase())
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");

    if (!currentCar) {
      const exactMatch = carData.cars.find(
        (model) => model.toLowerCase() === input.toLowerCase()
      );

      if (exactMatch) {
        setCurrentCar(exactMatch);
        setMessages([
          ...newMessages,
          {
            text: `Great! What issue are you experiencing with your ${exactMatch}?`,
            sender: "bot",
            options: carData.issues,
          },
        ]);
      } else {
        const similarModels = findSimilarModels(input);
        if (similarModels.length > 0) {
          setMessages([
            ...newMessages,
            {
              text: "I couldn't find an exact match. Did you mean one of these?",
              sender: "bot",
              options: similarModels,
            },
          ]);
        } else {
          setMessages([
            ...newMessages,
            {
              text: "I'm sorry, I couldn't find any matching car models. Please try again.",
              sender: "bot",
            },
          ]);
        }
      }
    } else {
      setMessages([
        ...newMessages,
        {
          text: `Thank you for reporting the issue with your ${currentCar}. Our team will look into it.`,
          sender: "bot",
        },
      ]);
      setCurrentCar("");
    }
  };

  const handleOptionClick = (option: string) => {
    setMessages([...messages, { text: option, sender: "user" }]);
    if (!currentCar) {
      setCurrentCar(option);
      setMessages((prev) => [
        ...prev,
        {
          text: `Great! What issue are you experiencing with your ${option}?`,
          sender: "bot",
          options: carData.issues,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          text: `Thank you for reporting the ${option} issue with your ${currentCar}. Our team will look into it.`,
          sender: "bot",
        },
      ]);
      setCurrentCar("");
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-gray-100 rounded-lg shadow-lg overflow-hidden">
      <div id="chat-container" className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
            >
              <p>{message.text}</p>
              {message.options && (
                <div className="mt-2 space-y-2">
                  {message.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleOptionClick(option)}
                      className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-white">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 focus:outline-none"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 focus:outline-none"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
