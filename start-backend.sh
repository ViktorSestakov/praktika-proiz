#!/bin/bash
echo "Запуск бэкэнд!"
echo ""

cd backend

# Проверяем есть ли venv
if [ ! -d "venv" ]; then
    echo "Создание виртуального окружения..."
    python3 -m venv venv
fi

# Запускаем приложение
python app.py
