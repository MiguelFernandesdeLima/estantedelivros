// Seletores DOM
const bookForm = document.getElementById('bookForm');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const yearInput = document.getElementById('year');
const statusSelect = document.getElementById('status');
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const statusFilter = document.getElementById('statusFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const bookIdInput = document.getElementById('bookId');
const notification = document.getElementById('notification');

// Variáveis de estado
let books = JSON.parse(localStorage.getItem('books')) || [];
let editingBookId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderBooks();
    
    bookForm.addEventListener('submit', handleFormSubmit);
    searchBtn.addEventListener('click', filterBooks);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterBooks();
    });
    statusFilter.addEventListener('change', filterBooks);
    resetFiltersBtn.addEventListener('click', resetFilters);
    cancelBtn.addEventListener('click', resetForm);
});

// Funções principais
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validação
    if (!validateForm()) return;
    
    const bookData = {
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        year: yearInput.value ? parseInt(yearInput.value) : null,
        status: statusSelect.value,
        id: editingBookId || Date.now().toString()
    };
    
    if (editingBookId) {
        // Atualizar livro existente
        updateBook(bookData);
    } else {
        // Adicionar novo livro
        addBook(bookData);
    }
    
    resetForm();
    renderBooks();
    showNotification(editingBookId ? 'Livro atualizado com sucesso!' : 'Livro adicionado com sucesso!');
    editingBookId = null;
}

function validateForm() {
    let isValid = true;
    
    // Resetar mensagens de erro
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Validar título
    if (!titleInput.value.trim()) {
        document.getElementById('titleError').textContent = 'Por favor, insira um título';
        isValid = false;
    }
    
    // Validar autor
    if (!authorInput.value.trim()) {
        document.getElementById('authorError').textContent = 'Por favor, insira um autor';
        isValid = false;
    }
    
    return isValid;
}

function addBook(book) {
    books.push(book);
    saveToLocalStorage();
}

function updateBook(updatedBook) {
    books = books.map(book => book.id === updatedBook.id ? updatedBook : book);
    saveToLocalStorage();
}

function deleteBook(id) {
    books = books.filter(book => book.id !== id);
    saveToLocalStorage();
    renderBooks();
    showNotification('Livro removido com sucesso!');
}

function renderBooks(booksToRender = books) {
    booksContainer.innerHTML = '';
    
    if (booksToRender.length === 0) {
        booksContainer.innerHTML = '<p class="no-books">Nenhum livro encontrado.</p>';
        return;
    }
    
    booksToRender.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        const statusClass = getStatusClass(book.status);
        
        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p><strong>Autor:</strong> ${book.author}</p>
            ${book.year ? `<p><strong>Ano:</strong> ${book.year}</p>` : ''}
            <span class="book-status ${statusClass}">${book.status}</span>
            <div class="book-actions">
                <button class="btn btn-primary edit-btn" data-id="${book.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger delete-btn" data-id="${book.id}">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
        
        booksContainer.appendChild(bookCard);
    });
    
    // Adicionar event listeners aos botões
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editBook(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este livro?')) {
                deleteBook(btn.dataset.id);
            }
        });
    });
}

function editBook(id) {
    const bookToEdit = books.find(book => book.id === id);
    if (!bookToEdit) return;
    
    editingBookId = id;
    bookIdInput.value = id;
    titleInput.value = bookToEdit.title;
    authorInput.value = bookToEdit.author;
    yearInput.value = bookToEdit.year || '';
    statusSelect.value = bookToEdit.status;
    
    saveBtn.textContent = 'Atualizar';
    saveBtn.classList.add('btn-update');
    
    // Rolagem suave para o formulário
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function filterBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    
    let filteredBooks = books;
    
    // Filtrar por termo de busca
    if (searchTerm) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por status
    if (statusFilterValue) {
        filteredBooks = filteredBooks.filter(book => book.status === statusFilterValue);
    }
    
    renderBooks(filteredBooks);
}

function resetFilters() {
    searchInput.value = '';
    statusFilter.value = '';
    renderBooks();
}

function resetForm() {
    bookForm.reset();
    bookIdInput.value = '';
    editingBookId = null;
    saveBtn.textContent = 'Salvar';
    saveBtn.classList.remove('btn-update');
    
    // Resetar mensagens de erro
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

// Funções auxiliares
function saveToLocalStorage() {
    localStorage.setItem('books', JSON.stringify(books));
}

function getStatusClass(status) {
    switch (status) {
        case 'Lido': return 'status-read';
        case 'Lendo': return 'status-reading';
        default: return 'status-not-read';
    }
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}