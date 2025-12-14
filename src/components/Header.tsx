
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';


interface HeaderProps {
    compact?: boolean;
    lessonTitle?: string;
}

export default function Header({ compact = false, lessonTitle }: HeaderProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, compact && styles.compactContainer]}>
            <View style={[
                styles.logoContainer,
                { backgroundColor: colors.text },
                compact && styles.compactLogoContainer
            ]}>
                <Text style={[styles.icon, compact && styles.compactIcon]}>💡</Text>
            </View>
            <View>
                <Text style={[styles.title, { color: colors.text }, compact && styles.compactTitle]}>
                    Smart English Lessons
                </Text>

                {lessonTitle && (
                    <Text style={[styles.lessonTitle, { color: colors.accent }]}>
                        {lessonTitle}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    compactContainer: {
        marginBottom: 5,
        justifyContent: 'flex-start',
    },
    logoContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    compactLogoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    icon: {
        fontSize: 32,
    },
    compactIcon: {
        fontSize: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    compactTitle: {
        fontSize: 16,
        textShadowRadius: 1,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 4,
    },
    lessonTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 8,
    },

});
