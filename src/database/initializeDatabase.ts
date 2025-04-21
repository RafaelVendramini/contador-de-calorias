import { type SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(database: SQLiteDatabase) {
    
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, 
            email TEXT NOT NULL, 
            password TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS foods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            calories INTEGER NOT NULL,
            current_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            id_user INTEGER NOT NULL,
            FOREIGN KEY (id_user) REFERENCES users(id)
        );`
    ); 
}