"use client";

import { useState, useRef } from "react";

const Sidebar = ({ onAddText, onAddImage, onAddShape }) => {
  const [activePanel, setActivePanel] = useState(null);
  const fileInputRef = useRef(null);

  const renderPanelContent = () => {
    switch (activePanel) {
      case "images":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Images</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded mb-4"
            >
              Upload Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onAddImage) {
                  onAddImage(file);
                  e.target.value = ""; // Reset input
                }
              }}
            />
            <div className="text-xs text-gray-400">Select an image from your device</div>
          </div>
        );

      case "text":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Text Options</h3>
            <button
              onClick={onAddText}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded mb-2"
            >
              Add Text Box
            </button>
          </div>
        );

      case "shapes":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Shapes</h3>
            <div className="space-y-2">
              <button
                onClick={() => onAddShape("rect")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
              >
                Rectangle
              </button>
              <button
                onClick={() => onAddShape("circle")}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white p-2 rounded"
              >
                Circle
              </button>
              <button
                onClick={() => onAddShape("triangle")}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded"
              >
                Triangle
              </button>
            </div>
          </div>
        );

      case "templates":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Templates</h3>
            <div className="space-y-2">
              <div className="bg-gray-700 p-2 rounded text-center">Template 1</div>
              <div className="bg-gray-700 p-2 rounded text-center">Template 2</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  return (
    <div className="flex">
      <div className="w-2sm h-screen bg-gray-800 text-white p-4 flex flex-col">
        <nav className="space-y-2 flex-1">
          {[
            { id: "templates", label: "Templates" },
            { id: "images", label: "Images" },
            { id: "text", label: "Text" },
            { id: "shapes", label: "Shapes" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => togglePanel(item.id)}
              className={`w-full text-left flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                activePanel === item.id ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activePanel && (
        <div className="w-64 h-screen bg-gray-900 text-white shadow-lg">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-bold capitalize">{activePanel}</h2>
            <button
              onClick={() => setActivePanel(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          {renderPanelContent()}
        </div>
      )}

    </div>
  );
};

export default Sidebar;
