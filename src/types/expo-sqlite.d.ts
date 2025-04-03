declare module 'expo-sqlite' {
  import { ReactNode } from 'react';
  
  export interface SQLiteDatabase {
    execAsync(sql: string): Promise<void>;
    prepareAsync(sql: string): Promise<SQLiteStatement>;
    getAllAsync(sql: string, ...params: any[]): Promise<any[]>;
  }
  
  export interface SQLiteStatement {
    executeAsync(params?: Record<string, any>): Promise<SQLiteResult>;
    finalizeAsync(): Promise<void>;
  }
  
  export interface SQLiteResult {
    lastInsertRowId: number;
  }
  
  export interface SQLiteProviderProps {
    databaseName: string;
    onInit?: (database: SQLiteDatabase) => void | Promise<void>;
    children: ReactNode;
  }
  
  export const SQLiteProvider: React.FC<SQLiteProviderProps>;
  export function useSQLiteContext(): SQLiteDatabase;
} 