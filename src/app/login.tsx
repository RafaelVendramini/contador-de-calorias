import { useState } from 'react';
import {Text, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { useUsersDatabase } from '@/database/UseUsersDatabase';
import { useAuth } from '@/contexts/AuthContext';

import { Link, useRouter } from "expo-router";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });

    const userDataBase = useUsersDatabase();
    const router = useRouter();
    const { signIn } = useAuth();

    const validateInputs = () => {
        let isValid = true;
        const newErrors = { email: '', password: '' };

        // Validação do email
        if (!email.trim()) {
            newErrors.email = 'O email é obrigatório';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Digite um email válido';
            isValid = false;
        }

        // Validação da senha
        if (!password.trim()) {
            newErrors.password = 'A senha é obrigatória';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    async function login() {
        if (!validateInputs()) {
            return;
        }

        try {
            const response = await userDataBase.searchUser(email, password);
            console.log(response);
            if (response && response.length > 0) {
                const user = response[0];
                await signIn(email, password);
                router.push('/home');
            } else {
                Alert.alert("Erro", "Email ou senha incorretos");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Ocorreu um erro ao fazer login");
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 32, gap: 16 }}>
            <Text style={{ textAlign: 'center', fontSize: 28, fontWeight: 'bold' }}>Login</Text>
            <Input 
                placeholder='Email' 
                onChangeText={setEmail} 
                value={email}
                error={errors.email}
            />
            <Input 
                placeholder='Password' 
                onChangeText={setPassword} 
                value={password} 
                secureTextEntry={true}
                error={errors.password}
            />
            <Button title='Login' onPress={login} />
            
            <Link href="/cadastro" style={{ textAlign: 'center', color: 'blue', marginTop: 50 }}>
                <Text>Ir para Cadastro</Text>
            </Link>
        </SafeAreaView>
    );
}