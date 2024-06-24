// src/components/EditEventModal.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// Define styled components (same as in EventModal)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  color: white;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #2e2e2e;
  color: white;
`;

const TextArea = styled.textarea`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #2e2e2e;
  color: white;
  resize: vertical; /* Allow resizing in height but not in width */
`;

const Button = styled.button`
  padding: 10px;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;

  &:hover {
    background: #2980b9;
  }
`;

function EditEventModal({ isOpen, onClose, onSave, event }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (event && isOpen) {
      setTitle(event.title);
      setDescription(event.description);
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(end.toTimeString().slice(0, 5));
    }
  }, [event, isOpen]);

  const handleSave = () => {
    const updatedEvent = {
      ...event,
      title,
      description,
      startDate: new Date(`${startDate}T${startTime}`).toISOString(),
      endDate: new Date(`${endDate}T${endTime}`).toISOString(),
    };
    onSave(updatedEvent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit Event</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <TextArea
            placeholder="Event Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleSave}>Save Changes</Button>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
}

export default EditEventModal;