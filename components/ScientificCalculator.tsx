"use client";

import React, { useState, useEffect, useCallback } from "react";

export default function ScientificCalculator() {
  const [expr, setExpr] = useState<string>("");
  const [display, setDisplay] = useState<string>("0");
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [memory, setMemory] = useState<number>(0);
  const [ans, setAns] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"standard" | "scientific">("scientific");

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
          // Format result cleanly
          const rounded =
            Math.abs(res) < 1e-12 && Math.abs(res) > 0
              ? 0
              : parseFloat(res.toPrecision(12));
          const resStr = String(rounded);
          setDisplay(resStr);
          setAns(rounded);
          setHistory((prev) => [`${expr} = ${resStr}`, ...prev.slice(0, 4)]);
          setExpr(resStr);
        }
      } else if (c === "sin") {
        setExpr((prev) => prev + "sin(");
        setDisplay((prev) => (prev === "0" ? "sin(" : prev + "sin("));
      } else if (c === "cos") {
        setExpr((prev) => prev + "cos(");
        setDisplay((prev) => (prev === "0" ? "cos(" : prev + "cos("));
      } else if (c === "tan") {
        setExpr((prev) => prev + "tan(");
        setDisplay((prev) => (prev === "0" ? "tan(" : prev + "tan("));
      } else if (c === "asin") {
        setExpr((prev) => prev + "asin(");
        setDisplay((prev) => (prev === "0" ? "asin(" : prev + "asin("));
      } else if (c === "acos") {
        setExpr((prev) => prev + "acos(");
        setDisplay((prev) => (prev === "0" ? "acos(" : prev + "acos("));
      } else if (c === "atan") {
        setExpr((prev) => prev + "atan(");
        setDisplay((prev) => (prev === "0" ? "atan(" : prev + "atan("));
      } else if (c === "log") {
        setExpr((prev) => prev + "log(");
        setDisplay((prev) => (prev === "0" ? "log(" : prev + "log("));
      } else if (c === "ln") {
        setExpr((prev) => prev + "ln(");
        setDisplay((prev) => (prev === "0" ? "ln(" : prev + "ln("));
      } else if (c === "sqrt") {
        setExpr((prev) => prev + "sqrt(");
        setDisplay((prev) => (prev === "0" ? "sqrt(" : prev + "sqrt("));
      } else if (c === "3x") {
        setExpr((prev) => prev + "cbrt(");
        setDisplay((prev) => (prev === "0" ? "cbrt(" : prev + "cbrt("));
      } else if (c === "x2") {
        setExpr((prev) => prev + "^2");
        setDisplay((prev) => prev + "^2");
      } else if (c === "x3") {
        setExpr((prev) => prev + "^3");
        setDisplay((prev) => prev + "^3");
      } else if (c === "pow") {
        setExpr((prev) => prev + "^");
        setDisplay((prev) => prev + "^");
      } else if (c === "ex") {
        setExpr((prev) => prev + "e^(");
        setDisplay((prev) => prev + "e^(");
      } else if (c === "10x") {
        setExpr((prev) => prev + "10^(");
        setDisplay((prev) => prev + "10^(");
      } else if (c === "1/x") {
        setExpr((prev) => prev + "^(-1)");
        setDisplay((prev) => prev + "^(-1)");
      } else if (c === "pi") {
        setExpr((prev) => prev + "π");
        setDisplay((prev) => (prev === "0" ? "π" : prev + "π"));
      } else if (c === "e") {
        setExpr((prev) => prev + "e");
        setDisplay((prev) => (prev === "0" ? "e" : prev + "e"));
      } else if (c === "n!") {
        setExpr((prev) => prev + "!");
        setDisplay((prev) => prev + "!");
      } else if (c === "+/-") {
        setExpr((prev) => {
          if (!prev) return "-";
          if (prev.startsWith("-")) return prev.slice(1);
          return "-" + prev;
        });
        setDisplay((prev) => {
          if (!prev || prev === "0") return "-";
          if (prev.startsWith("-")) return prev.slice(1);
          return "-" + prev;
        });
      } else if (c === "pc") {
        setExpr((prev) => prev + "*0.01");
        setDisplay((prev) => prev + "%");
      } else if (c === "ans") {
        setExpr((prev) => prev + String(ans));
        setDisplay((prev) => (prev === "0" ? String(ans) : prev + String(ans)));
      } else if (c === "M+") {
        const cur = calcEval(expr || display);
        if (!isNaN(cur)) setMemory((prev) => prev + cur);
      } else if (c === "M-") {
        const cur = calcEval(expr || display);
        if (!isNaN(cur)) setMemory((prev) => prev - cur);
      } else if (c === "MR") {
        setExpr((prev) => prev + String(memory));
        setDisplay((prev) => (prev === "0" ? String(memory) : prev + String(memory)));
      } else if (c === "MC") {
        setMemory(0);
      } else if (c === "RND") {
        const r = parseFloat(Math.random().toFixed(4));
        setExpr((prev) => prev + String(r));
        setDisplay((prev) => (prev === "0" ? String(r) : prev + String(r)));
      } else if (c === "EXP") {
        setExpr((prev) => prev + "*10^");
        setDisplay((prev) => prev + "E");
      } else {
        // Digits & Operators
        setExpr((prev) => prev + c);
        setDisplay((prev) => (prev === "0" && !["+", "–", "×", "÷", "."].includes(c) ? c : prev + c));
      }
    },
    [expr, display, ans, memory, calcEval]
  );

  // Hook into global window.r for legacy page clicks
  useEffect(() => {
    (window as unknown as { r: (c: string | number) => void }).r = handleCommand;
  }, [handleCommand]);

  // Physical Keyboard Support
  useEffect(() => {
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
    <div className="modern-calc-card">
      {/* Top Header: Deg/Rad Switcher + Mode Toggle */}
      <div className="calc-top-bar">
        <div className="calc-mode-group">
          <button
            type="button"
            onClick={() => setAngleMode("deg")}
            className={`calc-mode-btn ${angleMode === "deg" ? "active" : ""}`}
          >
            DEG
          </button>
          <button
            type="button"
            onClick={() => setAngleMode("rad")}
            className={`calc-mode-btn ${angleMode === "rad" ? "active" : ""}`}
          >
            RAD
          </button>
        </div>

        <div className="calc-tab-group">
          {memory !== 0 && <span className="calc-mem-indicator">M={memory}</span>}
          <button
            type="button"
            onClick={() => setActiveTab("standard")}
            className={`calc-tab-btn ${activeTab === "standard" ? "active" : ""}`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("scientific")}
            className={`calc-tab-btn ${activeTab === "scientific" ? "active" : ""}`}
          >
            Scientific
          </button>
        </div>
      </div>

      {/* OLED Screen Display */}
      <div className="calc-display-screen" id="sciout">
        <div className="calc-expression-preview" id="sciInPut">
          {expr || "\u00A0"}
        </div>
        <div className="calc-main-output" id="sciOutPut">
          {display}
        </div>
      </div>

      {/* Buttons Keypad */}
      <div className={`calc-keypad-wrapper ${activeTab}`}>
        {/* Function Keys Grid */}
        {activeTab === "scientific" && (
          <div className="calc-fx-grid" id="homefunbtn">
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
                className="calc-btn btn-fx"
                onClick={() => handleCommand(btn.cmd)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Numeric & Operator Keypad Grid */}
        <div className="calc-num-grid">
          {/* Row 1 */}
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("7")}>7</button>
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("8")}>8</button>
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("9")}>9</button>
          <button type="button" className="calc-btn btn-op" onClick={() => handleCommand("+")}>+</button>
          <button type="button" className="calc-btn btn-del" onClick={() => handleCommand("bk")}>⌫</button>

          {/* Row 2 */}
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("4")}>4</button>
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("5")}>5</button>
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("6")}>6</button>
          <button type="button" className="calc-btn btn-op" onClick={() => handleCommand("–")}>−</button>
          <button type="button" className="calc-btn btn-mem" onClick={() => handleCommand("ans")}>Ans</button>

          {/* Row 3 */}
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("1")}>1</button>
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("2")}>2</button>
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("3")}>3</button>
          <button type="button" className="calc-btn btn-op" onClick={() => handleCommand("×")}>×</button>
          <button type="button" className="calc-btn btn-mem" onClick={() => handleCommand("M+")}>M+</button>

          {/* Row 4 */}
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand("0")}>0</button>
          <button type="button" className="calc-btn btn-num" onClick={() => handleCommand(".")}>.</button>
          <button type="button" className="calc-btn btn-op" onClick={() => handleCommand("÷")}>÷</button>
          <button type="button" className="calc-btn btn-mem" onClick={() => handleCommand("M-")}>M−</button>
          <button type="button" className="calc-btn btn-mem" onClick={() => handleCommand("MR")}>MR</button>

          {/* Row 5 */}
          <button type="button" className="calc-btn btn-clear" onClick={() => handleCommand("AC")}>AC</button>
          <button type="button" className="calc-btn btn-op" onClick={() => handleCommand("(")}>(</button>
          <button type="button" className="calc-btn btn-op" onClick={() => handleCommand(")")}>)</button>
          <button type="button" className="calc-btn btn-equal" onClick={() => handleCommand("=")}>=</button>
          <button type="button" className="calc-btn btn-mem" onClick={() => handleCommand("MC")}>MC</button>
        </div>
      </div>

      {/* History log */}
      {history.length > 0 && (
        <div className="calc-history-drawer">
          <div className="history-header">Recent Calculations</div>
          {history.map((h, i) => (
            <div key={i} className="history-row">
              {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
