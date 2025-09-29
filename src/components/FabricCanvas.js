// components/FabricCanvas.js
"use client";

import { useEffect, useRef, forwardRef } from "react";

const FabricCanvas = forwardRef(({ width = 1200, height = 800 }, ref) => {
  const canvasRef = useRef(null);
  const isUndoRedo = useRef(false);

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

      // 🔁 History for undo/redo
      const history = [];
      let historyStep = -1;
      let debounceTimer = null;

      const saveState = () => {
        // 🔒 Skip auto-save during undo/redo
        if (isUndoRedo.current) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (historyStep < history.length - 1) {
            history.splice(historyStep + 1);
          }
          const json = JSON.stringify(canvas.toJSON());
          history.push(json);
          historyStep = history.length - 1;

          try {
            localStorage.setItem("canvasState", json);
            localStorage.setItem("canvasHistory", JSON.stringify(history));
            localStorage.setItem("historyStep", historyStep.toString());
          } catch (e) {
            console.warn("localStorage full or not available");
          }
        }, 300);
      };

      // 🔄 Load from localStorage on init
      const loadFromStorage = () => {
        try {
          const savedState = localStorage.getItem("canvasState");
          const savedHistory = localStorage.getItem("canvasHistory");
          const savedStep = localStorage.getItem("historyStep");

          if (savedState) {
            canvas.loadFromJSON(savedState, () => {
              canvas.renderAll();

              // 👇 Delay setActiveObject to ensure objects are fully ready
              setTimeout(() => {
                const objects = canvas.getObjects();
                if (objects.length > 0) {
                  const lastObject = objects[objects.length - 1];
                  canvas.setActiveObject(lastObject);
                  canvas.requestRenderAll(); // Ensure selection box appears
                }

                // Notify parent AFTER selection is applied
                if (
                  ref?.current &&
                  typeof ref.current.onCanvasReady === "function"
                ) {
                  ref.current.onCanvasReady();
                }
              }, 0); // Even 0ms delay ensures next tick
            });
          }

          if (savedHistory) {
            history.push(...JSON.parse(savedHistory));
            historyStep = savedStep ? parseInt(savedStep) : history.length - 1;
          } else if (savedState) {
            history.push(savedState);
            historyStep = 0;
          }
        } catch (e) {
          console.error("Failed to load from localStorage", e);
        }
      };
      loadFromStorage();

      canvas.on("object:modified", saveState);
      canvas.on("object:added", saveState);
      canvas.on("object:removed", saveState);

      // Undo / Redo
      const undo = () => {
        if (historyStep > 0) {
          isUndoRedo.current = true; // 🔒 Disable save
          historyStep--;
          canvas.loadFromJSON(history[historyStep], () => {
            setTimeout(() => {
              canvas.renderAll();
              const objects = canvas.getObjects();
              if (objects.length > 0) {
                const lastObject = objects[objects.length - 1];
                canvas.setActiveObject(lastObject);
              }
              localStorage.setItem("historyStep", historyStep.toString());
              isUndoRedo.current = false; // ✅ Re-enable save
            }, 0);
          });
        }
      };

      const redo = () => {
        if (historyStep < history.length - 1) {
          isUndoRedo.current = true; // 🔒 Disable save
          historyStep++;
          canvas.loadFromJSON(history[historyStep], () => {
            setTimeout(() => {
              canvas.renderAll();
              const objects = canvas.getObjects();
              if (objects.length > 0) {
                const lastObject = objects[objects.length - 1];
                canvas.setActiveObject(lastObject);
              }
              localStorage.setItem("historyStep", historyStep.toString());
              isUndoRedo.current = false; // ✅ Re-enable save
            }, 0);
          });
        }
      };

      // 🔥 Keyboard shortcuts
      const handleKeyDown = (e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          const active = canvas.getActiveObject();
          if (active?.type === "textbox" && active.isEditing) return;
          if (active) {
            canvas.remove(active);
            saveState();
          }
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
              saveState();
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
              // If text is selected → apply to selection
              if (active.selectionStart !== active.selectionEnd) {
                active.setSelectionStyles(style);
              } else {
                // No selection → apply to whole text
                active.set(style);
              }
              canvas.requestRenderAll();
              saveState();
            }
          },

          // Add this new method for color (or reuse updateTextStyle)
          updateSelectedTextStyle: (style) => {
            const active = canvas.getActiveObject();
            if (active && active.type === "textbox") {
              // Handle opacity specially → convert to rgba fill
              if (style.opacity !== undefined) {
                const { opacity } = style;
                const currentStyles = active.getSelectionStyles(
                  active.selectionStart,
                  active.selectionEnd
                );

                // Get base color: either from selection or global fill
                let baseColor = "#000000"; // default
                if (currentStyles.length > 0 && currentStyles[0]?.fill) {
                  baseColor = currentStyles[0].fill;
                } else if (active.fill) {
                  baseColor = active.fill;
                }

                // Convert to rgba
                const toRGBA = (color, alpha) => {
                  if (color.startsWith("rgba"))
                    return color.replace(/[\d.]+\)$/, `${alpha})`);
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  ctx.fillStyle = color;
                  const { r, g, b } = ctx.fillStyle
                    ? (() => {
                        ctx.fillRect(0, 0, 1, 1);
                        const data = ctx.getImageData(0, 0, 1, 1).data;
                        return { r: data[0], g: data[1], b: data[2] };
                      })()
                    : { r: 0, g: 0, b: 0 };
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };

                const rgbaFill = toRGBA(baseColor, opacity);
                active.setSelectionStyles({ fill: rgbaFill });
              } else {
                // Normal style (color, fontSize, etc.)
                if (active.selectionStart !== active.selectionEnd) {
                  active.setSelectionStyles(style);
                } else {
                  active.set(style);
                }
              }
              canvas.requestRenderAll();
              saveState();
            }
          },
          setBackgroundColor: (color) => {
            canvas.backgroundColor = color;
            canvas.renderAll();
            saveState();
          },
          updateShapeStyle: (style) => {
            const active = canvas.getActiveObject();
            if (
              active &&
              (active.type === "rect" ||
                active.type === "circle" ||
                active.type === "ellipse" ||
                active.type === "polygon" ||
                active.type === "triangle" ||
                active.type === "line")
            ) {
              active.set(style);
              canvas.requestRenderAll();
              saveState();
            }
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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: "40px solid #7B68EE",
          boxSizing: "border-box",
          zIndex: 10,
          margin: "10px",
        }}
      ></div>
      <div
        className="absolute top-0 m-4 bottom-0 left-1/2 transform -translate-x-1/2 w-20 bg-[#7B68EE] pointer-events-none z-10"
        style={{ zIndex: 10 }}
      ></div>
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
