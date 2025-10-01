"use client";

import Sidebar from "@/components/Sidebar";
import FabricCanvas from "@/components/FabricCanvas";
import { useRef, useState, useCallback, useEffect } from "react"; // ✅ useEffect hata diya

const Home = () => {
  const canvasWrapperRef = useRef(null);
  const canvasLoaded = useRef(false);
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(1);

  // Add this effect to track selection
  useEffect(() => {
    const setupSelectionListener = () => {
      const wrapper = canvasWrapperRef.current;
      if (!wrapper || !wrapper.canvas) return;

      const canvas = wrapper.canvas;

      const checkSelection = () => {
        const active = canvas.getActiveObject();
        if (
          active &&
          (active.type === "image" ||
            active.type === "rect" ||
            active.type === "circle" ||
            active.type === "ellipse" ||
            active.type === "triangle" ||
            active.type === "polygon" ||
            active.type === "line" ||
            active.type === "textbox")
        ) {
          setShowOpacitySlider(true);
          setShowColorPicker(true);
          setImageOpacity(active.opacity || 1);
        } else {
          setShowOpacitySlider(false);
          setShowColorPicker(false);
        }
      };

      // Attach onCanvasReady to trigger check after load
      if (canvasWrapperRef.current) {
        canvasWrapperRef.current.onCanvasReady = () => {
          // Wait a tick for render + selection state
          setTimeout(() => {
            checkSelection(); // ✅ This will show UI if object is auto-selected or exists
          }, 100);
        };
      }

      // Initial check (for dynamically added objects)
      checkSelection();

      const handleSelectionCleared = () => {
        setShowOpacitySlider(false);
        setShowColorPicker(false);
      };

      // Event listeners
      canvas.on("selection:created", checkSelection);
      canvas.on("selection:updated", checkSelection);
      canvas.on("selection:cleared", handleSelectionCleared);

      // Cleanup
      return () => {
        canvas.off("selection:created", checkSelection);
        canvas.off("selection:updated", checkSelection);
        canvas.off("selection:cleared", handleSelectionCleared); // Fixed: was arrow fn before
      };
    };

    // Try immediately
    const cleanup = setupSelectionListener();

    // Fallback poll if canvas not ready yet
    let interval;
    if (!cleanup) {
      interval = setInterval(() => {
        const cln = setupSelectionListener();
        if (cln) clearInterval(interval);
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

    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    const active = wrapper.canvas?.getActiveObject();
    if (!active) return;

    if (active.type === "textbox") {
      // ✅ Apply opacity only to selected text via fill: rgba()
      wrapper.updateSelectedTextStyle({ opacity });
    } else {
      // For shapes/images → use object-level opacity
      active.set({ opacity });
      wrapper.canvas.requestRenderAll();
      wrapper.canvas.fire("object:modified");
    }
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

    // Common position
    const left = 100;
    const top = 100;

    switch (type) {
      case "square":
        shape = new fabric.Rect({
          left,
          top,
          fill: "#FF0000",
          width: 80,
          height: 80,
          originX: "center",
          originY: "center",
        });
        break;

      case "rounded-rect":
        shape = new fabric.Rect({
          left,
          top,
          fill: "#FF0000",
          width: 80,
          height: 60,
          rx: 15,
          ry: 15,
          originX: "center",
          originY: "center",
        });
        break;

      case "circle":
        shape = new fabric.Circle({
          left,
          top,
          fill: "#FF0000",
          radius: 40,
          originX: "center",
          originY: "center",
        });
        break;

      case "oval":
        shape = new fabric.Ellipse({
          left,
          top,
          fill: "#FF0000",
          rx: 40,
          ry: 20,
          originX: "center",
          originY: "center",
        });
        break;

      case "triangle":
        shape = new fabric.Triangle({
          left,
          top,
          fill: "#FF0000",
          width: 80,
          height: 80,
          originX: "center",
          originY: "center",
        });
        break;

      case "diamond":
        shape = new fabric.Polygon(
          [
            { x: 0, y: -40 },
            { x: 40, y: 0 },
            { x: 0, y: 40 },
            { x: -40, y: 0 },
          ],
          {
            left,
            top,
            fill: "#FF0000",
            originX: "center",
            originY: "center",
          }
        );
        break;

      case "star":
        shape = new fabric.Polygon(
          [
            { x: 0, y: -40 },
            { x: 11, y: -12 },
            { x: 40, y: -12 },
            { x: 18, y: 5 },
            { x: 25, y: 40 },
            { x: 0, y: 25 },
            { x: -25, y: 40 },
            { x: -18, y: 5 },
            { x: -40, y: -12 },
            { x: -11, y: -12 },
          ],
          {
            left,
            top,
            fill: "#FF0000",
            originX: "center",
            originY: "center",
          }
        );
        break;

      case "pentagon":
        shape = new fabric.Polygon(
          Array.from({ length: 5 }, (_, i) => {
            const angle = ((i * 72 - 90) * Math.PI) / 180;
            return {
              x: 40 * Math.cos(angle),
              y: 40 * Math.sin(angle),
            };
          }),
          {
            left,
            top,
            fill: "#FF0000",
            originX: "center",
            originY: "center",
          }
        );
        break;

      case "hexagon":
        shape = new fabric.Polygon(
          Array.from({ length: 6 }, (_, i) => {
            const angle = ((i * 60 - 30) * Math.PI) / 180;
            return {
              x: 40 * Math.cos(angle),
              y: 40 * Math.sin(angle),
            };
          }),
          {
            left,
            top,
            fill: "#FF0000",
            originX: "center",
            originY: "center",
          }
        );
        break;

      case "octagon":
        shape = new fabric.Polygon(
          Array.from({ length: 8 }, (_, i) => {
            const angle = ((i * 45 + 22.5) * Math.PI) / 180;
            return {
              x: 40 * Math.cos(angle),
              y: 40 * Math.sin(angle),
            };
          }),
          {
            left,
            top,
            fill: "#FF0000",
            originX: "center",
            originY: "center",
          }
        );
        break;

      case "shield":
        shape = new fabric.Polygon(
          [
            { x: 0, y: -40 },
            { x: 25, y: -15 },
            { x: 15, y: 25 },
            { x: -15, y: 25 },
            { x: -25, y: -15 },
          ],
          {
            left,
            top,
            fill: "#FF0000",
            originX: "center",
            originY: "center",
          }
        );
        break;

      case "badge":
        shape = new fabric.Polygon(
          [
            { x: 0, y: -30 },
            { x: 20, y: -30 },
            { x: 20, y: 10 },
            { x: 0, y: 25 },
            { x: -20, y: 10 },
            { x: -20, y: -30 },
          ],
          {
            left,
            top,
            fill: "#FF0000",
            originX: "center",
            originY: "center",
          }
        );
        break;

      case "ribbon":
        shape = new fabric.Polygon(
          [
            { x: 0, y: -30 },
            { x: 20, y: -30 },
            { x: 20, y: 20 },
            { x: 0, y: 0 },
            { x: -20, y: 20 },
            { x: -20, y: -30 },
          ],
          {
            left,
            top,
            fill: "#FF0000",
            originX: "center",
            originY: "center",
          }
        );
        break;

      case "arrow":
        shape = new fabric.Polygon(
          [
            { x: -30, y: -10 },
            { x: 10, y: -10 },
            { x: 10, y: -20 },
            { x: 30, y: 0 },
            { x: 10, y: 20 },
            { x: 10, y: 10 },
            { x: -30, y: 10 },
          ],
          {
            left,
            top,
            fill: "#FF0000",
            originX: "center",
            originY: "center",
          }
        );
        break;

      case "line":
        shape = new fabric.Line([-40, 0, 40, 0], {
          stroke: "black",
          strokeWidth: 2,
          originX: "center",
          originY: "center",
          left,
          top,
        });
        break;

      case "dashed-line":
        shape = new fabric.Line([-40, 0, 40, 0], {
          stroke: "black",
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          originX: "center",
          originY: "center",
          left,
          top,
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

  const changeFillColor = (color) => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    const active = wrapper.canvas?.getActiveObject();
    if (!active) return;

    if (active.type === "textbox") {
      // ✅ Apply only to selected text
      wrapper.updateSelectedTextStyle({ fill: color });
    } else if (
      active.type === "rect" ||
      active.type === "circle" ||
      active.type === "ellipse" ||
      active.type === "triangle" ||
      active.type === "polygon" ||
      active.type === "line"
    ) {
      active.set({ fill: color });
      wrapper.canvas.requestRenderAll();
      wrapper.canvas.fire("object:modified");
    }
  };

  const changeFontSize = (size) => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    const active = wrapper.canvas?.getActiveObject();
    if (!active || active.type !== "textbox") {
      console.warn("Please select a text box to change font size");
      return;
    }

    // ✅ Apply only to selected text
    wrapper.updateSelectedTextStyle({ fontSize: parseInt(size) });
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

        {/* Fill Color */}

        {(showColorPicker || showOpacitySlider) && (
          <>
            <div className="border-l mx-2"></div>
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
                    onClick={() => changeFillColor(color)}
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                onChange={(e) => changeFillColor(e.target.value)}
                className="w-6 h-6 cursor-pointer rounded-full border border-gray-300"
              />
            </div>
          </>
        )}

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