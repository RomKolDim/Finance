// Добавление транзакции
document.getElementById('add-transaction-btn').addEventListener('click', function() {
    const formHTML = `
        <form id="transaction-form-content">
            <div>
                <label>Тип:</label>
                <select id="transaction-type">
                    <option value="income">Доход</option>
                    <option value="expense">Расход</option>
                </select>
            </div>
            <div>
                <label>Сумма:</label>
                <input type="number" id="transaction-amount" min="0" step="0.01" required>
            </div>
            <div>
                <label>Категория:</label>
                <select id="transaction-category"></select>
            </div>
            <div>
                <label>Дата:</label>
                <input type="date" id="transaction-date" required>
            </div>
            <div>
                <label>Описание:</label>
                <input type="text" id="transaction-description">
            </div>
            <button type="submit">Сохранить</button>
            <button type="button" id="cancel-transaction">Отмена</button>
        </form>
    `;
    
    document.getElementById('transaction-form').innerHTML = formHTML;
    document.getElementById('transaction-form').style.display = 'block';
    
    // Заполняем категории в зависимости от типа транзакции
    document.getElementById('transaction-type').addEventListener('change', updateCategories);
    updateCategories();
    
    // Устанавливаем сегодняшнюю дату по умолчанию
    document.getElementById('transaction-date').valueAsDate = new Date();
    
    // Отмена
    document.getElementById('cancel-transaction').addEventListener('click', function() {
        document.getElementById('transaction-form').style.display = 'none';
    });
    
    // Сохранение
    document.getElementById('transaction-form-content').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTransaction();
    });
});

function updateCategories() {
    const type = document.getElementById('transaction-type').value;
    const categorySelect = document.getElementById('transaction-category');
    
    const incomeCategories = ['Зарплата', 'Подарок', 'Инвестиции', 'Другое'];
    const expenseCategories = ['Еда', 'Транспорт', 'Жилье', 'Развлечения', 'Здоровье', 'Образование', 'Другое'];
    
    const categories = type === 'income' ? incomeCategories : expenseCategories;
    
    categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function saveTransaction() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Необходимо войти в систему!');
        return;
    }
    
    const transaction = {
        id: Date.now().toString(),
        userId: user.id,
        type: document.getElementById('transaction-type').value,
        amount: parseFloat(document.getElementById('transaction-amount').value),
        category: document.getElementById('transaction-category').value,
        date: document.getElementById('transaction-date').value,
        description: document.getElementById('transaction-description').value
    };
    
    // Получаем существующие транзакции или создаем новый массив
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Обновляем UI
    document.getElementById('transaction-form').style.display = 'none';
    updateDashboard();
    updateTransactionsList();
}

function updateTransactionsList() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const userTransactions = transactions.filter(t => t.userId === user.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const transactionsHTML = userTransactions.map(t => `
        <div class="transaction">
            <span class="date">${new Date(t.date).toLocaleDateString()}</span>
            <span class="category">${t.category}</span>
            <span class="amount ${t.type}">${t.amount.toLocaleString('ru-RU')} ₽</span>
            <span class="description">${t.description || ''}</span>
            <button class="delete-transaction" data-id="${t.id}">Удалить</button>
        </div>
    `).join('');
    
    document.getElementById('transactions-list').innerHTML = transactionsHTML;
    
    // Обработчики удаления
    document.querySelectorAll('.delete-transaction').forEach(btn => {
        btn.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-id');
            deleteTransaction(transactionId);
        });
    });
}

function deleteTransaction(id) {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const updatedTransactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    updateDashboard();
    updateTransactionsList();
}

// Инициализация списка транзакций при загрузке страницы
document.addEventListener('DOMContentLoaded', updateTransactionsList);