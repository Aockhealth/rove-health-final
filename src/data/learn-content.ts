export type ArticleCategory = "PCOS" | "Pregnancy" | "Reproductive Health" | "Cycle Syncing" | "Sexual Health";

export interface Article {
    id: string;
    title: string;
    excerpt: string;
    category: ArticleCategory;
    readTime: string; // e.g., "5 min read"
    author: string;
    imageUrl: string; // Placeholder path or external URL
    content?: string; // Full content (optional for now)
    date: string;
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
    "PCOS",
    "Pregnancy",
    "Reproductive Health",
    "Cycle Syncing",
    "Sexual Health"
];

export const LEARN_ARTICLES: Article[] = [
    {
        id: "1",
        title: "Understanding PCOS: Beyond the Symptoms",
        excerpt: "Polycystic Ovary Syndrome affects 1 in 10 women. Learn about the root causes, insulin resistance, and holistic management strategies.",
        category: "PCOS",
        readTime: "8 min read",
        author: "Dr. Sarah Thompson",
        imageUrl: "/assets/learn/pcos-1.jpg",
        date: "Oct 24, 2024"
    },
    {
        id: "2",
        title: "The 4 Phases of Your Cycle: A Comprehensive Guide",
        excerpt: "Unlock the power of your biology by understanding the unique strengths and needs of your Menstrual, Follicular, Ovulatory, and Luteal phases.",
        category: "Cycle Syncing",
        readTime: "12 min read",
        author: "Rove Health Team",
        imageUrl: "/assets/learn/cycle-1.jpg",
        date: "Nov 02, 2024"
    },
    {
        id: "3",
        title: "Preparing for Pregnancy: A 3-Month Protocol",
        excerpt: "Thinking about conceiving? Here is a nutritional and lifestyle guide to optimize egg quality and hormonal balance before you start trying.",
        category: "Pregnancy",
        readTime: "10 min read",
        author: "Dr. Emily Chen",
        imageUrl: "/assets/learn/pregnancy-1.jpg",
        date: "Nov 15, 2024"
    },
    {
        id: "4",
        title: "Libido & Hormones: What's Nomal?",
        excerpt: "Your sex drive naturally fluctuates throughout your cycle. Discover why your desire peaks during ovulation and dips in the luteal phase.",
        category: "Sexual Health",
        readTime: "6 min read",
        author: "Lisa Ray, Sex Educator",
        imageUrl: "/assets/learn/sexual-nutrition.jpg",
        date: "Dec 05, 2024"
    },
    {
        id: "5",
        title: "Endometriosis vs. Painful Periods",
        excerpt: "How to tell the difference between normal menstrual cramping and potential signs of endometriosis. When to see a doctor.",
        category: "Reproductive Health",
        readTime: "7 min read",
        author: "Dr. Sarah Thompson",
        imageUrl: "/assets/learn/repro-1.jpg",
        date: "Dec 12, 2024"
    },
    {
        id: "6",
        title: "Nutrition for PCOS: The Low GI Approach",
        excerpt: "Stubborn weight gain? Acne? Managing your blood sugar might be the missing key to regulating your PCOS symptoms.",
        category: "PCOS",
        readTime: "9 min read",
        author: "Nutritionist Maya",
        imageUrl: "/assets/learn/pcos-nutrition.jpg",
        date: "Dec 20, 2024"
    },
    {
        id: "7",
        title: "Supplements for Egg Quality",
        excerpt: "CoQ10, Folate, and Omega-3s: What science actually says about boosting your fertility naturally.",
        category: "Pregnancy",
        readTime: "5 min read",
        author: "Dr. Emily Chen",
        imageUrl: "/assets/learn/supplements.jpg",
        date: "Dec 21, 2024"
    },
    {
        id: "8",
        title: "Yoga for Menstrual Cramps",
        excerpt: "5 gentle poses to relieve pelvic tension and soothe period pain instantly.",
        category: "Cycle Syncing",
        readTime: "4 min read",
        author: "Sarah Yoga",
        imageUrl: "/assets/learn/yoga.jpg",
        date: "Dec 22, 2024"
    },
    {
        id: "9",
        title: "The Truth About Seed Cycling",
        excerpt: "Is eating pumpkin seeds actually balanced your hormones? We dive into the research.",
        category: "Cycle Syncing",
        readTime: "6 min read",
        author: "Rove Health Team",
        imageUrl: "/assets/learn/seeds.jpg",
        date: "Dec 23, 2024"
    },
    {
        id: "10",
        title: "PCOS & Hair Loss: Reversing the Shed",
        excerpt: "Androgenic alopecia in PCOS can be devastating. Here's a protocol to block DHT and regrow hair.",
        category: "PCOS",
        readTime: "11 min read",
        author: "Dr. Sarah Thompson",
        imageUrl: "/assets/learn/pcos-hair.jpg",
        date: "Dec 24, 2024"
    },
    {
        id: "11",
        title: "Navigating Intimacy Post-Partum",
        excerpt: "When is the right time? How to handle physical changes and emotional readiness.",
        category: "Sexual Health",
        readTime: "8 min read",
        author: "Lisa Ray",
        imageUrl: "/assets/learn/postpartum.jpg",
        date: "Dec 25, 2024"
    },
    {
        id: "12",
        title: "First Trimester Survival Guide",
        excerpt: "Morning sickness, fatigue, and food aversions: How to thrive in the first 12 weeks.",
        category: "Pregnancy",
        readTime: "7 min read",
        author: "Dr. Emily Chen",
        imageUrl: "/assets/learn/trimester-1.jpg",
        date: "Dec 26, 2024"
    },
    {
        id: "13",
        title: "Understanding Cervical Mucus",
        excerpt: "The most underrated fertility sign. How to track it to pinpoint your exact ovulation window.",
        category: "Reproductive Health",
        readTime: "5 min read",
        author: "Rove Health Team",
        imageUrl: "/assets/learn/mucus.jpg",
        date: "Dec 27, 2024"
    },
    {
        id: "14",
        title: "Cortisol vs. Progesterone",
        excerpt: "Why stress is literally stealing your hormones and causing PMS.",
        category: "Reproductive Health",
        readTime: "6 min read",
        author: "Dr. Sarah Thompson",
        imageUrl: "/assets/learn/stress.jpg",
        date: "Dec 28, 2024"
    },
    {
        id: "15",
        title: "Aphrodisiac Foods That Actually Work",
        excerpt: "From Maca to Dark Chocolate: Science-backed foods to boost your libido.",
        category: "Sexual Health",
        readTime: "4 min read",
        author: "Nutritionist Maya",
        imageUrl: "/assets/learn/chocolate.jpg",
        date: "Dec 29, 2024"
    }
];
