// script.js
let users = [
    { phone: '+7 (999) 999-99-99', password: 'finovateplus', isAdmin: false },
    { phone: '+7 (999) 349-21-27', password: 'bogdan2005B', isAdmin: true }
];

let userData = {
    name: 'Богдан Фомичев',
    phone: '+7 (999) 999-99-99',
    passport: '',
    inn: '',
    balance: 3469.52,
    cards: [
        { type: 'finovate', number: '••••1018', balance: 3469.52 },
        { type: 'sber', number: '••••0000', balance: 0 }
    ],
    transactions: [],
    subscriptions: [
        { id: 'netflix', name: 'Netflix', price: '$24.99/мес', active: true },
        { id: 'okko', name: 'Okko', price: '799 руб/мес', active: true },
        { id: 'disney', name: 'Disney+', price: '$15.99/мес', active: true }
    ]
};

// Генерация случайных данных
function generateRandomData() {
    const passportSeries = Math.floor(Math.random() * 9000) + 1000;
    const passportNumber = Math.floor(Math.random() * 900000) + 100000;
    userData.passport = `${passportSeries} ${passportNumber}`;
    
    const inn = Math.floor(Math.random() * 9000000000) + 1000000000;
    userData.inn = inn.toString();
}

// Показать экран
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Обновить данные при переходе на профиль
    if (screenId === 'profile-screen') {
        updateProfileScreen();
    }
}

// Обновить экран профиля
function updateProfileScreen() {
    document.getElementById('passport-number').textContent = userData.passport;
    document.getElementById('inn-number').textContent = userData.inn;
}

// Маска для телефона
function applyPhoneMask(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        let formatted = '+7 (';
        if (value.length > 1) formatted += value.slice(1, 4);
        if (value.length >= 4) formatted += ') ' + value.slice(4, 7);
        if (value.length >= 7) formatted += '-' + value.slice(7, 9);
        if (value.length >= 9) formatted += '-' + value.slice(9, 11);
        e.target.value = formatted;
    });
}

// Авторизация
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.phone === phone && u.password === password);
    
    if (user) {
        if (user.isAdmin) {
            showScreen('admin-panel');
            showNotification('Добро пожаловать в админскую панель!');
        } else {
            generateRandomData();
            showScreen('main-screen');
            showNotification('Добро пожаловать!');
        }
    } else {
        showNotification('Неверный логин или пароль', 'error');
    }
});

// Добавление нового пользователя
document.getElementById('add-user-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newPhone = document.getElementById('new-phone').value;
    const newPassword = document.getElementById('new-password').value;
    
    if (users.some(u => u.phone === newPhone)) {
        showNotification('Пользователь с таким номером уже существует', 'error');
        return;
    }
    
    users.push({ phone: newPhone, password: newPassword, isAdmin: false });
    showNotification('Новый пользователь добавлен!');
    this.reset();
});

// Выпуск карты
function issueCard(cardType) {
    const newCard = {
        type: cardType,
        number: '••••' + Math.floor(Math.random() * 9000 + 1000),
        balance: 0
    };
    
    userData.cards.push(newCard);
    showNotification(`Карта ${cardType} успешно выпущена!`);
    showScreen('cards-screen');
}

// Перевод между картами
document.getElementById('card-transfer-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fromCard = document.getElementById('from-card').value;
    const toCard = document.getElementById('to-card').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    
    if (amount > 0) {
        userData.transactions.push({
            type: 'card_transfer',
            amount: amount,
            from: fromCard,
            to: toCard,
            date: new Date().toLocaleString()
        });
        
        showNotification(`Переведено ${amount}$ между картами`);
        this.reset();
    }
});

// Перевод другому лицу
document.getElementById('transfer-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const recipient = document.getElementById('recipient-name').value;
    const cardNumber = document.getElementById('card-number').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const comment = document.getElementById('comment').value;
    
    if (amount > 0 && amount <= userData.balance) {
        userData.balance -= amount;
        userData.transactions.push({
            type: 'external_transfer',
            recipient: recipient,
            amount: amount,
            comment: comment,
            date: new Date().toLocaleString()
        });
        
        updateBalance();
        showNotification(`Переведено ${amount}$ для ${recipient}`);
        this.reset();
    } else {
        showNotification('Недостаточно средств', 'error');
    }
});

// Выбор контакта
function selectContact(name) {
    document.getElementById('recipient-name').value = name;
}

// Метод перевода
function showTransferMethod(method) {
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.method-btn').classList.add('active');
}

// Отмена подписки
function cancelSubscription(subId) {
    const subscription = userData.subscriptions.find(sub => sub.id === subId);
    if (subscription) {
        subscription.active = false;
        showNotification(`Подписка ${subscription.name} отменена`);
        
        // Обновить отображение
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}

// Обновить баланс
function updateBalance() {
    document.querySelector('.balance-amount').textContent = `$${userData.balance.toFixed(2)}`;
}

// Загрузка фото профиля
document.getElementById('photo-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-photo').src = e.target.result;
            document.getElementById('profile-avatar').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Чат поддержки
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message) {
        const chatMessages = document.getElementById('chat-messages');
        
        // Добавить сообщение пользователя
        chatMessages.innerHTML += `
            <div class="message user">
                <div class="message-content">
                    <div class="message-text">${message}</div>
                    <div class="message-time">${new Date().toLocaleTimeString().slice(0, 5)}</div>
                </div>
                <div class="message-avatar">Б</div>
            </div>
        `;
        
        input.value = '';
        
        // Автоответ через 2 секунды
        setTimeout(() => {
            chatMessages.innerHTML += `
                <div class="message support">
                    <div class="message-avatar">🎧</div>
                    <div class="message-content">
                        <div class="message-text">Спасибо за сообщение! Мы рассмотрим ваш вопрос в ближайшее время.</div>
                        <div class="message-time">${new Date().toLocaleTimeString().slice(0, 5)}</div>
                    </div>
                </div>
            `;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#ff4444' : '#4caf50'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Показать экран входа
    showScreen('login-screen');
    
    // Применить маску к полю телефона в логине
    applyPhoneMask(document.getElementById('phone'));
    
    // Применить маску к полю нового телефона в админке
    applyPhoneMask(document.getElementById('new-phone'));
    
    // Обработчик Enter для отправки сообщений в чате
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
