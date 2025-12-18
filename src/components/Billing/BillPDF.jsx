import React from 'react';

// This component would typically take bill data as props
// and render it in a format suitable for PDF generation.
// Libraries like 'jsPDF' or 'react-to-print' would be used here.

const BillPDF = ({ billData }) => {
  if (!billData) {
    return <div className="p-4 text-center text-gray-600">No bill data to display.</div>;
  }

  // Example minimal rendering for a PDF-like output
  return (
    <div className="p-8 bg-white border border-gray-300 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
        <p className="text-lg text-gray-600">Bill Number: {billData.billNumber || 'N/A'}</p>
        <p className="text-sm text-gray-500">Date: {new Date(billData.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Bill To:</h2>
          <p className="text-gray-700">{billData.customer?.name}</p>
          <p className="text-gray-600">{billData.customer?.address}</p>
          <p className="text-gray-600">{billData.customer?.email}</p>
          <p className="text-gray-600">{billData.customer?.phone}</p>
        </div>
        <div>
          {/* Assuming company profile exists in the user context or fetched */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">From:</h2>
          <p className="text-gray-700">Your Company Name</p> {/* Replace with actual company data */}
          <p className="text-gray-600">Your Company Address</p>
          <p className="text-gray-600">Your Company Email</p>
          <p className="text-gray-600">Your Company Phone</p>
        </div>
      </div>

      <div className="mb-8">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Item</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Qty</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Rate (₹)</th>
              <th className="py-2 px-4 border-b text-right text-sm font-semibold text-gray-700">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {billData.items && billData.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 px-4 text-sm text-gray-800">{item.name}</td>
                <td className="py-2 px-4 text-sm text-gray-800">{item.quantity}</td>
                <td className="py-2 px-4 text-sm text-gray-800">₹{item.rate.toFixed(2)}</td>
                <td className="py-2 px-4 text-right text-sm text-gray-800">₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary section - positioned after items table */}
      <div className="flex justify-end mt-6">
        <div className="w-full max-w-xs bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span>Subtotal:</span>
            <span>₹{billData.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>GST ({billData.taxType}):</span>
            <span>₹{billData.taxAmount?.toFixed(2)}</span>
          </div>
          {billData.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Discount ({billData.discountType === 'percentage' ? `${billData.discountValue}%` : 'Fixed'}):</span>
              <span>-₹{billData.discountAmount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2 text-gray-900">
            <span>Total Amount:</span>
            <span>₹{billData.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bank Details section - positioned after summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-600 mb-3">Bank Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Bank:</span>
              <span className="text-gray-600">State Bank Of India</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Account Name:</span>
              <span className="text-gray-600">KETAN S PATEL</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Account No:</span>
              <span className="text-gray-600">20464367337</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">IFSC:</span>
              <span className="text-gray-600">SBIN0018625</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Branch:</span>
              <span className="text-gray-600">Airport Road, Bhat</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">UPI:</span>
              <span className="text-gray-600">9998275301@pthdfc</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
              <span className="text-xs text-gray-500">QR Code</span>
            </div>
            <p className="text-xs text-gray-500">Scan to pay</p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-8">Thank you for your business!</p>
    </div>
  );
};

export default BillPDF;