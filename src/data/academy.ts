export interface Lesson {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
}

export interface CourseData {
  id: string;
  title: string;
  description: string;
  level: 'Foundational' | 'Professional' | 'Advanced';
  icon: 'Globe' | 'BrainCircuit' | 'Shield' | 'BookOpen' | 'Smartphone';
  xpReward: number;
  estimatedTime: string;
  lessons: Lesson[];
}

export const ACADEMY_COURSES: CourseData[] = [
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
    title: "GSE & Stock Market Fundamentals",
    description: "Master the architecture of the Ghana Stock Exchange and starting your investment journey.",
    level: "Foundational",
    icon: "Globe",
    xpReward: 1000,
    estimatedTime: "2h 30m",
    lessons: [
      {
        id: "l1",
        title: "MTN GHANA Financial Analysis 2026",
        description: "Know this before you invest in Ghana's largest telco.",
        youtubeId: "mdY3Bx15Y00",
        duration: "15 min"
      },
      {
        id: "l2",
        title: "How to buy shares in Ghana with Blackstar App",
        description: "Step-by-step guide to purchasing your first stock.",
        youtubeId: "AcMU-Td9p3M",
        duration: "12 min"
      },
      {
        id: "l3",
        title: "20 stocks for Gh5 or less",
        description: "Affordable entry points into the Ghana Stock Exchange.",
        youtubeId: "dGLAq7r7gnQ",
        duration: "10 min"
      },
      {
        id: "l4",
        title: "How I do my research before buying any stock",
        description: "The professional methodology for stock screening.",
        youtubeId: "G9_LJCPrGhs",
        duration: "18 min"
      },
      {
        id: "l5",
        title: "How to buy stocks in Ghana as a beginner",
        description: "Comparing IC Wealth and Black Star platforms.",
        youtubeId: "EXja7mWJHCA",
        duration: "20 min"
      },
      {
        id: "l6",
        title: "How the GSE printed money for people in 2025",
        description: "Analyzing historic bull runs and wealth creation.",
        youtubeId: "HOl9DX8gLlw",
        duration: "14 min"
      },
      {
        id: "l7",
        title: "Every MTN shareholder must watch this",
        description: "Critical updates for MTN investors.",
        youtubeId: "jev9GEmcmGE",
        duration: "11 min"
      }
    ]
  },
  {
    id: "b7e2a9e3-2e4a-4e8b-9d6c-7f5a1b2c3d4e",
    title: "Investment Apps & Digital Tools",
    description: "Navigate the digital landscape of Ghanaian investment platforms.",
    level: "Foundational",
    icon: "Smartphone",
    xpReward: 800,
    estimatedTime: "1h 45m",
    lessons: [
      {
        id: "l8",
        title: "How to make Money with Achieve by Petra",
        description: "Maximizing yields on the Achieve platform.",
        youtubeId: "EwKRBkLsIA4",
        duration: "12 min"
      },
      {
        id: "l9",
        title: "Make Money with MTN MoMo APP",
        description: "Leveraging mobile money for financial growth.",
        youtubeId: "B0Z6g7hloAs",
        duration: "9 min"
      },
      {
        id: "l10",
        title: "Top 6 Investment apps in Ghana - 2026",
        description: "A comprehensive review of the best digital brokers.",
        youtubeId: "wpZBOGQNO1E",
        duration: "22 min"
      },
      {
        id: "l11",
        title: "GoldBod Jewellery & BOG Gold Coin",
        description: "Investing in physical and digital gold in Ghana.",
        youtubeId: "O7IJzpwlv0E",
        duration: "15 min"
      }
    ]
  },
  {
    id: "a1b2c3d4-e5f6-4a5b-bc6d-7e8f9a0b1c2d",
    title: "Mutual Funds & ETFs",
    description: "Diversify your wealth through professionally managed funds and indices.",
    level: "Professional",
    icon: "BrainCircuit",
    xpReward: 1200,
    estimatedTime: "2h 15m",
    lessons: [
      {
        id: "l12",
        title: "7 Dividend ETFs for Passive Income",
        description: "Building a recurring income stream in 2026.",
        youtubeId: "2WB04VNUFCk",
        duration: "17 min"
      },
      {
        id: "l13",
        title: "Stanbic Income and Cash Trust Fund",
        description: "Deep dive into Stanbic's top mutual funds.",
        youtubeId: "4LzwsGUFh7E",
        duration: "14 min"
      },
      {
        id: "l14",
        title: "Best Mutual funds to make money in Ghana",
        description: "Comparative analysis of yield vs risk.",
        youtubeId: "RruxrMpE3Ok",
        duration: "19 min"
      },
      {
        id: "l15",
        title: "Top 5 ETFs to invest in 2026",
        description: "Passive strategies for long-term growth.",
        youtubeId: "DItl8PU_Hsw",
        duration: "15 min"
      }
    ]
  },
  {
    id: "f1e2d3c4-b5a6-4987-9abc-0d1e2f3a4b5c",
    title: "Portfolio Management & Strategy",
    description: "Advanced frameworks for risk management and long-term hold strategies.",
    level: "Advanced",
    icon: "Shield",
    xpReward: 2000,
    estimatedTime: "2h 00m",
    lessons: [
      {
        id: "l16",
        title: "Manage Your Money with 50/30/20 rule",
        description: "Fundamental budgeting for disciplined investing.",
        youtubeId: "r8ziTqj4JiM",
        duration: "13 min"
      },
      {
        id: "l17",
        title: "Ideal Portfolio Size for Beginners",
        description: "How many stocks should you actually hold?",
        youtubeId: "Btje7jZPPn0",
        duration: "11 min"
      },
      {
        id: "l18",
        title: "Avoid These 8 Investment Mistakes",
        description: "Protecting your capital from common pitfalls.",
        youtubeId: "V8Jpu561BaE",
        duration: "21 min"
      },
      {
        id: "l19",
        title: "I’m buying to hold these 5 stocks forever",
        description: "High-conviction long-term investment picks.",
        youtubeId: "BWhr2GfNv8w",
        duration: "16 min"
      }
    ]
  }
];
