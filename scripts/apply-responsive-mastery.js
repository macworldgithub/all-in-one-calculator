const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Section 1: Adornments, Unit Spans, Radios, Grade/GPA Flex System
const modernEnhancements = `
/* --- Currency & Percentage Input Adornments --- */
.indollar {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' x2='12' y1='2' y2='22'/%3E%3Cpath d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/%3E%3C/svg%3E");
  background-position: 8px center;
  background-repeat: no-repeat;
  padding-left: 28px !important;
}
.inpct {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' x2='5' y1='5' y2='19'/%3E%3Ccircle cx='6.5' cy='6.5' r='2.5'/%3E%3Ccircle cx='17.5' cy='17.5' r='2.5'/%3E%3C/svg%3E");
  background-position: right 10px center;
  background-repeat: no-repeat;
  padding-right: 28px !important;
}

/* --- Inline Unit Spans & Suffixes --- */
.inuiyearspan, .inuipoundspan, .inuifootspan, .inuiinchspan, .inuickspan, .inui1cspan {
  margin-left: -54px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  pointer-events: none;
  display: inline-block;
  vertical-align: middle;
}
.inuiyear { padding-right: 54px !important; }
.inuipound { padding-right: 58px !important; }
.inuifoot { padding-right: 42px !important; }
.inuiinch { padding-right: 52px !important; }
.inuick { padding-right: 38px !important; }
.inui1c { padding-right: 22px !important; }

/* Keep unit suffix inline with input */
.panel td:has(.inuifootspan),
.panel td:has(.inuiinchspan),
.panel td:has(.inuipoundspan),
.panel td:has(.inuiyearspan),
.panel td:has(.inuickspan),
.panel td:has(.inui1cspan) {
  white-space: nowrap !important;
}

/* --- Modern Custom Radio Buttons & Checkboxes --- */
.cbcontainer {
  display: inline-flex;
  align-items: center;
  position: relative;
  padding-left: 24px;
  margin: 4px 14px 4px 0;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  color: var(--text-secondary);
}
.cbcontainer input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}
.cbmark {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 16px;
  width: 16px;
  background-color: #fff;
  border: 1.5px solid #94a3b8;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}
.rbmark {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 16px;
  width: 16px;
  background-color: #fff;
  border: 1.5px solid #94a3b8;
  border-radius: 50%;
  transition: all 0.15s ease;
}
.cbcontainer:hover input ~ .cbmark,
.cbcontainer:hover input ~ .rbmark {
  border-color: var(--color-primary);
}
.cbcontainer input:checked ~ .cbmark,
.cbcontainer input:checked ~ .rbmark {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.cbmark:after, .rbmark:after {
  content: "";
  position: absolute;
  display: none;
}
.cbcontainer input:checked ~ .cbmark:after,
.cbcontainer input:checked ~ .rbmark:after {
  display: block;
}
.cbcontainer .cbmark:after {
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.cbcontainer .rbmark:after {
  top: 4px;
  left: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
}

/* --- Grade Calculator & GPA Calculator Multi-Row Responsive System --- */
form[name="gradeform"] .panel > tbody > tr > td,
form[name="gradeform"] .panel > tr > td,
form[name="gpaform"] .panel > tbody > tr > td,
form[name="gpaform"] .panel > tr > td {
  padding: 0 !important;
}

form[name="gradeform"] > table.panel,
form[name="gpaform"] > table.panel {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

form[name="gradeform"] td > table:not([align="center"]),
form[name="gpaform"] td > table:not([align="center"]) {
  width: 100% !important;
  max-width: 100% !important;
  border-collapse: collapse !important;
  margin-bottom: 6px !important;
  box-sizing: border-box !important;
}

form[name="gradeform"] td > table:not([align="center"]) > tbody,
form[name="gradeform"] td > table:not([align="center"]) tbody,
form[name="gpaform"] td > table:not([align="center"]) > tbody,
form[name="gpaform"] td > table:not([align="center"]) tbody {
  display: block !important;
  width: 100% !important;
}

form[name="gradeform"] td > table:not([align="center"]) tr,
form[name="gpaform"] td > table:not([align="center"]) tr {
  display: flex !important;
  flex-direction: row !important;
  width: 100% !important;
  align-items: center !important;
  gap: 8px !important;
  box-sizing: border-box !important;
  margin-bottom: 6px !important;
}

form[name="gradeform"] td > table:not([align="center"]) tr[valign="top"],
form[name="gpaform"] td > table:not([align="center"]) tr:has(b) {
  margin-bottom: 8px !important;
  align-items: flex-end !important;
}
form[name="gradeform"] td > table:not([align="center"]) tr[valign="top"] b,
form[name="gpaform"] td > table:not([align="center"]) tr:has(b) b {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
}

/* Col 1: Assignment / Course Name */
form[name="gradeform"] td > table:not([align="center"]) td:first-child,
form[name="gpaform"] td > table:not([align="center"]) td:first-child {
  flex: 2 1 0% !important;
  min-width: 0 !important;
  width: auto !important;
  padding: 0 !important;
}

/* Col 2: Grade / Credits */
form[name="gradeform"] td > table:not([align="center"]) td:nth-child(2),
form[name="gpaform"] td > table:not([align="center"]) td:nth-child(2) {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  width: auto !important;
  padding: 0 !important;
}

/* Col 3: Weight / Grade */
form[name="gradeform"] td > table:not([align="center"]) td:nth-child(3),
form[name="gpaform"] td > table:not([align="center"]) td:nth-child(3) {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  width: auto !important;
  padding: 0 !important;
}

form[name="gradeform"] td > table:not([align="center"]) input,
form[name="gradeform"] td > table:not([align="center"]) select,
form[name="gpaform"] td > table:not([align="center"]) input,
form[name="gpaform"] td > table:not([align="center"]) select {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  padding: 8px 10px !important;
  font-size: 14px !important;
  height: 38px !important;
}
form[name="gradeform"] td > table:not([align="center"]) input[name^="s"],
form[name="gradeform"] td > table:not([align="center"]) input[name^="w"],
form[name="gpaform"] td > table:not([align="center"]) input[name^="ca"],
form[name="gpaform"] td > table:not([align="center"]) select[name^="la"] {
  text-align: center;
}

/* Action buttons table at the bottom of gradeform & gpaform */
form[name="gradeform"] table[style*="padding-top"],
form[name="gpaform"] table[style*="padding-top"] {
  width: 100% !important;
  max-width: 420px !important;
  margin: 14px auto 0 !important;
}
form[name="gradeform"] table[style*="padding-top"] tr,
form[name="gpaform"] table[style*="padding-top"] tr {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  width: 100% !important;
}
form[name="gradeform"] table[style*="padding-top"] td,
form[name="gpaform"] table[style*="padding-top"] td {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0 !important;
}
form[name="gradeform"] table[style*="padding-top"] input[type="submit"],
form[name="gpaform"] table[style*="padding-top"] input[type="submit"] {
  min-width: 110px !important;
  height: 40px !important;
}
form[name="gradeform"] table[style*="padding-top"] input[type="button"],
form[name="gpaform"] table[style*="padding-top"] input[type="button"] {
  min-width: 80px !important;
  height: 40px !important;
}

/* Planning and Settings dialogs inside gradeform */
#gradesettings, #gplanning {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}
#gradesettings table, #gplanning table {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

/* --- Grade Planning Form (graderaiseform) & GPA Planning (gparaiseform) --- */
form[name="graderaiseform"] table.panel,
form[name="gparaiseform"] table.panel {
  width: 100% !important;
  max-width: 480px !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
}
form[name="graderaiseform"] table.panel td,
form[name="gparaiseform"] table.panel td {
  padding: 8px 10px !important;
}
`;

const insertTarget = '/* Calculator Action Buttons */';
css = css.replace(insertTarget, modernEnhancements + '\n' + insertTarget);

// Section 2: Universal Mobile Responsiveness (all viewports <= 680px down to 320px)
const mobileResponsiveness = `
/* ==========================================================================
   UNIVERSAL MOBILE RESPONSIVE ENGINE (320px - 680px)
   ========================================================================== */
@media (max-width: 680px) {
  html, body, .main-wrapper, .calc-page-wrapper, .calc-page-container, .calc-main-content, #content {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    box-sizing: border-box !important;
  }

  .calc-page-wrapper {
    padding: 12px 10px 28px !important;
  }

  .panel, #content .panel, .cpanel {
    padding: 14px 10px !important;
    border-radius: var(--radius-sm) !important;
    overflow-x: hidden !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  /* All tables inside #content or panel must never overflow */
  #content table:not(.cinfoT),
  .panel table:not(.cinfoT) {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  /* Standard 2-column key-value forms stack vertically on mobile */
  .panel > tbody > tr:not(form[name="gradeform"] tr):not(form[name="gpaform"] tr),
  .panel > tr:not(form[name="gradeform"] tr):not(form[name="gpaform"] tr),
  form[name="graderaiseform"] table.panel tr,
  form[name="gparaiseform"] table.panel tr,
  .panel table:not(form[name="gradeform"] table):not(form[name="gpaform"] table):not(.cinfoT):not([style*="padding-top"]) > tbody > tr,
  .panel table:not(form[name="gradeform"] table):not(form[name="gpaform"] table):not(.cinfoT):not([style*="padding-top"]) > tr {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    margin-bottom: 10px !important;
    box-sizing: border-box !important;
  }

  .panel table:not(form[name="gradeform"] table):not(form[name="gpaform"] table):not(.cinfoT):not([style*="padding-top"]) > tbody > tr > td,
  .panel table:not(form[name="gradeform"] table):not(form[name="gpaform"] table):not(.cinfoT):not([style*="padding-top"]) > tr > td,
  form[name="graderaiseform"] table.panel tr > td,
  form[name="gparaiseform"] table.panel tr > td {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    text-align: left !important;
    padding: 3px 0 !important;
    box-sizing: border-box !important;
  }

  .panel td[align="right"] {
    text-align: left !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
    margin-bottom: 4px !important;
  }

  /* Sub-tables inside a cell (like feet + inches) flex side-by-side */
  .panel td table:not(form[name="gradeform"] table):not(form[name="gpaform"] table):not(.cinfoT) {
    display: table !important;
    width: 100% !important;
  }
  .panel td table:not(form[name="gradeform"] table):not(form[name="gpaform"] table):not(.cinfoT) tbody,
  .panel td table:not(form[name="gradeform"] table):not(form[name="gpaform"] table):not(.cinfoT) tr {
    display: flex !important;
    flex-direction: row !important;
    width: 100% !important;
    gap: 8px !important;
    align-items: center !important;
    margin-bottom: 0 !important;
  }
  .panel td table:not(form[name="gradeform"] table):not(form[name="gpaform"] table):not(.cinfoT) td {
    flex: 1 1 0% !important;
    width: auto !important;
    padding: 0 !important;
    display: block !important;
  }

  /* All form inputs stretch full width of their container */
  .panel input[type="text"],
  .panel input[type="number"],
  .panel input[type="date"],
  .panel select,
  .panel textarea,
  .intext, .innormal, .inlong, .inlonger, .inlongest, .inhalf, .infull {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  /* Submit action buttons in standard forms stretch full width on mobile */
  .panel input[type="submit"],
  .panel input[type="button"],
  .panel .bluebtn,
  .panel #bluebtn {
    width: 100% !important;
    display: block !important;
    margin-top: 10px !important;
    margin-left: 0 !important;
    padding: 12px 18px !important;
    font-size: 15px !important;
    text-align: center !important;
  }

  /* Submit & Clear row in graderaiseform / gparaiseform */
  form[name="graderaiseform"] table.panel td[colspan="2"],
  form[name="gparaiseform"] table.panel td[colspan="2"] {
    display: flex !important;
    flex-direction: row !important;
    gap: 8px !important;
    width: 100% !important;
  }
  form[name="graderaiseform"] table.panel input[type="submit"],
  form[name="graderaiseform"] table.panel input[type="button"],
  form[name="gparaiseform"] table.panel input[type="submit"],
  form[name="gparaiseform"] table.panel input[type="button"] {
    flex: 1 1 0% !important;
    width: 100% !important;
    margin-top: 0 !important;
  }

  /* Grade & GPA row header and cells on mobile */
  form[name="gradeform"] td > table:not([align="center"]) tr,
  form[name="gpaform"] td > table:not([align="center"]) tr {
    gap: 4px !important;
    margin-bottom: 4px !important;
  }
  form[name="gradeform"] td > table:not([align="center"]) input,
  form[name="gradeform"] td > table:not([align="center"]) select,
  form[name="gpaform"] td > table:not([align="center"]) input,
  form[name="gpaform"] td > table:not([align="center"]) select {
    padding: 6px 4px !important;
    font-size: 13px !important;
    height: 36px !important;
  }
  form[name="gradeform"] td > table:not([align="center"]) tr[valign="top"] b,
  form[name="gpaform"] td > table:not([align="center"]) tr:has(b) b {
    font-size: 11.5px !important;
  }

  /* Grade & GPA action buttons on mobile */
  form[name="gradeform"] table[style*="padding-top"] tr,
  form[name="gpaform"] table[style*="padding-top"] tr {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    width: 100% !important;
  }
  form[name="gradeform"] table[style*="padding-top"] td,
  form[name="gpaform"] table[style*="padding-top"] td {
    flex: 1 1 calc(50% - 8px) !important;
    display: inline-flex !important;
    justify-content: center !important;
  }
  form[name="gradeform"] table[style*="padding-top"] td:last-child,
  form[name="gpaform"] table[style*="padding-top"] td:last-child {
    flex: 1 1 100% !important;
    margin-top: 4px !important;
  }
  form[name="gradeform"] table[style*="padding-top"] input[type="submit"],
  form[name="gradeform"] table[style*="padding-top"] input[type="button"],
  form[name="gpaform"] table[style*="padding-top"] input[type="submit"],
  form[name="gpaform"] table[style*="padding-top"] input[type="button"] {
    width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
  }

  /* Instruction banner image fluid */
  #insmdc {
    max-width: 100% !important;
    overflow: hidden !important;
  }
  #insmdc img {
    max-width: 100% !important;
    height: auto !important;
  }
}

/* Extra Small Mobile (<= 360px - e.g. iPhone SE, Galaxy Fold outer) */
@media (max-width: 360px) {
  form[name="gradeform"] td > table:not([align="center"]) tr,
  form[name="gpaform"] td > table:not([align="center"]) tr {
    gap: 3px !important;
  }
  form[name="gradeform"] td > table:not([align="center"]) input,
  form[name="gradeform"] td > table:not([align="center"]) select,
  form[name="gpaform"] td > table:not([align="center"]) input,
  form[name="gpaform"] td > table:not([align="center"]) select {
    padding: 5px 3px !important;
    font-size: 12px !important;
    height: 34px !important;
  }
  form[name="gradeform"] td > table:not([align="center"]) tr[valign="top"] b,
  form[name="gpaform"] td > table:not([align="center"]) tr:has(b) b {
    font-size: 10.5px !important;
  }
}
`;

css += '\n' + mobileResponsiveness;

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully applied universal responsive mastery to public/style.css.');
