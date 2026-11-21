import React from "react";
import ScientificCalculator from "@/components/ScientificCalculator";
import SearchBox from "@/components/SearchBox";
import CategoryTiles from "@/components/CategoryTiles";

export default function HomePage() {
  return (
    <>
      <div id="clear"></div>
      <div id="homecaldiv">
        <div id="contentout" style={{ alignItems: "center" }}>
          <table
            width="100%"
            border={0}
            cellPadding={0}
            cellSpacing={0}
            align="center"
          >
            <tbody>
              <tr className="homecaltr">
                <td valign="top" className="homecaltd" style={{ paddingRight: "16px" }}>
                  <ScientificCalculator />
                </td>
                <td id="homesch" valign="top" className="homeschtd">
                  <div style={{ padding: "10px 0" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                      }}
                    >
                      All In One Suite
                    </div>
                    <h1
                      style={{
                        fontSize: "32px",
                        fontWeight: 800,
                        color: "#0f172a",
                        lineHeight: 1.2,
                        marginBottom: "10px",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Free Online Calculators
                    </h1>
                    <p
                      style={{
                        fontSize: "15px",
                        color: "#64748b",
                        lineHeight: 1.6,
                        maxWidth: "460px",
                        marginBottom: "20px",
                      }}
                    >
                      Fast, accurate, and easy-to-use calculation tools for finance, fitness, health, math, and everyday math. No registration required.
                    </p>
                    <SearchBox alignCenter={false} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <CategoryTiles />
    </>
  );
}
