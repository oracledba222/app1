import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AuthorFooter() {
    const { colors } = useTheme();
    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: colors.text }]}>
                Developed by Your Name
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    text: {
        fontSize: 10,
        opacity: 0.6,
    },
});
