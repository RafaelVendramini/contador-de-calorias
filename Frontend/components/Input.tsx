import { TextInput, TextInputProps, View, Text } from "react-native";

interface InputProps extends TextInputProps {
    error?: string;
}

export function Input({ error, ...rest}: InputProps) {
    return (
        <View>
            <TextInput
                style={{
                    height: 40,
                    borderWidth: 1,
                    borderRadius: 7,
                    borderColor: error ? "#ff0000" : "#999",
                    paddingHorizontal: 16,
                }}
                {...rest} 
            />
            {error ? (
                <Text style={{ color: "#ff0000", fontSize: 12, marginTop: 4 }}>
                    {error}
                </Text>
            ) : null}
        </View>
    );
}