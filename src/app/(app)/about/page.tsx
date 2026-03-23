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
        a: 'Ballot Builder matches you with candidates and ballot measures based on your values. It is not tied to any party. This is a test version. It is not an official voter guide.',
      },
      {
        q: 'How does the assessment work?',
        a: [
          'You answer a short quiz that covers 17 policy topics. These span five areas: Economy, Healthcare, Housing, Justice, and Climate.',
          'The quiz tracks what it still needs to learn about you. It picks the questions that tell it the most about your values. It also focuses on topics that matter most for your ballot. Once it knows enough, it stops on its own. Most people finish in 5\u201310 questions instead of all 17.',
          'You can pick from preset options or type in your own words. When you type a longer answer, the system can pull out your views on several topics at once. One good answer can cover multiple issues.',
        ],
      },
      {
        q: 'What happens after the assessment?',
        a: 'You get a Civic Blueprint that shows where you stand on each topic. Topics are grouped by area. You can adjust any position before moving on. Then the system compares your blueprint to each candidate and ballot measure on your real ballot. The result is a match score for each one.',
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
        q: 'How does the natural language option work?',
        a: 'When you type or speak an answer, the system finds your stance on the topic it asked about. It also picks up views on other topics you mention. A clear statement counts more than a hint. Your answer is matched to a set position so the score stays accurate.',
      },
      {
        q: 'How are candidates scored?',
        a: [
          'Each candidate is scored on the same 17 topics using public records. Voting history and ratings from groups across the political spectrum carry the most weight. Campaign statements, interviews, and endorsements fill in the gaps.',
          'When a candidate\'s votes in office contradict what they say on the campaign trail, the voting record wins. The conflict is flagged so you can see it.',
        ],
      },
      {
        q: 'How are match percentages calculated?',
        a: 'Your views are compared to each candidate\'s known positions on every scored topic. Topics you said matter more count more in the score. The result is a percentage showing how closely you match. If a candidate has no data on a topic, that topic is left out instead of guessed.',
      },
      {
        q: 'How are ballot measure recommendations made?',
        a: 'Each measure is checked to see which topics it touches and which way it pushes policy. If it moves things your way, the system says YES. If it moves things away from your values, it says NO. If it is a close call, the system tells you and shows the details.',
      },
    ],
  },
  {
    heading: 'Trust & Transparency',
    items: [
      {
        q: 'How do you keep political bias out?',
        a: 'We rely on hard evidence: voting records and ratings from well-known groups on both sides. We use scores from left-leaning groups (League of Conservation Voters, AFL-CIO) and right-leaning ones (NRA, Chamber of Commerce) alike. Every score shows its sources.',
      },
      {
        q: 'What are confidence levels?',
        a: 'High means several sources agree. Medium means one solid source. Low means we have little evidence \u2014 take those scores with a grain of salt. First-time candidates with no voting record will have fewer scored topics and lower confidence.',
      },
      {
        q: 'Can I see the evidence behind a score?',
        a: 'Yes. Tap "See value comparison" on any candidate. You will see a topic-by-topic breakdown with sources and links to the original evidence.',
      },
      {
        q: "What if a candidate's position changed recently?",
        a: "The most recent stance is scored, but the change is flagged. If a candidate voted one way for years but says something different now, you will see both data points.",
      },
      {
        q: 'Does the system favor incumbents?',
        a: 'No. Incumbents have more data, so their scores are more precise. Challengers are scored on what exists, with lower confidence. More data does not mean a higher match \u2014 it just means more certainty about where they stand.',
      },
    ],
  },
  {
    heading: 'Privacy & Data',
    items: [
      {
        q: 'Where does my data go?',
        a: 'Your quiz results, background info, and ballot picks stay in your browser. Nothing is sent to a server unless you submit feedback. No account is needed.',
      },
      {
        q: 'What about the AI assistant?',
        a: 'When you use "Ask AI" on a ballot item, your question and your civic blueprint are sent to get an answer. The conversation is not saved on our servers after the answer comes back.',
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
            Values-based voter guidance, not tied to any party
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
