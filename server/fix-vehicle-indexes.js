const mongoose = require('mongoose');
const config = require('./config/config');

async function fixIndexes() {
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.db.collection('vehicles');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop engineNumber unique index if it exists
    if (indexes.some(i => i.name === 'engineNumber_1')) {
      await collection.dropIndex('engineNumber_1');
      console.log('Dropped index: engineNumber_1');
    }
    // Drop chassisNumber unique index if it exists
    if (indexes.some(i => i.name === 'chassisNumber_1')) {
      await collection.dropIndex('chassisNumber_1');
      console.log('Dropped index: chassisNumber_1');
    }

    // Optionally, add partial unique indexes for non-null values
    await collection.createIndex(
      { engineNumber: 1 },
      { unique: true, partialFilterExpression: { engineNumber: { $type: 'string' } } }
    );
    console.log('Created partial unique index on engineNumber');

    await collection.createIndex(
      { chassisNumber: 1 },
      { unique: true, partialFilterExpression: { chassisNumber: { $type: 'string' } } }
    );
    console.log('Created partial unique index on chassisNumber');

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error fixing indexes:', err);
    process.exit(1);
  }
}

fixIndexes(); 