import { NextResponse } from "next/server";

export async function GET() {
  const hasGithubId = !!process.env.GITHUB_ID;
  const hasGithubSecret = !!process.env.GITHUB_SECRET;
  const hasGoogleId = !!process.env.GOOGLE_ID;
  const hasGoogleSecret = !!process.env.GOOGLE_SECRET;
  const hasAuthSecret = !!process.env.AUTH_SECRET;
  const authSecretLen = process.env.AUTH_SECRET?.length || 0;
  const hasPostgresUrl = !!process.env.POSTGRES_URL;
  const hasDbUrl = !!process.env.DATABASE_URL;

  return NextResponse.json({
    GITHUB_ID: hasGithubId,
    GITHUB_SECRET: hasGithubSecret,
    GOOGLE_ID: hasGoogleId,
    GOOGLE_SECRET: hasGoogleSecret,
    AUTH_SECRET: hasAuthSecret,
    AUTH_SECRET_length: authSecretLen,
    POSTGRES_URL: hasPostgresUrl,
    DATABASE_URL: hasDbUrl,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
  });
}
