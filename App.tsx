import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MenuScreen from './src/screens/MenuScreen';
import QuizScreen from './src/screens/QuizScreen';
import VocabularyQuizScreen from './src/screens/VocabularyQuizScreen';
import { nouns } from './src/data/nouns';
import { regularVerbs } from './src/data/regularVerbs';
import { interviewWords } from './src/data/interviewWords';
import { interviewPhrases } from './src/data/interviewPhrases';
import { interviewQuestions } from './src/data/interviewQuestions';

type Screen = 'menu' | 'irregular' | 'nouns' | 'verbs' | 'interview-words' | 'interview-phrases' | 'interview-questions';

import { ThemeProvider } from './src/context/ThemeContext';

function MainContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'irregular':
        return <QuizScreen onBack={() => setCurrentScreen('menu')} />;
      case 'nouns':
        return <VocabularyQuizScreen data={nouns} title="Top 100 Nouns" onBack={() => setCurrentScreen('menu')} />;
      case 'verbs':
        return <VocabularyQuizScreen data={regularVerbs} title="Top 100 Verbs" onBack={() => setCurrentScreen('menu')} />;
      case 'interview-words':
        return <VocabularyQuizScreen data={interviewWords} title="Job Interview Words" onBack={() => setCurrentScreen('menu')} />;
      case 'interview-phrases':
        return <VocabularyQuizScreen data={interviewPhrases} title="Job Interview Phrases" onBack={() => setCurrentScreen('menu')} instructionText="Select the matching phrase:" />;
      case 'interview-questions':
        return <VocabularyQuizScreen data={interviewQuestions} title="Job Interview Questions" onBack={() => setCurrentScreen('menu')} instructionText="Select the best advice:" promptLabel="Question:" swapDisplay={true} />;
      case 'menu':
      default:
        return (
          <MenuScreen
            onStartIrregular={() => setCurrentScreen('irregular')}
            onStartNouns={() => setCurrentScreen('nouns')}
            onStartVerbs={() => setCurrentScreen('verbs')}
            onStartInterviewWords={() => setCurrentScreen('interview-words')}
            onStartInterviewPhrases={() => setCurrentScreen('interview-phrases')}
            onStartInterviewQuestions={() => setCurrentScreen('interview-questions')}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
