const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('../models/User');
const Medicine = require('../models/Medicine');

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
    manufacturer: 'Novartis',
    description: 'First-line medication for the treatment of type 2 diabetes.',
    composition: 'Metformin HCl 500mg',
    dosageForm: 'Tablet',
    strength: '500mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001004',
    sku: 'MED-METF-500',
    requiresPrescription: true,
    minimumStock: 60,
    isActive: true,
  },
  {
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole Magnesium',
    brandName: 'Prilosec',
    category: 'Gastrointestinal',
    manufacturer: 'AstraZeneca',
    description: 'Proton pump inhibitor used to treat gastric acid-related diseases.',
    composition: 'Omeprazole 20mg',
    dosageForm: 'Capsule',
    strength: '20mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001005',
    sku: 'MED-OMEP-020',
    requiresPrescription: true,
    minimumStock: 45,
    isActive: true,
  },
  {
    name: 'Salbutamol Inhaler 100mcg',
    genericName: 'Albuterol Sulfate',
    brandName: 'Ventolin',
    category: 'Respiratory',
    manufacturer: 'Cipla Ltd.',
    description: 'Bronchodilator for rapid relief of asthma attacks and bronchospasm.',
    composition: 'Salbutamol 100mcg per actuation',
    dosageForm: 'Inhaler',
    strength: '100mcg',
    packSize: '200 doses',
    unit: 'Bottle',
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
    manufacturer: 'Abbott Laboratories',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) for pain and swelling.',
    composition: 'Ibuprofen 400mg',
    dosageForm: 'Tablet',
    strength: '400mg',
    packSize: '10x10',
    unit: 'Strip',
    barcode: '890103001007',
    sku: 'MED-IBUP-400',
    requiresPrescription: false,
    minimumStock: 35,
    isActive: true,
  },
  {
    name: 'Azithromycin 250mg',
    genericName: 'Azithromycin Dihydrate',
    brandName: 'Zithromax',
    category: 'Antibiotics',
    manufacturer: 'Pfizer Inc.',
    description: 'Macrolide antibiotic used for respiratory and skin bacterial infections.',
    composition: 'Azithromycin 250mg',
    dosageForm: 'Tablet',
    strength: '250mg',
    packSize: '6 tablets',
    unit: 'Strip',
    barcode: '890103001008',
    sku: 'MED-AZIT-250',
    requiresPrescription: true,
    minimumStock: 20,
    isActive: true,
  },
  {
    name: 'Ciprofloxacin Eye Drops 0.3%',
    genericName: 'Ciprofloxacin',
    brandName: 'Ciloxan',
    category: 'Ophthalmic',
    manufacturer: 'Alcon Laboratories',
    description: 'Fluoroquinolone antibacterial eye drops for bacterial conjunctivitis.',
    composition: 'Ciprofloxacin 0.3% w/v',
    dosageForm: 'Drops',
    strength: '0.3% w/v',
    packSize: '5ml',
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
    isActive: false, // Testing inactive exclusion
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pharmacy_management';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean up demo accounts & re-create
    console.log('[Seed] Seeding demo accounts...');
    await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });

    const createdUsers = {};
    for (const userData of demoUsers) {
      const user = await User.create(userData);
      createdUsers[user.role] = user;
      console.log(`  -> Created ${userData.role.toUpperCase()}: ${userData.email}`);
    }

    // Seed initial medicines
    console.log('[Seed] Seeding initial medicines...');
    await Medicine.deleteMany({});

    for (const medData of initialMedicines) {
      await Medicine.create({
        ...medData,
        createdBy: createdUsers.admin._id,
      });
      console.log(`  -> Seeded Medicine: [${medData.sku}] ${medData.name} (${medData.category})`);
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
