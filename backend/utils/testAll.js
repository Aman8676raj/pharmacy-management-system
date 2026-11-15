const { spawnSync } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('   PHARMACORE FULL SYSTEM VERIFICATION SUITE');
console.log('====================================================\n');

const tests = [
  { name: 'Phase 2: Medicine Management Suite', script: 'testMedicines.js' },
  { name: 'Phase 3: Inventory Management Suite', script: 'testInventory.js' },
  { name: 'Phase 4: Supplier & Purchase Management Suite', script: 'testPurchases.js' },
];

let allPassed = true;

for (const t of tests) {
  console.log(`>>> Running ${t.name}...`);
  const result = spawnSync('node', [path.join(__dirname, t.script)], {
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    console.error(`FAILED: ${t.name}`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\nSome test suites failed!');
  process.exit(1);
} else {
  console.log('\nAll test suites passed successfully!');
  process.exit(0);
}
