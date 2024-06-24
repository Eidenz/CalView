// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import Calendar from './components/Calendar';
import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import EventModal from './components/EventModal';
import EditEventModal from './components/EditEventModal';
import styled, { keyframes } from 'styled-components';
import { fetchEvents, saveEventToRadicale, deleteEventFromRadicale, updateEventInRadicale } from './caldavService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #121212;
  color: white;
  position: relative;
`;

const CalendarAndEventsContainer = styled.div`
  display: flex;
  align-items: stretch;
  width: 90%; /* Adjusted width to make the calendar appear bigger */
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden; /* Ensure no overflow */
`;

const CalendarContainer = styled.div`
  flex: 1;
  padding: 20px;
`;

const EventListContainer = styled.div`
  width: 25%; /* Adjusted width */
  padding: 20px;
  background-color: #1e1e1e;
  border-left: 1px solid #333;
  border-radius: 0 8px 8px 0; /* Rounded corners on the right side */
`;

const EventDetailsContainer = styled.div`
  width: 25%; /* Adjusted width */
  padding: 20px 20px 5px 20px;
  background-color: #1e1e1e;
  border-right: 1px solid #333;
  border-radius: 8px 0 0 8px; /* Rounded corners on the left side */
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 2s linear infinite;
`;

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [resetPage, setResetPage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const calendarRef = useRef(null);
  const eventDetailsRef = useRef(null);

  const selectToday = (eventsData) => {
    const today = new Date();
    const todayEvents = eventsData.filter(
      (event) => new Date(event.startDate).toDateString() === today.toDateString()
    );
    setSelectedEvents(todayEvents);
    setActiveStartDate(today);
    setSelectedDate(today);
    setResetPage((prev) => !prev);
    if (calendarRef.current && calendarRef.current.getApi) {
      calendarRef.current.getApi().gotoDate(today);
    }
  };

  useEffect(() => {
    const fetchAndSetEvents = async () => {
      setLoading(true);
      try {
        const calendarEvents = await fetchEvents();
        setEvents(calendarEvents);
        selectToday(calendarEvents); // Call selectToday with fetched events
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to fetch events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetEvents();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        eventDetailsRef.current &&
        !eventDetailsRef.current.contains(event.target)
      ) {
        selectToday(events);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [events]);

  const handleSelectEvent = (event) => {
    const eventDate = new Date(event.startDate);
    const dayEvents = events.filter(
      (e) => new Date(e.startDate).toDateString() === eventDate.toDateString()
    );
    setSelectedEvents(dayEvents);
    setActiveStartDate(eventDate);
    setSelectedDate(eventDate);
    setResetPage((prev) => !prev);
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setActiveStartDate(activeStartDate);
  };

  const handleDoubleClickDay = (date) => {
    setModalDate(new Date(date));
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (newEvent) => {
    try {
      const eventToSave = {
        ...newEvent,
        startDate: new Date(newEvent.startDate).toISOString(),
        endDate: new Date(newEvent.endDate).toISOString(),
      };
      const filename = await saveEventToRadicale(eventToSave);
      const updatedEvent = { ...eventToSave, id: filename };
      
      setEvents(prevEvents => [...prevEvents, updatedEvent]);
      
      const eventDate = new Date(updatedEvent.startDate);
      if (eventDate.toDateString() === selectedDate.toDateString()) {
        setSelectedEvents(prevSelectedEvents => [...prevSelectedEvents, updatedEvent]);
      }
      
      toast.success('Event created successfully!');
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to create event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventToDelete) => {
    try {
      await deleteEventFromRadicale(eventToDelete.id);
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Failed to delete event from server:', error);
      toast.warning('It seems event is already deleted on server, deleting locally.');
    } finally {
      // Remove the event from local state regardless of server success
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete.id));
      setSelectedEvents(prevSelectedEvents => prevSelectedEvents.filter(event => event.id !== eventToDelete.id));
    }
  };

  const handleDateClick = (date) => {
    const clickedDate = new Date(date);
    const dayEvents = events.filter(
      (e) => new Date(e.startDate).toDateString() === clickedDate.toDateString()
    );
    setSelectedEvents(dayEvents);
    setActiveStartDate(clickedDate);
    setSelectedDate(clickedDate);
    setResetPage((prev) => !prev);
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedEvent = async (updatedEvent) => {
    try {
      // Delete the existing event
      await deleteEventFromRadicale(updatedEvent.id);

      // Create a new event with the updated details
      const newEvent = {
        ...updatedEvent,
        id: undefined, // Ensure a new ID is generated
        startDate: new Date(updatedEvent.startDate).toISOString(),
        endDate: new Date(updatedEvent.endDate).toISOString(),
      };
      const newEventId = await saveEventToRadicale(newEvent);
      const updatedEventWithNewId = { ...newEvent, id: newEventId };

      // Update the events list
      setEvents(prevEvents => prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEventWithNewId : event
      ));
      setSelectedEvents(prevSelectedEvents => prevSelectedEvents.map(event => 
        event.id === updatedEvent.id ? updatedEventWithNewId : event
      ));
      toast.success('Event updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event. Please try again.');
    }
  };

  return (
    <AppContainer>
      {loading && (
        <Overlay>
          <Spinner />
        </Overlay>
      )}
      <CalendarAndEventsContainer>
        <EventDetailsContainer ref={eventDetailsRef}>
          <EventDetails 
            events={selectedEvents} 
            resetPage={resetPage} 
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
          />
        </EventDetailsContainer>
        <CalendarContainer ref={calendarRef}>
          <Calendar
            onSelectEvent={handleSelectEvent}
            onDoubleClickDay={handleDoubleClickDay}
            activeStartDate={activeStartDate}
            onActiveStartDateChange={handleActiveStartDateChange}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
            onDateClick={handleDateClick}
          />
        </CalendarContainer>
        <EventListContainer>
          <EventList onSelectEvent={handleSelectEvent} events={events} />
        </EventListContainer>
        </CalendarAndEventsContainer>
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialDate={modalDate}
      />
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditedEvent}
        event={eventToEdit}
      />
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AppContainer>
  );
}

export default App;