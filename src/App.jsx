import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Filter, BarChart3, Calendar, CreditCard, Tag, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ExpenseManager = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    categories: [],
    paymentModes: []
  });

   useEffect(() => {
    fetch('http://localhost:5000/api/expenses') // Replace with your actual backend URL
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }
        return response.json();
      })
      .then(data => {
        console.log("expense data:", data)
        setExpenses(data); // Set the fetched expenses in state
      })
      .catch(error => {
        console.error('Error fetching expenses:', error);
      });
  }, []);
  // Categories and Payment Modes
  const categories = ['Rental', 'Groceries', 'Entertainment', 'Travel', 'Others'];
  const paymentModes = ['UPI', 'Credit Card', 'Net Banking', 'Cash'];
  const dateRanges = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'last90', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  // Add Expense Form Component
  const AddExpenseForm = () => {
    const [formData, setFormData] = useState({
      amount: '',
      category: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: ''
    });

    const handleSubmit = () => {
  if (!formData.amount || !formData.category || !formData.paymentMode) {
    alert('Please fill in all required fields');
    return;
  }

  const newExpense = {
    ...formData,
    amount: parseFloat(formData.amount),
    date: new Date(formData.date)  // Ensure date is in Date format
  };

  fetch('http://localhost:5000/api/expenses/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newExpense)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add expense');
      }
      return response.json();
    })
    .then(data => {
      setExpenses(prev => [...prev, data]); // Push the response from backend
      setFormData({
        amount: '',
        category: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        paymentMode: ''
      });
      alert('Expense added successfully!');
    })
    .catch(error => {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    });
};

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <PlusCircle className="mr-2 text-blue-600" />
            Add New Expense
          </h2>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border  text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  max={new Date().toISOString().split('T')[0]}  // Prevents future dates
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode *
                </label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select payment mode</option>
                  {paymentModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a description (optional)"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Filter expenses based on selected filters
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Date filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'thisMonth':
          cutoffDate.setDate(1);
          break;
        case 'last30':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case 'last90':
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(expense => new Date(expense.date) >= cutoffDate);
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(expense => filters.categories.includes(expense.category));
    }

    // Payment mode filter
    if (filters.paymentModes.length > 0) {
      filtered = filtered.filter(expense => filters.paymentModes.includes(expense.paymentMode));
    }
    console.log("Filtered: ", filtered)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, filters]);

  // View Expenses Component
  const ViewExpenses = () => {
    const handleFilterChange = (type, value) => {
      if (type === 'dateRange') {
        setFilters(prev => ({...prev, dateRange: value}));
      } else if (type === 'category') {
        setFilters(prev => ({
          ...prev,
          categories: prev.categories.includes(value)
            ? prev.categories.filter(c => c !== value)
            : [...prev.categories, value]
        }));
      } else if (type === 'paymentMode') {
        setFilters(prev => ({
          ...prev,
          paymentModes: prev.paymentModes.includes(value)
            ? prev.paymentModes.filter(p => p !== value)
            : [...prev.paymentModes, value]
        }));
      }
    };

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FileText className="mr-2 text-green-600" />
            Expense List
          </h2>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleFilterChange('category', category)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filters.categories.includes(category)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Modes</label>
                <div className="flex flex-wrap gap-2">
                  {paymentModes.map(mode => (
                    <button
                      key={mode}
                      onClick={() => handleFilterChange('paymentMode', mode)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filters.paymentModes.includes(mode)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">
                Total Expenses: {filteredExpenses.length}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Expense List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredExpenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expenses found matching your filters.</p>
            ) : (
              filteredExpenses.map((expense, i) => (
                <div key={expense?._id??i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-2xl font-bold text-gray-800">₹{expense.amount.toLocaleString('en-IN')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.category === 'Rental' ? 'bg-purple-100 text-purple-800' :
                          expense.category === 'Groceries' ? 'bg-green-100 text-green-800' :
                          expense.category === 'Entertainment' ? 'bg-pink-100 text-pink-800' :
                          expense.category === 'Travel' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {expense.category}
                        </span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          {expense.paymentMode}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(expense.date).toLocaleDateString('en-IN')}
                          </span>
                          {expense.notes && (
                            <span className="flex items-center">
                              <Tag className="w-4 h-4 mr-1" />
                              {expense.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Analytics Component
  const Analytics = () => {
    const analyticsData = useMemo(() => {
      const monthlyData = {};
      
      expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthLabel,
            Rental: 0,
            Groceries: 0,
            Entertainment: 0,
            Travel: 0,
            Others: 0
          };
        }
        
        monthlyData[monthKey][expense.category] += expense.amount;
      });
      
      return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    }, [expenses]);

    const categoryColors = {
      Rental: '#8b5cf6',
      Groceries: '#10b981',
      Entertainment: '#f59e0b',
      Travel: '#3b82f6',
      Others: '#6b7280'
    };

    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <BarChart3 className="mr-2 text-purple-600" />
            Expense Analytics
          </h2>

          {analyticsData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available for analytics. Add some expenses first!</p>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  {categories.map(category => (
                    <Bar 
                      key={category} 
                      dataKey={category} 
                      stackId="expenses" 
                      fill={categoryColors[category]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Expense Manager</h1>
          <p className="text-gray-600">Track and analyze your expenses efficiently</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex">
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Add Expense
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'view'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              View Expenses
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'add' && <AddExpenseForm />}
        {activeTab === 'view' && <ViewExpenses />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </div>
  );
};

export default ExpenseManager;