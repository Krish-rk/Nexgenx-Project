const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dbPath = path.join(__dirname, "nexgenx.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};
initializeDBAndServer();

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
};

// Validation Middleware
const validateRegisterUser = (request, response, next) => {
  const { username, password, gender, location } = request.body;

  if (!username || !password || !gender || !location) {
    return response.status(400).send("All fields are required");
  }

  if (password.length < 8) {
    return response
      .status(400)
      .send("Password must be at least 8 characters long");
  }

  next();
};

// User Register API
app.post("/users/", validateRegisterUser, async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = ?`;
  const dbUser = await db.get(selectUserQuery, [username]);
  if (!dbUser) {
    const createUserQuery = `
      INSERT INTO user (username, password, gender, location) 
      VALUES (?, ?, ?, ?)`;
    await db.run(createUserQuery, [username, hashedPassword, gender, location]);
    response.send("User created successfully");
  } else {
    response.status(400).send("User already exists");
  }
});

// User Login API
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = ?`;
  const dbUser = await db.get(selectUserQuery, [username]);
  if (!dbUser) {
    response.status(400).send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400).send("Invalid Password");
    }
  }
});

// Get Users API
app.get("/users", authenticateToken, async (request, response) => {
  const getUsersQuery = `SELECT user_id, username, name, gender, location FROM user`;
  const usersArray = await db.all(getUsersQuery);
  response.send(usersArray);
});

// Update User API
app.put("/users/:userId", authenticateToken, async (request, response) => {
  const { userId } = request.params;
  const { name, gender, location } = request.body;
  const updateUserQuery = `
    UPDATE user
    SET 
      name = ?, 
      gender = ?, 
      location = ?
    WHERE 
      user_id = ?`;
  await db.run(updateUserQuery, [name, gender, location, userId]);
  response.send("User updated successfully");
});

// Delete User API
app.delete("/users/:userId", authenticateToken, async (request, response) => {
  const { userId } = request.params;

  // Check if the user exists
  const selectUserQuery = `SELECT * FROM user WHERE user_id = ?`;
  const dbUser = await db.get(selectUserQuery, [userId]);

  if (!dbUser) {
    response.status(404).send("User not found");
  } else {
    const deleteUserQuery = `DELETE FROM user WHERE user_id = ?`;
    await db.run(deleteUserQuery, [userId]);
    response.send("User deleted successfully");
  }
});
