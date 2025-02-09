// src/ClockInOut.js
import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ClockInOut.css';
import api from './api';

const ClockInOut = () => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    return storedUser || {};
  });
  const [isClockedIn, setIsClockedIn] = useState(user.clockedIn || false);
  const [error, setError] = useState('');
  
  // Modal state for editing today's entries
  const [showModal, setShowModal] = useState(false);
  const [editDate, setEditDate] = useState(null); // The day being edited
  const [editClockIn, setEditClockIn] = useState(new Date());
  const [editClockOut, setEditClockOut] = useState(new Date());
  const [modalError, setModalError] = useState('');

  // Fetch the current user (including clockEntries) from the server
  const fetchUser = useCallback(async () => {
    try {
      if (user._id) {
        const response = await api.get(`/api/users/current-user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(response.data);
        setIsClockedIn(response.data.clockedIn);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data.');
    }
  }, [user._id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Handler for Clock In: call the server endpoint and update user state.
  const handleClockIn = async () => {
    if (!isClockedIn && user._id) {
      try {
        const currentTime = new Date();
        const response = await api.put(
          `/api/users/${user._id}/clockin`,
          { time: currentTime },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setUser(response.data);
        setIsClockedIn(true);
      } catch (err) {
        console.error('Clock In error:', err);
        setError('Failed to clock in.');
      }
    }
  };

  // Handler for Clock Out: call the server endpoint and update user state.
  const handleClockOut = async () => {
    if (isClockedIn && user._id) {
      try {
        const currentTime = new Date();
        const response = await api.put(
          `/api/users/${user._id}/clockout`,
          { time: currentTime },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setUser(response.data);
        setIsClockedIn(false);
      } catch (err) {
        console.error('Clock Out error:', err);
        setError('Failed to clock out.');
      }
    }
  };

  // Group clock entries by day using the timestamp field.
  const groupEntriesByDay = () => {
    if (!user.clockEntries) return {};
    const grouped = {};
    user.clockEntries.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      const dateKey = entryDate.toLocaleDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    return grouped;
  };

  // Helper: Format a date to display only the time.
  const formatTime = (dateInput) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleTimeString();
  };

  // Open the edit modal for a given day.
  const handleEdit = (day) => {
    setModalError('');
    setEditDate(day);
    const grouped = groupEntriesByDay();
    const dayKey = day.toLocaleDateString();
    const entries = grouped[dayKey] || [];
    const clockInEntry = entries.find(e => e.type.toLowerCase() === 'clockin');
    const clockOutEntry = entries.find(e => e.type.toLowerCase() === 'clockout');

    // If no entries exist for that day, show an error message and do not open the modal.
    if (!clockInEntry && !clockOutEntry) {
      setModalError('No existing time entries for this day to edit.');
      return;
    }

    // Set default times: use existing times if available; otherwise, default to 9 AM and 5 PM.
    const defaultClockIn = new Date(day);
    defaultClockIn.setHours(9, 0, 0, 0);
    const defaultClockOut = new Date(day);
    defaultClockOut.setHours(17, 0, 0, 0);

    setEditClockIn(clockInEntry ? new Date(clockInEntry.timestamp) : defaultClockIn);
    setEditClockOut(clockOutEntry ? new Date(clockOutEntry.timestamp) : defaultClockOut);
    setShowModal(true);
  };

  // Save the edited time entries by calling the server endpoint.
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !editDate) return;
    try {
      const payload = {
        // Use the date portion in "YYYY-MM-DD" format.
        date: editDate.toISOString().split('T')[0],
        clockIn: editClockIn ? editClockIn.toISOString() : undefined,
        clockOut: editClockOut ? editClockOut.toISOString() : undefined,
      };

      const response = await api.put(
        '/api/users/current-user/time-entries',
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUser(response.data.user || response.data);
      setShowModal(false);
      setModalError('');
    } catch (err) {
      console.error('Error updating time entries:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update time entries.';
      setModalError(errorMsg);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError('');
  };

  // Get grouped entries and sort the dates.
  const grouped = groupEntriesByDay();
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="clock-in-out-container">
      <h1 className="status">{isClockedIn ? 'Clocked In' : 'Clocked Out'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="button-container">
        <button className="clock-button" onClick={handleClockIn} disabled={isClockedIn}>
          Clock In
        </button>
        <button className="clock-button" onClick={handleClockOut} disabled={!isClockedIn}>
          Clock Out
        </button>
      </div>

      {/* Grouped view of time entries */}
      <div className="entries-grid">
        {sortedDates.map(date => (
          <div className="day-entries" key={date}>
            <h3>{date}</h3>
            <div className="entry-item">
              <div className="entry-type">Clock In:</div>
              <div className="entry-time">
                {formatTime(grouped[date].find(e => e.type.toLowerCase() === 'clockin')?.timestamp)}
              </div>
            </div>
            <div className="entry-item">
              <div className="entry-type">Clock Out:</div>
              <div className="entry-time">
                {formatTime(grouped[date].find(e => e.type.toLowerCase() === 'clockout')?.timestamp)}
              </div>
            </div>
            <button className="edit-button" onClick={() => handleEdit(new Date(date))}>
              <span role="img" aria-label="edit">✏️</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Time Entries for {editDate.toLocaleDateString()}</h2>
            {modalError && <p className="modal-error" style={{ color: 'red' }}>{modalError}</p>}
            <form onSubmit={handleSave}>
              <div>
                <label>Clock In:</label>
                <DatePicker
                  selected={editClockIn}
                  onChange={(date) => setEditClockIn(date)}
                  showTimeSelect
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  name="clockIn"
                />
              </div>
              <div>
                <label>Clock Out:</label>
                <DatePicker
                  selected={editClockOut}
                  onChange={(date) => setEditClockOut(date)}
                  showTimeSelect
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  name="clockOut"
                />
              </div>
              <div className="modal-buttons">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={handleCloseModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClockInOut;
