"use client";

import { useState, useRef } from "react";
import {
  FaSquare,
  FaRegSquare,
  FaCircle,
  FaEllipsisH,
  FaPlay,
  FaStar,
  FaStop,
  FaHexagon,
  FaDiceSix,
  FaShieldAlt,
  FaArrowRight,
  FaMinus,
  FaRegSquare as FaDashedSquare,
} from "react-icons/fa";
import { RiArrowUpDownLine } from "react-icons/ri";

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
            <div className="text-xs text-gray-400">
              Select an image from your device
            </div>
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

      // components/Sidebar.js
      case "shapes":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Shapes</h3>
            <div className="grid grid-cols-2 gap-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
              {/* Square */}
              <button
                onClick={() => onAddShape("square")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <div className="w-8 h-8 bg-[#D1D6E0] group-hover:bg-[#0A0083]"></div>
                <span className="text-xs mt-1 ">Square</span>
              </button>

              {/* Rounded Rectangle */}
              <button
                onClick={() => onAddShape("rounded-rect")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <div className="w-8 h-8 bg-[#D1D6E0] group-hover:bg-[#0A0083] rounded-md"></div>
                <span className="text-xs mt-1 ">Rounded</span>
              </button>

              {/* Circle */}
              <button
                onClick={() => onAddShape("circle")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded group flex flex-col items-center"
              >
                <div className="w-8 h-8 bg-[#D1D6E0] group-hover:bg-[#0A0083] rounded-full"></div>
                <span className="text-xs mt-1 ">Circle</span>
              </button>

              {/* Oval */}
              <button
                onClick={() => onAddShape("oval")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <ellipse cx="16" cy="16" rx="10" ry="16" fill="currentColor" />
                </svg>
                <span className="text-xs mt-1 ">Oval</span>
              </button>

              {/* Triangle */}
              <button
                onClick={() => onAddShape("triangle")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <polygon points="16,4 4,28 28,28" fill="currentColor" />
                </svg>
                <span className="text-xs mt-1 ">Triangle</span>
              </button>

              {/* Diamond */}
              <button
                onClick={() => onAddShape("diamond")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <rect
                    x="8"
                    y="8"
                    width="16"
                    height="16"
                    fill="currentColor"
                    transform="rotate(45 16 16)"
                  />
                </svg>
                <span className="text-xs mt-1 ">Diamond</span>
              </button>

              {/* Star */}
              <button
                onClick={() => onAddShape("star")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <polygon
                    points="16,4 19,12 28,12 21,17 24,25 16,20 8,25 11,17 4,12 13,12"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs mt-1 ">Star</span>
              </button>

              {/* Pentagon */}
              <button
                onClick={() => onAddShape("pentagon")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[D1D6E0] group-hover:text-[#0A0083]"
                >
                  <polygon
                    points="16,4 26,10 22,22 10,22 6,10"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs mt-1 ">Pentagon</span>
              </button>

              {/* Hexagon */}
              <button
                onClick={() => onAddShape("hexagon")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <polygon
                    points="16,4 26,9 26,23 16,28 6,23 6,9"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs mt-1 ">Hexagon</span>
              </button>

              {/* Octagon */}
              <button
                onClick={() => onAddShape("octagon")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <polygon
                    points="12,4 20,4 28,12 28,20 20,28 12,28 4,20 4,12"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs mt-1 ">Octagon</span>
              </button>

              {/* Row 13 - Badge */}
              <button
                onClick={() => onAddShape("badge")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <path
                    d="M16,8 L28,8 L28,24 L16,32 L4,24 L4,8 Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs mt-1 ">Badge</span>
              </button>

              <button
                onClick={() => onAddShape("ribbon")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <path
                    d="M16,6 L28,6 L28,30 L16,22 L4,30 L4,6 Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-xs mt-1 ">Ribbon</span>
              </button>

              {/* Arrow */}
              <button
                onClick={() => onAddShape("arrow")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <polygon
                    points="0,30 60,30 60,10 100,50 60,90 60,70 0,70"
                    fill="currentColor"
                    transform="scale(0.3) translate(5,5)"
                  />
                </svg>
                <span className="text-xs mt-1 ">Arrow</span>
              </button>

              {/* Line */}
              <button
                onClick={() => onAddShape("line")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  <line
                    x1="4"
                    y1="16"
                    x2="28"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
                <span className="text-xs mt-1 ">Line</span>
              </button>

              {/* Dashed Line */}
              <button
                onClick={() => onAddShape("dashed-line")}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 group rounded flex flex-col items-center"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-[#D1D6E0] group-hover:text-[#0A0083]"
                >
                  {/* 7 dots — each 1px wide, 3px gap */}
                  <line
                    x1="4"
                    y1="16"
                    x2="28"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="1,3"
                  />
                </svg>
                <span className="text-xs mt-1 ">Dotted</span>
              </button>
            </div>
          </div>
        );

      case "templates":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Templates</h3>
            <div className="space-y-2">
              <div className="bg-gray-700 p-2 rounded text-center">
                Template 1
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                Template 2
              </div>
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
