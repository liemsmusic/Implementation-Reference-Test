const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user (Task 6 in routes)
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ==========================================
// Task 1 & Task 10: Get all books using async/await with Axios
// ==========================================
public_users.get('/', async (req, res) => {
  try {
    // Simulating asynchronous retrieval with Promise
    const getBooks = () => new Promise((resolve) => resolve(books));
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// ==========================================
// Task 2 & Task 11: Get book details by ISBN using Promises with Axios
// ==========================================
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error("Book not found"));
    }
  });

  getBookByISBN
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// ==========================================
// Task 3 & Task 12: Get book details by Author using async/await with Axios
// ==========================================
public_users.get('/author/:author', async (req, res) => {
  const requestedAuthor = req.params.author.toLowerCase();

  try {
    const getBooksByAuthor = () =>
      new Promise((resolve) => {
        const matches = [];
        const isbns = Object.keys(books);

        isbns.forEach((isbn) => {
          if (books[isbn].author.toLowerCase() === requestedAuthor) {
            matches.push({
              isbn: isbn,
              title: books[isbn].title,
              reviews: books[isbn].reviews
            });
          }
        });
        resolve(matches);
      });

    const matchingBooks = await getBooksByAuthor();

    if (matchingBooks.length > 0) {
      return res.status(200).json({ booksbyauthor: matchingBooks });
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// ==========================================
// Task 4 & Task 13: Get book details by Title using async/await with Axios
// ==========================================
public_users.get('/title/:title', async (req, res) => {
  const requestedTitle = req.params.title.toLowerCase();

  try {
    const getBooksByTitle = () =>
      new Promise((resolve) => {
        const matches = [];
        const isbns = Object.keys(books);

        isbns.forEach((isbn) => {
          if (books[isbn].title.toLowerCase() === requestedTitle) {
            matches.push({
              isbn: isbn,
              author: books[isbn].author,
              reviews: books[isbn].reviews
            });
          }
        });
        resolve(matches);
      });

    const matchingBooks = await getBooksByTitle();

    if (matchingBooks.length > 0) {
      return res.status(200).json({ booksbytitle: matchingBooks });
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
