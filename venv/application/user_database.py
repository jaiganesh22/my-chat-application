import sqlite3
from sqlite3 import Error
from datetime import datetime
import time


FILE = "users.db"
USER_TABLE = "Usertable"
ROOMS_TABLE = "Roomtable"


class user_Db:
    """Stores the information of registered users and
    the chat rooms users are registered in
    user_Table: User Information
    rooms_Table: User friends and Chat Rooms Information"""

    def __init__(self):
        self.conn = None
        try:
            self.conn = sqlite3.connect(FILE)
        except Error as e:
            print(e)

        self.cursor = self.conn.cursor()
        self._initialize_tables()

    def _initialize_tables(self):
        query1 = f"""CREATE TABLE IF NOT EXISTS {USER_TABLE}
                    (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, username TEXT,
                     email TEXT ,password TEXT, age INTEGER, gender TEXT )"""

        query2 = f"""CREATE TABLE IF NOT EXISTS {ROOMS_TABLE}
                    (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, username TEXT,
                    friends TEXT, chat_rooms TEXT)"""

        self.cursor.execute(query1)
        self.cursor.execute(query2)
        self.conn.commit()

    def register_user(self, name, username, email, password, age, gender):
        query1 = f"""INSERT INTO {USER_TABLE} VALUES (? ,?, ?, ?, ?, ?, ?)"""

        query2 = f"""INSERT INTO {ROOMS_TABLE} VALUES (?, ?, ?, ?, ?)"""
        self.cursor.execute(query1, (None, name, username, email, password, age, gender))
        self.cursor.execute(query2, (None, name, username, "default_friend", "common_room"))
        self.conn.commit()

    def register_friend(self, username, friend):
        conn = sqlite3.connect(FILE)
        cursor = conn.cursor()
        query = f"""INSERT INTO {ROOMS_TABLE} VALUES(?, ?, ?, ?, ?)"""

        chat_room = "room " + username + "_" + friend
        query2 = f"""SELECT * FROM {ROOMS_TABLE} where username = ?"""
        cursor.execute(query2,(username,))
        user_info = cursor.fetchone()
        name = user_info[1]
        print(name)
        cursor.execute(query, (None, name, username, friend, chat_room))
        conn.commit()
        cursor.execute(query2, (friend,))
        user_info = cursor.fetchone()
        name = user_info[1]
        cursor.execute(query, (None, name, friend, username, chat_room))
        conn.commit()

    def check_user(self, username):
        conn = sqlite3.connect(FILE)
        cursor = conn.cursor()
        query = f"SELECT * FROM {USER_TABLE} WHERE username = ?"
        cursor.execute(query, (username,))
        user = cursor.fetchone()
        if(user): 
            return True
        return False
    
    def get_user(self, username):
        conn = sqlite3.connect(FILE)
        cursor = conn.cursor()
        query = f"SELECT * FROM {USER_TABLE} WHERE username = ?"
        cursor.execute(query, (username,))
        user = cursor.fetchone()
        print(user)
        user_dict = {"id" : user[0], "name": user[1], "username": user[2], "email": user[3], "password": user[4], "age": user[5],
                    "gender": user[6]}
        #print(user)
        return user_dict

    def get_chat_rooms(self, username):
        conn = sqlite3.connect(FILE)
        cursor = conn.cursor()
        query = f"SELECT * FROM {ROOMS_TABLE} WHERE username = ?"
        cursor.execute(query, (username,))
        rooms = cursor.fetchall()
        rooms_list = []
        for room in rooms:
            room_dict = {"id": room[0], "name": room[1], "username": room[2], "friend": room[3], "chat_room": room[4]}
            rooms_list.append(room_dict)
        return rooms_list

    def get_all_users(self):
        conn = sqlite3.connect(FILE)
        cursor = conn.cursor()
        query = f"SELECT * FROM {USER_TABLE}"
        cursor.execute(query)
        users = cursor.fetchall()
        return users






