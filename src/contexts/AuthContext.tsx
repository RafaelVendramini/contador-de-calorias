import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUsersDatabase } from '@/database/UseUsersDatabase';

type User = {
    id: number;
    nome: string;
    email: string;
}

type AuthContextData = {
    user: User | null;
    signIn: (email: string, senha: string) => Promise<void>;
    signUp: (nome: string, email: string, senha: string) => Promise<void>;
    signOut: () => void;
    updateUser: (data: Partial<Omit<User, 'id'>>) => Promise<void>;
    updatePassword: (senhaAtual: string, novaSenha: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const userDatabase = useUsersDatabase();

    useEffect(() => {
        // Aqui você pode implementar a lógica para verificar se o usuário está logado
        // Por exemplo, verificando um token armazenado
    }, []);

    const signIn = async (email: string, senha: string) => {
        try {
            const user = await userDatabase.findByEmail(email);

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            if (user.password !== senha) {
                throw new Error('Senha incorreta');
            }

            setUser({
                id: user.id,
                nome: user.name,
                email: user.email
            });

            router.replace('/home');
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const signUp = async (nome: string, email: string, senha: string) => {
        try {
            const existingUser = await userDatabase.findByEmail(email);

            if (existingUser) {
                throw new Error('Email já cadastrado');
            }

            const response = await userDatabase.create({
                nome,
                email,
                senha
            });

            const newUser = await userDatabase.findByEmail(email);

            if (!newUser) {
                throw new Error('Erro ao criar usuário');
            }

            setUser({
                id: newUser.id,
                nome: newUser.nome,
                email: newUser.email
            });

            router.replace('/home');
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const signOut = () => {
        setUser(null);
        router.replace('/');
    };

    const updateUser = async (data: Partial<Omit<User, 'id'>>) => {
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        try {
            await userDatabase.update(user.id, data);

            // Atualiza o estado do usuário com os novos dados
            setUser({
                ...user,
                ...data
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const updatePassword = async (senhaAtual: string, novaSenha: string) => {
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const currentUser = await userDatabase.findByEmail(user.email);

            if (!currentUser) {
                throw new Error('Usuário não encontrado');
            }

            if (currentUser.senha !== senhaAtual) {
                throw new Error('Senha atual incorreta');
            }

            await userDatabase.update(user.id, { senha: novaSenha });
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signUp, signOut, updateUser, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
} 