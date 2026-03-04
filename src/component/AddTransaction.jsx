import React, { useState } from 'react';
import { X, CreditCard, TrendingUp } from 'lucide-react';

function AddTransaction({ isOpen, onClose, onAddTransaction }) {
  const [transactionType, setTransactionType] = useState('credit'); // 'credit' or 'debit'
  const [formData, setFormData] = useState({
    partyName: '',
    amount: '',
    dueAmount: '',
    receivedAmount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Dynamic label based on transaction type
  const amountLabel = transactionType === 'credit' ? 'Received Amount' : 'Paid Amount';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount) || 0;
    const receivedAmount = parseFloat(formData.receivedAmount) || 0;
    const dueAmount = amount - receivedAmount;
    
    // ✅ FIXED: Using snake_case to match backend
    const newTransaction = {
      party_name: formData.partyName,           // Changed from partyName
      total_amount: amount,                      // Changed from totalAmount
      amount: amount,                            // Keep for compatibility
      received_amount: receivedAmount,           // Changed from receivedAmount
      due_amount: dueAmount,                     // Changed from dueAmount
      balance: dueAmount,                        // Keep balance
      status: dueAmount === 0 ? 'PAID' : 'UNPAID',
      type: transactionType,
      description: formData.description,
      date: formData.date
    };

    console.log('📤 Sending transaction to backend:', newTransaction);
    onAddTransaction(newTransaction);
    
    // Reset form
    setFormData({
      partyName: '',
      amount: '',
      dueAmount: '',
      receivedAmount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setTransactionType('credit');
    onClose();
  };

  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    const received = parseFloat(formData.receivedAmount) || 0;
    setFormData({
      ...formData,
      amount: e.target.value,
      dueAmount: (amount - received).toString()
    });
  };

  const handleReceivedChange = (e) => {
    const received = parseFloat(e.target.value) || 0;
    const amount = parseFloat(formData.amount) || 0;
    setFormData({
      ...formData,
      receivedAmount: e.target.value,
      dueAmount: (amount - received).toString()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">Add New Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTransactionType('credit')}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 ${
                  transactionType === 'credit'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300 text-gray-600'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Credit (Incoming)</span>
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('debit')}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 ${
                  transactionType === 'debit'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300 text-gray-600'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-semibold">Debit (Outgoing)</span>
              </button>
            </div>
          </div>

          {/* Party Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Party Name *
            </label>
            <input
              type="text"
              required
              value={formData.partyName}
              onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
              placeholder="Enter party name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Amount Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Received/Paid Amount - DYNAMIC LABEL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {amountLabel}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.receivedAmount}
                  onChange={handleReceivedChange}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Due Amount (Auto-calculated) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="text"
                  value={formData.dueAmount}
                  readOnly
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add notes or description"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Summary Box - DYNAMIC COLOR AND LABEL */}
          <div className={`p-4 rounded-xl ${
            transactionType === 'credit' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Transaction Summary</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                parseFloat(formData.dueAmount || 0) === 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {parseFloat(formData.dueAmount || 0) === 0 ? 'PAID' : 'UNPAID'}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-800">₹{parseFloat(formData.amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{amountLabel}:</span>
                <span className={`font-semibold ${transactionType === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{parseFloat(formData.receivedAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-gray-600 font-medium">Balance Due:</span>
                <span className="font-bold text-orange-600">₹{parseFloat(formData.dueAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransaction;