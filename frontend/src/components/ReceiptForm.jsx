import { useState, useEffect, useRef } from 'react';

function ReceiptForm() {
  const [formData, setFormData] = useState({
    phone: '',
    fullName: '',
    service: '',
    amount: 5
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
   const [services] = useState([
     "X-Ray", "Teeth Cleaning", "Eye Examination", "Hormone Test"])
  //   "Blood Test", "Complete Blood Count", "Cholesterol Test", "Diabetes Test",
  //   "General Checkup", "Cardiac Checkup", "Eye Examination", "ENT Checkup",
  //   "Vaccination", "Flu Shot", "COVID-19 Vaccine", "Travel Vaccination",
  //   "X-Ray", "Chest X-Ray", "Bone X-Ray", "Dental X-Ray",
  //   "Ultrasound", "Abdominal Ultrasound", "Pregnancy Ultrasound", "Thyroid Ultrasound",
  //   "Consultation", "General Consultation", "Specialist Consultation", "Follow-up Visit",
  //   "Minor Surgery", "Stitch Removal", "Wound Dressing", "Biopsy",
  //   "Physical Therapy", "Rehabilitation", "Massage Therapy", "Exercise Therapy",
  //   "Laboratory Test", "Urine Test", "Stool Test", "Hormone Test",
  //   "Emergency Care", "First Aid", "Emergency Consultation", "Emergency Treatment"
  // ]);
  const [receiptData, setReceiptData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch customer suggestions when phone input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.phone.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      try {
        const response = await fetch(`/api/receipts?phone=${formData.phone}`);
        const data = await response.json();
        setSuggestions(data);
        
        if (data.length > 0) {
          setShowDropdown(true);
          setIsNewCustomer(false);
        } else {
          setShowDropdown(false);
          setIsNewCustomer(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.phone]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      phone: value,
      fullName: ''
    }));
  };

  // Handle service selection
  const handleServiceChange = (e) => {
    setFormData(prev => ({
      ...prev,
      service: e.target.value
    }));
  };

  // Handle selecting existing customer
  const handleSelectExisting = (receipt) => {
    setFormData(prev => ({
      ...prev,
      phone: receipt.phone,
      fullName: receipt.fullName
    }));
    setShowDropdown(false);
    setIsNewCustomer(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const result = await response.json();
        setReceiptData(result);
        setShowSuccess(true);
      } else {
        throw new Error('Failed to create receipt');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating receipt');
    } finally {
      setLoading(false);
    }
  };

  // Handle download as Word
  const handleDownloadWordSimple = () => {
    if (!receiptData) return;

    const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Receipt ${receiptData.receiptNumber}</title>
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
      font-size: 12px; /* small for thermal */
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
    <h3>No: ${receiptData.receiptNumber}</h3>
  </div>
  
  <div class="receipt-info">
    <div class="receipt-row">
      <strong>Date:</strong> <span>${new Date().toLocaleDateString()}</span>
    </div>
    <div class="receipt-row">
      <strong>Ref No:</strong> <span>${receiptData.refNo}</span>
    </div>
    <div class="receipt-row">
      <strong>Name:</strong> <span>${receiptData.fullName}</span>
    </div>
    <div class="receipt-row">
      <strong>Phone:</strong> <span>${receiptData.phone}</span>
    </div>
    <div class="receipt-row">
      <strong>Service:</strong> <span>${receiptData.service}</span>
    </div>
    <div class="receipt-row">
      <strong>Amount:</strong> <span>$${receiptData.amount}</span>
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
    a.download = `receipt-${receiptData.receiptNumber}.doc`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Handle create another receipt
  const handleCreateAnother = () => {
    setFormData({ phone: '', fullName: '', service: '', amount: 5 });
    setReceiptData(null);
    setShowSuccess(false);
    setIsNewCustomer(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-4 px-4">
      <div className=" bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-4 px-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Farahoz Hospital</h1>
              <p className="text-blue-100 text-sm mt-1">Mogadishu, Somalia</p>
            </div>
            <div className="bg-white rounded-full p-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Create New Receipt</h2>
          <p className="text-gray-600 text-sm mb-6">Fill in patient details</p>
          
          {!showSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Input with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number..."
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <div className="absolute right-3 top-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                    <div className="p-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">
                        Existing Patients
                      </div>
                      {suggestions.map((receipt, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm"
                          onClick={() => handleSelectExisting(receipt)}
                        >
                          <div>
                            <div className="font-medium text-gray-900">{receipt.fullName}</div>
                            <div className="text-xs text-gray-500">{receipt.phone}</div>
                          </div>
                          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {isNewCustomer && formData.phone.length >= 2 && (
                  <div className="mt-1 flex items-center text-green-600 text-xs">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    New patient - enter full name
                  </div>
                )}
              </div>

              {/* Full Name Input */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter patient's full name..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <div className="absolute right-3 top-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Service Dropdown */}
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Service *
                </label>
                <div className="relative">
                  <select
                    id="service"
                    value={formData.service}
                    onChange={handleServiceChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
                  >
                    <option value="">Select a medical service</option>
                    {services.map((service, index) => (
                      <option key={index} value={service}>{service}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                   readOnly/>
                  <div className="absolute right-3 top-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-cyan-700 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Generate Receipt
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success View */
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Receipt Created!</h3>
                <p className="text-gray-600 text-sm">
                  Receipt <span className="font-semibold text-blue-600">#{receiptData?.receiptNumber}</span> for <span className="font-semibold">{receiptData?.fullName}</span>
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <h4 className="text-base font-semibold text-gray-800 mb-3 text-left">Receipt Details:</h4>
                <div className="space-y-2 text-left text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Ref No:</span>
                    <span className="font-medium">{receiptData?.refNo}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{receiptData?.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{receiptData?.phone}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{receiptData?.service}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-green-600">${receiptData?.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDownloadWordSimple}
                  className="flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Word
                </button>
                <button
                  onClick={handleCreateAnother}
                  className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReceiptForm;