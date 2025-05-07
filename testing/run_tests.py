#!/usr/bin/env python
import unittest
import os
import sys

def run_tests():
    """Run all tests in the testing directory"""
    # Add the parent directory to sys.path
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    
    # Check for model.h5 file and print warning if not found
    model_path = os.path.join(os.path.dirname(__file__), '../backend/model/model.h5')
    if not os.path.exists(model_path):
        print("\n" + "="*80)
        print(f"WARNING: The emotion detection model file was not found at {model_path}")
        print("Some tests related to the model will be skipped.")
        print("If you want to run these tests, please make sure the model file exists at the specified location.")
        print("="*80 + "\n")
    
    # Find all test files
    test_loader = unittest.TestLoader()
    test_suite = test_loader.discover(os.path.dirname(__file__), pattern="test_*.py")
    
    # Run tests
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)
    
    # Display summary
    print("\n" + "="*80)
    print(f"Tests run: {result.testsRun}")
    print(f"Errors: {len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Skipped: {len(result.skipped)}")
    if result.errors or result.failures:
        print("\nSome tests failed. Please check the error messages above.")
    else:
        print("\nAll executed tests passed successfully!")
    print("="*80)
    
    # Return exit code based on test result
    return 0 if result.wasSuccessful() else 1

if __name__ == "__main__":
    sys.exit(run_tests()) 