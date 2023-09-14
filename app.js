const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
const bcrypt = require("bcrypt");
app.use(express.json());
const db_path = path.join(__dirname, "userData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DBError: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
module.exports = app;
const validPassword = (password) => {
  return password.length > 5;
};
//API 1
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  let hashPassword = await bcrypt.hash(password, 10);
  const userSelectQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(userSelectQuery);
  if (dbUser === undefined) {
    const createUserQuery = `INSERT INTO user(username,name,password,gender,location) values('${username}','${name}','${hashPassword}','${gender}','${location}');`;
    if (validPassword(password)) {
      const dbResponse = await db.run(createUserQuery);

      response.send("User created successfully");
    } else {
      response.status = 400;
      response.send("Password is too short");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});
//api2
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(selectQuery);
  if (dbUser === undefined) {
    response.status = 400;
    response.send("Invalid User");
  } else {
    const isPasswordMatch = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatch) {
      response.status = 200;
      response.send("Login Successful");
    } else {
      response.status = 400;
      response.send("Invalid Password");
    }
  }
});
//API 3
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const selectUser = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(selectUser);
  if (dbUser === undefined) {
    response.status = 400;
    response.send("User not registered");
  } else {
    const verifyPassword = await bcrypt.compare(oldPassword, dbUser.password);
    if (verifyPassword == true) {
      const lenNewPassword = len(newPassword);
      if (lenNewPassword < 5) {
        response.status = 400;
        response.send("Password is too short");
      } else {
        const hashNewPassword = await bcrypt.hash(newPassword, 10);
        const UpdateQuery = `UPDATE user SET password='${hashNewPassword}' where username='${username}';`;
        await db.run(UpdateQuery);
        response.status = 200;
        response.send("Password updated");
      }
    } else {
      respond.status = 400;
      respond.send("Invalid current password");
    }
  }
});
