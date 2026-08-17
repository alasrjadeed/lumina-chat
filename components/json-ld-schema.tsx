// biome-ignore lint/security/noDangerouslySetInnerHtml: Static JSON-LD schema
function JsonLdScript({ data }: { data: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: data }}
      type="application/ld+json"
    />
  );
}

export function JsonLdSchema() {
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lumina Chat",
    alternateName: [
      "Lumina Chat AI",
      "Lumina Chatbot",
      "لومينا شات",
      "لومينا شات بوت",
    ],
    url: "https://lumina-chat.vercel.app",
    description:
      "Lumina Chat is a powerful AI-powered chatbot platform developed by AL ASAR JADEED. Build intelligent conversational AI agents, automate customer support, and deploy chatbots across your business — no coding required. Free tier available.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BHD",
      description: "Free tier with daily token allowance",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Organization",
      name: "AL ASAR JADEED",
      url: "https://alasarjadeed.com",
      email: "info@alasarjadeed.com",
      telephone: "+973-XXXX-XXXX",
      logo: "https://alasarjadeed.com/logo.png",
      address: {
        "@type": "PostalAddress",
        addressCountry: "BH",
        addressRegion: "Manama",
        addressLocality: "Manama",
        postalCode: "00000",
        streetAddress: "Manama, Bahrain",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 26.2285,
        longitude: 50.586,
      },
      sameAs: [
        "https://alasarjadeed.com",
        "https://alasarjadeed.com/news",
        "https://twitter.com/alasarjadeed",
        "https://www.linkedin.com/company/alasarjadeed",
        "https://www.facebook.com/alasarjadeed",
        "https://www.instagram.com/alasarjadeed",
      ],
      areaServed: [
        {
          "@type": "Country",
          name: "Bahrain",
        },
        {
          "@type": "Country",
          name: "Saudi Arabia",
        },
        {
          "@type": "Country",
          name: "United Arab Emirates",
        },
        {
          "@type": "Country",
          name: "Kuwait",
        },
        {
          "@type": "Country",
          name: "Qatar",
        },
        {
          "@type": "Country",
          name: "Oman",
        },
      ],
    },
    featureList: [
      "AI-powered conversational chatbot",
      "Multi-model support (GPT-4, Claude, Gemini, DeepSeek, Groq)",
      "Voice AI assistant with text-to-speech",
      "Document creation and editing with AI",
      "Real-time web search integration",
      "Business tools (email, calendar, WhatsApp)",
      "Arabic and English bilingual support",
      "Custom knowledge base integration",
      "Free daily token allowance",
      "No coding required — drag and drop setup",
    ],
    screenshot: "https://lumina-chat.vercel.app/logo/lumina-logo.png",
    softwareVersion: "1.0.0",
    applicationSubCategory: "Artificial Intelligence Chatbot",
    downloadUrl: "https://lumina-chat.vercel.app",
    installUrl: "https://lumina-chat.vercel.app",
    memoryRequirements: "Web Browser",
    storageRequirements: "Cloud-based",
    permissions: "Web Browser",
    countriesSupported: [
      "Bahrain",
      "Saudi Arabia",
      "United Arab Emirates",
      "Kuwait",
      "Qatar",
      "Oman",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AL ASAR JADEED",
    alternateName: ["Al Asar Jadeed", "العصر الجديد", "العصر الجديد للتقنية"],
    url: "https://alasarjadeed.com",
    logo: "https://alasarjadeed.com/logo.png",
    description:
      "AL ASAR JADEED is a leading digital agency in Bahrain and Saudi Arabia specializing in AI solutions, web development, mobile apps, and digital transformation. We develop cutting-edge AI chatbot platforms like Lumina Chat.",
    email: "info@alasarjadeed.com",
    telephone: "+973-XXXX-XXXX",
    foundingDate: "2020",
    address: {
      "@type": "PostalAddress",
      addressCountry: "BH",
      addressRegion: "Manama",
      addressLocality: "Manama",
      postalCode: "00000",
      streetAddress: "Manama, Bahrain",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 26.2285,
      longitude: 50.586,
    },
    sameAs: [
      "https://alasarjadeed.com",
      "https://alasarjadeed.com/news",
      "https://twitter.com/alasarjadeed",
      "https://www.linkedin.com/company/alasarjadeed",
      "https://www.facebook.com/alasarjadeed",
      "https://www.instagram.com/alasarjadeed",
    ],
    areaServed: [
      { "@type": "Country", name: "Bahrain" },
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "Kuwait" },
      { "@type": "Country", name: "Qatar" },
      { "@type": "Country", name: "Oman" },
    ],
    knowsLanguage: ["en", "ar"],
    slogan: "Innovation Through AI — Bahrain & Saudi Arabia",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Lumina Chat?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lumina Chat is an AI-powered chatbot platform developed by AL ASAR JADEED, a leading digital agency based in Bahrain and Saudi Arabia. It allows businesses to build intelligent conversational AI agents, automate customer support, and deploy chatbots across their operations — no coding required.",
        },
      },
      {
        "@type": "Question",
        name: "Is Lumina Chat free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Lumina Chat offers a free tier with a daily token allowance. Users can sign up for free and start using the AI chatbot immediately. Premium plans with higher token limits and advanced features are also available for businesses.",
        },
      },
      {
        "@type": "Question",
        name: "Which AI models does Lumina Chat support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lumina Chat supports multiple AI models including OpenAI GPT-4, Anthropic Claude, Google Gemini, DeepSeek, Groq, Cerebras, and OpenRouter. Users can switch between models based on their needs and preferences.",
        },
      },
      {
        "@type": "Question",
        name: "Does Lumina Chat support Arabic language?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Lumina Chat supports Arabic language through multiple AI models including DeepSeek and Claude. The platform is designed to serve the Gulf Cooperation Council (GCC) market, including Bahrain, Saudi Arabia, UAE, Kuwait, Qatar, and Oman.",
        },
      },
      {
        "@type": "Question",
        name: "What business tools does Lumina Chat offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lumina Chat includes built-in business tools such as email management, calendar scheduling, WhatsApp integration, document creation and editing, real-time web search, voice assistant capabilities, and a document library for storing and managing business files.",
        },
      },
      {
        "@type": "Question",
        name: "Who developed Lumina Chat?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lumina Chat was developed by AL ASAR JADEED, a leading digital agency based in Bahrain and Saudi Arabia. The company specializes in AI solutions, web development, mobile applications, and digital transformation services for businesses across the GCC region.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use Lumina Chat for customer support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely! Lumina Chat is designed for customer support automation. It can handle customer inquiries 24/7, provide instant responses, escalate complex issues to human agents, and integrate with your existing support systems including WhatsApp and email.",
        },
      },
      {
        "@type": "Question",
        name: "Is Lumina Chat available in Saudi Arabia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Lumina Chat is fully available in Saudi Arabia and the entire GCC region. AL ASAR JADEED has a strong presence in both Bahrain and Saudi Arabia, providing local support and services to businesses across the region.",
        },
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lumina Chat — AI Chatbot Platform",
    alternateName: "Lumina Chatbot by AL ASAR JADEED",
    url: "https://lumina-chat.vercel.app",
    description:
      "AI-powered chatbot platform by AL ASAR JADEED. Build intelligent conversational AI agents for your business. Free tier available. Serving Bahrain, Saudi Arabia, and the GCC.",
    publisher: {
      "@type": "Organization",
      name: "AL ASAR JADEED",
      url: "https://alasarjadeed.com",
    },
    inLanguage: ["en", "ar"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://lumina-chat.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://lumina-chat.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Login",
        item: "https://lumina-chat.vercel.app/login",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Register",
        item: "https://lumina-chat.vercel.app/register",
      },
    ],
  };

  const allSchemas = [
    webApplicationSchema,
    organizationSchema,
    faqSchema,
    websiteSchema,
    breadcrumbSchema,
  ];

  return (
    <>
      {allSchemas.map((schema, _index) => {
        const schemaType =
          (schema as { "@type"?: string })["@type"] ?? "unknown";
        return (
          <JsonLdScript
            data={JSON.stringify(schema)}
            key={`jsonld-${schemaType}`}
          />
        );
      })}
    </>
  );
}
