fetch('http://localhost:4000/test/reconcile-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: '66e8adfc-4ce7-4765-beee-59acd6c0c286' })
}).then(async r => {
  console.log('Status:', r.status);
  console.log('Body:', await r.text());
  process.exit(0);
}).catch(e => {
  console.error('Fetch Error:', e);
  process.exit(1);
});
