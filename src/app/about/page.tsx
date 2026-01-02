"use client";

import { HomePage } from "../homepage/components";

// Force static generation at build time
export const dynamic = "force-static";

export default function AboutPage() {
    return <HomePage initialSection={0} />;
}
