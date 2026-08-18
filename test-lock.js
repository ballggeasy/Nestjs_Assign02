async function runLockTest() {
  console.log('🚀 Sending 5 concurrent requests to /students/1/send-email...');
  
  const studentId = 1;
  const url = `http://localhost:3000/students/${studentId}/send-email`;
  
  const promises = [];
  // ส่ง 5 requests พร้อมๆ กัน
  for (let i = 0; i < 5; i++) {
    promises.push(globalThis.fetch(url, { method: 'POST' }).then(res => res.json()));
  }
  
  const results = await Promise.all(promises);
  
  console.log('\n📊 Results:');
  let successCount = 0;
  let rejectedCount = 0;
  
  results.forEach((res, index) => {
    console.log(`Request ${index + 1}: ${res.status} - ${res.message}`);
    if (res.status === 'success') successCount++;
    if (res.status === 'rejected') rejectedCount++;
  });
  
  console.log(`\n✅ Expected Success: 1, Actual Success: ${successCount}`);
  console.log(`❌ Expected Rejected: 4, Actual Rejected: ${rejectedCount}`);
}

runLockTest();
