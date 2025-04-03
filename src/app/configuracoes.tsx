import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Input } from '@/components/Input';
import { useAuth } from '@/contexts/AuthContext';

export default function Configuracoes() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [errors, setErrors] = useState({
        nome: '',
        email: '',
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });

    const { user, signOut, updateUser, updatePassword } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setNome(user.nome);
            setEmail(user.email);
        }
    }, [user]);

    const validateInputs = () => {
        let isValid = true;
        const newErrors = {
            nome: '',
            email: '',
            senhaAtual: '',
            novaSenha: '',
            confirmarSenha: ''
        };

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

        // Validação da senha atual (se estiver alterando a senha)
        if (senhaAtual.trim() || novaSenha.trim() || confirmarSenha.trim()) {
            if (!senhaAtual.trim()) {
                newErrors.senhaAtual = 'A senha atual é obrigatória';
                isValid = false;
            }

            if (!novaSenha.trim()) {
                newErrors.novaSenha = 'A nova senha é obrigatória';
                isValid = false;
            } else if (novaSenha.length < 6) {
                newErrors.novaSenha = 'A senha deve ter pelo menos 6 caracteres';
                isValid = false;
            }

            if (novaSenha !== confirmarSenha) {
                newErrors.confirmarSenha = 'As senhas não coincidem';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const salvarAlteracoes = async () => {
        if (!validateInputs()) {
            return;
        }

        try {
            await updateUser({
                nome,
                email
            });

            Alert.alert(
                "Sucesso",
                "Suas informações foram atualizadas com sucesso!",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Ocorreu um erro ao atualizar suas informações");
        }
    };

    const alterarSenha = async () => {
        if (!validateInputs()) {
            return;
        }

        try {
            await updatePassword(senhaAtual, novaSenha);

            Alert.alert(
                "Sucesso",
                "Sua senha foi alterada com sucesso!",
                [{ text: "OK", onPress: () => {
                    setSenhaAtual('');
                    setNovaSenha('');
                    setConfirmarSenha('');
                }}]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Ocorreu um erro ao alterar sua senha");
        }
    };

    if (!user) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Configurações</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações Pessoais</Text>
                    <Input 
                        placeholder="Nome" 
                        value={nome} 
                        onChangeText={setNome}
                        error={errors.nome}
                    />
                    <Input 
                        placeholder="Email" 
                        value={email} 
                        onChangeText={setEmail}
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.button} onPress={salvarAlteracoes}>
                        <Text style={styles.buttonText}>Salvar Alterações</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alterar Senha</Text>
                    <Input 
                        placeholder="Senha Atual" 
                        value={senhaAtual} 
                        onChangeText={setSenhaAtual}
                        error={errors.senhaAtual}
                        secureTextEntry
                    />
                    <Input 
                        placeholder="Nova Senha" 
                        value={novaSenha} 
                        onChangeText={setNovaSenha}
                        error={errors.novaSenha}
                        secureTextEntry
                    />
                    <Input 
                        placeholder="Confirmar Nova Senha" 
                        value={confirmarSenha} 
                        onChangeText={setConfirmarSenha}
                        error={errors.confirmarSenha}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.button} onPress={alterarSenha}>
                        <Text style={styles.buttonText}>Alterar Senha</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Conta</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                        <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
                        <Text style={styles.logoutText}>Sair da Conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#4CAF50',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ff6b6b',
    },
    logoutText: {
        color: '#ff6b6b',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
}); 