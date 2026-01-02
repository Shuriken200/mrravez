"use client";

interface GreetingSectionProps {
    stage: number;
    theme: "light" | "dark";
}

/**
 * The "Hi!" greeting and welcome text that appear on initial load
 * Stage-based animation sequence:
 * - Stage 0: Hidden
 * - Stage 1: Hi! emerging (growing from tiny)
 * - Stage 2: Hi! popped (burst)
 * - Stage 3: Hi! fading out
 * - Stage 4: Hi! fully gone, Welcome starts appearing
 * - Stage 5: Welcome fully visible
 * - Stage 6: Welcome starts fading out
 * - Stage 7: Welcome fully gone, profile card appears
 */
export function GreetingSection({ stage, theme }: GreetingSectionProps) {
    // Don't render anything after the intro sequence is fully complete
    if (stage >= 7) {
        return null;
    }

    // Hi! animation states
    const isHiEmerging = stage >= 1;
    const isHiPopped = stage >= 2;
    const isHiFadingOut = stage >= 3;
    const isHiGone = stage >= 4;

    // Welcome animation states (only after Hi! is fully gone)
    const isWelcomeAppearing = stage >= 4;
    const isWelcomeFullyVisible = stage >= 5;
    const isWelcomeFadingOut = stage >= 6;

    // Hi! styles
    const hiStyle: React.CSSProperties = {
        fontSize: 'clamp(5rem, 20vw, 14rem)',
        fontWeight: 700,
        letterSpacing: '-0.04em',
        margin: 0,
        position: 'relative',
        zIndex: 10,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'none',
        // Opacity: visible during emerging/popped, fade out at stage 3
        opacity: isHiFadingOut ? 0 : isHiEmerging ? 1 : 0,
        // Scale: tiny -> 0.85 -> 1.0
        transform: isHiPopped ? 'scale(1)' : isHiEmerging ? 'scale(0.85)' : 'scale(0.01)',
        // Color: black -> gray -> white (burst)
        color: isHiPopped 
            ? (theme === 'light' ? '#1a1a1a' : '#ffffff')
            : isHiEmerging 
                ? '#999999'
                : '#000000',
        textShadow: isHiPopped
            ? '0 0 100px rgba(78, 5, 6, 0.8), 0 0 200px rgba(78, 5, 6, 0.4), 0 0 300px rgba(78, 5, 6, 0.2)'
            : isHiEmerging
                ? '0 0 60px rgba(78, 5, 6, 0.4), 0 0 120px rgba(78, 5, 6, 0.2)'
                : 'none',
        // Transition timing
        transition: isHiFadingOut
            ? 'opacity 0.8s ease-out, transform 0.8s ease-out'
            : isHiPopped
                ? 'color 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease, text-shadow 0.5s ease'
                : 'color 12s linear, transform 10s ease-out, opacity 2s ease-out, text-shadow 5s ease 3s',
    };

    // Welcome styles - LARGER TEXT, fade only (no movement)
    const welcomeStyle: React.CSSProperties = {
        fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
        fontWeight: 500,
        color: theme === 'light' ? '#1a1a1a' : '#ffffff',
        margin: 0,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'none',
        textAlign: 'center',
        maxWidth: '90vw',
        // Animation: fade in at stage 5, fade out at stage 6 (slower fade)
        opacity: isWelcomeFadingOut ? 0 : isWelcomeFullyVisible ? 1 : 0,
        transition: 'opacity 1.5s ease-out',
    };

    return (
        <>
            <style jsx>{`
                .greeting-wrapper {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
            `}</style>

            {/* "Hi!" greeting - visible until stage 4 (fully faded at stage 3->4) */}
            {!isHiGone && (
                <div className="greeting-wrapper">
                    <h1 style={hiStyle}>
                        Hi!
                    </h1>
                </div>
            )}

            {/* "Welcome..." text - visible from stage 4 to 7, fades out at stage 6 */}
            {isWelcomeAppearing && (
                <div className="greeting-wrapper">
                    <p style={welcomeStyle}>
                        Welcome to my little corner of the internet...
                    </p>
                </div>
            )}
        </>
    );
}
