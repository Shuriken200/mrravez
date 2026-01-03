"use client";

import { GlassButton } from "@/components/glass";
import { siteConfig } from "@/config/site.config";

function EmailIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M22 7l-10 7L2 7"/>
        </svg>
    );
}

/**
 * ContactCard - Pure content component
 * Only handles the card's content, no animation/transition logic
 */
export function ContactCard() {
    return (
        <>
            <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--color-white, #ffffff)',
                textAlign: 'center',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
            }}>
                Contact
            </h2>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transformStyle: 'preserve-3d'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', transformStyle: 'preserve-3d' }}>
                    <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--color-white, #ffffff)',
                        opacity: 0.7,
                        textAlign: 'center'
                    }}>
                        for personal or other inquiries:
                    </p>
                    <GlassButton 
                        href={`mailto:${siteConfig.contact.email_personal}`}
                        icon={<EmailIcon />}
                        label={siteConfig.contact.email_personal}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', transformStyle: 'preserve-3d' }}>
                    <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--color-white, #ffffff)',
                        opacity: 0.7,
                        textAlign: 'center'
                    }}>
                        for UiO related inquiries:
                    </p>
                    <GlassButton 
                        href={`mailto:${siteConfig.contact.email_work}`}
                        icon={<EmailIcon />}
                        label={siteConfig.contact.email_work}
                    />
                </div>
            </div>
        </>
    );
}
