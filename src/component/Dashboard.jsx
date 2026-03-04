import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Target
} from 'lucide-react';

function Dashboard({ transactions = [] }) {
  const [timeRange, setTimeRange] = useState('all'); // Changed from 'week' to 'all'

  // Use useMemo to prevent recalculation on every render
  const stats = useMemo(() => {
    console.log('📊 Dashboard - All Transactions:', transactions);
    console.log('📊 Dashboard - Total Count:', transactions.length);
    
    if (!transactions || transactions.length === 0) {
      console.log('⚠️ No transactions available');
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        totalCredit: 0,
        totalDebit: 0,
        pendingAmount: 0,
        paidAmount: 0,
        paidTransactions: 0,
        unpaidTransactions: 0
      };
    }

    // Log first transaction to see structure
    console.log('📊 First Transaction Structure:', transactions[0]);

    // Filter transactions based on time range
    const now = new Date();
    const filteredTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.date || txn.created_at);
      
      if (timeRange === 'day') {
        return txnDate.toDateString() === now.toDateString();
      } else if (timeRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return txnDate >= weekAgo;
      } else if (timeRange === 'month') {
        return txnDate.getMonth() === now.getMonth() && 
               txnDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    console.log(`📅 Filtered Transactions (${timeRange}):`, filteredTransactions.length);

    // Calculate total revenue - CHECK ALL POSSIBLE FIELD NAMES
    const totalRevenue = filteredTransactions.reduce((sum, txn) => {
      const amount = parseFloat(
        txn.total_amount || 
        txn.totalAmount || 
        txn.amount || 
        txn.total || 
        0
      );
      console.log(`💰 ${txn.party_name || txn.partyName || 'Unknown'} (${txn.type || 'no-type'}): ₹${amount}`);
      return sum + amount;
    }, 0);
    
    console.log('💵 TOTAL REVENUE:', totalRevenue);
    
    const totalTransactions = filteredTransactions.length;
    
    // Calculate pending amount
    const pendingAmount = filteredTransactions.reduce((sum, txn) => {
      const pending = parseFloat(
        txn.balance || 
        txn.due_amount || 
        txn.dueAmount || 
        0
      );
      return sum + pending;
    }, 0);
    
    console.log('⏳ PENDING AMOUNT:', pendingAmount);
    
    const paidAmount = totalRevenue - pendingAmount;
    console.log('✅ PAID AMOUNT:', paidAmount);
    
    // FIX: Use correct type filtering with fallback
    const creditTransactions = filteredTransactions.filter(txn => {
      const type = (txn.type || 'credit').toLowerCase();
      return type === 'credit';
    });
    
    console.log('📈 CREDIT Transactions:', creditTransactions.length, creditTransactions.map(t => ({
      name: t.party_name || t.partyName,
      amount: t.total_amount || t.totalAmount || t.amount,
      type: t.type
    })));
    
    const totalCredit = creditTransactions.reduce((sum, txn) => {
      const amount = parseFloat(
        txn.total_amount || 
        txn.totalAmount || 
        txn.amount || 
        txn.total || 
        0
      );
      return sum + amount;
    }, 0);
    
    console.log('📈 TOTAL CREDIT:', totalCredit);
    
    const debitTransactions = filteredTransactions.filter(txn => {
      const type = (txn.type || 'credit').toLowerCase();
      return type === 'debit';
    });
    
    console.log('📉 DEBIT Transactions:', debitTransactions.length, debitTransactions.map(t => ({
      name: t.party_name || t.partyName,
      amount: t.total_amount || t.totalAmount || t.amount,
      type: t.type
    })));
    
    const totalDebit = debitTransactions.reduce((sum, txn) => {
      const amount = parseFloat(
        txn.total_amount || 
        txn.totalAmount || 
        txn.amount || 
        txn.total || 
        0
      );
      return sum + amount;
    }, 0);
    
    console.log('📉 TOTAL DEBIT:', totalDebit);

    const calculatedStats = {
      totalRevenue,
      totalTransactions,
      totalCredit,
      totalDebit,
      pendingAmount,
      paidAmount,
      paidTransactions: filteredTransactions.filter(t => t.status === 'PAID').length,
      unpaidTransactions: filteredTransactions.filter(t => t.status === 'UNPAID').length
    };

    console.log('📊 FINAL STATS:', calculatedStats);

    return calculatedStats;
  }, [transactions, timeRange]);

  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    
    const filteredTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.date || txn.created_at);
      
      if (timeRange === 'day') {
        return txnDate.toDateString() === now.toDateString();
      } else if (timeRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return txnDate >= weekAgo;
      } else if (timeRange === 'month') {
        return txnDate.getMonth() === now.getMonth() && 
               txnDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last7Days.push({
        day: days[date.getDay()],
        date: date.toDateString(),
        amount: 0,
        count: 0
      });
    }

    if (filteredTransactions && filteredTransactions.length > 0) {
      filteredTransactions.forEach((txn) => {
        const txnDate = new Date(txn.date || txn.created_at);
        const matchingDay = last7Days.find(d => d.date === txnDate.toDateString());
        if (matchingDay) {
          const amount = parseFloat(
            txn.total_amount || 
            txn.totalAmount || 
            txn.amount || 
            txn.total || 
            0
          );
          matchingDay.amount += amount;
          matchingDay.count += 1;
        }
      });
    }

    console.log('📊 Chart Data:', last7Days);
    return last7Days;
  }, [transactions, timeRange]);

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Real-time analytics from your transactions</p>
        </div>

        <div className="flex items-center space-x-3 mb-8">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === 'day'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Time
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
              <div className="flex items-center space-x-1 text-green-300">
                <ArrowUpRight className="w-5 h-5" />
                <span className="font-semibold">+12%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold mb-2">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs opacity-75">{stats.totalTransactions} transactions</p>
          </div>

          {/* Total Credit */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="flex items-center space-x-1 text-green-300">
                <ArrowUpRight className="w-5 h-5" />
                <span className="font-semibold">+8%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Credit</h3>
            <p className="text-3xl font-bold mb-2">{formatCurrency(stats.totalCredit)}</p>
            <p className="text-xs opacity-75">Incoming transactions</p>
          </div>

          {/* Total Debit */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <TrendingDown className="w-8 h-8" />
              </div>
              <div className="flex items-center space-x-1 text-red-300">
                <ArrowDownRight className="w-5 h-5" />
                <span className="font-semibold">-5%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Debit</h3>
            <p className="text-3xl font-bold mb-2">{formatCurrency(stats.totalDebit)}</p>
            <p className="text-xs opacity-75">Outgoing transactions</p>
          </div>

          {/* Pending Amount */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="flex items-center space-x-1 text-red-300">
                <ArrowDownRight className="w-5 h-5" />
                <span className="font-semibold">-5%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Pending Amount</h3>
            <p className="text-3xl font-bold mb-2">{formatCurrency(stats.pendingAmount)}</p>
            <p className="text-xs opacity-75">to be collected</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Revenue Trend</h3>
                <p className="text-sm text-gray-500">Last 7 days transaction overview</p>
              </div>
              <Activity className="w-6 h-6 text-blue-600" />
            </div>

            <div className="relative h-64">
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                <span>{formatCurrency(maxAmount)}</span>
                <span>{formatCurrency(Math.floor(maxAmount * 0.75))}</span>
                <span>{formatCurrency(Math.floor(maxAmount * 0.5))}</span>
                <span>{formatCurrency(Math.floor(maxAmount * 0.25))}</span>
                <span>₹0.00</span>
              </div>

              <div className="ml-16 h-full pb-8 relative">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-gray-100"></div>
                  ))}
                </div>

                {chartData.some(d => d.amount > 0) ? (
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <path
                      d={chartData.map((point, i) => {
                        const x = (i / (chartData.length - 1)) * 100;
                        const y = 100 - (point.amount / maxAmount) * 100;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />

                    <path
                      d={`
                        ${chartData.map((point, i) => {
                          const x = (i / (chartData.length - 1)) * 100;
                          const y = 100 - (point.amount / maxAmount) * 100;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        L 100 100
                        L 0 100
                        Z
                      `}
                      fill="url(#areaGradient)"
                    />

                    {chartData.map((point, i) => {
                      const x = (i / (chartData.length - 1)) * 100;
                      const y = 100 - (point.amount / maxAmount) * 100;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="2"
                          fill="white"
                          stroke="#3B82F6"
                          strokeWidth="1"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No data to display</p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 font-medium">
                  {chartData.map((point, i) => (
                    <div key={i} className="text-center">
                      <div>{point.day}</div>
                      <div className="text-blue-600 text-xs">{point.count > 0 ? `${point.count}` : '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-gray-500">Peak Day</p>
                <p className="text-lg font-bold text-gray-800">
                  {chartData.length > 0 ? chartData.reduce((max, d) => d.amount > max.amount ? d : max).day : '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Avg/Day</p>
                <p className="text-lg font-bold text-gray-800">
                  {formatCurrency(Math.floor(stats.totalRevenue / 7))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Days</p>
                <p className="text-lg font-bold text-gray-800">7</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Collection Rate</p>
                    <p className="text-lg font-bold text-gray-800">
                      {stats.totalRevenue > 0 ? Math.round((stats.paidAmount / stats.totalRevenue) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Paid Amount</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(stats.paidAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Avg. Transaction</p>
                    <p className="text-lg font-bold text-gray-800">
                      {formatCurrency(stats.totalTransactions > 0 ? Math.floor(stats.totalRevenue / stats.totalTransactions) : 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">This Week</p>
                    <p className="text-lg font-bold text-gray-800">{stats.totalTransactions}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;