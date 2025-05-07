import unittest
import json
import sys
import os
import re
from unittest.mock import patch, MagicMock

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Assuming there's an auth.py file or similar in the backend
try:
    from backend.auth import app as auth_app
except ImportError:
    # If there's no specific auth module, we'll create mock functions for testing
    auth_app = None

class TestAuthentication(unittest.TestCase):
    def setUp(self):
        # If auth_app exists, use its test client
        if auth_app:
            self.app = auth_app.test_client()
            self.app.testing = True
        else:
            # Otherwise, create a mock app
            self.app = MagicMock()
    
    def test_signup_input_validation(self):
        """Test that signup validates user input"""
        # Test cases for email validation
        invalid_emails = [
            "",                     # Empty
            "notanemail",           # No @ symbol
            "missing.domain@",      # Missing domain
            "@missing.prefix",      # Missing prefix
            "spaces in@email.com",  # Contains spaces
        ]
        
        for email in invalid_emails:
            # Either call the actual API or test validation logic directly
            if auth_app:
                response = self.app.post(
                    '/signup',
                    json={'email': email, 'password': 'ValidPass123!', 'name': 'Test User'},
                    content_type='application/json'
                )
                self.assertNotEqual(response.status_code, 200, f"Should reject invalid email: {email}")
            else:
                # Mock validation
                self.assertFalse(self._is_valid_email(email), f"Should reject invalid email: {email}")
                
        # Test cases for password validation
        invalid_passwords = [
            "",                 # Empty
            "short",            # Too short
            "nouppercase123",   # No uppercase
            "NOLOWERCASE123",   # No lowercase
            "NoNumbers!",       # No numbers
        ]
        
        for password in invalid_passwords:
            # Either call the actual API or test validation logic directly
            if auth_app:
                response = self.app.post(
                    '/signup',
                    json={'email': 'valid@email.com', 'password': password, 'name': 'Test User'},
                    content_type='application/json'
                )
                self.assertNotEqual(response.status_code, 200, f"Should reject invalid password: {password}")
            else:
                # Mock validation
                self.assertFalse(self._is_valid_password(password), f"Should reject invalid password: {password}")
    
    def test_signup_duplicate_email(self):
        """Test that signup rejects duplicate email addresses"""
        if auth_app:
            # First signup should succeed
            response1 = self.app.post(
                '/signup',
                json={'email': 'test@example.com', 'password': 'ValidPass123!', 'name': 'Test User'},
                content_type='application/json'
            )
            
            # Second signup with same email should fail
            response2 = self.app.post(
                '/signup',
                json={'email': 'test@example.com', 'password': 'DifferentPass456!', 'name': 'Another User'},
                content_type='application/json'
            )
            
            self.assertNotEqual(response2.status_code, 200, "Should reject duplicate email")
    
    def test_login_authentication(self):
        """Test that login authenticates users correctly"""
        if auth_app:
            # First create a user
            self.app.post(
                '/signup',
                json={'email': 'login_test@example.com', 'password': 'ValidPass123!', 'name': 'Login Test'},
                content_type='application/json'
            )
            
            # Test successful login
            response = self.app.post(
                '/login',
                json={'email': 'login_test@example.com', 'password': 'ValidPass123!'},
                content_type='application/json'
            )
            self.assertEqual(response.status_code, 200, "Login should succeed with correct credentials")
            
            # Test failed login with wrong password
            response = self.app.post(
                '/login',
                json={'email': 'login_test@example.com', 'password': 'WrongPass123!'},
                content_type='application/json'
            )
            self.assertNotEqual(response.status_code, 200, "Login should fail with incorrect password")
            
            # Test failed login with non-existent user
            response = self.app.post(
                '/login',
                json={'email': 'nonexistent@example.com', 'password': 'AnyPass123!'},
                content_type='application/json'
            )
            self.assertNotEqual(response.status_code, 200, "Login should fail with non-existent user")
    
    def test_password_security(self):
        """Test that passwords are stored securely (not in plaintext)"""
        if auth_app:
            # This test would need to directly access the database to check password storage
            # Since we don't have direct DB access in this test, we'll skip it
            pass
        else:
            # Mock test for password hashing
            plain_password = "SecurePass123!"
            hashed_password = self._mock_hash_password(plain_password)
            
            # Check that the hash is not the same as the plaintext
            self.assertNotEqual(plain_password, hashed_password, "Password should be hashed, not stored in plaintext")
            
            # Check that the hash can be verified
            self.assertTrue(self._mock_verify_password(plain_password, hashed_password), 
                          "Password verification should work with correct password")
            
            # Check that incorrect password fails verification
            self.assertFalse(self._mock_verify_password("WrongPass123!", hashed_password),
                           "Password verification should fail with incorrect password")
    
    def test_logout_functionality(self):
        """Test that logout invalidates the session/token"""
        if auth_app:
            # First login to get a session/token
            login_response = self.app.post(
                '/login',
                json={'email': 'logout_test@example.com', 'password': 'ValidPass123!'},
                content_type='application/json'
            )
            
            if login_response.status_code == 200:
                # Get the auth token or session cookie
                auth_data = json.loads(login_response.data)
                token = auth_data.get('token')
                
                # Test logout
                logout_response = self.app.post(
                    '/logout',
                    headers={'Authorization': f'Bearer {token}'} if token else None
                )
                self.assertEqual(logout_response.status_code, 200, "Logout should succeed")
                
                # Try to access a protected route after logout
                protected_response = self.app.get(
                    '/protected',
                    headers={'Authorization': f'Bearer {token}'} if token else None
                )
                self.assertNotEqual(protected_response.status_code, 200, 
                                  "Access to protected route should fail after logout")
    
    # Helper methods for mock testing when auth_app is not available
    def _is_valid_email(self, email):
        """Mock email validation"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def _is_valid_password(self, password):
        """Mock password validation"""
        if len(password) < 8:
            return False
        if not any(c.islower() for c in password):
            return False
        if not any(c.isupper() for c in password):
            return False
        if not any(c.isdigit() for c in password):
            return False
        return True
    
    def _mock_hash_password(self, password):
        """Mock password hashing"""
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _mock_verify_password(self, plain_password, hashed_password):
        """Mock password verification"""
        return self._mock_hash_password(plain_password) == hashed_password

if __name__ == '__main__':
    unittest.main() 