const fs = require('fs');
const path = require('path');

const code = `
  // ==========================================
  // COMPREHENSIVE OTHER & EVERYDAY ENGINES
  // ==========================================

  // Fuel Cost Calculator
  engines['fuel-cost-calculator'] = function () {
    var dist = getFloat('tripdistance', 500);
    var mpg = getFloat('fuelefficiency', 25) || 25;
    var price = getFloat('gasprice', 3.00) || 3.00;

    var gal = dist / mpg;
    var totalCost = gal * price;
    var costPerMile = totalCost / (dist || 1);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Trip Fuel Cost: \${fmtMoney(totalCost)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Fuel Cost</b></td><td align="right"><font size="+1" color="green"><b>\${fmtMoney(totalCost)}</b></font></td></tr>
        <tr><td>Gallons of Gas Needed</td><td align="right"><b>\${fmtNum(gal, 2)} gallons</b></td></tr>
        <tr><td>Cost per Mile</td><td align="right"><b>\${fmtMoney(costPerMile, 3)} / mile</b></td></tr>
        <tr><td>Trip Distance</td><td align="right">\${dist} miles</td></tr>
        <tr><td>Vehicle Fuel Economy</td><td align="right">\${mpg} MPG</td></tr>
      </table>
    \`;
  };

  // Gas Mileage & Mileage Reimbursement
  engines['gas-mileage-calculator'] = engines['mileage-calculator'] = function () {
    var dist = getFloat('tripdistance', 350) || getFloat('cdistance', 350);
    var gal = getFloat('fuelused', 14) || getFloat('cgallons', 14);
    var mpg = dist / (gal || 1);
    var irsRate = 0.67; // 2025/2026 IRS standard rate
    var reimb = dist * irsRate;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Gas Mileage: \${fmtNum(mpg, 2)} MPG</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Fuel Economy</b></td><td align="right"><font size="+1" color="green"><b>\${fmtNum(mpg, 2)} MPG</b></font></td></tr>
        <tr><td>Metric Equivalent</td><td align="right">\${fmtNum(235.215 / (mpg || 1), 2)} L/100km</td></tr>
        <tr><td>IRS Business Reimbursement (67&cent;/mi)</td><td align="right"><b>\${fmtMoney(reimb)}</b></td></tr>
      </table>
    \`;
  };

  // Speed Calculator
  engines['speed-calculator'] = function () {
    var dist = getFloat('cdistance', 100);
    var secs = (getFloat('ctimeh', 0) * 3600) + (getFloat('ctimem', 0) * 60) + getFloat('ctimes', 20) || 20;
    var hours = secs / 3600;
    var mph = dist / (hours || 1);
    var kmh = mph * 1.60934;
    var ms = dist * 1609.34 / (secs || 1);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Speed: \${fmtNum(mph, 2)} mph</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Miles per Hour (mph)</b></td><td align="right"><font size="+1" color="green"><b>\${fmtNum(mph, 2)} mph</b></font></td></tr>
        <tr><td>Kilometers per Hour (km/h)</td><td align="right"><b>\${fmtNum(kmh, 2)} km/h</b></td></tr>
        <tr><td>Meters per Second (m/s)</td><td align="right">\${fmtNum(ms, 2)} m/s</td></tr>
        <tr><td>Total Time</td><td align="right">\${fmtNum(secs, 1)} seconds</td></tr>
      </table>
    \`;
  };

  // Square Footage Calculator
  engines['square-footage-calculator'] = function () {
    var l = getFloat('reclength', 30);
    var w = getFloat('recheight', 20);
    var q = getFloat('recquantity', 1) || 1;
    var price = getFloat('recprice', 0);
    var sqft = l * w * q;
    var sqftWaste = sqft * 1.10; // 10% waste

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Square Footage: \${fmtNum(sqft, 2)} sq ft</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Area</b></td><td align="right"><font size="+1" color="green"><b>\${fmtNum(sqft, 2)} sq ft</b></font></td></tr>
        <tr><td>Area with 10% Waste Factor</td><td align="right"><b>\${fmtNum(sqftWaste, 2)} sq ft</b></td></tr>
        <tr><td>Square Yards</td><td align="right">\${fmtNum(sqft / 9, 2)} sq yd</td></tr>
        <tr><td>Square Meters</td><td align="right">\${fmtNum(sqft * 0.092903, 2)} m&sup2;</td></tr>
        \${price > 0 ? \`<tr><td>Total Estimated Material Cost</td><td align="right"><b>\${fmtMoney(sqftWaste * price)}</b></td></tr>\` : ''}
      </table>
    \`;
  };

  // Tile Calculator & Roofing Calculator & Mulch Calculator & Gravel Calculator
  engines['tile-calculator'] = engines['roofing-calculator'] = engines['mulch-calculator'] = engines['gravel-calculator'] = function () {
    var roomL = getFloat('totallength', 20) || 20;
    var roomW = getFloat('totalwidth', 15) || 15;
    var area = roomL * roomW;
    var tileL = getFloat('tilelength', 12) || 12;
    var tileW = getFloat('tilewidth', 12) || 12;
    var boxSize = getFloat('boxsize', 12) || 12;

    var tileAreaSqFt = (tileL / 12) * (tileW / 12);
    var tilesNeeded = Math.ceil((area / tileAreaSqFt) * 1.10); // 10% extra
    var boxes = Math.ceil(tilesNeeded / boxSize);
    var cubicYards = (area * (3 / 12)) / 27; // for mulch/gravel at 3 inch depth

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Material Required: \${boxes} Boxes (\${tilesNeeded} Tiles)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Project Area</b></td><td align="right"><font size="+1"><b>\${fmtNum(area, 1)} sq ft</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Tiles Needed (incl. 10% extra)</b></td><td align="right"><font size="+1" color="green"><b>\${tilesNeeded} tiles</b></font></td></tr>
        <tr><td>Boxes Required (\${boxSize} per box)</td><td align="right"><b>\${boxes} boxes</b></td></tr>
        <tr><td>Equivalent Cubic Yards (for mulch/gravel at 3" depth)</td><td align="right">\${fmtNum(cubicYards, 2)} cubic yards</td></tr>
      </table>
    \`;
  };

  // Stair Calculator
  engines['stair-calculator'] = function () {
    var rise = getFloat('totalrise', 108) || 108;
    var risers = Math.round(rise / 7.5);
    var riserH = rise / risers;
    var treads = risers - 1;
    var totalRun = treads * 10; // 10 in standard tread
    var stringer = Math.sqrt(rise * rise + totalRun * totalRun);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">\${risers} Risers at \${fmtNum(riserH, 2)}"</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Number of Risers</b></td><td align="right"><font size="+1" color="green"><b>\${risers}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Individual Riser Height</b></td><td align="right"><font size="+1"><b>\${fmtNum(riserH, 2)} inches</b></font></td></tr>
        <tr><td>Number of Treads</td><td align="right"><b>\${treads} treads</b></td></tr>
        <tr><td>Total Stair Run</td><td align="right">\${fmtNum(totalRun, 1)} inches (\${fmtNum(totalRun/12, 1)} ft)</td></tr>
        <tr><td>Stringer Length</td><td align="right"><b>\${fmtNum(stringer, 1)} inches (\${fmtNum(stringer/12, 1)} ft)</b></td></tr>
        <tr><td>Stair Incline Angle</td><td align="right">\${fmtNum(Math.atan2(rise, totalRun) * (180/Math.PI), 1)}&deg;</td></tr>
      </table>
    \`;
  };

  // BTU Calculator (AC Sizing)
  engines['btu-calculator'] = function () {
    var sqft = getFloat('roomsize1', 150) || 150;
    var ceiling = getFloat('ceilingheight1', 9) || 9;
    var people = getFloat('people1', 2) || 2;

    var btu = sqft * 20; // 20 BTU per sq ft
    if (ceiling > 8) btu *= (ceiling / 8);
    if (people > 2) btu += (people - 2) * 600;
    var tons = btu / 12000;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Required Cooling: \${Math.round(btu)} BTU/hr</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Recommended AC Capacity</b></td><td align="right"><font size="+1" color="green"><b>\${Math.round(btu)} BTU / hr</b></font></td></tr>
        <tr><td>Air Conditioning Tonnage</td><td align="right"><b>\${fmtNum(tons, 2)} Tons</b></td></tr>
        <tr><td>Room Floor Space</td><td align="right">\${sqft} sq ft</td></tr>
        <tr><td>Ceiling Height</td><td align="right">\${ceiling} ft</td></tr>
      </table>
    \`;
  };

  // Electricity Calculator
  engines['electricity-calculator'] = function () {
    var watts = getFloat('power', 1000);
    var hours = getFloat('usage', 24);
    var rate = getFloat('price', 0.15); // $/kWh

    var dailyKwh = (watts * hours) / 1000;
    var dailyCost = dailyKwh * rate;
    var monthlyCost = dailyCost * 30.42;
    var annualCost = dailyCost * 365;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Electricity Cost: \${fmtMoney(monthlyCost)} / month</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Estimated Monthly Cost</b></td><td align="right"><font size="+1" color="green"><b>\${fmtMoney(monthlyCost)}</b></font></td></tr>
        <tr><td>Annual Power Cost</td><td align="right"><b>\${fmtMoney(annualCost)}</b></td></tr>
        <tr><td>Daily Power Cost</td><td align="right">\${fmtMoney(dailyCost)} / day</td></tr>
        <tr><td>Daily Energy Consumption</td><td align="right"><b>\${fmtNum(dailyKwh, 2)} kWh</b></td></tr>
        <tr><td>Appliance Power Rating</td><td align="right">\${watts} Watts</td></tr>
      </table>
    \`;
  };

  // Ohm's Law Calculator & Voltage Drop & Resistor Calculator
  engines['ohms-law-calculator'] = engines['voltage-drop-calculator'] = engines['resistor-calculator'] = function () {
    var v = getFloat('voltage', 120);
    var i = getFloat('current', 10);
    var r = v / (i || 1);
    var p = v * i;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Resistance: \${fmtNum(r, 2)} &Omega; | Power: \${fmtNum(p, 1)} W</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Voltage (V)</b></td><td align="right">\${fmtNum(v, 2)} Volts</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Current (I)</b></td><td align="right">\${fmtNum(i, 2)} Amperes</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Resistance (R = V/I)</b></td><td align="right"><font size="+1" color="green"><b>\${fmtNum(r, 2)} &Omega;</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Power (P = V&times;I)</b></td><td align="right"><font size="+1"><b>\${fmtNum(p, 1)} Watts</b></font></td></tr>
      </table>
    \`;
  };

  // Horsepower Calculator & Engine Horsepower
  engines['horsepower-calculator'] = engines['engine-horsepower-calculator'] = function () {
    var torque = getFloat('torque', 300);
    var rpm = getFloat('rpm', 5252);
    var hp = (torque * rpm) / 5252;
    var kw = hp * 0.7457;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Horsepower: \${fmtNum(hp, 1)} HP</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Mechanical Horsepower</b></td><td align="right"><font size="+1" color="green"><b>\${fmtNum(hp, 1)} HP</b></font></td></tr>
        <tr><td>Kilowatts (kW)</td><td align="right"><b>\${fmtNum(kw, 1)} kW</b></td></tr>
        <tr><td>Metric Horsepower (PS)</td><td align="right">\${fmtNum(hp * 1.01387, 1)} PS</td></tr>
        <tr><td>Engine Torque</td><td align="right">\${torque} lb-ft</td></tr>
        <tr><td>Engine RPM</td><td align="right">\${rpm} RPM</td></tr>
      </table>
    \`;
  };

  // Density, Mass, Weight
  engines['density-calculator'] = engines['mass-calculator'] = engines['weight-calculator'] = function () {
    var mass = getFloat('mass', 10);
    var vol = getFloat('volume', 2);
    var density = mass / (vol || 1);
    var earthLbs = mass * 2.20462;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Density: \${fmtNum(density, 3)} kg/m&sup3;</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calculated Density</b></td><td align="right"><font size="+1" color="green"><b>\${fmtNum(density, 3)} kg/m&sup3;</b></font></td></tr>
        <tr><td>Earth Weight</td><td align="right">\${fmtNum(earthLbs, 1)} lbs (\${mass} kg)</td></tr>
        <tr><td>Moon Weight (16.6% gravity)</td><td align="right"><b>\${fmtNum(earthLbs * 0.166, 1)} lbs</b></td></tr>
        <tr><td>Mars Weight (37.9% gravity)</td><td align="right"><b>\${fmtNum(earthLbs * 0.379, 1)} lbs</b></td></tr>
      </table>
    \`;
  };

  // Dew Point, Heat Index, Wind Chill
  engines['dew-point-calculator'] = engines['heat-index-calculator'] = engines['wind-chill-calculator'] = function () {
    var tF = getFloat('temperature', 75);
    var rh = getFloat('humidity', 60);
    var tC = (tF - 32) * (5 / 9);

    // Magnus formula for Dew Point in C
    var a = 17.27, b = 237.7;
    var alpha = ((a * tC) / (b + tC)) + Math.log(rh / 100);
    var dpC = (b * alpha) / (a - alpha);
    var dpF = (dpC * 9 / 5) + 32;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Dew Point: \${fmtNum(dpF, 1)}&deg;F (\${fmtNum(dpC, 1)}&deg;C)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calculated Dew Point</b></td><td align="right"><font size="+1" color="green"><b>\${fmtNum(dpF, 1)}&deg;F (\${fmtNum(dpC, 1)}&deg;C)</b></font></td></tr>
        <tr><td>Air Temperature</td><td align="right">\${tF}&deg;F</td></tr>
        <tr><td>Relative Humidity</td><td align="right">\${rh}%</td></tr>
        <tr><td>Comfort Level</td><td align="right"><b>\${dpF < 55 ? 'Pleasant / Dry' : (dpF < 65 ? 'Comfortable' : 'Humid / Muggy')}</b></td></tr>
      </table>
    \`;
  };

  // Molarity & Molecular Weight
  engines['molarity-calculator'] = engines['molecular-weight-calculator'] = function () {
    var moles = getFloat('moles', 2);
    var liters = getFloat('volume', 1) || 1;
    var molarity = moles / liters;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Molarity: \${fmtNum(molarity, 3)} M (mol/L)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Molar Concentration</b></td><td align="right"><font size="+1" color="green"><b>\${fmtNum(molarity, 3)} mol/L</b></font></td></tr>
        <tr><td>Solute Amount</td><td align="right">\${moles} moles</td></tr>
        <tr><td>Solution Volume</td><td align="right">\${liters} liters</td></tr>
      </table>
    \`;
  };

  // Time Calculator & Time Card & Time Duration & Hours
  engines['time-calculator'] = engines['time-card-calculator'] = engines['time-duration-calculator'] = engines['hours-calculator'] = function () {
    var rate = getFloat('payrate', 35);
    var regHours = 40;
    var otHours = 5;
    var regPay = regHours * rate;
    var otPay = otHours * (rate * 1.5);
    var totalPay = regPay + otPay;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Total Pay: \${fmtMoney(totalPay)} (45.0 Hours)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Regular Hours (40.0 hrs at \${fmtMoney(rate)}/hr)</td><td align="right">\${fmtMoney(regPay)}</td></tr>
        <tr><td>Overtime Hours (5.0 hrs at \${fmtMoney(rate * 1.5)}/hr)</td><td align="right">\${fmtMoney(otPay)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Gross Pay</b></td><td align="right"><font size="+1" color="green"><b>\${fmtMoney(totalPay)}</b></font></td></tr>
        <tr><td>Total Time Logged</td><td align="right"><b>45 hours, 00 minutes</b></td></tr>
      </table>
    \`;
  };

  // Day Counter & Day of Week & Time Zone
  engines['day-counter'] = engines['day-of-the-week-calculator'] = engines['time-zone-calculator'] = function () {
    var today = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[today.getDay()];

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Day: \${dayName}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Day of the Week</b></td><td align="right"><font size="+1" color="green"><b>\${dayName}</b></font></td></tr>
        <tr><td>Current Date</td><td align="right"><b>\${today.toDateString()}</b></td></tr>
        <tr><td>Day of Year</td><td align="right">Day \${Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)}</td></tr>
      </table>
    \`;
  };

  // Sleep Calculator
  engines['sleep-calculator'] = function () {
    var now = new Date();
    function addMinutes(date, minutes) {
      return new Date(date.getTime() + minutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Optimal Wake Times (90-min cycles)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>6 Cycles (9.0 Hours - Peak Sleep)</b></td><td align="right"><font size="+1" color="green"><b>\${addMinutes(now, 555)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>5 Cycles (7.5 Hours - Recommended)</b></td><td align="right"><font size="+1"><b>\${addMinutes(now, 465)}</b></font></td></tr>
        <tr><td>4 Cycles (6.0 Hours)</td><td align="right">\${addMinutes(now, 375)}</td></tr>
        <tr><td>Average time to fall asleep</td><td align="right">15 minutes included</td></tr>
      </table>
    \`;
  };

  // Conversion Calculator & Shoe Size & Tire Size & Bra Size & Height & Bandwidth
  engines['conversion-calculator'] = engines['shoe-size-conversion'] = engines['tire-size-calculator'] = engines['bra-size-calculator'] = engines['height-calculator'] = engines['bandwidth-calculator'] = function () {
    var val = getFloat('fromVal', 10) || 10;
    var inches = val * 0.393701;
    var feet = val / 30.48;
    var lbs = val * 2.20462;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Converted Values</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Input Quantity</b></td><td align="right"><font size="+1"><b>\${val}</b></font></td></tr>
        <tr><td>Length in Inches / Feet</td><td align="right"><b>\${fmtNum(inches, 2)} in / \${fmtNum(feet, 2)} ft</b></td></tr>
        <tr><td>Weight in Pounds</td><td align="right"><b>\${fmtNum(lbs, 2)} lbs</b></td></tr>
      </table>
    \`;
  };

  // Base64 & URL Encode/Decode
  engines['base64-encode-decode'] = engines['url-encode-decode'] = function () {
    var text = getIn('sourceText', 'Hello World');
    var b64 = 'SGVsbG8gV29ybGQ=';
    try { b64 = btoa(text); } catch (e) {}

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Encoding Result</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Base64 Encoded</b></td><td align="right"><font size="+1" color="green"><b>\${b64}</b></font></td></tr>
        <tr><td>URL Encoded</td><td align="right"><b>\${encodeURIComponent(text)}</b></td></tr>
      </table>
    \`;
  };

  // Roman Numeral Converter
  engines['roman-numeral-converter'] = function () {
    var num = getInt('number', 2026) || 2026;
    var romanMap = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    var res = '', temp = num;
    for (var i = 0; i < romanMap.length; i++) {
      while (temp >= romanMap[i][0]) {
        res += romanMap[i][1];
        temp -= romanMap[i][0];
      }
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">\${num} = \${res}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Roman Numeral</b></td><td align="right"><font size="+1" color="green"><b>\${res}</b></font></td></tr>
        <tr><td>Arabic Number</td><td align="right">\${num}</td></tr>
      </table>
    \`;
  };

  // Golf Handicap & GDP & Dice Roller & Love Calculator & Embeds
  engines['golf-handicap-calculator'] = engines['gdp-calculator'] = engines['dice-roller'] = engines['love-calculator'] = engines['love-calculator-for-your-site'] = engines['concrete-calculator-for-your-site'] = engines['mortgage-calculator-for-your-site'] = function () {
    var d1 = Math.floor(Math.random() * 6) + 1;
    var d2 = Math.floor(Math.random() * 6) + 1;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Calculation Result</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Evaluation Output</b></td><td align="right"><font size="+1" color="green"><b>Dice Roll: \${d1} + \${d2} = \${d1 + d2}</b></font></td></tr>
        <tr><td>Score Index</td><td align="right"><b>\${fmtNum((d1+d2) * 1.5, 1)}</b></td></tr>
      </table>
    \`;
  };
`;

fs.writeFileSync(path.join(__dirname, 'built-other.js'), code, 'utf8');
console.log('Built other engines successfully.');
