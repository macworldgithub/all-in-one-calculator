/* Quick Inline Converter for "Other Units" tabs across fitness, energy & mileage calculators */

var ucvtlA = [
  ["Height / Length", "ucvtlA"],
  ["meter", 1],
  ["centimeter", 0.01],
  ["millimeter", 0.001],
  ["kilometer", 1000],
  ["yard", 0.9144],
  ["foot", 0.3048],
  ["inch", 0.0254],
  ["mile", 1609.344]
];

var ucvtwA = [
  ["Weight", "ucvtwA"],
  ["kilogram", 1],
  ["gram", 0.001],
  ["milligram", 1e-6],
  ["metric ton", 1000],
  ["long ton", 1016.04608],
  ["short ton", 907.184],
  ["stone", 6.35029318],
  ["pound", 0.45359237],
  ["ounce", 0.028349523125],
  ["carat", 0.0002]
];

var ucvteA = [
  ["Energy", "ucvteA"],
  ["Calorie (kcal)", 4.184],
  ["Kilojoule (kJ)", 1],
  ["Megajoule (MJ)", 1000],
  ["Watt-hour (Wh)", 3.6]
];

var ucvtdA = [
  ["Distance", "ucvtdA"],
  ["mile", 1609.344],
  ["kilometer", 1000],
  ["meter", 1],
  ["yard", 0.9144],
  ["foot", 0.3048]
];

var ucvtvA = [
  ["Fuel Volume", "ucvtvA"],
  ["US gallon", 3.785411784],
  ["liter", 1],
  ["Imperial gallon", 4.54609],
  ["milliliter", 0.001]
];

var ucvtRegistry = {
  Height: { data: ucvtlA, defFrom: 2, defTo: 7 },
  Weight: { data: ucvtwA, defFrom: 1, defTo: 8 },
  Energy: { data: ucvteA, defFrom: 2, defTo: 1 },
  Distance: { data: ucvtdA, defFrom: 2, defTo: 1 },
  Volume: { data: ucvtvA, defFrom: 2, defTo: 1 }
};

function ucvtSafeNum(raw) {
  var s = String(raw == null ? "" : raw).replace(/[\s,]/g, "");
  if (!s) return NaN;
  var n = Number(s);
  return isFinite(n) ? n : NaN;
}

function ucvtFormat(num) {
  if (typeof formatNum === "function") return formatNum(num);
  if (!isFinite(num)) return "";
  return Number(num.toPrecision(8)).toString();
}

function ucvtBuildGroupHtml(key, labelOverride) {
  var entry = ucvtRegistry[key];
  if (!entry) return "";
  var list = entry.data;
  var title = labelOverride || list[0][0];
  var html = '<div class="ucvt-group">' +
    '<div><b>' + title + ' Converter:</b></div>' +
    '<div class="ucvt-row-wrap">' +
      '<input type="text" class="inhalf" name="ucvt' + key + 'v" value="1" placeholder="Value" oninput="ucvtCalcGroup(\'' + key + '\', 0);" onkeyup="ucvtCalcGroup(\'' + key + '\', 0);" />' +
      '<select name="ucvt' + key + 'from" onchange="ucvtCalcGroup(\'' + key + '\', 0);">';
  for (var i = 1; i < list.length; i++) {
    html += '<option value="' + i + '"' + (i === entry.defFrom ? ' selected' : '') + '>' + list[i][0] + '</option>';
  }
  html += '</select><span>=</span><select name="ucvt' + key + 'to" onchange="ucvtCalcGroup(\'' + key + '\', 0);">';
  for (var j = 1; j < list.length; j++) {
    html += '<option value="' + j + '"' + (j === entry.defTo ? ' selected' : '') + '>' + list[j][0] + '</option>';
  }
  html += '</select>' +
      '<button type="button" onclick="return ucvtCalcGroup(\'' + key + '\', 1);">Convert</button>' +
    '</div>' +
    '<div class="ucvt-out" id="ucvt' + key + 'Out"></div>' +
  '</div>';
  return html;
}

function ucvtBuildFuelHtml() {
  var opts = '<option value="mpg">MPG (US)</option><option value="kmpl">km / L</option><option value="lp100">L / 100 km</option><option value="mpguk">MPG (UK)</option>';
  return '<div class="ucvt-group">' +
    '<div><b>Fuel Economy Converter:</b></div>' +
    '<div class="ucvt-row-wrap">' +
      '<input type="text" class="inhalf" name="ucvtFuelv" value="8" placeholder="Value" oninput="ucvtCalcFuel();" onkeyup="ucvtCalcFuel();" />' +
      '<select name="ucvtFuelfrom" onchange="ucvtCalcFuel();">' + opts.replace('value="lp100"', 'value="lp100" selected') + '</select>' +
      '<span>=</span>' +
      '<select name="ucvtFuelto" onchange="ucvtCalcFuel();">' + opts + '</select>' +
      '<button type="button" onclick="return ucvtCalcFuel();">Convert</button>' +
    '</div>' +
    '<div class="ucvt-out" id="ucvtFuelOut"></div>' +
  '</div>';
}

function ucvtCalcFuel() {
  var f = document.forms.ucvtform;
  var out = document.getElementById("ucvtFuelOut");
  if (!f || !out) return false;
  var val = ucvtSafeNum(f.ucvtFuelv.value);
  if (isNaN(val) || val <= 0) {
    out.innerHTML = (f.ucvtFuelv.value || "").trim() ? '<span style="color:#ef4444;">Please provide a positive number.</span>' : "";
    return false;
  }
  var fromU = f.ucvtFuelfrom.value;
  var toU = f.ucvtFuelto.value;
  var mpg = 0;
  if (fromU === "mpg") mpg = val;
  else if (fromU === "kmpl") mpg = val * 2.35214583;
  else if (fromU === "lp100") mpg = 235.214583 / val;
  else if (fromU === "mpguk") mpg = val / 1.20095;

  var res = 0;
  if (toU === "mpg") res = mpg;
  else if (toU === "kmpl") res = mpg / 2.35214583;
  else if (toU === "lp100") res = 235.214583 / mpg;
  else if (toU === "mpguk") res = mpg * 1.20095;

  var names = { mpg: "MPG (US)", kmpl: "km/L", lp100: "L/100km", mpguk: "MPG (UK)" };
  out.innerHTML = '<b>Result:</b> ' + val + ' ' + names[fromU] + ' = <b>' + ucvtFormat(res) + '</b> ' + names[toU];
  return false;
}

function ucvtCalcGroup(key) {
  var f = document.forms.ucvtform;
  var out = document.getElementById("ucvt" + key + "Out");
  var entry = ucvtRegistry[key];
  if (!f || !out || !entry) return false;
  var vEl = f["ucvt" + key + "v"];
  var fromEl = f["ucvt" + key + "from"];
  var toEl = f["ucvt" + key + "to"];
  var raw = vEl ? vEl.value : "";
  var num = ucvtSafeNum(raw);
  var list = entry.data;
  var fi = parseInt(fromEl ? fromEl.value : entry.defFrom, 10);
  var ti = parseInt(toEl ? toEl.value : entry.defTo, 10);
  if (!isNaN(num) && list[fi] && list[ti]) {
    var result = (num * list[fi][1]) / list[ti][1];
    out.innerHTML = '<b>Result:</b> ' + raw + ' ' + list[fi][0] + ' = <b>' + ucvtFormat(result) + '</b> ' + list[ti][0];
  } else {
    out.innerHTML = (raw || "").trim() ? '<span style="color:#ef4444;">Please provide a valid number!</span>' : "";
  }
  return false;
}

function ucvtCalcHeight(btnFlag) { return ucvtCalcGroup("Height", btnFlag); }
function ucvtCalcWeight(btnFlag) { return ucvtCalcGroup("Weight", btnFlag); }

function ucvtCloseCvt() {
  var w1 = document.getElementById("ucvtwraper");
  var w2 = document.getElementById("ucframe");
  var w3 = document.getElementById("ucframe2");
  if (w1) w1.innerHTML = "";
  if (w2) w2.innerHTML = "";
  if (w3) w3.innerHTML = "";
  return false;
}

function ucvtPopCvt(targetId) {
  var target = (targetId && document.getElementById(targetId)) ||
               document.getElementById("ucvtwraper") ||
               document.getElementById("ucframe");
  if (!target) return false;

  var slug = (typeof window !== "undefined" && window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : "";
  var isMileage = slug.indexOf("gas-mileage") !== -1;
  var isEnergy = /bmr|calorie|tdee|macro|protein|fat-intake|carbohydrate/.test(slug);

  var groupsHtml = "";
  if (isMileage) {
    groupsHtml += ucvtBuildGroupHtml("Distance") + ucvtBuildGroupHtml("Volume") + ucvtBuildFuelHtml();
  } else {
    groupsHtml += ucvtBuildGroupHtml("Height") + ucvtBuildGroupHtml("Weight");
    if (isEnergy) groupsHtml += ucvtBuildGroupHtml("Energy");
  }

  target.innerHTML =
    '<div class="ucvt-card">' +
      '<div class="ucvt-header">' +
        '<p class="ucvt-title">Quick Unit Converter (convert to US / Metric values)</p>' +
        '<button type="button" class="ucvt-close" aria-label="Close converter" onclick="return ucvtCloseCvt();">&times;</button>' +
      '</div>' +
      '<form name="ucvtform" onsubmit="return false;">' + groupsHtml + '</form>' +
    '</div>';

  if (isMileage) {
    ucvtCalcGroup("Distance");
    ucvtCalcGroup("Volume");
    ucvtCalcFuel();
  } else {
    ucvtCalcGroup("Height");
    ucvtCalcGroup("Weight");
    if (isEnergy) ucvtCalcGroup("Energy");
  }
  return false;
}

if (typeof window !== "undefined") {
  window.ucvtPopCvt = ucvtPopCvt;
  window.ucvtCloseCvt = ucvtCloseCvt;
  window.ucvtCalcGroup = ucvtCalcGroup;
  window.ucvtCalcHeight = ucvtCalcHeight;
  window.ucvtCalcWeight = ucvtCalcWeight;
  window.ucvtCalcFuel = ucvtCalcFuel;

  if (typeof window.setYearRate !== "function") {
    window.setYearRate = function (rate, years) {
      var termEl = document.getElementById("cloanterm") || document.querySelector('[name="cloanterm"], [name="cloanterm1"]');
      var rateEl = document.getElementById("cinterestrate") || document.querySelector('[name="cinterestrate"], [name="cinterest1"], [name="cinterest"]');
      if (termEl) termEl.value = years;
      if (rateEl) rateEl.value = rate;
      var f = (termEl && termEl.form) || (rateEl && rateEl.form) || document.calform || document.querySelector("#content form");
      if (f) f.submit();
      return false;
    };
  }
}
