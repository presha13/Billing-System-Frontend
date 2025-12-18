import React from 'react';
import { Edit, Trash2, Clock, MapPin, Phone, DollarSign, FileText } from 'lucide-react';

const EventList = ({ events, onEdit, onDelete, selectedDate }) => {
  const formatTime = (time) => {
    if (!time) return '';
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      Hall: 'bg-blue-100 text-blue-800',
      Decoration: 'bg-purple-100 text-purple-800',
      Catering: 'bg-green-100 text-green-800',
      Photography: 'bg-pink-100 text-pink-800',
      Music: 'bg-yellow-100 text-yellow-800',
      Other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.Other;
  };

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        <p>Select a date from the calendar to view events</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No events scheduled</h3>
        <p className="text-gray-500">There are no events scheduled for {formatDate(selectedDate)}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Events for {formatDate(selectedDate)}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
        </p>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {event.eventName}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(
                      event.eventType
                    )}`}
                  >
                    {event.eventType}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {event.clientName}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(event)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title="Edit event"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete(event._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete event"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span>{event.clientPhone}</span>
              </div>

              <div className="flex items-start gap-2 md:col-span-2">
                <MapPin size={16} className="text-gray-400 mt-0.5" />
                <span>{event.clientAddress}</span>
              </div>

              {event.advancePayment > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-400" />
                  <span className="font-medium text-green-600">
                    Advance: ₹{event.advancePayment.toLocaleString()}
                  </span>
                </div>
              )}

              {event.notes && (
                <div className="md:col-span-2 mt-2 pt-2 border-t border-gray-100">
                  <p className="text-gray-600">
                    <span className="font-medium">Notes:</span> {event.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;

