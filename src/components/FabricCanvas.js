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
      let history = [];
      let historyStep = -1;
      let debounceTimer = null;

      // Load history from localStorage FIRST
      const loadHistoryFromStorage = () => {
        try {
          const savedHistory = localStorage.getItem("canvasHistory");
          const savedStep = localStorage.getItem("historyStep");

          if (savedHistory) {
            history = JSON.parse(savedHistory);
            historyStep = savedStep ? parseInt(savedStep, 10) : history.length - 1;
            // Clamp step in case of corruption
            historyStep = Math.max(-1, Math.min(historyStep, history.length - 1));
          } else {
            // No history → start fresh
            history = [];
            historyStep = -1;
          }
        } catch (e) {
          console.warn("Failed to parse canvas history", e);
          history = [];
          historyStep = -1;
        }
      };

      const saveState = () => {
        if (isUndoRedo.current) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          // Trim future history
          if (historyStep < history.length - 1) {
            history = history.slice(0, historyStep + 1);
          }

          const json = JSON.stringify(canvas.toJSON());
          history.push(json);
          historyStep = history.length - 1;

          try {
            localStorage.setItem("canvasHistory", JSON.stringify(history));
            localStorage.setItem("historyStep", historyStep.toString());
          } catch (e) {
            console.warn("localStorage full or not available");
          }
        }, 300);
      };

      // 🔄 Load canvas state AFTER history is ready
      const loadCanvasFromStorage = () => {
        try {
          // Use history if available
          if (history.length > 0 && historyStep >= 0) {
            const stateToLoad = history[historyStep];
            canvas.loadFromJSON(stateToLoad, () => {
              canvas.renderAll();
              setTimeout(() => {
                const objects = canvas.getObjects();
                if (objects.length > 0) {
                  const lastObject = objects[objects.length - 1];
                  canvas.setActiveObject(lastObject);
                  canvas.requestRenderAll();
                }
                if (ref?.current && typeof ref.current.onCanvasReady === "function") {
                  ref.current.onCanvasReady();
                }
              }, 0);
            });
          } else {
            // Fresh canvas
            canvas.renderAll();
            if (ref?.current && typeof ref.current.onCanvasReady === "function") {
              ref.current.onCanvasReady();
            }
          }
        } catch (e) {
          console.error("Failed to load canvas from history", e);
          canvas.renderAll();
          if (ref?.current && typeof ref.current.onCanvasReady === "function") {
            ref.current.onCanvasReady();
          }
        }
      };

      // 🔁 Initialize
      loadHistoryFromStorage();
      loadCanvasFromStorage();

      canvas.on("object:modified", saveState);
      canvas.on("object:added", saveState);
      canvas.on("object:removed", saveState);

      // Undo / Redo
      const undo = () => {
        if (historyStep > 0) {
          isUndoRedo.current = true;
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
              isUndoRedo.current = false;
            }, 0);
          });
        }
      };

      const redo = () => {
        if (historyStep < history.length - 1) {
          isUndoRedo.current = true;
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
              isUndoRedo.current = false;
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
              if (active.selectionStart !== active.selectionEnd) {
                active.setSelectionStyles(style);
              } else {
                active.set(style);
              }
              canvas.requestRenderAll();
              saveState();
            }
          },
          updateSelectedTextStyle: (style) => {
            const active = canvas.getActiveObject();
            if (active && active.type === "textbox") {
              if (style.opacity !== undefined) {
                const { opacity } = style;
                const currentStyles = active.getSelectionStyles(
                  active.selectionStart,
                  active.selectionEnd
                );

                let baseColor = "#000000";
                if (currentStyles.length > 0 && currentStyles[0]?.fill) {
                  baseColor = currentStyles[0].fill;
                } else if (active.fill) {
                  baseColor = active.fill;
                }

                const toRGBA = (color, alpha) => {
                  if (color.startsWith("rgba"))
                    return color.replace(/[\d.]+\)$/, `${alpha})`);
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  ctx.fillStyle = color;
                  ctx.fillRect(0, 0, 1, 1);
                  const data = ctx.getImageData(0, 0, 1, 1).data;
                  return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${alpha})`;
                };

                const rgbaFill = toRGBA(baseColor, opacity);
                active.setSelectionStyles({ fill: rgbaFill });
              } else {
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