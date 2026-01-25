import React, { useState, useMemo } from 'react';
import { Plus, X, DollarSign, TrendingUp, Calendar, Tag, Download, Upload, PieChart, BarChart3, Filter, Search, Receipt, Percent, AlertCircle, FileText, Clock } from 'lucide-react';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterTaxDeductible, setFilterTaxDeductible] = useState('all');
  const [filterTravelRelated, setFilterTravelRelated] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
    taxDeductible: false,
    travelRelated: false,
    notes: '',
    paymentMethod: 'Cash',
    vendor: '',
    receiptUrl: '',
    tags: ''
  });

  const [budgetForm, setBudgetForm] = useState({
    category: '',
    monthlyLimit: ''
  });

  const [recurringForm, setRecurringForm] = useState({
    description: '',
    amount: '',
    category: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    taxDeductible: false
  });

  const categories = [
    'Transportation',
    'Accommodation',
    'Meals & Dining',
    'Office Supplies',
    'Professional Services',
    'Entertainment',
    'Utilities',
    'Marketing',
    'Software & Subscriptions',
    'Insurance',
    'Taxes',
    'Equipment',
    'Training & Education',
    'Healthcare',
    'Maintenance',
    'Other'
  ];

  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Check', 'Other'];

  const handleSubmit = () => {
    if (formData.date && formData.description && formData.amount && formData.category) {
      const newExpense = {
        ...formData,
        id: Date.now(),
        amount: parseFloat(formData.amount),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        createdAt: new Date().toISOString()
      };
      setExpenses([...expenses, newExpense]);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category: '',
        taxDeductible: false,
        travelRelated: false,
        notes: '',
        paymentMethod: 'Cash',
        vendor: '',
        receiptUrl: '',
        tags: ''
      });
      setShowForm(false);
    }
  };

  const handleBudgetSubmit = () => {
    if (budgetForm.category && budgetForm.monthlyLimit) {
      setBudgets({
        ...budgets,
        [budgetForm.category]: parseFloat(budgetForm.monthlyLimit)
      });
      setBudgetForm({ category: '', monthlyLimit: '' });
      setShowBudgetForm(false);
    }
  };

  const handleRecurringSubmit = () => {
    if (recurringForm.description && recurringForm.amount && recurringForm.category) {
      setRecurringExpenses([...recurringExpenses, {
        ...recurringForm,
        id: Date.now(),
        amount: parseFloat(recurringForm.amount)
      }]);
      setRecurringForm({
        description: '',
        amount: '',
        category: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        taxDeductible: false
      });
      setShowRecurringForm(false);
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const deleteBudget = (category) => {
    const newBudgets = { ...budgets };
    delete newBudgets[category];
    setBudgets(newBudgets);
  };

  const deleteRecurring = (id) => {
    setRecurringExpenses(recurringExpenses.filter(exp => exp.id !== id));
  };

  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(exp => {
      const categoryMatch = filterCategory === 'all' || exp.category === filterCategory;
      const monthMatch = filterMonth === 'all' || exp.date.substring(0, 7) === filterMonth;
      const searchMatch = searchTerm === '' || 
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const taxMatch = filterTaxDeductible === 'all' || 
        (filterTaxDeductible === 'yes' && exp.taxDeductible) ||
        (filterTaxDeductible === 'no' && !exp.taxDeductible);
      const travelMatch = filterTravelRelated === 'all' ||
        (filterTravelRelated === 'yes' && exp.travelRelated) ||
        (filterTravelRelated === 'no' && !exp.travelRelated);
      
      return categoryMatch && monthMatch && searchMatch && taxMatch && travelMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date-desc': return new Date(b.date) - new Date(a.date);
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc': return a.amount - b.amount;
        case 'category': return a.category.localeCompare(b.category);
        default: return 0;
      }
    });

    return filtered;
  }, [expenses, filterCategory, filterMonth, searchTerm, filterTaxDeductible, filterTravelRelated, sortBy]);

  const summary = useMemo(() => {
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const taxDeductible = filteredExpenses.filter(exp => exp.taxDeductible).reduce((sum, exp) => sum + exp.amount, 0);
    const travelCosts = filteredExpenses.filter(exp => exp.travelRelated).reduce((sum, exp) => sum + exp.amount, 0);
    
    const byCategory = {};
    const byPaymentMethod = {};
    const byMonth = {};
    
    filteredExpenses.forEach(exp => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
      byPaymentMethod[exp.paymentMethod] = (byPaymentMethod[exp.paymentMethod] || 0) + exp.amount;
      const month = exp.date.substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + exp.amount;
    });

    const avgExpense = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;

    return { total, taxDeductible, travelCosts, byCategory, byPaymentMethod, byMonth, avgExpense, count: filteredExpenses.length };
  }, [filteredExpenses]);

  const budgetStatus = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const status = {};
    
    Object.keys(budgets).forEach(category => {
      const spent = expenses
        .filter(exp => exp.category === category && exp.date.substring(0, 7) === currentMonth)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      status[category] = {
        limit: budgets[category],
        spent: spent,
        remaining: budgets[category] - spent,
        percentage: (spent / budgets[category]) * 100
      };
    });
    
    return status;
  }, [expenses, budgets]);

  const availableMonths = useMemo(() => {
    const months = new Set(expenses.map(exp => exp.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [expenses]);

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Tax Deductible', 'Travel Related', 'Payment Method', 'Vendor', 'Notes', 'Tags'];
    const rows = filteredExpenses.map(exp => [
      exp.date,
      exp.description,
      exp.category,
      exp.amount,
      exp.taxDeductible ? 'Yes' : 'No',
      exp.travelRelated ? 'Yes' : 'No',
      exp.paymentMethod,
      exp.vendor,
      exp.notes,
      exp.tags.join(';')
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToJSON = () => {
    const data = {
      expenses: filteredExpenses,
      budgets,
      recurringExpenses,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Expense Tracker</h1>
              <p className="text-gray-600">Complete financial management and tax tracking solution</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
              >
                {showForm ? <X size={20} /> : <Plus size={20} />}
                Add Expense
              </button>
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
              >
                <Download size={20} />
                CSV
              </button>
              <button
                onClick={exportToJSON}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
              >
                <Download size={20} />
                JSON
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 font-medium transition ${activeTab === 'expenses' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <Receipt className="inline mr-2" size={18} />
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium transition ${activeTab === 'analytics' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <BarChart3 className="inline mr-2" size={18} />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`px-4 py-2 font-medium transition ${activeTab === 'budgets' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <Percent className="inline mr-2" size={18} />
              Budgets
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`px-4 py-2 font-medium transition ${activeTab === 'recurring' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <Clock className="inline mr-2" size={18} />
              Recurring
            </button>
          </div>
        </div>

        {/* Add Expense Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Expense</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Supplier</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Vendor name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="business, urgent, client"
                />
              </div>
              <div className="md:col-span-3 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.taxDeductible}
                    onChange={(e) => setFormData({ ...formData, taxDeductible: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Tax Deductible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.travelRelated}
                    onChange={(e) => setFormData({ ...formData, travelRelated: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Travel Related</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Save Expense
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={24} />
                  <h3 className="text-sm font-medium">Total Expenses</h3>
                </div>
                <p className="text-3xl font-bold">${summary.total.toFixed(2)}</p>
                <p className="text-xs mt-1 opacity-90">{summary.count} transactions</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={24} />
                  <h3 className="text-sm font-medium">Tax Deductible</h3>
                </div>
                <p className="text-3xl font-bold">${summary.taxDeductible.toFixed(2)}</p>
                <p className="text-xs mt-1 opacity-90">{((summary.taxDeductible/summary.total)*100 || 0).toFixed(1)}% of total</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={24} />
                  <h3 className="text-sm font-medium">Travel Costs</h3>
                </div>
                <p className="text-3xl font-bold">${summary.travelCosts.toFixed(2)}</p>
                <p className="text-xs mt-1 opacity-90">{((summary.travelCosts/summary.total)*100 || 0).toFixed(1)}% of total</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={24} />
                  <h3 className="text-sm font-medium">Average Expense</h3>
                </div>
                <p className="text-3xl font-bold">${summary.avgExpense.toFixed(2)}</p>
                <p className="text-xs mt-1 opacity-90">Per transaction</p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Filters & Search</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Search expenses..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Months</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>
                        {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="date-desc">Date (Newest First)</option>
                    <option value="date-asc">Date (Oldest First)</option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Deductible</label>
                  <select
                    value={filterTaxDeductible}
                    onChange={(e) => setFilterTaxDeductible(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Travel Related</label>
                  <select
                    value={filterTravelRelated}
                    onChange={(e) => setFilterTravelRelated(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">All Expenses</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tags</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                          <Receipt size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No expenses found</p>
                          <p className="text-sm mt-1">Add your first expense to get started!</p>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {new Date(exp.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{exp.description}</div>
                            {exp.notes && <div className="text-xs text-gray-500 mt-1">{exp.notes}</div>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{exp.category}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{exp.vendor || '-'}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                            ${exp.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{exp.paymentMethod}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-center flex-wrap">
                              {exp.taxDeductible && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Tax</span>
                              )}
                              {exp.travelRelated && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Travel</span>
                              )}
                              {exp.tags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{tag}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => deleteExpense(exp.id)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <X size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
              {Object.keys(summary.byCategory).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(summary.byCategory)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, amount]) => {
                      const percentage = (amount / summary.total) * 100;
                      return (
                        <div key={category}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{category}</span>
                            <span className="text-sm font-semibold text-gray-900">${amount.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* Payment Method Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method Distribution</h3>
              {Object.keys(summary.byPaymentMethod).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(summary.byPaymentMethod).map(([method, amount]) => (
                    <div key={method} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">{method}</div>
                      <div className="text-xl font-bold text-gray-900">${amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">{((amount/summary.total)*100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Spending Trend</h3>
              {Object.keys(summary.byMonth).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(summary.byMonth)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([month, amount]) => (
                      <div key={month}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">${amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{width: `${(amount / Math.max(...Object.values(summary.byMonth))) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Monthly Budget Tracking</h3>
                <button
                  onClick={() => setShowBudgetForm(!showBudgetForm)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
                >
                  {showBudgetForm ? <X size={18} /> : <Plus size={18} />}
                  {showBudgetForm ? 'Cancel' : 'Set Budget'}
                </button>
              </div>

              {showBudgetForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={budgetForm.category}
                        onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit</label>
                      <input
                        type="number"
                        step="0.01"
                        value={budgetForm.monthlyLimit}
                        onChange={(e) => setBudgetForm({ ...budgetForm, monthlyLimit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleBudgetSubmit}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Set Budget
                  </button>
                </div>
              )}

              {Object.keys(budgetStatus).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(budgetStatus).map(([category, status]) => {
                    const isOverBudget = status.spent > status.limit;
                    const isNearLimit = status.percentage > 80 && status.percentage <= 100;
                    
                    return (
                      <div key={category} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{category}</h4>
                            <p className="text-sm text-gray-600">
                              ${status.spent.toFixed(2)} of ${status.limit.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isOverBudget && <AlertCircle size={20} className="text-red-500" />}
                            {isNearLimit && <AlertCircle size={20} className="text-yellow-500" />}
                            <button
                              onClick={() => deleteBudget(category)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              isOverBudget ? 'bg-red-600' : isNearLimit ? 'bg-yellow-500' : 'bg-green-600'
                            }`}
                            style={{width: `${Math.min(status.percentage, 100)}%`}}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={`font-medium ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                            {status.percentage.toFixed(1)}% used
                          </span>
                          <span className={`${status.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {status.remaining >= 0 ? `${status.remaining.toFixed(2)} remaining` : `${Math.abs(status.remaining).toFixed(2)} over budget`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Percent size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No budgets set</p>
                  <p className="text-sm mt-1">Set category budgets to track your spending limits</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recurring Expenses Tab */}
        {activeTab === 'recurring' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Recurring Expenses</h3>
              <button
                onClick={() => setShowRecurringForm(!showRecurringForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
              >
                {showRecurringForm ? <X size={18} /> : <Plus size={18} />}
                {showRecurringForm ? 'Cancel' : 'Add Recurring'}
              </button>
            </div>

            {showRecurringForm && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={recurringForm.description}
                      onChange={(e) => setRecurringForm({ ...recurringForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Office Rent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={recurringForm.amount}
                      onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={recurringForm.category}
                      onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={recurringForm.frequency}
                      onChange={(e) => setRecurringForm({ ...recurringForm, frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={recurringForm.startDate}
                      onChange={(e) => setRecurringForm({ ...recurringForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recurringForm.taxDeductible}
                        onChange={(e) => setRecurringForm({ ...recurringForm, taxDeductible: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Tax Deductible</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleRecurringSubmit}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Add Recurring Expense
                </button>
              </div>
            )}

            {recurringExpenses.length > 0 ? (
              <div className="space-y-4">
                {recurringExpenses.map(exp => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{exp.description}</h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <span><strong>Amount:</strong> ${exp.amount.toFixed(2)}</span>
                          <span><strong>Category:</strong> {exp.category}</span>
                          <span><strong>Frequency:</strong> {exp.frequency}</span>
                          <span><strong>Start Date:</strong> {new Date(exp.startDate).toLocaleDateString()}</span>
                        </div>
                        {exp.taxDeductible && (
                          <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Tax Deductible</span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteRecurring(exp.id)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No recurring expenses</p>
                <p className="text-sm mt-1">Add recurring expenses to track subscriptions and regular payments</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;