import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Space_Grotesk } from "next/font/google";
import ThemeFooter from "@/components/themeFooter";
import Header from "@/components/Header";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "About + FAQ",
  description:
    "Learn the story behind BrckTrckr and get quick answers to common questions about set search, rankings, and data sources.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About + FAQ | BrckTrckr",
    description:
      "Learn the story behind BrckTrckr and get quick answers to common questions about set search, rankings, and data sources.",
    url: "/about",
    type: "article",
  },
};

const metricsFaqItems = [
  {
    question: "What is Bulk Demand?",
    answer: (
      <span>
        <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Bulk Demand</code> answers: &lsquo;Do buyers commonly buy large real-world quantities of this part across a deep, proven market?&rsquo; It is scored <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">0&ndash;5</code>. Three sub-signals feed into it: <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">BulkVolumeScore</code> (how many total units have been sold &mdash; normalised against a threshold of <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">3,000</code> units), <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">BulkProofScore</code> (how many individual lots have been sold &mdash; normalised against <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">50,000</code> lots, rewarding deep market history), and <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">BasketScore</code> (average units per lot &mdash; parts bought in big baskets score higher). The three scores are multiplied together with aggressive exponents so only genuinely high-volume parts reach above <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">1</code>. Most parts score well below <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">1</code>; only elite builder staples approach <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">4&ndash;5</code>.
      </span>
    ),
  },
  {
    question: "What is Store Magnetism?",
    answer: (
      <span>
        <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Store Magnetism</code> answers: &lsquo;Does this part seem understocked relative to demand?&rsquo; It is scored <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">0&ndash;5</code>. It combines two signals: <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">DemandDepth</code> (how deep the sales history is, normalised against <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">1,000</code> sold lots) and <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">ShortageRatio</code> (<code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">sold lots &divide; stock lots</code> &mdash; high when demand vastly outpaces available supply). When a part has a proven sales history but very little current stock, it scores high &mdash; meaning stocking it could attract buyers who are hunting for it.
      </span>
    ),
  },
  {
    question: "What is General Sellability?",
    answer: (
      <span>
        <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">General Sellability</code> answers: &lsquo;Does this part reliably sell in general?&rsquo; It is scored <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">0&ndash;5</code>. Two signals combine: <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">SellDepth</code> (breadth of sales history, normalised against <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">20,000</code> sold lots &mdash; a much stricter bar than <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Bulk Demand</code>) and <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">SellBalance</code> (sell-through ratio: <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">sold lots &divide; stock lots</code>, capped at <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">1</code>). Both are raised to aggressive exponents so only parts with consistently strong, broad sales history score above <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">1</code>.
      </span>
    ),
  },
  {
    question: "What is Value Multiply?",
    answer: (
      <span>
        <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Value Multiply</code> is the single best demand signal for a part. It takes the <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">max(Bulk Demand, Store Magnetism, General Sellability)</code>, then caps it at <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">5</code>. The idea: a part only needs to excel on one axis to be worth stocking. If a part is a great bulk mover, or a hard-to-find magnet, or a reliable everyday seller &mdash; whichever is strongest becomes its multiplier.
      </span>
    ),
  },
  {
    question: "What is Piece Time Value?",
    answer: (
      <span>
        <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Piece Time Value = Sold Avg Price &times; Value Multiply</code>. It estimates what a single unit of that part is &lsquo;really worth&rsquo; after adjusting for demand quality. A part that sells for <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">$0.10</code> with a <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Value Multiply</code> of <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">3</code> has a <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Piece Time Value</code> of <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">$0.30</code>. This makes price and demand comparable on a single scale.
      </span>
    ),
  },
  {
    question: "What is Total Value?",
    answer: (
      <span>
        <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Total Value = Quantity &times; Piece Time Value</code>. It tells you the total demand-adjusted value of all copies of that part inside the set. Summing <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Total Value</code> across all parts gives you a rough picture of the set&apos;s overall resale potential.
      </span>
    ),
  },
  {
    question: "How is the Set Profile classification determined?",
    answer: (
      <span className="space-y-2 block">
        <span className="block">First, if fewer than <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">50%</code> of a set&apos;s parts have a <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Value Multiply</code> above <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">1.0</code>, the set is classified as <span className="font-semibold" style={{ color: "#9ca3af" }}>Dead Stock</span> - meaning there is not enough broadly valuable stock to make it worth parting out.</span>
        <span className="block">If it passes that threshold, the set is classified by whichever of the four driver counts is largest:</span>
        <span className="block pl-3 border-l-2" style={{ borderColor: "#22c55e" }}>
          <span className="font-semibold" style={{ color: "#22c55e" }}>Goldmine</span> - <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Multi-Driver</code>: parts that score above the threshold on two or more metrics at once.
        </span>
        <span className="block pl-3 border-l-2" style={{ borderColor: "#a855f7" }}>
          <span className="font-semibold" style={{ color: "#a855f7" }}>Crowd Puller</span> - <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Magnet Driven</code>: parts with high <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Store Magnetism</code> dominate the set.
        </span>
        <span className="block pl-3 border-l-2" style={{ borderColor: "#3b82f6" }}>
          <span className="font-semibold" style={{ color: "#3b82f6" }}>Builder&apos;s Pack</span> - <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Bulk Driven</code>: parts with strong <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Bulk Demand</code> dominate the set.
        </span>
        <span className="block pl-3 border-l-2" style={{ borderColor: "#f59e0b" }}>
          <span className="font-semibold" style={{ color: "#f59e0b" }}>Reliable Return</span> - <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">Sellability Driven</code>: parts with high <code className="text-xs bg-neutral-100 dark:bg-gray-700 px-1 py-0.5 rounded">General Sellability</code> dominate the set.
        </span>
      </span>
    ),
  },
]

const faqItems = [
  {
    question: "Is BrckTrckr free to use?",
    answer:
      "Yes. The core system of BrckTrckr will always be free to use. The goal is to make useful LEGO value analytics available to more BrickLinkers. Eventually, I may add some 'premium' features to help support the costs of hosting and maintaining the data pipeline, but currently funding this out of my love for LEGO!",
  },
  {
    question: "What does Set Search show me?",
    answer:
      "Set Search helps you inspect a set and review its part-level value signals so you can make better part-out and sourcing decisions.",
  },
  {
    question: "How does Top Sets ranking work?",
    answer:
      "Top Sets lets you sort and filter by metrics such as piece count, part value, minifigure value, total value, and multiplicative effect.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "BrckTrckr relies on the BrickLink API data for the pricing and demand-supply information.",
  },
  {
    question: "How often is data updated?",
    answer:
      "Data is refreshed daily, but not every single brick. BrickLink API has a daily limit, that I respect, and there wouldn't be a huge amount of value-add of syncing everything daily. If something looks off, please use the Contact form and I will look into it!",
  },
  {
    question: "Can I request features or report issues?",
    answer:
      "Absolutely. Please! Head on over to the Contact page :)",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [...metricsFaqItems, ...faqItems].map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function AboutPage() {
  return (
    <div
      className={`${bodyFont.className} min-h-screen text-[#1e1e1e] dark:text-gray-100 bg-[rgb(251,249,247)] bg-[radial-gradient(circle_at_20%_0%,rgba(242,142,46,0.06)_0%,rgba(242,142,46,0)_40%),radial-gradient(circle_at_80%_10%,rgba(30,30,30,0.03)_0%,rgba(30,30,30,0)_45%)] dark:bg-gray-900 dark:bg-[radial-gradient(circle_at_15%_0%,rgba(242,142,46,0.12)_0%,rgba(242,142,46,0)_42%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_45%)]`}
    >
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <Header />

        <section className="grid gap-6">
          <article className="rounded-2xl border border-[#ece7e2] dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-[0_14px_30px_rgba(20,20,20,0.06)]">
            <h1 className={`${headingFont.className} mb-4 text-4xl font-bold dark:text-gray-100`}>
              About BrckTrckr
            </h1>
            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <p>
                Hey! I&apos;m Anton. I used to be a BrickLink seller for a couple of years during high school and uni, but eventually ran out of time to keep doing it properly.
              </p>
              <p>
                In my day job, I spend most of my time crunching numbers. That gave me the inspiration to build BrckTrckr so other BrickLinkers can use better data to make smarter decisions, and something relaxing and interesting to do in my downtime.
              </p>
              <p>
                The mission is simple: make useful LEGO set and part-value analytics easier to access for the community.
              </p>
            </div>

            <hr className="my-6 border-neutral-200 dark:border-gray-700" />

            <h2 className={`${headingFont.className} mb-4 text-2xl font-bold dark:text-gray-100`}>
              How can I support this?
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              Give me feedback please! What isn&apos;t working, what you want to see work, your thoughts! Please use the{" "}
              <a href="/contact" className="text-[rgb(242,142,46)] hover:underline font-medium">
                contact page
              </a>.
            </p>
          </article>

          <article className="rounded-2xl border border-[#ece7e2] dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-[0_14px_30px_rgba(20,20,20,0.06)]">
            <h2 id="metrics" className={`${headingFont.className} mb-2 text-3xl font-bold dark:text-gray-100`}>
              How the Metrics Work
            </h2>
            <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
              Every part is scored using BrickLink market data. Here is exactly how each number is calculated.
            </p>
            <div className="space-y-4">
              {metricsFaqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                >
                  <summary className="cursor-pointer list-none pr-6 text-base font-semibold text-neutral-900 dark:text-gray-100">
                    {item.question}
                  </summary>
                  <div className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#ece7e2] dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-[0_14px_30px_rgba(20,20,20,0.06)]">
            <h2 className={`${headingFont.className} mb-6 text-3xl font-bold dark:text-gray-100`}>
              FAQ
            </h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                >
                  <summary className="cursor-pointer list-none pr-6 text-base font-semibold text-neutral-900 dark:text-gray-100">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </article>
        </section>
      </div>

      <ThemeFooter />
    </div>
  );
}
