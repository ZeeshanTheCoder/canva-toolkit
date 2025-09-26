// components/FabricCanvas.js
"use client";

import { useEffect, useRef, forwardRef } from "react";

const FabricCanvas = forwardRef(({ width = 600, height = 800 }, ref) => {
  const canvasRef = useRef(null);
  const historyRef = useRef([]); // For undo/redo
  const historyStep = useRef(0);

  useEffect(() => {
    import("fabric").then((fabricModule) => {
      const fabric =
        fabricModule.fabric || fabricModule.default || fabricModule;
      if (!fabric || typeof fabric.Canvas !== "function") return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        width: width,
        height: height,
        selection: true,
        preserveObjectStacking: true,
      });

      // 🔁 Undo/Redo with DEBOUNCE
      const history = [];
      let historyStep = -1;
      let debounceTimer = null;

      const saveState = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (historyStep < history.length - 1) {
            history.splice(historyStep + 1);
          }
          history.push(JSON.stringify(canvas.toJSON()));
          historyStep = history.length - 1;
        }, 300); // Wait 300ms after last change
      };

      canvas.on("object:modified", saveState);
      canvas.on("object:added", saveState);
      canvas.on("object:removed", saveState);

      // Initial state
      setTimeout(saveState, 100);

      // Undo / Redo functions
      const undo = () => {
        if (historyStep > 0) {
          historyStep--;
          canvas.loadFromJSON(
            history[historyStep],
            canvas.renderAll.bind(canvas)
          );
        }
      };

      const redo = () => {
        if (historyStep < history.length - 1) {
          historyStep++;
          canvas.loadFromJSON(
            history[historyStep],
            canvas.renderAll.bind(canvas)
          );
        }
      };

      // 🔥 Delete + Undo/Redo keys
      const handleKeyDown = (e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          const active = canvas.getActiveObject();
          if (active?.type === "textbox" && active.isEditing) return;
          if (active) canvas.remove(active);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        if (
          (e.ctrlKey || e.metaKey) &&
          (e.key === "y" || (e.shiftKey && e.key === "Z"))
        ) {
          e.preventDefault();
          redo();
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      if (ref) {
        ref.current = {
          canvas,
          fabric,
          addImage: (imageUrl) => {
            const img = new window.Image();
            img.onload = () => {
              const fImg = new fabric.Image(img, {
                left: 100,
                top: 100,
                scaleX: 150 / img.width,
                scaleY: 150 / img.height,
              });
              canvas.add(fImg);
              canvas.setActiveObject(fImg);
              canvas.requestRenderAll();
              saveState(); // 👈 Save after add
            };
            img.src = imageUrl;
          },
          // ✅ Text Styling
          updateTextStyle: (style) => {
            const active = canvas.getActiveObject();
            if (active && active.type === "textbox") {
              active.set(style);
              canvas.requestRenderAll();
              saveState();
            }
          },
          // ✅ Change Canvas Background
          setBackgroundColor: (color) => {
            canvas.backgroundColor = color;
            canvas.renderAll();
            saveState();
          },
          // ✅ Download
          downloadPNG: () => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL({ format: "png" });
            link.download = "design.png";
            link.click();
          },
          undo,
          redo,
          ready: true,
        };
      }

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(debounceTimer);
        canvas.dispose();
      };
    });
  }, [width, height, ref]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-300"
      style={{ display: "block" }}
    />
  );
});

FabricCanvas.displayName = "FabricCanvas";
export default FabricCanvas;
