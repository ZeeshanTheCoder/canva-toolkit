"use client";

import Sidebar from "@/components/Sidebar";
import FabricCanvas from "@/components/FabricCanvas";
import { useRef, useState, useCallback, useEffect } from "react"; // ✅ useEffect hata diya

const Home = () => {
  const canvasWrapperRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(0.5);

  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(1);

  // Add this effect to track selection
  useEffect(() => {
    let interval;
    const setupSelectionListener = () => {
      const wrapper = canvasWrapperRef.current;
      if (!wrapper || !wrapper.canvas) {
        // Retry after 100ms
        return;
      }

      const canvas = wrapper.canvas;

      const checkSelection = () => {
        const active = canvas.getActiveObject();

        if (active && active.type === "image") {
          // ✅ Capital "I"
          setShowOpacitySlider(true);
          setImageOpacity(active.opacity || 1);
        } else {
          setShowOpacitySlider(false);
        }
      };

      // Initial check
      checkSelection();

      // Listen to selection events
      canvas.on("selection:created", checkSelection);
      canvas.on("selection:updated", checkSelection);
      canvas.on("selection:cleared", () => setShowOpacitySlider(false));

      // Clear interval once set up
      if (interval) clearInterval(interval);

      // Cleanup
      return () => {
        canvas.off("selection:created", checkSelection);
        canvas.off("selection:updated", checkSelection);
        canvas.off("selection:cleared", () => setShowOpacitySlider(false));
      };
    };

    // Try immediately
    const cleanup = setupSelectionListener();

    if (!cleanup) {
      // If not ready, retry every 100ms
      interval = setInterval(() => {
        const cleanup = setupSelectionListener();
        if (cleanup) {
          clearInterval(interval);
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  // Opacity handler
  const handleOpacityChange = (value) => {
    const opacity = parseFloat(value);
    setImageOpacity(opacity);
    canvasWrapperRef.current?.setImageOpacity(opacity);
  };

  // === Existing functions: addTextToCanvas, addImageToCanvas, addShapeToCanvas ===
  const addTextToCanvas = () => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    const { canvas, fabric } = wrapper;
    const text = new fabric.Textbox("Your Text", {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: "#000",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addImageToCanvas = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const wrapper = canvasWrapperRef.current;
      if (!wrapper || typeof wrapper.addImage !== "function") {
        setTimeout(() => addImageToCanvas(file), 100);
        return;
      }
      wrapper.addImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const addShapeToCanvas = (type) => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    const { canvas, fabric } = wrapper;
    let shape;
    switch (type) {
      case "rect":
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          fill: "#4A90E2",
          width: 80,
          height: 60,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          left: 140,
          top: 100,
          fill: "#7ED321",
          radius: 40,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          left: 100,
          top: 100,
          fill: "#D0021B",
          width: 80,
          height: 100,
        });
        break;
      default:
        return;
    }
    canvas.add(shape);
    canvas.setActiveObject(shape);
  };

  // New: Download
  const downloadPNG = () => {
    canvasWrapperRef.current?.downloadPNG();
  };

  // New: Undo/Redo
  const undo = () => canvasWrapperRef.current?.undo();
  const redo = () => canvasWrapperRef.current?.redo();

  // Zoom
  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoomLevel(1);

  const [bgColor, setBgColor] = useState("#ffffff");

  const updateTextStyle = (style) => {
    canvasWrapperRef.current?.updateTextStyle(style);
  };

  const changeBackgroundColor = (color) => {
    setBgColor(color);
    canvasWrapperRef.current?.setBackgroundColor(color);
  };

  const toggleBold = () => {
  const wrapper = canvasWrapperRef.current;
  if (!wrapper) return;
  const active = wrapper.canvas?.getActiveObject();
  if (active && active.type === "textbox") {
    wrapper.toggleTextStyle("fontWeight");
  }
};

const toggleItalic = () => {
  const wrapper = canvasWrapperRef.current;
  if (!wrapper) return;
  const active = wrapper.canvas?.getActiveObject();
  if (active && active.type === "textbox") {
    wrapper.toggleTextStyle("fontStyle");
  }
};

const toggleUnderline = () => {
  const wrapper = canvasWrapperRef.current;
  if (!wrapper) return;
  const active = wrapper.canvas?.getActiveObject();
  if (active && active.type === "textbox") {
    wrapper.toggleTextStyle("underline");
  }
};

  const changeTextColor = (color) => {
    canvasWrapperRef.current?.updateTextStyle({ fill: color });
  };

  const changeFontSize = (size) => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    const active = wrapper.canvas?.getActiveObject();
    if (!active || active.type !== "textbox") {
      // Optional: show message
      console.warn("Please select a text box to change font size");
      return;
    }

    wrapper.updateTextStyle({ fontSize: parseInt(size) });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-200">
      {/* Top Toolbar */}
      <div className="bg-white p-2 flex flex-wrap gap-2 border-b">
        {/* Undo/Redo */}
        <button
          onClick={undo}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Undo
        </button>
        <button
          onClick={redo}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Redo
        </button>

        <div className="border-l mx-2"></div>

        {/* Text Toggles */}
        <button
          onClick={toggleBold}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs font-bold"
        >
          B
        </button>
        <button
          onClick={toggleItalic}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs italic"
        >
          I
        </button>
        <button
          onClick={toggleUnderline}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs underline"
        >
          U
        </button>

        {/* Font Size with editable input */}
        <div className="flex items-center gap-1">
          <span className="text-xs">Size:</span>
          <input
            type="number"
            min="8"
            max="100"
            defaultValue="24"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = parseInt(e.currentTarget.value, 10);
                if (!isNaN(value)) {
                  const clamped = Math.min(Math.max(value, 8), 100);
                  changeFontSize(clamped); // ✅ Now safe
                  e.currentTarget.value = clamped;
                }
                e.currentTarget.blur();
              }
            }}
            className="w-16 p-1 border rounded text-xs"
          />
        </div>

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <span className="text-xs">Color:</span>
          <div className="flex gap-1">
            {[
              "#000000",
              "#FF0000",
              "#00FF00",
              "#0000FF",
              "#FFFF00",
              "#FF00FF",
            ].map((color) => (
              <button
                key={color}
                onClick={() => changeTextColor(color)}
                className="w-5 h-5 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            onChange={(e) => changeTextColor(e.target.value)}
            className="w-6 h-6 cursor-pointer rounded-full border border-gray-300"
          />
        </div>

        {/* Background Color (same as before) */}
        <div className="border-l mx-2"></div>
        <div className="flex items-center gap-1">
          <span className="text-xs self-center">BG:</span>
          <div className="flex gap-1">
            {[
              "#ffffff",
              "#f0f0f0",
              "#e0e0e0",
              "#000000",
              "#ffcccc",
              "#ccffcc",
            ].map((color) => (
              <button
                key={color}
                onClick={() => changeBackgroundColor(color)}
                className="w-5 h-5 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => changeBackgroundColor(e.target.value)}
            className="w-6 h-6 cursor-pointer rounded-full border border-gray-300"
          />
        </div>

        {showOpacitySlider && (
          <>
            <div className="border-l mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Opacity:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={imageOpacity}
                onChange={(e) => handleOpacityChange(e.target.value)}
                className="w-20"
              />
              <span className="text-xs w-8">
                {Math.round(imageOpacity * 100)}%
              </span>
            </div>
          </>
        )}

        <div className="border-l mx-2"></div>
        <button
          onClick={downloadPNG}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Download PNG
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onAddText={addTextToCanvas}
          onAddImage={addImageToCanvas}
          onAddShape={addShapeToCanvas}
        />
        <div className="flex-1 bg-gray-100 p-4 flex items-center justify-center relative">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={zoomOut}
              className="bg-gray-800 text-white p-2 rounded text-lg"
            >
              −
            </button>
            <button
              onClick={resetZoom}
              className="bg-gray-700 text-white p-2 rounded"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={zoomIn}
              className="bg-gray-800 text-white p-2 rounded text-lg"
            >
              +
            </button>
          </div>

          {/* ✅ Scale the entire container */}
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center",
              width: 1200,
              height: 800,
            }}
          >
            <div className="bg-white shadow rounded">
              <FabricCanvas width={1200} height={800} ref={canvasWrapperRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
