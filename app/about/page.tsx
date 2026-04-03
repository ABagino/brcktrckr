import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Manrope, Space_Grotesk } from "next/font/google";

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
  mainEntity: faqItems.map((item) => ({
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
        <header className="mb-16 flex items-center justify-between">
          <Link href="/" className={`${headingFont.className} text-2xl font-bold tracking-tight`}>
            BrckTrckr
          </Link>
          <nav className="hidden gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-400 md:flex">
            <Link href="/" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
              Home
            </Link>
            <Link href="/set-look" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
              Set Search
            </Link>
            <Link href="/set-rank" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
              Top Sets
            </Link>
            <Link href="/about" className="font-bold text-neutral-900 dark:text-white transition-colors hover:text-neutral-900 dark:hover:text-white">
              About + FAQ
            </Link>
            <Link href="/contact" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
              Contact
            </Link>
          </nav>
          <Link
            href="/set-look"
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            SEARCH SETS
          </Link>
        </header>

        <section className="grid gap-6">
          <article className="rounded-2xl border border-[#ece7e2] dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-[0_14px_30px_rgba(20,20,20,0.06)]">
            <h1 className={`${headingFont.className} mb-4 text-4xl font-bold dark:text-gray-100`}>
              About BrckTrckr
            </h1>
            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <p>
                Hey! I'm Anton. I used to be a BrickLink seller for a couple of years during high school and uni, but eventually ran out of time to keep doing it properly.
              </p>
              <p>
                In my day job, I spend most of my time crunching numbers. That gave me the inspiration to build BrckTrckr so other BrickLinkers can use better data to make smarter decisions, and something relaxing and interesting to do in my downtime.
              </p>
              <p>
                The mission is simple: make useful LEGO set and part-value analytics easier to access for the community.
              </p>
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
    </div>
  );
}
