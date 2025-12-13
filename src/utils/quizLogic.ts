import { Verb, irregularVerbs } from '../data/verbs';
import { VerbStats } from './storage';

export interface Question {
    verb: Verb;
    options: { v2: string; v3: string }[];
    correctOptionIndex: number;
}

// Function to pick a verb based on weights (wrong answers increase weight)
const pickWeightedVerb = (verbs: Verb[], stats: VerbStats): Verb => {
    let totalWeight = 0;
    const weights = verbs.map(v => {
        const stat = stats[v.infinitive] || { correct: 0, wrong: 0 };
        // Base weight 1. each wrong answer adds 3. each correct subtracts 0.5 (min 0.1)
        let weight = 1 + (stat.wrong * 3) - (stat.correct * 0.5);
        if (weight < 0.1) weight = 0.1;
        totalWeight += weight;
        return weight;
    });

    let random = Math.random() * totalWeight;
    for (let i = 0; i < verbs.length; i++) {
        random -= weights[i];
        if (random <= 0) return verbs[i];
    }
    return verbs[verbs.length - 1];
};

export const generateQuestion = (stats: VerbStats = {}): Question => {
    const correctVerb = pickWeightedVerb(irregularVerbs, stats);

    const correctOption = { v2: correctVerb.pastSimple, v3: correctVerb.pastParticiple };

    const wrongOptions = new Set<string>(); // Use string representation for uniqueness check
    const optionsList: { v2: string; v3: string }[] = [];

    while (optionsList.length < 3) {
        const randomVerb = irregularVerbs[Math.floor(Math.random() * irregularVerbs.length)];
        if (randomVerb.infinitive === correctVerb.infinitive) continue;

        // 50% chance: completely different verb
        // 50% chance: fake regularized (e.g. goed/goed)
        let option: { v2: string; v3: string };

        if (Math.random() > 0.5) {
            option = { v2: randomVerb.pastSimple, v3: randomVerb.pastParticiple };
        } else {
            const fakeEd = `${correctVerb.infinitive}ed`;
            if (correctVerb.infinitive.endsWith('e')) {
                option = { v2: `${correctVerb.infinitive}d`, v3: `${correctVerb.infinitive}d` };
            } else {
                option = { v2: fakeEd, v3: fakeEd };
            }
        }

        const strRep = `${option.v2}|${option.v3}`;
        if (!wrongOptions.has(strRep)) {
            wrongOptions.add(strRep);
            optionsList.push(option);
        }
    }

    // Add correct option at random position
    const correctOptionIndex = Math.floor(Math.random() * 4);
    optionsList.splice(correctOptionIndex, 0, correctOption);

    return {
        verb: correctVerb,
        options: optionsList,
        correctOptionIndex,
    };
};
