"use client";

import { useEffect, useState } from "react";
import { STAGE_TIMINGS } from "../constants";
import type { AnimationStagesState } from "../types";

/**
 * Hook to manage the timed animation stage transitions
 * Stage 0: Initial state
 * Stage 1: Hi! emerging (growing from tiny)
 * Stage 2: Hi! popped (burst)
 * Stage 3: Hi! fading out
 * Stage 4: Hi! fully gone, Welcome starts appearing
 * Stage 5: Welcome fully visible
 * Stage 6: Welcome starts fading out
 * Stage 7: Welcome fully gone, profile card appears
 */
export function useAnimationStages(): AnimationStagesState {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const timer1 = setTimeout(() => setStage(1), STAGE_TIMINGS.stage1);
        const timer2 = setTimeout(() => setStage(2), STAGE_TIMINGS.stage2);
        const timer3 = setTimeout(() => setStage(3), STAGE_TIMINGS.stage3);
        const timer4 = setTimeout(() => setStage(4), STAGE_TIMINGS.stage4);
        const timer5 = setTimeout(() => setStage(5), STAGE_TIMINGS.stage5);
        const timer6 = setTimeout(() => setStage(6), STAGE_TIMINGS.stage6);
        const timer7 = setTimeout(() => setStage(7), STAGE_TIMINGS.stage7);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            clearTimeout(timer5);
            clearTimeout(timer6);
            clearTimeout(timer7);
        };
    }, []);

    return {
        stage,
        isReady: stage >= 7,
    };
}

