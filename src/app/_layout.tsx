import { Slot} from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

import { initializeDatabase } from '@/database/initializeDatabase';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Layout(){
    return (
        <SQLiteProvider databaseName='myDatabase.db' onInit={initializeDatabase}>
            <AuthProvider>
                <Slot/>
            </AuthProvider>
        </SQLiteProvider>
    )
}