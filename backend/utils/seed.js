const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('../models/User');
const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');
const InventoryTransaction = require('../models/InventoryTransaction');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@pharmacy.com',
    password: 'Password@123',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Dr. Sarah Jenkins (Pharmacist)',
    email: 'pharmacist@pharmacy.com',
    password: 'Password@123',
    role: 'pharmacist',
    isActive: true,
  },
  {
    name: 'Michael Chang (Cashier)',
    email: 'cashier@pharmacy.com',
    password: 'Password@123',
    role: 'cashier',
    isActive: true,
  },
  {
    name: 'Robert Davis (Inventory Mgr)',
    email: 'inventory@pharmacy.com',
    password: 'Password@123',
    role: 'inventory_manager',
    isActive: true,
  },
];

const initialMedicines = [
  {
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    brandName: 'Panadol',
    category: 'Analgesics',
    manufacturer: 'GSK Consumer Healthcare',
    description: 'Effective relief of headaches, fever, and minor body aches.',
    composition: 'Paracetamol 500mg',
    dosageForm: 'Tablet',
    strength: '500mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001001',
    sku: 'MED-PARA-500',
    requiresPrescription: false,
    minimumStock: 50,
    isActive: true,
  },
  {
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    brandName: 'Amoxil',
    category: 'Antibiotics',
    manufacturer: 'Pfizer Inc.',
    description: 'Broad-spectrum beta-lactam antibiotic for bacterial infections.',
    composition: 'Amoxicillin 500mg',
    dosageForm: 'Capsule',
    strength: '500mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001002',
    sku: 'MED-AMOX-500',
    requiresPrescription: true,
    minimumStock: 40,
    isActive: true,
  },
  {
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine Dihydrochloride',
    brandName: 'Zyrtec',
    category: 'Antihistamines',
    manufacturer: 'Johnson & Johnson',
    description: 'Relief of allergy symptoms including hay fever, runny nose, and itching.',
    composition: 'Cetirizine HCl 10mg',
    dosageForm: 'Tablet',
    strength: '10mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001003',
    sku: 'MED-CETI-010',
    requiresPrescription: false,
    minimumStock: 30,
    isActive: true,
  },
  {
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage',
    category: 'Antidiabetic',
    manufacturer: 'Merck & Co.',
    description: 'First-line medication for the treatment of type 2 diabetes.',
    composition: 'Metformin HCl 500mg',
    dosageForm: 'Tablet',
    strength: '500mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001004',
    sku: 'MED-METF-500',
    requiresPrescription: true,
    minimumStock: 35,
    isActive: true,
  },
  {
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    brandName: 'Prilosec',
    category: 'Gastrointestinal',
    manufacturer: 'AstraZeneca',
    description: 'Proton-pump inhibitor for gastroesophageal reflux disease and ulcers.',
    composition: 'Omeprazole 20mg',
    dosageForm: 'Capsule',
    strength: '20mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001005',
    sku: 'MED-OMEP-020',
    requiresPrescription: false,
    minimumStock: 45,
    isActive: true,
  },
  {
    name: 'Salbutamol Inhaler 100mcg',
    genericName: 'Albuterol',
    brandName: 'Ventolin',
    category: 'Respiratory',
    manufacturer: 'GSK',
    description: 'Bronchodilator for rapid relief of asthma and bronchospasm attacks.',
    composition: 'Salbutamol Sulfate 100mcg per actuation',
    dosageForm: 'Inhaler',
    strength: '100mcg',
    packSize: '200 Doses',
    unit: 'Piece',
    barcode: '890103001006',
    sku: 'MED-SALB-100',
    requiresPrescription: true,
    minimumStock: 25,
    isActive: true,
  },
  {
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    brandName: 'Advil',
    category: 'Analgesics',
    manufacturer: 'Pfizer Inc.',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) for fever and pain relief.',
    composition: 'Ibuprofen 400mg',
    dosageForm: 'Tablet',
    strength: '400mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001007',
    sku: 'MED-IBUP-400',
    requiresPrescription: false,
    minimumStock: 30,
    isActive: true,
  },
  {
    name: 'Azithromycin 250mg',
    genericName: 'Azithromycin',
    brandName: 'Zithromax',
    category: 'Antibiotics',
    manufacturer: 'Pfizer Inc.',
    description: 'Macrolide antibiotic used for respiratory, skin, and ear infections.',
    composition: 'Azithromycin Dihydrate 250mg',
    dosageForm: 'Tablet',
    strength: '250mg',
    packSize: '1x6',
    unit: 'Strip',
    barcode: '890103001008',
    sku: 'MED-AZIT-250',
    requiresPrescription: true,
    minimumStock: 20,
    isActive: true,
  },
  {
    name: 'Ciprofloxacin Eye Drops 0.3%',
    genericName: 'Ciprofloxacin Hydrochloride',
    brandName: 'Ciloxan',
    category: 'Ophthalmic',
    manufacturer: 'Novartis',
    description: 'Antibacterial eye drops for treatment of bacterial corneal ulcers.',
    composition: 'Ciprofloxacin 0.3% w/v',
    dosageForm: 'Drops',
    strength: '0.3%',
    packSize: '5ml Bottle',
    unit: 'Bottle',
    barcode: '890103001009',
    sku: 'MED-CIPR-003',
    requiresPrescription: true,
    minimumStock: 15,
    isActive: true,
  },
  {
    name: 'Hydrocortisone Cream 1%',
    genericName: 'Hydrocortisone',
    brandName: 'Cortaid',
    category: 'Dermatology',
    manufacturer: 'Bayer HealthCare',
    description: 'Mild topical corticosteroid for skin eczema, dermatitis, and rashes.',
    composition: 'Hydrocortisone 1% w/w',
    dosageForm: 'Cream',
    strength: '1%',
    packSize: '30g',
    unit: 'Tube',
    barcode: '890103001010',
    sku: 'MED-HYDR-001',
    requiresPrescription: false,
    minimumStock: 20,
    isActive: true,
  },
  {
    name: 'Discontinued Aspirin 300mg',
    genericName: 'Acetylsalicylic Acid',
    brandName: 'Disprin Old',
    category: 'Analgesics',
    manufacturer: 'Reckitt',
    description: 'Old batch marked inactive for soft delete testing.',
    composition: 'Aspirin 300mg',
    dosageForm: 'Tablet',
    strength: '300mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001011',
    sku: 'MED-ASPI-OLD',
    requiresPrescription: false,
    minimumStock: 10,
    isActive: false,
  },
];

const initialSuppliers = [
  {
    supplierCode: 'SUP-0001',
    name: 'Apex Health Distributors',
    contactPerson: 'Vikram Malhotra',
    email: 'orders@apexhealth.in',
    phone: '+91 98201 12345',
    alternatePhone: '+91 98201 54321',
    address: '42 Industrial Logistics Hub, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400069',
    country: 'India',
    gstNumber: '27AABCA1234F1Z1',
    drugLicenseNumber: 'DL-MH-2024-8841',
    paymentTerms: 'net_30',
    notes: 'Primary distributor for analgesics, antibiotics, and surgical supplies.',
    isActive: true,
  },
  {
    supplierCode: 'SUP-0002',
    name: 'MedLife Pharma Logistics',
    contactPerson: 'Ananya Sharma',
    email: 'supply@medlifepharma.com',
    phone: '+91 80234 56789',
    alternatePhone: '',
    address: 'Plot 18, Electronics City Phase 1',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560100',
    country: 'India',
    gstNumber: '29AABCM5678G1Z2',
    drugLicenseNumber: 'DL-KA-2023-9932',
    paymentTerms: 'net_15',
    notes: 'Cold-chain storage certified distributor. Express 24-hr delivery.',
    isActive: true,
  },
  {
    supplierCode: 'SUP-0003',
    name: 'Global BioCare Supplies',
    contactPerson: 'Rajesh Verma',
    email: 'info@globalbiocare.org',
    phone: '+91 11255 67890',
    alternatePhone: '',
    address: '88 Okhla Industrial Area, Phase 3',
    city: 'Delhi',
    state: 'Delhi',
    postalCode: '110020',
    country: 'India',
    gstNumber: '07AABCG9012H1Z3',
    drugLicenseNumber: 'DL-DL-2022-7714',
    paymentTerms: 'net_45',
    notes: 'Authorized wholesale importer for specialty inhalers and dermatological treatments.',
    isActive: true,
  },
  {
    supplierCode: 'SUP-0004',
    name: 'Zenith Diagnostics & Labs',
    contactPerson: 'Sunil Rao',
    email: 'contact@zenithdiagnostics.com',
    phone: '+91 40667 89012',
    alternatePhone: '',
    address: 'Banjara Hills Road No. 12',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500034',
    country: 'India',
    gstNumber: '36AABCZ3456J1Z4',
    drugLicenseNumber: 'DL-TS-2021-6621',
    paymentTerms: 'net_30',
    notes: 'Deactivated supplier account for testing soft deactivation behavior.',
    isActive: false,
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pharmacy_management';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed demo accounts
    console.log('[Seed] Seeding demo accounts...');
    await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });

    const createdUsers = {};
    for (const userData of demoUsers) {
      const user = await User.create(userData);
      createdUsers[user.role] = user;
      console.log(`  -> Created ${userData.role.toUpperCase()}: ${userData.email}`);
    }

    // 2. Seed initial medicines
    console.log('[Seed] Seeding initial medicines...');
    await Medicine.deleteMany({});

    const createdMeds = {};
    for (const medData of initialMedicines) {
      const med = await Medicine.create({
        ...medData,
        createdBy: createdUsers.admin._id,
      });
      createdMeds[med.sku] = med;
      console.log(`  -> Seeded Medicine: [${medData.sku}] ${medData.name}`);
    }

    // 3. Seed initial suppliers
    console.log('[Seed] Seeding suppliers...');
    await Supplier.deleteMany({});

    const createdSuppliers = {};
    for (const supData of initialSuppliers) {
      const supplier = await Supplier.create({
        ...supData,
        createdBy: createdUsers.admin._id,
      });
      createdSuppliers[supplier.supplierCode] = supplier;
      console.log(`  -> Seeded Supplier: [${supplier.supplierCode}] ${supplier.name} (${supplier.isActive ? 'Active' : 'Inactive'})`);
    }

    // 4. Seed initial purchase orders
    console.log('[Seed] Seeding purchase orders...');
    await PurchaseOrder.deleteMany({});

    const po1Items = [
      {
        medicine: createdMeds['MED-PARA-500']._id,
        medicineName: createdMeds['MED-PARA-500'].name,
        sku: createdMeds['MED-PARA-500'].sku,
        orderedQuantity: 100,
        receivedQuantity: 0,
        unitCost: 2.50,
        discount: 10,
        taxRate: 5,
        taxAmount: 12,
        lineTotal: 252,
      },
      {
        medicine: createdMeds['MED-AMOX-500']._id,
        medicineName: createdMeds['MED-AMOX-500'].name,
        sku: createdMeds['MED-AMOX-500'].sku,
        orderedQuantity: 50,
        receivedQuantity: 0,
        unitCost: 6.00,
        discount: 0,
        taxRate: 12,
        taxAmount: 36,
        lineTotal: 336,
      },
    ];

    const po1 = await PurchaseOrder.create({
      purchaseOrderNumber: 'PO-2026-0001',
      supplier: createdSuppliers['SUP-0001']._id,
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 7 * 86400000),
      status: 'ordered',
      items: po1Items,
      subtotal: 550,
      discount: 10,
      taxAmount: 48,
      shippingCharges: 25,
      totalAmount: 613,
      notes: 'Initial monthly bulk replenishment order.',
      createdBy: createdUsers.admin._id,
      updatedBy: createdUsers.admin._id,
    });
    console.log(`  -> Seeded Purchase Order: [${po1.purchaseOrderNumber}] (Status: ${po1.status}, Amount: $${po1.totalAmount})`);

    const po2Items = [
      {
        medicine: createdMeds['MED-CETI-010']._id,
        medicineName: createdMeds['MED-CETI-010'].name,
        sku: createdMeds['MED-CETI-010'].sku,
        orderedQuantity: 60,
        receivedQuantity: 60,
        unitCost: 1.80,
        discount: 0,
        taxRate: 5,
        taxAmount: 5.40,
        lineTotal: 113.40,
      },
      {
        medicine: createdMeds['MED-METF-500']._id,
        medicineName: createdMeds['MED-METF-500'].name,
        sku: createdMeds['MED-METF-500'].sku,
        orderedQuantity: 40,
        receivedQuantity: 40,
        unitCost: 3.20,
        discount: 5,
        taxRate: 5,
        taxAmount: 6.15,
        lineTotal: 129.15,
      },
    ];

    const po2 = await PurchaseOrder.create({
      purchaseOrderNumber: 'PO-2026-0002',
      supplier: createdSuppliers['SUP-0002']._id,
      orderDate: new Date(Date.now() - 14 * 86400000),
      expectedDeliveryDate: new Date(Date.now() - 7 * 86400000),
      status: 'received',
      receivedAt: new Date(Date.now() - 7 * 86400000),
      items: po2Items,
      subtotal: 236,
      discount: 5,
      taxAmount: 11.55,
      shippingCharges: 15,
      totalAmount: 257.55,
      notes: 'Delivered in full by MedLife logistics.',
      createdBy: createdUsers.inventory_manager._id,
      updatedBy: createdUsers.inventory_manager._id,
    });
    console.log(`  -> Seeded Purchase Order: [${po2.purchaseOrderNumber}] (Status: ${po2.status}, Amount: $${po2.totalAmount})`);

    // 5. Seed initial inventory batches & transactions
    console.log('[Seed] Seeding inventory batches & transaction logs...');
    await MedicineBatch.deleteMany({});
    await InventoryTransaction.deleteMany({});

    const now = new Date();
    const addDays = (d, days) => {
      const res = new Date(d);
      res.setDate(res.getDate() + days);
      return res;
    };

    const initialBatches = [
      {
        medicineSku: 'MED-PARA-500',
        batchNumber: 'BT-PARA-001',
        manufacturingDate: addDays(now, -90),
        expiryDate: addDays(now, 365),
        purchasePrice: 2.50,
        sellingPrice: 4.50,
        quantityReceived: 100,
        availableQuantity: 100,
        supplierName: 'Apex Health Distributors',
        status: 'active',
      },
      {
        medicineSku: 'MED-PARA-500',
        batchNumber: 'BT-PARA-002',
        manufacturingDate: addDays(now, -60),
        expiryDate: addDays(now, 45), // Expiring in 45 days (Urgent)
        purchasePrice: 2.40,
        sellingPrice: 4.50,
        quantityReceived: 50,
        availableQuantity: 50,
        supplierName: 'Apex Health Distributors',
        status: 'active',
      },
      {
        medicineSku: 'MED-AMOX-500',
        batchNumber: 'BT-AMOX-101',
        manufacturingDate: addDays(now, -120),
        expiryDate: addDays(now, 240),
        purchasePrice: 6.00,
        sellingPrice: 11.00,
        quantityReceived: 80,
        availableQuantity: 80,
        supplierName: 'Apex Health Distributors',
        status: 'active',
      },
      {
        medicineSku: 'MED-CETI-010',
        batchNumber: 'BT-CETI-201',
        manufacturingDate: addDays(now, -45),
        expiryDate: addDays(now, 500),
        purchasePrice: 1.80,
        sellingPrice: 3.50,
        quantityReceived: 60,
        availableQuantity: 60,
        supplierName: 'MedLife Pharma Logistics',
        status: 'active',
      },
      {
        medicineSku: 'MED-METF-500',
        batchNumber: 'BT-METF-301',
        manufacturingDate: addDays(now, -100),
        expiryDate: addDays(now, 180),
        purchasePrice: 3.20,
        sellingPrice: 6.00,
        quantityReceived: 40,
        availableQuantity: 15, // Low stock (total 15 < min 35)
        supplierName: 'MedLife Pharma Logistics',
        status: 'active',
      },
      {
        medicineSku: 'MED-OMEP-020',
        batchNumber: 'BT-OMEP-401',
        manufacturingDate: addDays(now, -30),
        expiryDate: addDays(now, 700),
        purchasePrice: 4.50,
        sellingPrice: 8.50,
        quantityReceived: 70,
        availableQuantity: 70,
        supplierName: 'Global BioCare Supplies',
        status: 'active',
      },
      {
        medicineSku: 'MED-SALB-100',
        batchNumber: 'BT-SALB-501',
        manufacturingDate: addDays(now, -40),
        expiryDate: addDays(now, 300),
        purchasePrice: 12.00,
        sellingPrice: 22.00,
        quantityReceived: 30,
        availableQuantity: 30,
        supplierName: 'Global BioCare Supplies',
        status: 'quarantined',
      },
      {
        medicineSku: 'MED-IBUP-400',
        batchNumber: 'BT-IBUP-601',
        manufacturingDate: addDays(now, -400),
        expiryDate: addDays(now, -10), // Expired 10 days ago
        purchasePrice: 2.00,
        sellingPrice: 4.00,
        quantityReceived: 40,
        availableQuantity: 40,
        supplierName: 'Apex Health Distributors',
        status: 'expired',
      },
    ];

    for (const bData of initialBatches) {
      const med = createdMeds[bData.medicineSku];
      if (!med) continue;

      const batch = await MedicineBatch.create({
        medicine: med._id,
        batchNumber: bData.batchNumber,
        manufacturingDate: bData.manufacturingDate,
        expiryDate: bData.expiryDate,
        purchasePrice: bData.purchasePrice,
        sellingPrice: bData.sellingPrice,
        quantityReceived: bData.quantityReceived,
        availableQuantity: bData.availableQuantity,
        receivedDate: bData.manufacturingDate,
        supplierName: bData.supplierName,
        status: bData.status,
        createdBy: createdUsers.admin._id,
      });

      await InventoryTransaction.create({
        medicine: med._id,
        batch: batch._id,
        transactionType: 'stock_in',
        quantity: bData.quantityReceived,
        previousQuantity: 0,
        newQuantity: bData.quantityReceived,
        reason: 'Initial warehouse intake',
        reference: `PO-${bData.batchNumber}`,
        performedBy: createdUsers.admin._id,
        createdAt: bData.manufacturingDate,
      });

      if (bData.status === 'quarantined') {
        await InventoryTransaction.create({
          medicine: med._id,
          batch: batch._id,
          transactionType: 'quarantine',
          quantity: bData.availableQuantity,
          previousQuantity: bData.availableQuantity,
          newQuantity: bData.availableQuantity,
          reason: 'Routine quality assurance seal inspection',
          performedBy: createdUsers.admin._id,
        });
      }

      console.log(`  -> Seeded Batch: [${batch.batchNumber}] for ${med.name} (Status: ${batch.status}, Available: ${batch.availableQuantity})`);
    }

    console.log('[Seed] Seeding completed successfully!');
    console.log('Default credentials for all demo users: Password@123');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
