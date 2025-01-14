"use client";

import React, { useState, useEffect } from "react";
import carData from "../app/data/carData.json";

type Message = {
  text: string;
  sender: "user" | "bot";
  options?: string[];
  isMultiSelect?: boolean;
  inputType?: "text" | "tel" | "number";
  inputPlaceholder?: string;
};

type RepairInfo = {
  customerName: string;
  customerMobile: string;
  issuePriorities: { [key: string]: number };
  estimatedCompletionTime: string;
};

export default function CarIssueAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome! Please enter the car model for repair:", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [currentCar, setCurrentCar] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [repairInfo, setRepairInfo] = useState<RepairInfo>({
    customerName: "",
    customerMobile: "",
    issuePriorities: {},
    estimatedCompletionTime: "",
  });
  const [currentStep, setCurrentStep] = useState<
    | "car"
    | "issues"
    | "customerName"
    | "customerMobile"
    | "priorities"
    | "estimatedTime"
    | "complete"
  >("car");

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

    switch (currentStep) {
      case "car":
        handleCarSubmit();
        break;
      case "issues":
        handleIssuesSubmit();
        break;
      case "customerName":
        handleCustomerNameSubmit();
        break;
      case "customerMobile":
        handleCustomerMobileSubmit();
        break;
      case "priorities":
        handlePrioritiesSubmit();
        break;
      case "estimatedTime":
        handleEstimatedTimeSubmit();
        break;
    }
  };

  const handleCarSubmit = () => {
    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);

    const exactMatch = carData.cars.find(
      (model) => model.toLowerCase() === input.toLowerCase()
    );

    if (exactMatch) {
      setCurrentCar(exactMatch);
      setMessages([
        ...newMessages,
        {
          text: `Identified: ${exactMatch}. What issues need to be addressed? (Select all that apply)`,
          sender: "bot",
          options: carData.issues,
          isMultiSelect: true,
        },
      ]);
      setCurrentStep("issues");
    } else {
      const similarModels = findSimilarModels(input);
      if (similarModels.length > 0) {
        setMessages([
          ...newMessages,
          {
            text: "No exact match found. Did you mean one of these models?",
            sender: "bot",
            options: similarModels,
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            text: "No matching car models found. Please check the model and try again.",
            sender: "bot",
          },
        ]);
      }
    }
    setInput("");
  };

  const handleIssuesSubmit = () => {
    if (selectedIssues.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Please select at least one issue before proceeding.",
          sender: "bot",
        },
      ]);
      return;
    }

    const issuesText = selectedIssues.join(", ");
    setMessages((prev) => [
      ...prev,
      { text: issuesText, sender: "user" },
      {
        text: `Noted issues for ${currentCar}:\n${selectedIssues.join(
          "\n"
        )}.\nPlease enter the customer's name:`,
        sender: "bot",
        inputType: "text",
        inputPlaceholder: "Enter customer's name",
      },
    ]);
    setCurrentStep("customerName");
    setInput("");
  };

  const handleCustomerNameSubmit = () => {
    setRepairInfo((prev) => ({ ...prev, customerName: input }));
    setMessages((prev) => [
      ...prev,
      { text: input, sender: "user" },
      {
        text: `Customer name recorded. Please enter the customer's contact number:`,
        sender: "bot",
        inputType: "tel",
        inputPlaceholder: "Enter customer's contact number",
      },
    ]);
    setCurrentStep("customerMobile");
    setInput("");
  };

  const handleCustomerMobileSubmit = () => {
    setRepairInfo((prev) => ({ ...prev, customerMobile: input }));
    setMessages((prev) => [
      ...prev,
      { text: input, sender: "user" },
      {
        text: `Contact number recorded. Please prioritize the repair issues (1 being highest priority):`,
        sender: "bot",
        options: selectedIssues,
        isMultiSelect: false,
      },
    ]);
    setCurrentStep("priorities");
    setInput("");
  };

  const handlePrioritiesSubmit = () => {
    const priorities = selectedIssues.reduce((acc, issue, index) => {
      acc[issue] = parseInt(input.split(",")[index]) || index + 1;
      return acc;
    }, {} as { [key: string]: number });

    setRepairInfo((prev) => ({ ...prev, issuePriorities: priorities }));
    setMessages((prev) => [
      ...prev,
      { text: input, sender: "user" },
      {
        text: `Priorities set. What's the estimated completion time for the repairs?`,
        sender: "bot",
        inputType: "text",
        inputPlaceholder: "Enter estimated completion time",
      },
    ]);
    setCurrentStep("estimatedTime");
    setInput("");
  };

  const handleEstimatedTimeSubmit = () => {
    setRepairInfo((prev) => ({ ...prev, estimatedCompletionTime: input }));
    const summary = `
      Repair order summary:

      Car Model: ${currentCar}
      Issues to address: ${selectedIssues.join(", ")}
      Customer Name: ${repairInfo.customerName}
      Customer Contact: ${repairInfo.customerMobile}
      Repair Priorities: ${Object.entries(repairInfo.issuePriorities)
        .map(([issue, priority]) => `${issue} (${priority})`)
        .join(", ")}
      Estimated Completion Time: ${input}

      Repair order logged. Proceed with the repairs as prioritized.
    `;
    setMessages((prev) => [
      ...prev,
      { text: input, sender: "user" },
      { text: summary, sender: "bot" },
    ]);
    setCurrentStep("complete");
    setInput("");
  };

  const handleOptionClick = (option: string) => {
    if (currentStep === "car") {
      setCurrentCar(option);
      setMessages((prev) => [
        ...prev,
        { text: option, sender: "user" },
        {
          text: `Identified: ${option}. What issues need to be addressed? (Select all that apply)`,
          sender: "bot",
          options: carData.issues,
          isMultiSelect: true,
        },
      ]);
      setCurrentStep("issues");
    } else if (currentStep === "issues") {
      setSelectedIssues((prev) =>
        prev.includes(option)
          ? prev.filter((issue) => issue !== option)
          : [...prev, option]
      );
    } else if (currentStep === "priorities") {
      const currentPriorities = input ? input.split(",") : [];
      const newPriorities = [...currentPriorities];
      const index = selectedIssues.indexOf(option);
      newPriorities[index] =
        (currentPriorities[index] % selectedIssues.length) + 1;
      setInput(newPriorities.join(","));
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
                        {message.isMultiSelect ? (
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
                        ) : (
                          <div className="w-4 h-4 border rounded mr-2 flex items-center justify-center">
                            {input.split(",")[optionIndex]}
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
            type={messages[messages.length - 1].inputType || "text"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 focus:outline-none"
            placeholder={
              messages[messages.length - 1].inputPlaceholder ||
              "Enter information..."
            }
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
            Submit
          </button>
        </div>
        {currentStep === "issues" && selectedIssues.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Selected issues: {selectedIssues.join(", ")}
          </div>
        )}
      </form>
    </div>
  );
}
