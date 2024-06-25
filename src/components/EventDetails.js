import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

const DetailsContainer = styled.div`
  background-color: #1e1e1e;
  padding: 20px 20px 0px 20px; /* Bottom 0 */
  border-radius: 8px 0 0 8px; /* Rounded corners on the left side */
  height: 100%; /* Match the height of the calendar */
  display: flex;
  flex-direction: column;
  justify-content: ${({ isEmpty }) => (isEmpty ? 'center' : 'flex-start')};
  align-items: ${({ isEmpty }) => (isEmpty ? 'center' : 'flex-start')};
  text-align: ${({ isEmpty }) => (isEmpty ? 'center' : 'left')};
  word-wrap: break-word; /* Ensure the content wraps if too long */
  white-space: normal; /* Ensure the content wraps if too long */
  overflow-wrap: break-word; /* Ensure the content wraps if too long */
  box-sizing: border-box; /* Ensure padding and border are included in the element's total width and height */
  max-width: 100%; /* Ensure the container does not exceed the parent width */
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const EventTitle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  word-wrap: break-word; /* Ensure the title wraps if too long */
  white-space: normal; /* Ensure the title wraps if too long */
  overflow-wrap: break-word; /* Ensure the title wraps if too long */
  max-width: 100%; /* Ensure the title does not exceed the parent width */
`;

const EventDate = styled.div`
  font-size: 1.2rem;
  color: #ccc;
  margin-bottom: 10px;
`;

const DescriptionItem = styled.div`
  margin-bottom: 10px;
  word-wrap: break-word; /* Ensure the description wraps if too long */
  white-space: normal; /* Ensure the description wraps if too long */
  overflow-wrap: break-word; /* Ensure the description wraps if too long */
  max-width: 100%; /* Ensure the description does not exceed the parent width */
`;

const DescriptionLabel = styled.span`
  font-weight: bold;
  color: #fff;
`;

const DescriptionValue = styled.span`
  color: #ccc;
`;

const DescriptionLink = styled.a`
  color: #3498db;
  text-decoration: none;
  word-wrap: break-word; /* Ensure the link wraps if too long */
  white-space: normal; /* Ensure the link wraps if too long */
  overflow-wrap: break-word; /* Ensure the link wraps if too long */
  max-width: 100%; /* Ensure the link does not exceed the parent width */

  &:hover {
    text-decoration: underline;
  }
`;

const Divider = styled.hr`
  width: 100%;
  border: 0;
  border-top: 1px solid #333;
  margin: 10px 0;
  box-sizing: border-box; /* Ensure padding and border are included in the element's total width and height */
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  bottom: 0;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 5px 0; // Reduce padding to lower the position
`;

const PageCounter = styled.span`
  background-color: #444;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
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

const EventContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 10px; // Add some space between content and bottom controls
  width: 100%;
`;

const BoldTime = styled.span`
  font-weight: bold;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;

  &:hover {
    color: #2980b9;
  }
`;

function parseDescription(description) {
  const lines = description.split('\n').filter(line => line.trim() !== '');
  const parsedDescription = {};
  let currentLabel = ' '; // Default label

  lines.forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const [label, ...value] = line.split(':');
      currentLabel = label.trim();
      if(currentLabel.includes('http')){
        currentLabel = ' ';
        parsedDescription[currentLabel] = line.trim();
      }
      else{
        let linevalue = value.join(':').trim();
        if (linevalue == 'null' || linevalue == 'undefined'){
          linevalue = '-';
        }
        parsedDescription[currentLabel] = linevalue;
      }
    } else if (currentLabel) {
      // If there's no colon, append to the current label's value
      let linevalue = line.trim();
      if (linevalue == 'null' || linevalue == 'undefined'){
        linevalue = '-';
      }
      parsedDescription[currentLabel] = (parsedDescription[currentLabel] || '') + ' ' + linevalue;
    }
  });

  return parsedDescription;
}

function renderDescriptionValue(value) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = value.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <DescriptionLink key={index} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </DescriptionLink>
      );
    }
    return part;
  });
}

function EventDetails({ events = [], resetPage, onDeleteEvent, onEditEvent }) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 1;

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when events change
  }, [resetPage, events]);

  const sortedEvents = events
    .filter(event => event.date || event.startDate) // Filter out events without any date
    .sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate));
  
  const totalPages = Math.ceil(sortedEvents.length / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = sortedEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const isEmpty = sortedEvents.length === 0;

  if (isEmpty) {
    return (
      <DetailsContainer isEmpty={isEmpty}>
        <EventTitle>No Event</EventTitle>
      </DetailsContainer>
    );
  }

  const formatEventDate = (event) => {
    const startDate = event.startDate || event.date;
    const endDate = event.endDate;

    if (!startDate) return 'Date not available';

    const formattedStartDate = format(new Date(startDate), 'dd/MM/yyyy');
    const formattedStartTime = format(new Date(startDate), 'HH:mm');

    if (!endDate) {
      return (
        <>
          {formattedStartDate} <BoldTime>{formattedStartTime}</BoldTime>
        </>
      );
    }

    const formattedEndDate = format(new Date(endDate), 'dd/MM/yyyy');
    const formattedEndTime = format(new Date(endDate), 'HH:mm');

    if (formattedStartDate === formattedEndDate) {
      return (
        <>
          {formattedStartDate} <BoldTime>{formattedStartTime} - {formattedEndTime}</BoldTime>
        </>
      );
    }

    return (
      <>
        {formattedStartDate} <BoldTime>{formattedStartTime}</BoldTime> - {formattedEndDate} <BoldTime>{formattedEndTime}</BoldTime>
      </>
    );
  };

  return (
    <DetailsContainer isEmpty={isEmpty}>
      <EventContent>
        {currentEvents.map((event, index) => (
          <div key={index}>
            <EventTitle>{event.title}</EventTitle>
            <EventDate>{formatEventDate(event)}</EventDate>
            <Divider />
            {Object.entries(parseDescription(event.description)).map(([label, value]) => (
              <DescriptionItem key={label}>
                <DescriptionLabel>{renderDescriptionValue(label)}</DescriptionLabel> <DescriptionValue>{renderDescriptionValue(value)}</DescriptionValue>
              </DescriptionItem>
            ))}
          </div>
        ))}
      </EventContent>
      <BottomContainer>
        {currentEvents.length > 0 && (
          <IconContainer>
            <IconButton onClick={() => onEditEvent(currentEvents[currentPage - 1])}>✏️</IconButton>
            <IconButton onClick={() => onDeleteEvent(currentEvents[currentPage - 1])}>🗑️</IconButton>
          </IconContainer>
        )}
        <PaginationContainer>
          <PaginationButton onClick={handlePreviousPage} disabled={currentPage === 1}>
            &larr;
          </PaginationButton>
          <PageCounter>{currentPage}/{totalPages}</PageCounter>
          <PaginationButton onClick={handleNextPage} disabled={currentPage === totalPages}>
            &rarr;
          </PaginationButton>
        </PaginationContainer>
      </BottomContainer>
    </DetailsContainer>
  );
}

export default EventDetails;