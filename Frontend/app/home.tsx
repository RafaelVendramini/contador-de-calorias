import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, View, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useFoodsDatabase, FoodDatabase } from "@/database/UseFoodsDatabase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from '@/components/Input';
import Toast from "react-native-toast-message";

export default function Home() {
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [foods, setFoods] = useState<FoodDatabase[]>([]);
    const [errors, setErrors] = useState({
        foodName: '',
        calories: ''
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [calorieGoal, setCalorieGoal] = useState('');
    const [calorieGoalError, setCalorieGoalError] = useState('');
    // Novo estado para o modal de sugestões
    const [suggestionsModalVisible, setSuggestionsModalVisible] = useState(false);
    const { user, signOut, updateCalorieGoal } = useAuth();
    const router = useRouter();
    const foodsDatabase = useFoodsDatabase();

    const userId = user?.id;
    
    // Redireciona para o login se não estiver autenticado
    if (!user) {
        return <Redirect href="/login" />;
    }

    // Inicializa o campo de meta diária com o valor do usuário, se existir
    useEffect(() => {
        if (user?.metaDiaria) {
            setCalorieGoal(user.metaDiaria.toString());
        }
    }, [user]);

    // Função para validar e salvar a meta diária
    const handleSaveCalorieGoal = async () => {
        // Validação do input
        if (!calorieGoal.trim()) {
            setCalorieGoalError('A meta diária é obrigatória');
            return;
        }
        
        const goalValue = Number(calorieGoal);
        if (isNaN(goalValue) || goalValue <= 0) {
            setCalorieGoalError('Digite um valor válido para a meta diária');
            return;
        }
        
        setCalorieGoalError('');
        
        try {
            await updateCalorieGoal(goalValue);
            setModalVisible(false);
            Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Meta diária atualizada com sucesso!',
                position: 'top',
            });
        } catch (error) {
            console.error('Erro ao atualizar meta diária:', error);
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível atualizar a meta diária',
                position: 'top'
            });
        }
    };

    const loadFoods = async () => {
        if (!userId) return; // Garante que userId exista
        try {
            const foodsList = await foodsDatabase.listByCurrentDate(userId) as FoodDatabase[];
            // console.log('Alimentos carregados:', foodsList); // Pode manter para debug
            setFoods(foodsList);
        } catch (error) {
            console.error('Erro ao carregar alimentos:', error);
            Alert.alert('Erro', 'Não foi possível carregar os alimentos');
        }
    };

    async function addFood() {
        if (!validateInputs() || !userId) { // Adicionado verificação de userId
            return;
        }

        try {
            await foodsDatabase.create({ // Removida atribuição a newFood se não for usada
                name: foodName,
                calories: Number(calories),
                date: new Date(), 
                id_user: userId
            });
            setFoodName('');
            setCalories('');
            loadFoods(); // Atualiza a lista após adicionar
        } catch (error) {
            console.error('Erro ao adicionar alimento:', error);
            Alert.alert('Erro', 'Não foi possível adicionar o alimento');
        }
    }

    // Removida a função listFoodsByCurrentDate pois loadFoods faz o mesmo.
    // Se preferir manter, certifique-se de que não haja duplicidade.

    useEffect(() => {
        if (userId) { // Carrega os alimentos quando o userId estiver disponível/mudar
            loadFoods();
        }
    }, [userId]); // Dependência corrigida

    const totalCalories = foods.reduce((total, food) => total + food.calories, 0);

    const validateInputs = () => {
        let isValid = true;
        const newErrors = {
            foodName: '',
            calories: ''
        };

        if (!foodName.trim()) {
            newErrors.foodName = 'O nome do alimento é obrigatório';
            isValid = false;
        }

        if (!calories.trim()) {
            newErrors.calories = 'As calorias são obrigatórias';
            isValid = false;
        } else if (isNaN(Number(calories)) || Number(calories) <= 0) {
            newErrors.calories = 'Digite um valor válido para as calorias';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // A função loadFoods já está definida acima e é chamada no useEffect e addFood

    // Adicione esta função para deletar um alimento
    async function handleDeleteFood(id: number) {
        try {
            await foodsDatabase.deleteFood(id);
            // Recarregar a lista após deletar
            loadFoods();
            Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Alimento removido com sucesso!',
                position: 'top',
            
            })
        } catch (error) {
            console.error("Erro ao deletar alimento:", error);
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível remover o alimento',
                position: 'top'
            });
        }
    }

    return (
    <SafeAreaView style={styles.container}>
        {/* Modal para definir meta diária */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Definir Meta Diária</Text>
                        <TouchableOpacity 
                            onPress={() => setModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.modalText}>
                        Defina sua meta diária de calorias para acompanhar seu progresso.
                    </Text>
                    
                    <TextInput
                        style={[styles.modalInput, calorieGoalError ? styles.inputError : null]}
                        placeholder="Meta diária (calorias)"
                        value={calorieGoal}
                        onChangeText={setCalorieGoal}
                        keyboardType="numeric"
                    />
                    {calorieGoalError ? (
                        <Text style={styles.errorText}>{calorieGoalError}</Text>
                    ) : null}
                    
                    <TouchableOpacity 
                        style={styles.modalButton}
                        onPress={handleSaveCalorieGoal}
                    >
                        <Text style={styles.modalButtonText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        {/* Novo Modal para sugestões de alimentos */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={suggestionsModalVisible}
            onRequestClose={() => setSuggestionsModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sugestões de Alimentos</Text>
                        <TouchableOpacity 
                            onPress={() => setSuggestionsModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.modalText}>
                        Confira algumas sugestões de alimentos e suas calorias para o seu dia:
                    </Text>
                    
                    <ScrollView style={styles.suggestionsScrollView}>
                        {/* Lista de sugestões de alimentos */}
                        <View style={styles.suggestionItem}>
                            <View style={styles.suggestionInfo}>
                                <Text style={styles.suggestionName}>Maçã</Text>
                                <Text style={styles.suggestionDescription}>Fruta rica em fibras e vitaminas</Text>
                            </View>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieText}>52</Text>
                                <Text style={styles.calorieUnit}>kcal</Text>
                            </View>
                        </View>
                        
                        <View style={styles.suggestionItem}>
                            <View style={styles.suggestionInfo}>
                                <Text style={styles.suggestionName}>Iogurte Natural</Text>
                                <Text style={styles.suggestionDescription}>Rico em proteínas e probióticos</Text>
                            </View>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieText}>59</Text>
                                <Text style={styles.calorieUnit}>kcal</Text>
                            </View>
                        </View>
                        
                        <View style={styles.suggestionItem}>
                            <View style={styles.suggestionInfo}>
                                <Text style={styles.suggestionName}>Ovo cozido</Text>
                                <Text style={styles.suggestionDescription}>Excelente fonte de proteína</Text>
                            </View>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieText}>78</Text>
                                <Text style={styles.calorieUnit}>kcal</Text>
                            </View>
                        </View>
                        
                        <View style={styles.suggestionItem}>
                            <View style={styles.suggestionInfo}>
                                <Text style={styles.suggestionName}>Aveia</Text>
                                <Text style={styles.suggestionDescription}>Rica em fibras e nutrientes</Text>
                            </View>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieText}>68</Text>
                                <Text style={styles.calorieUnit}>kcal/2 colh.</Text>
                            </View>
                        </View>
                        
                        <View style={styles.suggestionItem}>
                            <View style={styles.suggestionInfo}>
                                <Text style={styles.suggestionName}>Peito de frango grelhado</Text>
                                <Text style={styles.suggestionDescription}>Alto teor de proteína, baixo em gordura</Text>
                            </View>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieText}>165</Text>
                                <Text style={styles.calorieUnit}>kcal/100g</Text>
                            </View>
                        </View>
                        
                        <View style={styles.suggestionItem}>
                            <View style={styles.suggestionInfo}>
                                <Text style={styles.suggestionName}>Banana</Text>
                                <Text style={styles.suggestionDescription}>Rica em potássio e carboidratos</Text>
                            </View>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieText}>89</Text>
                                <Text style={styles.calorieUnit}>kcal</Text>
                            </View>
                        </View>
                        
                        <View style={styles.suggestionItem}>
                            <View style={styles.suggestionInfo}>
                                <Text style={styles.suggestionName}>Arroz integral</Text>
                                <Text style={styles.suggestionDescription}>Rico em fibras e nutrientes</Text>
                            </View>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieText}>112</Text>
                                <Text style={styles.calorieUnit}>kcal/100g</Text>
                            </View>
                        </View>
                    </ScrollView>
                    
                    <TouchableOpacity 
                        style={styles.modalButton}
                        onPress={() => {
                            setSuggestionsModalVisible(false);
                        }}
                    >
                        <Text style={styles.modalButtonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        <ScrollView 
            contentContainerStyle={styles.scrollContentContainer} 
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.title}>Contador de Calorias</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={() => router.push('/configuracoes')} style={styles.iconButton}>
                            <Ionicons name="settings-outline" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
                            <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.welcomeText}>Olá, {user.nome}!</Text>
            </View>

            {/* Container condicional para meta diária vazia */}
            {!user.metaDiaria && (
                <View style={styles.goalEmptyContainer}>
                    <Ionicons name="alert-circle-outline" size={24} color="#ff9800" />
                    <Text style={styles.goalEmptyText}>
                        Você ainda não definiu sua meta diária de calorias!
                    </Text>
                    <TouchableOpacity 
                        style={styles.goalEmptyButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.goalEmptyButtonText}>Definir Meta</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            <View style={styles.calorieCard}>
                <Text style={styles.calorieTitle}>Calorias Hoje</Text>
                <Text style={styles.calorieCount}>{totalCalories} de {user.metaDiaria ? user.metaDiaria : 0}</Text>
                <Text style={styles.calorieSubtitle}>kcal</Text>
            </View>
            
            {/* Novo botão para abrir o modal de sugestões */}
            <TouchableOpacity 
                style={styles.suggestionsButton}
                onPress={() => setSuggestionsModalVisible(true)}
            >
                <View style={styles.suggestionsButtonContent}>
                    <Ionicons name="restaurant-outline" size={24} color="white" />
                    <Text style={styles.suggestionsButtonText}>Sugestões de Alimentos</Text>
                </View>
            </TouchableOpacity>
            
            <View style={styles.addFoodSection}>
                <Text style={styles.sectionTitle}>Adicionar Alimento</Text>
                <Input 
                    placeholder="Nome do Alimento" 
                    value={foodName} 
                    onChangeText={setFoodName}
                    error={errors.foodName}
                    style={styles.input} 
                />
                <Input 
                    placeholder="Calorias" 
                    value={calories} 
                    onChangeText={setCalories}
                    error={errors.calories}
                    keyboardType="numeric"
                    style={styles.input} 
                />
                <TouchableOpacity style={styles.addButton} onPress={addFood}>
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text style={styles.addButtonText}>Adicionar</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.foodListSection}>
                <Text style={styles.sectionTitle}>Alimentos Consumidos Hoje</Text>
                {foods.length === 0 ? (
                    <View style={styles.emptyList}>
                        <Ionicons name="nutrition-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>Nenhum alimento registrado hoje</Text>
                    </View>
                ) : (
                    <FlatList
                        data={foods}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({item}) => (
                            <View style={styles.foodItem}>
                                <View style={styles.foodInfo}>
                                    <Text style={styles.foodName}>{item.name}</Text>
                                    {/* <Text style={styles.foodTime}>
                                        {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </Text> */}
                                </View>
                                <View style={styles.foodActions}>
                                    <View style={styles.calorieBadge}>
                                        <Text style={styles.calorieText}>{item.calories}</Text>
                                        <Text style={styles.calorieUnit}>kcal</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.deleteButton}
                                        onPress={() => {
                                            Alert.alert(
                                                "Confirmar exclusão",
                                                `Deseja remover ${item.name}?`,
                                                [
                                                    { text: "Cancelar", style: "cancel" },
                                                    { text: "Excluir", onPress: () => handleDeleteFood(item.id), style: "destructive" }
                                                ]
                                            );
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        style={styles.foodList}
                        scrollEnabled={false} // Adicionado para desabilitar a rolagem da FlatList
                    />
                )}
            </View>
        </ScrollView>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Estilos para o modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCloseButton: {
        padding: 5,
    },
    modalText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 8,
    },
    inputError: {
        borderColor: '#ff6b6b',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 12,
        marginBottom: 16,
    },
    modalButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Adicione estes novos estilos
    goalEmptyContainer: {
        backgroundColor: '#fff8e1',
        margin: 20,
        padding: 16,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ffe0b2',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    goalEmptyText: {
        fontSize: 14,
        color: '#f57c00',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    goalEmptyButton: {
        backgroundColor: '#ff9800',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    goalEmptyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    container: {
        // height: '100%', // Removido, flex: 1 é suficiente
        flex: 1,
        backgroundColor: '#f8f9fa', 
    },
    scrollContentContainer: { // Estilo para o container de conteúdo do ScrollView
        paddingBottom: 20, // Adiciona um pouco de espaço no final do scroll
    },
    header: {
        padding: 20,
        backgroundColor: '#4CAF50',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    logoutButton: { // Estilo para o botão de logout (segundo ícone)
        padding: 8,
        marginLeft: 15, // Adiciona espaço à esquerda, separando do ícone de configurações
    },
    headerButtons: { // Container dos botões de ícone no cabeçalho
        flexDirection: 'row',
        alignItems: 'center', // Alinha os ícones verticalmente ao centro
    },
    iconButton: { // Estilo para o botão de configurações (primeiro ícone)
        // marginLeft: 15, // Removido, pois é o primeiro item do grupo
        padding: 8, // Adicionado para consistência da área de toque
    },
    calorieCard: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    calorieTitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 8,
    },
    calorieCount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    calorieSubtitle: {
        fontSize: 16,
        color: '#999',
    },
    addFoodSection: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 15,
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
    inputContainer: {
        gap: 12,
    },
    input: {
        borderWidth: 1,
        height: 48,
        borderColor: '#e0e0e0',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    foodListSection: {
        backgroundColor: 'white',
        marginHorizontal: 20, 
        marginBottom: 20, 
        padding: 20,
        borderRadius: 15,
        // flex: 1, // Removido para permitir que o ScrollView controle o tamanho
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    foodList: {
        // flex: 1, // Removido, a FlatList se ajustará ao seu conteúdo ou ao espaço dado pelo foodListSection
        // Se a lista for muito longa e estiver dentro de um ScrollView, pode ser necessário
        // dar uma altura explícita ou garantir que o pai (foodListSection) não tenha flex:1
        // para que a FlatList não tente renderizar infinitamente.
        // No nosso caso, foodListSection não tem mais flex:1, então a FlatList deve se comportar bem.
    },
    foodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    foodTime: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    foodActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12, // Espaçamento entre o badge de calorias e o botão de deletar
    },
    calorieBadge: {
        backgroundColor: '#f0f7f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: 'center',
    },
    deleteButton: {
        padding: 8,
    },
    calorieText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    calorieUnit: {
        fontSize: 10,
        color: '#4CAF50',
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    suggestionsButton: {
        backgroundColor: '#8bc34a',
        marginHorizontal: 20,
        marginTop: -10,
        marginBottom: 20,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    suggestionsButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
    },
    suggestionsButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    
    // Estilos para o modal de sugestões
    suggestionsScrollView: {
        maxHeight: 400,
        marginBottom: 16,
    },
    suggestionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    suggestionInfo: {
        flex: 1,
        paddingRight: 10,
    },
    suggestionName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    suggestionDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});
