#!/bin/bash
echo "Запуск фронтэнд!"
echo ""

cd frontend

echo "Сайт запущен на: http://localhostt:8000"

# Запускаем HTTP сервер
python3 -m http.server 8000
