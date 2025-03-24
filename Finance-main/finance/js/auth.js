// Регистрация
document.getElementById('register-btn').addEventListener('click', function() {
    const name = prompt('Введите ваше имя:');
    if (!name) return;
    
    const email = prompt('Введите email:');
    if (!email) return;
    
    const password = prompt('Введите пароль:');
    if (!password) return;
    
    // Получаем существующих пользователей или создаем новый массив
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Проверяем, есть ли уже пользователь с таким email
    if (users.some(u => u.email === email)) {
        alert('Пользователь с таким email уже существует!');
        return;
    }
    
    // Создаем нового пользователя
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // В реальном приложении нужно хэшировать пароль!
        avatar: '',
        role: 'user'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    checkAuthStatus();
    updateDashboard();
    alert('Регистрация успешна!');
});

// Вход
document.getElementById('login-btn').addEventListener('click', function() {
    const email = prompt('Введите email:');
    if (!email) return;
    
    const password = prompt('Введите пароль:');
    if (!password) return;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        checkAuthStatus();
        updateDashboard();
        alert('Вход выполнен успешно!');
    } else {
        alert('Неверный email или пароль!');
    }
});