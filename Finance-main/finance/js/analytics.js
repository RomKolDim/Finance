// Инициализация графиков
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('analytics-section').classList.contains('active')) {
        updateCharts();
    }
});

// Обновление графиков при переключении на вкладку аналитики
document.querySelector('a[data-section="analytics"]').addEventListener('click', updateCharts);

function updateCharts() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const userTransactions = transactions.filter(t => t.userId === user.id);
    
    // График расходов по категориям
    const expenseTransactions = userTransactions.filter(t => t.type === 'expense');
    const expensesByCategory = {};
    
    expenseTransactions.forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });
    
    const expenseCtx = document.getElementById('expenses-chart').getContext('2d');
    if (window.expenseChart) window.expenseChart.destroy();
    
    window.expenseChart = new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(expensesByCategory),
            datasets: [{
                data: Object.values(expensesByCategory),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#8AC24A', '#607D8B'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Расходы по категориям'
                }
            }
        }
    });
    
    // График доходов по категориям
    const incomeTransactions = userTransactions.filter(t => t.type === 'income');
    const incomeByCategory = {};
    
    incomeTransactions.forEach(t => {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    });
    
    const incomeCtx = document.getElementById('income-chart').getContext('2d');
    if (window.incomeChart) window.incomeChart.destroy();
    
    window.incomeChart = new Chart(incomeCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(incomeByCategory),
            datasets: [{
                label: 'Доходы по категориям',
                data: Object.values(incomeByCategory),
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}