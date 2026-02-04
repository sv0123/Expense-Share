/**
 * Formats a number as a currency string.
 * @param {number} amount - The amount to format.
 * @param {string} currency - The currency code (default: 'INR').
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Gets the symbol for a given currency code.
 * @param {string} currency - The currency code (default: 'INR').
 * @returns {string} The currency symbol.
 */
export const getCurrencySymbol = (currency = 'INR') => {
    // Force Rupee symbol if requested, or default
    if (currency === 'INR' || currency === 'USD') return '₹';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
    })
        .formatToParts(1)
        .find((part) => part.type === 'currency').value;
};
