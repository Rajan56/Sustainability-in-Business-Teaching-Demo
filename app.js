/* Teaching demo: three small exercises with fictional teaching data. */
(function () {
  'use strict';
  var fmtEur = function (v) {
    var s = Math.round(Math.abs(v) / 1000).toLocaleString('en-GB');
    return (v < 0 ? '−€' : '€') + s + 'k';
  };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Exercise 1: business case simulator ---------- */
  var BC = { invest: 450000, mwh: 1200, co2: 240, maint: 15000, rate: 0.08 };
  function annuity(n) { var f = 0; for (var t = 1; t <= n; t++) f += 1 / Math.pow(1 + BC.rate, t); return f; }

  function updateBC() {
    var price = +$('price').value, carbon = +$('carbon').value,
        reward = +$('reward').value * 1000, reg = +$('reg').value * 1000, years = +$('years').value;
    $('price-o').textContent = '€' + price + ' / MWh';
    $('carbon-o').textContent = '€' + carbon + ' / t';
    $('reward-o').textContent = '€' + (reward / 1000) + 'k / year';
    $('reg-o').textContent = '€' + (reg / 1000) + 'k / year';

    var energy = BC.mwh * price, carb = BC.co2 * carbon;
    var yearly = energy + carb + reward + reg - BC.maint;
    var a = annuity(years);
    var npv = -BC.invest + yearly * a;
    var npvEnergyOnly = -BC.invest + (energy - BC.maint) * a;

    var verdict;
    if (npvEnergyOnly > 0) verdict = 'It pays on energy savings alone. Sustainability and profit move together here.';
    else if (npv > 0) verdict = 'It pays only because carbon costs, customers or regulation reward it. Take those away and the answer changes.';
    else verdict = 'In money terms it does not pay within ' + years + ' years, yet it would avoid ' + (BC.co2 * years).toLocaleString('en-GB') + ' tonnes of CO₂. Who should decide?';
    $('bc-verdict').textContent = verdict;
    $('bc-npv').textContent = fmtEur(npv);
    $('bc-payback').textContent = yearly > 0 ? (BC.invest / yearly).toFixed(1) + ' years' : 'never';
    $('bc-co2').textContent = (BC.co2 * years).toLocaleString('en-GB') + ' t';

    var rows = [
      ['Energy saved', energy, ''], ['Carbon cost avoided', carb, ''], ['Customer reward', reward, ''],
      ['Regulation avoided', reg, ''], ['Maintenance', BC.maint, 'cost'],
      ['Yearly capital cost', BC.invest / a, 'cost']
    ];
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; })) || 1;
    $('bc-bars').innerHTML = rows.map(function (r) {
      return '<div class="bar"><span>' + r[0] + '</span><i class="' + r[2] + '" style="width:' + (r[1] / max * 100).toFixed(1) + '%"></i><em>' + fmtEur(r[2] ? -r[1] : r[1]) + '</em></div>';
    }).join('');
  }
  ['price', 'carbon', 'reward', 'reg', 'years'].forEach(function (id) {
    $(id).addEventListener('input', updateBC); $(id).addEventListener('change', updateBC);
  });
  updateBC();

  /* ---------- Exercise 2: where the data stops ---------- */
  var ITEMS = [
    { t: 'Total energy use', inCap: true, h: 3, v: 3 },
    { t: 'Scope 1 and 2 greenhouse gas emissions', inCap: true, h: 5, v: 4 },
    { t: 'Waste generated and recycled', inCap: true, h: 3, v: 2 },
    { t: 'Water withdrawal', inCap: true, h: 2, v: 1 },
    { t: 'Work-related accidents', inCap: true, h: 2, v: 2 },
    { t: 'Carbon footprint of each product you buy', inCap: false, h: 30, v: 5 },
    { t: 'The supplier’s own scope 3 emissions', inCap: false, h: 40, v: 3 },
    { t: 'Full life-cycle assessment', inCap: false, h: 60, v: 4 },
    { t: 'Detailed biodiversity impact study', inCap: false, h: 35, v: 2 },
    { t: 'Audit of the supplier’s own suppliers', inCap: false, h: 45, v: 3 }
  ];
  var list = $('ds-list');
  list.innerHTML = ITEMS.map(function (it, i) {
    var pre = (i === 0 || i === 1 || i === 5) ? ' checked' : '';
    return '<li><label><input type="checkbox" data-i="' + i + '"' + pre + '><span>' + it.t + '</span><span class="tag ' + (it.inCap ? 'in">inside the standard' : 'out">beyond the standard') + '</span></label></li>';
  }).join('');

  function updateDS() {
    var refuse = $('ds-refuse').checked, asked = [], hours = 0, vTotal = 0, vMeasured = 0, refused = 0;
    list.querySelectorAll('input').forEach(function (cb) {
      if (!cb.checked) return;
      var it = ITEMS[+cb.dataset.i]; asked.push(it); vTotal += it.v;
      if (refuse && !it.inCap) { refused++; } else { hours += it.h; vMeasured += it.v; }
    });
    var cap = 40;
    $('ds-hours').textContent = hours + ' hours requested';
    var hm = $('ds-hours-m'); hm.style.width = Math.min(100, hours / 120 * 100) + '%'; hm.className = hours > cap ? 'warn' : '';
    var vis = vTotal ? Math.round(vMeasured / vTotal * 100) : 0;
    $('ds-vis').textContent = asked.length ? vis + ' % measured' : 'nothing requested';
    var vm = $('ds-vis-m'); vm.style.width = vis + '%'; vm.className = vis < 60 ? 'warn' : '';

    var msg;
    if (!asked.length) msg = 'Choose at least one item to request.';
    else if (refuse && refused) msg = 'The supplier may refuse ' + refused + ' of your ' + asked.length + ' requests. You would fill those gaps with sector averages, which cannot show a real reduction at this supplier. The supplier, meanwhile, keeps its workload within reach.';
    else if (!refuse && hours > cap) msg = 'Everything arrives, but the supplier would need ' + hours + ' hours, far beyond what it can spare. Answers given under that pressure may be rough estimates anyway.';
    else msg = 'Everything you asked for is inside the standard, so the supplier is expected to provide it, and you see measured performance.';
    $('ds-msg').textContent = msg;
  }
  list.addEventListener('change', updateDS);
  $('ds-refuse').addEventListener('change', updateDS);
  updateDS();

  /* ---------- Exercise 3: symbolic or substantive? ---------- */
  var Q = [
    { s: 'A listed company announces a net-zero target for 2050 in a glossy report. There are no interim targets and the investment budget is unchanged.',
      best: 'sym', fb: 'Most readers would call this symbolic for now: a distant goal with no change to where money goes. The case for “cannot tell yet”: some firms start with a pledge and build the plan later. What evidence would change your mind within two years?' },
    { s: 'A 90-person supplier installs energy meters on its main lines. Monthly figures are discussed in production meetings, and two energy-intensive runs are moved to night hours.',
      best: 'sub', fb: 'This looks substantive: measurement reaches a meeting where decisions are made, and practice changes. A sceptic might ask whether night shifts shifted the burden to workers, a reminder that social effects belong in the picture too.' },
    { s: 'A firm gains an environmental management certification. A consultant completed the documentation; machine operators were not involved and say nothing has changed.',
      best: 'sym', fb: 'A classic sign of decoupling: the formal structure exists for an outside audience while daily work stays the same (Boiral, 2007). Certification can still matter later if it creates routines that people take up.' },
    { s: 'A company reports that its supply chain emissions fell by 30 %. The year before, it switched from spending-based estimates to data from its suppliers.',
      best: 'cant', fb: 'Cannot tell yet is the honest answer. The drop may come from a new way of measuring rather than a change in the world. To judge, you would compare both methods for the same year.' },
    { s: 'Plant managers receive bonuses tied to energy use per tonne. The target is met after the most energy-intensive step is moved to a subcontractor.',
      best: 'sym', fb: 'The indicator improved, the emissions moved. This is burden shifting: the measure became the goal. The case for “substantive”: if the subcontractor is far more efficient, total emissions may still fall. You would need the subcontractor’s data.' },
    { s: 'A small supplier declines a customer’s request for a full life-cycle assessment, but shares its energy and waste data and joins the customer’s efficiency programme.',
      best: 'sub', fb: 'Substantive within limits: it refuses what it cannot carry and engages where it can act. Some would answer “cannot tell yet” until the programme shows results, which is also a fair position.' }
  ];
  var LABEL = { sub: 'Substantive', sym: 'Symbolic', cant: 'Cannot tell yet' };
  var qi = 0, agreed = 0, answered = false;
  var btns = document.querySelectorAll('#q-choices button');

  function showQ() {
    answered = false;
    $('q-count').textContent = 'Scenario ' + (qi + 1) + ' of ' + Q.length;
    $('q-text').textContent = Q[qi].s;
    $('q-fb').hidden = true;
    btns.forEach(function (b) { b.disabled = false; b.setAttribute('aria-pressed', 'false'); });
    $('q-next').textContent = qi === Q.length - 1 ? 'Start again' : 'Next scenario';
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (answered) return;
      answered = true;
      var a = b.dataset.a, q = Q[qi];
      if (a === q.best) agreed++;
      btns.forEach(function (x) { x.disabled = true; });
      b.setAttribute('aria-pressed', 'true');
      var lead = a === q.best ? 'Many would agree with you.' : 'A defensible view. Here is how others may see it.';
      $('q-fb').innerHTML = '<b>' + lead + '</b> Most common answer: ' + LABEL[q.best] + '. ' + q.fb;
      $('q-fb').hidden = false;
      $('q-tally').textContent = 'Matched the most common answer in ' + agreed + ' of ' + (qi + 1);
    });
  });
  $('q-next').addEventListener('click', function () {
    if (qi === Q.length - 1) { qi = 0; agreed = 0; $('q-tally').textContent = ''; } else qi++;
    showQ();
  });
  showQ();
})();
