User Management API
Overview
This is a simple RESTful API implemented using Node.js, Express, and SQLite. The API provides CRUD operations for managing user records and includes authentication using JWT (JSON Web Tokens).

Prerequisites
Node.js installed on your machine
npm (Node Package Manager)
SQLite3 installed
Getting Started
Installation
Clone the repository:
bash
Copy code
git clone <repository_url>
Navigate to the project directory:
bash
Copy code
cd <project_directory>
Install the required dependencies:
bash
Copy code
npm install
Database Setup
Ensure that SQLite3 is installed and create a SQLite database file named nexgenx.db in the project directory. The database schema for the user table should look like this:

sql
Copy code
CREATE TABLE user (
user_id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
name TEXT,
password TEXT,
gender TEXT,
location TEXT
);
Running the Server
Start the server by running the following command:

bash
Copy code
npm start
The server will be running at http://localhost:3000/.

API Endpoints
User Registration
Endpoint: POST /users/

Description: Register a new user.

Request Body:

json
Copy code
{
"username": "rahul123",
"password": "rahul@456",
"gender": "male",
"location": "hyderabad"
}
Response:

200 OK: User created successfully
400 Bad Request: User already exists or validation error
User Login
Endpoint: POST /login

Description: Authenticate a user and generate a JWT token.

Request Body:

json
Copy code
{
"username": "rahul123",
"password": "rahul@456"
}
Response:

200 OK: { "jwtToken": "<token>" }
400 Bad Request: Invalid User or Invalid Password
Get Users
Endpoint: GET /users

Description: Get a list of all users. Requires authentication.

Headers:

plaintext
Copy code
Authorization: Bearer <JWT_TOKEN>
Response:

200 OK: List of users
401 Unauthorized: Invalid JWT Token
Update User
Endpoint: PUT /users/:userId

Description: Update an existing user's details. Requires authentication.

Headers:

plaintext
Copy code
Authorization: Bearer <JWT_TOKEN>
Request Body:

json
Copy code
{
"name": "New Name",
"gender": "new_gender",
"location": "new_location"
}
Response:

200 OK: User updated successfully
401 Unauthorized: Invalid JWT Token
Delete User
Endpoint: DELETE /users/:userId

Description: Delete an existing user. Requires authentication.

Headers:

plaintext
Copy code
Authorization: Bearer <JWT_TOKEN>
Response:

200 OK: User deleted successfully
404 Not Found: User not found
401 Unauthorized: Invalid JWT Token
Security Considerations
Authentication: The API uses JWT for authenticating endpoints. The authenticateToken middleware verifies the JWT token.
Validation: User registration endpoint includes validation to ensure all fields are provided and the password meets the minimum length requirement.
SQL Injection Prevention: SQL queries are parameterized to prevent SQL injection attacks.
Password Security: User passwords are hashed using bcrypt before storing them in the database.
Error Handling
Proper error messages are returned for various scenarios such as user not found, invalid credentials, and validation errors.
The server handles database connection errors gracefully.
Future Improvements
Rate Limiting: Implement rate limiting to prevent abuse of the API.
Logging: Add logging for better monitoring and debugging.
Additional Validation: Enhance validation logic for more robust input handling.
Conclusion
This API provides basic CRUD operations for user management with authentication and security considerations. It serves as a foundational example for building more complex APIs with Node.js and Express.
