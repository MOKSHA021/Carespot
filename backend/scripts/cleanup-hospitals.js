const mongoose = require('mongoose');
require('dotenv').config();

const fixDuplicateRegistrations = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const hospitalsCollection = db.collection('hospitals');
    
    // ✅ Step 1: Find all duplicate registrationNumbers
    console.log('🔍 Finding duplicate registration numbers...');
    
    const duplicates = await hospitalsCollection.aggregate([
      {
        $group: {
          _id: "$registrationNumber",
          count: { $sum: 1 },
          docs: { $push: "$$ROOT" }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log(`📊 Found ${duplicates.length} duplicate registration numbers:`);
    duplicates.forEach(dup => {
      console.log(`   - "${dup._id}": ${dup.count} duplicates`);
    });

    // ✅ Step 2: Also check for basicInfo.registrationNumber duplicates
    const basicInfoDuplicates = await hospitalsCollection.aggregate([
      {
        $group: {
          _id: "$basicInfo.registrationNumber",
          count: { $sum: 1 },
          docs: { $push: "$$ROOT" }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log(`📊 Found ${basicInfoDuplicates.length} basicInfo.registrationNumber duplicates:`);
    basicInfoDuplicates.forEach(dup => {
      console.log(`   - "${dup._id}": ${dup.count} duplicates`);
    });

    // ✅ Step 3: Remove duplicate documents (keep the newest one)
    let removedCount = 0;
    
    for (const duplicate of duplicates) {
      if (duplicate.docs.length > 1) {
        // Sort by createdAt, keep the newest
        const sortedDocs = duplicate.docs.sort((a, b) => 
          new Date(b.createdAt || b._id.getTimestamp()) - 
          new Date(a.createdAt || a._id.getTimestamp())
        );
        
        const [keep, ...remove] = sortedDocs;
        console.log(`🗑️ Keeping newest: ${keep._id}, removing ${remove.length} duplicates`);
        
        for (const doc of remove) {
          await hospitalsCollection.deleteOne({ _id: doc._id });
          removedCount++;
        }
      }
    }

    // ✅ Step 4: Handle basicInfo.registrationNumber duplicates
    for (const duplicate of basicInfoDuplicates) {
      if (duplicate.docs.length > 1) {
        const sortedDocs = duplicate.docs.sort((a, b) => 
          new Date(b.createdAt || b._id.getTimestamp()) - 
          new Date(a.createdAt || a._id.getTimestamp())
        );
        
        const [keep, ...remove] = sortedDocs;
        console.log(`🗑️ Keeping newest basicInfo: ${keep._id}, removing ${remove.length} duplicates`);
        
        for (const doc of remove) {
          await hospitalsCollection.deleteOne({ _id: doc._id });
          removedCount++;
        }
      }
    }

    console.log(`✅ Removed ${removedCount} duplicate documents`);

    // ✅ Step 5: List and drop all conflicting indexes
    console.log('🔍 Checking indexes...');
    const indexes = await hospitalsCollection.indexes();
    
    const registrationIndexes = indexes.filter(index => 
      index.name.includes('registrationNumber') || 
      JSON.stringify(index.key).includes('registrationNumber')
    );

    console.log('📋 Found registration-related indexes:');
    registrationIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop conflicting indexes
    for (const index of registrationIndexes) {
      try {
        if (index.name !== '_id_') { // Don't drop the _id index
          console.log(`🗑️ Dropping index: ${index.name}`);
          await hospitalsCollection.dropIndex(index.name);
        }
      } catch (error) {
        console.log(`⚠️ Could not drop index ${index.name}:`, error.message);
      }
    }

    // ✅ Step 6: Create the correct unique index
    console.log('🏗️ Creating correct unique index...');
    try {
      await hospitalsCollection.createIndex(
        { registrationNumber: 1 }, 
        { 
          unique: true,
          name: 'registrationNumber_unique'
        }
      );
      console.log('✅ Created registrationNumber unique index');
    } catch (error) {
      console.error('❌ Error creating index:', error.message);
    }

    // ✅ Step 7: Verify no more duplicates
    const finalCheck = await hospitalsCollection.aggregate([
      {
        $group: {
          _id: "$registrationNumber",
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (finalCheck.length === 0) {
      console.log('✅ No duplicate registration numbers remain!');
    } else {
      console.log('❌ Still have duplicates:', finalCheck);
    }

    // ✅ Step 8: Display final statistics
    const totalHospitals = await hospitalsCollection.countDocuments();
    console.log(`📊 Final count: ${totalHospitals} hospitals in database`);

    console.log('');
    console.log('✅ Database cleanup completed successfully!');
    console.log('🎉 Hospital registration should now work without duplicate errors!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

fixDuplicateRegistrations();
