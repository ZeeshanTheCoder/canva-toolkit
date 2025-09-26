// components/FabricCanvas.js
"use client";

import { useEffect, useRef, forwardRef } from "react";

const FabricCanvas = forwardRef(({ width = 1200, height = 800 }, ref) => {
  const canvasRef = useRef(null);
  const historyRef = useRef([]); // For undo/redo
  const historyStep = useRef(0);

  useEffect(() => {
    import("fabric").then((fabricModule) => {
      const fabric =
        fabricModule.fabric || fabricModule.default || fabricModule;
      if (!fabric || typeof fabric.Canvas !== "function") return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "#ffffff", // Keep white background
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
          getActiveObjectType: () => {
            const active = canvas.getActiveObject();
            return active ? active.type : null;
          },
          getImageOpacity: () => {
            const active = canvas.getActiveObject();
            if (active && active.type === "image") {
              return active.opacity;
            }
            return 1;
          },
          setImageOpacity: (opacity) => {
            const active = canvas.getActiveObject();
            if (active && active.type === "image") {
              active.set({ opacity: parseFloat(opacity) });
              canvas.requestRenderAll();
              saveState();
            }
          },
          toggleTextStyle: (property) => {
            const active = canvas.getActiveObject();
            if (active && active.type === "textbox") {
              const start = active.selectionStart;
              const end = active.selectionEnd;
              const styles = active.getSelectionStyles(start, end);
              const hasStyle = Object.values(styles).some(
                (s) => s && s[property] !== undefined
              );

              if (hasStyle) {
                for (let i = start; i < end; i++) {
                  active.removeStyle(property, i);
                }
              } else {
                let value;
                if (property === "fontWeight") value = "bold";
                else if (property === "fontStyle") value = "italic";
                else if (property === "underline") value = true;
                else return;

                active.setSelectionStyles({ [property]: value }, start, end);
              }
              canvas.requestRenderAll();
              saveState();
            }
          },
          updateTextStyle: (style) => {
            const active = canvas.getActiveObject();
            if (active && active.type === "textbox") {
              // ✅ Safe check
              active.set(style);
              canvas.requestRenderAll();
              saveState();
            }
          },
          setBackgroundColor: (color) => {
            canvas.backgroundColor = color;
            canvas.renderAll();
            saveState();
          },
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
    <div
      className="relative"
      style={{
        width: width,
        height: height,
      }}
    >
      {/* ✅ Purple margins — always on top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: "40px solid #7B68EE",
          boxSizing: "border-box",
          zIndex: 10,
          margin: "10px"
        }}
      ></div>
      {/* ✅ Center vertical line */}
      <div
        className="absolute top-0 m-4 bottom-0 left-1/2 transform -translate-x-1/2 w-20 bg-[#7B68EE] pointer-events-none z-10"
        style={{ zIndex: 10 }}
      ></div>

      {/* ✅ Canvas — below margins */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300"
        style={{ display: "block", position: "relative", zIndex: 1 }}
      />
    </div>
  );
});

FabricCanvas.displayName = "FabricCanvas";
export default FabricCanvas;
