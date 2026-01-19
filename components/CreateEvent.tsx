'use client';

import Image from 'next/image';
import { useState, ChangeEvent, FormEvent } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface CreateEventFormData {
  title: string;
  description: string;
  overview: string;
  image: File | null;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

interface CreateEventProps {
  onSubmit?: (formData: CreateEventFormData) => Promise<void>;
  isLoading?: boolean;
}

const eventModeOptions = ['online', 'offline', 'hybrid'] as const;

const CreateEvent = ({ onSubmit }: CreateEventProps) => {
  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    description: '',
    overview: '',
    image: null,
    venue: '',
    location: '',
    date: '',
    time: '',
    mode: 'offline',
    audience: '',
    agenda: [],
    organizer: '',
    tags: [],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState<string>('');
  const [agendaInput, setAgendaInput] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<keyof CreateEventFormData, string>>>({});

  const [isLoading,setIsLoading] = useState<boolean>(false);

  // Handle text inputs
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof CreateEventFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle image upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle tag input
  const handleTagInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // Add tag
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  // Handle agenda input
  const handleAgendaInput = (e: ChangeEvent<HTMLInputElement>) => {
    setAgendaInput(e.target.value);
  };

  // Add agenda item
  const handleAddAgenda = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && agendaInput.trim()) {
      e.preventDefault();
      if (!formData.agenda.includes(agendaInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          agenda: [...prev.agenda, agendaInput.trim()],
        }));
      }
      setAgendaInput('');
    }
  };

  // Remove agenda item
  const handleRemoveAgenda = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateEventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      newErrors.description = 'Event description is required and should be at least 10 characters long';
    }
    if (!formData.overview.trim() || formData.overview.length < 10) {
      newErrors.overview = 'Event overview is required and should be at least 10 characters long';
    }
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Event time is required';
    }
    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.mode) {
      newErrors.mode = 'Event mode is required';
    }
    if (!formData.audience.trim()) {
      newErrors.audience = 'Target audience is required';
    }
    if (formData.agenda.length === 0) {
      newErrors.agenda = 'At least one agenda item is required';
    }
    if (!formData.organizer.trim()) {
      newErrors.organizer = 'Organizer name is required';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
      setIsLoading(true);
      try {
        const formDataToSend = new FormData();
        for (const key in formData) {
          if (key === 'image' && formData.image) {
            formDataToSend.append(key, formData.image);
          } else if (key === 'agenda' || key === 'tags') {
            // Send arrays as JSON strings
            formDataToSend.append(key, JSON.stringify(formData[key as keyof CreateEventFormData]));
          } else if (!Array.isArray(formData[key as keyof CreateEventFormData])) {
            formDataToSend.append(key, String(formData[key as keyof CreateEventFormData]));
          }
        }
        const response = await fetch(`${BASE_URL}/api/events`,{
          method: 'POST',
          body: formDataToSend,
        })

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Error creating event:', data.message || data.error);
          alert(`Error: ${data.message || 'Failed to create event'}`);
          return;
        }
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          overview: '',
          image: null,
          venue: '',
          location: '',
          date: '',
          time: '',
          mode: 'offline',
          audience: '',
          agenda: [],
          organizer: '',
          tags: [],
        });
        setImagePreview(null);
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('An unexpected error occurred. Please try again.');
      }
      finally{
        setIsLoading(false);
      }
    
  };

  return (
    <div className="min-h-screen bg-linear-to-b  from-slate-900 via-slate-900 to-slate-800 py-8 px-4 sm:px-6 lg:px-8 rounded-2xl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Create an Event</h1>
          <p className="text-gray-400 text-sm">Fill in the details below to create a new event</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                errors.title ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Event Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Event Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the event"
              rows={4}
              className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Event Overview */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Event Overview</label>
            <textarea
              name="overview"
              value={formData.overview}
              onChange={handleInputChange}
              placeholder="Brief overview of the event"
              rows={3}
              className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 resize-none ${
                errors.overview ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.overview && (
              <p className="text-red-500 text-xs mt-1">{errors.overview}</p>
            )}
          </div>

          {/* Grid for Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Date */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Event Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pl-10 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                    errors.date ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                <Image
                  src="/icons/calendar.svg"
                  alt="calendar"
                  width={18}
                  height={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
              </div>
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            {/* Event Time */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Event Time</label>
              <div className="relative">
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pl-10 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                    errors.time ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                <Image
                  src="/icons/clock.svg"
                  alt="clock"
                  width={18}
                  height={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
              </div>
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Grid for Venue and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Venue */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Venue</label>
              <div className="relative">
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="Enter venue or online link"
                  className={`w-full px-4 py-3 pl-10 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                    errors.venue ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                <Image
                  src="/icons/pin.svg"
                  alt="location"
                  width={18}
                  height={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
              </div>
              {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Location</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location/city"
                  className={`w-full px-4 py-3 pl-10 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                    errors.location ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                <Image
                  src="/icons/pin.svg"
                  alt="location"
                  width={18}
                  height={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
              </div>
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* Grid for Event Mode and Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Mode */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Event Mode</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                  errors.mode ? 'border-red-500' : 'border-gray-700'
                }`}
              >
                {eventModeOptions.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </option>
                ))}
              </select>
              {errors.mode && <p className="text-red-500 text-xs mt-1">{errors.mode}</p>}
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Target Audience</label>
              <input
                type="text"
                name="audience"
                value={formData.audience}
                onChange={handleInputChange}
                placeholder="e.g., Developers, Designers, Managers"
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                  errors.audience ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {errors.audience && (
                <p className="text-red-500 text-xs mt-1">{errors.audience}</p>
              )}
            </div>
          </div>

          {/* Organizer */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Organizer Name</label>
            <input
              type="text"
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              placeholder="Enter organizer name"
              className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ${
                errors.organizer ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.organizer && (
              <p className="text-red-500 text-xs mt-1">{errors.organizer}</p>
            )}
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Event Agenda</label>
            <input
              type="text"
              value={agendaInput}
              onChange={handleAgendaInput}
              onKeyPress={handleAddAgenda}
              placeholder="Add agenda items (press Enter to add)"
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
            />
            {/* Agenda Items Display */}
            {formData.agenda.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {formData.agenda.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 bg-slate-700 border border-gray-600 rounded"
                  >
                    <span className="text-sm text-white">
                      {index + 1}. {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAgenda(index)}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.agenda && <p className="text-red-500 text-xs mt-1">{errors.agenda}</p>}
          </div>

          {/* Event Image / Banner */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Event Image / Banner
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full px-4 py-8 bg-slate-800 border border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 hover:bg-slate-700 transition-all duration-200"
              >
                <div className="text-center">
                  {imagePreview ? (
                    <div className="relative w-full h-32">
                      <Image
                        src={imagePreview}
                        alt="preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div>
                      <Image
                        src="/icons/upload.svg"
                        alt="upload"
                        width={32}
                        height={32}
                        className="mx-auto mb-2 opacity-50 "
                      />
                      <p className="text-gray-400 text-sm">Upload event image or banner</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Tags</label>
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInput}
              onKeyPress={handleAddTag}
              placeholder="Add tags such as react, next, js (press Enter to add)"
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
            />
            {/* Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-cyan-400 bg-opacity-20 border border-cyan-400 rounded-full"
                  >
                    <span className="text-sm text-cyan-400">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-cyan-400 text-gray-900 font-semibold rounded-lg hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Saving Event...
                </>
              ) : (
                'Save Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
