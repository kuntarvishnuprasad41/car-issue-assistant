// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import carData from "../app/data/carData.json";
import {
  RepairInfo,
  RepairIssue,
  RepairStatus,
  Message,
} from "../types/repairTypes";

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
    repairIssues: [],
  });
  const [currentStep, setCurrentStep] = useState<
    | "car"
    | "issues"
    | "customerName"
    | "customerMobile"
    | "priorities"
    | "estimatedTime"
    | "repairStatus"
    | "spareParts"
    | "newIssues"
    | "complete"
    | "selectIssue"
    | "continueRepair"
  >("car");
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
  const [currentIssue, setCurrentIssue] = useState<RepairIssue | null>(null);

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
      case "repairStatus":
        handleRepairStatusSubmit();
        break;
      case "spareParts":
        handleSparePartsSubmit();
        break;
      case "newIssues":
        handleNewIssuesSubmit();
        break;
      case "selectIssue":
        handleSelectIssue();
        break;
      case "continueRepair":
        if (input.toLowerCase() === "yes") {
          selectNextIssue();
        } else {
          finishRepairProcess();
        }
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

    setRepairInfo((prev) => ({
      ...prev,
      issuePriorities: priorities,
      repairIssues: selectedIssues.map((issue) => ({
        issue,
        status: "not started",
      })),
    }));
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
    setMessages((prev) => [
      ...prev,
      { text: input, sender: "user" },
      {
        text: `Estimated completion time set. Let's start with the first repair issue. What's the status of "${repairInfo.repairIssues[0].issue}"?`,
        sender: "bot",
        options: [
          "not started",
          "in progress",
          "on hold",
          "completed",
          "pending parts",
        ],
      },
    ]);
    setCurrentStep("repairStatus");
    setInput("");
  };

  const handleRepairStatusSubmit = () => {
    if (!currentIssue) return;

    const updatedRepairIssues = repairInfo.repairIssues.map((issue) =>
      issue.issue === currentIssue.issue
        ? { ...issue, status: input as RepairStatus }
        : issue
    );

    setRepairInfo((prev) => ({ ...prev, repairIssues: updatedRepairIssues }));

    if (input === "pending parts") {
      setMessages((prev) => [
        ...prev,
        { text: input, sender: "user" },
        {
          text: `What spare parts are needed for "${currentIssue.issue}"? (Enter comma-separated list)`,
          sender: "bot",
          inputType: "text",
          inputPlaceholder: "Enter needed spare parts",
        },
      ]);
      setCurrentStep("spareParts");
    } else {
      selectNextIssue();
    }
    setInput("");
  };

  const handleSparePartsSubmit = () => {
    if (!currentIssue) return;

    const updatedRepairIssues = repairInfo.repairIssues.map((issue) =>
      issue.issue === currentIssue.issue
        ? { ...issue, spareParts: input.split(",").map((part) => part.trim()) }
        : issue
    );

    setRepairInfo((prev) => ({ ...prev, repairIssues: updatedRepairIssues }));
    selectNextIssue();
    setInput("");
  };

  const selectNextIssue = () => {
    setMessages((prev) => [
      ...prev,
      {
        text: `Which issue would you like to work on next?`,
        sender: "bot",
        options: repairInfo.repairIssues.map((issue) => issue.issue),
      },
    ]);
    setCurrentStep("selectIssue");
  };

  const handleSelectIssue = () => {
    const selectedIssue = repairInfo.repairIssues.find(
      (issue) => issue.issue === input
    );
    if (selectedIssue) {
      setCurrentIssue(selectedIssue);
      const highestPriority = Math.min(
        ...Object.values(repairInfo.issuePriorities)
      );
      const isHighestPriority =
        repairInfo.issuePriorities[selectedIssue.issue] === highestPriority;

      let message = `You've selected to work on "${selectedIssue.issue}". `;
      if (!isHighestPriority) {
        message += `Warning: This is not the highest priority issue. `;
      }
      message += `What's the current status of this issue?`;

      setMessages((prev) => [
        ...prev,
        { text: input, sender: "user" },
        {
          text: message,
          sender: "bot",
          options: [
            "not started",
            "in progress",
            "on hold",
            "completed",
            "pending parts",
          ],
        },
      ]);
      setCurrentStep("repairStatus");
    } else {
      setMessages((prev) => [
        ...prev,
        { text: input, sender: "user" },
        { text: "Invalid issue selected. Please try again.", sender: "bot" },
      ]);
    }
    setInput("");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const moveToNextIssueOrFinish = () => {
    if (currentIssueIndex < repairInfo.repairIssues.length - 1) {
      setCurrentIssueIndex((prev) => prev + 1);
      const nextIssue = repairInfo.repairIssues[currentIssueIndex + 1];
      setMessages((prev) => [
        ...prev,
        {
          text: `Moving to the next issue. What's the status of "${nextIssue.issue}"?`,
          sender: "bot",
          options: [
            "not started",
            "in progress",
            "on hold",
            "completed",
            "pending parts",
          ],
        },
      ]);
      setCurrentStep("repairStatus");
    } else {
      setMessages((prev) => [
        ...prev,
        {
          text: `All reported issues have been updated. Are there any new issues discovered during the repair? (Yes/No)`,
          sender: "bot",
          options: ["Yes", "No"],
        },
      ]);
      setCurrentStep("newIssues");
    }
  };

  const handleNewIssuesSubmit = () => {
    if (input.toLowerCase() === "yes") {
      setMessages((prev) => [
        ...prev,
        { text: input, sender: "user" },
        {
          text: `What new issue have you discovered? (Enter one at a time)`,
          sender: "bot",
          inputType: "text",
          inputPlaceholder: "Enter new issue",
        },
      ]);
      setInput("");
    } else {
      finishRepairProcess();
    }
  };

  const finishRepairProcess = () => {
    const allIssuesCompleted = repairInfo.repairIssues.every(
      (issue) => issue.status === "completed"
    );

    if (!allIssuesCompleted) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Not all issues are completed. Do you want to continue working on the remaining issues? (Yes/No)",
          sender: "bot",
          options: ["Yes", "No"],
        },
      ]);
      setCurrentStep("continueRepair");
      return;
    }

    const summary = `
      Repair order summary:

      Car Model: ${currentCar}
      Customer Name: ${repairInfo.customerName}
      Customer Contact: ${repairInfo.customerMobile}
      Estimated Completion Time: ${repairInfo.estimatedCompletionTime}

      Repair Issues:
      ${repairInfo.repairIssues
        .map(
          (issue, index) =>
            `${index + 1}. ${issue.issue} (Priority: ${
              repairInfo.issuePriorities[issue.issue]
            })
         Status: ${issue.status}
         ${
           issue.spareParts
             ? `Spare Parts Needed: ${issue.spareParts.join(", ")}`
             : ""
         }`
        )
        .join("\n")}

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
    } else if (
      ["repairStatus", "newIssues", "selectIssue", "continueRepair"].includes(
        currentStep
      )
    ) {
      setInput(option);
      handleSubmit(new Event("submit") as React.FormEvent);
    }
  };

  const handleCallCustomer = () => {
    window.location.href = `tel:${repairInfo.customerMobile}`;
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
      {repairInfo.customerMobile && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleCallCustomer}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
          >
            Call Customer: {repairInfo.customerMobile}
          </button>
        </div>
      )}
    </div>
  );
}
