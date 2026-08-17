import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create Account — Lumina Chat | AL ASAR JADEED AI Chatbot",
  description:
    "Create a free Lumina Chat account and start using AI-powered chatbots today. Build intelligent conversational agents, automate customer support, and grow your business. Free tier available. Bahrain, Saudi Arabia & GCC.",
  openGraph: {
    title: "Create Account — Lumina Chat | AL ASAR JADEED",
    description:
      "Create a free Lumina Chat account and start using AI-powered chatbots today. Free tier available. Bahrain, Saudi Arabia & GCC.",
    url: "https://lumina-chat.vercel.app/register",
  },
  twitter: {
    title: "Create Account — Lumina Chat | AL ASAR JADEED",
    description:
      "Create a free Lumina Chat account and start using AI-powered chatbots today. Free tier available.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
