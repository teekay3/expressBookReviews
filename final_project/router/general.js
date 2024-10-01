const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if(username&&password){
        const present = users.filter((user)=> user.username === username)
        if(present.length===0){
            users.push({"username":req.body.username,"password":req.body.password});
            return res.status(201).json({message:"USer Created successfully"})
        }
        else{
            return res.status(400).json({message:"Already exists"})
        }
    }
    else if(!username && !password){
        return res.status(400).json({message:"Bad request"})
    }
    else if(!username || !password){
        return res.status(400).json({message:"Check username and password"})
    }  
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.status(200).json(books);
});

public_users.get('/',async (req, res) => {
    await res.send(JSON.stringify(books,null,4));
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: `Book with ISBN ${isbn} not found` }); // Handle not found case
    }
 });

 public_users.get('/isbn/:isbn',async (req, res)=>{ 
   const ISBN = req.params.isbn;
   await res.send(books[ISBN]);    
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const filteredBooks = Object.values(books).filter(book => book.author === author);

    if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
    } else {
        res.status(404).json({ message: `No books found by author ${author}` }); // Handle no books found case
    }
});

public_users.get('/author/:author',async (req, res) => {
    //using promises
    const author = req.params.author;
    const booksBasedOnAuthor = (auth) => {
          return new Promise((resolve,reject) =>{
            setTimeout(() =>{
              const filteredbooks = books.filter((b) => b.author === auth);
              if(filteredbooks>0){
                resolve(filteredbooks);
              }else{
                reject(new Error("Book not found"));
              }},1000);
          });             
      }
      booksBasedOnAuthor(author).then((book) =>{
        res.json(book);
      }).catch((err)=>{
        res.status(400).json({error:"Book not found"})
      });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase(); // Convert title to lowercase for case-insensitive search
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));

    if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
    } else {
        res.status(404).json({ message: `No books found with title containing "${title}"` }); // Handle no books found case
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book && book.reviews) {
        res.status(200).json(book.reviews); // Send the reviews object
    } else if (book) {
        res.status(404).json({ message: `Book with ISBN ${isbn} has no reviews` }); // Handle no reviews case
    } else {
        res.status(404).json({ message: `Book with ISBN ${isbn} not found` }); // Handle not found case
    }
});

module.exports.general = public_users;
