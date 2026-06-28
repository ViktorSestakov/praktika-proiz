#!/bin/bash

# Запуск Backend на Linux/Mac

echo "🔧 Запуск Backend (Flask)..."
echo ""

cd backend

# Проверяем есть ли venv
if [ ! -d "venv" ]; then
    echo "📦 Создаю виртуальное окружение..."
    python3 -m venv venv
fi

# Активируем venv
source venv/bin/activate

# Устанавливаем зависимости
echo "📚 Установка зависимостей..."
pip install -r requirements.txt

echo ""
echo "✅ Backend запущен на: http://localhostt:5000"
echo ""

# Запускаем приложение
python app.py
