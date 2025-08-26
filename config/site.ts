// config/site.ts

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "DishAI",
  tagline:
    process.env.NEXT_PUBLIC_TAGLINE ||
    "Let AI help you discover the perfect dish based on your mood, dietary preferences, and location.",
  heroTitle: process.env.NEXT_PUBLIC_HERO_TITLE || "What do you want to eat?",

  cuisines: [
    "Italian",
    "Chinese",
    "Mexican",
    "Indian",
    "Japanese",
    "Thai",
    "Mediterranean",
    "American",
  ],

  navLinks: {
    guest: [
      { label: "Login", href: "/sign-in", type: "ghost" },
      { label: "Sign Up", href: "/sign-up", type: "default" },
    ],
    user: [
      { label: "Dashboard", href: "/dashboard", type: "ghost" },
      { label: "Logout", href: "#logout", type: "outline" },
    ],
  },

  features: [
    {
      icon: "sparkles",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-100",
      title: "AI-Powered Suggestions",
      description:
        "Get personalized dish recommendations based on your preferences and mood.",
    },
    {
      icon: "map-pin",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
      title: "Local Restaurants",
      description:
        "Find nearby restaurants that serve your recommended dishes.",
    },
    {
      icon: "leaf",
      iconColor: "text-green-500",
      iconBg: "bg-green-100",
      title: "Dietary Preferences",
      description:
        "Filter by vegan, gluten-free, spicy, comfort food, and more.",
    },
  ],
};
