from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from config import MONGODB_URI, DB_NAME, COLLECTION_NAME

class Database:
    def __init__(self):
        self.client = MongoClient(MONGODB_URI)
        self.db = self.client[DB_NAME]
        self.collection = self.db[COLLECTION_NAME]

    def create_application(self, data):
        """Создать новую заявку"""
        application = {
            'phone': data['phone'],
            'email': data['email'],
            'last_name': data['last_name'],
            'first_name': data['first_name'],
            'patronymic': data['patronymic'],
            'organization': data['organization'],
            'status': 'new',
            'result_call': None,   # новое поле
            'note': None,          # новое поле
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        result = self.collection.insert_one(application)
        return str(result.inserted_id)

    def get_all_applications(self):
        """Получить все заявки"""
        applications = []
        for app in self.collection.find():
            app['_id'] = str(app['_id'])
            app['created_at'] = app['created_at'].isoformat()
            app['updated_at'] = app['updated_at'].isoformat()
            applications.append(app)
        return applications

    def get_application(self, app_id):
        """Получить конкретную заявку"""
        app = self.collection.find_one({'_id': ObjectId(app_id)})
        if app:
            app['_id'] = str(app['_id'])
            app['created_at'] = app['created_at'].isoformat()
            app['updated_at'] = app['updated_at'].isoformat()
        return app

    def update_application(self, app_id, update_data):
        """
        Универсальное обновление заявки.
        update_data содержит поля, которые нужно обновить.
        """
        update_data['updated_at'] = datetime.now()
        result = self.collection.update_one(
            {'_id': ObjectId(app_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0

    # Старый метод update_application_status теперь вызывает универсальный
    def update_application_status(self, app_id, status):
        return self.update_application(app_id, {'status': status})

    def delete_application(self, app_id):
        result = self.collection.delete_one({'_id': ObjectId(app_id)})
        return result.deleted_count > 0