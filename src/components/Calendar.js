// src/components/Calendar.js
import React, { useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';
import './Calendar.css';

const CalendarWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

function CustomCalendar({ onSelectEvent, onDoubleClickDay, activeStartDate, selectedDate, setSelectedDate, events, onDateClick, onActiveStartDateChange }) {
  const calendarRef = useRef(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const event = events.find(event => new Date(event.date).toDateString() === date.toDateString());
    onSelectEvent(event || { title: 'No event', date: date, description: '' });
  };

  const handleDoubleClick = (date) => {
    onDoubleClickDay(date);
  };

  const handleTileDoubleClick = (dateString, event) => {
    event.preventDefault();
    
    // Parse the date string and set it to noon in the local timezone
    const [month, day, year] = dateString.split(' ');
    const date = new Date(year, getMonthIndex(month), parseInt(day), 12, 0, 0);
    
    handleDoubleClick(date);
  };
  
  // Helper function to get month index
  const getMonthIndex = (monthName) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasEvent = events.some(event => 
        new Date(event.startDate).toDateString() === date.toDateString()
      );
      if (hasEvent) {
        return <div className="event-dot"></div>;
      }
    }
    return null;
  };

  useEffect(() => {
    const tiles = calendarRef.current.querySelectorAll('.react-calendar__tile');
    tiles.forEach(tile => {
      const dateString = tile.querySelector('abbr').getAttribute('aria-label');
      tile.addEventListener('dblclick', (event) => handleTileDoubleClick(dateString, event));
    });

    return () => {
      tiles.forEach(tile => {
        const dateString = tile.querySelector('abbr').getAttribute('aria-label');
        tile.removeEventListener('dblclick', (event) => handleTileDoubleClick(dateString, event));
      });
    };
  }, [selectedDate, activeStartDate, events]);

  return (
    <CalendarWrapper ref={calendarRef}>
      <Calendar
        onClickDay={(date) => {
          handleDateChange(date);
          onDateClick(date);
        }}
        tileContent={tileContent}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={onActiveStartDateChange}
        value={selectedDate}
      />
    </CalendarWrapper>
  );
}

export default CustomCalendar;