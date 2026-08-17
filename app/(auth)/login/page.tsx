import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In to Lumina Chat — AI Chatbot by AL ASAR JADEED",
  description:
    "Sign in to Lumina Chat, the AI-powered chatbot platform by AL ASAR JADEED. Access your AI assistant, manage chatbots, and automate customer support. Free tier available. Bahrain, Saudi Arabia & GCC.",
  openGraph: {
    title: "Sign In — Lumina Chat | AL ASAR JADEED",
    description:
      "Sign in to Lumina Chat, the AI-powered chatbot platform by AL ASAR JADEED. Free tier available. Bahrain, Saudi Arabia & GCC.",
    url: "https://lumina-chat.vercel.app/login",
  },
  twitter: {
    title: "Sign In — Lumina Chat | AL ASAR JADEED",
    description:
      "Sign in to Lumina Chat, the AI-powered chatbot platform by AL ASAR JADEED. Free tier available.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
