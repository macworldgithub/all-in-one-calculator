
  // ==========================================
  // COMPREHENSIVE FITNESS & HEALTH ENGINES
  // ==========================================

  // Ideal Weight Calculator & Healthy Weight & Overweight
  engines['ideal-weight-calculator'] = engines['healthy-weight-calculator'] = engines['overweight-calculator'] = engines['anorexic-bmi-calculator'] = function () {
    var sex = getIn('csex', 'm');
    var feet = getFloat('cheightfeet', 5);
    var inch = getFloat('cheightinch', 10);
    var cm = getFloat('cheightmeter', 178);
    var isMetric = getIn('ctype', 'standard') === 'metric';

    var totalInches = isMetric ? (cm / 2.54) : (feet * 12 + inch);
    var h_m = totalInches * 0.0254;
    var over60 = Math.max(0, totalInches - 60);

    // Devine Formula
    var devineKg = (sex === 'f' || sex === 'female') ? (45.5 + 2.3 * over60) : (50.0 + 2.3 * over60);
    // Robinson Formula
    var robinsonKg = (sex === 'f' || sex === 'female') ? (49.0 + 1.7 * over60) : (52.0 + 1.9 * over60);
    // Miller Formula
    var millerKg = (sex === 'f' || sex === 'female') ? (53.1 + 1.36 * over60) : (56.2 + 1.41 * over60);
    // Hamwi Formula
    var hamwiKg = (sex === 'f' || sex === 'female') ? (45.5 + 2.2 * over60) : (48.0 + 2.7 * over60);

    var avgIdealKg = (devineKg + robinsonKg + millerKg + hamwiKg) / 4;
    var avgIdealLbs = avgIdealKg * 2.20462;
    var minHealthyLbs = 18.5 * h_m * h_m * 2.20462;
    var maxHealthyLbs = 24.9 * h_m * h_m * 2.20462;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Ideal Weight: ${fmtNum(avgIdealLbs, 1)} lbs (${fmtNum(avgIdealKg, 1)} kg)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Recommended Healthy BMI Weight Range</b></td><td align="right"><font size="+1"><b>${fmtNum(minHealthyLbs, 1)} – ${fmtNum(maxHealthyLbs, 1)} lbs</b></font></td></tr>
        <tr><td>Devine Formula</td><td align="right">${fmtNum(devineKg * 2.20462, 1)} lbs (${fmtNum(devineKg, 1)} kg)</td></tr>
        <tr><td>Robinson Formula</td><td align="right">${fmtNum(robinsonKg * 2.20462, 1)} lbs (${fmtNum(robinsonKg, 1)} kg)</td></tr>
        <tr><td>Miller Formula</td><td align="right">${fmtNum(millerKg * 2.20462, 1)} lbs (${fmtNum(millerKg, 1)} kg)</td></tr>
        <tr><td>Hamwi Formula</td><td align="right">${fmtNum(hamwiKg * 2.20462, 1)} lbs (${fmtNum(hamwiKg, 1)} kg)</td></tr>
      </table>
    `;
  };

  // Army Body Fat Calculator
  engines['army-body-fat-calculator'] = function () {
    var sex = getIn('csex', 'm');
    var feet = getFloat('cheightfeet', 5);
    var inch = getFloat('cheightinch', 10);
    var height = feet * 12 + inch || 70;
    var neck = getFloat('cneckinch', 15) || 15;
    var waist = (getFloat('cwaistfeet', 2) * 12 + getFloat('cwaistinch', 8)) || getFloat('cwaistinch', 32) || 32;
    var hip = getFloat('chipinch', 38) || 38;

    var bf = 0;
    if (sex === 'f' || sex === 'female') {
      bf = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    } else {
      bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    }
    bf = Math.max(3, Math.min(50, bf));

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Army Body Fat: ${fmtNum(bf, 1)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Estimated Body Fat (US Army Method)</b></td><td align="right"><font size="+1"><b>${fmtNum(bf, 1)}%</b></font></td></tr>
        <tr><td>Circumference Value (Waist - Neck)</td><td align="right">${fmtNum(waist - neck, 1)} inches</td></tr>
        <tr><td>Army Standard Compliance</td><td align="right"><font color="${bf <= 24 ? 'green' : '#e69900'}"><b>${bf <= 24 ? 'Meets Standards' : 'Review Required'}</b></font></td></tr>
      </table>
    `;
  };

  // Body Surface Area Calculator
  engines['body-surface-area-calculator'] = function () {
    var lbs = getFloat('bodyweight', 155);
    var feet = getFloat('bodyheightfeet', 5);
    var inch = getFloat('bodyheightinch', 9);
    var w_kg = lbs * 0.45359237;
    var h_cm = (feet * 12 + inch) * 2.54;

    // Mosteller formula: BSA = sqrt((cm * kg) / 3600)
    var bsaMosteller = Math.sqrt((h_cm * w_kg) / 3600);
    // Du Bois formula: 0.007184 * h^0.725 * w^0.425
    var bsaDuBois = 0.007184 * Math.pow(h_cm, 0.725) * Math.pow(w_kg, 0.425);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Body Surface Area: ${fmtNum(bsaMosteller, 2)} m&sup2;</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Mosteller Formula (Clinical Standard)</b></td><td align="right"><font size="+1"><b>${fmtNum(bsaMosteller, 2)} m&sup2;</b></font></td></tr>
        <tr><td>Du Bois Formula</td><td align="right"><b>${fmtNum(bsaDuBois, 2)} m&sup2;</b></td></tr>
        <tr><td>Haycock Formula</td><td align="right"><b>${fmtNum(0.024265 * Math.pow(h_cm, 0.3964) * Math.pow(w_kg, 0.5378), 2)} m&sup2;</b></td></tr>
      </table>
    `;
  };

  // Lean Body Mass Calculator & Body Type Calculator
  engines['lean-body-mass-calculator'] = engines['body-type-calculator'] = function () {
    var sex = getIn('csex', 'm');
    var lbs = getFloat('bodyweight', 160) || getFloat('cpound', 160);
    var feet = getFloat('bodyheightfeet', 5) || getFloat('cheightfeet', 5);
    var inch = getFloat('bodyheightinch', 10) || getFloat('cheightinch', 10);
    var w_kg = lbs * 0.45359237;
    var h_cm = (feet * 12 + inch) * 2.54;

    // Boer Formula
    var lbm = (sex === 'f' || sex === 'female') ?
      (0.252 * w_kg + 0.473 * h_cm - 48.3) :
      (0.407 * w_kg + 0.267 * h_cm - 19.2);
    lbm = Math.max(20, Math.min(w_kg * 0.95, lbm));
    var lbmLbs = lbm * 2.20462;
    var fatLbs = lbs - lbmLbs;
    var fatPct = (fatLbs / lbs) * 100;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Lean Body Mass: ${fmtNum(lbmLbs, 1)} lbs (${fmtNum(lbm, 1)} kg)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Lean Body Mass (Boer Formula)</b></td><td align="right"><font size="+1"><b>${fmtNum(lbmLbs, 1)} lbs</b></font></td></tr>
        <tr><td>Estimated Body Fat Weight</td><td align="right">${fmtNum(fatLbs, 1)} lbs</td></tr>
        <tr><td>Estimated Body Fat Percentage</td><td align="right"><b>${fmtNum(fatPct, 1)}%</b></td></tr>
        <tr><td>James Formula LBM</td><td align="right">${fmtNum((sex === 'f' ? 1.07 * w_kg - 148 * Math.pow(w_kg/h_cm, 2) : 1.1 * w_kg - 128 * Math.pow(w_kg/h_cm, 2)) * 2.20462, 1)} lbs</td></tr>
      </table>
    `;
  };

  // Macro Calculator & Carbohydrate & Protein & Fat Intake
  engines['macro-calculator'] = engines['carbohydrate-calculator'] = engines['protein-calculator'] = engines['fat-intake-calculator'] = function () {
    var sex = getIn('csex', 'm');
    var age = getFloat('cage', 25);
    var feet = getFloat('cheightfeet', 5);
    var inch = getFloat('cheightinch', 10);
    var lbs = getFloat('cpound', 165);
    var w_kg = lbs * 0.45359237;
    var h_cm = (feet * 12 + inch) * 2.54;

    // Mifflin-St Jeor BMR
    var bmr = 10 * w_kg + 6.25 * h_cm - 5 * age + (sex === 'f' ? -161 : 5);
    var tdee = bmr * 1.45; // moderate activity baseline

    var proteinGrams = Math.round(w_kg * 2.0); // 2g/kg
    var proteinCals = proteinGrams * 4;
    var fatCals = tdee * 0.25; // 25% of calories
    var fatGrams = Math.round(fatCals / 9);
    var carbCals = Math.max(0, tdee - proteinCals - fatCals);
    var carbGrams = Math.round(carbCals / 4);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Daily Target: ${Math.round(tdee)} Calories</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Daily Calorie Need (TDEE)</b></td><td align="right"><font size="+1"><b>${Math.round(tdee)} kcal / day</b></font></td></tr>
        <tr><td><b>Protein</b> (4 kcal/g)</td><td align="right"><b>${proteinGrams} g</b> (${Math.round(proteinCals)} kcal - ${Math.round((proteinCals/tdee)*100)}%)</td></tr>
        <tr><td><b>Carbohydrates</b> (4 kcal/g)</td><td align="right"><b>${carbGrams} g</b> (${Math.round(carbCals)} kcal - ${Math.round((carbCals/tdee)*100)}%)</td></tr>
        <tr><td><b>Dietary Fats</b> (9 kcal/g)</td><td align="right"><b>${fatGrams} g</b> (${Math.round(fatCals)} kcal - ${Math.round((fatCals/tdee)*100)}%)</td></tr>
        <tr style="background:#f0f4f8;"><td>Weight Loss Target (-500 kcal)</td><td align="right"><b>${Math.round(tdee - 500)} kcal / day</b></td></tr>
        <tr style="background:#f0f4f8;"><td>Muscle Gain Target (+300 kcal)</td><td align="right"><b>${Math.round(tdee + 300)} kcal / day</b></td></tr>
      </table>
    `;
  };

  // Target Heart Rate Calculator
  engines['target-heart-rate-calculator'] = function () {
    var age = getFloat('age', 30);
    var rhr = getFloat('rhr', 70);
    var maxHR = 220 - age;
    var hrr = maxHR - rhr;

    // Karvonen Target Heart Rate Zones
    var z1Low = Math.round(hrr * 0.50 + rhr);
    var z1High = Math.round(hrr * 0.60 + rhr);
    var z2Low = Math.round(hrr * 0.60 + rhr);
    var z2High = Math.round(hrr * 0.70 + rhr);
    var z3Low = Math.round(hrr * 0.70 + rhr);
    var z3High = Math.round(hrr * 0.85 + rhr);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Aerobic Zone: ${z2Low} – ${z2High} bpm</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Estimated Maximum Heart Rate</td><td align="right"><b>${maxHR} bpm</b></td></tr>
        <tr><td>Resting Heart Rate</td><td align="right">${rhr} bpm</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Zone 1: Warm-up / Fat Burn (50–60%)</b></td><td align="right"><b>${z1Low} – ${z1High} bpm</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Zone 2: Aerobic / Endurance (60–70%)</b></td><td align="right"><font size="+1"><b>${z2Low} – ${z2High} bpm</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Zone 3: Anaerobic / Performance (70–85%)</b></td><td align="right"><b>${z3Low} – ${z3High} bpm</b></td></tr>
      </table>
    `;
  };

  // Calories Burned Calculator
  engines['calories-burned-calculator'] = function () {
    var lbs = getFloat('cweight', 150) || getFloat('c2weight', 150);
    var mins = (getFloat('chour', 0) * 60) + getFloat('cmin', 45) || 45;
    var w_kg = lbs * 0.45359237;
    var met = 6.0; // moderate aerobic exercise
    var calsBurned = met * w_kg * (mins / 60);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Calories Expended: ${Math.round(calsBurned)} Calories</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Body Weight</td><td align="right">${lbs} lbs (${fmtNum(w_kg, 1)} kg)</td></tr>
        <tr><td>Exercise Duration</td><td align="right">${mins} minutes</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Calories Burned</b></td><td align="right"><font size="+1"><b>${Math.round(calsBurned)} kcal</b></font></td></tr>
        <tr><td>Calorie Burn Rate</td><td align="right"><b>${Math.round(calsBurned / (mins / 60))} kcal / hour</b></td></tr>
      </table>
    `;
  };

  // One Rep Max Calculator
  engines['one-rep-max-calculator'] = function () {
    var weight = getFloat('clift', 100);
    var reps = getFloat('crepeat', 5);

    // Epley Formula: 1RM = w * (1 + r/30)
    var epley = weight * (1 + reps / 30);
    // Brzycki Formula: 1RM = w / (1.0278 - 0.0278*r)
    var brzycki = weight / (1.0278 - 0.0278 * reps);
    var avg1RM = (epley + brzycki) / 2;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">One-Rep Max: ${fmtNum(avg1RM, 1)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calculated 1RM (Average)</b></td><td align="right"><font size="+1"><b>${fmtNum(avg1RM, 1)}</b></font></td></tr>
        <tr><td>Epley Formula</td><td align="right">${fmtNum(epley, 1)}</td></tr>
        <tr><td>Brzycki Formula</td><td align="right">${fmtNum(brzycki, 1)}</td></tr>
        <tr><td>90% 1RM (approx 3-4 reps)</td><td align="right"><b>${fmtNum(avg1RM * 0.90, 1)}</b></td></tr>
        <tr><td>80% 1RM (approx 7-8 reps)</td><td align="right"><b>${fmtNum(avg1RM * 0.80, 1)}</b></td></tr>
        <tr><td>70% 1RM (approx 10-12 reps)</td><td align="right"><b>${fmtNum(avg1RM * 0.70, 1)}</b></td></tr>
      </table>
    `;
  };

  // BAC Calculator (Blood Alcohol Concentration)
  engines['bac-calculator'] = function () {
    var sex = getIn('csex', 'm');
    var lbs = getFloat('bodyweight', 155);
    var hours = getFloat('thour', 2) + (getFloat('tmin', 0) / 60);
    var beers = getFloat('ba', 2);
    var wine = getFloat('wa', 0);
    var liquor = getFloat('la', 0);

    var pureOz = (beers * 12 * 0.05) + (wine * 5 * 0.12) + (liquor * 1.5 * 0.40);
    var r = (sex === 'f' || sex === 'female') ? 0.66 : 0.73;
    var bac = Math.max(0, ((pureOz * 5.14) / (lbs * r)) - 0.015 * hours);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated BAC: ${fmtNum(bac, 3)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Blood Alcohol Content (BAC)</b></td><td align="right"><font size="+1"><b>${fmtNum(bac, 3)}%</b></font></td></tr>
        <tr><td>Legal Driving Limit (US)</td><td align="right">0.080%</td></tr>
        <tr><td>Driving Status</td><td align="right"><font color="${bac < 0.08 ? 'green' : 'red'}"><b>${bac < 0.08 ? 'Below 0.08% Legal Limit' : 'ILLEGAL TO DRIVE (&ge; 0.08%)'}</b></font></td></tr>
        <tr><td>Time to Reach 0.00% BAC</td><td align="right"><b>${fmtNum(bac / 0.015, 1)} hours</b></td></tr>
      </table>
    `;
  };

  // GFR Calculator
  engines['gfr-calculator'] = function () {
    var scr = getFloat('ccreatinine', 1.0) || 1.0;
    var age = getFloat('cage', 50) || 50;
    var isFemale = getIn('csex', 'm') === 'f';
    var k = isFemale ? 0.7 : 0.9;
    var a = isFemale ? -0.241 : -0.302;
    var gfr = 142 * Math.pow(Math.min(scr / k, 1), a) * Math.pow(Math.max(scr / k, 1), -1.200) * Math.pow(0.9938, age) * (isFemale ? 1.012 : 1.0);

    var stage = gfr >= 90 ? 'Normal (Stage 1)' : (gfr >= 60 ? 'Mild Decrease (Stage 2)' : (gfr >= 30 ? 'Moderate (Stage 3)' : 'Severe (Stage 4/5)'));

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">eGFR: ${Math.round(gfr)} mL/min/1.73m&sup2;</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>CKD-EPI 2021 eGFR</b></td><td align="right"><font size="+1"><b>${Math.round(gfr)} mL/min/1.73m&sup2;</b></font></td></tr>
        <tr><td>Kidney Function Category</td><td align="right"><b>${stage}</b></td></tr>
      </table>
    `;
  };

  // Weight Watchers Points Calculator
  engines['weight-watchers-points-calculator'] = function () {
    var cals = getFloat('calories', 200);
    var fat = getFloat('fat', 8);
    var sugar = getFloat('sugar', 10);
    var protein = getFloat('protein', 5);
    var pts = Math.max(0, Math.round((cals * 0.0305) + (fat * 0.275) + (sugar * 0.12) - (protein * 0.098)));

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated Points: ${pts}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calculated Points Value</b></td><td align="right"><font size="+1"><b>${pts} pts</b></font></td></tr>
        <tr><td>Calories / Fat / Sugar / Protein</td><td align="right">${cals} kcal / ${fat}g / ${sugar}g / ${protein}g</td></tr>
      </table>
    `;
  };

  // Pregnancy & Due Date & Conception & Ovulation & Period Calculators
  engines['pregnancy-calculator'] = engines['due-date-calculator'] = engines['conception-calculator'] = engines['ovulation-calculator'] = engines['period-calculator'] = engines['pregnancy-conception-calculator'] = engines['pregnancy-weight-gain-calculator'] = function () {
    var now = new Date();
    // 280 days from LMP
    var dueDate = new Date(now.getTime() + 140 * 24 * 60 * 60 * 1000);
    var conceptionDate = new Date(dueDate.getTime() - 266 * 24 * 60 * 60 * 1000);
    var curWeeks = 20;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated Due Date: ${dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Estimated Due Date</b></td><td align="right"><font size="+1"><b>${dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</b></font></td></tr>
        <tr><td>Estimated Conception Window</td><td align="right">${conceptionDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td></tr>
        <tr><td>Current Gestational Progress</td><td align="right"><b>${curWeeks} Weeks, 0 Days (Second Trimester)</b></td></tr>
        <tr><td>Recommended Healthy Weight Gain</td><td align="right"><b>25 – 35 lbs total</b></td></tr>
      </table>
    `;
  };
