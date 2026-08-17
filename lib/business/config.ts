export type BusinessService = {
  id: string;
  name: string;
  category: "seo" | "web" | "social" | "marketing";
  description: string;
  price: number;
  unit: string;
  durationMonths: number;
};

export type BusinessConfig = {
  businessName: string;
  tagline: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    website: string;
  };
  hours: {
    open: string;
    close: string;
    timezone: string;
    days: string;
  };
  services: BusinessService[];
  paymentTerms: string;
};

export const defaultBusinessConfig: BusinessConfig = {
  businessName: "MonkeyCode Digital",
  tagline: "We build, we rank, we grow.",
  description:
    "Full-service digital agency helping small and medium businesses grow online with SEO, custom websites, and social media marketing.",
  contact: {
    email: "hello@monkeycode.digital",
    phone: "+1 (555) 123-4567",
    whatsapp: "+1 (555) 123-4567",
    address: "123 Market Street, Suite 400, San Francisco, CA",
    website: "https://monkeycode.digital",
  },
  hours: {
    open: "9:00",
    close: "18:00",
    timezone: "America/Los_Angeles",
    days: "Monday - Friday",
  },
  paymentTerms:
    "50% deposit to start, 50% due on delivery. Monthly retainers billed at the start of each month.",
  services: [
    {
      id: "seo-basic",
      name: "SEO Starter",
      category: "seo",
      description:
        "On-page SEO, keyword research, Google Business optimization, and monthly ranking report.",
      price: 499,
      unit: "/month",
      durationMonths: 3,
    },
    {
      id: "seo-growth",
      name: "SEO Growth",
      category: "seo",
      description:
        "Full SEO campaign: technical audits, link building, content optimization, competitor analysis.",
      price: 999,
      unit: "/month",
      durationMonths: 6,
    },
    {
      id: "web-landing",
      name: "Landing Page",
      category: "web",
      description:
        "High-converting single page website, mobile responsive, SEO-ready, 2 revision rounds.",
      price: 1499,
      unit: "one-time",
      durationMonths: 1,
    },
    {
      id: "web-business",
      name: "Business Website",
      category: "web",
      description:
        "Up to 10 pages, CMS, contact forms, analytics, SSL, mobile-first design, 3 revision rounds.",
      price: 3999,
      unit: "one-time",
      durationMonths: 1,
    },
    {
      id: "web-ecommerce",
      name: "E-commerce Store",
      category: "web",
      description:
        "Online store with cart, payments, product management, up to 50 products, training included.",
      price: 6999,
      unit: "one-time",
      durationMonths: 1,
    },
    {
      id: "social-starter",
      name: "Social Media Starter",
      category: "social",
      description:
        "12 posts per month across 2 platforms, caption writing, hashtag strategy, monthly report.",
      price: 599,
      unit: "/month",
      durationMonths: 1,
    },
    {
      id: "social-pro",
      name: "Social Media Pro",
      category: "social",
      description:
        "20 posts + 4 stories per month across 3 platforms, community management, ad creatives.",
      price: 999,
      unit: "/month",
      durationMonths: 1,
    },
    {
      id: "marketing-ads",
      name: "Paid Ads Management",
      category: "marketing",
      description:
        "Google & Meta ads setup and management, A/B testing, budget management, monthly reporting.",
      price: 799,
      unit: "/month + 15% ad spend",
      durationMonths: 1,
    },
  ],
};

const env = (name: string): string | undefined =>
  process.env[name]?.trim() || undefined;

export function getBusinessConfig(): BusinessConfig {
  const base = defaultBusinessConfig;
  const email = env("BUSINESS_EMAIL");
  const phone = env("BUSINESS_PHONE");
  const name = env("BUSINESS_NAME");

  if (!email && !phone && !name) {
    return base;
  }

  return {
    ...base,
    businessName: name ?? base.businessName,
    contact: {
      ...base.contact,
      email: email ?? base.contact.email,
      phone: phone ?? base.contact.phone,
      whatsapp: phone ?? base.contact.whatsapp,
    },
  };
}

export function getServiceById(id: string): BusinessService | undefined {
  return getBusinessConfig().services.find((service) => service.id === id);
}

export function formatPrice(price: number, unit: string): string {
  return `$${price.toLocaleString("en-US")} ${unit}`;
}

export function businessSummary(): string {
  const config = getBusinessConfig();
  const serviceLines = config.services
    .map(
      (service) =>
        `- ${service.name} (${service.id}): ${service.description} — ${formatPrice(service.price, service.unit)}`
    )
    .join("\n");

  return [
    `Business: ${config.businessName} — ${config.tagline}`,
    config.description,
    "",
    `Contact: ${config.contact.email} | ${config.contact.phone} | ${config.contact.website}`,
    `Address: ${config.contact.address}`,
    `Hours: ${config.hours.days} ${config.hours.open} - ${config.hours.close} (${config.hours.timezone})`,
    "",
    "Services & pricing:",
    serviceLines,
    "",
    `Payment terms: ${config.paymentTerms}`,
  ].join("\n");
}
