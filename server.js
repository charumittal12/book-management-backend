const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const basicAuth = require('basic-auth');

const books = []; // In-memory array to store books

app.use(bodyParser.json());

// Create a new book
app.post('/books', (req, res) => {
  const { title, author, genre, publicationYear, imageURL, ISBN, description } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required.' });
  }

  // Validate ISBN uniqueness (if necessary)
  // ...

  const newBook = {
    id: books.length + 1,
    title,
    author,
    genre,
    publicationYear,
    imageURL: imageURL || 'default-image.jpg', // Use default image if not provided
    ISBN,
    description,
  };

  books.push(newBook);

  res.status(201).json(newBook);
});

// Get all books
app.get('/books', (req, res) => {
  res.json(books);
});
app.get('/bookses', (req, res) => {
    const { page, limit } = req.query;
    const currentPage = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
  
    const results = books.slice(startIndex, endIndex);
  
    res.json({
      books: results,
      currentPage,
      pageSize,
      totalBooks: books.length,
    });
  });

// Get a single book by ID
app.get('/books/:id', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }
  res.json(book);
});

// Update a book by ID
app.put('/books/:id', (req, res) => {
  const bookIndex = books.findIndex((b) => b.id === parseInt(req.params.id));
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  const updatedBook = {
    ...books[bookIndex],
    ...req.body,
  };

  books[bookIndex] = updatedBook;

  res.json(updatedBook);
});

// Delete a book by ID
app.delete('/books/:id', (req, res) => {
  const bookIndex = books.findIndex((b) => b.id === parseInt(req.params.id));
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  books.splice(bookIndex, 1);

  res.sendStatus(204);
});
app.get('/books/search', (req, res) => {
    const { query } = req.query;
    const filteredBooks = books.filter((book) => {
      const searchTerm = query.toLowerCase();
      return (
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.ISBN.toLowerCase().includes(searchTerm)
      );
    });
  
    res.json(filteredBooks);
  });



app.use((req, res, next) => {
  const credentials = basicAuth(req);
  if (!credentials || credentials.name !== 'your_username' || credentials.pass !== 'your_password') {
    res.setHeader('WWW-Authenticate', 'Basic realm="Authorization Required"');
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    next();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});