import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/praktika-DB')
DB_NAME = 'applications_db'
COLLECTION_NAME = 'applications'
