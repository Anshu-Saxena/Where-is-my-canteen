import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowLeft } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How does pickup slot pacing work?',
      a: 'To eliminate long counter lines, each canteen limits pre-orders to manageable batches (typically 25-40 tokens) per 15-minute window. You choose a slot that matches your lecture break.'
    },
    {
      q: 'Can I cancel an order after placing it?',
      a: 'Yes, you can cancel your order free of charge while its status is "Pending" (before the kitchen accepts and starts cooking). Once cooking begins, cancellation is disabled to prevent food wastage.'
    },
    {
      q: 'How do I collect my order at the counter?',
      a: 'When your order status turns "Ready for Pickup", walk to the canteen collection counter and display your Digital Token Number (e.g. T-48) or let the staff scan your order QR code.'
    },
    {
      q: 'Why can I only order from one canteen at a time?',
      a: 'Because canteens operate independent kitchens with different physical counters across campus, each order is tied to a single canteen kitchen ticket.'
    },
    {
      q: 'Are all campus prices regulated?',
      a: 'Yes. All canteen vendors registered on Where is my Canteen have their menus and prices approved and monitored by the University administration.'
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary hover:text-forest dark:hover:text-sage-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="card rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-sage-300">Frequently asked questions</span>
          <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream mt-1.5">
            Help &amp; Guidelines
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Everything you need to know about pre-ordering food on your university campus
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-brandText-primary dark:text-cream flex items-center justify-between gap-3 hover:bg-cream-100 dark:hover:bg-brandBorder-dark/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-brandText-secondary transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-brandText-secondary dark:text-brandText-darkSecondary leading-relaxed bg-cream-100/50 dark:bg-brandCard-dark/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
