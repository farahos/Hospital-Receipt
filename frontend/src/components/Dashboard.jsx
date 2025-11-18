import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("today");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    monthAmount: 0,
    monthReceipts: 0,
    todayAmount: 0,
    todayReceipts: 0
  });

  const fetchReceipts = async () => {
    try {
      const res = await axios.get("/api/receipts/all");
      const sortedReceipts = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReceipts(sortedReceipts);
      filterReceipts(sortedReceipts, activeFilter);
      calculateStats(sortedReceipts);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const filterReceipts = (receiptsData, filterType) => {
    const now = new Date();
    const today = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let filtered = [];
    
    switch (filterType) {
      case "today":
        filtered = receiptsData.filter(receipt => 
          new Date(receipt.date).toDateString() === today
        );
        break;
      case "month":
        filtered = receiptsData.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.getMonth() === currentMonth && 
                 receiptDate.getFullYear() === currentYear;
        });
        break;
      case "all":
      default:
        filtered = receiptsData;
        break;
    }
    
    setFilteredReceipts(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
    filterReceipts(receipts, filterType);
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReceipts = filteredReceipts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const calculateStats = (receiptsData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthData = receiptsData.filter(receipt => {
        const receiptDate = new Date(receipt.date);
        return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
    });

    const monthAmount = monthData.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0);
    const monthReceipts = monthData.length;

    const today = now.toDateString();
    const todayData = receiptsData.filter(receipt => 
        new Date(receipt.date).toDateString() === today
    );

    const todayAmount = todayData.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0);
    const todayReceipts = todayData.length;

    setStats({
      monthAmount,
      monthReceipts,
      todayAmount,
      todayReceipts
    });
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // Function to download receipt as Word document
  const downloadReceiptWord = (receipt) => {
    const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Receipt ${receipt.receiptNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }

    body {
      font-family: Arial, sans-serif;
      width: 80mm;
      margin: 0;
      padding: 5px;
      font-size: 12px;
    }

    .header {
      text-align: center;
      margin-bottom: 10px;
    }

    .receipt-info {
      margin-bottom: 10px;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      padding-bottom: 3px;
      border-bottom: 1px dotted #999;
    }

    .footer {
      margin-top: 15px;
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="header">
    <h2>Farahoz Hospital</h2>
    <p>Mogadishu Somalia</p>
    <h3>No: ${receipt.receiptNumber}</h3>
  </div>
  
  <div class="receipt-info">
    <div class="receipt-row">
      <strong>Date:</strong> <span>${new Date(receipt.date).toLocaleDateString()}</span>
    </div>
    <div class="receipt-row">
      <strong>Ref No:</strong> <span>${receipt.refNo}</span>
    </div>
    <div class="receipt-row">
      <strong>Name:</strong> <span>${receipt.fullName}</span>
    </div>
    <div class="receipt-row">
      <strong>Phone:</strong> <span>${receipt.phone}</span>
    </div>
    <div class="receipt-row">
      <strong>Service:</strong> <span>${receipt.service}</span>
    </div>
    <div class="receipt-row">
      <strong>Amount:</strong> <span>$${receipt.amount}</span>
    </div>
  </div>
  
  <div class="footer">
    <p>Thank you!</p>
  </div>
</body>
</html>
`;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `receipt-${receipt.receiptNumber}.doc`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Farahoz Hospital Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage and view all receipts and financial data</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${stats.monthAmount.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Receipts Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Receipts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.monthReceipts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Revenue Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${stats.todayAmount.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Receipts Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Receipts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.todayReceipts}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Receipts Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Receipts</h2>
              
              {/* Filter Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange("today")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeFilter === "today" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleFilterChange("month")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeFilter === "month" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeFilter === "all" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All Receipts
                </button>
              </div>
            </div>
            
            <button 
              onClick={fetchReceipts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          {/* Active Filter Info */}
          <div className="mt-2 text-sm text-gray-600">
            {activeFilter === "today" && `Showing ${filteredReceipts.length} receipts from today`}
            {activeFilter === "month" && `Showing ${filteredReceipts.length} receipts from this month`}
            {activeFilter === "all" && `Showing all ${filteredReceipts.length} receipts`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {currentReceipts.map((receipt, index) => (
                <tr key={receipt._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{receipt.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{receipt.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${receipt.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{receipt.receiptNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => downloadReceiptWord(receipt)}
                      className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200"
                      title="Download as Word document"
                    >
                      {receipt.refNo}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(receipt.date).toLocaleDateString()} at {new Date(receipt.date).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredReceipts.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No receipts found</h3>
            <p className="mt-2 text-gray-500">No receipts available for the selected filter.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredReceipts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredReceipts.length)}
              </span>{" "}
              of <span className="font-medium">{filteredReceipts.length}</span> receipts
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;