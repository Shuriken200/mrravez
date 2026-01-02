"use client";

import Image from "next/image";
import { useState } from "react";
import { GlassCard } from "./GlassCard";
import { siteConfig } from "@/config/site.config";

export function ProfileCard() {
    const [isPhotoHovered, setIsPhotoHovered] = useState(false);

    return (
        <GlassCard
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 100,
                maxWidth: '480px',
            }}
            padding={40}
            borderRadius={60}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    text-align: center;
                    transform-style: preserve-3d;
                }
                .about-header {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--color-white);
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                    text-align: center;
                }
                .profile-photo-wrapper {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    overflow: hidden;
                    transform-style: preserve-3d;
                    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                                box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                .profile-photo {
                    border-radius: 50%;
                    object-fit: cover;
                }
                .profile-name {
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--color-white);
                    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
                    letter-spacing: -0.5px;
                    line-height: 1.1;
                }
                .about-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .about-role {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--color-white);
                    opacity: 0.9;
                }
                .about-org {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 400;
                    color: var(--color-white);
                    opacity: 0.75;
                }
            `}} />

            <div className="profile-content">
                <h1 className="about-header">
                    About
                </h1>

                <div 
                    className="profile-photo-wrapper"
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
                        className="profile-photo"
                        priority
                    />
                </div>

                <h2 className="profile-name">
                    {siteConfig.identity.name}
                </h2>

                <div className="about-info">
                    <p className="about-role">
                        Head Engineer — AV and IoT
                    </p>
                    <p className="about-org">
                        University of Oslo
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}
