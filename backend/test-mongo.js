const { MongoClient } = require('mongodb');

async function testMongoConnection() {
    console.log('=== MongoDB Connection Test ===\n');

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ ERROR: MONGODB_URI environment variable is not set');
        process.exit(1);
    }

    // Hide password in logs
    const sanitizedUri = uri.replace(/:[^:@]+@/, ':****@');
    console.log('Connection URI:', sanitizedUri);
    console.log('');

    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
    });

    try {
        console.log('⏳ Attempting to connect to MongoDB...');
        await client.connect();
        console.log('✅ Successfully connected to MongoDB!');
        console.log('');

        // Test database access
        const db = client.db();
        console.log('📦 Database name:', db.databaseName);
        console.log('');

        // List collections
        console.log('📋 Listing collections...');
        const collections = await db.listCollections().toArray();
        console.log(`Found ${collections.length} collection(s):`);
        collections.forEach(col => {
            console.log(`  - ${col.name}`);
        });
        console.log('');

        // Test users collection
        console.log('👥 Testing users collection...');
        const usersCollection = db.collection('users');
        const userCount = await usersCollection.countDocuments();
        console.log(`Users collection has ${userCount} document(s)`);
        console.log('');

        // Test insert (and remove)
        console.log('✏️  Testing write operation...');
        const testDoc = {
            _test: true,
            timestamp: new Date(),
            message: 'Connection test document'
        };
        const insertResult = await usersCollection.insertOne(testDoc);
        console.log('✅ Insert successful, ID:', insertResult.insertedId);

        // Clean up test document
        await usersCollection.deleteOne({ _id: insertResult.insertedId });
        console.log('✅ Test document cleaned up');
        console.log('');

        console.log('🎉 All tests passed!');

    } catch (error) {
        console.error('❌ CONNECTION FAILED');
        console.error('');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('');

        if (error.message.includes('ECONNREFUSED')) {
            console.error('💡 Diagnosis: Connection refused');
            console.error('   - Check if MongoDB Atlas cluster is running (not paused)');
            console.error('   - Verify the cluster URL is correct');
            console.error('   - Check network access settings in MongoDB Atlas');
        } else if (error.message.includes('querySrv')) {
            console.error('💡 Diagnosis: DNS resolution failed');
            console.error('   - The cluster hostname cannot be resolved');
            console.error('   - The cluster might be deleted or the URL is incorrect');
            console.error('   - Try using the standard connection format instead of SRV');
        } else if (error.message.includes('Authentication failed')) {
            console.error('💡 Diagnosis: Authentication error');
            console.error('   - Check username and password');
            console.error('   - Verify database user exists in MongoDB Atlas');
        } else if (error.message.includes('timeout')) {
            console.error('💡 Diagnosis: Connection timeout');
            console.error('   - Check network connectivity');
            console.error('   - Verify IP whitelist in MongoDB Atlas');
        }

        console.error('');
        console.error('Full error details:');
        console.error(error);

        process.exit(1);
    } finally {
        await client.close();
        console.log('');
        console.log('Connection closed.');
    }
}

// Run the test
testMongoConnection().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
