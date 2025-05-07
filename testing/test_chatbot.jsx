import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chatbot from '../frontend/src/components/Chatbot';

// Mock fetch globally
global.fetch = jest.fn();

describe('Chatbot Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the chatbot header correctly', () => {
    render(<Chatbot />);
    const headerElement = screen.getByText('Emotional Support Chat');
    expect(headerElement).toBeInTheDocument();
  });

  it('renders the input field and buttons', () => {
    render(<Chatbot />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument(); // Send button
  });

  it('allows entering a message', () => {
    render(<Chatbot />);
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello there' } });
    expect(input.value).toBe('Hello there');
  });

  it('sends a message when the send button is clicked', async () => {
    // Mock successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Hello, how can I help you?' }),
    });

    render(<Chatbot />);
    
    // Type a message
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello there' } });
    
    // Click send button
    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);
    
    // Verify the user message appears
    expect(await screen.findByText('Hello there')).toBeInTheDocument();
    
    // Verify the bot response appears
    await waitFor(() => {
      expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
    });
    
    // Verify fetch was called with the right arguments
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello there', image: null }),
    });
  });

  it('handles API errors correctly', async () => {
    // Mock error response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error: Failed to get response' }),
    });

    render(<Chatbot />);
    
    // Type and send a message
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);
    
    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/Sorry, I encountered an error/)).toBeInTheDocument();
    });
  });

  it('shows loading state while waiting for response', async () => {
    // Mock delayed response
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: async () => ({ response: 'Delayed response' })
          }), 100)
      )
    );

    render(<Chatbot />);
    
    // Type and send a message
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);
    
    // Verify loading state appears
    const loadingElement = screen.getByText(''); // The loading dots have empty text content
    expect(loadingElement.parentElement).toHaveClass('loading');
    
    // Verify the response eventually appears
    await waitFor(() => {
      expect(screen.getByText('Delayed response')).toBeInTheDocument();
    });
  });

  it('handles image upload correctly', async () => {
    // Mock FileReader
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      result: 'data:image/jpeg;base64,testImageBase64',
      onloadend: null,
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance);
    
    // Mock file
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'I see an image.' }),
    });

    render(<Chatbot />);
    
    // Simulate uploading an image
    const fileInput = screen.getByAcceptingFiles();
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Trigger onloadend event
    mockFileReaderInstance.onloadend();
    
    // Verify image preview appears
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
    
    // Send the message with image
    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);
    
    // Verify the message is sent with the image
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('testImageBase64'),
      });
    });
    
    // Verify bot response
    await waitFor(() => {
      expect(screen.getByText('I see an image.')).toBeInTheDocument();
    });
    
    // Restore FileReader
    global.FileReader = originalFileReader;
  });

  it('clears the form after sending a message', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Hello!' }),
    });

    render(<Chatbot />);
    
    // Type and send a message
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello there' } });
    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);
    
    // Verify input is cleared
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
}); 