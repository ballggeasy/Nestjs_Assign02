async function runStampede() {
  console.log('🚀 Sending 10 concurrent requests to /students/summary/report...');
  
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      fetch('http://localhost:3000/students/summary/report').then(res => res.json())
    );
  }
  
  await Promise.all(promises);
  console.log('✅ All requests finished!');
}

runStampede();
