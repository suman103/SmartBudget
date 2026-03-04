import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';

function EditTransaction({ isOpen, onClose, transaction, onUpdateTransaction, onDeleteTransaction }) {
  const [receivedAmount, setReceivedAmount] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (transaction && isOpen) {
      const received = transaction.received_amount || transaction.receivedAmount || 0;
      const due = transaction.due_amount || transaction.dueAmount || transaction.balance || 0;
      const desc = transaction.description || '';
      
      setReceivedAmount(received.toString());
      setDueAmount(due.toString());
      setDescription(desc);
    }
  }, [transaction, isOpen]);

  const handleSubmit = () => {
    const receivedAmt = parseFloat(receivedAmount) || 0;
    const dueAmt = parseFloat(dueAmount) || 0;
    
    const updatedTransaction = {
      ...transaction,
      receivedAmount: receivedAmt,
      dueAmount: dueAmt,
      balance: dueAmt,
      status: dueAmt === 0 ? 'PAID' : 'UNPAID',
      description: description
    };

    onUpdateTransaction(updatedTransaction);
  };

  const handleDelete = () => {
    onDeleteTransaction(transaction.id);
  };

  const handleReceivedChange = (value) => {
    const received = parseFloat(value) || 0;
    const total = transaction.total_amount || transaction.totalAmount || transaction.amount || 0;
    setReceivedAmount(value);
    setDueAmount((total - received).toString());
  };

  const handleDueChange = (value) => {
    const due = parseFloat(value) || 0;
    const total = transaction.total_amount || transaction.totalAmount || transaction.amount || 0;
    setDueAmount(value);
    setReceivedAmount((total - due).toString());
  };

  if (!isOpen || !transaction) return null;

  const partyName = transaction.party_name || transaction.partyName || 'Unknown';
  const totalAmount = parseFloat(transaction.total_amount || transaction.totalAmount || transaction.amount || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-10 p-2 rounded-lg">
                <Edit2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Transaction</h2>
                <p className="text-sm text-gray-300">{partyName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Total Amount (Read-only) */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Total Amount (Fixed)
              </label>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-800">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Received Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Received Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  max={totalAmount}
                  step="0.01"
                  value={receivedAmount}
                  onChange={(e) => handleReceivedChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Due Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  max={totalAmount}
                  step="0.01"
                  value={dueAmount}
                  onChange={(e) => handleDueChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Description - COMPLETELY SIMPLIFIED */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes or description..."
                rows="3"
                style={{ resize: 'none' }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add any additional notes or details about this transaction
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    parseFloat(dueAmount || 0) === 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {parseFloat(dueAmount || 0) === 0 ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
                <div className="h-px bg-gray-300"></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-gray-800">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Received:</span>
                  <span className="font-semibold text-green-600">
                    ₹{parseFloat(receivedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due:</span>
                  <span className="font-semibold text-orange-600">
                    ₹{parseFloat(dueAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Warning */}
            {Math.abs((parseFloat(receivedAmount) + parseFloat(dueAmount)) - totalAmount) > 0.01 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                <span className="text-yellow-600 text-sm">⚠️</span>
                <p className="text-xs text-yellow-800">
                  Warning: Received + Due amounts should equal Total Amount (₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Save and Cancel Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg font-semibold hover:from-gray-900 hover:to-gray-900 transition-all shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Transaction</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTransaction;