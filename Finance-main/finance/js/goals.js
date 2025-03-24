// Добавление цели
document.getElementById('add-goal-btn').addEventListener('click', function() {
    const formHTML = `
        <form id="goal-form">
            <div>
                <label>Название цели:</label>
                <input type="text" id="goal-name" required>
            </div>
            <div>
                <label>Целевая сумма:</label>
                <input type="number" id="goal-target" min="0" step="0.01" required>
            </div>
            <div>
                <label>Текущая сумма:</label>
                <input type="number" id="goal-current" min="0" step="0.01" value="0">
            </div>
            <div>
                <label>Дата завершения:</label>
                <input type="date" id="goal-deadline" required>
            </div>
            <div>
                <label>Описание:</label>
                <textarea id="goal-description"></textarea>
            </div>
            <button type="submit">Сохранить</button>
            <button type="button" id="cancel-goal">Отмена</button>
        </form>
    `;
    
    const goalsList = document.getElementById('goals-list');
    goalsList.innerHTML = formHTML + goalsList.innerHTML;
    
    // Устанавливаем дату на 1 месяц вперед по умолчанию
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('goal-deadline').valueAsDate = nextMonth;
    
    // Отмена
    document.getElementById('cancel-goal').addEventListener('click', updateGoalsList);
    
    // Сохранение
    document.getElementById('goal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveGoal();
    });
});

function saveGoal() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Необходимо войти в систему!');
        return;
    }
    
    const goal = {
        id: Date.now().toString(),
        userId: user.id,
        name: document.getElementById('goal-name').value,
        targetAmount: parseFloat(document.getElementById('goal-target').value),
        currentAmount: parseFloat(document.getElementById('goal-current').value) || 0,
        deadline: document.getElementById('goal-deadline').value,
        description: document.getElementById('goal-description').value,
        createdAt: new Date().toISOString()
    };
    
    // Получаем существующие цели или создаем новый массив
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    goals.push(goal);
    localStorage.setItem('goals', JSON.stringify(goals));
    
    // Обновляем UI
    updateGoalsList();
}

function updateGoalsList() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    const userGoals = goals.filter(g => g.userId === user.id)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        const goalsHTML = userGoals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="goal-card">
                    <h3>${goal.name}</h3>
                    <div class="goal-progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                        <span>${progress.toFixed(1)}%</span>
                    </div>
                    <div class="goal-details">
                        <p>Накоплено: ${goal.currentAmount.toLocaleString('ru-RU')} ₽ из ${goal.targetAmount.toLocaleString('ru-RU')} ₽</p>
                        <p>Дней осталось: ${daysLeft > 0 ? daysLeft : 'срок истек'}</p>
                        <p>Дата завершения: ${new Date(goal.deadline).toLocaleDateString()}</p>
                        ${goal.description ? `<p>Описание: ${goal.description}</p>` : ''}
                    </div>
                    <div class="goal-actions">
                        <button class="add-to-goal" data-id="${goal.id}">Добавить средства</button>
                        <button class="delete-goal" data-id="${goal.id}">Удалить</button>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('goals-list').innerHTML = goalsHTML || '<p>У вас пока нет финансовых целей.</p>';
        
        // Обработчики кнопок
        document.querySelectorAll('.add-to-goal').forEach(btn => {
            btn.addEventListener('click', function() {
                const goalId = this.getAttribute('data-id');
                addFundsToGoal(goalId);
            });
        });
        
        document.querySelectorAll('.delete-goal').forEach(btn => {
            btn.addEventListener('click', function() {
                const goalId = this.getAttribute('data-id');
                deleteGoal(goalId);
            });
        });
    }
    
    function addFundsToGoal(goalId) {
        const amount = parseFloat(prompt('Введите сумму для добавления к цели:'));
        if (isNaN(amount) || amount <= 0) return;
        
        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        const goalIndex = goals.findIndex(g => g.id === goalId);
        
        if (goalIndex !== -1) {
            goals[goalIndex].currentAmount += amount;
            localStorage.setItem('goals', JSON.stringify(goals));
            
            // Обновляем UI
            updateGoalsList();
            
            // Создаем транзакцию расхода (как вложение в цель)
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user) {
                const transaction = {
                    id: Date.now().toString(),
                    userId: user.id,
                    type: 'expense',
                    amount: amount,
                    category: 'Накопления',
                    date: new Date().toISOString().split('T')[0],
                    description: `Вложение в цель: ${goals[goalIndex].name}`
                };
                
                const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
                transactions.push(transaction);
                localStorage.setItem('transactions', JSON.stringify(transactions));
                
                updateDashboard();
                updateTransactionsList();
            }
        }
    }
    
    function deleteGoal(goalId) {
        if (confirm('Вы уверены, что хотите удалить эту цель?')) {
            const goals = JSON.parse(localStorage.getItem('goals')) || [];
            const updatedGoals = goals.filter(g => g.id !== goalId);
            localStorage.setItem('goals', JSON.stringify(updatedGoals));
            updateGoalsList();
        }
    }
    
    // Инициализация списка целей при загрузке страницы
    document.addEventListener('DOMContentLoaded', updateGoalsList);