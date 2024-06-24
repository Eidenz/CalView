// src/caldavService.js
import IcalExpander from 'ical-expander';

const username = process.env.REACT_APP_RADICALE_USERNAME;
const password = process.env.REACT_APP_RADICALE_PASSWORD;
const serverUrl = process.env.REACT_APP_RADICALE_URL;

if (!username || !password || !serverUrl) {
  throw new Error("Missing environment variables for Radicale server credentials");
}

const fetchEvents = async () => {
  try {
    const response = await fetch(serverUrl, {
      headers: {
        'Authorization': 'Basic ' + btoa(username+':'+password),
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const icsData = await response.text();
    const icalExpander = new IcalExpander({ ics: icsData, maxIterations: 1000 });
    const events = icalExpander.all();

    const calendarEvents = events.events.map(event => ({
      id: event.uid,
      title: event.summary,
      startDate: event.startDate.toJSDate().toISOString(),
      endDate: event.endDate.toJSDate().toISOString(),
      description: event.description || '',
      etag: event.etag || '', // Include the ETag if available
    }));

    return calendarEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const saveEventToRadicale = async (event) => {
  const eventId = event.id || generateUUID();
  const filename = `${eventId}.ics`;
  const url = `${serverUrl}${filename}`;

  const icalString = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${eventId}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
DTSTART:${new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
DTEND:${new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
SUMMARY:${event.title || ''}
DESCRIPTION:${event.description || ''}
END:VEVENT
END:VCALENDAR`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      },
      body: icalString
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Event created successfully');
    return filename; // Return the full filename
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

const deleteEventFromRadicale = async (eventId) => {
  const url = `${serverUrl}${eventId}.ics`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(`${username}:${password}`),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Event deleted successfully from server');
  } catch (error) {
    console.error('Error deleting event from server:', error);
    throw error;
  }
};

export { fetchEvents, saveEventToRadicale, deleteEventFromRadicale };