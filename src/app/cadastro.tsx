import { useState } from 'react';
import {View, Text, Alert, StyleSheet, TouchableOpacity} from 'react-native'; // Alterado: Adicionado StyleSheet, TouchableOpacity e removido Button
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cadastro</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.formCard}>
                    <Input 
                        placeholder='Nome' 
                        onChangeText={setNome} 
                        value={nome}
                        error={errors.nome}
                        style={styles.input}
                    />
                    <Input 
                        placeholder='Email' 
                        onChangeText={setEmail} 
                        value={email}
                        error={errors.email}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Input 
                        placeholder='Senha' 
                        onChangeText={setPassword} 
                        value={password} 
                        secureTextEntry={true}
                        error={errors.password}
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.button} onPress={create}>
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    </TouchableOpacity>

                    <Link href="/login" asChild>
                        <TouchableOpacity style={styles.linkContainer}>
                            <Text style={styles.linkText}>Já tem uma conta? Ir para Login</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        paddingTop: 40, // Adicionado para dar mais espaço no topo em SafeAreaView
        backgroundColor: '#4CAF50', // Cor verde do home
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center', // Centralizar título do header
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        gap: 16, // Espaçamento entre os inputs e botão
    },
    input: {
        // Estilos para Input podem ser mantidos no componente Input.tsx
        // ou sobrescritos/adicionados aqui se necessário.
        // Por ora, o Input já tem um estilo base.
    },
    button: {
        backgroundColor: '#4CAF50', // Cor verde do home
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    linkContainer: {
        marginTop: 20, // Espaçamento acima do link
    },
    linkText: {
        textAlign: 'center',
        color: '#4CAF50', // Cor verde para o link
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});