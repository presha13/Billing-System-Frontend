import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';

const FinancialYearContext = createContext();

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error('useFinancialYear must be used within a FinancialYearProvider');
  }
  return context;
};

export const FinancialYearProvider = ({ children }) => {
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load financial years for the user
  const loadFinancialYears = async () => {
    try {
      setLoading(true);
      const years = await apiService.getFinancialYears();
      
      // Sort by creation date (newest first)
      const sortedYears = years.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFinancialYears(sortedYears);

      // Priority logic for initial year
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overlappingYear = sortedYears.find(year => {
        const start = new Date(year.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(year.endDate);
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
      });

      const savedYearId = localStorage.getItem('currentFinancialYear');
      const savedYear = savedYearId ? sortedYears.find(y => y._id === savedYearId) : null;
      
      const defaultYearFromDb = sortedYears.find(year => year.isDefault);
      const activeYear = sortedYears.find(year => year.isActive);
      const newestYear = sortedYears.length > 0 ? sortedYears[0] : null;

      // New Priority Logic (Sticky User Preference):
      // 1. Saved User Choice (localStorage)
      // 2. Overlapping Year (Today's date)
      // 3. Database Default
      // 4. Active Flag
      // 5. Newest available
      if (savedYear) {
        setCurrentFinancialYear(savedYear);
      } else if (overlappingYear) {
        setCurrentFinancialYear(overlappingYear);
        localStorage.setItem('currentFinancialYear', overlappingYear._id);
        
        // Sync DB default if overlapping year is the clear current choice
        if (!overlappingYear.isDefault) {
          apiService.setDefaultFinancialYear(overlappingYear._id).catch(console.error);
        }
      } else if (defaultYearFromDb) {
        setCurrentFinancialYear(defaultYearFromDb);
      } else if (activeYear) {
        setCurrentFinancialYear(activeYear);
      } else if (newestYear) {
        setCurrentFinancialYear(newestYear);
      }

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load financial years');
      console.error('Error loading financial years:', err);
    } finally {
      setLoading(false);
    }
  };

  // Switch to a different financial year
  const switchFinancialYear = async (yearId) => {
    try {
      const year = financialYears.find(y => y._id === yearId);
      if (year) {
        setCurrentFinancialYear(year);
        // Optionally persist the selection
        localStorage.setItem('currentFinancialYear', yearId);
      }
    } catch (err) {
      setError('Failed to switch financial year');
      console.error('Error switching financial year:', err);
    }
  };

  // Create a new financial year
  const createFinancialYear = async (yearData) => {
    try {
      const newYear = await apiService.createFinancialYear(yearData);
      setFinancialYears(prev => [...prev, newYear]);
      return newYear;
    } catch (err) {
      setError('Failed to create financial year');
      throw err;
    }
  };

  // Update financial year
  const updateFinancialYear = async (yearId, updates) => {
    try {
      const updatedYear = await apiService.updateFinancialYear(yearId, updates);
      setFinancialYears(prev => prev.map(year =>
        year._id === yearId ? updatedYear : year
      ));

      // Update current year if it was modified
      if (currentFinancialYear && currentFinancialYear._id === yearId) {
        setCurrentFinancialYear(updatedYear);
      }

      return updatedYear;
    } catch (err) {
      setError('Failed to update financial year');
      throw err;
    }
  };

  // Delete financial year
  const deleteFinancialYear = async (yearId) => {
    try {
      await apiService.deleteFinancialYear(yearId);
      setFinancialYears(prev => prev.filter(year => year._id !== yearId));

      // If deleted year was current, switch to another
      if (currentFinancialYear && currentFinancialYear._id === yearId) {
        const remainingYears = financialYears.filter(year => year._id !== yearId);
        if (remainingYears.length > 0) {
          setCurrentFinancialYear(remainingYears[0]);
        } else {
          setCurrentFinancialYear(null);
        }
      }
    } catch (err) {
      setError('Failed to delete financial year');
      throw err;
    }
  };

  // Get current financial year ID (for API calls)
  const getCurrentFinancialYearId = () => {
    return currentFinancialYear?._id || null;
  };

  // Check if a date falls within current financial year
  const isDateInCurrentFinancialYear = (date) => {
    if (!currentFinancialYear || !date) return false;
    const checkDate = new Date(date);
    const startDate = new Date(currentFinancialYear.startDate);
    const endDate = new Date(currentFinancialYear.endDate);
    return checkDate >= startDate && checkDate <= endDate;
  };

  // Auto-determine financial year for a given date
  const getFinancialYearForDate = (date) => {
    if (!date) return currentFinancialYear;
    const checkDate = new Date(date);
    return financialYears.find(year => {
      const startDate = new Date(year.startDate);
      const endDate = new Date(year.endDate);
      return checkDate >= startDate && checkDate <= endDate;
    }) || currentFinancialYear;
  };

  useEffect(() => {
    loadFinancialYears();
  }, []);



  const value = {
    currentFinancialYear,
    financialYears,
    loading,
    error,
    loadFinancialYears,
    switchFinancialYear,
    createFinancialYear,
    updateFinancialYear,
    deleteFinancialYear,
    getCurrentFinancialYearId,
    isDateInCurrentFinancialYear,
    getFinancialYearForDate
  };

  return (
    <FinancialYearContext.Provider value={value}>
      {children}
    </FinancialYearContext.Provider>
  );
};

export { FinancialYearContext };