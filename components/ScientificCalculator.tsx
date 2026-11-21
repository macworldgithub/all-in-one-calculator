"use client";

import React, { useState, useEffect, useCallback } from "react";

export default function ScientificCalculator() {
  const [inputStr, setInputStr] = useState<string>("");
  const [outputStr, setOutputStr] = useState<string>("0");
  const [history, setHistory] = useState<string[]>([]);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [memory, setMemory] = useState<number>(0);
  const [ans, setAns] = useState<number>(0);

  const evaluateExpression = useCallback((expr: string): number => {
    try {
      let clean = expr
        .replace(/×/g, "*")
        .replace(/–/g, "-")
        .replace(/π/g, "Math.PI")
        .replace(/\be\b/g, "Math.E");

      // Replace functions with Math equivalents, respecting angle mode
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

      // Factorial
      clean = clean.replace(/(\d+)!/g, (_, n) => {
        const num = parseInt(n);
        let f = 1;
        for (let i = 2; i <= num; i++) f *= i;
        return String(f);
      });

      // Safe arithmetic evaluator
      const result = Function(`"use strict"; return (${clean})`)();
      if (typeof result === "number" && !isNaN(result)) {
        return result;
      }
      return NaN;
    } catch {
      return NaN;
    }
  }, [angleMode]);

  const handleBtn = useCallback((val: string) => {
    if (val === "C") {
      setInputStr("");
      setOutputStr("0");
    } else if (val === "bk") {
      setInputStr((prev) => prev.slice(0, -1));
    } else if (val === "=") {
      if (!inputStr) return;
      const res = evaluateExpression(inputStr);
      if (isNaN(res)) {
        setOutputStr("Error");
      } else {
        const resStr = Number(res.toFixed(10)).toString();
        setOutputStr(resStr);
        setAns(res);
        setHistory((prev) => [
          `${inputStr} = ${resStr}`,
          ...prev.slice(0, 4),
        ]);
      }
    } else if (val === "ans") {
      setInputStr((prev) => prev + ans);
    } else if (val === "M+") {
      const cur = parseFloat(outputStr) || 0;
      setMemory((prev) => prev + cur);
    } else if (val === "M-") {
      const cur = parseFloat(outputStr) || 0;
      setMemory((prev) => prev - cur);
    } else if (val === "MR") {
      setInputStr((prev) => prev + memory);
    } else if (val === "RND") {
      const rnd = Math.random().toFixed(4);
      setInputStr((prev) => prev + rnd);
    } else if (val === "+/-") {
      setInputStr((prev) =>
        prev.startsWith("-") ? prev.slice(1) : "-" + prev
      );
    } else if (
      ["sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "sqrt"].includes(
        val
      )
    ) {
      setInputStr((prev) => prev + `${val}(`);
    } else if (val === "1/x") {
      setInputStr((prev) => `1/(${prev || "1"})`);
    } else if (val === "x2") {
      setInputStr((prev) => `(${prev || "0"})*(${prev || "0"})`);
    } else if (val === "x3") {
      setInputStr((prev) => `(${prev || "0"})*(${prev || "0"})*(${prev || "0"})`);
    } else if (val === "pow") {
      setInputStr((prev) => prev + "^");
    } else if (val === "pi") {
      setInputStr((prev) => prev + "π");
    } else if (val === "e") {
      setInputStr((prev) => prev + "e");
    } else if (val === "n!") {
      setInputStr((prev) => prev + "!");
    } else {
      setInputStr((prev) => prev + val);
    }
  }, [inputStr, outputStr, evaluateExpression, memory, ans]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (e.key >= "0" && e.key <= "9") handleBtn(e.key);
      else if (e.key === "+") handleBtn("+");
      else if (e.key === "-") handleBtn("–");
      else if (e.key === "*") handleBtn("×");
      else if (e.key === "/") handleBtn("/");
      else if (e.key === "." || e.key === ",") handleBtn(".");
      else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleBtn("=");
      } else if (e.key === "Backspace") handleBtn("bk");
      else if (e.key === "Escape") handleBtn("C");
      else if (e.key === "(" || e.key === ")") handleBtn(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBtn]);

  return (
    <table align="center" id="sciout" cellPadding={0} cellSpacing={2}>
      <tbody>
        <tr>
          <td colSpan={2}>
            <div>
              <div id="sciInPut">{inputStr || "\u00A0"}</div>
              <div id="sciOutPut">{outputStr}</div>
            </div>
          </td>
        </tr>
                    <tr>
                      <td>
                        <div style={{ paddingTop: "3px", width: "100%" }} id="homefunbtn">
                          <div>
                            <span onClick={() => handleBtn("sin")} className="scifunc">sin</span>
                            <span onClick={() => handleBtn("cos")} className="scifunc">cos</span>
                            <span onClick={() => handleBtn("tan")} className="scifunc">tan</span>
                            <span className="scird">
                              <label htmlFor="scirdsettingd">
                                <input
                                  id="scirdsettingd"
                                  type="radio"
                                  name="scirdsetting"
                                  value="deg"
                                  checked={angleMode === "deg"}
                                  onChange={() => setAngleMode("deg")}
                                />
                                Deg
                              </label>
                              <label htmlFor="scirdsettingr">
                                <input
                                  id="scirdsettingr"
                                  type="radio"
                                  name="scirdsetting"
                                  value="rad"
                                  checked={angleMode === "rad"}
                                  onChange={() => setAngleMode("rad")}
                                />
                                Rad
                              </label>
                            </span>
                          </div>
                          <div>
                            <span onClick={() => handleBtn("asin")} className="scifunc">
                              sin<sup>-1</sup>
                            </span>
                            <span onClick={() => handleBtn("acos")} className="scifunc">
                              cos<sup>-1</sup>
                            </span>
                            <span onClick={() => handleBtn("atan")} className="scifunc">
                              tan<sup>-1</sup>
                            </span>
                            <span onClick={() => handleBtn("pi")} className="scifunc">&#960;</span>
                            <span onClick={() => handleBtn("e")} className="scifunc">e</span>
                          </div>
                          <div>
                            <span onClick={() => handleBtn("pow")} className="scifunc">
                              x<sup>y</sup>
                            </span>
                            <span onClick={() => handleBtn("x3")} className="scifunc">
                              x<sup>3</sup>
                            </span>
                            <span onClick={() => handleBtn("x2")} className="scifunc">
                              x<sup>2</sup>
                            </span>
                            <span onClick={() => handleBtn("ex")} className="scifunc">
                              e<sup>x</sup>
                            </span>
                            <span onClick={() => handleBtn("10x")} className="scifunc">
                              10<sup>x</sup>
                            </span>
                          </div>
                          <div>
                            <span onClick={() => handleBtn("apow")} className="scifunc">
                              <sup>y</sup>&#8730;x
                            </span>
                            <span onClick={() => handleBtn("3x")} className="scifunc">
                              <sup>3</sup>&#8730;x
                            </span>
                            <span onClick={() => handleBtn("sqrt")} className="scifunc">&#8730;x</span>
                            <span onClick={() => handleBtn("ln")} className="scifunc">ln</span>
                            <span onClick={() => handleBtn("log")} className="scifunc">log</span>
                          </div>
                          <div>
                            <span onClick={() => handleBtn("(")} className="scifunc">(</span>
                            <span onClick={() => handleBtn(")")} className="scifunc">)</span>
                            <span onClick={() => handleBtn("1/x")} className="scifunc">1/x</span>
                            <span onClick={() => handleBtn("%")} className="scifunc">%</span>
                            <span onClick={() => handleBtn("n!")} className="scifunc">n!</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ paddingTop: "3px" }}>
                          <div>
                            <span onClick={() => handleBtn("7")} className="scinm">7</span>
                            <span onClick={() => handleBtn("8")} className="scinm">8</span>
                            <span onClick={() => handleBtn("9")} className="scinm">9</span>
                            <span onClick={() => handleBtn("+")} className="sciop">+</span>
                            <span onClick={() => handleBtn("bk")} className="sciop">Back</span>
                          </div>
                          <div>
                            <span onClick={() => handleBtn("4")} className="scinm">4</span>
                            <span onClick={() => handleBtn("5")} className="scinm">5</span>
                            <span onClick={() => handleBtn("6")} className="scinm">6</span>
                            <span onClick={() => handleBtn("–")} className="sciop">&ndash;</span>
                            <span onClick={() => handleBtn("ans")} className="sciop">Ans</span>
                          </div>
                          <div>
                            <span onClick={() => handleBtn("1")} className="scinm">1</span>
                            <span onClick={() => handleBtn("2")} className="scinm">2</span>
                            <span onClick={() => handleBtn("3")} className="scinm">3</span>
                            <span onClick={() => handleBtn("×")} className="sciop">&#215;</span>
                            <span onClick={() => handleBtn("M+")} className="sciop">M+</span>
                          </div>
                          <div>
                            <span onClick={() => handleBtn("0")} className="scinm">0</span>
                            <span onClick={() => handleBtn(".")} className="scinm">.</span>
                            <span onClick={() => handleBtn("EXP")} className="sciop">EXP</span>
                            <span onClick={() => handleBtn("/")} className="sciop">/</span>
                            <span onClick={() => handleBtn("M-")} className="sciop">M-</span>
                          </div>
                          <div>
                            <span onClick={() => handleBtn("+/-")} className="sciop">&#177;</span>
                            <span onClick={() => handleBtn("RND")} className="sciop">RND</span>
                            <span onClick={() => handleBtn("C")} className="scieq">AC</span>
                            <span onClick={() => handleBtn("=")} className="scieq">=</span>
                            <span onClick={() => handleBtn("MR")} className="sciop" id="scimrc">MR</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {history.length > 0 && (
                      <tr>
                        <td colSpan={2}>
                          <div id="scihistory">
                            {history.map((h, i) => (
                              <div key={i}>{h}</div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
  );
}
