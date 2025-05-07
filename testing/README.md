# Testing Suite for Vibe Vision

This directory contains comprehensive test cases for the Vibe Vision application, covering the backend API, frontend components, emotion detection model, and authentication functionality.

## Test Files

1. **test_backend_api.py** - Tests for the Flask backend API endpoints
   - Tests the home, predict, and chat endpoints
   - Includes tests with and without images
   - Tests error handling

2. **test_chatbot.jsx** - Tests for the React Chatbot component
   - Tests rendering, user input, and API interactions
   - Tests image upload functionality
   - Tests error handling and loading states

3. **test_emotion_model.py** - Tests for the emotion detection model
   - Tests model structure and predictions
   - Tests image preprocessing
   - Tests emotion classes and normalization

4. **test_authentication.py** - Tests for authentication functionality
   - Tests signup validation
   - Tests login authentication
   - Tests password security
   - Tests logout functionality

## Running Tests

### Prerequisites

Before running the tests, make sure:

1. You have all necessary Python packages installed:
   ```bash
   pip install tensorflow pillow flask flask-cors h5py numpy unittest
   ```

2. The model file exists. You have two options:
   
   a) Use the real emotion detection model at `backend/model/model.h5`
   
   b) Create a mock model for testing:
   ```bash
   cd login_signup/testing
   python mock_model.py
   ```

### Backend Tests

To run the Python backend tests, use the following command:

```bash
cd login_signup/testing
python run_tests.py
```

This will run all Python test files and generate a report.

### Frontend Tests

To run the React component tests, you need to have the appropriate testing libraries installed. Use the following command:

```bash
cd login_signup/frontend
npm test
```

## Test Coverage

The test suite covers:

- **Unit Tests**: Testing individual functions and components
- **Integration Tests**: Testing interactions between components
- **API Tests**: Testing API endpoints
- **Model Tests**: Testing the emotion detection model
- **Validation Tests**: Testing input validation
- **Error Handling Tests**: Testing error scenarios

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create a new test file with a `test_` prefix
2. Import necessary libraries and the module to be tested
3. Create a test class that inherits from `unittest.TestCase`
4. Add test methods with descriptive names
5. Add appropriate assertions
6. Run the tests to ensure they pass

## White Box Testing Guidelines

When performing white box testing:

1. **Statement Coverage**: Ensure all statements are executed at least once
2. **Branch Coverage**: Test all decision points (if/else, switch, etc.)
3. **Path Coverage**: Test all possible execution paths
4. **Condition Coverage**: Test all boolean expressions

## Test Environment

The tests are designed to run in both development and CI/CD environments. Make sure to set up the appropriate environment variables as needed. 