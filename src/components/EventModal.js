// src/components/EventModal.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

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

function EventModal({ isOpen, onClose, onSave, initialDate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const modalRef = useRef(null);
  
    useEffect(() => {
      if (initialDate && isOpen) {
        const formattedDate = initialDate.toISOString().split('T')[0];
        setStartDate(formattedDate);
        setEndDate(formattedDate);
        
        const hours = initialDate.getHours().toString().padStart(2, '0');
        const minutes = initialDate.getMinutes().toString().padStart(2, '0');
        setStartTime(`${hours}:${minutes}`);
        
        // Set end time to 1 hour later
        const endTime = new Date(initialDate.getTime() + 60 * 60 * 1000);
        const endHours = endTime.getHours().toString().padStart(2, '0');
        const endMinutes = endTime.getMinutes().toString().padStart(2, '0');
        setEndTime(`${endHours}:${endMinutes}`);
      }
    }, [initialDate, isOpen]);
  
    const handleSave = () => {
      try {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          throw new Error('Invalid date or time');
        }
        onSave({ title, description, startDate: startDateTime, endDate: endDateTime });
        onClose();
      } catch (error) {
        console.error('Error saving event:', error);
        alert('Invalid date or time. Please check your inputs.');
      }
    };
  
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
  
    useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);
  
    if (!isOpen) return null;
  
    return (
      <ModalOverlay>
        <ModalContent ref={modalRef}>
          <ModalHeader>
            <ModalTitle>Create Event</ModalTitle>
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
            <Button onClick={handleSave}>Save</Button>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }
  
  export default EventModal;