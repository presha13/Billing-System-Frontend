import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Select from '../common/Select.jsx';

const EventForm = ({ isOpen, onClose, onSave, event = null, selectedDate }) => {
    const [formData, setFormData] = useState({
        eventName: '',
        clientName: '',
        clientPhone: '',
        clientAddress: '',
        eventType: 'Hall',
        eventDate: '',
        startTime: '',
        endTime: '',
        advancePayment: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (event) {
            // Edit mode - populate form with event data
            const eventDate = new Date(event.eventDate);
            setFormData({
                eventName: event.eventName || '',
                clientName: event.clientName || '',
                clientPhone: event.clientPhone || '',
                clientAddress: event.clientAddress || '',
                eventType: event.eventType || 'Hall',
                eventDate: eventDate.toISOString().split('T')[0],
                startTime: event.startTime || '',
                endTime: event.endTime || '',
                advancePayment: event.advancePayment || '',
                notes: event.notes || ''
            });
        } else if (selectedDate) {
            // New event - set selected date
            const dateStr = selectedDate.toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                eventDate: dateStr
            }));
        }
    }, [event, selectedDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.eventName.trim()) {
            newErrors.eventName = 'Event name is required';
        }
        if (!formData.clientName.trim()) {
            newErrors.clientName = 'Client name is required';
        }
        if (!formData.clientPhone.trim()) {
            newErrors.clientPhone = 'Client phone is required';
        }
        if (!formData.clientAddress.trim()) {
            newErrors.clientAddress = 'Client address is required';
        }
        if (!formData.eventDate) {
            newErrors.eventDate = 'Event date is required';
        }
        if (!formData.startTime) {
            newErrors.startTime = 'Start time is required';
        }
        if (!formData.endTime) {
            newErrors.endTime = 'End time is required';
        }
        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
            newErrors.endTime = 'End time must be after start time';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const eventData = {
                ...formData,
                advancePayment: parseFloat(formData.advancePayment) || 0
            };

            await onSave(eventData);
            handleClose();
        } catch (error) {
            console.error('Failed to save event:', error);
            setErrors({ submit: error.message || 'Failed to save event' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            eventName: '',
            clientName: '',
            clientPhone: '',
            clientAddress: '',
            eventType: 'Hall',
            eventDate: '',
            startTime: '',
            endTime: '',
            advancePayment: '',
            notes: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    const eventTypes = ['Hall', 'Decoration', 'Catering', 'Photography', 'Music', 'Other'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {event ? 'Edit Event' : 'Add New Event'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {errors.submit}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Event Name *"
                                id="eventName"
                                name="eventName"
                                value={formData.eventName}
                                onChange={handleChange}
                                required
                                error={errors.eventName}
                            />
                        </div>

                        <div>
                            <Input
                                label="Client Name *"
                                id="clientName"
                                name="clientName"
                                value={formData.clientName}
                                onChange={handleChange}
                                required
                                error={errors.clientName}
                            />
                        </div>

                        <div>
                            <Input
                                label="Client Phone *"
                                id="clientPhone"
                                name="clientPhone"
                                type="tel"
                                value={formData.clientPhone}
                                onChange={handleChange}
                                required
                                error={errors.clientPhone}
                            />
                        </div>

                        <div>
                            <Input
                                label="Event Date *"
                                id="eventDate"
                                name="eventDate"
                                type="date"
                                value={formData.eventDate}
                                onChange={handleChange}
                                required
                                error={errors.eventDate}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Input
                                label="Client Address *"
                                id="clientAddress"
                                name="clientAddress"
                                value={formData.clientAddress}
                                onChange={handleChange}
                                required
                                error={errors.clientAddress}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Type *
                            </label>
                            <Select
                                value={formData.eventType}
                                onChange={(e) => {
                                    handleChange({ target: { name: 'eventType', value: e.target.value } });
                                }}
                                options={[
                                    { value: 'Hall', label: 'Hall' },
                                    { value: 'Decoration', label: 'Decoration' },
                                    { value: 'Catering', label: 'Catering' },
                                    { value: 'Photography', label: 'Photography' },
                                    { value: 'Music', label: 'Music' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Input
                                label="Start Time *"
                                id="startTime"
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                                error={errors.startTime}
                            />
                        </div>

                        <div>
                            <Input
                                label="End Time *"
                                id="endTime"
                                name="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                                error={errors.endTime}
                            />
                        </div>

                        <div>
                            <Input
                                label="Advance Payment"
                                id="advancePayment"
                                name="advancePayment"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.advancePayment}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Additional notes about the event..."
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button
                            type="button"
                            onClick={handleClose}
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventForm;

