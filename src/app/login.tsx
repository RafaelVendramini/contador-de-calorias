import { useState } from 'react';
import {Text, Alert, Modal, View, TouchableOpacity, StyleSheet } from 'react-native'; // Alterado: Adicionado StyleSheet e removido Button
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
    const [newPassword, setNewPassword] = useState('');

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
            Alert.alert("Erro", "Digite um email válido para recuperação.");
            return;
        }

        if (!newPassword.trim()) {
            Alert.alert("Erro", "A nova senha não pode estar vazia.");
            return;
        }

        try {
            // 1. Verificar se o usuário (email) existe no banco
            const userExists = await userDataBase.findByEmail(recoveryEmail); 
            
            if (userExists) {
                console.log("Entrei no IF", userExists)
                // 2. Se o usuário existir, atualize a senha
                const success = await userDataBase.updatePasswordByEmail(recoveryEmail, newPassword); 
                
                if (success) {
                    Alert.alert("Sucesso", "Senha atualizada com sucesso!");
                    setModalVisible(false);
                    setRecoveryEmail('');
                    setNewPassword(''); 
                } else {
                    Alert.alert("Erro", "Não foi possível atualizar a senha. Tente novamente.");
                }
            } else {
                Alert.alert("Erro", "Email não encontrado em nossa base de dados.");
            }
        } catch (error) {
            console.error("Erro na recuperação de senha:", error);
            Alert.alert("Erro", "Ocorreu um erro ao processar sua solicitação de recuperação de senha.");
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Login</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.formCard}>
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
                
                    <TouchableOpacity style={styles.button} onPress={login}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.linkContainer}>
                        <Text style={styles.linkText}>Esqueceu sua senha?</Text>
                    </TouchableOpacity>

                    <Link href="/cadastro" asChild>
                        <TouchableOpacity style={styles.linkContainer}>
                            <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
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
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Recuperação de Senha</Text>
                        <Input
                            placeholder='Digite seu email'
                            onChangeText={setRecoveryEmail}
                            value={recoveryEmail}
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Input
                            placeholder='Nova Senha'
                            onChangeText={setNewPassword}
                            value={newPassword} 
                            secureTextEntry={true}
                            style={styles.input}
                        />
                        <TouchableOpacity style={styles.button} onPress={handlePasswordRecovery}>
                            <Text style={styles.buttonText}>Enviar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.buttonOutline]}
                            onPress={() => {
                                setModalVisible(false);
                                setRecoveryEmail('');
                                setNewPassword(''); 
                            }}
                        >
                            <Text style={[styles.buttonText, styles.buttonOutlineText]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Cor de fundo do home
    },
    header: {
        padding: 20,
        paddingTop: 40, 
        backgroundColor: '#4CAF50', // Cor verde do home
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
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
        gap: 16,
    },
    input: {
        // Estilos base do Input.tsx são suficientes por enquanto
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
        marginTop: 10, // Ajuste de margem para links
    },
    linkText: {
        textAlign: 'center',
        color: '#4CAF50', // Cor verde para links
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    // Estilos do Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Overlay escuro
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        width: '90%',
        gap: 20, // Espaçamento interno do modal
        alignItems: 'stretch', // Para botões ocuparem a largura
    },
    modalTitle: {
        fontSize: 20, // Título do modal um pouco menor
        fontWeight: 'bold',
        color: '#333', // Cor escura para o título do modal
        textAlign: 'center',
        marginBottom: 10,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#4CAF50', // Contorno verde
    },
    buttonOutlineText: {
        color: '#4CAF50', // Texto verde
    }
});