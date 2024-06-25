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
      const event = events.find(event => {
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);
  
        // Strip the time component by setting hours, minutes, seconds, and milliseconds to zero
        eventStartDate.setHours(0, 0, 0, 0);
        eventEndDate.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
  
        return date >= eventStartDate && date <= eventEndDate;
      });
  
      if (event) {
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);
  
        eventStartDate.setHours(0, 0, 0, 0);
        eventEndDate.setHours(0, 0, 0, 0);
  
        if (eventStartDate.getTime() === eventEndDate.getTime()) {
          // Single-day event
          return <div className="event-dot"></div>;
        } else if (date.getTime() === eventStartDate.getTime()) {
          return <div className="event-start"></div>;
        } else if (date.getTime() === eventEndDate.getTime()) {
          return <div className="event-end"></div>;
        } else {
          return <div className="event-middle"></div>;
        }
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