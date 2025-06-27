import { useSQLiteContext } from "expo-sqlite";

export type FoodDatabase = {
    id: number;
    name: string;
    calories: number;
    date: Date;
    id_user: number;
}

export function useFoodsDatabase() {
    const database = useSQLiteContext();

    async function create(data: Omit<FoodDatabase, "id">) {
        const statement = await database.prepareAsync(
            "INSERT INTO foods (name, calories, id_user) VALUES ($name, $calories, $id_user);"
        )

        try {
            const result = await statement.executeAsync({
                $name: data.name,
                $calories: data.calories,
                $id_user: data.id_user
            })

            const insertedRowId = result.lastInsertRowId.toLocaleString()
            return { insertedRowId }

        } catch (error) {
            throw error
        } finally {
            await statement.finalizeAsync()
        }
    }

    async function listByCurrentDate(userID: number) {
        try {
            // Query corrigida para usar a coluna 'date' da tabela 'foods'
            const query = "SELECT * FROM foods WHERE DATE(current_date) = DATE('now') AND id_user = ?;";
            const foods = await database.getAllAsync(query, [userID]);
            return foods;
        } catch (error) {
            throw error
        }
    }

    async function deleteFood(id: number) {
        const statement = await database.prepareAsync(
            "DELETE FROM foods WHERE id = ?;"
        );

        try {
            await statement.executeAsync([id]);
            return true;
        } catch (error) {
            console.error("Erro ao deletar alimento:", error);
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    return { create, listByCurrentDate, deleteFood };
}