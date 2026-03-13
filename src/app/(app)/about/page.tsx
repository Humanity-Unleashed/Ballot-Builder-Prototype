'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, CheckSquare, X } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string | string[];
}

const SECTIONS: { heading: string; items: FaqItem[] }[] = [
  {
    heading: 'The Basics',
    items: [
      {
        q: 'What is Ballot Builder?',
        a: 'A nonpartisan tool that matches you with candidates and ballot measures based on your own values — not party labels. It is a prototype being evaluated for accuracy, fairness, and usefulness. It is not an official voter guide.',
      },
      {
        q: 'How does the assessment work?',
        a: [
          'You answer a short adaptive assessment that covers 16 policy topics across five domains: Economy, Healthcare, Housing, Justice, and Climate.',
          'The system uses information theory to figure out which questions will tell it the most about your values and skips the ones that won\'t. Most people finish in 5\u201310 questions instead of answering all 16.',
          'You can respond with quick slider picks or switch to typing/speaking in your own words. When you use natural language, the system extracts signals across multiple topics from a single response — so one thoughtful answer can cover several issues at once.',
        ],
      },
      {
        q: 'What happens after the assessment?',
        a: 'You get a Civic Blueprint showing where you land on each topic, grouped by domain. You can fine-tune any position before moving on. Then the system compares your blueprint against each candidate and ballot measure on your actual ballot to produce match scores.',
      },
      {
        q: 'Is this affiliated with any political party?',
        a: 'No. Candidates are scored on their individual records and positions, not their party membership.',
      },
    ],
  },
  {
    heading: 'Assessment & Scoring',
    items: [
      {
        q: 'What does "adaptive" mean?',
        a: [
          'The assessment tracks how much uncertainty remains about each of your positions using Shannon entropy — a measure from information theory. Each question is chosen to reduce that uncertainty as much as possible.',
          'It also accounts for which topics matter most for your specific ballot, so locally relevant issues get asked first. Once the remaining uncertainty drops below a threshold, the assessment wraps up automatically.',
        ],
      },
      {
        q: 'How does the natural language option work?',
        a: 'When you type or speak a response, the system analyzes it to extract your position on the topic it asked about, plus any other topics you touched on. Each signal is classified by strength — a direct statement carries more weight than an implication — and snapped to a concrete position to avoid false precision.',
      },
      {
        q: 'How are candidates scored?',
        a: [
          'Candidates are independently scored on the same 16 topics using public evidence. Voting records and interest group scorecards (from organizations across the political spectrum) carry the most weight. Campaign statements, interviews, and endorsements fill in the gaps.',
          'When a candidate\'s voting record contradicts their campaign trail statements, the record wins and the discrepancy is flagged.',
        ],
      },
      {
        q: 'How are match percentages calculated?',
        a: 'Your positions are compared to each candidate\'s documented positions across all scored topics, weighted by how much you said each topic matters. The result is a percentage reflecting how closely you align. Topics where the candidate has no data are excluded rather than filled with a guess.',
      },
      {
        q: 'How are ballot measure recommendations made?',
        a: 'Each measure is analyzed for which policy topics it affects and in what direction. If the measure pushes policy in your direction, the system recommends YES; if away, NO. If it\'s genuinely close, it says so and shows you the breakdown.',
      },
    ],
  },
  {
    heading: 'Trust & Transparency',
    items: [
      {
        q: 'How do you keep political bias out?',
        a: 'By prioritizing objective evidence — voting records and numerical ratings from established organizations on both sides of the aisle. Interest group scorecards come from left-leaning groups (League of Conservation Voters, AFL-CIO) and right-leaning ones (NRA, Chamber of Commerce) alike. Every score shows its sources.',
      },
      {
        q: 'What are confidence levels?',
        a: 'High means multiple independent sources agree. Medium means one strong source. Low means limited evidence — treat those with more caution. First-time candidates without voting records will naturally have fewer scored topics and lower confidence.',
      },
      {
        q: 'Can I see the evidence behind a score?',
        a: 'Yes. Tap "See value comparison" on any candidate to see the per-topic breakdown with sources and links to original evidence where available.',
      },
      {
        q: "What if a candidate's position changed recently?",
        a: "The most recent position is scored, but the change is flagged. If a candidate voted one way for years but took a different stance during the campaign, you'll see both data points.",
      },
      {
        q: 'Does the system favor incumbents?',
        a: 'Incumbents have more data available, so their scores are more precise. Challengers are scored on what exists, with lower confidence. Incumbents don\'t get higher match scores — there\'s just more certainty about where they stand.',
      },
    ],
  },
  {
    heading: 'Privacy & Data',
    items: [
      {
        q: 'Where does my data go?',
        a: 'Your assessment results, demographics, and ballot selections stay in your browser\'s local storage. Nothing is sent to a server unless you explicitly submit feedback. No account is required.',
      },
      {
        q: 'What about the AI assistant?',
        a: 'When you use the "Ask AI" feature on a ballot item, your question and your civic blueprint are sent to generate a response. The conversation is not stored on our servers after the response is returned.',
      },
    ],
  },
];

export default function AboutPage() {
  const router = useRouter();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Compact hero */}
      <div className="flex items-center gap-2.5 pt-2">
        <CheckSquare className="h-5 w-5 text-brand-primary shrink-0" />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">About Ballot Builder</h1>
          <p className="text-xs text-gray-500">
            Nonpartisan, values-based voter guidance
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Collapsible sections */}
      {SECTIONS.map((section) => (
        <section key={section.heading} className="space-y-1.5">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
            {section.heading}
          </h2>
          <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden">
            {section.items.map((faq, i) => {
              const key = `${section.heading}-${i}`;
              const isOpen = openItems.has(key);
              const paragraphs = Array.isArray(faq.a) ? faq.a : [faq.a];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={[
                        'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
                        isOpen ? 'rotate-180' : '',
                      ].join(' ')}
                    />
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-3 space-y-2">
                      {paragraphs.map((p, j) => (
                        <p key={j} className="text-sm text-gray-700 leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
