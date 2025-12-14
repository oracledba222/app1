import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { generateQuestion, Question } from '../utils/quizLogic';
import { updateVerbStat } from '../utils/storage';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

interface QuizScreenProps {
    onBack: () => void;
}

const { width } = Dimensions.get('window');

export default function QuizScreen({ onBack }: QuizScreenProps) {
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null); // Index in options array
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
        // Reset states
        setSelectedOptionIndex(null);
        setIsCorrect(null);

        feedbackOpacity.value = 0;
        cardScale.value = withSequence(withTiming(0.95, { duration: 100 }), withTiming(1, { duration: 100 }));

        setQuestion(generateQuestion());
    };

    const speak = (text: string) => {
        Speech.speak(text, { language: 'en-US' });
    };

    const handleOptionPress = async (index: number) => {
        if (selectedOptionIndex !== null) return; // Prevent double selecting
        if (!question) return;

        setSelectedOptionIndex(index);
        const correct = index === question.correctOptionIndex;
        setIsCorrect(correct);

        // Save stats
        await updateVerbStat(question.verb.infinitive, correct);

        // Animate Feedback
        feedbackOpacity.value = withSpring(1);

        if (correct) {
            setScore(s => {
                const newScore = s + 1;
                if (newScore >= 10) {
                    setTimeout(() => setIsFinished(true), 1500);
                } else {
                    // Speak example sentence on correct answer
                    // speak(question.verb.example); // Disabled auto-tts
                    setTimeout(loadNewQuestion, 3000);
                }
                return newScore;
            });
        } else {
            // No TTS on error, just wait
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

    if (!question) return <View style={styles.container}><Text style={{ color: colors.text }}>Loading...</Text></View>;

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
                    <Text style={[styles.finishText, { color: colors.accent }]}>You mastered 10 verbs!</Text>

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
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 5 }}>
                    <Header compact lessonTitle="Irregular Verbs" />
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={[styles.score, { color: colors.score }]}>{score}</Text>
                    <Text style={[styles.scoreLabel, { color: colors.score }]}>/10</Text>
                </View>
            </View>

            <Animated.View style={[styles.card, animatedCardStyle, { backgroundColor: colors.card }]}>
                <View style={styles.verbRow}>
                    <Text style={[styles.verb, { color: colors.text }]}>{question.verb.infinitive}</Text>
                    <TouchableOpacity onPress={() => speak(question.verb.infinitive)} style={styles.speakButton}>
                        <Text style={styles.speakIcon}>🔊</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.translation}></Text>

                <View style={styles.exampleContainer}>
                    <Text style={styles.exampleLabel}>Example:</Text>
                    <View style={styles.exampleContent}>
                        <Text style={styles.exampleText}>"{question.verb.example}"</Text>
                        <TouchableOpacity onPress={() => speak(question.verb.example)} style={styles.exampleSpeakButton}>
                            <Text style={styles.speakIconSmall}>🔊</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={[styles.instruction]}>Choose Past Forms:</Text>

                <View style={styles.optionsContainer}>
                    {question.options.map((option, index) => {
                        let backgroundColor = colors.optionBackground;
                        let borderColor = colors.optionBorder;
                        let textColor = colors.optionText;

                        if (selectedOptionIndex !== null) {
                            if (index === question.correctOptionIndex) {
                                backgroundColor = colors.success + '40'; // Transparent success
                                borderColor = colors.success;
                                textColor = colors.success;
                            } else if (index === selectedOptionIndex) {
                                backgroundColor = colors.error + '40'; // Transparent error
                                borderColor = colors.error;
                                textColor = colors.error;
                            }
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.optionButton, { backgroundColor, borderColor }]}
                                onPress={() => handleOptionPress(index)}
                                activeOpacity={0.8}
                                disabled={selectedOptionIndex !== null}
                            >
                                <View style={styles.optionRow}>
                                    <View style={styles.optionCol}>
                                        <Text style={styles.optionLabel}>Past Simple</Text>
                                        <Text style={[styles.optionText, { color: textColor }]}>{option.v2}</Text>
                                    </View>
                                    <View style={styles.optionDivider} />
                                    <View style={styles.optionCol}>
                                        <Text style={styles.optionLabel}>Past Participle</Text>
                                        <Text style={[styles.optionText, { color: textColor }]}>{option.v3}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Animated.View style={[styles.feedbackContainer, animatedFeedbackStyle, { backgroundColor: colors.card }]}>
                    <Text style={[styles.feedbackText, { color: isCorrect ? colors.success : colors.error }]}>
                        {isCorrect ? 'Awesome!' : 'Oops!'}
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
    score: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        width: width * 0.92,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    verbRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    verb: {
        fontSize: 32,
        fontWeight: '800',
        color: '#192f6a',
        textTransform: 'uppercase',
    },
    speakButton: {
        marginLeft: 10,
        padding: 5,
    },
    speakIcon: {
        fontSize: 24,
    },
    translation: {
        fontSize: 18,
        color: '#666',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    exampleContainer: {
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
    },
    exampleLabel: {
        fontSize: 12,
        color: '#1565c0',
        fontWeight: 'bold',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    exampleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exampleText: {
        color: '#0d47a1',
        fontStyle: 'italic',
        fontWeight: '500',
        flex: 1,
        fontSize: 16,
    },
    exampleSpeakButton: {
        padding: 8,
        marginLeft: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 20,
    },
    speakIconSmall: {
        fontSize: 18,
    },
    instruction: {
        fontSize: 14,
        marginBottom: 10,
        alignSelf: 'flex-start',
        color: '#888',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    optionsContainer: {
        width: '100%',
    },
    optionButton: {
        width: '100%',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        paddingVertical: 12,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionDivider: {
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    optionLabel: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.5)',
        marginBottom: 2,
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '700',
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
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    scoreLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
});
