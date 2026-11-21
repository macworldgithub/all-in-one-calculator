import React from "react";
import ScientificCalculator from "@/components/ScientificCalculator";
import SearchBox from "@/components/SearchBox";
import CategoryTiles from "@/components/CategoryTiles";

export default function HomePage() {
  return (
    <>
      <div id="clear"></div>
      <div id="homecaldiv">
        <div id="contentout">
          <table
            width="100%"
            border={0}
            cellPadding={0}
            cellSpacing={0}
            align="center"
          >
            <tbody>
              <tr className="homecaltr">
                <td valign="top" className="homecaltd">
                  <ScientificCalculator />
                </td>
                <td id="homesch" valign="top" className="homeschtd">
                  <h1>Free Online Calculators</h1>
                  <SearchBox alignCenter={false} />
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
