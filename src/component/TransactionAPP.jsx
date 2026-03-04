import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, LogOut } from 'lucide-react';
import Dashboard from './Dashboard';
import AddTransaction from './AddTransaction';
import EditTransaction from './EditTransaction';
import { useUser } from '../context/UserContext';

function TransactionAPP() {
  const { currentUser, logout, addTransaction, getUserTransactions, updateTransaction, deleteTransaction } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load transactions from backend on mount
  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getUserTransactions();
      console.log('📊 Loaded transactions:', data);
      console.log('📊 First transaction description:', data[0]?.description);
      setTransactions(data || []);
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transaction) => {
    try {
      console.log('➕ Creating transaction:', transaction);
      const newTxn = await addTransaction(transaction);
      console.log('✅ Transaction created:', newTxn);
      
      await loadTransactions();
      
      setActiveTab('transaction');
      setShowAddModal(false);
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      alert('Failed to create transaction: ' + error.message);
    }
  };

  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      console.log('📝 Updating transaction:', updatedTransaction);
      
      const updateData = {
        receivedAmount: parseFloat(updatedTransaction.receivedAmount) || 0,
        dueAmount: parseFloat(updatedTransaction.dueAmount) || 0,
        balance: parseFloat(updatedTransaction.dueAmount) || 0,
        status: updatedTransaction.status,
        description: (updatedTransaction.description || '').trim()
      };
      
      console.log('📤 Sending update data:', updateData);
      
      const updated = await updateTransaction(updatedTransaction.id, updateData);
      console.log('✅ Transaction updated response:', updated);
      
      setShowEditModal(false);
      setSelectedTransaction(null);
      
      await loadTransactions();
      
      console.log('🔄 Transactions reloaded after update');
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      alert('Failed to update transaction: ' + error.message);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      console.log('🗑️ Deleting transaction:', transactionId);
      
      await deleteTransaction(transactionId);
      console.log('✅ Transaction deleted');
      
      await loadTransactions();
      
      setShowEditModal(false);
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      alert('Failed to delete transaction: ' + error.message);
    }
  };

  const handleEditClick = (transaction) => {
    console.log('📝 Opening edit modal for transaction:', transaction);
    console.log('📝 Description in transaction:', transaction.description);
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    return dateString;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  const creditTransactions = transactions.filter(txn => (txn.type || 'credit') === 'credit');
  const debitTransactions = transactions.filter(txn => (txn.type || 'credit') === 'debit');

  const filterTransactions = (txnList) => {
    if (!searchQuery.trim()) return txnList;
    
    const query = searchQuery.toLowerCase();
    return txnList.filter(txn => {
      const partyName = (txn.party_name || txn.partyName || '').toLowerCase();
      const description = (txn.description || '').toLowerCase();
      const status = (txn.status || '').toLowerCase();
      const amount = (txn.total_amount || txn.totalAmount || txn.amount || 0).toString();
      const date = formatDate(txn.date).toLowerCase();
      
      return partyName.includes(query) || 
             description.includes(query) || 
             status.includes(query) || 
             amount.includes(query) ||
             date.includes(query);
    });
  };

  const filteredCreditTransactions = filterTransactions(creditTransactions);
  const filteredDebitTransactions = filterTransactions(debitTransactions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-lg shadow-md">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">SmartBudget</h1>
            </div>

            {/* Navigation with Username and Logout */}
            <nav className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2.5 rounded-full transition-all font-semibold ${
                  activeTab === 'dashboard' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-semibold">DASHBOARD</span>
              </button>
              <button 
                onClick={() => setActiveTab('transaction')}
                className={`px-6 py-2.5 rounded-full transition-all font-semibold ${
                  activeTab === 'transaction' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-semibold">TRANSACTIONS</span>
              </button>
              
              {/* Username Display */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-full">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-black">
                  {currentUser?.fullName || 'User'}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content Based on Active Tab */}
      {activeTab === 'dashboard' ? (
        <Dashboard transactions={transactions} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Transactions Yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first transaction</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* Credit Transactions Column */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-lg shadow-md w-full">
                    <h2 className="text-lg font-bold text-white flex items-center justify-center">
                      <span className="mr-2">↑</span> CREDIT TRANSACTIONS
                      <span className="ml-3 bg-white text-green-600 px-2 py-0.5 rounded-full text-sm font-semibold">
                        {filteredCreditTransactions.length}
                      </span>
                    </h2>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {filteredCreditTransactions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <p className="text-gray-400">
                        {searchQuery ? `No credit transactions matching "${searchQuery}"` : 'No credit transactions'}
                      </p>
                    </div>
                  ) : (
                    filteredCreditTransactions.map((txn) => (
                      <div key={txn.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-green-500">
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-800">{txn.party_name || txn.partyName}</h3>
                            <button
                              onClick={() => handleEditClick(txn)}
                              className="px-2 py-0.5 bg-gray-800 text-white rounded-lg hover:bg-black flex items-center space-x-1 transition-all shadow-sm hover:shadow-md"
                            >
                              <span className="text-xs font-medium">Edit</span>
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                              txn.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.status}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(txn.date)}</span>
                          </div>
                          
                          {txn.description && txn.description.trim() !== '' && (
                            <p className="text-xs text-gray-600 mb-1 italic bg-yellow-50 px-2 py-0.5 rounded">
                              {txn.description.trim()}
                            </p>
                          )}
                          
                          <div className="space-y-0.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Total:</span>
                              <span className="font-semibold text-gray-800">
                                {formatCurrency(txn.total_amount || txn.totalAmount || txn.amount || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Due:</span>
                              <span className="font-semibold text-orange-600">
                                {formatCurrency(txn.due_amount || txn.dueAmount || txn.balance || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Received:</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(txn.received_amount || txn.receivedAmount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Debit Transactions Column */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 rounded-lg shadow-md w-full">
                    <h2 className="text-lg font-bold text-white flex items-center justify-center">
                      <span className="mr-2">↓</span> DEBIT TRANSACTIONS
                      <span className="ml-3 bg-white text-red-600 px-2 py-0.5 rounded-full text-sm font-semibold">
                        {filteredDebitTransactions.length}
                      </span>
                    </h2>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {filteredDebitTransactions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <p className="text-gray-400">
                        {searchQuery ? `No debit transactions matching "${searchQuery}"` : 'No debit transactions'}
                      </p>
                    </div>
                  ) : (
                    filteredDebitTransactions.map((txn) => (
                      <div key={txn.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-red-500">
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-800">{txn.party_name || txn.partyName}</h3>
                            <button
                              onClick={() => handleEditClick(txn)}
                              className="px-2 py-0.5 bg-gray-800 text-white rounded-lg hover:bg-black flex items-center space-x-1 transition-all shadow-sm hover:shadow-md"
                            >
                              <span className="text-xs font-medium">Edit</span>
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                              txn.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.status}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(txn.date)}</span>
                          </div>
                          
                          {txn.description && txn.description.trim() !== '' && (
                            <p className="text-xs text-gray-600 mb-1 italic bg-yellow-50 px-2 py-0.5 rounded">
                              {txn.description.trim()}
                            </p>
                          )}
                          
                          <div className="space-y-0.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Total:</span>
                              <span className="font-semibold text-gray-800">
                                {formatCurrency(txn.total_amount || txn.totalAmount || txn.amount || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Due:</span>
                              <span className="font-semibold text-orange-600">
                                {formatCurrency(txn.due_amount || txn.dueAmount || txn.balance || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Received:</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(txn.received_amount || txn.receivedAmount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Add Button — BIGGER SIZE */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-red-600 to-pink-600 text-white px-10 py-5 rounded-full shadow-xl hover:shadow-2xl hover:from-red-700 hover:to-pink-700 flex items-center space-x-3 transition-all transform hover:scale-105 text-lg font-bold"
      >
        <Plus className="w-6 h-6" />
        <span>Add Transaction</span>
      </button>

      {/* Add Transaction Modal */}
      <AddTransaction
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* Edit Transaction Modal */}
      <EditTransaction
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        transaction={selectedTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
}

export default TransactionAPP;