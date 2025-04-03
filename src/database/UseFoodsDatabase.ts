import { useSQLiteContext } from "expo-sqlite";

export type FoodDatabase = {
    id: number;
    name: string;
    calories: number;
    date: Date;
}

export function useFoodsDatabase() {
    const database = useSQLiteContext();


    async function create(data : Omit<FoodDatabase, "id">) {
        const statement = await database.prepareAsync(
            "INSERT INTO foods (name, calories) VALUES ($name, $calories);"
        )

        try {
            const result = await statement.executeAsync({
                $name: data.name,
                $calories: data.calories
            })

            const insertedRowId = result.lastInsertRowId.toLocaleString()

            return {insertedRowId}

        } catch (error) {
            throw error
        } finally {
            await statement.finalizeAsync()
        }
    }

    async function listByCurrentDate() {

        try {
            const query =  "SELECT * FROM foods WHERE current_date = CURRENT_DATE;"
            const foods = await database.getAllAsync(query);
            return foods;
            
        } catch (error) {
            throw error
        }
    }
  return {create, listByCurrentDate};
}