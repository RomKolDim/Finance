// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    checkAuthStatus();
    
    // Навигация по разделам
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section') + '-section';
            
            // Скрыть все разделы
            document.querySelectorAll('main section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Показать выбранный раздел
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Обновление данных на главной странице
    updateDashboard();
});

// Проверка статуса авторизации
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
    } else {
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('register-btn').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
    }
}

// Обновление главной страницы
function updateDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    // Получаем транзакции пользователя
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const userTransactions = transactions.filter(t => t.userId === user.id);
    
    // Рассчитываем баланс
    const totalIncome = userTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Обновляем UI
    document.getElementById('total-balance').textContent = balance.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('total-income').textContent = totalIncome.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('total-expense').textContent = totalExpense.toLocaleString('ru-RU') + ' ₽';
    
    // Показываем последние транзакции
    const recentTransactions = userTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    const transactionsHTML = recentTransactions.map(t => `
        <div class="transaction">
            <span class="date">${new Date(t.date).toLocaleDateString()}</span>
            <span class="category">${t.category}</span>
            <span class="amount ${t.type}">${t.amount.toLocaleString('ru-RU')} ₽</span>
            <span class="description">${t.description || ''}</span>
        </div>
    `).join('');
    
    document.getElementById('recent-transactions').innerHTML = transactionsHTML;
}

// Выход из системы
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    checkAuthStatus();
    location.reload();
});