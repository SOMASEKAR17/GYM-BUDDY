interface QuestionnaireData {
    workoutSplit?: string | null;
    workoutTime?: string | null;
    workoutDuration?: string | null;
    trainingStyle?: string | null;
    experienceLevel?: string | null;
    daysPerWeek?: number | null;
}

interface UserData {
    gymLocation?: string | null;
    fitnessGoal?: string | null;
    fitnessLevel?: string | null;
    questionnaire?: QuestionnaireData | null;
}

function timeOverlap(time1?: string | null, time2?: string | null): number {
    if (!time1 || !time2) return 0;
    const timeGroups: Record<string, string[]> = {
        morning: ["5am-7am", "7am-9am", "Early Morning", "Morning"],
        afternoon: ["12pm-2pm", "2pm-4pm", "Afternoon"],
        evening: ["5pm-7pm", "7pm-9pm", "Evening"],
        night: ["9pm-11pm", "Late Night", "Night"],
    };
    for (const group of Object.values(timeGroups)) {
        if (group.includes(time1) && group.includes(time2)) return 1;
    }
    return time1 === time2 ? 1 : 0;
}

export function calculateCompatibility(user: UserData, candidate: UserData): number {
    let score = 0;

    // 30% gym match
    if (user.gymLocation && candidate.gymLocation) {
        if (user.gymLocation === candidate.gymLocation) score += 30;
    }

    // 25% time overlap
    const tScore = timeOverlap(
        user.questionnaire?.workoutTime,
        candidate.questionnaire?.workoutTime
    );
    score += tScore * 25;

    // 20% workout split
    if (
        user.questionnaire?.workoutSplit &&
        candidate.questionnaire?.workoutSplit &&
        user.questionnaire.workoutSplit === candidate.questionnaire.workoutSplit
    ) {
        score += 20;
    }

    // 15% fitness goal
    if (user.fitnessGoal && candidate.fitnessGoal && user.fitnessGoal === candidate.fitnessGoal) {
        score += 15;
    }

    // 10% experience level
    if (user.fitnessLevel && candidate.fitnessLevel && user.fitnessLevel === candidate.fitnessLevel) {
        score += 10;
    }

    return Math.round(score);
}
