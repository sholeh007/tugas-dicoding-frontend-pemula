"use strict";
const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOK_APPS";
const SAVED_EVENT = "saved";
let isSaved = false;

document.addEventListener("DOMContentLoaded", () => {
  const formElem = document.querySelector('form[name="form-add"]');
  const searchElem = document.querySelector("[data-search]");

  formElem.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(formElem);
    addBook(formData);
    this.reset();
  });
  if (isStorageExist) {
    loadData();
  }

  searchElem.addEventListener("input", (e) => {
    const titleTarget = e.target.value.toLowerCase();

    const data = books.filter((book) =>
      book.title.toLowerCase().includes(titleTarget)
    );
    document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: { data } }));
  });
});

document.addEventListener(RENDER_EVENT, (e) => {
  const uncompleteReadBooks = document.getElementById("list-book");
  uncompleteReadBooks.innerText = "";

  const completeReadBooks = document.getElementById("completed-book");
  completeReadBooks.innerText = "";

  let bookElement;
  if (e.detail?.data) {
    for (const book of e.detail?.data) {
      bookElement = makeBook(book);
      if (book.isCompleted === false) {
        uncompleteReadBooks.append(bookElement);
      } else {
        completeReadBooks.append(bookElement);
      }
    }
  } else {
    for (const book of books) {
      bookElement = makeBook(book);
      if (book.isCompleted === false) {
        uncompleteReadBooks.append(bookElement);
      } else {
        completeReadBooks.append(bookElement);
      }
    }
  }
});

document.addEventListener(SAVED_EVENT, () => {
  if (isSaved) {
    alert("Buku berhasil ditambahkan");
  }
});

function addBook(dataBooks) {
  const bookData = generateObjectBook(dataBooks);
  books.push(bookData);
  isSaved = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
  isSaved = false;
}

function generateId() {
  return +new Date();
}

function generateObjectBook(dataBooks) {
  return {
    id: generateId(),
    title: dataBooks.get("title"),
    author: dataBooks.get("author"),
    year: dataBooks.get("year"),
    isCompleted: false,
  };
}

function makeBook(books) {
  const card = document.createElement("div");
  card.classList.add("card", "p", "shadow", "card-post");
  card.setAttribute("id", `book-${books.id}`);

  const wrapperBook = document.createElement("div");
  const title = document.createElement("h3");
  title.innerText = books.title;

  const author = document.createElement("p");
  author.innerText = books.author;

  const releaseBook = document.createElement("small");
  releaseBook.innerText = books.year;

  wrapperBook.append(title, author, releaseBook);
  card.append(wrapperBook);

  const wrapperButton = document.createElement("div");
  const trashBtn = document.createElement("button");
  trashBtn.classList.add("btn-act", "trash-button");

  trashBtn.addEventListener("click", () => {
    removeBook(books.id);
  });

  if (books.isCompleted) {
    const recycleBtn = document.createElement("button");
    recycleBtn.classList.add("btn-act", "recycle-button");

    recycleBtn.addEventListener("click", () => {
      recycleBook(books.id);
    });
    wrapperButton.append(recycleBtn, trashBtn);
    card.append(wrapperButton);
  } else {
    const checkBtn = document.createElement("button");
    checkBtn.classList.add("btn-act", "check-button");

    checkBtn.addEventListener("click", () => {
      addBookComplete(books.id);
    });
    wrapperButton.append(checkBtn, trashBtn);
    card.append(wrapperButton);
  }

  return card;
}

function addBookComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function findBook(bookId) {
  const book = books.filter((item) => item.id === bookId);

  if (book === undefined || book === null) return null;

  return book[0];
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  const conf = confirm("anda yakin hapus buku ini?");

  if (conf === false) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function recycleBook(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function findBookIndex(bookId) {
  let i = 0;
  for (i; i <= books.length; i++) {
    if (books[i].id === bookId) {
      return i;
    }
  }
  return -1;
}

function saveBook() {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("browser tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadData() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
