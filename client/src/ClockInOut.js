// src/ClockInOut.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
//import './ClockInOut.css';

const ClockInOut = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(''); // global errors (if needed)
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState(''); // errors specific to the edit modal
  const [editDate, setEditDate] = useState(null);
  const [editClockIn, setEditClockIn] = useState(new Date());
  const [editClockOut, setEditClockOut] = useState(new Date());

  // Fetch the current user (including clockEntries) from the server.
  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        return;
      }
      const response = await axios.get('/api/users/current-user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user status.');
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Handler for clock in using the server endpoint.
  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '/api/users/current-user/clock-in',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.user || response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to clock in.');
    }
  };

  // Handler for clock out using the server endpoint.
  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '/api/users/current-user/clock-out',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.user || response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to clock out.');
    }
  };

  // Group clock entries by day using the timestamp field.
  const groupEntriesByDay = () => {
    if (!user || !user.clockEntries) return {};
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

  // Open the edit modal for a given day.
  const handleEdit = (day) => {
    setEditDate(day);
    setModalError(''); // clear any previous modal errors
    const grouped = groupEntriesByDay();
    const dayKey = day.toLocaleDateString();
    const entries = grouped[dayKey] || [];
    const clockInEntry = entries.find(e => e.type === 'clockIn');
    const clockOutEntry = entries.find(e => e.type === 'clockOut');

    // If entries don't exist, set default times (e.g., 9 AM and 5 PM).
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
      const token = localStorage.getItem('token');
      const payload = {
        // Use the date portion in "YYYY-MM-DD" format.
        date: editDate.toISOString().split('T')[0],
        clockIn: editClockIn ? editClockIn.toISOString() : undefined,
        clockOut: editClockOut ? editClockOut.toISOString() : undefined,
      };

      const response = await axios.put(
        '/api/users/current-user/time-entries',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
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

  // Format a date into a human-readable string.
  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    }).format(date);
  };

  // Create an array of sorted grouped dates.
  const grouped = groupEntriesByDay();
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="clock-in-out-container">
      <h1 className="status">{user && user.clockedIn ? 'Clocked In' : 'Clocked Out'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="button-container">
        <button className="clock-button" onClick={handleClockIn} disabled={user && user.clockedIn}>
          Clock In
        </button>
        <button className="clock-button" onClick={handleClockOut} disabled={user && !user.clockedIn}>
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
              <div className="entry-time">{formatDate(grouped[date].find(e => e.type === 'clockIn')?.timestamp)}</div>
            </div>
            <div className="entry-item">
              <div className="entry-type">Clock Out:</div>
              <div className="entry-time">{formatDate(grouped[date].find(e => e.type === 'clockOut')?.timestamp)}</div>
            </div>
            <button className="edit-button" onClick={() => handleEdit(new Date(date))}>
              <span role="img" aria-label="edit">✏️</span>
            </button>
          </div>
        ))}
      </div>
      {/* Section to display all time entries */}
      <div className="all-entries">
        <h2>All Time Entries</h2>
        {user && user.clockEntries && user.clockEntries.length > 0 ? (
          <ul>
            {user.clockEntries
              .slice()
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              .map((entry, index) => (
                <li key={index}>
                  {entry.type === 'clockIn' ? 'Clock In' : 'Clock Out'} at {formatDate(entry.timestamp)}
                </li>
              ))}
          </ul>
        ) : (
          <p>No time entries available.</p>
        )}
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
