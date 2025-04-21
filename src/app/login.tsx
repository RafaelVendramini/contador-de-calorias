import { useState } from 'react';
import {Text, Button, Alert, Modal, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { useUsersDatabase } from '@/database/UseUsersDatabase';
import { useAuth } from '@/contexts/AuthContext';

import { Link, useRouter } from "expo-router";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');

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

    async function handlePasswordRecovery() {
        if (!recoveryEmail.trim() || !/\S+@\S+\.\S+/.test(recoveryEmail)) {
            Alert.alert("Erro", "Digite um email válido");
            return;
        }

        try {
            // Aqui você implementaria a lógica de recuperação de senha
            Alert.alert("Sucesso", "Se o email existir, você receberá as instruções de recuperação");
            setModalVisible(false);
            setRecoveryEmail('');
        } catch (error) {
            Alert.alert("Erro", "Ocorreu um erro ao processar sua solicitação");
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View style={{ 
                padding: 24,
                flex: 1,
                gap: 24
            }}>
                <Text style={{ 
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#0F172A',
                    marginTop: 20,
                    marginBottom: 32
                }}>
                    Login
                </Text>

                <View style={{ gap: 16 }}>
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
                </View>

                <View style={{ gap: 12 }}>
                    <TouchableOpacity 
                        onPress={login}
                        style={{
                            backgroundColor: '#0F172A',
                            padding: 16,
                            borderRadius: 8,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                            Login
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={{ 
                            textAlign: 'center',
                            color: '#0F172A',
                            fontSize: 14,
                            textDecorationLine: 'underline'
                        }}>
                            Esqueceu sua senha?
                        </Text>
                    </TouchableOpacity>

                    <Link href="/cadastro" asChild>
                        <TouchableOpacity>
                            <Text style={{ 
                                textAlign: 'center',
                                color: '#0F172A',
                                fontSize: 14,
                                textDecorationLine: 'underline'
                            }}>
                                Ir para Cadastro
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)'
                }}>
                    <View style={{
                        backgroundColor: '#FFFFFF',
                        padding: 24,
                        borderRadius: 16,
                        width: '90%',
                        gap: 24
                    }}>
                        <Text style={{ 
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#0F172A',
                            textAlign: 'center'
                        }}>
                            Recuperação de Senha
                        </Text>
                        <Input
                            placeholder='Digite seu email'
                            onChangeText={setRecoveryEmail}
                            value={recoveryEmail}
                        />
                        <View style={{ gap: 12 }}>
                            <TouchableOpacity 
                                onPress={handlePasswordRecovery}
                                style={{
                                    backgroundColor: '#0F172A',
                                    padding: 16,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                                    Enviar
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                onPress={() => {
                                    setModalVisible(false);
                                    setRecoveryEmail('');
                                }}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#0F172A',
                                    padding: 16,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '600' }}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}