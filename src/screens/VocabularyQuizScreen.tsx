import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import Header from '../components/Header';
import { Word } from '../data/nouns';
import { useTheme } from '../context/ThemeContext';

interface VocabularyQuizScreenProps {
    onBack: () => void;
    data: Word[];
    title: string;
    instructionText?: string;
}

const { width } = Dimensions.get('window');

export default function VocabularyQuizScreen({ onBack, data, title, instructionText = "Select the matching word:" }: VocabularyQuizScreenProps) {
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [options, setOptions] = useState<Word[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const { colors } = useTheme();

    // Animations
    const cardScale = useSharedValue(1);
    const feedbackOpacity = useSharedValue(0);

    useEffect(() => {
        loadNewQuestion();
    }, []);

    const loadNewQuestion = () => {
        setSelectedIndex(null);
        setIsCorrect(null);
        feedbackOpacity.value = 0;
        cardScale.value = withSequence(withTiming(0.95, { duration: 100 }), withTiming(1, { duration: 100 }));

        // Pick random word
        const randomWord = data[Math.floor(Math.random() * data.length)];
        setCurrentWord(randomWord);

        // Generate options
        const opts = [randomWord];
        while (opts.length < 4) {
            const w = data[Math.floor(Math.random() * data.length)];
            if (!opts.find(o => o.word === w.word)) {
                opts.push(w);
            }
        }
        // Shuffle
        setOptions(opts.sort(() => Math.random() - 0.5));
    };

    const speak = (text: string) => {
        Speech.speak(text, { language: 'en-US' });
    };

    const handleOptionPress = (index: number) => {
        if (selectedIndex !== null) return;
        if (!currentWord) return;

        setSelectedIndex(index);
        const correct = options[index].word === currentWord.word;
        setIsCorrect(correct);

        feedbackOpacity.value = withSpring(1);

        if (correct) {
            setScore(s => {
                const newScore = s + 1;
                if (newScore >= 10) {
                    setTimeout(() => setIsFinished(true), 1500);
                } else {
                    setTimeout(loadNewQuestion, 1500);
                }
                return newScore;
            });
        } else {
            // No TTS
            setTimeout(loadNewQuestion, 2000);
        }
    };

    const animatedCardStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: cardScale.value }],
        };
    });

    const animatedFeedbackStyle = useAnimatedStyle(() => {
        return {
            opacity: feedbackOpacity.value,
            transform: [{ scale: feedbackOpacity.value }],
        };
    });

    if (!currentWord) return <View style={styles.container}><Text style={{ color: colors.text }}>Loading...</Text></View>;

    if (isFinished) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={colors.background as any}
                    style={styles.background}
                />
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Header />
                    <Text style={[styles.finishTitle, { color: colors.text }]}>Congratulations! 🎉</Text>
                    <Text style={[styles.finishText, { color: colors.accent }]}>You mastered 10 words!</Text>

                    <TouchableOpacity style={styles.button} onPress={onBack}>
                        <LinearGradient
                            colors={['#ff7e5f', '#feb47b']}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>BACK TO MENU</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={colors.background as any}
                style={styles.background}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Menu</Text>
                </TouchableOpacity>
                <Text style={styles.modeTitle}>{title}</Text>
                <Text style={[styles.score, { color: colors.score }]}>{score}/10</Text>
            </View>

            <Animated.View style={[styles.card, animatedCardStyle, { backgroundColor: colors.card }]}>
                <Text style={styles.label}>Definition:</Text>
                <Text style={[styles.definition, { color: colors.text }]}>"{currentWord.definition}"</Text>
                <TouchableOpacity onPress={() => speak(currentWord.definition)} style={styles.speakButton}>
                    <Text style={styles.speakIcon}>🔊</Text>
                </TouchableOpacity>

                <Text style={styles.instruction}>{instructionText}</Text>

                <View style={styles.optionsContainer}>
                    {options.map((opt, index) => {
                        let backgroundColor = colors.optionBackground;
                        let borderColor = colors.optionBorder;
                        let textColor = colors.optionText;

                        if (selectedIndex !== null) {
                            if (opt.word === currentWord.word) {
                                backgroundColor = colors.success + '40';
                                borderColor = colors.success;
                                textColor = colors.success;
                            } else if (index === selectedIndex) {
                                backgroundColor = colors.error + '40';
                                borderColor = colors.error;
                                textColor = colors.error;
                            }
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.optionButton, { backgroundColor, borderColor }]}
                                onPress={() => handleOptionPress(index)}
                                disabled={selectedIndex !== null}
                            >
                                <Text style={[styles.optionText, { color: textColor }]}>{opt.word}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Animated.View style={[styles.feedbackContainer, animatedFeedbackStyle, { backgroundColor: colors.card }]}>
                    <Text style={[styles.feedbackText, { color: isCorrect ? colors.success : colors.error }]}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                    </Text>
                </Animated.View>

            </Animated.View>
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
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modeTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        opacity: 0.9,
    },
    score: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        width: width * 0.9,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
        marginTop: 40,
    },
    label: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    definition: {
        fontSize: 22,
        fontWeight: '600',
        color: '#192f6a',
        textAlign: 'center',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    speakButton: {
        marginBottom: 30,
        padding: 10,
    },
    speakIcon: {
        fontSize: 24,
    },
    instruction: {
        fontSize: 14,
        marginBottom: 15,
        alignSelf: 'flex-start',
        color: '#666',
    },
    optionsContainer: {
        width: '100%',
    },
    optionButton: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 18,
        fontWeight: '600',
    },
    feedbackContainer: {
        position: 'absolute',
        bottom: -40,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    finishTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#192f6a',
        marginBottom: 20,
        textAlign: 'center',
    },
    finishText: {
        fontSize: 18,
        color: '#4c669f',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        width: '100%',
        height: 55,
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#ff7e5f',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
