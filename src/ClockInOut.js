import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ClockInOut = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    return storedUser || {};
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (user._id) {
      axios.get(`/api/users/${user._id}`)
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [user._id]);

  const handleClockIn = async () => {
    if (!isClockedIn) {
      const currentTime = new Date();
      const response = await axios.put(`/api/users/${user._id}/clockin`, { time: currentTime });
      const updatedUser = response.data;
      setUser(updatedUser);
      setIsClockedIn(true);

      setUser(prevUser => {
        const newUser = { ...prevUser };
        newUser.clockEntries = newUser.clockEntries || [];
        newUser.clockEntries.push({ date: currentTime, clockIn: currentTime, clockOut: null });
        return newUser;
      });
    }
  };

  const handleClockOut = async () => {
    if (isClockedIn) {
      const currentTime = new Date();
      const response = await axios.put(`/api/users/${user._id}/clockout`, { time: currentTime });
      const updatedUser = response.data;
      setUser(updatedUser);
      setIsClockedIn(false);

      setUser(prevUser => {
        const newUser = { ...prevUser };
        newUser.clockEntries = newUser.clockEntries.map(entry => {
          if (new Date(entry.date).setHours(0, 0, 0, 0) === new Date(currentTime).setHours(0, 0, 0, 0)) {
            return { ...entry, clockOut: currentTime };
          }
          return entry;
        });
        return newUser;
      });
    }
  };

  const groupEntriesByDay = () => {
    const groupedEntries = {};
    user.clockEntries.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString();
      if (!groupedEntries[date]) {
        groupedEntries[date] = [];
      }
      groupedEntries[date].push(entry);
    });
    return groupedEntries;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString();
  };

  const handleEdit = (date) => {
    setSelectedDay(date);
    setShowModal(true);
  };

  const handleSave = (clockIn, clockOut) => {
    // Implement the logic to save the edited time entries
    console.log('Saving edited time entries:', clockIn, clockOut);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="clock-in-out-container">
      <h1 className="status">{isClockedIn ? 'Clocked In' : 'Clocked Out'}</h1>
      <div className="button-container">
        <button className="clock-button" onClick={handleClockIn} disabled={isClockedIn}>
          Clock In
        </button>
        <button className="clock-button" onClick={handleClockOut} disabled={!isClockedIn}>
          Clock Out
        </button>
      </div>

      <div className="entries-grid">
        {Object.entries(groupEntriesByDay()).map(([date, entries]) => (
          <div className="day-entries" key={date}>
            <h3>{date}</h3>
            <div className="entry-item">
              <div className="entry-type">Clock In: </div>
              <div className="entry-time">{formatDate(entries.find(entry => entry.type === 'Clock In')?.time)}</div>
            </div>
            <div className="entry-item">
              <div className="entry-type">Clock Out:</div>
              <div className="entry-time">{formatDate(entries.find(entry => entry.type === 'Clock Out')?.time)}</div>
            </div>
            <button className="edit-button" onClick={() => handleEdit(new Date(date))}>
              <span role="img" aria-label="edit">✏️</span>
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Time Entries for {selectedDay.toLocaleDateString()}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSave(e.target.clockIn.value, e.target.clockOut.value);
            }}>
              <div>
                <label>Clock In:</label>
                <DatePicker
                  selected={selectedDay}
                  onChange={(date) => setSelectedDay(date)}
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
                  selected={selectedDay}
                  onChange={(date) => setSelectedDay(date)}
                  showTimeSelect
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  name="clockOut"
                />
              </div>
              <div>
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
