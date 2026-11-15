const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING PHASE 2 MEDICINE MANAGEMENT API TESTS');
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

  // 1. Authenticate users to get tokens
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
  const cashierToken = await login('cashier@pharmacy.com', 'Password@123');

  let testMedId = null;
  const uniqueSuffix = Date.now();

  // Test 1: Admin adds a medicine successfully
  await test('Scenario 1: Admin adds a medicine successfully', async () => {
    const res = await fetch(`${BASE_URL}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Test Med Admin ${uniqueSuffix}`,
        genericName: 'Adminium Testate',
        brandName: 'Admira',
        category: 'Analgesics',
        manufacturer: 'Admin Pharma Lab',
        description: 'Test medicine created by Admin',
        dosageForm: 'Tablet',
        strength: '100mg',
        packSize: '10x10',
        unit: 'Strip',
        sku: `SKU-ADM-${uniqueSuffix}`,
        barcode: `BAR-ADM-${uniqueSuffix}`,
        requiresPrescription: false,
        minimumStock: 15,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.medicine.id);
    testMedId = data.data.medicine.id;
  });

  // Test 2: Pharmacist adds a medicine successfully
  await test('Scenario 2: Pharmacist adds a medicine successfully', async () => {
    const res = await fetch(`${BASE_URL}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        name: `Test Med Pharma ${uniqueSuffix}`,
        genericName: 'Pharmacillin',
        category: 'Antibiotics',
        manufacturer: 'Pharma Lab',
        dosageForm: 'Capsule',
        strength: '250mg',
        sku: `SKU-PHARM-${uniqueSuffix}`,
        barcode: `BAR-PHARM-${uniqueSuffix}`,
        requiresPrescription: true,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
    assert.strictEqual(data.success, true);
  });

  // Test 3: Cashier cannot add medicines (403 Forbidden)
  await test('Scenario 3: Cashier cannot add medicines', async () => {
    const res = await fetch(`${BASE_URL}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Cashier Med',
        category: 'Analgesics',
        sku: `SKU-CASH-${uniqueSuffix}`,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403, `Expected 403, got ${res.status}`);
    assert.strictEqual(data.success, false);
  });

  // Test 4: Duplicate SKU is rejected
  await test('Scenario 4: Duplicate SKU is rejected', async () => {
    const res = await fetch(`${BASE_URL}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Another Med Same SKU',
        category: 'Analgesics',
        sku: `SKU-ADM-${uniqueSuffix}`, // Duplicate SKU
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('already exists'));
  });

  // Test 5: Duplicate barcode is rejected
  await test('Scenario 5: Duplicate barcode is rejected', async () => {
    const res = await fetch(`${BASE_URL}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Another Med Same Barcode',
        category: 'Analgesics',
        sku: `SKU-NEW-${uniqueSuffix}`,
        barcode: `BAR-ADM-${uniqueSuffix}`, // Duplicate barcode
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('barcode'));
  });

  // Test 6: Medicine listing works
  await test('Scenario 6: Medicine listing works', async () => {
    const res = await fetch(`${BASE_URL}/medicines`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.medicines));
    assert.ok(data.data.pagination.total > 0);
  });

  // Test 7: Search works with partial medicine names
  await test('Scenario 7: Search works with partial medicine names', async () => {
    const res = await fetch(`${BASE_URL}/medicines?search=para`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.medicines.length > 0);
    const hasParacetamol = data.data.medicines.some((m) =>
      m.name.toLowerCase().includes('para')
    );
    assert.ok(hasParacetamol, 'Should find Paracetamol');
  });

  // Test 8: Category filtering works
  await test('Scenario 8: Category filtering works', async () => {
    const res = await fetch(`${BASE_URL}/medicines?category=Antibiotics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.medicines.length > 0);
    assert.ok(
      data.data.medicines.every(
        (m) => m.category.toLowerCase() === 'antibiotics'
      )
    );
  });

  // Test 9: Manufacturer filtering works
  await test('Scenario 9: Manufacturer filtering works', async () => {
    const res = await fetch(`${BASE_URL}/medicines?manufacturer=Pfizer`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.medicines.length > 0);
    assert.ok(
      data.data.medicines.every((m) =>
        m.manufacturer.toLowerCase().includes('pfizer')
      )
    );
  });

  // Test 10: Pagination works
  await test('Scenario 10: Pagination works', async () => {
    const res = await fetch(`${BASE_URL}/medicines?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.medicines.length, 2);
    assert.strictEqual(data.data.pagination.page, 1);
    assert.strictEqual(data.data.pagination.limit, 2);
    assert.ok(data.data.pagination.totalPages >= 2);
  });

  // Test 11: Medicine details load correctly
  await test('Scenario 11: Medicine details load correctly', async () => {
    const res = await fetch(`${BASE_URL}/medicines/${testMedId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.medicine.id, testMedId);
    assert.ok(data.data.medicine.createdBy.name);
  });

  // Test 12: Medicine updates work
  await test('Scenario 12: Medicine updates work', async () => {
    const res = await fetch(`${BASE_URL}/medicines/${testMedId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: 'Updated description for test med',
        minimumStock: 25,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.medicine.minimumStock, 25);
    assert.strictEqual(
      data.data.medicine.description,
      'Updated description for test med'
    );
  });

  // Test 13: Medicine deactivation works
  await test('Scenario 13: Medicine deactivation works', async () => {
    const res = await fetch(`${BASE_URL}/medicines/${testMedId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.medicine.isActive, false);
  });

  // Test 14: Inactive medicines are excluded from normal listings
  await test('Scenario 14: Inactive medicines are excluded from normal listings', async () => {
    const res = await fetch(`${BASE_URL}/medicines`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    const foundInactive = data.data.medicines.some((m) => m.id === testMedId);
    assert.strictEqual(
      foundInactive,
      false,
      'Deactivated medicine must not be present in default listings'
    );
  });

  // Test 15: Unauthenticated requests are rejected
  await test('Scenario 15: Unauthenticated requests are rejected', async () => {
    const res = await fetch(`${BASE_URL}/medicines`);
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  // Test 16: Invalid medicine IDs return appropriate errors
  await test('Scenario 16: Invalid medicine IDs return appropriate errors', async () => {
    // 16a: Invalid format returns 400
    const resBadFormat = await fetch(`${BASE_URL}/medicines/invalid-mongo-id-123`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataBadFormat = await resBadFormat.json();
    assert.strictEqual(resBadFormat.status, 400);
    assert.strictEqual(dataBadFormat.success, false);
    assert.ok(
      dataBadFormat.errors &&
        dataBadFormat.errors.some((e) => e.message.includes('Invalid medicine ID'))
    );

    // 16b: Non-existent valid ObjectId returns 404
    const resNotFound = await fetch(`${BASE_URL}/medicines/507f1f77bcf86cd799439011`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataNotFound = await resNotFound.json();
    assert.strictEqual(resNotFound.status, 404);
    assert.strictEqual(dataNotFound.success, false);
    assert.ok(dataNotFound.message.includes('not found'));
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
