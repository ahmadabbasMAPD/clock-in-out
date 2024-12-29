import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ClockInOut = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleClockIn = () => {
    if (!isClockedIn) {
      const currentTime = new Date();
      setTimeEntries([...timeEntries, { type: 'Clock In', time: currentTime, editable: false }]);
      setIsClockedIn(true);
    }
  };

  const handleClockOut = () => {
    if (isClockedIn) {
      const currentTime = new Date();
      setTimeEntries([...timeEntries, { type: 'Clock Out', time: currentTime, editable: false }]);
      setIsClockedIn(false);
    }
  };

  const handleEdit = (day) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  const handleSave = (clockInTime, clockOutTime) => {
    const editedEntries = [...timeEntries];
    const dayEntries = editedEntries.filter(entry => 
      new Date(entry.time).toLocaleDateString() === new Date(selectedDay).toLocaleDateString()
    );
    
    dayEntries.forEach(entry => {
      if (entry.type === 'Clock In') {
        entry.time = new Date(clockInTime);
      } else if (entry.type === 'Clock Out') {
        entry.time = new Date(clockOutTime);
      }
    });

    setTimeEntries(editedEntries);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid date';
    }
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

  const groupEntriesByDay = () => {
    const groupedEntries = {};
    timeEntries.forEach(entry => {
      const date = new Date(entry.time).toLocaleDateString();
      if (!groupedEntries[date]) {
        groupedEntries[date] = [];
      }
      groupedEntries[date].push(entry);
    });
    return groupedEntries;
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
```
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
```
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
