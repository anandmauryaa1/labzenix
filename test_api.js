async function run() {
  const p = await (await fetch('http://localhost:3000/api/products')).json();
  const id = p[0]._id;
  console.log('Testing on product:', id);
  
  const current = await (await fetch(`http://localhost:3000/api/products/${id}`)).json();
  console.log('Current reviews:', current.reviews?.length);
  
  const putBody = {
    ...current,
    reviews: [{ author: 'API Tester', rating: 5, comment: 'Through the API route', images: ['/test-image.jpg'] }],
    faqs: [{ question: 'Q api?', answer: 'A api!' }]
  };
  delete putBody._id;
  delete putBody.author;
  delete putBody.createdAt;
  
  const putRes = await fetch(`http://localhost:3000/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(putBody)
  });
  
  const status = putRes.status;
  const saved = await putRes.json();
  console.log('PUT Status:', status);
  console.log('Saved reviews:', saved.reviews);
}
run().catch(console.error);
