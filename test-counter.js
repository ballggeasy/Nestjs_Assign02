async function testCounter(type) {
  console.log(`🚀 Sending 100 concurrent requests to ${type} counter...`);
  
  const studentId = 1;
  const url = `http://localhost:3000/students/${studentId}/views/${type}`;
  
  // Clear the counter before test
  await globalThis.fetch(`http://localhost:3000/students/${studentId}/views/reset`, {
    method: 'POST'
  });

  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(globalThis.fetch(url, { method: 'POST' }).then(res => res.json()));
  }
  
  await Promise.all(promises);
  
  // Get final result
  const res = await globalThis.fetch(`http://localhost:3000/students/${studentId}/views`).then(r => r.json());
  console.log(`✅ Expected: 100, Actual Result: ${res.views}`);
}

const arg = process.argv[2] || 'non-atomic';
if (arg !== 'non-atomic' && arg !== 'atomic') {
  console.log('Please provide "non-atomic" or "atomic" as an argument.');
  process.exit(1);
}

testCounter(arg);
