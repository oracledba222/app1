import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = 'VERBS_STATS';

export interface VerbStats {
    [infinitive: string]: {
        correct: number;
        wrong: number;
    };
}

export const loadStats = async (): Promise<VerbStats> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STATS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
        console.error(e);
        return {};
    }
};

export const saveStats = async (stats: VerbStats) => {
    try {
        const jsonValue = JSON.stringify(stats);
        await AsyncStorage.setItem(STATS_KEY, jsonValue, () => { });
    } catch (e) {
        console.error(e);
    }
};

export const updateVerbStat = async (infinitive: string, isCorrect: boolean) => {
    const stats = await loadStats();
    if (!stats[infinitive]) {
        stats[infinitive] = { correct: 0, wrong: 0 };
    }

    if (isCorrect) {
        stats[infinitive].correct += 1;
    } else {
        stats[infinitive].wrong += 1;
    }

    await saveStats(stats);
    return stats;
}
