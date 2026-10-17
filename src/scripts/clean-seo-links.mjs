import mongoose from 'mongoose';

const SITE_DOMAINS = [
  'labzenix.com',
  'www.labzenix.com',
  'labzenix.in',
  'www.labzenix.in',
  'localhost:3000',
];

function isInternalUrl(url) {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  if (trimmed.startsWith('#')) return true;

  try {
    const parsed = new URL(trimmed);
    return SITE_DOMAINS.includes(parsed.host.toLowerCase());
  } catch {
    return false;
  }
}

function normalizePath(url) {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      return parsed.pathname.replace(/\/+$/, '').toLowerCase();
    }
    return url.split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
  } catch {
    return url.replace(/\/+$/, '').toLowerCase();
  }
}

function cleanHtml(html, currentPath) {
  if (!html || typeof html !== 'string') return html;

  const normalizedCurrentPath = currentPath ? normalizePath(currentPath) : null;
  const anchorRegex = /<a\b([^>]*?)>(.*?)<\/a>/gis;

  return html.replace(anchorRegex, (match, attributesStr, innerText) => {
    const hrefMatch = attributesStr.match(/href=(["'])(.*?)\1/i);
    if (!hrefMatch) return match;

    const href = hrefMatch[2].trim();
    const isInternal = isInternalUrl(href);

    // If it's a self-referencing link (pointing to the exact same page)
    if (normalizedCurrentPath && isInternal) {
      const linkPath = normalizePath(href);
      if (linkPath === normalizedCurrentPath && linkPath !== '' && linkPath !== '/') {
        return `<span>${innerText}</span>`;
      }
    }

    // If internal, remove 'nofollow' from rel
    if (isInternal) {
      let updatedAttributes = attributesStr;
      const relMatch = updatedAttributes.match(/rel=(["'])(.*?)\1/i);
      if (relMatch) {
        const currentRel = relMatch[2];
        const cleanedRel = currentRel
          .split(/\s+/)
          .filter((token) => token.toLowerCase() !== 'nofollow')
          .join(' ')
          .trim();

        if (cleanedRel.length > 0) {
          updatedAttributes = updatedAttributes.replace(relMatch[0], `rel="${cleanedRel}"`);
        } else {
          updatedAttributes = updatedAttributes.replace(relMatch[0], '');
        }
      }
      return `<a${updatedAttributes}>${innerText}</a>`;
    }

    return match;
  });
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment. Run with --env-file=.env.local');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;

  // 1. Clean Products
  console.log('\n--- Cleaning Products ---');
  const productsCollection = db.collection('products');
  const products = await productsCollection.find({}).toArray();
  let updatedProducts = 0;

  for (const prod of products) {
    const productPath = `/products/${prod.slug}`;
    const newDesc = cleanHtml(prod.description, productPath);
    const newSpecs = cleanHtml(prod.specificationText, productPath);
    const newFeatures = cleanHtml(prod.featuresText, productPath);

    let changed = false;
    const updateDoc = {};

    if (newDesc !== prod.description) {
      updateDoc.description = newDesc;
      changed = true;
    }
    if (newSpecs !== prod.specificationText) {
      updateDoc.specificationText = newSpecs;
      changed = true;
    }
    if (newFeatures !== prod.featuresText) {
      updateDoc.featuresText = newFeatures;
      changed = true;
    }

    if (changed) {
      await productsCollection.updateOne({ _id: prod._id }, { $set: updateDoc });
      updatedProducts++;
      console.log(`✓ Cleaned Product: ${prod.slug}`);
    }
  }
  console.log(`Total Products Cleaned: ${updatedProducts} / ${products.length}`);

  // 2. Clean Blogs
  console.log('\n--- Cleaning Blogs ---');
  const blogsCollection = db.collection('blogs');
  const blogs = await blogsCollection.find({}).toArray();
  let updatedBlogs = 0;

  for (const blog of blogs) {
    const blogPath = `/blogs/${blog.slug}`;
    const newContent = cleanHtml(blog.content, blogPath);

    if (newContent !== blog.content) {
      await blogsCollection.updateOne({ _id: blog._id }, { $set: { content: newContent } });
      updatedBlogs++;
      console.log(`✓ Cleaned Blog: ${blog.slug}`);
    }
  }
  console.log(`Total Blogs Cleaned: ${updatedBlogs} / ${blogs.length}`);

  await mongoose.disconnect();
  console.log('\nDone.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
