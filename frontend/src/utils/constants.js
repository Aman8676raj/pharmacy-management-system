export const APP_NAME = 'PharmaCore';
export const APP_SUBTITLE = 'Pharmacy Administration & Management';

// Roles definition
export const USER_ROLES = {
  ADMIN: 'admin',
  PHARMACIST: 'pharmacist',
  CASHIER: 'cashier',
  INVENTORY_MANAGER: 'inventory_manager',
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.PHARMACIST]: 'Pharmacist',
  [USER_ROLES.CASHIER]: 'Cashier',
  [USER_ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
};

export const ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'bg-purple-50 text-purple-700 border-purple-200',
  [USER_ROLES.PHARMACIST]: 'bg-teal-50 text-teal-700 border-teal-200',
  [USER_ROLES.CASHIER]: 'bg-blue-50 text-blue-700 border-blue-200',
  [USER_ROLES.INVENTORY_MANAGER]: 'bg-amber-50 text-amber-700 border-amber-200',
};

// Navigation items specification
// Phase 2: Dashboard and Medicines modules are fully operational.
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    enabled: true,
    roles: [USER_ROLES.ADMIN, USER_ROLES.PHARMACIST, USER_ROLES.CASHIER, USER_ROLES.INVENTORY_MANAGER],
  },
  {
    id: 'medicines',
    label: 'Medicines',
    icon: 'Pill',
    path: '/medicines',
    enabled: true,
    roles: [USER_ROLES.ADMIN, USER_ROLES.PHARMACIST, USER_ROLES.INVENTORY_MANAGER, USER_ROLES.CASHIER],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: 'Boxes',
    path: '/inventory',
    enabled: false,
    badge: 'Coming Soon',
    roles: [USER_ROLES.ADMIN, USER_ROLES.PHARMACIST, USER_ROLES.INVENTORY_MANAGER],
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    icon: 'Truck',
    path: '/suppliers',
    enabled: false,
    badge: 'Coming Soon',
    roles: [USER_ROLES.ADMIN, USER_ROLES.INVENTORY_MANAGER],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    icon: 'ShoppingCart',
    path: '/purchases',
    enabled: false,
    badge: 'Coming Soon',
    roles: [USER_ROLES.ADMIN, USER_ROLES.INVENTORY_MANAGER],
  },
  {
    id: 'sales',
    label: 'Sales & Billing',
    icon: 'Receipt',
    path: '/sales',
    enabled: false,
    badge: 'Coming Soon',
    roles: [USER_ROLES.ADMIN, USER_ROLES.CASHIER, USER_ROLES.PHARMACIST],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: 'Users',
    path: '/customers',
    enabled: false,
    badge: 'Coming Soon',
    roles: [USER_ROLES.ADMIN, USER_ROLES.CASHIER, USER_ROLES.PHARMACIST],
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: 'FileText',
    path: '/prescriptions',
    enabled: false,
    badge: 'Coming Soon',
    roles: [USER_ROLES.ADMIN, USER_ROLES.PHARMACIST],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    path: '/reports',
    enabled: false,
    badge: 'Coming Soon',
    roles: [USER_ROLES.ADMIN],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings',
    enabled: false,
    badge: 'Coming Soon',
    roles: [USER_ROLES.ADMIN],
  },
];

// Sample Dashboard Data (Explicitly identified as Sample/Placeholder Data for Phase 1)
export const SAMPLE_DASHBOARD_DATA = {
  isSampleData: true,
  stats: {
    totalMedicines: {
      value: '1,420',
      label: 'Total Medicines',
      change: '+3.4%',
      trend: 'up',
      detail: 'In stock across 12 categories',
    },
    todaySales: {
      value: '$3,845.50',
      label: "Today's Sales",
      change: '+12.8%',
      trend: 'up',
      detail: '48 total transactions processed',
    },
    lowStockMedicines: {
      value: '18',
      label: 'Low Stock Medicines',
      change: '3 Critical',
      trend: 'warning',
      detail: 'Requires immediate reordering',
    },
    totalSuppliers: {
      value: '24',
      label: 'Total Suppliers',
      change: '2 Pending Orders',
      trend: 'neutral',
      detail: 'Active licensed distributors',
    },
  },
  salesChartWeekly: [
    { day: 'Mon', revenue: 2850, salesCount: 38 },
    { day: 'Tue', revenue: 3420, salesCount: 44 },
    { day: 'Wed', revenue: 3100, salesCount: 40 },
    { day: 'Thu', revenue: 4200, salesCount: 56 },
    { day: 'Fri', revenue: 4890, salesCount: 65 },
    { day: 'Sat', revenue: 5320, salesCount: 72 },
    { day: 'Sun', revenue: 3845, salesCount: 48 },
  ],
  salesChartMonthly: [
    { day: 'Week 1', revenue: 19400, salesCount: 290 },
    { day: 'Week 2', revenue: 22100, salesCount: 335 },
    { day: 'Week 3', revenue: 20800, salesCount: 310 },
    { day: 'Week 4', revenue: 24700, salesCount: 380 },
  ],
  recentTransactions: [
    {
      id: 'INV-2026-0891',
      customer: 'Eleanor Vance',
      time: '10 mins ago',
      itemsCount: 3,
      amount: 46.50,
      paymentMethod: 'Credit Card',
      status: 'Completed',
    },
    {
      id: 'INV-2026-0890',
      customer: 'Marcus Bennett',
      time: '25 mins ago',
      itemsCount: 1,
      amount: 14.20,
      paymentMethod: 'Cash',
      status: 'Completed',
    },
    {
      id: 'INV-2026-0889',
      customer: 'Sophia Rodriguez',
      time: '42 mins ago',
      itemsCount: 5,
      amount: 112.80,
      paymentMethod: 'Insurance',
      status: 'Completed',
    },
    {
      id: 'INV-2026-0888',
      customer: 'David Kim',
      time: '1 hour ago',
      itemsCount: 2,
      amount: 32.00,
      paymentMethod: 'Digital Wallet',
      status: 'Completed',
    },
    {
      id: 'INV-2026-0887',
      customer: 'Clara Oswald',
      time: '2 hours ago',
      itemsCount: 4,
      amount: 78.40,
      paymentMethod: 'Credit Card',
      status: 'Completed',
    },
  ],
  lowStockItems: [
    {
      name: 'Amoxicillin 500mg',
      generic: 'Amoxicillin Trihydrate',
      category: 'Antibiotics',
      stock: 12,
      reorderLevel: 50,
      status: 'Critical',
    },
    {
      name: 'Lisinopril 10mg',
      generic: 'Lisinopril',
      category: 'Cardiovascular',
      stock: 18,
      reorderLevel: 40,
      status: 'Critical',
    },
    {
      name: 'Metformin 850mg',
      generic: 'Metformin Hydrochloride',
      category: 'Antidiabetic',
      stock: 24,
      reorderLevel: 60,
      status: 'Low',
    },
    {
      name: 'Salbutamol Inhaler 100mcg',
      generic: 'Albuterol',
      category: 'Respiratory',
      stock: 8,
      reorderLevel: 25,
      status: 'Critical',
    },
    {
      name: 'Omeprazole 20mg',
      generic: 'Omeprazole',
      category: 'Gastrointestinal',
      stock: 28,
      reorderLevel: 50,
      status: 'Low',
    },
  ],
  expiringItems: [
    {
      name: 'Insulin Glargine 100 IU/ml',
      batch: 'B-77402',
      expiryDate: '2026-11-28',
      daysLeft: 13,
      stock: 15,
      urgency: 'high',
    },
    {
      name: 'Eye Drops Ciprofloxacin 0.3%',
      batch: 'B-51093',
      expiryDate: '2026-12-05',
      daysLeft: 20,
      stock: 22,
      urgency: 'high',
    },
    {
      name: 'Azithromycin Oral Susp 200mg',
      batch: 'B-92314',
      expiryDate: '2026-12-18',
      daysLeft: 33,
      stock: 30,
      urgency: 'medium',
    },
    {
      name: 'Hydrocortisone Cream 1%',
      batch: 'B-10492',
      expiryDate: '2027-01-05',
      daysLeft: 51,
      stock: 45,
      urgency: 'medium',
    },
  ],
};

// Supported Dosage Forms
export const DOSAGE_FORMS = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Cream',
  'Ointment',
  'Gel',
  'Drops',
  'Inhaler',
  'Powder',
  'Suppository',
  'Lotion',
  'Spray',
  'Patch',
  'Other',
];

// Supported Packaging Units
export const PACKAGE_UNITS = [
  'Strip',
  'Bottle',
  'Box',
  'Piece',
  'Tube',
  'Vial',
  'Ampoule',
  'Sachet',
  'Pack',
  'Other',
];

// Common Therapeutic Categories
export const COMMON_CATEGORIES = [
  'Analgesics',
  'Antibiotics',
  'Antidiabetic',
  'Antihistamines',
  'Cardiovascular',
  'Dermatology',
  'Gastrointestinal',
  'Ophthalmic',
  'Respiratory',
  'Vitamins & Supplements',
  'Other',
];


