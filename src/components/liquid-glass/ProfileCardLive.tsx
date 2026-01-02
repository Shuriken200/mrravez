"use client";

import Image from "next/image";
import { useState } from "react";
import { LiveGlassCard } from "./LiveGlassCard";
import { siteConfig } from "@/config/site.config";

interface ProfileCardLiveProps {
    opacity?: number;
    entryProgress?: number;
    exitProgress?: number;
    mobileOffset?: number;
    mobileScale?: number;
    style?: React.CSSProperties;
}

export function ProfileCardLive({ opacity = 1, entryProgress = 1, exitProgress = 0, mobileOffset = 0, mobileScale = 1, style }: ProfileCardLiveProps) {
    const [isPhotoHovered, setIsPhotoHovered] = useState(false);

    return (
        <LiveGlassCard
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                zIndex: 10,
                maxWidth: "480px",
                width: "calc(100% - 32px)",
                ...style,
            }}
            padding="clamp(24px, 5vw, 40px)"
            borderRadius={60}
            opacity={opacity}
            entryProgress={entryProgress}
            exitProgress={exitProgress}
            mobileOffset={mobileOffset}
            mobileScale={mobileScale}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-content-live {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    text-align: center;
                    transform-style: preserve-3d;
                }
                .about-header-live {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--color-white, #ffffff);
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                    text-align: center;
                }
                .profile-photo-wrapper-live {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    overflow: hidden;
                    transform-style: preserve-3d;
                    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                                box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                .profile-photo-live {
                    border-radius: 50%;
                    object-fit: cover;
                }
                .profile-name-live {
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--color-white, #ffffff);
                    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
                    letter-spacing: -0.5px;
                    line-height: 1.1;
                }
                .about-info-live {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .about-role-live {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--color-white, #ffffff);
                    opacity: 0.9;
                }
                .about-org-live {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 400;
                    color: var(--color-white, #ffffff);
                    opacity: 0.75;
                }
            `}} />

            <div className="profile-content-live">
                <h2 className="about-header-live">
                    About
                </h2>

                <div 
                    className="profile-photo-wrapper-live"
                    onMouseEnter={() => setIsPhotoHovered(true)}
                    onMouseLeave={() => setIsPhotoHovered(false)}
                    style={{
                        transform: isPhotoHovered ? 'translateZ(50px) scale(1.08)' : 'none',
                        boxShadow: isPhotoHovered 
                            ? '0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)'
                            : '0 8px 32px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <Image
                        src="/leon.jpeg"
                        alt={siteConfig.identity.name}
                        width={140}
                        height={140}
                        className="profile-photo-live"
                        priority
                    />
                </div>

                <h3 className="profile-name-live">
                    {siteConfig.identity.name}
                </h3>

                <div className="about-info-live">
                    <p className="about-role-live">
                        Head Engineer — AV and IoT
                    </p>
                    <p className="about-org-live">
                        University of Oslo
                    </p>
                </div>
            </div>
        </LiveGlassCard>
    );
}

