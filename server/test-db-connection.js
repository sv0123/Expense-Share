require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('Attempting to connect to:', uri.replace(/:([^@]+)@/, ':****@')); // Hide password in logs

async function testConnection() {
    try {
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected Successfully');

        // Define a simple schema for testing
        const TestSchema = new mongoose.Schema({ name: String, date: { type: Date, default: Date.now } });
        const TestModel = mongoose.model('TestConnection', TestSchema);

        // Create a test document
        const doc = await TestModel.create({ name: 'Atlas Connectivity Test' });
        console.log('✅ Test Document Created:', doc);

        // Read it back
        const found = await TestModel.findById(doc._id);
        if (found) {
            console.log('✅ Test Document Retrieved:', found.name);
        } else {
            console.error('❌ Test Document Not Found after creation');
        }

        // Clean up
        await TestModel.deleteOne({ _id: doc._id });
        console.log('✅ Test Document Cleaned up');

    } catch (err) {
        console.error('❌ MongoDB Connection/Operation Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

testConnection();
