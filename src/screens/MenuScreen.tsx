import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadStats } from '../utils/storage';
import { irregularVerbs } from '../data/verbs';
import { nouns } from '../data/nouns';
import { regularVerbs } from '../data/regularVerbs';
import { interviewWords } from '../data/interviewWords';
import { interviewPhrases } from '../data/interviewPhrases';
import { interviewQuestions } from '../data/interviewQuestions';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

interface MenuScreenProps {
    onStartIrregular: () => void;
    onStartNouns: () => void;
    onStartVerbs: () => void;
    onStartInterviewWords: () => void;
    onStartInterviewPhrases: () => void;
    onStartInterviewQuestions: () => void;
}

const { width, height } = Dimensions.get('window');

export default function MenuScreen({ onStartIrregular, onStartNouns, onStartVerbs, onStartInterviewWords, onStartInterviewPhrases, onStartInterviewQuestions }: MenuScreenProps) {
    const [counts, setCounts] = useState({ irregular: 0, nouns: 0, verbs: 0, interviewWords: 0, interviewPhrases: 0, interviewQuestions: 0 });
    const { colors, theme, toggleTheme } = useTheme();

    useEffect(() => {
        loadStatsData();
    }, []);

    const loadStatsData = async () => {
        const stats = await loadStats();

        const countMastered = (list: any[], keyProp: string = 'word') => {
            return list.reduce((acc, item) => {
                const key = item[keyProp] || item.infinitive; // handle different key names
                const stat = stats[key];
                if (stat && stat.correct >= 3 && stat.correct > stat.wrong * 2) {
                    return acc + 1;
                }
                return acc;
            }, 0);
        };

        setCounts({
            irregular: countMastered(irregularVerbs, 'infinitive'),
            nouns: countMastered(nouns, 'word'),
            verbs: countMastered(regularVerbs, 'word'),
            interviewWords: countMastered(interviewWords, 'word'),
            interviewPhrases: countMastered(interviewPhrases, 'word'),
            interviewQuestions: countMastered(interviewQuestions, 'word'),
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={colors.background as any}
                style={styles.background}
            />

            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
                <Text style={styles.themeToggleText}>{theme === 'light' ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Header />

                    <TouchableOpacity style={styles.button} onPress={onStartIrregular} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#ff7e5f', '#feb47b']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>IRREGULAR VERBS</Text>
                            <Text style={styles.buttonSubText}>Top 100 • Mastered: {counts.irregular} / {irregularVerbs.length}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.spacer} />

                    <TouchableOpacity style={styles.button} onPress={onStartNouns} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#43cea2', '#185a9d']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>NOUNS</Text>
                            <Text style={styles.buttonSubText}>Top 100 • Mastered: {counts.nouns} / {nouns.length}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.spacer} />

                    <TouchableOpacity style={styles.button} onPress={onStartVerbs} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#c94b4b', '#4b134f']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>REGULAR VERBS</Text>
                            <Text style={styles.buttonSubText}>Top 100 • Mastered: {counts.verbs} / {regularVerbs.length}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.spacer} />

                    <TouchableOpacity style={styles.button} onPress={onStartInterviewWords} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#11998e', '#38ef7d']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>JOB INTERVIEW WORDS</Text>
                            <Text style={styles.buttonSubText}>Top 100 • Mastered: {counts.interviewWords} / {interviewWords.length}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.spacer} />

                    <TouchableOpacity style={styles.button} onPress={onStartInterviewPhrases} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#8E2DE2', '#4A00E0']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>JOB INTERVIEW PHRASES</Text>
                            <Text style={styles.buttonSubText}>Top 100 • Mastered: {counts.interviewPhrases} / {interviewPhrases.length}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.spacer} />

                    <TouchableOpacity style={styles.button} onPress={onStartInterviewQuestions} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#C04848', '#480048']} // Deep Red/Purple gradient
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>JOB INTERVIEW QUESTIONS</Text>
                            <Text style={styles.buttonSubText}>Top 100 • Mastered: {counts.interviewQuestions} / {interviewQuestions.length}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
        paddingBottom: 100, // Extra padding at bottom
    },
    card: {
        borderRadius: 24,
        padding: 25,
        width: width * 0.9,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginVertical: 20, // Add margin to avoid clipping on small screens if not fully scrolling
    },
    themeToggle: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 20,
    },
    themeToggleText: {
        fontSize: 24,
    },
    button: {
        width: '100%',
        height: 70,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
        textAlign: 'center', // Ensure text centers on multiple lines if font scales
    },
    buttonSubText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 2,
        fontWeight: '600',
    },
    spacer: {
        height: 15,
    },
});
