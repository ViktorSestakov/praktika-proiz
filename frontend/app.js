// Theme toggle (без изменений)
(function() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    function updateToggleUI(theme) {
        const thumb = document.getElementById('toggleThumb');
        if (thumb) thumb.textContent = theme === 'dark' ? '🌙' : '☀️';
    }

    document.addEventListener('DOMContentLoaded', function() {
        updateToggleUI(document.documentElement.getAttribute('data-theme'));

        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', function() {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                updateToggleUI(next);
            });
        }
    });
})();

// API conf
const API_URL = 'http://localhost:6767/api';

// Utils (без изменений)
function showMessage(text, type = 'success') {
    const messagesDiv = document.getElementById('messages');
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    messagesDiv.appendChild(message);
    setTimeout(() => message.remove(), 5000);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^(\+7|8)\d{10}$/.test(cleaned);
}

function validateEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Form Page (без изменений)
if (document.getElementById('applicationForm')) {
    const form = document.getElementById('applicationForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const last_name = document.getElementById('last_name').value.trim();
        const first_name = document.getElementById('first_name').value.trim();
        const patronymic = document.getElementById('patronymic').value.trim();
        const organization = document.getElementById('organization').value.trim();

        if (!validatePhone(phone)) {
            showMessage('Неверный формат номера телефона. Используйте +7XXXXXXXXXX или 8XXXXXXXXXX', 'error');
            return;
        }
        if (!validateEmail(email)) {
            showMessage('Неверный формат email', 'error');
            return;
        }
        if (!last_name || !first_name || !patronymic || !organization) {
            showMessage('Заполните все обязательные поля', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, email, last_name, first_name, patronymic, organization })
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('✓ Заявка успешно отправлена', 'success');
                form.reset();
            } else {
                showMessage(data.error || 'Ошибка при отправке заявки', 'error');
            }
        } catch (error) {
            showMessage('Ошибка подключения к серверу', 'error');
            console.error(error);
        }
    });
}

// Admin Page (исправленное автообновление)
if (document.getElementById('applicationsTable')) {
    let allApplications = [];
    let currentFilter = 'all';

    async function loadApplications() {
        try {
            const response = await fetch(`${API_URL}/applications`);
            const data = await response.json();
            allApplications = data || [];
            renderApplications();
        } catch (error) {
            document.getElementById('applicationsTable').innerHTML =
                '<div class="empty-state"><div class="empty-state-image">⚠️</div><div class="empty-state-text">Ошибка при загрузке заявок</div></div>';
            console.error(error);
        }
    }

    function renderApplications() {
        const table = document.getElementById('applicationsTable');
        let filtered = currentFilter === 'all'
            ? allApplications
            : allApplications.filter(app => app.status === currentFilter);

        if (filtered.length === 0) {
            table.innerHTML = '<div class="empty-state"><div class="empty-state-image">📭</div><div class="empty-state-text">Нет заявок</div></div>';
            return;
        }

        table.innerHTML = filtered.map(app => {
            const showProcessing = app.status !== 'new';
            const isCompleted = app.status === 'completed';
            const isProcessing = app.status === 'processing';

            const resultCall = app.result_call || '';
            const note = app.note || '';

            let processingHtml = '';
            if (showProcessing) {
                if (isCompleted) {
                    processingHtml = `
                        <div class="processing-block">
                            <div class="processing-field">
                                <div class="info-label">📞 Результат звонка</div>
                                <div class="info-value readonly">${resultCall || '—'}</div>
                            </div>
                            <div class="processing-field">
                                <div class="info-label">📝 Заметка</div>
                                <div class="info-value readonly">${note || '—'}</div>
                            </div>
                        </div>
                    `;
                } else if (isProcessing) {
                    processingHtml = `
                        <div class="processing-block editable">
                            <div class="processing-field">
                                <div class="info-label">📞 Результат звонка</div>
                                <textarea class="processing-textarea" id="result_call_${app._id}" rows="2">${resultCall}</textarea>
                            </div>
                            <div class="processing-field">
                                <div class="info-label">📝 Заметка</div>
                                <textarea class="processing-textarea" id="note_${app._id}" rows="3">${note}</textarea>
                            </div>
                            <button class="btn btn-primary btn-small" onclick="saveApplicationDetails('${app._id}')">Сохранить изменения</button>
                        </div>
                    `;
                }
            }

            return `
                <div class="application-card" id="card-${app._id}">
                    <div class="application-header">
                        <div class="application-name">${app.last_name} ${app.first_name} ${app.patronymic}</div>
                        <span class="application-status status-${app.status}">${getStatusLabel(app.status)}</span>
                    </div>
                    <div class="application-info">
                        <div class="info-field">
                            <div class="info-label">Телефон</div>
                            <div class="info-value">${app.phone}</div>
                        </div>
                        <div class="info-field">
                            <div class="info-label">Email</div>
                            <div class="info-value">${app.email}</div>
                        </div>
                        <div class="info-field">
                            <div class="info-label">Организация</div>
                            <div class="info-value">${app.organization}</div>
                        </div>
                        <div class="info-field">
                            <div class="info-label">Дата создания</div>
                            <div class="info-value">${new Date(app.created_at).toLocaleDateString('ru-RU')}</div>
                        </div>
                    </div>
                    ${processingHtml}
                    <div class="application-actions">
                        <select class="status-select" onchange="updateStatus('${app._id}', this.value)">
                            <option value="new" ${app.status === 'new' ? 'selected' : ''}>Новая</option>
                            <option value="processing" ${app.status === 'processing' ? 'selected' : ''}>В обработке</option>
                            <option value="completed" ${app.status === 'completed' ? 'selected' : ''}>Завершена</option>
                        </select>
                        <button class="btn btn-delete btn-small" onclick="deleteApplication('${app._id}')">Удалить</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function getStatusLabel(status) {
        return { new: 'Новая', processing: 'В обработке', completed: 'Завершена' }[status] || status;
    }

    // Сохранение деталей (result_call и note)
    window.saveApplicationDetails = async function(appId) {
        const resultCall = document.getElementById(`result_call_${appId}`).value.trim();
        const note = document.getElementById(`note_${appId}`).value.trim();

        try {
            const response = await fetch(`${API_URL}/applications/${appId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ result_call: resultCall, note: note })
            });
            if (response.ok) {
                showMessage('✓ Данные сохранены', 'success');
                // Обновляем данные в массиве и перерисовываем таблицу
                await loadApplications(); // перезагружаем список
            } else {
                const data = await response.json();
                showMessage(data.error || 'Ошибка при сохранении', 'error');
            }
        } catch (error) {
            showMessage('Ошибка подключения к серверу', 'error');
            console.error(error);
        }
    };

    // Обновление статуса (использует универсальный PUT)
    window.updateStatus = async function(appId, status) {
        try {
            const response = await fetch(`${API_URL}/applications/${appId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                showMessage('✓ Статус обновлён', 'success');
                await loadApplications();
            } else {
                const data = await response.json();
                showMessage(data.error || 'Ошибка при обновлении статуса', 'error');
            }
        } catch (error) {
            showMessage('Ошибка подключения к серверу', 'error');
            console.error(error);
        }
    };

    // Удаление
    window.deleteApplication = async function(appId) {
        if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
            try {
                const response = await fetch(`${API_URL}/applications/${appId}`, { method: 'DELETE' });
                if (response.ok) {
                    showMessage('✓ Заявка удалена', 'success');
                    await loadApplications();
                } else {
                    showMessage('Ошибка при удалении заявки', 'error');
                }
            } catch (error) {
                showMessage('Ошибка подключения к серверу', 'error');
                console.error(error);
            }
        }
    };

    function updateFilterButtons() {
        document.querySelectorAll('.filters .btn').forEach(btn => btn.classList.remove('active'));
        const map = { all: 'filterAll', new: 'filterNew', processing: 'filterProcessing', completed: 'filterCompleted' };
        document.getElementById(map[currentFilter]).classList.add('active');
    }

    ['All', 'New', 'Processing', 'Completed'].forEach(name => {
        document.getElementById('filter' + name).addEventListener('click', function() {
            currentFilter = name.toLowerCase();
            if (currentFilter === 'all') currentFilter = 'all';
            updateFilterButtons();
            renderApplications();
        });
    });

    // Загружаем при старте
    loadApplications();
}