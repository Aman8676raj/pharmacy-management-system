const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runIntegrationTests() {
  console.log('====================================================');
  console.log('  PHARMACORE END-TO-END INTEGRATION WORKFLOW TESTS');
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
  const cashierToken = await login('cashier@pharmacy.com', 'Password@123');
  const inventoryToken = await login('inventory@pharmacy.com', 'Password@123');

  const ts = Date.now();

  let wfMedicineId = null;
  let wfSupplierId = null;
  let wfPOId = null;
  let wfBatchId = null;
  let wfCustomerId = null;
  let wfPrescriptionId = null;
  let wfSaleId = null;
  let wfInvoiceNumber = null;

  // --------------------------------------------------------------------------
  // WORKFLOW 1: PROCUREMENT & INVENTORY REPLENISHMENT LIFECYCLE
  // --------------------------------------------------------------------------
  console.log('--- WORKFLOW 1: PROCUREMENT & INVENTORY LIFECYCLE ---');

  await test('W1.1: Admin catalogs new medicine formulary item', async () => {
    const res = await fetch(`${BASE_URL}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Cefixime Dispersible ${ts}`,
        genericName: 'Cefixime',
        brandName: 'CefiSafe',
        category: 'Antibiotics',
        dosageForm: 'Tablet',
        strength: '200mg',
        unit: 'Strip',
        sku: `SKU-CEF-${ts}`,
        barcode: `BAR-CEF-${ts}`,
        requiresPrescription: true,
        minimumStock: 15,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    wfMedicineId = data.data.medicine._id || data.data.medicine.id;
    assert.ok(wfMedicineId);
  });

  await test('W1.2: Inventory Manager onboards verified pharmaceutical supplier', async () => {
    const res = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
      body: JSON.stringify({
        name: `Zenith Biotech ${ts}`,
        contactPerson: 'Vikram Mehta',
        email: `zenith_${ts}@biotech.com`,
        phone: `91122${ts.toString().slice(-5)}`,
        city: 'Hyderabad',
        state: 'Telangana',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    wfSupplierId = data.data.supplier._id || data.data.supplier.id;
    assert.ok(wfSupplierId);
  });

  await test('W1.3: Create Purchase Order for 100 units and transition to ordered', async () => {
    const res = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
      body: JSON.stringify({
        supplier: wfSupplierId,
        items: [
          {
            medicine: wfMedicineId,
            orderedQuantity: 100,
            unitCost: 30,
            taxRate: 5,
          },
        ],
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    wfPOId = data.data.purchaseOrder._id || data.data.purchaseOrder.id;

    // Transition to ordered
    const orderRes = await fetch(`${BASE_URL}/purchases/${wfPOId}/order`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
    });
    const orderData = await orderRes.json();
    assert.strictEqual(orderRes.status, 200);
    assert.strictEqual(orderData.data.purchaseOrder.status, 'ordered');
  });

  await test('W1.4: Receive shipment goods -> creates batch and logs stock_in movement', async () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 200);

    const res = await fetch(`${BASE_URL}/purchases/${wfPOId}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inventoryToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            medicine: wfMedicineId,
            quantityReceived: 100,
            batchNumber: `BAT-ZENITH-${ts}`,
            expiryDate: expiryDate.toISOString().split('T')[0],
            purchasePrice: 30,
            sellingPrice: 50,
          },
        ],
        supplierInvoiceNumber: `INV-ZENITH-${ts}`,
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.purchaseOrder.status, 'received');

    // Verify inventory batch
    const invRes = await fetch(`${BASE_URL}/inventory/medicines/${wfMedicineId}/batches`, {
      headers: { Authorization: `Bearer ${inventoryToken}` },
    });
    const invData = await invRes.json();
    assert.strictEqual(invRes.status, 200);
    const batches = invData.data.batches || [];
    assert.ok(batches.length >= 1);
    const receivedBatch = batches.find((b) => b.batchNumber === `BAT-ZENITH-${ts}`);
    assert.ok(receivedBatch);
    assert.strictEqual(receivedBatch.availableQuantity, 100);
    wfBatchId = receivedBatch._id || receivedBatch.id;
  });

  // --------------------------------------------------------------------------
  // WORKFLOW 2: PATIENT REGISTRATION, RX VERIFICATION & POS DISPENSING
  // --------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 2: PATIENT, RX & POS DISPENSING JOURNEY ---');

  await test('W2.1: Register new patient profile', async () => {
    const res = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        name: `Amit Roy ${ts}`,
        phone: `92345${ts.toString().slice(-5)}`,
        email: `amit_${ts}@example.com`,
        city: 'Mumbai',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    wfCustomerId = data.data.customer._id || data.data.customer.id;
    assert.ok(wfCustomerId);
    assert.ok(data.data.customer.customerCode.startsWith('CUST-'));
  });

  await test('W2.2: Create doctor prescription for patient (Starts in pending status)', async () => {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 90);

    const res = await fetch(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        customer: wfCustomerId,
        doctorName: 'Dr. Sunita Rao',
        doctorRegistrationNumber: 'MCI-889977',
        doctorContact: '9876500000',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: expDate.toISOString().split('T')[0],
        prescriptionItems: [
          {
            medicine: wfMedicineId,
            medicineName: `Cefixime Dispersible ${ts}`,
            dosage: '200mg',
            frequency: 'Twice daily',
            duration: '5 days',
            quantity: 10,
          },
        ],
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    wfPrescriptionId = data.data.prescription._id || data.data.prescription.id;
    assert.strictEqual(data.data.prescription.status, 'pending');
  });

  await test('W2.3: Pharmacist reviews and verifies doctor prescription', async () => {
    const res = await fetch(`${BASE_URL}/prescriptions/${wfPrescriptionId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacistToken}`,
      },
      body: JSON.stringify({
        verificationNotes: 'Verified diagnosis and dosage instructions with Dr. Sunita Rao.',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.prescription.status, 'verified');
  });

  await test('W2.4: Cashier executes POS checkout linking patient & verified prescription with FEFO allocation', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        customer: wfCustomerId,
        prescription: wfPrescriptionId,
        items: [
          {
            medicine: wfMedicineId,
            quantity: 10,
            unitPrice: 50,
            discount: 0,
            taxRate: 5,
          },
        ],
        discount: 0,
        amountPaid: 525, // 10 * 50 = 500 + 5% tax (25) = 525
        paymentMethod: 'upi',
        customerSnapshot: {
          name: `Amit Roy ${ts}`,
          phone: `92345${ts.toString().slice(-5)}`,
          prescriptionRef: 'MCI-889977 (Dr. Sunita Rao)',
        },
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    const sale = data.data.sale;
    wfSaleId = sale._id || sale.id;
    wfInvoiceNumber = sale.invoiceNumber;
    assert.strictEqual(sale.paymentStatus, 'paid');
    assert.strictEqual(sale.totalAmount, 525);

    // Verify batch stock was decremented from 100 to 90
    const batchRes = await fetch(`${BASE_URL}/inventory/batches/${wfBatchId}`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const batchData = await batchRes.json();
    assert.strictEqual(batchData.data.batch.availableQuantity, 90);
  });

  await test('W2.5: Stream generated PDF tax invoice via PDFKit', async () => {
    const res = await fetch(`${BASE_URL}/sales/${wfSaleId}/invoice`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('application/pdf'));
    const buffer = await res.arrayBuffer();
    const header = Buffer.from(buffer.slice(0, 5)).toString('utf-8');
    assert.strictEqual(header, '%PDF-');
  });

  await test('W2.6: Verify customer profile displays this sale in purchase history', async () => {
    const res = await fetch(`${BASE_URL}/customers/${wfCustomerId}/sales`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.sales.length >= 1);
    assert.strictEqual(data.data.sales[0].invoiceNumber, wfInvoiceNumber);
  });

  // --------------------------------------------------------------------------
  // WORKFLOW 3: PARTIAL PAYMENT, BALANCE SETTLEMENT & STOCK RESTORATION
  // --------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 3: PARTIAL PAYMENT & AUDITED STOCK RESTORATION ---');

  let partialSaleId = null;

  await test('W3.1: Cashier creates partial sale (₹200 paid on ₹315 bill)', async () => {
    const res = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        customer: wfCustomerId,
        items: [
          {
            medicine: wfMedicineId,
            quantity: 6,
            unitPrice: 50, // 300 + 5% tax = 315
            discount: 0,
            taxRate: 5,
          },
        ],
        amountPaid: 200,
        paymentMethod: 'cash',
        customerSnapshot: {
          name: `Amit Roy ${ts}`,
        },
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    const sale = data.data.sale;
    partialSaleId = sale._id || sale.id;
    assert.strictEqual(sale.paymentStatus, 'partially_paid');
    assert.strictEqual(sale.balanceAmount, 115);

    // Stock should be 90 - 6 = 84
    const batchRes = await fetch(`${BASE_URL}/inventory/batches/${wfBatchId}`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const batchData = await batchRes.json();
    assert.strictEqual(batchData.data.batch.availableQuantity, 84);
  });

  await test('W3.2: Cashier records subsequent balance payment of ₹115 to settle invoice', async () => {
    const res = await fetch(`${BASE_URL}/sales/${partialSaleId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        amount: 115,
        paymentMethod: 'cash',
        notes: 'Remaining balance settled in cash',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.sale.paymentStatus, 'paid');
    assert.strictEqual(data.data.sale.balanceAmount, 0);
  });

  await test('W3.3: Admin cancels sale -> stock is automatically restored (+6 units) via return_in', async () => {
    const res = await fetch(`${BASE_URL}/sales/${partialSaleId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        reason: 'Patient requested refund before opening package',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.sale.saleStatus, 'cancelled');

    // Stock must be restored from 84 back to 90!
    const batchRes = await fetch(`${BASE_URL}/inventory/batches/${wfBatchId}`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    const batchData = await batchRes.json();
    assert.strictEqual(batchData.data.batch.availableQuantity, 90);
  });

  // --------------------------------------------------------------------------
  // WORKFLOW 4: ANALYTICS, PROFIT/LOSS & REPORT EXPORT PIPELINE
  // --------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 4: BUSINESS INTELLIGENCE & EXPORT PIPELINE ---');

  await test('W4.1: Dashboard statistics reflects live counts across all modules', async () => {
    const res = await fetch(`${BASE_URL}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.medicines.total >= 1);
    assert.ok(data.data.sales.lifetimeRevenue >= 525);
    assert.ok(data.data.procurement.activeSuppliers >= 1);
    assert.ok(data.data.patients.totalCustomers >= 1);
  });

  await test('W4.2: Profit & Loss report accurately reflects COGS and Gross Margins', async () => {
    const res = await fetch(`${BASE_URL}/reports/profit-loss`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    const sum = data.data.summary;
    assert.ok(sum.grossRevenue > 0);
    assert.ok(sum.costOfGoodsSold > 0);
    assert.ok(sum.grossProfit === Math.round((sum.grossRevenue - sum.costOfGoodsSold) * 100) / 100);
  });

  await test('W4.3: Export CSV and PDF reports via report export endpoints', async () => {
    // CSV
    const csvRes = await fetch(`${BASE_URL}/reports/export/csv?type=profit_loss`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(csvRes.status, 200);
    const csvText = await csvRes.text();
    assert.ok(csvText.includes('Gross Revenue'));

    // PDF
    const pdfRes = await fetch(`${BASE_URL}/reports/export/pdf?type=profit_loss`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(pdfRes.status, 200);
    const buffer = await pdfRes.arrayBuffer();
    const header = Buffer.from(buffer.slice(0, 5)).toString('utf-8');
    assert.strictEqual(header, '%PDF-');
  });

  console.log('\n====================================================');
  console.log(`  INTEGRATION WORKFLOW RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runIntegrationTests();
