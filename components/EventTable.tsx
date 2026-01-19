'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface EventData {
  id: string;
  name: string;
  image: string;
  location: string;
  date: string;
  time: string;
  bookedSpots: number;
}

// Dummy data for testing - 10 events per page
const DUMMY_EVENTS: EventData[] = [
  {
    id: '1',
    name: 'GitHub Universe 2025',
    image: '/icons/logo.png',
    location: 'Zadar, Croatia',
    date: '13th September 2025',
    time: '12:25pm - 2:40pm',
    bookedSpots: 400,
  },
  {
    id: '2',
    name: 'Figma Config 2025',
    image: '/icons/logo.png',
    location: 'Lisbon, Portugal',
    date: '14th September 2025',
    time: '2:45pm - 4:00pm',
    bookedSpots: 1000,
  },
  {
    id: '3',
    name: 'TechCrunch Disrupt 2025',
    image: '/icons/logo.png',
    location: 'Cape Town, South Africa',
    date: '16th September 2025',
    time: '5:35pm - 7:00pm',
    bookedSpots: 460,
  },
  {
    id: '4',
    name: 'AWS re:Invent 2025',
    image: '/icons/logo.png',
    location: 'Sydney, Australia',
    date: '17th September 2025',
    time: '7:05pm - 8:30pm',
    bookedSpots: 1100,
  },
  {
    id: '5',
    name: 'Apple WWDC 2025',
    image: '/icons/logo.png',
    location: 'Vancouver, Canada',
    date: '19th September 2025',
    time: '10:05pm - 11:30pm',
    bookedSpots: 500,
  },
  {
    id: '6',
    name: 'Microsoft Build 2025',
    image: '/icons/logo.png',
    location: 'Rio de Janeiro, Brazil',
    date: '20th September 2025',
    time: '11:35pm - 1:00am',
    bookedSpots: 1200,
  },
  {
    id: '7',
    name: 'Google I/O 2025',
    image: '/icons/logo.png',
    location: 'Moscow, Russia',
    date: '22nd September 2025',
    time: '2:35am - 4:00am',
    bookedSpots: 350,
  },
  {
    id: '8',
    name: 'SXSW 2025',
    image: '/icons/logo.png',
    location: 'Berlin, Germany',
    date: '23rd September 2025',
    time: '4:05am - 5:30am',
    bookedSpots: 950,
  },
  {
    id: '9',
    name: 'Slack Frontiers 2025',
    image: '/icons/logo.png',
    location: 'Bangkok, Thailand',
    date: '25th September 2025',
    time: '7:05am - 8:30am',
    bookedSpots: 1300,
  },
  {
    id: '10',
    name: 'CES 2025',
    image: '/icons/logo.png',
    location: 'Dubai, UAE',
    date: '26th September 2025',
    time: '8:35am - 10:00am',
    bookedSpots: 700,
  },
];

interface EventTableProps {
  data?: EventData[];
  onEdit?: (event: EventData) => void;
  onDelete?: (eventId: string) => void;
  onAddNew?: () => void;
}

const EventTable = ({ data = DUMMY_EVENTS, onEdit, onDelete, onAddNew }: EventTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="grid gap-3 md:grid-cols-4">
        <h1 className="text-3xl font-bold text-white md:col-span-3 text-center md:text-left">Event Management</h1>
        <Link
          href="dashboard/events"
          onClick={(e) => {
            if (onAddNew) {
              e.preventDefault();
              onAddNew();
            }
          }}
          className="px-6 py-2 bg-cyan-400 text-gray-900 font-semibold rounded hover:bg-cyan-300 transition-colors duration-200 text-center"
        >
          Add New Event
        </Link>
      </div>

      {/* Horizontal scroll container for smaller screens */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-gray-700 bg-gray-900 bg-opacity-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap border-r border-gray-700">
                Events
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap border-r border-gray-700">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap border-r border-gray-700">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap border-r border-gray-700">
                Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap border-r border-gray-700">
                Booked spot
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-white whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {currentData.map((event, index) => (
              <tr
                key={event.id}
                className={`border-b border-gray-700 transition-colors hover:bg-gray-900 hover:bg-opacity-30 ${
                  index % 2 === 0 ? 'bg-gray-950 bg-opacity-40' : 'bg-transparent'
                }`}
              >
                {/* Events Column */}
                <td className="px-6 py-2 border-r border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink">
                      <Image
                        src={event.image}
                        alt={event.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <span className="text-sm text-white font-medium truncate max-w-xs">
                      {event.name}
                    </span>
                  </div>
                </td>

                {/* Location Column */}
                <td className="px-6 py-4 border-r border-gray-700">
                  <p className="text-sm text-gray-300 whitespace-nowrap">{event.location}</p>
                </td>

                {/* Date Column */}
                <td className="px-6 py-4 border-r border-gray-700">
                  <p className="text-sm text-gray-300 whitespace-nowrap">{event.date}</p>
                </td>

                {/* Time Column */}
                <td className="px-6 py-4 border-r border-gray-700">
                  <p className="text-sm text-gray-300 whitespace-nowrap">{event.time}</p>
                </td>

                {/* Booked Spots Column */}
                <td className="px-6 py-4 border-r border-gray-700">
                  <p className="text-sm font-semibold text-cyan-400 whitespace-nowrap">
                    {event.bookedSpots}
                  </p>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onEdit?.(event)}
                      className="text-xs font-semibold text-cyan-400 
                      hover:text-cyan-50 transition-colors duration-200 hover:bg-cyan-600 hover:bg-opacity-30 px-3 py-2 rounded-full cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(event.id)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-200 hover:bg-red-600 hover:bg-opacity-30 px-3 py-2 rounded-full cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400 text-sm">No events found</p>
        </div>
      )}

      {/* Pagination Controls */}
      {data.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="px-6 py-2 bg-gray-900 text-white font-semibold rounded border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-6 py-2 bg-gray-900 text-white font-semibold rounded border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EventTable;
