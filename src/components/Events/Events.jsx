import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Calendar from './Calendar.jsx';
import EventList from './EventList.jsx';
import EventForm from './EventForm.jsx';
import AlertModal from '../common/AlertModal.jsx';
import Toast from '../common/Toast.jsx';
import apiService from '../../services/api.js';
import Button from '../common/Button.jsx';
import Loader from '../common/Loader.jsx';

const Events = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Alert modal state (only for confirmations)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    showCancel: true
  });

  // Toast state
  const [toast, setToast] = useState({
    isOpen: false,
    type: 'info',
    message: ''
  });

  useEffect(() => {
    if (selectedDate) {
      fetchEventsForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchEventsForDate = async (date) => {
    setLoading(true);
    setError('');
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await apiService.getAllEvents(dateStr);
      setEvents(response.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsFormOpen(false);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        // Update existing event
        await apiService.updateEvent(editingEvent._id, eventData);
      } else {
        // Create new event
        await apiService.createEvent(eventData);
      }

      // Refresh events list
      if (selectedDate) {
        await fetchEventsForDate(selectedDate);
      }

      // Close form on success
      handleCloseForm();

      // Show success toast
      setToast({
        isOpen: true,
        type: 'success',
        message: editingEvent
          ? 'Event updated successfully'
          : 'Event created successfully'
      });
    } catch (err) {
      console.error('Failed to save event:', err);
      // Show error toast
      setToast({
        isOpen: true,
        type: 'error',
        message: err.message || 'Failed to save event. Please try again.'
      });
      // Don't throw error - let the form stay open so user can retry
    }
  };

  const handleDeleteEvent = (eventId) => {
    setAlertModal({
      isOpen: true,
      type: 'warning',
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await apiService.deleteEvent(eventId);
          // Refresh events list
          if (selectedDate) {
            await fetchEventsForDate(selectedDate);
          }
          // Show success toast
          setToast({
            isOpen: true,
            type: 'success',
            message: 'Event deleted successfully'
          });
        } catch (err) {
          console.error('Failed to delete event:', err);
          // Show error toast
          setToast({
            isOpen: true,
            type: 'error',
            message: 'Failed to delete event. Please try again.'
          });
        }
      },
      showCancel: true
    });
  };

  const handleCloseAlert = () => {
    setAlertModal({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: null,
      showCancel: true
    });
  };

  const handleCloseToast = () => {
    setToast({
      isOpen: false,
      type: 'info',
      message: ''
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Event Calendar</h1>
          <p className="text-gray-600 mt-1">Manage your events and schedule</p>
        </div>
        <Button
          onClick={handleAddEvent}
          className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus size={20} />
          Add Event
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar */}
        <div className="lg:col-span-7">
          <Calendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
        </div>

        {/* Event List */}
        <div className="lg:col-span-5">
          {loading ? (
            <Loader message="Loading Events" size="small" />
          ) : (
            <EventList
              events={events}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              selectedDate={selectedDate}
            />
          )}
        </div>
      </div>

      {/* Event Form Modal */}
      <EventForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveEvent}
        event={editingEvent}
        selectedDate={selectedDate}
      />

      {/* Alert Modal - Only for delete confirmation */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={handleCloseAlert}
        onConfirm={alertModal.onConfirm}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        confirmText={alertModal.showCancel ? 'Confirm' : 'OK'}
        showCancel={alertModal.showCancel}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={handleCloseToast}
        type={toast.type}
        message={toast.message}
        duration={3000}
      />
    </div>
  );
};

export default Events;
