import React, { useState } from 'react';

const ClockInOut = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);

  const handleClockIn = () => {
    if (!isClockedIn) {
      const currentTime = new Date().toLocaleString();
      setTimeEntries([...timeEntries, { type: 'Clock In', time: currentTime }]);
      setIsClockedIn(true);
    }
  };

  const handleClockOut = () => {
    if (isClockedIn) {
      const currentTime = new Date().toLocaleString();
      setTimeEntries([...timeEntries, { type: 'Clock Out', time: currentTime }]);
      setIsClockedIn(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>{isClockedIn ? 'Clocked In' : 'Clocked Out'}</h1>
      <button onClick={handleClockIn} disabled={isClockedIn}>
        Clock In
      </button>
      <button onClick={handleClockOut} disabled={!isClockedIn}>
        Clock Out
      </button>

      <h2>Time Entries</h2>
      <ul>
        {timeEntries.map((entry, index) => (
          <li key={index}>
            {entry.type} at {entry.time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClockInOut;