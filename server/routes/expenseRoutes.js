const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const validate = require('../middleware/validate');
const { addExpenseSchema, getGroupExpensesSchema, deleteExpenseSchema } = require('../validators/schemas');

// Add Expense
router.post('/', validate(addExpenseSchema), async (req, res) => {
    try {
        const { title, amount, payerId, groupId, date } = req.body;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        const isMember = group.members.some((id) => id.toString() === payerId);
        if (!isMember) return res.status(403).json({ error: 'You must be a group member to add expenses' });

        const expense = await Expense.create({
            title,
            amount: parseFloat(amount),
            payer: payerId,
            group: groupId,
            date: date ? new Date(date) : new Date(),
            participants: [],
        });

        req.io.to(groupId).emit('group-updated', { type: 'expense-added', expense });
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to add expense' });
    }
});

// Get Group Expenses
router.get('/group/:groupId', validate(getGroupExpensesSchema), async (req, res) => {
    try {
        const expenses = await Expense.find({ group: req.params.groupId })
            .populate('payer', 'name')
            .sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to load expenses' });
    }
});

// Delete Expense
router.delete('/:id', validate(deleteExpenseSchema), async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ error: 'Expense not found' });

        await Expense.findByIdAndDelete(req.params.id);
        req.io.to(expense.group.toString()).emit('group-updated', { type: 'expense-deleted', expenseId: req.params.id });
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to delete expense' });
    }
});

module.exports = router;
