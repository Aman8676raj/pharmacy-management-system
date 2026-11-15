const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING PHASE 3 INVENTORY MANAGEMENT API TESTS');
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

  // Fetch an active medicine
  const medsRes = await fetch(`${BASE_URL}/medicines`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const medsData = await medsRes.json();
  const testMedicine = medsData.data.medicines[0];
  const testMedicineId = testMedicine.id || testMedicine._id;

  const uniqueSuffix = Date.now();
  let createdBatchId = null;
  let testBatchNumber = `TEST-BT-${uniqueSuffix}`;

  // Scenario 1: Admin can add stock
  await test('Scenario 1: Admin can add stock', async () => {
    const res = await fetch(`${BASE_URL}/inventory/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        medicine: testMedicineId,
        batchNumber: testBatchNumber,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        purchasePrice: 5.0,
        sellingPrice: 9.0,
        quantityReceived: 50,
        supplierName: 'Admin Direct Logistics',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.batch.batchNumber, testBatchNumber);
    assert.strictEqual(data.data.batch.availableQuantity, 50);
    createdBatchId = data.data.batch.id;
  });

  // Scenario 2: Inventory Manager can add stock
  await test('Scenario 2: Inventory Manager can add stock', async () => {
    const res = await fetch(`${BASE_URL}/inventory/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
      body: JSON.stringify({
        medicine: testMedicineId,
        batchNumber: `IM-BT-${uniqueSuffix}`,
        expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
        purchasePrice: 6.0,
        sellingPrice: 10.0,
        quantityReceived: 30,
        supplierName: 'IM Supplier',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.batch.availableQuantity, 30);
  });

  // Scenario 3: Cashier cannot add stock
  await test('Scenario 3: Cashier cannot add stock', async () => {
    const res = await fetch(`${BASE_URL}/inventory/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        medicine: testMedicineId,
        batchNumber: `CASH-BT-${uniqueSuffix}`,
        expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
        purchasePrice: 6.0,
        sellingPrice: 10.0,
        quantityReceived: 30,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
  });

  // Scenario 4: Pharmacist cannot adjust stock
  await test('Scenario 4: Pharmacist cannot adjust stock', async () => {
    const res = await fetch(`${BASE_URL}/inventory/batches/${createdBatchId}/adjust`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        adjustmentType: 'adjustment_out',
        quantity: 5,
        reason: 'Expired pills found',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
  });

  // Scenario 5: Duplicate medicine batches are handled correctly (adds to existing batch)
  await test('Scenario 5: Duplicate medicine batches are handled correctly (replenishes batch)', async () => {
    const res = await fetch(`${BASE_URL}/inventory/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        medicine: testMedicineId,
        batchNumber: testBatchNumber, // Same batch number and medicine!
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        purchasePrice: 5.0,
        sellingPrice: 9.0,
        quantityReceived: 25, // Add 25 more
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.data.isExistingBatch, true);
    assert.strictEqual(data.data.batch.availableQuantity, 75); // 50 + 25 = 75
  });

  // Scenario 6: Stock-in increases available quantity
  await test('Scenario 6: Stock-in increases available quantity', async () => {
    const checkRes = await fetch(`${BASE_URL}/inventory/batches/${createdBatchId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.data.batch.availableQuantity, 75);
  });

  // Scenario 7: Stock adjustment increases quantity
  await test('Scenario 7: Stock adjustment increases quantity', async () => {
    const res = await fetch(`${BASE_URL}/inventory/batches/${createdBatchId}/adjust`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        adjustmentType: 'adjustment_in',
        quantity: 10,
        reason: 'Found misplaced stock during audit',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.batch.availableQuantity, 85); // 75 + 10 = 85
  });

  // Scenario 8: Stock adjustment decreases quantity
  await test('Scenario 8: Stock adjustment decreases quantity', async () => {
    const res = await fetch(`${BASE_URL}/inventory/batches/${createdBatchId}/adjust`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        adjustmentType: 'adjustment_out',
        quantity: 15,
        reason: 'Damaged packaging during shelf transfer',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.batch.availableQuantity, 70); // 85 - 15 = 70
  });

  // Scenario 9: Negative stock is rejected
  await test('Scenario 9: Negative stock is rejected', async () => {
    const res = await fetch(`${BASE_URL}/inventory/batches/${createdBatchId}/adjust`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        adjustmentType: 'adjustment_out',
        quantity: 9999, // More than 70 available!
        reason: 'Excessive deduction attempt',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('Insufficient stock'));
  });

  // Scenario 10: Missing adjustment reason is rejected
  await test('Scenario 10: Missing adjustment reason is rejected', async () => {
    const res = await fetch(`${BASE_URL}/inventory/batches/${createdBatchId}/adjust`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        adjustmentType: 'adjustment_out',
        quantity: 5,
        reason: '', // Empty reason
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  // Scenario 11: Expired batches are identified correctly
  await test('Scenario 11: Expired batches are identified correctly', async () => {
    const res = await fetch(`${BASE_URL}/inventory/expired`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.count > 0);
    const hasExpiredBatch = data.data.batches.some(
      (b) => new Date(b.expiryDate) < new Date()
    );
    assert.strictEqual(hasExpiredBatch, true);
  });

  // Scenario 12: Expiring-soon batches are identified correctly
  await test('Scenario 12: Expiring-soon batches are identified correctly', async () => {
    const res = await fetch(`${BASE_URL}/inventory/expiring?days=90`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.count > 0);
    assert.ok(data.data.batches.every((b) => b.daysLeft <= 90 && b.daysLeft >= 0));
  });

  // Scenario 13: Quarantined stock is excluded from sellable inventory
  await test('Scenario 13: Quarantined stock is excluded from sellable inventory', async () => {
    // 13a: Quarantine createdBatchId
    const qRes = await fetch(`${BASE_URL}/inventory/batches/${createdBatchId}/quarantine`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Quality control batch inspection' }),
    });
    const qData = await qRes.json();
    assert.strictEqual(qRes.status, 200);
    assert.strictEqual(qData.data.batch.status, 'quarantined');

    // 13b: FEFO allocation should not allocate from quarantined batch
    const fefoRes = await fetch(`${BASE_URL}/inventory/fefo-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        medicineId: testMedicineId,
        quantity: 10,
      }),
    });
    const fefoData = await fefoRes.json();
    if (fefoData.data.isAllocatable) {
      const allocatedQuarantined = fefoData.data.allocations.some(
        (a) => a.batchId.toString() === createdBatchId.toString()
      );
      assert.strictEqual(
        allocatedQuarantined,
        false,
        'Quarantined batch must not be allocated in FEFO'
      );
    }
  });

  // Scenario 14: Released batches become eligible for normal stock operations
  await test('Scenario 14: Released batches become eligible for normal stock operations', async () => {
    const rRes = await fetch(`${BASE_URL}/inventory/batches/${createdBatchId}/release`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Quality inspection passed' }),
    });
    const rData = await rRes.json();
    assert.strictEqual(rRes.status, 200);
    assert.strictEqual(rData.data.batch.status, 'active');
  });

  // Scenario 15: Low-stock calculation uses Medicine.minimumStock
  await test('Scenario 15: Low-stock calculation uses Medicine.minimumStock', async () => {
    const res = await fetch(`${BASE_URL}/inventory/low-stock`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.count > 0);
    // Every returned item must have totalSellableQuantity <= minimumStock
    assert.ok(
      data.data.lowStockMedicines.every(
        (item) => item.totalSellableQuantity <= item.minimumStock
      )
    );
  });

  // Scenario 16: Inventory summary returns correct database values
  await test('Scenario 16: Inventory summary returns correct database values', async () => {
    const res = await fetch(`${BASE_URL}/inventory/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.totalActiveMedicines > 0);
    assert.ok(data.data.totalBatches > 0);
    assert.ok(data.data.totalSellableUnits > 0);
    assert.ok(data.data.inventoryPurchaseValue > 0);
  });

  // Scenario 17: Batch details load correctly
  await test('Scenario 17: Batch details load correctly', async () => {
    const res = await fetch(`${BASE_URL}/inventory/batches/${createdBatchId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.batch.id, createdBatchId);
    assert.ok(Array.isArray(data.data.transactions));
    assert.ok(data.data.transactions.length >= 1);
  });

  // Scenario 18: Medicine batch listing works
  await test('Scenario 18: Medicine batch listing works', async () => {
    const res = await fetch(`${BASE_URL}/inventory/medicines/${testMedicineId}/batches`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data.data.batches));
    assert.ok(data.data.batches.length >= 1);
  });

  // Scenario 19: FEFO selects earliest-expiring eligible batches
  await test('Scenario 19: FEFO selects earliest-expiring eligible batches', async () => {
    // Paracetamol has BT-PARA-002 (expires in 45d) and BT-PARA-001 (expires in 1 yr)
    const paraRes = await fetch(`${BASE_URL}/medicines?search=MED-PARA-500`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const paraData = await paraRes.json();
    const paraMed = paraData.data.medicines.find((m) => m.sku === 'MED-PARA-500');
    assert.ok(paraMed, 'Paracetamol must be found');
    const res = await fetch(`${BASE_URL}/inventory/fefo-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        medicineId: paraMed.id || paraMed._id,
        quantity: 20,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.isAllocatable, true);
    // First allocation should be from BT-PARA-002 (earliest expiry)
    assert.strictEqual(data.data.allocations[0].batchNumber, 'BT-PARA-002');
    assert.strictEqual(data.data.allocations[0].allocatedQuantity, 20);
  });

  // Scenario 20: FEFO reports insufficient stock correctly
  await test('Scenario 20: FEFO reports insufficient stock correctly', async () => {
    const paraRes = await fetch(`${BASE_URL}/medicines?search=MED-PARA-500`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const paraData = await paraRes.json();
    const paraMed = paraData.data.medicines.find((m) => m.sku === 'MED-PARA-500');
    assert.ok(paraMed, 'Paracetamol must be found');
    const res = await fetch(`${BASE_URL}/inventory/fefo-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        medicineId: paraMed.id || paraMed._id,
        quantity: 99999, // Unattainable quantity
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.isAllocatable, false);
    assert.ok(data.data.deficit > 0);
    assert.ok(data.data.message.includes('Insufficient sellable stock'));
  });

  // Scenario 21: Transaction history records stock changes
  await test('Scenario 21: Transaction history records stock changes', async () => {
    const res = await fetch(`${BASE_URL}/inventory/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.transactions.length > 0);
    // Check that our earlier adjustments and stock_in are recorded
    const hasAdjustment = data.data.transactions.some((t) =>
      ['adjustment_in', 'adjustment_out', 'stock_in'].includes(t.transactionType)
    );
    assert.strictEqual(hasAdjustment, true);
  });

  // Scenario 22: Unauthenticated requests return 401
  await test('Scenario 22: Unauthenticated requests return 401', async () => {
    const res = await fetch(`${BASE_URL}/inventory`);
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  // Scenario 23: Invalid IDs return appropriate errors
  await test('Scenario 23: Invalid IDs return appropriate errors', async () => {
    const resBad = await fetch(`${BASE_URL}/inventory/batches/invalid-id-xyz`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(resBad.status, 400);

    const resNotFound = await fetch(`${BASE_URL}/inventory/batches/507f1f77bcf86cd799439011`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(resNotFound.status, 404);
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal inventory test error:', err);
  process.exit(1);
});
