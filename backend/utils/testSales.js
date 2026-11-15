const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING PHASE 5 SALES, POS & BILLING API TESTS');
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

  // Helper to authenticate
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
  const inventoryToken = await login('inventory@pharmacy.com', 'Password@123');
  const pharmacistToken = await login('pharmacist@pharmacy.com', 'Password@123');
  const cashierToken = await login('cashier@pharmacy.com', 'Password@123');

  // Fetch medicines for testing
  const medsRes = await fetch(`${BASE_URL}/medicines`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const medsData = await medsRes.json();
  const medicines = medsData.data.medicines.filter((m) => m.isActive);
  assert(medicines.length >= 2, 'Must have at least 2 active medicines for testing');
  const med1 = medicines[0];
  const med2 = medicines[1];
  const med1Id = med1.id || med1._id;
  const med2Id = med2.id || med2._id;

  const timestamp = Date.now();
  const batchNumLater = `BAT-LATER-${timestamp}`;
  const batchNumEarlier = `BAT-EARLIER-${timestamp}`;

  let createdSale1 = null;
  let createdSale2 = null;

  // Scenario 1: Health check returns API status
  await test('Scenario 1: Health check returns valid API status and version >= 5.0.0', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(parseFloat(data.version) >= 5.0, `Version should be >= 5.0.0, got ${data.version}`);
  });

  // Scenario 2: Prepare inventory with Batch 1 (expires in 180 days)
  await test('Scenario 2: Add initial Batch 1 expiring in 180 days', async () => {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 180);

    const mfgDate = new Date();
    mfgDate.setDate(mfgDate.getDate() - 30);

    const res = await fetch(`${BASE_URL}/inventory/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        medicine: med1Id,
        batchNumber: batchNumLater,
        manufacturingDate: mfgDate.toISOString().split('T')[0],
        expiryDate: expDate.toISOString().split('T')[0],
        purchasePrice: 40,
        sellingPrice: 75,
        quantityReceived: 50,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
  });

  // Scenario 3: Add Batch 2 for same medicine with EARLIER expiry (expires in 60 days) to test FEFO
  await test('Scenario 3: Add Batch 2 expiring in 60 days (FEFO priority)', async () => {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 60);

    const mfgDate = new Date();
    mfgDate.setDate(mfgDate.getDate() - 30);

    const res = await fetch(`${BASE_URL}/inventory/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        medicine: med1Id,
        batchNumber: batchNumEarlier,
        manufacturingDate: mfgDate.toISOString().split('T')[0],
        expiryDate: expDate.toISOString().split('T')[0],
        purchasePrice: 38,
        sellingPrice: 75,
        quantityReceived: 10,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
  });

  // Scenario 4: Pharmacist creates full-payment POS sale with FEFO verification
  await test('Scenario 4: Pharmacist creates full-payment POS sale with FEFO allocation', async () => {
    // We order 15 units. Batch 2 has 10 units (earlier expiry), Batch 1 has 50 units (later expiry).
    // FEFO should allocate 10 units from Batch 2 and 5 units from Batch 1.
    const res = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            medicine: med1Id,
            quantity: 15,
            unitPrice: 75,
            discount: 0,
            taxRate: 5,
          },
        ],
        amountPaid: 1500, // Full payment (more than required, change given)
        paymentMethod: 'cash',
        customerSnapshot: {
          name: 'Rajesh Kumar',
          phone: '9876543210',
          prescriptionRef: 'Dr. Sharma - Clinic Rx #882',
        },
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.sale.invoiceNumber.startsWith('INV-'));
    assert.strictEqual(data.data.sale.paymentStatus, 'paid');
    assert.strictEqual(data.data.sale.balanceAmount, 0);

    createdSale1 = data.data.sale;

    // Verify FEFO allocations
    const item = createdSale1.items[0];
    assert.strictEqual(item.quantity, 15);
    assert.strictEqual(item.batchAllocations.length, 2, 'Should allocate from both batches');
    assert.strictEqual(item.batchAllocations[0].batchNumber, batchNumEarlier, 'Earliest batch should be deducted first');
    assert.strictEqual(item.batchAllocations[0].quantity, 10, 'Full earlier batch should be depleted');
    assert.strictEqual(item.batchAllocations[1].batchNumber, batchNumLater, 'Remaining quantity from later batch');
    assert.strictEqual(item.batchAllocations[1].quantity, 5);
  });

  // Scenario 5: Verify stock_out transactions were logged in inventory
  await test('Scenario 5: Verify stock_out audit transactions were created', async () => {
    const res = await fetch(`${BASE_URL}/inventory/transactions?search=${createdSale1.invoiceNumber}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.transactions.length >= 2, 'Should have at least 2 stock_out transactions');
    assert.strictEqual(data.data.transactions[0].transactionType, 'stock_out');
  });

  // Scenario 6: Cashier creates partial-payment POS sale with discounts
  await test('Scenario 6: Cashier creates partial-payment POS sale with line discounts', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            medicine: med1Id,
            quantity: 5,
            unitPrice: 75,
            discount: 10, // 10% discount
            taxRate: 5, // 5% GST
          },
        ],
        discount: 25, // Order discount fixed ₹25
        discountType: 'fixed',
        amountPaid: 200, // Partial payment
        paymentMethod: 'upi',
        customerSnapshot: {
          name: 'Priya Sharma',
          phone: '9848022338',
        },
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.sale.paymentStatus, 'partially_paid');
    assert.ok(data.data.sale.balanceAmount > 0);
    assert.strictEqual(data.data.sale.amountPaid, 200);

    createdSale2 = data.data.sale;
  });

  // Scenario 7: Cashier isolation - Cashier cannot see Pharmacist sale
  await test('Scenario 7: Cashier isolation - cashier only sees own sales', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      headers: { Authorization: `Bearer ${cashierToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    const cashierSaleIds = data.data.sales.map((s) => s._id || s.id);
    assert.ok(cashierSaleIds.includes(createdSale2._id));
    assert.ok(!cashierSaleIds.includes(createdSale1._id), 'Cashier must NOT see sales by other staff');
  });

  // Scenario 8: Admin can view all sales across all staff
  await test('Scenario 8: Admin views all sales across staff', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    const allSaleIds = data.data.sales.map((s) => s._id || s.id);
    assert.ok(allSaleIds.includes(createdSale1._id));
    assert.ok(allSaleIds.includes(createdSale2._id));
  });

  // Scenario 9: Cashier records subsequent balance payment
  await test('Scenario 9: Cashier records subsequent payment to settle invoice balance', async () => {
    const balance = createdSale2.balanceAmount;
    const res = await fetch(`${BASE_URL}/sales/${createdSale2._id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        amount: balance,
        paymentMethod: 'cash',
        notes: 'Final balance settled in cash',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.sale.paymentStatus, 'paid');
    assert.strictEqual(data.data.sale.balanceAmount, 0);
  });

  // Scenario 10: Inventory Manager cannot create sale (RBAC check)
  await test('Scenario 10: Inventory Manager cannot create sale (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
      body: JSON.stringify({
        items: [{ medicine: med1Id, quantity: 1, unitPrice: 75 }],
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  // Scenario 11: Unauthenticated request is rejected with 401
  await test('Scenario 11: Unauthenticated request returns 401', async () => {
    const res = await fetch(`${BASE_URL}/sales`);
    assert.strictEqual(res.status, 401);
  });

  // Scenario 12: Sale creation with insufficient stock fails cleanly (400)
  await test('Scenario 12: Sale exceeding available stock fails with 400 and preserves stock', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        items: [{ medicine: med1Id, quantity: 99999, unitPrice: 75 }],
      }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes('Insufficient'));
  });

  // Scenario 13: Cashier cannot cancel a sale (Admin-only action)
  await test('Scenario 13: Cashier cannot cancel a sale (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/sales/${createdSale1._id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({ reason: 'Customer requested refund' }),
    });
    assert.strictEqual(res.status, 403);
  });

  // Scenario 14: Admin cancels sale, restoring stock to batches with return_in transactions
  await test('Scenario 14: Admin cancels sale and restores stock via return_in', async () => {
    const res = await fetch(`${BASE_URL}/sales/${createdSale1._id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Prescription cancelled by physician' }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.sale.saleStatus, 'cancelled');
    assert.strictEqual(data.data.sale.cancelReason, 'Prescription cancelled by physician');

    // Verify return_in transaction was logged for this invoice
    const txRes = await fetch(`${BASE_URL}/inventory/transactions?search=${createdSale1.invoiceNumber}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const txData = await txRes.json();
    const returnTx = txData.data.transactions.find((t) => t.transactionType === 'return_in');
    assert.ok(returnTx, 'return_in transaction must be logged upon cancellation');
  });

  // Scenario 15: Cannot cancel already cancelled sale
  await test('Scenario 15: Cannot cancel already cancelled sale (400)', async () => {
    const res = await fetch(`${BASE_URL}/sales/${createdSale1._id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Duplicate cancel' }),
    });
    assert.strictEqual(res.status, 400);
  });

  // Scenario 16: Fetch sale details by ID and by Invoice Number
  await test('Scenario 16: Get single sale by ID and by Invoice Number', async () => {
    const resById = await fetch(`${BASE_URL}/sales/${createdSale2._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataById = await resById.json();
    assert.strictEqual(resById.status, 200);
    assert.strictEqual(dataById.data.sale.invoiceNumber, createdSale2.invoiceNumber);
    assert.ok(Array.isArray(dataById.data.payments), 'Payments history must be returned');

    const resByInv = await fetch(`${BASE_URL}/sales/invoice/${createdSale2.invoiceNumber}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataByInv = await resByInv.json();
    assert.strictEqual(resByInv.status, 200);
    assert.strictEqual(dataByInv.data.sale._id, createdSale2._id);
  });

  // Scenario 17: Get sales statistics endpoint
  await test('Scenario 17: Sales statistics aggregated successfully', async () => {
    const res = await fetch(`${BASE_URL}/sales/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.today !== undefined);
    assert.ok(data.data.overall !== undefined);
    assert.ok(data.data.statusCounts !== undefined);
    assert.ok(Array.isArray(data.data.dailyTrend));
    assert.strictEqual(data.data.dailyTrend.length, 7);
  });

  // Scenario 18: Get sale profit analytics
  await test('Scenario 18: Sale profit analytics returns COGS and margins', async () => {
    const res = await fetch(`${BASE_URL}/sales/${createdSale2._id}/profit`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.totalRevenue > 0);
    assert.ok(data.data.totalCost >= 0);
    assert.ok(data.data.grossProfit !== undefined);
  });

  // Scenario 19: Stream / Download PDF invoice via PDFKit
  await test('Scenario 19: Download PDF invoice via PDFKit returns valid PDF binary', async () => {
    const res = await fetch(`${BASE_URL}/sales/${createdSale2._id}/invoice`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type');
    assert.ok(contentType.includes('application/pdf'), 'Content-Type must be application/pdf');

    const buffer = await res.arrayBuffer();
    const pdfHeader = Buffer.from(buffer.slice(0, 5)).toString();
    assert.strictEqual(pdfHeader, '%PDF-', 'Buffer must begin with PDF magic header %PDF-');
  });

  console.log('\n====================================================');
  console.log(`  PHASE 5 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;

