import { useSQLiteContext } from "expo-sqlite";

export type UserDatabase = {
    id: number;
    nome: string;
    email: string;
    senha: string;
    metaDiaria?: number; // Adicionado campo para meta diária
}

export function useUsersDatabase() {
    const database = useSQLiteContext();

    async function create(data: Omit<UserDatabase, "id">) {
        const statement = await database.prepareAsync(
            "INSERT INTO users (name, email, password) VALUES ($name, $email, $password);"
        );

        try {
            const result = await statement.executeAsync({
                $name: data.nome,
                $email: data.email,
                $password: data.senha
            });

            const insertedRowId = result.lastInsertRowId.toLocaleString();

            return { insertedRowId };

        } catch (error) {
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function findByEmail(email: string) {
        try {
            const query = "SELECT id, name, email, password, metaDiary FROM users WHERE email = $email;";
            const users = await database.getAllAsync(query, { $email: email });
            return users[0];
        } catch (error) {
            throw error;
        }
    }

    async function updatePasswordByEmail(email: string, newPassword: string) {
        const query = "UPDATE users SET password = $password WHERE email = $email;";
        const statement = await database.prepareAsync(query);

        console.log("Atualizando senha para email:", email);
        console.log("Nova senha:", newPassword);
        try {
            const result = await statement.executeAsync({ $email: email, $password: newPassword });
            // result.changes indica o número de linhas afetadas pelo UPDATE.
            // Se for > 0, a senha foi alterada.
            return result; 
        } catch (error) {
            console.error("Erro ao atualizar senha por email:", error);
            // Considerar se deve retornar false ou relançar o erro,
            // dependendo de como você quer que a tela de login trate isso.
            // Relançar permite que a tela de login saiba que houve um erro na operação.
            throw error; 
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function update(id: number, data: Partial<Omit<UserDatabase, "id">>) {
        const updates = [];
        const params: Record<string, any> = { $id: id };
        
        if (data.nome !== undefined) {
            updates.push("name = $name");
            params.$name = data.nome;
        }

        if (data.email !== undefined) {
            updates.push("email = $email");
            params.$email = data.email;
        }

        if (data.senha !== undefined) {
            updates.push("password = $password");
            params.$password = data.senha;
        }

        if (updates.length === 0) {
            return;
        }

        const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $id;`;
        const statement = await database.prepareAsync(query);

        try {
            await statement.executeAsync(params);
        } catch (error) {
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function searchUser(email: string, password: string){
            if(email === "" || password === ""){
                throw new Error("Email e senha são obrigatórios");
            }
            
            try{
                const query = "SELECT * FROM users WHERE email = $email AND password = $password";
                
                const response = await database.getAllAsync(query, { $email: email, $password: password });
                console.log("resposata",response);
                return response;
            } catch (error) {
                console.error(error);
                throw error;
            }
        }

    async function updateCalorieGoal(id: number, metaDiaria: number) {
        const query = "UPDATE users SET metaDiary = $metaDiary WHERE id = $id;";
        const statement = await database.prepareAsync(query);

        try {
            await statement.executeAsync({ $id: id, $metaDiary: metaDiaria });
            return true;
        } catch (error) {
            console.error("Erro ao atualizar meta diária:", error);
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    return { create, findByEmail, update, searchUser, updatePasswordByEmail, updateCalorieGoal };
}