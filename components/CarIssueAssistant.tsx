"use client";

import React, { useState, useEffect } from "react";
import carData from "../app/data/carData.json";

type Message = {
  text: string;
  sender: "user" | "bot";
  options?: string[];
  isMultiSelect?: boolean;
};

export default function CarIssueAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome! Please enter your car model:", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [currentCar, setCurrentCar] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

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
    if (!input.trim() && selectedIssues.length === 0) return;

    if (currentCar && selectedIssues.length > 0) {
      // Submit selected issues
      const issuesText = selectedIssues.join(", ");
      setMessages((prev) => [
        ...prev,
        { text: issuesText, sender: "user" },
        {
          text: `Thank you for reporting the following issues with the ${currentCar}:\n${selectedIssues.join(
            "\n"
          )}.\nThis will be added to your checklist and job sheet.`,
          sender: "bot",
        },
      ]);
      setCurrentCar("");
      setSelectedIssues([]);
      setInput("");
      return;
    }

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
            text: `Great! What issues are you experiencing with your ${exactMatch}? (Select all that apply)`,
            sender: "bot",
            options: carData.issues,
            isMultiSelect: true,
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
    }
  };

  const handleOptionClick = (option: string) => {
    if (!currentCar) {
      setCurrentCar(option);
      setMessages((prev) => [
        ...prev,
        { text: option, sender: "user" },
        {
          text: `Great! What issues are you experiencing with your ${option}? (Select all that apply)`,
          sender: "bot",
          options: carData.issues,
          isMultiSelect: true,
        },
      ]);
    } else {
      // Toggle issue selection
      setSelectedIssues((prev) =>
        prev.includes(option)
          ? prev.filter((issue) => issue !== option)
          : [...prev, option]
      );
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
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
                  : "bg-gray-100"
              }`}
            >
              <p className="whitespace-pre-line">{message.text}</p>
              {message.options && (
                <div className="mt-2 space-y-2">
                  {message.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleOptionClick(option)}
                      className={`block w-full text-left p-2 rounded text-gray-800 border transition-colors ${
                        message.isMultiSelect && selectedIssues.includes(option)
                          ? "bg-blue-100 border-blue-500"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        {message.isMultiSelect && (
                          <div
                            className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                              selectedIssues.includes(option)
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedIssues.includes(option) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                        )}
                        {option}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 focus:outline-none"
            placeholder={
              currentCar && selectedIssues.length > 0
                ? "Press Send to submit issues"
                : "Type your message..."
            }
            disabled={currentCar && selectedIssues.length > 0}
          />
          <button
            type="submit"
            className={`px-6 py-2 text-white focus:outline-none ${
              !input.trim() && selectedIssues.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={!input.trim() && selectedIssues.length === 0}
          >
            {currentCar && selectedIssues.length > 0 ? "Submit" : "Send"}
          </button>
        </div>
        {currentCar && selectedIssues.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Selected issues: {selectedIssues.join(", ")}
          </div>
        )}
      </form>
    </div>
  );
}
