import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { generateQuestion, Question } from '../utils/quizLogic';
import { updateVerbStat } from '../utils/storage';
import Header from '../components/Header';

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
    const [showExample, setShowExample] = useState(false);

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
        setShowExample(false);
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
            Speech.speak("Correct!", { rate: 1.2 });
            setScore(s => {
                const newScore = s + 1;
                if (newScore >= 10) {
                    setTimeout(() => setIsFinished(true), 1500);
                } else {
                    // Show example for a bit longer if correct
                    setShowExample(true);
                    speak(question.verb.example);
                    setTimeout(loadNewQuestion, 3000);
                }
                return newScore;
            });
        } else {
            Speech.speak("Try again next time", { rate: 1.2 });
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

    if (!question) return <View style={styles.container}><Text>Loading...</Text></View>;

    if (isFinished) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#4c669f', '#3b5998', '#192f6a']}
                    style={styles.background}
                />
                <View style={styles.card}>
                    <Header />
                    <Text style={styles.finishTitle}>Congratulations! 🎉</Text>
                    <Text style={styles.finishText}>You mastered 10 verbs!</Text>

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
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.background}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Menu</Text>
                </TouchableOpacity>
                <Text style={styles.score}>Score: {score}</Text>
            </View>

            <Animated.View style={[styles.card, animatedCardStyle]}>
                <View style={styles.verbRow}>
                    <Text style={styles.verb}>{question.verb.infinitive}</Text>
                    <TouchableOpacity onPress={() => speak(question.verb.infinitive)} style={styles.speakButton}>
                        <Text style={styles.speakIcon}>🔊</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.translation}></Text>

                {showExample && (
                    <View style={styles.exampleContainer}>
                        <Text style={styles.exampleText}>"{question.verb.example}"</Text>
                    </View>
                )}

                <Text style={styles.instruction}>Choose Past Forms:</Text>

                <View style={styles.optionsContainer}>
                    {question.options.map((option, index) => {
                        let backgroundColor = '#f8f9fa';
                        let borderColor = '#e9ecef';
                        let textColor = '#333';

                        if (selectedOptionIndex !== null) {
                            if (index === question.correctOptionIndex) {
                                backgroundColor = '#d4edda'; // Light green
                                borderColor = '#c3e6cb';
                                textColor = '#155724';
                            } else if (index === selectedOptionIndex) {
                                backgroundColor = '#f8d7da'; // Light red
                                borderColor = '#f5c6cb';
                                textColor = '#721c24';
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

                <Animated.View style={[styles.feedbackContainer, animatedFeedbackStyle]}>
                    <Text style={[styles.feedbackText, { color: isCorrect ? '#28a745' : '#dc3545' }]}>
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
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
    },
    exampleText: {
        color: '#0d47a1',
        textAlign: 'center',
        fontStyle: 'italic',
        fontWeight: '500',
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
});
