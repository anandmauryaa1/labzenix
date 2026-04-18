
const fetch = require('node-fetch');

async function testCreate() {
  const product = {
    title: "Test Instrument " + Date.now(),
    modelNumber: "LZ-100",
    slug: "test-instrument-" + Date.now(),
    description: "A high-precision testing instrument for laboratory use.",
    category: "Paper & Packaging",
    usage: "Laboratory",
    images: ["https://placehold.co/600x400"],
    features: ["Precision Sensors", "Digital Display", "Calibration Certification"],
    specificationText: "Full technical details go here.",
    specs: { "Accuracy": "+/- 0.1%", "Weight": "15kg" },
    metaTitle: "Test Instrument | LabZenix",
    metaDescription: "The best test instrument for your lab."
  };

  try {
    const res = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testCreate();
