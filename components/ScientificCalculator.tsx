"use client";

import React, { useState, useEffect, useCallback } from "react";

export default function ScientificCalculator() {
  const [expr, setExpr] = useState<string>("");
  const [display, setDisplay] = useState<string>("0");
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [memory, setMemory] = useState<number>(0);
  const [ans, setAns] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [showFx, setShowFx] = useState<boolean>(true);

  // Evaluate mathematical expression safely and accurately
  const calcEval = useCallback(
    (mathExpr: string): number => {
      try {
        let clean = mathExpr
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/–/g, "-")
          .replace(/−/g, "-")
          .replace(/π/g, "Math.PI")
          .replace(/\be\b/g, "Math.E")
          .replace(/\^/g, "**");

        // Trigonometric functions
        clean = clean.replace(/sin\(([^)]+)\)/g, (_, val) =>
          angleMode === "deg"
            ? `Math.sin((${val}) * Math.PI / 180)`
            : `Math.sin(${val})`
        );
        clean = clean.replace(/cos\(([^)]+)\)/g, (_, val) =>
          angleMode === "deg"
            ? `Math.cos((${val}) * Math.PI / 180)`
            : `Math.cos(${val})`
        );
        clean = clean.replace(/tan\(([^)]+)\)/g, (_, val) =>
          angleMode === "deg"
            ? `Math.tan((${val}) * Math.PI / 180)`
            : `Math.tan(${val})`
        );
        clean = clean.replace(/asin\(([^)]+)\)/g, (_, val) =>
          angleMode === "deg"
            ? `(Math.asin(${val}) * 180 / Math.PI)`
            : `Math.asin(${val})`
        );
        clean = clean.replace(/acos\(([^)]+)\)/g, (_, val) =>
          angleMode === "deg"
            ? `(Math.acos(${val}) * 180 / Math.PI)`
            : `Math.acos(${val})`
        );
        clean = clean.replace(/atan\(([^)]+)\)/g, (_, val) =>
          angleMode === "deg"
            ? `(Math.atan(${val}) * 180 / Math.PI)`
            : `Math.atan(${val})`
        );
        clean = clean.replace(/log\(([^)]+)\)/g, "Math.log10($1)");
        clean = clean.replace(/ln\(([^)]+)\)/g, "Math.log($1)");
        clean = clean.replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)");
        clean = clean.replace(/cbrt\(([^)]+)\)/g, "Math.cbrt($1)");

        // Factorial
        clean = clean.replace(/(\d+)!/g, (_, n) => {
          const num = Math.min(parseInt(n, 10), 100);
          let f = 1;
          for (let i = 2; i <= num; i++) f *= i;
          return String(f);
        });

        // Safe Function evaluation
        const res = Function(`"use strict"; return (${clean})`)();
        if (typeof res === "number" && !isNaN(res) && isFinite(res)) {
          return res;
        }
        return NaN;
      } catch {
        return NaN;
      }
    },
    [angleMode]
  );

  const handleCommand = useCallback(
    (cmd: string | number) => {
      const c = String(cmd);

      if (c === "C" || c === "AC") {
        setExpr("");
        setDisplay("0");
      } else if (c === "bk" || c === "back") {
        setExpr((prev) => {
          const next = prev.slice(0, -1);
          setDisplay(next || "0");
          return next;
        });
      } else if (c === "=") {
        if (!expr) return;
        const res = calcEval(expr);
        if (isNaN(res)) {
          setDisplay("Error");
        } else {
          const rounded = Number(res.toFixed(10));
          const resStr = rounded.toString();
          setDisplay(resStr);
          setAns(rounded);
          setHistory((prev) => [`${expr} = ${resStr}`, ...prev.slice(0, 4)]);
          setExpr(resStr);
        }
      } else if (c === "ans") {
        setExpr((prev) => prev + ans);
        setDisplay(String(ans));
      } else if (c === "M+") {
        const val = parseFloat(display) || 0;
        setMemory((m) => m + val);
      } else if (c === "M-") {
        const val = parseFloat(display) || 0;
        setMemory((m) => m - val);
      } else if (c === "MR") {
        setExpr((prev) => prev + memory);
        setDisplay(String(memory));
      } else if (c === "MC") {
        setMemory(0);
      } else if (c === "+/-") {
        if (display && display !== "0") {
          const toggled = display.startsWith("-")
            ? display.slice(1)
            : "-" + display;
          setDisplay(toggled);
          setExpr((prev) => {
            if (!prev) return toggled;
            return prev.replace(new RegExp(`${display}$`), toggled);
          });
        }
      } else if (c === "RND") {
        const rnd = Number(Math.random().toFixed(4));
        setExpr((prev) => prev + rnd);
        setDisplay(String(rnd));
      } else if (c === "pi") {
        setExpr((prev) => prev + "π");
        setDisplay("3.14159265");
      } else if (c === "e") {
        setExpr((prev) => prev + "e");
        setDisplay("2.71828182");
      } else if (
        ["sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "sqrt"].includes(
          c
        )
      ) {
        setExpr((prev) => prev + `${c}(`);
        setDisplay(`${c}(`);
      } else if (c === "1/x") {
        setExpr((prev) => `1/(${prev || display || "1"})`);
      } else if (c === "x2") {
        setExpr((prev) => `(${prev || display || "0"})^2`);
      } else if (c === "x3") {
        setExpr((prev) => `(${prev || display || "0"})^3`);
      } else if (c === "pow") {
        setExpr((prev) => prev + "^");
      } else if (c === "ex") {
        setExpr((prev) => prev + "e^");
      } else if (c === "10x") {
        setExpr((prev) => prev + "10^");
      } else if (c === "3x") {
        setExpr((prev) => prev + "cbrt(");
      } else if (c === "n!") {
        setExpr((prev) => prev + "!");
      } else if (c === "pc") {
        setExpr((prev) => prev + "/100");
      } else if (c === "EXP") {
        setExpr((prev) => prev + "e+");
      } else if (c === "*" || c === "×") {
        setExpr((prev) => prev + "×");
      } else if (c === "/" || c === "÷") {
        setExpr((prev) => prev + "÷");
      } else if (c === "-" || c === "–") {
        setExpr((prev) => prev + "–");
      } else if (c === "+") {
        setExpr((prev) => prev + "+");
      } else {
        // Normal digit or decimal
        setExpr((prev) => {
          const next = prev + c;
          setDisplay(next);
          return next;
        });
      }
    },
    [display, expr, memory, ans, calcEval]
  );

  // Expose global r() for legacy onclick compatibility and physical keyboard
  useEffect(() => {
    (window as unknown as { r: (val: string | number) => void }).r = (val) =>
      handleCommand(val);

    const onKey = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if (e.key >= "0" && e.key <= "9") handleCommand(e.key);
      else if (e.key === "+") handleCommand("+");
      else if (e.key === "-") handleCommand("–");
      else if (e.key === "*") handleCommand("×");
      else if (e.key === "/") handleCommand("÷");
      else if (e.key === "." || e.key === ",") handleCommand(".");
      else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleCommand("=");
      } else if (e.key === "Backspace") handleCommand("bk");
      else if (e.key === "Escape") handleCommand("C");
      else if (e.key === "(" || e.key === ")") handleCommand(e.key);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleCommand]);

  return (
    <div
      className="modern-calc-card"
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.08)",
        padding: "16px",
        maxWidth: "460px",
        margin: "0 auto",
      }}
    >
      {/* Top Bar: Deg/Rad Switcher + Toggle Scientific Keys */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
          <button
            type="button"
            onClick={() => setAngleMode("deg")}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: angleMode === "deg" ? "#ffffff" : "transparent",
              color: angleMode === "deg" ? "#2563eb" : "#64748b",
              boxShadow: angleMode === "deg" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            DEG
          </button>
          <button
            type="button"
            onClick={() => setAngleMode("rad")}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: angleMode === "rad" ? "#ffffff" : "transparent",
              color: angleMode === "rad" ? "#2563eb" : "#64748b",
              boxShadow: angleMode === "rad" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            RAD
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {memory !== 0 && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#2563eb",
                background: "#dbeafe",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              M={memory}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowFx(!showFx)}
            className="md-toggle-btn"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: showFx ? "#2563eb" : "#64748b",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              padding: "4px 10px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {showFx ? "Simple" : "Scientific (fx)"}
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div
        id="sciout"
        style={{
          background: "#0f172a",
          borderRadius: "12px",
          padding: "12px 16px",
          color: "#ffffff",
          textAlign: "right",
          marginBottom: "14px",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div
          id="sciInPut"
          style={{
            minHeight: "18px",
            fontSize: "13px",
            color: "#94a3b8",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {expr || "\u00A0"}
        </div>
        <div
          id="sciOutPut"
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#38bdf8",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            overflowX: "auto",
            whiteSpace: "nowrap",
            lineHeight: 1.2,
            marginTop: "2px",
          }}
        >
          {display}
        </div>
      </div>

      {/* Buttons Grid */}
      <div style={{ display: "flex", gap: "8px" }}>
        {/* Function Keys (Expandable / Responsive) */}
        {showFx && (
          <div
            id="homefunbtn"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "5px",
              flex: 1,
            }}
          >
            {[
              { label: "sin", cmd: "sin" },
              { label: "cos", cmd: "cos" },
              { label: "tan", cmd: "tan" },
              { label: "π", cmd: "pi" },
              { label: "e", cmd: "e" },
              { label: "sin⁻¹", cmd: "asin" },
              { label: "cos⁻¹", cmd: "acos" },
              { label: "tan⁻¹", cmd: "atan" },
              { label: "xʸ", cmd: "pow" },
              { label: "x³", cmd: "x3" },
              { label: "x²", cmd: "x2" },
              { label: "eˣ", cmd: "ex" },
              { label: "10ˣ", cmd: "10x" },
              { label: "√x", cmd: "sqrt" },
              { label: "³√x", cmd: "3x" },
              { label: "ln", cmd: "ln" },
              { label: "log", cmd: "log" },
              { label: "1/x", cmd: "1/x" },
              { label: "(", cmd: "(" },
              { label: ")", cmd: ")" },
              { label: "%", cmd: "pc" },
              { label: "n!", cmd: "n!" },
              { label: "EXP", cmd: "EXP" },
              { label: "RND", cmd: "RND" },
              { label: "±", cmd: "+/-" },
            ].map((btn, i) => (
              <button
                key={i}
                type="button"
                className="scifunc modern-key-fx"
                onClick={() => handleCommand(btn.cmd)}
                style={{
                  height: "36px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.1s ease",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Numeric & Operator Keypad */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "5px",
            flex: showFx ? 1 : 1.2,
          }}
        >
          {/* Row 1 */}
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("7")} style={keyNumStyle}>7</button>
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("8")} style={keyNumStyle}>8</button>
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("9")} style={keyNumStyle}>9</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("+")} style={keyOpStyle}>+</button>
          <button type="button" className="sciop modern-key-del" onClick={() => handleCommand("bk")} style={keyDelStyle}>⌫</button>

          {/* Row 2 */}
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("4")} style={keyNumStyle}>4</button>
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("5")} style={keyNumStyle}>5</button>
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("6")} style={keyNumStyle}>6</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("–")} style={keyOpStyle}>−</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("ans")} style={keyMemStyle}>Ans</button>

          {/* Row 3 */}
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("1")} style={keyNumStyle}>1</button>
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("2")} style={keyNumStyle}>2</button>
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("3")} style={keyNumStyle}>3</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("×")} style={keyOpStyle}>×</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("M+")} style={keyMemStyle}>M+</button>

          {/* Row 4 */}
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand("0")} style={keyNumStyle}>0</button>
          <button type="button" className="scinm modern-key-num" onClick={() => handleCommand(".")} style={keyNumStyle}>.</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("÷")} style={keyOpStyle}>÷</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("M-")} style={keyMemStyle}>M−</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("MR")} style={keyMemStyle}>MR</button>

          {/* Row 5 */}
          <button type="button" className="scieq modern-key-clear" onClick={() => handleCommand("AC")} style={keyClearStyle}>AC</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("(")} style={keyOpStyle}>(</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand(")")} style={keyOpStyle}>)</button>
          <button type="button" className="scieq modern-key-equal" onClick={() => handleCommand("=")} style={keyEqualStyle}>=</button>
          <button type="button" className="sciop modern-key-op" onClick={() => handleCommand("MC")} style={keyMemStyle}>MC</button>
        </div>
      </div>

      {/* History panel */}
      {history.length > 0 && (
        <div
          id="scihistory"
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
            color: "#64748b",
            fontFamily: "monospace",
          }}
        >
          <div style={{ fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Recent Calculations:</div>
          {history.map((h, i) => (
            <div key={i} style={{ padding: "2px 0" }}>
              {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const keyNumStyle: React.CSSProperties = {
  height: "36px",
  fontSize: "16px",
  fontWeight: 600,
  background: "#ffffff",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.1s ease",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const keyOpStyle: React.CSSProperties = {
  height: "36px",
  fontSize: "16px",
  fontWeight: 700,
  background: "#eff6ff",
  color: "#2563eb",
  border: "1px solid #bfdbfe",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.1s ease",
};

const keyEqualStyle: React.CSSProperties = {
  height: "36px",
  fontSize: "18px",
  fontWeight: 700,
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.3)",
};

const keyClearStyle: React.CSSProperties = {
  height: "36px",
  fontSize: "13px",
  fontWeight: 700,
  background: "#fef2f2",
  color: "#dc2626",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  cursor: "pointer",
};

const keyDelStyle: React.CSSProperties = {
  height: "36px",
  fontSize: "14px",
  fontWeight: 700,
  background: "#f8fafc",
  color: "#64748b",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  cursor: "pointer",
};

const keyMemStyle: React.CSSProperties = {
  height: "36px",
  fontSize: "12px",
  fontWeight: 600,
  background: "#f1f5f9",
  color: "#475569",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  cursor: "pointer",
};
