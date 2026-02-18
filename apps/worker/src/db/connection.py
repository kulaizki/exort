import psycopg2
from src.config import DATABASE_URL


def get_connection():
    return psycopg2.connect(DATABASE_URL)
