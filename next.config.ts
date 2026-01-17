import type { NextConfig } from "next";

// Content Security Policy - allows Next.js, Three.js, and required resources
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://avatars.githubusercontent.com;
  font-src 'self' data:;
  connect-src 'self' https://avatars.githubusercontent.com;
  worker-src 'self' blob:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\n/g, " ").trim();

const securityHeaders = [
	// Prevent MIME type sniffing
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	// Prevent clickjacking
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	// Legacy XSS protection for older browsers
	{
		key: "X-XSS-Protection",
		value: "1; mode=block",
	},
	// Control referrer information
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	// Disable unnecessary browser features
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
	},
	// Content Security Policy
	{
		key: "Content-Security-Policy",
		value: ContentSecurityPolicy,
	},
	// DNS prefetch control
	{
		key: "X-DNS-Prefetch-Control",
		value: "on",
	},
];

const nextConfig: NextConfig = {
	// Standalone output required for OpenNext/Cloudflare deployment
	output: "standalone",

	// Remove X-Powered-By header
	poweredByHeader: false,

	// Compress responses
	compress: true,

	headers: async () => [
		// Apply security headers to all routes
		{
			source: "/:path*",
			headers: securityHeaders,
		},
		// Aggressive caching for static assets (immutable, 1 year)
		{
			source: "/_next/static/:path*",
			headers: [
				{
					key: "Cache-Control",
					value: "public, max-age=31536000, immutable",
				},
			],
		},
		// Cache images with revalidation
		{
			source: "/(.*)\\.(ico|jpg|jpeg|png|gif|webp|svg)",
			headers: [
				{
					key: "Cache-Control",
					value: "public, max-age=31536000, stale-while-revalidate=86400",
				},
			],
		},
		// Cache fonts
		{
			source: "/(.*)\\.(woff|woff2|ttf|otf|eot)",
			headers: [
				{
					key: "Cache-Control",
					value: "public, max-age=31536000, immutable",
				},
			],
		},
		// Pages - short cache with stale-while-revalidate for instant loads
		{
			source: "/((?!_next|api).*)",
			headers: [
				{
					key: "Cache-Control",
					value: "public, max-age=60, stale-while-revalidate=3600",
				},
			],
		},
	],
};

export default nextConfig;
