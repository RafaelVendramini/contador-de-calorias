import { useState } from 'react';
import {View, Text, Button, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/Input';
import {useUsersDatabase} from "@/database/UseUsersDatabase"
import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from 'expo-router';

export default function Cadastro () {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ nome: '', email: '', password: '' });

    const productDatabase = useUsersDatabase();
    const { signIn } = useAuth();
    const router = useRouter();

    const validateInputs = () => {
        let isValid = true;
        const newErrors = { nome: '', email: '', password: '' };

        // Validação do nome
        if (!nome.trim()) {
            newErrors.nome = 'O nome é obrigatório';
            isValid = false;
        }

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
        } else if (password.length < 6) {
            newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    async function create(){
        if (!validateInputs()) {
            return;
        }

        try {
            console.log("NOME", nome);
            const response = await productDatabase.create({nome, email, senha: password});
            
            // Faz login automático após o cadastro
            await signIn(email, password);
            
            Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
            router.push('/home');
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Ocorreu um erro ao realizar o cadastro");
        }
    }

    async function list(){
        try{
            const response = await productDatabase.searchUser(email, password);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }

    return <SafeAreaView style={{flex: 1, justifyContent: 'center', padding:32,gap:16}}>
            <Text style={{textAlign: 'center', fontSize:28, fontWeight: "bold"}}>Cadastro</Text>
            <Input 
                placeholder='Nome' 
                onChangeText={setNome} 
                value={nome}
                error={errors.nome}
            />
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
            <Button title='Cadastrar' onPress={create}/>

            <Link href="/login" style={{ textAlign: 'center', color: 'blue', marginTop: 50 }}>
                <Text>Ir para Login</Text>
            </Link>
    </SafeAreaView>;
}