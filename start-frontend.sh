#!/bin/bash

# Запуск Frontend на Linux/Mac

echo "🎨 Запуск Frontend..."
echo ""

cd frontend

echo "✅ Frontend запущен на: http://localhostt:8000"
echo ""
echo "📝 Форма заявки: http://localhostt:8000"
echo "📊 Панель управления: http://localhostt:8000/admin.html"
echo ""

# Запускаем HTTP сервер
python3 -m http.server 8000
