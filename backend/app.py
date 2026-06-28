from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from models import Database
from config import MONGODB_URI

app = Flask(__name__)
CORS(app)

db = Database()

def validate_phone(phone):
    pattern = r'^(\+7|8)\d{10}$'
    return re.match(pattern, phone.replace(' ', '').replace('-', '')) is not None

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@app.route('/api/applications', methods=['POST'])
def create_application():
    try:
        data = request.json
        required_fields = ['phone', 'email', 'last_name', 'first_name', 'patronymic', 'organization']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Поле {field} обязательно'}), 400

        if not validate_phone(data['phone']):
            return jsonify({'error': 'Неверный формат номера телефона'}), 400
        if not validate_email(data['email']):
            return jsonify({'error': 'Неверный формат email'}), 400

        app_id = db.create_application(data)
        return jsonify({'success': True, 'id': app_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications', methods=['GET'])
def get_applications():
    try:
        applications = db.get_all_applications()
        return jsonify(applications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications/<app_id>', methods=['GET'])
def get_application(app_id):
    try:
        application = db.get_application(app_id)
        if not application:
            return jsonify({'error': 'Заявка не найдена'}), 404
        return jsonify(application), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# НОВЫЙ УНИВЕРСАЛЬНЫЙ ЭНДПОИНТ ДЛЯ ОБНОВЛЕНИЯ
@app.route('/api/applications/<app_id>', methods=['PUT'])
def update_application(app_id):
    try:
        data = request.json
        allowed_fields = ['status', 'result_call', 'note']
        update_data = {}

        # Проверяем, что переданные поля допустимы
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        if not update_data:
            return jsonify({'error': 'Нет данных для обновления'}), 400

        # Валидация статуса, если передан
        if 'status' in update_data:
            valid_statuses = ['new', 'processing', 'completed']
            if update_data['status'] not in valid_statuses:
                return jsonify({'error': f'Статус должен быть одним из: {", ".join(valid_statuses)}'}), 400

        success = db.update_application(app_id, update_data)
        if not success:
            return jsonify({'error': 'Не удалось обновить заявку'}), 400

        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Старый эндпоинт для статуса (теперь вызывает общий)
@app.route('/api/applications/<app_id>/status', methods=['PUT'])
def update_status(app_id):
    try:
        data = request.json
        if 'status' not in data:
            return jsonify({'error': 'Поле status обязательно'}), 400
        # Просто передаём в общий метод
        return update_application(app_id)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications/<app_id>', methods=['DELETE'])
def delete_application(app_id):
    try:
        success = db.delete_application(app_id)
        if not success:
            return jsonify({'error': 'Заявка не найдена'}), 404
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=6767)