import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadStats } from '../utils/storage';
import { irregularVerbs } from '../data/verbs';
import { nouns } from '../data/nouns';
import { regularVerbs } from '../data/regularVerbs';
import { interviewWords } from '../data/interviewWords';
import { interviewPhrases } from '../data/interviewPhrases';
import Header from '../components/Header';

interface MenuScreenProps {
    onStartIrregular: () => void;
    onStartNouns: () => void;
    onStartVerbs: () => void;
    onStartInterviewWords: () => void;
    onStartInterviewPhrases: () => void;
}

const { width } = Dimensions.get('window');

export default function MenuScreen({ onStartIrregular, onStartNouns, onStartVerbs, onStartInterviewWords, onStartInterviewPhrases }: MenuScreenProps) {
    const [counts, setCounts] = useState({ irregular: 0, nouns: 0, verbs: 0, interviewWords: 0, interviewPhrases: 0 });

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
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.background}
            />
            <View style={styles.card}>
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

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    },
    statsContainer: {
        marginBottom: 20,
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f4f8',
        borderRadius: 12,
        width: '100%',
    },
    statsLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    statsValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3b5998',
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
