const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING PHASE 7 REPORTS & ANALYTICS API TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // Helper login function
  async function login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Login failed for ${email}: ${data.message}`);
    return data.data.token;
  }

  const adminToken = await login('admin@pharmacy.com', 'Password@123');
  const pharmacistToken = await login('pharmacist@pharmacy.com', 'Password@123');
  const inventoryToken = await login('inventory@pharmacy.com', 'Password@123');
  const cashierToken = await login('cashier@pharmacy.com', 'Password@123');

  // Scenario 1: Health check returns Phase 7 with version >= 7.0.0
  await test('Scenario 1: Health check returns valid API status and version >= 7.0.0', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(parseFloat(data.version) >= 7.0, `Version should be >= 7.0.0, got ${data.version}`);
  });

  // Scenario 2: Executive Dashboard stats endpoint
  await test('Scenario 2: Executive Dashboard stats endpoint returns live counts across modules', async () => {
    const res = await fetch(`${BASE_URL}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.medicines !== undefined);
    assert.ok(typeof data.data.medicines.total === 'number');
    assert.ok(data.data.sales !== undefined);
    assert.ok(typeof data.data.sales.lifetimeRevenue === 'number');
    assert.ok(data.data.procurement !== undefined);
    assert.ok(data.data.patients !== undefined);
    assert.ok(Array.isArray(data.data.dailyTrend));
  });

  // Scenario 3: Sales report returns summary, payment methods and staff performance
  await test('Scenario 3: Sales report returns summary, payment methods and staff performance', async () => {
    const res = await fetch(`${BASE_URL}/reports/sales`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.summary !== undefined);
    assert.ok(typeof data.data.summary.grossRevenue === 'number');
    assert.ok(Array.isArray(data.data.paymentMethods));
    assert.ok(Array.isArray(data.data.staffPerformance));
    assert.ok(Array.isArray(data.data.timeSeries));
  });

  // Scenario 4: Sales report with custom date filtering
  await test('Scenario 4: Sales report with custom date filtering', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`${BASE_URL}/reports/sales?startDate=${today}&endDate=${today}`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.dateRange.startDate.startsWith(today));
  });

  // Scenario 5: Inventory valuation and stock report
  await test('Scenario 5: Inventory valuation report returns purchase & selling valuation', async () => {
    const res = await fetch(`${BASE_URL}/reports/inventory`, {
      headers: { Authorization: `Bearer ${inventoryToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.summary.purchaseCostValuation >= 0);
    assert.ok(data.data.summary.sellingPriceValuation >= 0);
    assert.ok(typeof data.data.summary.potentialProfit === 'number');
    assert.ok(data.data.expiryAnalysis !== undefined);
    assert.ok(Array.isArray(data.data.lowStockAlerts));
    assert.ok(Array.isArray(data.data.categoryDistribution));
  });

  // Scenario 6: Purchase & Procurement report
  await test('Scenario 6: Purchase report returns procurement spend and supplier breakdown', async () => {
    const res = await fetch(`${BASE_URL}/reports/purchases`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(typeof data.data.summary.netProcurementSpend === 'number');
    assert.ok(data.data.statusCounts !== undefined);
    assert.ok(Array.isArray(data.data.supplierSpend));
  });

  // Scenario 7: Profit & Loss report
  await test('Scenario 7: Profit & Loss report returns revenue, COGS, and gross profit margins', async () => {
    const res = await fetch(`${BASE_URL}/reports/profit-loss`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(typeof data.data.summary.grossRevenue === 'number');
    assert.ok(typeof data.data.summary.costOfGoodsSold === 'number');
    assert.ok(typeof data.data.summary.grossProfit === 'number');
    assert.ok(typeof data.data.summary.grossMarginPercent === 'number');
    assert.ok(Array.isArray(data.data.timeSeries));
  });

  // Scenario 8: Medicine performance analytics
  await test('Scenario 8: Medicine performance analytics returns top and slow moving items', async () => {
    const res = await fetch(`${BASE_URL}/reports/medicines?limit=5`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.topByRevenue));
    assert.ok(Array.isArray(data.data.topByQuantity));
    assert.ok(Array.isArray(data.data.slowMoving));
    assert.ok(Array.isArray(data.data.highestMargin));
  });

  // Scenario 9: Customer analytics report
  await test('Scenario 9: Customer analytics report returns customer retention and top spenders', async () => {
    const res = await fetch(`${BASE_URL}/reports/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.summary.totalCustomers >= 0);
    assert.ok(Array.isArray(data.data.topSpenders));
  });

  // Scenario 10: CSV export for sales report
  await test('Scenario 10: CSV export for sales report returns valid text/csv format', async () => {
    const res = await fetch(`${BASE_URL}/reports/export/csv?type=sales`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('text/csv'), `Expected text/csv, got ${contentType}`);
    const text = await res.text();
    assert.ok(text.includes('Invoice Number'), 'CSV must include header columns');
  });

  // Scenario 11: CSV export for inventory report
  await test('Scenario 11: CSV export for inventory report returns valid text/csv format', async () => {
    const res = await fetch(`${BASE_URL}/reports/export/csv?type=inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('Medicine Name'), 'CSV must include medicine header');
  });

  // Scenario 12: PDF export for sales report via PDFKit
  await test('Scenario 12: PDF export for sales report via PDFKit returns valid PDF binary', async () => {
    const res = await fetch(`${BASE_URL}/reports/export/pdf?type=sales`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('application/pdf'), `Expected application/pdf, got ${contentType}`);
    const buffer = await res.arrayBuffer();
    const pdfHeader = Buffer.from(buffer.slice(0, 5)).toString('utf-8');
    assert.strictEqual(pdfHeader, '%PDF-', 'PDF file must start with %PDF- signature');
  });

  // Scenario 13: PDF export for inventory report via PDFKit
  await test('Scenario 13: PDF export for inventory report returns valid PDF binary', async () => {
    const res = await fetch(`${BASE_URL}/reports/export/pdf?type=inventory`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    assert.strictEqual(res.status, 200);
    const buffer = await res.arrayBuffer();
    const pdfHeader = Buffer.from(buffer.slice(0, 5)).toString('utf-8');
    assert.strictEqual(pdfHeader, '%PDF-', 'PDF file must start with %PDF- signature');
  });

  // Scenario 14: Cashier cannot access Profit & Loss report
  await test('Scenario 14: Cashier cannot access Profit & Loss report (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/reports/profit-loss`, {
      headers: { Authorization: `Bearer ${cashierToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // Scenario 15: Cashier cannot access Purchase procurement report
  await test('Scenario 15: Cashier cannot access Purchase report (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/reports/purchases`, {
      headers: { Authorization: `Bearer ${cashierToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // Scenario 16: Unauthenticated request to reports returns 401
  await test('Scenario 16: Unauthenticated request to reports returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/reports/sales`);
    assert.strictEqual(res.status, 401);
  });

  console.log('\n====================================================');
  console.log(`  PHASE 7 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();

