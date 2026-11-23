import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
          <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-sage-300">Need assistance?</span>
          <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream mt-1.5">
            Campus Support &amp; Partnerships
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Questions about token verification, canteen vendor onboarding, or university partnerships?
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-sage-100 dark:bg-forest/50 border border-sage-300 dark:border-forest text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-forest dark:text-sage-300 mx-auto stroke-[1.8]" />
            <h3 className="font-bold text-brandText-primary dark:text-cream text-base">Message sent</h3>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
              Our campus support team responds within 2-4 hours during academic days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">Your name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  className="field"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">University email</label>
                <input
                  type="email"
                  required
                  placeholder="aarav@dtu.ac.in"
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">Topic</label>
              <select className="field">
                <option>Order Token Issue</option>
                <option>Canteen Vendor Partnership</option>
                <option>University Administration Inquiries</option>
                <option>Other Feedback</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">Message</label>
              <textarea
                rows="4"
                required
                placeholder="Explain your query in detail..."
                className="field"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-600 text-cream font-semibold transition-colors flex items-center gap-2 shadow-subtle"
            >
              <Send className="w-4 h-4 stroke-[2]" />
              <span>Submit query</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
