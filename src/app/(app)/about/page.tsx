'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SOURCE_ROWS = [
  { priority: 'Highest', source: 'Voting records', example: 'How they actually voted on specific bills' },
  { priority: 'Highest', source: 'Interest group scorecards', example: 'Ratings from orgs like LCV, NRA, Chamber of Commerce, AFL-CIO' },
  { priority: 'Medium', source: 'Campaign website', example: "The candidate's own stated positions" },
  { priority: 'Medium', source: 'Interviews', example: 'Answers in media interviews, editorial boards, or voter guides' },
  { priority: 'Lower', source: 'News coverage', example: 'Reporting on their positions' },
  { priority: 'Lower', source: 'Endorsements', example: 'Which organizations support or oppose them' },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is Ballot Builder affiliated with any political party?',
    a: 'No. We score candidates on their individual records and positions, not their party membership. Our scoring methodology is documented and open to review.',
  },
  {
    q: 'How do you keep political bias out of the scoring?',
    a: 'We prioritize objective evidence (voting records, numerical ratings from established organizations) over subjective sources. We use interest group scorecards from across the political spectrum \u2014 both left-leaning organizations (like the League of Conservation Voters) and right-leaning ones (like the NRA and Chamber of Commerce). Every score shows its sources so you can evaluate the evidence yourself.',
  },
  {
    q: "Why doesn't my candidate show a score on some topics?",
    a: "We only score topics where we have evidence. If a candidate hasn't taken a public position on a topic and has no relevant votes, we leave it blank rather than filling in a guess.",
  },
  {
    q: 'Can I see what evidence a score is based on?',
    a: 'Yes. In the ballot view, tap "See value comparison" on any candidate to see the per-topic breakdown with sources and links to original evidence.',
  },
  {
    q: "What if a candidate's position changed recently?",
    a: 'We score their most recent position but flag the change. If a candidate voted one way for years but took a different stance during the campaign, you\'ll see both data points with a note explaining the discrepancy.',
  },
  {
    q: 'How accurate are the match percentages?',
    a: "The match percentage reflects how closely your stated positions align with the candidate's documented positions on the topics you care about. Think of it as a starting point for your research, not a final answer.",
  },
  {
    q: 'Does the system favor incumbents?',
    a: "Incumbents have more data available (voting records, scorecards), so their scores tend to be more precise and carry higher confidence. Challengers are scored on what evidence exists, with lower confidence levels. We don't give incumbents higher match scores \u2014 we just have more certainty about where they stand.",
  },
  {
    q: 'Where does my data go?',
    a: "Nowhere. Your assessment results, demographics, and ballot selections stay in your browser's local storage. If you clear your browser data, it's gone.",
  },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero */}
      <section className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">About Ballot Builder</h1>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">
          A nonpartisan tool that matches you with candidates and ballot measures
          based on your own values &mdash; not party labels.
        </p>
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          This is a prototype being evaluated for accuracy, fairness, and
          usefulness. It is not an official voter guide.
        </p>
      </section>

      {/* How It Works */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">How It Works</h2>
        {[
          {
            step: '1',
            title: 'You tell us what matters to you',
            body: 'A 5-minute quiz covering 15 policy topics across Economy, Healthcare, Housing, Justice, and Climate. You pick concrete policy positions and tell us how much each topic matters to you.',
          },
          {
            step: '2',
            title: 'We score the candidates',
            body: 'Every candidate is independently scored on the same 15 topics using public records \u2014 not assumptions or party affiliation.',
          },
          {
            step: '3',
            title: 'We compute your match',
            body: 'We compare your positions to each candidate\u2019s, weighting topics you care about more. The result is a match percentage showing how much you agree.',
          },
          {
            step: '4',
            title: 'You make your own choices',
            body: 'We show the scores, areas of agreement, and evidence. You can adjust your positions any time and watch recommendations update in real time.',
          },
        ].map((item) => (
          <div key={item.step} className="flex gap-3 bg-gray-50 rounded-xl p-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
              {item.step}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="mt-0.5 text-sm text-gray-700 leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Where Candidate Scores Come From */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">
          Where Candidate Scores Come From
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          We do not score candidates based on party affiliation. When a
          candidate&apos;s voting record contradicts their campaign trail statements,
          we go with the record and flag the discrepancy.
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium text-gray-500">
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2 hidden sm:table-cell">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SOURCE_ROWS.map((row, i) => (
                <tr key={i} className="text-gray-700">
                  <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">
                    {row.priority}
                  </td>
                  <td className="px-3 py-2">{row.source}</td>
                  <td className="px-3 py-2 text-gray-500 hidden sm:table-cell">
                    {row.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How We Validate Information */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">
          How We Validate Information
        </h2>
        <div className="space-y-2">
          {[
            {
              label: 'Multiple sources',
              detail:
                'We don\u2019t rely on a single source for any score. When sources agree, confidence is high. When they don\u2019t, we flag it.',
            },
            {
              label: 'Confidence levels',
              detail:
                'High = multiple independent sources agree. Medium = one strong source. Low = limited evidence \u2014 take with more caution.',
            },
            {
              label: 'Checkable evidence',
              detail:
                'Each score links to original sources where available \u2014 scorecard pages, bill text, interview transcripts.',
            },
            {
              label: 'New candidates',
              detail:
                'First-time candidates without voting records are scored on stated positions with lower confidence, and we tell you that.',
            },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className="mt-0.5 text-sm text-gray-700 leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ballot Measure Recommendations */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900">
          Ballot Measure Recommendations
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Each ballot measure is analyzed for which policy topics it affects and in
          what direction. We compare the measure&apos;s effects against your positions
          &mdash; if it pushes policy your way, we recommend YES; if away, NO. If
          it&apos;s genuinely close, we say so and show the breakdown.
        </p>
      </section>

      {/* Your Privacy */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900">Your Privacy</h2>
        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">
            &#x2713;
          </span>
          <div className="text-sm text-gray-700 leading-relaxed space-y-1">
            <p>All your answers and ballot selections are stored on your device only.</p>
            <p>Nothing is sent to a server unless you explicitly submit feedback.</p>
            <p>No account is required. We don&apos;t track your political positions.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900">
          Common Questions
        </h2>
        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : i)}
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
                  <div className="px-4 pb-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
