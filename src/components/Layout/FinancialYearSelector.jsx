import React, { useState } from 'react';
import { Calendar, ChevronDown, Settings, Plus } from 'lucide-react';
import { useFinancialYear } from '../../contexts/FinancialYearContext.jsx';

const FinancialYearSelector = () => {
  const {
    currentFinancialYear,
    financialYears,
    loading,
    switchFinancialYear
  } = useFinancialYear();

  const [isOpen, setIsOpen] = useState(false);

  const handleYearSelect = async (yearId) => {
    try {
      await switchFinancialYear(yearId);
      setIsOpen(false);
    } catch (error) {
      console.error('Error switching financial year:', error);
    }
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (startYear === endYear) {
      return `${startYear}-${String(endYear + 1).slice(-2)}`;
    }
    return `${startYear}-${endYear}`;
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Calendar size={16} className="text-gray-500" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!currentFinancialYear) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Calendar size={16} className="text-yellow-600" />
        <span className="text-sm text-yellow-700">No FY Selected</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Calendar size={16} className="text-indigo-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentFinancialYear.displayName || currentFinancialYear.name}
        </span>
        <span className="text-xs text-gray-500">
          ({formatDateRange(currentFinancialYear.startDate, currentFinancialYear.endDate)})
        </span>
        <ChevronDown size={14} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Financial Years
            </div>
            <div className="max-h-48 overflow-y-auto">
              {financialYears.map((year) => (
                <button
                  key={year._id}
                  onClick={() => handleYearSelect(year._id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    year._id === currentFinancialYear._id
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{year.displayName || year.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatDateRange(year.startDate, year.endDate)}
                      </div>
                    </div>
                    {year.isDefault && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => {
                // TODO: Open financial year management modal
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            >
              <Settings size={14} />
              <span>Manage Financial Years</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FinancialYearSelector;