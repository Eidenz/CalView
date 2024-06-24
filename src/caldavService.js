// src/caldavService.js
import * as dav from 'dav';
import ICAL from 'ical.js';

const username = process.env.REACT_APP_RADICALE_USERNAME;
const password = process.env.REACT_APP_RADICALE_PASSWORD;
const serverUrl = process.env.REACT_APP_RADICALE_URL;

const fetchEvents = async () => {
  const xhr = new dav.transport.Basic(
    new dav.Credentials({
      username: username,
      password: password,
    })
  );

  const account = await dav.createAccount({
    server: serverUrl,
    xhr: xhr,
    loadCollections: true,
    loadObjects: true,
  });

  const calendar = account.calendars[0];
  const calendarEvents = calendar.objects.map((object) => {
    const jcalData = ICAL.parse(object.calendarData);
    const comp = new ICAL.Component(jcalData);
    const vevent = comp.getFirstSubcomponent('vevent');
    const event = new ICAL.Event(vevent);
    return {
      id: object.url.split('/').pop(), // This should be the filename
      title: event.summary,
      startDate: event.startDate.toJSDate().toISOString(),
      endDate: event.endDate.toJSDate().toISOString(),
      description: event.description || '',
      etag: object.etag, // Include the ETag
    };
  });

  return calendarEvents;
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const saveEventToRadicale = async (event) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icalString = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${event.id || generateUUID()}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title || ''}
DESCRIPTION:${event.description || ''}
END:VEVENT
END:VCALENDAR`;

  const eventId = event.id || generateUUID();
  const filename = `${eventId}.ics`;
  const url = `${serverUrl}${filename}`;

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

const deleteEventFromRadicale = async (filename) => {
  const url = `${serverUrl}${filename}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(username + ':' + password)
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