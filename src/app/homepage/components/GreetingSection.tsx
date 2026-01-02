"use client";

import type { GreetingVisibility, WelcomeVisibility } from "../types";

interface GreetingSectionProps {
    stage: number;
    greetingVisibility: GreetingVisibility;
    welcomeVisibility: WelcomeVisibility;
    theme: "light" | "dark";
}

/**
 * The "Hi!" greeting and welcome text that appear on initial load
 * They fade in/out sequentially as separate stages
 */
export function GreetingSection({ stage, greetingVisibility, welcomeVisibility, theme }: GreetingSectionProps) {
    // Don't render if neither is visible and we're past intro
    if (!greetingVisibility.visible && !welcomeVisibility.visible && stage >= 3) {
        return null;
    }

    const greetingClass = [
        "greeting",
        stage >= 1 ? "emerging" : "",
        stage >= 2 ? "popped" : "",
    ]
        .filter(Boolean)
        .join(" ");

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

                .greeting {
                    font-size: clamp(5rem, 20vw, 14rem);
                    font-weight: 700;
                    letter-spacing: -0.04em;
                    color: #000000;
                    transform: scale(0.1);
                    opacity: 0;
                    transition: color 12s linear,
                        transform 10s ease-out,
                        opacity 2s ease-out,
                        text-shadow 5s ease 3s;
                    position: relative;
                    z-index: 10;
                    visibility: hidden;
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                }

                .greeting.emerging {
                    visibility: visible;
                    opacity: 1;
                    color: #ffffff;
                    transform: scale(0.85);
                    text-shadow: 0 0 60px rgba(78, 5, 6, 0.4), 0 0 120px rgba(78, 5, 6, 0.2);
                }

                .greeting.popped {
                    color: ${theme === "light" ? "#1a1a1a" : "#ffffff"};
                    transform: scale(1);
                    transition: color 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
                        transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
                        opacity 0.8s ease,
                        text-shadow 0.5s ease;
                    text-shadow: 0 0 100px rgba(78, 5, 6, 0.8), 0 0 200px rgba(78, 5, 6, 0.4),
                        0 0 300px rgba(78, 5, 6, 0.2);
                }

                .welcome-text {
                    font-size: clamp(1.2rem, 3.5vw, 1.75rem);
                    font-weight: 400;
                    color: ${theme === "light" ? "#1a1a1a" : "#ffffff"};
                    user-select: none;
                    -webkit-user-select: none;
                    pointer-events: none;
                    text-align: center;
                    max-width: 90vw;
                    transition: opacity 0.4s ease-out;
                }
            `}</style>

            {/* "Hi!" greeting - separate visibility control */}
            {greetingVisibility.visible && (
                <div
                    className="greeting-wrapper"
                    style={{
                        opacity: stage >= 3 ? greetingVisibility.opacity : undefined,
                    }}
                >
                    <h1 className={greetingClass}>
                        Hi!
                    </h1>
                </div>
            )}

            {/* "Welcome..." text - separate visibility control */}
            {welcomeVisibility.visible && stage >= 2 && (
                <div
                    className="greeting-wrapper"
                    style={{
                        opacity: welcomeVisibility.opacity,
                    }}
                >
                    <p className="welcome-text">
                        Welcome to my little corner of the internet...
                    </p>
                </div>
            )}
        </>
    );
}

