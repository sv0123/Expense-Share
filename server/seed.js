
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Group = require('./models/Group');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Settlement = require('./models/Settlement');
const Reminder = require('./models/Reminder');

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense-sharing-app';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB at', MONGO_URI);

        console.log('Clearing existing data...');
        await Promise.all([
            Group.deleteMany({}),
            User.deleteMany({}),
            Expense.deleteMany({}),
            Settlement.deleteMany({}),
            Reminder.deleteMany({})
        ]);

        console.log('Creating users...');
        const alice = await User.create({ name: 'Alice', email: 'alice@example.com', password: 'password123', phone: '1234567890' });
        const bob = await User.create({ name: 'Bob', email: 'bob@example.com', password: 'password123', phone: '0987654321' });
        const charlie = await User.create({ name: 'Charlie', email: 'charlie@example.com', password: 'password123', phone: '1122334455' });

        console.log('Creating group...');
        const group = await Group.create({
            name: 'Weekend Trip',
            code: 'WEEKND',
            members: [alice._id, bob._id, charlie._id],
            currency: 'USD'
        });

        console.log('Adding expenses...');
        // Alice paid for Hotel ($300)
        await Expense.create({
            title: 'Hotel Booking',
            amount: 300,
            payer: alice._id,
            group: group._id,
            date: new Date('2023-10-01')
        });

        // Bob paid for Dinner ($60)
        await Expense.create({
            title: 'Friday Dinner',
            amount: 60,
            payer: bob._id,
            group: group._id,
            date: new Date('2023-10-01')
        });

        // Charlie paid for Snacks ($30)
        await Expense.create({
            title: 'Snacks & Drinks',
            amount: 30,
            payer: charlie._id,
            group: group._id,
            date: new Date('2023-10-02')
        });

        console.log('Adding settlement...');
        // Bob paid Alice $50
        await Settlement.create({
            group: group._id,
            fromUser: bob._id,
            toUser: alice._id,
            amount: 50
        });

        console.log('Adding reminder...');
        await Reminder.create({
            group: group._id,
            createdBy: alice._id,
            message: 'Settle up before Monday',
            dueDate: new Date('2023-10-05')
        });

        console.log('Database seeded successfully!');
        console.log(`Group Code: ${group.code}`);
        console.log(`Group ID: ${group._id}`);
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

seed();
