const assert = require('assert');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING PHASE 6 CUSTOMERS & PRESCRIPTIONS API TESTS');
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
  const pharmacistToken = await login('pharmacist@pharmacy.com', 'Password@123');
  const cashierToken = await login('cashier@pharmacy.com', 'Password@123');
  const inventoryToken = await login('inventory@pharmacy.com', 'Password@123');

  // Fetch medicines for testing
  const medsRes = await fetch(`${BASE_URL}/medicines`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const medsData = await medsRes.json();
  const medicines = medsData.data.medicines.filter((m) => m.isActive);
  const testMed = medicines[0];
  const testMedId = testMed.id || testMed._id;

  const timestamp = Date.now();
  let customer1Id = null;
  let customer2Id = null;
  let prescription1Id = null;
  let prescription2Id = null;

  // Scenario 1: Health check returns API status
  await test('Scenario 1: Health check returns valid API status and version >= 6.0.0', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(parseFloat(data.version) >= 6.0, `Version should be >= 6.0.0, got ${data.version}`);
  });

  // Scenario 2: Admin creates customer with valid details
  await test('Scenario 2: Admin creates customer with valid details and unique code', async () => {
    const res = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Ramesh Varma ${timestamp}`,
        phone: `98000${String(timestamp).slice(-5)}`,
        email: `ramesh_${timestamp}@gmail.com`,
        gender: 'male',
        city: 'Hyderabad',
        state: 'Telangana',
        address: 'Plot 42, Hitec City',
        notes: 'Regular customer for hypertension medications',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.customer.customerCode.startsWith('CUST-'));
    assert.strictEqual(data.data.customer.isActive, true);
    customer1Id = data.data.customer._id || data.data.customer.id;
  });

  // Scenario 3: Pharmacist creates customer
  await test('Scenario 3: Pharmacist creates customer successfully', async () => {
    const res = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        name: `Sunita Rao ${timestamp}`,
        phone: `98111${String(timestamp).slice(-5)}`,
        city: 'Bengaluru',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    customer2Id = data.data.customer._id || data.data.customer.id;
  });

  // Scenario 4: Duplicate phone number for active customer is rejected
  await test('Scenario 4: Duplicate phone number rejected with 409 Conflict', async () => {
    const res = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate Phone Person',
        phone: `98000${String(timestamp).slice(-5)}`, // Same as customer1
      }),
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.ok(data.message.includes('already exists'));
  });

  // Scenario 5: Customer search by query string (name or phone)
  await test('Scenario 5: Search customers autocomplete endpoint', async () => {
    const res = await fetch(`${BASE_URL}/customers/search?q=Ramesh`, {
      headers: { Authorization: `Bearer ${cashierToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data.data.customers));
    assert.ok(data.data.customers.length >= 1);
  });

  // Scenario 6: Customer listing with pagination and stats
  await test('Scenario 6: Customer listing and statistics endpoints', async () => {
    const listRes = await fetch(`${BASE_URL}/customers?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    assert.strictEqual(listRes.status, 200);
    assert.ok(listData.data.customers.length >= 2);

    const statsRes = await fetch(`${BASE_URL}/customers/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    assert.strictEqual(statsRes.status, 200);
    assert.ok(statsData.data.total >= 2);
    assert.ok(statsData.data.active >= 2);
  });

  // Scenario 7: Single customer details by ID
  await test('Scenario 7: Get single customer details with metrics', async () => {
    const res = await fetch(`${BASE_URL}/customers/${customer1Id}`, {
      headers: { Authorization: `Bearer ${cashierToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.customer._id, customer1Id);
    assert.ok(data.data.metrics !== undefined);
  });

  // Scenario 8: Update customer details
  await test('Scenario 8: Update customer profile information', async () => {
    const res = await fetch(`${BASE_URL}/customers/${customer1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        notes: 'Updated allergies: Penicillin sensitive',
        address: 'Flat 502, Green Meadows',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.customer.notes, 'Updated allergies: Penicillin sensitive');
  });

  // Scenario 9: Soft deactivation of customer
  await test('Scenario 9: Soft deactivation of customer profile', async () => {
    const res = await fetch(`${BASE_URL}/customers/${customer2Id}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.customer.isActive, false);
  });

  // Scenario 10: Soft activation of customer
  await test('Scenario 10: Soft reactivation of customer profile', async () => {
    const res = await fetch(`${BASE_URL}/customers/${customer2Id}/activate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.customer.isActive, true);
  });

  // Scenario 11: Pharmacist creates prescription (status: pending)
  await test('Scenario 11: Pharmacist creates prescription (status starts as pending)', async () => {
    const res = await fetch(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        customer: customer1Id,
        doctorName: 'Dr. Srinivas Reddy, MD',
        doctorRegistrationNumber: 'MCI-AP-2015-4421',
        doctorContact: '+91 99887 76655',
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        prescriptionItems: [
          {
            medicine: testMedId,
            prescribedQuantity: 2,
            dosageInstructions: '1 tablet twice daily after meals',
            duration: '10 days',
          },
        ],
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.prescription.prescriptionNumber.startsWith('RX-'));
    assert.strictEqual(data.data.prescription.status, 'pending');
    prescription1Id = data.data.prescription._id || data.data.prescription.id;
  });

  // Scenario 12: Cashier creates a prescription (status: pending)
  await test('Scenario 12: Cashier creates a pending prescription', async () => {
    const res = await fetch(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        customer: customer2Id,
        doctorName: 'Dr. Anita Desai',
        prescriptionItems: [{ medicine: testMedId, prescribedQuantity: 1 }],
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    prescription2Id = data.data.prescription._id || data.data.prescription.id;
  });

  // Scenario 13: Cashier cannot verify a prescription (403 Forbidden)
  await test('Scenario 13: Cashier cannot verify a prescription (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/prescriptions/${prescription1Id}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({ verificationNotes: 'Cashier attempt' }),
    });
    assert.strictEqual(res.status, 403);
  });

  // Scenario 14: Pharmacist verifies a prescription
  await test('Scenario 14: Pharmacist verifies a prescription successfully', async () => {
    const res = await fetch(`${BASE_URL}/prescriptions/${prescription1Id}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        verificationNotes: 'Doctor signature and clinic registration verified against state medical registry.',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.prescription.status, 'verified');
    assert.ok(data.data.prescription.verifiedBy !== null);
  });

  // Scenario 15: Pharmacist rejects a prescription with reason
  await test('Scenario 15: Pharmacist rejects prescription with mandatory reason', async () => {
    const res = await fetch(`${BASE_URL}/prescriptions/${prescription2Id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        rejectionReason: 'Doctor signature missing on clinic letterhead',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.prescription.status, 'rejected');
  });

  // Scenario 16: POS checkout with Customer selection saves customer reference in Sale
  await test('Scenario 16: POS checkout links customer reference to Sale', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        customer: customer1Id,
        items: [{ medicine: testMedId, quantity: 1, unitPrice: 50 }],
        amountPaid: 50,
        paymentMethod: 'cash',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.data.sale.customer, customer1Id);
  });

  // Scenario 17: POS checkout with verified Prescription attaches prescription reference
  await test('Scenario 17: POS checkout attaches verified prescription to Sale', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        customer: customer1Id,
        prescription: prescription1Id, // Verified prescription
        items: [{ medicine: testMedId, quantity: 1, unitPrice: 50 }],
        amountPaid: 50,
        paymentMethod: 'upi',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.data.sale.prescription, prescription1Id);
    assert.ok(data.data.sale.customerSnapshot.prescriptionRef.includes('RX-'));
  });

  // Scenario 18: POS checkout with rejected prescription fails (400)
  await test('Scenario 18: POS checkout with unverified/rejected prescription is rejected (400)', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        customer: customer2Id,
        prescription: prescription2Id, // Rejected prescription
        items: [{ medicine: testMedId, quantity: 1, unitPrice: 50 }],
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes('rejected'));
  });

  // Scenario 19: Customer sales history returns completed sales
  await test('Scenario 19: Customer sales history endpoint', async () => {
    const res = await fetch(`${BASE_URL}/customers/${customer1Id}/sales`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.sales.length >= 2);
  });

  // Scenario 20: Customer prescriptions history returns customer prescriptions
  await test('Scenario 20: Customer prescriptions history endpoint', async () => {
    const res = await fetch(`${BASE_URL}/customers/${customer1Id}/prescriptions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.prescriptions.length >= 1);
  });

  // Scenario 21: Unauthenticated request returns 401
  await test('Scenario 21: Unauthenticated request returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/customers`);
    assert.strictEqual(res.status, 401);
  });

  console.log('\n====================================================');
  console.log(`  PHASE 6 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
