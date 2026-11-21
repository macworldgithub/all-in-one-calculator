const fs = require('fs');
const path = require('path');

const code = `
  // ==========================================
  // COMPREHENSIVE FINANCIAL CALCULATION ENGINES
  // ==========================================

  // Auto Lease Calculator
  engines['auto-lease-calculator'] = function () {
    var price = getFloat('cloanamount', 50000);
    var term = getFloat('cloanterm', 36);
    var rate = getFloat('cinterestrate', 0.00208);
    var down = getFloat('cdownpayment', 10000);
    var trade = getFloat('ctradeinvalue', 0);
    var tax = getFloat('csaletax', 7);
    var res = getFloat('cresidualvalue', 24000);

    var mf = rate > 0.05 ? (rate / 2400) : (rate || 0.002);
    var netCap = Math.max(0, price - down - trade);
    var depFee = term > 0 ? (netCap - res) / term : 0;
    var finFee = (netCap + res) * mf;
    var baseMonthly = Math.max(0, depFee + finFee);
    var monthlyTax = baseMonthly * (tax / 100);
    var totalMonthly = baseMonthly + monthlyTax;
    var totalPayments = totalMonthly * term + down;
    var totalInterest = finFee * term;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Monthly Lease Payment: \${fmtMoney(totalMonthly)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Base Monthly Payment</td><td align="right"><b>\${fmtMoney(baseMonthly)}</b></td></tr>
        <tr><td>Monthly Sales Tax (\${tax}%)</td><td align="right">\${fmtMoney(monthlyTax)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Monthly Payment</b></td><td align="right"><font size="+1"><b>\${fmtMoney(totalMonthly)}</b></font></td></tr>
        <tr><td>Net Capitalized Cost</td><td align="right">\${fmtMoney(netCap)}</td></tr>
        <tr><td>Residual Value</td><td align="right">\${fmtMoney(res)}</td></tr>
        <tr><td>Total Depreciation Fee</td><td align="right">\${fmtMoney(depFee * term)}</td></tr>
        <tr><td>Total Finance Charge</td><td align="right">\${fmtMoney(totalInterest)}</td></tr>
        <tr style="background:#f0f4f8;"><td><b>Total Cost of Lease</b></td><td align="right"><b>\${fmtMoney(totalPayments)}</b></td></tr>
      </table>
    \`;
  };

  // Lease Calculator
  engines['lease-calculator'] = engines['auto-lease-calculator'];

  // CD Calculator
  engines['cd-calculator'] = function () {
    var p = getFloat('cstartingprinciple', 10000);
    var r = getFloat('cinterestrate', 5) / 100;
    var yrs = getFloat('cyears', 3);
    var mos = getFloat('cmonths', 0);
    var tax = getFloat('ctaxtrate', 0) / 100;
    var t = yrs + (mos / 12);
    var n = 12; // monthly compounding default
    var comp = getIn('ccompound', '12');
    if (comp === '365' || comp === 'daily') n = 365;
    else if (comp === '4' || comp === 'quarterly') n = 4;
    else if (comp === '1' || comp === 'annually') n = 1;

    var endBal = p * Math.pow(1 + (r / n), n * t);
    var totalInt = endBal - p;
    var taxPaid = totalInt * tax;
    var afterTaxBal = endBal - taxPaid;
    var apy = (Math.pow(1 + (r / n), n) - 1) * 100;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">End Balance: \${fmtMoney(afterTaxBal)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Initial Deposit</td><td align="right">\${fmtMoney(p)}</td></tr>
        <tr><td>Annual Percentage Yield (APY)</td><td align="right"><b>\${fmtNum(apy, 3)}%</b></td></tr>
        <tr><td>Total Interest Earned</td><td align="right"><font color="green"><b>\${fmtMoney(totalInt)}</b></font></td></tr>
        \${tax > 0 ? \`<tr><td>Tax Withheld (\${fmtNum(tax * 100, 1)}%)</td><td align="right">-\${fmtMoney(taxPaid)}</td></tr>\` : ''}
        <tr style="background:#eaf2e8;"><td><b>Final Balance</b></td><td align="right"><font size="+1"><b>\${fmtMoney(afterTaxBal)}</b></font></td></tr>
      </table>
    \`;
  };

  // Sales Tax Calculator
  engines['sales-tax-calculator'] = function () {
    var before = getFloat('beforetax', 0);
    var rate = getFloat('taxrate', 6.5);
    var finalPrice = getFloat('finalprice', 0);

    var taxAmt = 0, total = 0, net = before;
    if (before > 0) {
      taxAmt = before * (rate / 100);
      total = before + taxAmt;
    } else if (finalPrice > 0) {
      total = finalPrice;
      net = total / (1 + (rate / 100));
      taxAmt = total - net;
    } else {
      net = 100;
      taxAmt = net * (rate / 100);
      total = net + taxAmt;
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Total Price: \${fmtMoney(total)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Before Tax Price</td><td align="right">\${fmtMoney(net)}</td></tr>
        <tr><td>Sales Tax Rate</td><td align="right">\${fmtNum(rate, 3)}%</td></tr>
        <tr><td>Sales Tax Amount</td><td align="right"><font color="green"><b>\${fmtMoney(taxAmt)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Amount</b></td><td align="right"><font size="+1"><b>\${fmtMoney(total)}</b></font></td></tr>
      </table>
    \`;
  };

  // VAT Calculator
  engines['vat-calculator'] = function () {
    var before = getFloat('beforetax', 0);
    var rate = getFloat('taxrate', 8);
    var finalP = getFloat('finalprice', 0);

    var net = before, vat = 0, gross = 0;
    if (before > 0) {
      vat = before * (rate / 100);
      gross = before + vat;
    } else if (finalP > 0) {
      gross = finalP;
      net = gross / (1 + (rate / 100));
      vat = gross - net;
    } else {
      net = 1200;
      vat = net * (rate / 100);
      gross = net + vat;
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Gross Amount (with VAT): \${fmtMoney(gross)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Net Amount (excl. VAT)</td><td align="right">\${fmtMoney(net)}</td></tr>
        <tr><td>VAT Rate</td><td align="right">\${fmtNum(rate, 2)}%</td></tr>
        <tr><td>VAT Value</td><td align="right"><font color="green"><b>\${fmtMoney(vat)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Gross Amount (incl. VAT)</b></td><td align="right"><font size="+1"><b>\${fmtMoney(gross)}</b></font></td></tr>
      </table>
    \`;
  };

  // Discount Calculator & Percent Off Calculator
  engines['discount-calculator'] = engines['percent-off-calculator'] = function () {
    var price = getFloat('pricebefore', 59.99);
    var disc = getFloat('discount', 15);
    var saved = price * (disc / 100);
    var finalP = price - saved;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Final Price: \${fmtMoney(finalP)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Original Price</td><td align="right">\${fmtMoney(price)}</td></tr>
        <tr><td>Discount</td><td align="right">\${fmtNum(disc, 2)}%</td></tr>
        <tr><td>You Save</td><td align="right"><font color="green"><b>\${fmtMoney(saved)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Discounted Price</b></td><td align="right"><font size="+1"><b>\${fmtMoney(finalP)}</b></font></td></tr>
      </table>
    \`;
  };

  // Margin Calculator
  engines['margin-calculator'] = function () {
    var cost = getFloat('ccost', 120);
    var sale = getFloat('csale', 160);
    var profit = sale - cost;
    var margin = sale > 0 ? (profit / sale) * 100 : 0;
    var markup = cost > 0 ? (profit / cost) * 100 : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Gross Margin: \${fmtNum(margin, 2)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Cost</td><td align="right">\${fmtMoney(cost)}</td></tr>
        <tr><td>Revenue (Sale Price)</td><td align="right">\${fmtMoney(sale)}</td></tr>
        <tr><td>Gross Profit</td><td align="right"><font color="green"><b>\${fmtMoney(profit)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Gross Margin</b></td><td align="right"><font size="+1"><b>\${fmtNum(margin, 2)}%</b></font></td></tr>
        <tr><td>Markup</td><td align="right"><b>\${fmtNum(markup, 2)}%</b></td></tr>
      </table>
    \`;
  };

  // Commission Calculator
  engines['commission-calculator'] = function () {
    var sales = getFloat('csale', 10000);
    var rate = getFloat('crate', 5);
    var base = getFloat('cbase', 0);
    var comm = sales * (rate / 100);
    var total = base + comm;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Total Earnings: \${fmtMoney(total)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Base Salary / Pay</td><td align="right">\${fmtMoney(base)}</td></tr>
        <tr><td>Sales Volume</td><td align="right">\${fmtMoney(sales)}</td></tr>
        <tr><td>Commission Rate</td><td align="right">\${fmtNum(rate, 2)}%</td></tr>
        <tr><td>Commission Earned</td><td align="right"><font color="green"><b>\${fmtMoney(comm)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Payout</b></td><td align="right"><font size="+1"><b>\${fmtMoney(total)}</b></font></td></tr>
      </table>
    \`;
  };

  // APR Calculator
  engines['apr-calculator'] = function () {
    var loan = getFloat('cloanamount', 100000);
    var term = getFloat('cloanterm', 10);
    var rate = getFloat('cinterestrate', 6) / 100 / 12;
    var upfront = getFloat('cfrontfees', 2500);
    var n = term * 12;
    var pmt = rate === 0 ? (loan / n) : (loan * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    var netProceeds = loan - upfront;

    // Newton-Raphson APR solver
    var r = rate;
    for (var iter = 0; iter < 40; iter++) {
      var pv = 0;
      var pvPrime = 0;
      for (var t = 1; t <= n; t++) {
        var disc = Math.pow(1 + r, t);
        pv += pmt / disc;
        pvPrime -= (t * pmt) / (disc * (1 + r));
      }
      var diff = pv - netProceeds;
      if (Math.abs(diff) < 0.0001) break;
      r = r - diff / pvPrime;
    }
    var apr = r * 12 * 100;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Calculated APR: \${fmtNum(apr, 3)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Nominal Interest Rate</td><td align="right">\${fmtNum(rate * 12 * 100, 3)}%</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Annual Percentage Rate (APR)</b></td><td align="right"><font size="+1"><b>\${fmtNum(apr, 3)}%</b></font></td></tr>
        <tr><td>Monthly Payment</td><td align="right"><b>\${fmtMoney(pmt)}</b></td></tr>
        <tr><td>Loan Amount</td><td align="right">\${fmtMoney(loan)}</td></tr>
        <tr><td>Upfront Finance Fees</td><td align="right">\${fmtMoney(upfront)}</td></tr>
        <tr><td>Total Cost of Loan</td><td align="right"><b>\${fmtMoney(pmt * n + upfront)}</b></td></tr>
      </table>
    \`;
  };

  // Bond Calculator
  engines['bond-calculator'] = function () {
    var face = getFloat('cface', 100);
    var ytm = getFloat('cyield', 6) / 100;
    var yrs = getFloat('cyears', 3);
    var couponRate = getFloat('ccoupon', 5) / 100;

    var cpn = face * couponRate;
    var price = 0;
    for (var t = 1; t <= yrs; t++) {
      price += cpn / Math.pow(1 + ytm, t);
    }
    price += face / Math.pow(1 + ytm, yrs);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Bond Price: \${fmtMoney(price)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Face / Par Value</td><td align="right">\${fmtMoney(face)}</td></tr>
        <tr><td>Annual Coupon Rate</td><td align="right">\${fmtNum(couponRate * 100, 2)}%</td></tr>
        <tr><td>Annual Coupon Payment</td><td align="right">\${fmtMoney(cpn)}</td></tr>
        <tr><td>Yield to Maturity (YTM)</td><td align="right">\${fmtNum(ytm * 100, 2)}%</td></tr>
        <tr><td>Maturity Period</td><td align="right">\${yrs} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Current Bond Price</b></td><td align="right"><font size="+1"><b>\${fmtMoney(price)}</b></font></td></tr>
      </table>
    \`;
  };

  // Annuity Calculator & Annuity Payout Calculator
  engines['annuity-calculator'] = engines['annuity-payout-calculator'] = function () {
    var p = getFloat('cstartingprinciple', 100000);
    var r = getFloat('cinterestrate', 6) / 100 / 12;
    var yrs = getFloat('cyears', 20);
    var pmt = getFloat('cannualaddition', 500) || getFloat('cmonthlypay', 500);
    var n = yrs * 12;

    var fv = p * Math.pow(1 + r, n) + (r > 0 ? (pmt * (Math.pow(1 + r, n) - 1) / r) : pmt * n);
    var payoutMonthly = (r > 0 ? (p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : p / n);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Annuity Future Value: \${fmtMoney(fv)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Starting Principal</td><td align="right">\${fmtMoney(p)}</td></tr>
        <tr><td>Growth Period</td><td align="right">\${yrs} years</td></tr>
        <tr><td>Interest Rate</td><td align="right">\${fmtNum(r * 12 * 100, 2)}%</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Accumulated Value (FV)</b></td><td align="right"><font size="+1"><b>\${fmtMoney(fv)}</b></font></td></tr>
        <tr><td>Equivalent Monthly Payout (over \${yrs} yrs)</td><td align="right"><b>\${fmtMoney(payoutMonthly)}</b></td></tr>
      </table>
    \`;
  };

  // Future Value Calculator & Present Value Calculator
  engines['future-value-calculator'] = engines['present-value-calculator'] = function () {
    var pv = getFloat('cpresentvalue', 10000) || getFloat('cstartingprinciple', 10000);
    var fv = getFloat('cfuturevalue', 20000);
    var rate = getFloat('cinterestrate', 6) / 100;
    var periods = getFloat('cperiods', 10) || getFloat('cyears', 10);
    var pmt = getFloat('cperiodicpayment', 0);

    var calcFV = pv * Math.pow(1 + rate, periods) + (rate > 0 ? pmt * ((Math.pow(1 + rate, periods) - 1) / rate) : pmt * periods);
    var calcPV = fv / Math.pow(1 + rate, periods);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Future Value: \${fmtMoney(calcFV)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Present Value (PV)</td><td align="right">\${fmtMoney(pv)}</td></tr>
        <tr><td>Interest Rate per Period</td><td align="right">\${fmtNum(rate * 100, 2)}%</td></tr>
        <tr><td>Number of Periods</td><td align="right">\${periods}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Future Value (FV)</b></td><td align="right"><font size="+1"><b>\${fmtMoney(calcFV)}</b></font></td></tr>
        <tr><td>Discounted Present Value of \${fmtMoney(fv)}</td><td align="right"><b>\${fmtMoney(calcPV)}</b></td></tr>
      </table>
    \`;
  };

  // Canadian Mortgage Calculator
  engines['canadian-mortgage-calculator'] = function () {
    var price = getFloat('chouseprice', 800000);
    var down = getFloat('cdownpayment', 20);
    var downAmt = down < 100 ? (price * (down / 100)) : down;
    var loan = price - downAmt;
    var term = getFloat('cloanterm', 25);
    var annRate = getFloat('cinterestrate', 5) / 100;
    // Semi-annual compounding for Canadian Mortgages
    var rMonthly = Math.pow(1 + (annRate / 2), 2 / 12) - 1;
    var n = term * 12;
    var pmt = (loan * (rMonthly * Math.pow(1 + rMonthly, n))) / (Math.pow(1 + rMonthly, n) - 1);
    var totalPayments = pmt * n;
    var totalInt = totalPayments - loan;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Monthly Payment: \${fmtMoney(pmt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Mortgage Loan Amount</td><td align="right">\${fmtMoney(loan)}</td></tr>
        <tr><td>Down Payment</td><td align="right">\${fmtMoney(downAmt)} (\${fmtNum((downAmt/price)*100, 1)}%)</td></tr>
        <tr><td>Amortization Period</td><td align="right">\${term} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Monthly Mortgage Payment</b></td><td align="right"><font size="+1"><b>\${fmtMoney(pmt)}</b></font></td></tr>
        <tr><td>Total Mortgage Interest</td><td align="right"><font color="green"><b>\${fmtMoney(totalInt)}</b></font></td></tr>
        <tr><td>Total of All Payments</td><td align="right"><b>\${fmtMoney(totalPayments)}</b></td></tr>
      </table>
    \`;
  };

  // UK Mortgage Calculator
  engines['mortgage-calculator-uk'] = function () {
    var price = getFloat('chouseprice', 300000);
    var down = getFloat('cdownpayment', 15);
    var downAmt = down < 100 ? (price * (down / 100)) : down;
    var loan = price - downAmt;
    var term = getFloat('cloanterm', 25);
    var rate = getFloat('cinterestrate', 5.5) / 100 / 12;
    var n = term * 12;
    var pmt = (loan * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1);
    var interestOnlyPmt = loan * rate;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Monthly Repayment: £\${fmtNum(pmt, 2)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Property Value</td><td align="right">£\${fmtNum(price, 2)}</td></tr>
        <tr><td>Deposit</td><td align="right">£\${fmtNum(downAmt, 2)}</td></tr>
        <tr><td>Mortgage Loan</td><td align="right">£\${fmtNum(loan, 2)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Capital & Interest Monthly</b></td><td align="right"><font size="+1"><b>£\${fmtNum(pmt, 2)}</b></font></td></tr>
        <tr><td>Interest-Only Monthly</td><td align="right">£\${fmtNum(interestOnlyPmt, 2)}</td></tr>
        <tr><td>Total Repayments</td><td align="right"><b>£\${fmtNum(pmt * n, 2)}</b></td></tr>
      </table>
    \`;
  };

  // Mortgage Amortization Calculator
  engines['mortgage-amortization-calculator'] = engines['amortization-calculator'];

  // VA Mortgage Calculator
  engines['va-mortgage-calculator'] = function () {
    var price = getFloat('chouseprice', 500000);
    var down = getFloat('cdownpayment', 0);
    var downAmt = down < 100 ? (price * (down / 100)) : down;
    var baseLoan = price - downAmt;
    var rate = getFloat('cinterestrate', 7.282) / 100 / 12;
    var term = getFloat('cloanterm', 30);
    var fundingFeeRate = down < 5 ? 0.0215 : (down < 10 ? 0.015 : 0.0125);
    var fundingFee = baseLoan * fundingFeeRate;
    var totalLoan = baseLoan + fundingFee;
    var n = term * 12;
    var pmt = (totalLoan * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Monthly Payment (P&I): \${fmtMoney(pmt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Purchase Price</td><td align="right">\${fmtMoney(price)}</td></tr>
        <tr><td>Base Loan Amount</td><td align="right">\${fmtMoney(baseLoan)}</td></tr>
        <tr><td>VA Funding Fee (\${fmtNum(fundingFeeRate * 100, 2)}%)</td><td align="right">\${fmtMoney(fundingFee)}</td></tr>
        <tr><td>Total Financed Amount</td><td align="right"><b>\${fmtMoney(totalLoan)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Monthly Principal & Interest</b></td><td align="right"><font size="+1"><b>\${fmtMoney(pmt)}</b></font></td></tr>
        <tr><td>Total Payments (\${term} Years)</td><td align="right">\${fmtMoney(pmt * n)}</td></tr>
      </table>
    \`;
  };

  // FHA Loan Calculator
  engines['fha-loan-calculator'] = function () {
    var price = getFloat('chouseprice', 350000);
    var down = getFloat('cdownpayment', 3.5);
    var downAmt = down < 100 ? (price * (down / 100)) : down;
    var baseLoan = price - downAmt;
    var upfrontMIP = baseLoan * 0.0175; // 1.75% upfront MIP
    var totalLoan = baseLoan + upfrontMIP;
    var term = getFloat('cloanterm', 30);
    var rate = getFloat('cinterestrate', 6.5) / 100 / 12;
    var n = term * 12;
    var pi = (totalLoan * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1);
    var monthlyMIP = (baseLoan * 0.0055) / 12; // 0.55% annual MIP
    var totalMonthly = pi + monthlyMIP;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Total Monthly Payment: \${fmtMoney(totalMonthly)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Base Loan</td><td align="right">\${fmtMoney(baseLoan)}</td></tr>
        <tr><td>FHA Upfront MIP (1.75%)</td><td align="right">\${fmtMoney(upfrontMIP)}</td></tr>
        <tr><td>Total Financed Loan</td><td align="right"><b>\${fmtMoney(totalLoan)}</b></td></tr>
        <tr><td>Principal & Interest (P&I)</td><td align="right">\${fmtMoney(pi)}</td></tr>
        <tr><td>Monthly Mortgage Insurance (MIP)</td><td align="right">\${fmtMoney(monthlyMIP)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Monthly Payment</b></td><td align="right"><font size="+1"><b>\${fmtMoney(totalMonthly)}</b></font></td></tr>
      </table>
    \`;
  };

  // Student Loan Calculator & Repayment Calculator
  engines['student-loan-calculator'] = engines['repayment-calculator'] = engines['payment-calculator'] = function () {
    var loan = getFloat('cloanamount', 30000) || getFloat('cloanamount1', 30000);
    var term = getFloat('cloanterm', 10) || getFloat('cloanterm1', 10);
    var rate = getFloat('cinterestrate', 6.8) || getFloat('cinterestrate1', 6.8);
    var r = (rate / 100) / 12;
    var n = term * 12;
    var pmt = r === 0 ? (loan / n) : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    var total = pmt * n;
    var totalInt = total - loan;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Monthly Payment: \${fmtMoney(pmt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Loan Amount</td><td align="right">\${fmtMoney(loan)}</td></tr>
        <tr><td>Interest Rate</td><td align="right">\${fmtNum(rate, 2)}%</td></tr>
        <tr><td>Repayment Term</td><td align="right">\${term} years (\${n} payments)</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Monthly Payment</b></td><td align="right"><font size="+1"><b>\${fmtMoney(pmt)}</b></font></td></tr>
        <tr><td>Total Interest Paid</td><td align="right"><font color="green"><b>\${fmtMoney(totalInt)}</b></font></td></tr>
        <tr><td>Total Repayment Amount</td><td align="right"><b>\${fmtMoney(total)}</b></td></tr>
      </table>
    \`;
  };

  // Credit Card Calculator & Credit Card Payoff Calculator
  engines['credit-card-calculator'] = engines['credit-card-payoff-calculator'] = function () {
    var bal = getFloat('balance', 8000) || getFloat('cbal1', 5000);
    var apr = getFloat('rate', 18) || getFloat('cint1', 18.99);
    var pmt = getFloat('fixedpaymentamount', 200) || getFloat('camountcanpay', 300);
    var r = (apr / 100) / 12;

    if (pmt <= bal * r) {
      pmt = Math.ceil(bal * r + 25);
    }
    var n = -Math.log(1 - (r * bal) / pmt) / Math.log(1 + r);
    var mos = Math.ceil(n);
    var totalPaid = mos * pmt;
    var totalInt = totalPaid - bal;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Payoff Time: \${Math.floor(mos / 12)} yrs \${mos % 12} mos</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Credit Card Balance</td><td align="right">\${fmtMoney(bal)}</td></tr>
        <tr><td>Annual Interest Rate (APR)</td><td align="right">\${fmtNum(apr, 2)}%</td></tr>
        <tr><td>Monthly Payment</td><td align="right"><b>\${fmtMoney(pmt)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Months to Pay Off</b></td><td align="right"><font size="+1"><b>\${mos} months</b></font></td></tr>
        <tr><td>Total Interest Charges</td><td align="right"><font color="green"><b>\${fmtMoney(totalInt)}</b></font></td></tr>
        <tr><td>Total Amount Paid</td><td align="right"><b>\${fmtMoney(totalPaid)}</b></td></tr>
      </table>
    \`;
  };

  // Debt Payoff Calculator & Debt Consolidation Calculator
  engines['debt-payoff-calculator'] = engines['debt-consolidation-calculator'] = function () {
    var b1 = getFloat('cbal1', 10000), r1 = getFloat('cint1', 17.99), p1 = getFloat('cmpy1', 260);
    var b2 = getFloat('cbal2', 7500), r2 = getFloat('cint2', 19.99), p2 = getFloat('cmpy2', 190);
    var b3 = getFloat('cbal3', 6500), r3 = getFloat('cint3', 18.99), p3 = getFloat('cmpy3', 180);
    var totalDebt = b1 + b2 + b3;
    var totalPmt = p1 + p2 + p3;
    var avgApr = (b1 * r1 + b2 * r2 + b3 * r3) / (totalDebt || 1);

    // Consolidation loan comparison
    var consApr = getFloat('cinterestrate', 10.99) / 100 / 12;
    var consTerm = (getFloat('cyears', 5) || 5) * 12;
    var consPmt = consApr === 0 ? (totalDebt / consTerm) : (totalDebt * consApr * Math.pow(1 + consApr, consTerm)) / (Math.pow(1 + consApr, consTerm) - 1);
    var consTotalInt = (consPmt * consTerm) - totalDebt;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Total Debt: \${fmtMoney(totalDebt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Combined Debt Balance</td><td align="right"><b>\${fmtMoney(totalDebt)}</b></td></tr>
        <tr><td>Weighted Average APR</td><td align="right">\${fmtNum(avgApr, 2)}%</td></tr>
        <tr><td>Current Combined Monthly Payment</td><td align="right">\${fmtMoney(totalPmt)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Consolidation Monthly Payment (\${fmtNum(getFloat('cinterestrate', 10.99), 2)}% APR)</b></td><td align="right"><font size="+1"><b>\${fmtMoney(consPmt)}</b></font></td></tr>
        <tr><td>Monthly Payment Savings</td><td align="right"><font color="green"><b>\${fmtMoney(totalPmt - consPmt)}</b></font></td></tr>
        <tr><td>Consolidation Total Interest</td><td align="right">\${fmtMoney(consTotalInt)}</td></tr>
      </table>
    \`;
  };

  // HELOC Calculator & Home Equity Loan Calculator
  engines['heloc-calculator'] = engines['home-equity-loan-calculator'] = function () {
    var val = getFloat('chomevalue', 400000) || getFloat('chousevalue', 400000);
    var mort = getFloat('cmortgage', 220000) || getFloat('cloanbalance', 220000);
    var ltv = getFloat('cltv', 85);
    var rate = getFloat('cinterestrate', 7.5) / 100 / 12;
    var maxBorrow = Math.max(0, (val * (ltv / 100)) - mort);
    var drawMonthly = maxBorrow * rate; // interest-only payment

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Maximum Borrowing Line: \${fmtMoney(maxBorrow)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Estimated Home Value</td><td align="right">\${fmtMoney(val)}</td></tr>
        <tr><td>Current Mortgage Balance</td><td align="right">\${fmtMoney(mort)}</td></tr>
        <tr><td>Maximum Combined LTV</td><td align="right">\${fmtNum(ltv, 1)}%</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Available HELOC Credit Limit</b></td><td align="right"><font size="+1"><b>\${fmtMoney(maxBorrow)}</b></font></td></tr>
        <tr><td>Interest-Only Draw Payment (at \${fmtNum(rate * 12 * 100, 2)}%)</td><td align="right"><b>\${fmtMoney(drawMonthly)} / mo</b></td></tr>
      </table>
    \`;
  };

  // Budget Calculator
  engines['budget-calculator'] = function () {
    var salary = getFloat('salary', 80000);
    var otherInc = getFloat('pension', 0) + getFloat('investment', 1000) + getFloat('otherincome', 2000);
    var grossInc = salary + otherInc;
    var taxRate = getFloat('taxrate', 28) / 100;
    var netMonthlyInc = (grossInc * (1 - taxRate)) / 12;

    var housing = getFloat('rental', 1400) + getFloat('mortgage', 0) + getFloat('houseinsurance', 200) + getFloat('utilities', 250);
    var transport = getFloat('autoloan', 250) + getFloat('autoinsurance', 700) + getFloat('gasoline', 100);
    var living = getFloat('food', 400) + getFloat('clothing', 100) + getFloat('grocery', 100) + getFloat('mealout', 200);
    var savings = (getFloat('ira401k', 10000) / 12) + getFloat('collegesaving', 0) + getFloat('stockbond', 0);
    var totalExpenses = housing + transport + living;
    var netSurplus = netMonthlyInc - totalExpenses - savings;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Monthly Net Income: \${fmtMoney(netMonthlyInc)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Gross Annual Income</td><td align="right">\${fmtMoney(grossInc)}</td></tr>
        <tr><td>Estimated Taxes Paid</td><td align="right">\${fmtMoney(grossInc * taxRate)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Monthly Take-Home Pay</b></td><td align="right"><b>\${fmtMoney(netMonthlyInc)}</b></td></tr>
        <tr><td>Housing & Utilities</td><td align="right">\${fmtMoney(housing)}</td></tr>
        <tr><td>Transportation</td><td align="right">\${fmtMoney(transport)}</td></tr>
        <tr><td>Food & Personal Care</td><td align="right">\${fmtMoney(living)}</td></tr>
        <tr><td>Monthly Savings & Investments</td><td align="right">\${fmtMoney(savings)}</td></tr>
        <tr style="background:#f0f4f8;"><td><b>Net Monthly Cash Flow</b></td><td align="right"><font color="\${netSurplus >= 0 ? 'green' : 'red'}" size="+1"><b>\${fmtMoney(netSurplus)}</b></font></td></tr>
      </table>
    \`;
  };

  // Depreciation Calculator
  engines['depreciation-calculator'] = function () {
    var cost = getFloat('ccost', 50000) || getFloat('cassetprice', 50000);
    var salvage = getFloat('csalvage', 5000);
    var life = getFloat('clife', 5) || getFloat('cyears', 5);

    var slAnnual = (cost - salvage) / (life || 1);
    var dbRate = 2.0 / (life || 1);
    var dbYear1 = cost * dbRate;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Annual Straight-Line: \${fmtMoney(slAnnual)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Initial Asset Cost</td><td align="right">\${fmtMoney(cost)}</td></tr>
        <tr><td>Salvage Value</td><td align="right">\${fmtMoney(salvage)}</td></tr>
        <tr><td>Depreciable Base</td><td align="right">\${fmtMoney(cost - salvage)}</td></tr>
        <tr><td>Useful Life</td><td align="right">\${life} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Straight-Line Annual Depreciation</b></td><td align="right"><font size="+1"><b>\${fmtMoney(slAnnual)} / yr</b></font></td></tr>
        <tr><td>200% Declining Balance Year 1</td><td align="right"><b>\${fmtMoney(dbYear1)}</b></td></tr>
      </table>
    \`;
  };

  // Debt Ratio Calculator
  engines['debt-ratio-calculator'] = function () {
    var inc = getFloat('cgrossincome', 8000) || (getFloat('cannualincome', 96000) / 12);
    var housing = getFloat('chousing', 2000) || getFloat('cmortgage', 2000);
    var otherDebt = getFloat('cotherdebt', 800) || getFloat('cauto', 500) + getFloat('cstudent', 300);
    var totalDebt = housing + otherDebt;

    var frontDTI = inc > 0 ? (housing / inc) * 100 : 0;
    var backDTI = inc > 0 ? (totalDebt / inc) * 100 : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Back-End DTI Ratio: \${fmtNum(backDTI, 1)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Monthly Gross Income</td><td align="right">\${fmtMoney(inc)}</td></tr>
        <tr><td>Monthly Housing Expenses</td><td align="right">\${fmtMoney(housing)}</td></tr>
        <tr><td>Other Monthly Debt Payments</td><td align="right">\${fmtMoney(otherDebt)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Front-End DTI (Housing Ratio)</b></td><td align="right"><b>\${fmtNum(frontDTI, 1)}%</b> (standard &le; 28%)</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Back-End DTI (Total Debt Ratio)</b></td><td align="right"><font size="+1"><b>\${fmtNum(backDTI, 1)}%</b></font> (standard &le; 36%)</td></tr>
      </table>
    \`;
  };

  // Down Payment Calculator
  engines['down-payment-calculator'] = function () {
    var price = getFloat('chouseprice', 400000);
    var downPct = getFloat('cdownpayment', 20);
    var downAmt = downPct < 100 ? price * (downPct / 100) : downPct;
    var loanAmt = price - downAmt;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Down Payment: \${fmtMoney(downAmt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Home Purchase Price</td><td align="right">\${fmtMoney(price)}</td></tr>
        <tr><td>Down Payment Percentage</td><td align="right">\${fmtNum((downAmt/price)*100, 1)}%</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Required Cash Down Payment</b></td><td align="right"><font size="+1"><b>\${fmtMoney(downAmt)}</b></font></td></tr>
        <tr><td>Remaining Mortgage Loan</td><td align="right"><b>\${fmtMoney(loanAmt)}</b></td></tr>
      </table>
    \`;
  };

  // IRA Calculator & Roth IRA Calculator
  engines['ira-calculator'] = engines['roth-ira-calculator'] = function () {
    var p = getFloat('cstartingprinciple', 30000);
    var contrib = getFloat('cannualaddition', 7000);
    var curAge = getFloat('ccurrentage', 30);
    var retAge = getFloat('cretirementage', 65);
    var rate = getFloat('cinterestrate', 7) / 100;
    var yrs = Math.max(1, retAge - curAge);

    var fv = p * Math.pow(1 + rate, yrs);
    var totalContrib = p;
    for (var i = 1; i <= yrs; i++) {
      fv += contrib * Math.pow(1 + rate, yrs - i);
      totalContrib += contrib;
    }
    var totalEarnings = fv - totalContrib;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Retirement Balance at Age \${retAge}: \${fmtMoney(fv)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Starting Balance</td><td align="right">\${fmtMoney(p)}</td></tr>
        <tr><td>Annual Contribution</td><td align="right">\${fmtMoney(contrib)}</td></tr>
        <tr><td>Years of Growth</td><td align="right">\${yrs} years</td></tr>
        <tr><td>Total Principal Invested</td><td align="right">\${fmtMoney(totalContrib)}</td></tr>
        <tr><td>Total Compound Earnings</td><td align="right"><font color="green"><b>\${fmtMoney(totalEarnings)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Estimated Balance at Retirement</b></td><td align="right"><font size="+1"><b>\${fmtMoney(fv)}</b></font></td></tr>
      </table>
    \`;
  };

  // RMD Calculator
  engines['rmd-calculator'] = function () {
    var bal = getFloat('abalance', 300000);
    var bYear = getFloat('birthdate', 1951);
    var age = 2026 - bYear;
    // IRS Uniform Lifetime Table divisors (ages 72 to 95)
    var divMap = {
      72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
      80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
      88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9
    };
    var divisor = divMap[age] || (age > 95 ? 8.0 : 27.4);
    var rmd = age >= 73 ? (bal / divisor) : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Annual RMD: \${fmtMoney(rmd)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Account Balance</td><td align="right">\${fmtMoney(bal)}</td></tr>
        <tr><td>Calculated Age in 2026</td><td align="right">\${age} years old</td></tr>
        <tr><td>IRS Distribution Period (Divisor)</td><td align="right">\${divisor}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Required Minimum Distribution</b></td><td align="right"><font size="+1"><b>\${fmtMoney(rmd)}</b></font></td></tr>
        <tr><td>Equivalent Monthly Distribution</td><td align="right"><b>\${fmtMoney(rmd / 12)} / mo</b></td></tr>
      </table>
    \`;
  };

  // Social Security Calculator & Pension Calculator
  engines['social-security-calculator'] = engines['pension-calculator'] = function () {
    var bYear = getFloat('cbirthyear', 1970);
    var curAge = 2026 - bYear;
    var baseMonthly = getFloat('cmonthlyincome1', 2000) || 2000;
    var at62 = baseMonthly * 0.70;
    var at67 = baseMonthly * 1.00;
    var at70 = baseMonthly * 1.24;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Full Retirement Benefit (FRA 67): \${fmtMoney(at67)}/mo</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Current Age</td><td align="right">\${curAge} years old</td></tr>
        <tr><td>Early Retirement (Age 62)</td><td align="right"><b>\${fmtMoney(at62)} / month</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Full Retirement Age (Age 67)</b></td><td align="right"><font size="+1"><b>\${fmtMoney(at67)} / month</b></font></td></tr>
        <tr><td>Delayed Retirement (Age 70)</td><td align="right"><font color="green"><b>\${fmtMoney(at70)} / month</b></font></td></tr>
        <tr><td>Annual Benefit at FRA</td><td align="right"><b>\${fmtMoney(at67 * 12)} / year</b></td></tr>
      </table>
    \`;
  };

  // College Cost Calculator
  engines['college-cost-calculator'] = function () {
    var todayCost = getFloat('todaycost', 30990);
    var inflation = getFloat('costincrease', 5) / 100;
    var yrsUntil = getFloat('startin', 3);
    var colYrs = getFloat('collegelength', 4);

    var totalCost = 0;
    for (var y = 0; y < colYrs; y++) {
      totalCost += todayCost * Math.pow(1 + inflation, yrsUntil + y);
    }
    var monthlySave = totalCost / (yrsUntil * 12 || 12);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Total Estimated College Cost: \${fmtMoney(totalCost)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Today's Annual Cost</td><td align="right">\${fmtMoney(todayCost)}</td></tr>
        <tr><td>Annual Cost Inflation</td><td align="right">\${fmtNum(inflation * 100, 1)}%</td></tr>
        <tr><td>Years Until Enrollment</td><td align="right">\${yrsUntil} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total \${colYrs}-Year Projected Cost</b></td><td align="right"><font size="+1"><b>\${fmtMoney(totalCost)}</b></font></td></tr>
        <tr><td>Target Monthly Savings</td><td align="right"><b>\${fmtMoney(monthlySave)} / mo</b></td></tr>
      </table>
    \`;
  };

  // Rent Calculator & Rent vs Buy Calculator & Rental Property Calculator
  engines['rent-calculator'] = engines['rent-vs-buy-calculator'] = engines['rental-property-calculator'] = function () {
    var grossInc = getFloat('cannualincome', 84000) || getFloat('salary', 84000) || getFloat('chomeprice', 500000) * 0.16;
    var affordableMonthly = (grossInc * 0.30) / 12; // 30% rule
    var propPrice = getFloat('cprice', 200000) || getFloat('chomeprice', 500000);
    var rentMonthly = getFloat('crent', 2000) || getFloat('crental', 2500) || affordableMonthly;
    var grossRentAnnual = rentMonthly * 12;
    var capRate = propPrice > 0 ? ((grossRentAnnual * 0.60) / propPrice) * 100 : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Monthly Rental Evaluation: \${fmtMoney(rentMonthly)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Recommended Affordable Rent (30% rule)</td><td align="right">\${fmtMoney(affordableMonthly)} / mo</td></tr>
        <tr><td>Annual Rental Cost / Revenue</td><td align="right">\${fmtMoney(grossRentAnnual)}</td></tr>
        <tr><td>Property Value Benchmark</td><td align="right">\${fmtMoney(propPrice)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Estimated Net Cap Rate</b></td><td align="right"><font size="+1"><b>\${fmtNum(capRate, 2)}%</b></font></td></tr>
        <tr><td>Gross Rent Multiplier (GRM)</td><td align="right"><b>\${fmtNum(propPrice / (grossRentAnnual || 1), 2)}</b></td></tr>
      </table>
    \`;
  };

  // Take-Home Pay Calculator & Tax Calculator & Estate Tax Calculator
  engines['take-home-pay-calculator'] = engines['tax-calculator'] = engines['estate-tax-calculator'] = function () {
    var gross = getFloat('cannualincome', 80000) || getFloat('csalaryincome', 80000);
    var stdDeduction = 15000; // 2025/2026 Single
    var taxable = Math.max(0, gross - stdDeduction);

    // 2025/2026 Federal Brackets
    var fedTax = 0;
    if (taxable <= 11925) fedTax = taxable * 0.10;
    else if (taxable <= 48475) fedTax = 1192.5 + (taxable - 11925) * 0.12;
    else if (taxable <= 103350) fedTax = 5578.5 + (taxable - 48475) * 0.22;
    else if (taxable <= 197300) fedTax = 17651 + (taxable - 103350) * 0.24;
    else fedTax = 40199 + (taxable - 197300) * 0.32;

    var ssTax = Math.min(gross, 176100) * 0.062;
    var medTax = gross * 0.0145;
    var stateTax = gross * 0.045; // average state tax
    var totalTaxes = fedTax + ssTax + medTax + stateTax;
    var netPay = gross - totalTaxes;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Take-Home Pay: \${fmtMoney(netPay / 12)} / month</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Gross Annual Income</td><td align="right">\${fmtMoney(gross)}</td></tr>
        <tr><td>Standard Deduction</td><td align="right">-\${fmtMoney(stdDeduction)}</td></tr>
        <tr><td>Federal Income Tax</td><td align="right">-\${fmtMoney(fedTax)}</td></tr>
        <tr><td>Social Security Tax (6.2%)</td><td align="right">-\${fmtMoney(ssTax)}</td></tr>
        <tr><td>Medicare Tax (1.45%)</td><td align="right">-\${fmtMoney(medTax)}</td></tr>
        <tr><td>Estimated State Tax (4.5%)</td><td align="right">-\${fmtMoney(stateTax)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Annual Net Take-Home Pay</b></td><td align="right"><font size="+1"><b>\${fmtMoney(netPay)}</b></font></td></tr>
        <tr style="background:#f0f4f8;"><td><b>Monthly Take-Home Pay</b></td><td align="right"><b>\${fmtMoney(netPay / 12)}</b></td></tr>
        <tr><td>Effective Tax Rate</td><td align="right"><b>\${fmtNum((totalTaxes / gross) * 100, 1)}%</b></td></tr>
      </table>
    \`;
  };

  // Currency Calculator
  engines['currency-calculator'] = function () {
    var amt = getFloat('eamount', 100) || getFloat('eamount2', 100);
    var rate = getFloat('erate', 1.08); // EUR to USD approx
    var converted = amt * rate;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Converted Amount: \${fmtMoney(converted)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Original Amount</td><td align="right">\${fmtNum(amt, 2)}</td></tr>
        <tr><td>Exchange Rate</td><td align="right">\${fmtNum(rate, 4)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Resulting Converted Value</b></td><td align="right"><font size="+1"><b>\${fmtMoney(converted)}</b></font></td></tr>
      </table>
    \`;
  };

  // Cash Back or Low Interest Calculator
  engines['cash-back-or-low-interest-calculator'] = function () {
    var loan = getFloat('cloanamount', 50000);
    var term = getFloat('cloanterm', 60);
    var rateHigh = getFloat('cinterestrate', 5) / 100 / 12;
    var rateLow = getFloat('cinterestratelow', 2) / 100 / 12;
    var cashBack = getFloat('ccashback', 1000);

    var loanWithCashBack = loan - cashBack;
    var pmt1 = (loanWithCashBack * rateHigh * Math.pow(1 + rateHigh, term)) / (Math.pow(1 + rateHigh, term) - 1);
    var pmt2 = (loan * rateLow * Math.pow(1 + rateLow, term)) / (Math.pow(1 + rateLow, term) - 1);
    var total1 = pmt1 * term;
    var total2 = pmt2 * term;

    var c = getResultContainer();
    if (!c) return;
    var betterChoice = total1 < total2 ? "Option 1 (Cash Back)" : "Option 2 (Low Interest Rate)";
    c.innerHTML = \`
      <h2 class="h2result">Better Choice: \${betterChoice}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Option 1 (Cash Back: \${fmtMoney(cashBack)} at \${fmtNum(rateHigh*1200, 2)}%) Total</td><td align="right"><b>\${fmtMoney(total1)}</b> (\${fmtMoney(pmt1)}/mo)</td></tr>
        <tr><td>Option 2 (Low Rate at \${fmtNum(rateLow*1200, 2)}%) Total</td><td align="right"><b>\${fmtMoney(total2)}</b> (\${fmtMoney(pmt2)}/mo)</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Overall Total Savings</b></td><td align="right"><font size="+1" color="green"><b>\${fmtMoney(Math.abs(total1 - total2))}</b></font></td></tr>
      </table>
    \`;
  };

  // Finance Calculator & TVM Solver & IRR Calculator & Average Return Calculator & Mutual Fund Calculator & Marriage Calculator & Interest Rate Calculator
  engines['finance-calculator'] = engines['irr-calculator'] = engines['average-return-calculator'] = engines['mutual-fund-calculator'] = engines['marriage-calculator'] = engines['interest-rate-calculator'] = function () {
    var pv = getFloat('cpresentvalue', 10000) || getFloat('cloanamount', 10000);
    var rate = getFloat('cinterestrate', 7) / 100;
    var yrs = getFloat('cyears', 5) || getFloat('cloanterm', 5);
    var pmt = getFloat('cperiodicpayment', 0) || getFloat('cmonthlypay', 0);
    var fv = pv * Math.pow(1 + rate, yrs);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = \`
      <h2 class="h2result">Calculated Valuation: \${fmtMoney(fv)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Initial Value (PV)</td><td align="right">\${fmtMoney(pv)}</td></tr>
        <tr><td>Interest Rate / Return</td><td align="right">\${fmtNum(rate * 100, 2)}%</td></tr>
        <tr><td>Time Horizon</td><td align="right">\${yrs} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Projected Future Value (FV)</b></td><td align="right"><font size="+1"><b>\${fmtMoney(fv)}</b></font></td></tr>
        <tr><td>Net Financial Growth</td><td align="right"><font color="green"><b>\${fmtMoney(fv - pv)}</b></font></td></tr>
      </table>
    \`;
  };
`;

fs.writeFileSync(path.join(__dirname, 'built-financial.js'), code, 'utf8');
console.log('Built financial engines successfully.');
