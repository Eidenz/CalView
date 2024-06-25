// src/components/EventList.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { format, isSameDay } from 'date-fns';

const ListContainer = styled.div`
  background-color: #1e1e1e;
  padding: 10px;
  height: 100%; /* Match the height of the calendar */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const EventsWrapper = styled.div`
  overflow-y: auto; /* Allow scrolling if the list is too long */
`;

const EventItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #333;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const EventTitle = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const EventDate = styled.div`
  font-size: 0.9rem;
  color: #ccc;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const PaginationButton = styled.button`
  background: none;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
  font-size: 1.5rem;

  &:disabled {
    color: #555;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: #3498db;
  }
`;

const PageCounter = styled.span`
  background-color: #444;
  color: white;
  padding: 4px 12px; /* Make the pill bigger */
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold; /* Make the text bold */
`;

const ITEMS_PER_PAGE = 5;

function EventList({ onSelectEvent, events }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const listContainerRef = useRef(null);

  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (listContainerRef.current) {
        const containerHeight = listContainerRef.current.clientHeight;
        const itemHeight = 60; // Approximate height of each event item
        const paginationHeight = 40; // Approximate height of pagination controls
        const availableHeight = containerHeight - paginationHeight;
        const items = Math.floor(availableHeight / itemHeight) - 2;
        setItemsPerPage(items);
      }
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);

    return () => {
      window.removeEventListener('resize', calculateItemsPerPage);
    };
  }, []);

  // Filter out past events
  const currentAndFutureEvents = events.filter(event => {
    const eventEndDate = new Date(event.endDate || event.startDate);
    return eventEndDate >= new Date();
  });

  const sortedEvents = currentAndFutureEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = sortedEvents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <ListContainer ref={listContainerRef}>
      <EventsWrapper>
        {currentEvents.map((event) => (
          <EventItem key={event.id} onClick={() => onSelectEvent(event)}>
            <EventTitle>{event.title}</EventTitle>
            <EventDate>
              {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm')}
              {!isSameDay(new Date(event.startDate), new Date(event.endDate)) &&
                ` - ${format(new Date(event.endDate), 'dd/MM/yyyy HH:mm')}`}
              {isSameDay(new Date(event.startDate), new Date(event.endDate)) &&
                `-${format(new Date(event.endDate), 'HH:mm')}`}
            </EventDate>
          </EventItem>
        ))}
      </EventsWrapper>
      { currentEvents.length === 0 ?
      <ListContainer ref={listContainerRef}>
        <EventItem>No upcoming events</EventItem>
      </ListContainer> :
      <PaginationContainer>
        <PaginationButton onClick={handlePreviousPage} disabled={currentPage === 1}>
          &larr;
        </PaginationButton>
        <PageCounter>{currentPage}/{totalPages}</PageCounter>
        <PaginationButton onClick={handleNextPage} disabled={currentPage === totalPages}>
          &rarr;
        </PaginationButton>
      </PaginationContainer>
      }
    </ListContainer>
  );
}

export default EventList;