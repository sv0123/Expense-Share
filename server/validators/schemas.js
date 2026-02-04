const { z } = require('zod');
const mongoose = require('mongoose');

// Helper for ObjectId validation
const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ID format',
});

// User schemas
const userSchema = z.object({
    userName: z.string().min(1, 'Name is required').trim(),
    userEmail: z.string().email('Invalid email address').trim(),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits').optional().or(z.literal('')),
});

// Group Schemas
const createGroupSchema = z.object({
    body: userSchema.extend({
        groupName: z.string().min(1, 'Group name is required').trim(),
    }),
});

const joinGroupSchema = z.object({
    body: userSchema.extend({
        code: z.string().min(1, 'Group code is required').trim(),
    }),
});

const getGroupSchema = z.object({
    params: z.object({
        id: objectId,
    }),
});

// Expense Schemas
const addExpenseSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').trim(),
        amount: z.number({ coerce: true }).min(0.01, 'Amount must be positive'),
        payerId: objectId,
        groupId: objectId,
        date: z.string().optional().or(z.date()),
    }),
});

const getGroupExpensesSchema = z.object({
    params: z.object({
        groupId: objectId,
    }),
});

const deleteExpenseSchema = z.object({
    params: z.object({
        id: objectId,
    }),
});

// Reminder Schemas
const createReminderSchema = z.object({
    body: z.object({
        groupId: objectId,
        dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)), // Accept ISO or YYYY-MM-DD
        message: z.string().optional(),
        userId: objectId, // createdBy
        forUserId: objectId.optional(),
    }),
});

const getGroupRemindersSchema = z.object({
    params: z.object({
        groupId: objectId,
    }),
});

const sendReminderSchema = z.object({
    body: z.object({
        groupId: objectId,
        memberId: objectId.optional(),
        message: z.string().optional(),
    }),
});

module.exports = {
    createGroupSchema,
    joinGroupSchema,
    getGroupSchema,
    addExpenseSchema,
    getGroupExpensesSchema,
    deleteExpenseSchema,
    createReminderSchema,
    getGroupRemindersSchema,
    sendReminderSchema,
};
