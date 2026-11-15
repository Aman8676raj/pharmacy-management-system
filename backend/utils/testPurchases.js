const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING PHASE 4 SUPPLIER & PURCHASE API TESTS');
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
  const med1 = medicines[0];
  const med2 = medicines[1];
  const med1Id = med1.id || med1._id;
  const med2Id = med2.id || med2._id;

  const uniqueSuffix = Date.now();
  let createdSupplierId = null;
  let createdSupplierCode = `SUP-TEST-${uniqueSuffix}`;
  let inactiveSupplierId = null;
  let draftPOId = null;
  let orderedPOId = null;

  // ==========================================
  // PART A: SUPPLIER TESTS (Scenarios 1 - 11)
  // ==========================================

  // Scenario 1: Admin creates supplier
  await test('Scenario 1: Admin creates supplier', async () => {
    const res = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplierCode: createdSupplierCode,
        name: `Test Pharma Supplies ${uniqueSuffix}`,
        contactPerson: 'Aditi Roy',
        email: `aditi_${uniqueSuffix}@testpharma.com`,
        phone: '+91 9988776655',
        city: 'Mumbai',
        paymentTerms: 'net_30',
        gstNumber: `27AABCU${uniqueSuffix.toString().slice(-4)}H1Z1`,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}: ${data.message}`);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.supplier._id);
    createdSupplierId = data.data.supplier._id;
  });

  // Scenario 2: Inventory Manager creates supplier
  await test('Scenario 2: Inventory Manager creates supplier', async () => {
    const code = `SUP-INV-${uniqueSuffix}`;
    const res = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
      body: JSON.stringify({
        supplierCode: code,
        name: `Inventory Mgr Supplier ${uniqueSuffix}`,
        phone: '+91 8877665544',
        city: 'Pune',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}: ${data.message}`);
    assert.strictEqual(data.success, true);
  });

  // Scenario 3: Cashier cannot create supplier
  await test('Scenario 3: Cashier cannot create supplier', async () => {
    const res = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        name: 'Cashier Attempt Supplier',
        phone: '+91 7766554433',
      }),
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden for Cashier, got ${res.status}`);
  });

  // Scenario 4: Duplicate supplier code rejected
  await test('Scenario 4: Duplicate supplier code rejected', async () => {
    const res = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplierCode: createdSupplierCode, // Duplicate code
        name: 'Duplicate Code Supplier',
        phone: '+91 99999 11111',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    assert.strictEqual(data.success, false);
  });

  // Scenario 5: Duplicate GST number rejected when provided
  await test('Scenario 5: Duplicate GST number rejected when provided', async () => {
    const res = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplierCode: `SUP-GST-${uniqueSuffix}`,
        name: 'Duplicate GST Supplier',
        phone: '+91 99999 22222',
        gstNumber: `27AABCU${uniqueSuffix.toString().slice(-4)}H1Z1`, // Duplicate GST from Scenario 1
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    assert.strictEqual(data.success, false);
  });

  // Scenario 6: Supplier listing works
  await test('Scenario 6: Supplier listing works', async () => {
    const res = await fetch(`${BASE_URL}/suppliers?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.suppliers));
    assert.ok(data.data.pagination);
    assert.ok(data.data.suppliers.length > 0);
  });

  // Scenario 7: Supplier search works
  await test('Scenario 7: Supplier search works', async () => {
    const res = await fetch(`${BASE_URL}/suppliers?search=${createdSupplierCode}`, {
      headers: { Authorization: `Bearer ${cashierToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.suppliers.length, 1);
    assert.strictEqual(data.data.suppliers[0].supplierCode, createdSupplierCode);
  });

  // Scenario 8: Supplier details load
  await test('Scenario 8: Supplier details load', async () => {
    const res = await fetch(`${BASE_URL}/suppliers/${createdSupplierId}`, {
      headers: { Authorization: `Bearer ${inventoryToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.supplier._id, createdSupplierId);
    assert.ok(data.data.stats !== undefined);
  });

  // Scenario 9: Supplier update works
  await test('Scenario 9: Supplier update works', async () => {
    const res = await fetch(`${BASE_URL}/suppliers/${createdSupplierId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Updated Test Pharma ${uniqueSuffix}`,
        phone: '+91 9988776600',
        paymentTerms: 'net_15',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.supplier.name, `Updated Test Pharma ${uniqueSuffix}`);
    assert.strictEqual(data.data.supplier.paymentTerms, 'net_15');
  });

  // Scenario 10: Supplier deactivation works
  await test('Scenario 10: Supplier deactivation works', async () => {
    const res = await fetch(`${BASE_URL}/suppliers/${createdSupplierId}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.supplier.isActive, false);
    inactiveSupplierId = createdSupplierId;
  });

  // Scenario 11: Inactive suppliers cannot receive new purchase orders
  await test('Scenario 11: Inactive suppliers cannot receive new purchase orders', async () => {
    const res = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplier: inactiveSupplierId,
        items: [
          {
            medicine: med1Id,
            orderedQuantity: 50,
            unitCost: 10,
          },
        ],
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}: ${data.message}`);
    assert.strictEqual(data.success, false);

    // Reactivate for further tests
    await fetch(`${BASE_URL}/suppliers/${createdSupplierId}/activate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  });

  // ==========================================
  // PART B: PURCHASE TESTS (Scenarios 12 - 32)
  // ==========================================

  // Scenario 12: Create draft purchase order
  await test('Scenario 12: Create draft purchase order', async () => {
    const res = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
      body: JSON.stringify({
        supplier: createdSupplierId,
        status: 'draft',
        items: [
          {
            medicine: med1Id,
            orderedQuantity: 100,
            unitCost: 5.0,
            discount: 10,
            taxRate: 5,
          },
        ],
        shippingCharges: 20,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}: ${data.message}`);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.purchaseOrder.status, 'draft');
    assert.ok(data.data.purchaseOrder.purchaseOrderNumber.startsWith('PO-'));
    draftPOId = data.data.purchaseOrder._id;
  });

  // Scenario 13: Add multiple medicines to purchase order
  await test('Scenario 13: Add multiple medicines to purchase order', async () => {
    const res = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplier: createdSupplierId,
        status: 'ordered',
        items: [
          {
            medicine: med1Id,
            orderedQuantity: 80,
            unitCost: 4.5,
            discount: 0,
            taxRate: 5,
          },
          {
            medicine: med2Id,
            orderedQuantity: 50,
            unitCost: 6.0,
            discount: 5,
            taxRate: 12,
          },
        ],
        discount: 15,
        shippingCharges: 25,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}: ${data.message}`);
    assert.strictEqual(data.data.purchaseOrder.items.length, 2);
    orderedPOId = data.data.purchaseOrder._id;
  });

  // Scenario 14: Backend calculates totals correctly
  await test('Scenario 14: Backend calculates totals correctly', async () => {
    const res = await fetch(`${BASE_URL}/purchases/${orderedPOId}`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    const po = data.data.purchaseOrder;

    // Item 1: 80 * 4.50 = 360 subtotal, disc 0, tax 5% of 360 = 18, lineTotal = 378
    // Item 2: 50 * 6.00 = 300 subtotal, disc 5, taxable 295, tax 12% of 295 = 35.40, lineTotal = 330.40
    // Subtotal: 660
    // Total discount: 5 (item) + 15 (order) = 20
    // Total tax: 18 + 35.40 = 53.40
    // Shipping: 25
    // Total Amount: 660 - 20 + 53.40 + 25 = 718.40
    assert.strictEqual(po.subtotal, 660);
    assert.strictEqual(po.discount, 20);
    assert.strictEqual(po.taxAmount, 53.4);
    assert.strictEqual(po.shippingCharges, 25);
    assert.strictEqual(po.totalAmount, 718.4);
  });

  // Scenario 15: Mark draft as ordered
  await test('Scenario 15: Mark draft as ordered', async () => {
    const res = await fetch(`${BASE_URL}/purchases/${draftPOId}/order`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.purchaseOrder.status, 'ordered');
  });

  // Scenario 16: Ordered purchase order cannot be edited
  await test('Scenario 16: Ordered purchase order cannot be edited', async () => {
    const res = await fetch(`${BASE_URL}/purchases/${orderedPOId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        notes: 'Trying to modify ordered PO',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    assert.strictEqual(data.success, false);
  });

  // Setup a dedicated PO for receiving scenarios 17-22
  let testReceivePOId = null;
  const receivePORes = await fetch(`${BASE_URL}/purchases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      supplier: createdSupplierId,
      status: 'ordered',
      items: [
        {
          medicine: med1Id,
          orderedQuantity: 100,
          unitCost: 5.0,
        },
      ],
    }),
  });
  const receivePOData = await receivePORes.json();
  testReceivePOId = receivePOData.data.purchaseOrder._id;

  // Scenario 18: Receive partial purchase quantity
  await test('Scenario 18: Receive partial purchase quantity', async () => {
    const expDate = new Date(Date.now() + 300 * 86400000).toISOString().split('T')[0];
    const res = await fetch(`${BASE_URL}/purchases/${testReceivePOId}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            medicine: med1Id,
            batchNumber: `RCV-PART-${uniqueSuffix}`,
            expiryDate: expDate,
            quantityReceived: 40,
            sellingPrice: 10.0,
            purchasePrice: 5.0,
          },
        ],
        supplierInvoiceNumber: `INV-PART-${uniqueSuffix}`,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}: ${data.message}`);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.purchaseOrder.status, 'partially_received');
    assert.strictEqual(data.data.purchaseOrder.items[0].receivedQuantity, 40);
  });

  // Scenario 19: Partial receipt updates purchase order status
  await test('Scenario 19: Partial receipt updates purchase order status', async () => {
    const res = await fetch(`${BASE_URL}/purchases/${testReceivePOId}`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.purchaseOrder.status, 'partially_received');
  });

  // Scenario 20: Second receipt completes purchase order
  await test('Scenario 20: Second receipt completes purchase order', async () => {
    const expDate = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    const res = await fetch(`${BASE_URL}/purchases/${testReceivePOId}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            medicine: med1Id,
            batchNumber: `RCV-FULL-${uniqueSuffix}`,
            expiryDate: expDate,
            quantityReceived: 60, // Remaining quantity
            sellingPrice: 10.0,
            purchasePrice: 5.0,
          },
        ],
        supplierInvoiceNumber: `INV-COMPL-${uniqueSuffix}`,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}: ${data.message}`);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.purchaseOrder.status, 'received');
    assert.strictEqual(data.data.purchaseOrder.items[0].receivedQuantity, 100);
    assert.ok(data.data.purchaseOrder.receivedAt);
  });

  // Scenario 21: Receiving creates or replenishes inventory batches
  await test('Scenario 21: Receiving creates or replenishes inventory batches', async () => {
    const res = await fetch(`${BASE_URL}/inventory?search=RCV-FULL-${uniqueSuffix}`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.batches.length, 1);
    assert.strictEqual(data.data.batches[0].batchNumber, `RCV-FULL-${uniqueSuffix}`);
    assert.strictEqual(data.data.batches[0].availableQuantity, 60);
  });

  // Scenario 22: Receiving creates stock-in inventory transactions
  await test('Scenario 22: Receiving creates stock-in inventory transactions', async () => {
    const res = await fetch(
      `${BASE_URL}/inventory/transactions?search=RCV-FULL-${uniqueSuffix}`,
      {
        headers: { Authorization: `Bearer ${pharmacistToken}` },
      }
    );
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.transactions.length, 1);
    assert.strictEqual(data.data.transactions[0].transactionType, 'stock_in');
    assert.strictEqual(data.data.transactions[0].quantity, 60);
  });

  // Scenario 17: Receive full purchase quantity on single delivery
  await test('Scenario 17: Receive full purchase quantity on single delivery', async () => {
    // Create new PO with 30 units
    const newPORes = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplier: createdSupplierId,
        status: 'ordered',
        items: [{ medicine: med2Id, orderedQuantity: 30, unitCost: 8.0 }],
      }),
    });
    const newPOData = await newPORes.json();
    const poId = newPOData.data.purchaseOrder._id;

    // Receive 30 units in single delivery
    const expDate = new Date(Date.now() + 400 * 86400000).toISOString().split('T')[0];
    const recRes = await fetch(`${BASE_URL}/purchases/${poId}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            medicine: med2Id,
            batchNumber: `RCV-ONE-${uniqueSuffix}`,
            expiryDate: expDate,
            quantityReceived: 30,
            sellingPrice: 15.0,
            purchasePrice: 8.0,
          },
        ],
      }),
    });
    const recData = await recRes.json();
    assert.strictEqual(recRes.status, 200);
    assert.strictEqual(recData.data.purchaseOrder.status, 'received');
    assert.strictEqual(recData.data.purchaseOrder.items[0].receivedQuantity, 30);
  });

  // Scenario 23: Received quantity cannot exceed remaining ordered quantity
  await test('Scenario 23: Received quantity cannot exceed remaining ordered quantity', async () => {
    // Create PO with 20 units
    const poRes = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplier: createdSupplierId,
        status: 'ordered',
        items: [{ medicine: med1Id, orderedQuantity: 20, unitCost: 5.0 }],
      }),
    });
    const poData = await poRes.json();
    const poId = poData.data.purchaseOrder._id;

    // Try receiving 25 units
    const expDate = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    const recRes = await fetch(`${BASE_URL}/purchases/${poId}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            medicine: med1Id,
            batchNumber: `RCV-EXCEED-${uniqueSuffix}`,
            expiryDate: expDate,
            quantityReceived: 25, // Exceeds 20
            sellingPrice: 10.0,
          },
        ],
      }),
    });
    const recData = await recRes.json();
    assert.strictEqual(recRes.status, 400, `Expected 400, got ${recRes.status}`);
    assert.strictEqual(recData.success, false);
  });

  // Scenario 24: Invalid or expired batch information is rejected
  await test('Scenario 24: Invalid or expired batch information is rejected', async () => {
    // Create PO
    const poRes = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplier: createdSupplierId,
        status: 'ordered',
        items: [{ medicine: med1Id, orderedQuantity: 10, unitCost: 5.0 }],
      }),
    });
    const poData = await poRes.json();
    const poId = poData.data.purchaseOrder._id;

    // Provide expired date
    const expiredDate = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
    const recRes = await fetch(`${BASE_URL}/purchases/${poId}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            medicine: med1Id,
            batchNumber: `RCV-EXP-${uniqueSuffix}`,
            expiryDate: expiredDate,
            quantityReceived: 10,
            sellingPrice: 10.0,
          },
        ],
      }),
    });
    const recData = await recRes.json();
    assert.strictEqual(recRes.status, 400);
    assert.strictEqual(recData.success, false);
  });

  // Scenario 25: Cancel draft purchase order
  await test('Scenario 25: Cancel draft purchase order', async () => {
    // Create draft
    const poRes = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplier: createdSupplierId,
        status: 'draft',
        items: [{ medicine: med1Id, orderedQuantity: 10, unitCost: 5.0 }],
      }),
    });
    const poData = await poRes.json();
    const poId = poData.data.purchaseOrder._id;

    // Cancel
    const cancelRes = await fetch(`${BASE_URL}/purchases/${poId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Supplier out of stock' }),
    });
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelData.data.purchaseOrder.status, 'cancelled');
  });

  // Scenario 26: Cancel ordered purchase order with no received stock
  await test('Scenario 26: Cancel ordered purchase order with no received stock', async () => {
    const cancelRes = await fetch(`${BASE_URL}/purchases/${orderedPOId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Commercial agreement revised' }),
    });
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelData.data.purchaseOrder.status, 'cancelled');
  });

  // Scenario 27: Partially received purchase order cannot be cancelled
  await test('Scenario 27: Partially received purchase order cannot be cancelled', async () => {
    // Create and partially receive a PO
    const poRes = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplier: createdSupplierId,
        status: 'ordered',
        items: [{ medicine: med1Id, orderedQuantity: 50, unitCost: 5.0 }],
      }),
    });
    const poData = await poRes.json();
    const poId = poData.data.purchaseOrder._id;

    const expDate = new Date(Date.now() + 300 * 86400000).toISOString().split('T')[0];
    await fetch(`${BASE_URL}/purchases/${poId}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            medicine: med1Id,
            batchNumber: `RCV-PART2-${uniqueSuffix}`,
            expiryDate: expDate,
            quantityReceived: 20,
            sellingPrice: 10.0,
          },
        ],
      }),
    });

    // Try cancelling partially received order
    const cancelRes = await fetch(`${BASE_URL}/purchases/${poId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Try cancel partially received' }),
    });
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelRes.status, 400, `Expected 400, got ${cancelRes.status}`);
    assert.strictEqual(cancelData.success, false);
  });

  // Scenario 28: Fully received purchase order cannot be cancelled
  await test('Scenario 28: Fully received purchase order cannot be cancelled', async () => {
    const cancelRes = await fetch(`${BASE_URL}/purchases/${testReceivePOId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Try cancel fully received' }),
    });
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelRes.status, 400, `Expected 400, got ${cancelRes.status}`);
    assert.strictEqual(cancelData.success, false);
  });

  // Scenario 29: Cashier cannot create or receive purchases
  await test('Scenario 29: Cashier cannot create or receive purchases', async () => {
    const createRes = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        supplier: createdSupplierId,
        items: [{ medicine: med1Id, orderedQuantity: 10, unitCost: 5 }],
      }),
    });
    assert.strictEqual(createRes.status, 403, `Expected 403, got ${createRes.status}`);

    const recRes = await fetch(`${BASE_URL}/purchases/${draftPOId}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({ items: [] }),
    });
    assert.strictEqual(recRes.status, 403, `Expected 403, got ${recRes.status}`);
  });

  // Scenario 30: Pharmacist cannot receive stock
  await test('Scenario 30: Pharmacist cannot receive stock', async () => {
    const recRes = await fetch(`${BASE_URL}/purchases/${draftPOId}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({ items: [] }),
    });
    assert.strictEqual(recRes.status, 403, `Expected 403, got ${recRes.status}`);
  });

  // Scenario 31: Unauthenticated requests return 401
  await test('Scenario 31: Unauthenticated requests return 401', async () => {
    const res1 = await fetch(`${BASE_URL}/suppliers`);
    assert.strictEqual(res1.status, 401);

    const res2 = await fetch(`${BASE_URL}/purchases`);
    assert.strictEqual(res2.status, 401);
  });

  // Scenario 32: Invalid IDs return appropriate errors
  await test('Scenario 32: Invalid IDs return appropriate errors', async () => {
    const badId = 'invalid-mongo-id';
    const res1 = await fetch(`${BASE_URL}/suppliers/${badId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res1.status, 400);

    const nonExistentId = '666666666666666666666666';
    const res2 = await fetch(`${BASE_URL}/purchases/${nonExistentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res2.status, 404);
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

