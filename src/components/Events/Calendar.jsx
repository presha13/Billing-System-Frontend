import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import apiService from '../../services/api.js';
import Select from '../common/Select.jsx';
import { FinancialYearContext } from '../../contexts/FinancialYearContext.jsx';

const Calendar = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [datesWithEvents, setDatesWithEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentFinancialYear } = useContext(FinancialYearContext);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Sync calendar view with currentFinancialYear when context changes
  useEffect(() => {
    if (currentFinancialYear) {
      const startDate = new Date(currentFinancialYear.startDate);
      setCurrentDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    }
  }, [currentFinancialYear]);

  // Fetch dates with events for the current month view
  useEffect(() => {
    const fetchEventDates = async () => {
      setLoading(true);
      try {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const response = await apiService.getEventDates(
          startDateStr, 
          endDateStr, 
          currentFinancialYear?._id
        );
        setDatesWithEvents(response.dates || []);
      } catch (error) {
        console.error('Failed to fetch event dates:', error);
        setDatesWithEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentFinancialYear) {
      fetchEventDates();
    }
  }, [year, month, currentFinancialYear]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    onDateSelect(clickedDate);
  };

  const formatDateKey = (day) => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const hasEvent = (day) => {
    return datesWithEvents.includes(formatDateKey(day));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    yearOptions.push({ value: y.toString(), label: y.toString() });
  }

  // Generate month options
  const monthOptions = monthNames.map((name, index) => ({
    value: index.toString(),
    label: name
  }));

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate(new Date(newYear, month, 1));
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setCurrentDate(new Date(year, newMonth, 1));
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays = [];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push({ day, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ day, isCurrentMonth: true });
  }

  // Next month days (to fill the grid)
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({ day, isCurrentMonth: false });
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={month.toString()}
              onChange={handleMonthChange}
              options={monthOptions}
              className="w-32"
            />
            <Select
              value={year.toString()}
              onChange={handleYearChange}
              options={yearOptions}
              className="w-24"
            />
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Today
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ day, isCurrentMonth }, index) => {
          const dateKey = isCurrentMonth ? formatDateKey(day) : null;
          const dayHasEvent = isCurrentMonth && hasEvent(day);
          const dayIsToday = isCurrentMonth && isToday(day);
          const dayIsSelected = isCurrentMonth && isSelected(day);

          return (
            <button
              key={index}
              onClick={() => isCurrentMonth && handleDateClick(day)}
              disabled={!isCurrentMonth}
              className={`
                relative p-2 h-12 rounded-lg transition-all
                ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                ${dayIsSelected ? 'bg-indigo-600 text-white font-semibold' : ''}
                ${dayIsToday && !dayIsSelected ? 'bg-indigo-100 text-indigo-700 font-semibold' : ''}
                ${!dayIsSelected && !dayIsToday && isCurrentMonth ? 'text-gray-700' : ''}
              `}
            >
              <span>{day}</span>
              {dayHasEvent && (
                <span
                  className={`
                    absolute bottom-1 left-1/2 transform -translate-x-1/2
                    w-1.5 h-1.5 rounded-full
                    ${dayIsSelected ? 'bg-white' : 'bg-indigo-600'}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
          <span>Has events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-100 border-2 border-indigo-600"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

