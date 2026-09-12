'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Star, 
  Sparkles, 
  CheckCircle2, 
  MessageSquareHeart, 
  Clock, 
  Scissors, 
  ThumbsUp, 
  ArrowRight,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCustomer } from '../../context/CustomerContext';
import { customerService } from '../../services/customerService';

const FEEDBACK_TAGS = [
  'Accurate Wait Time',
  'Master Scissor Work',
  'Spot-on AI Match',
  'Courteous Stylist',
  'Clean & Hygienic Studio',
  'Fast Checkout',
];

export default function FeedbackPage() {
  const { user, activeToken, clearActiveToken } = useCustomer();

  const [overallRating, setOverallRating] = useState<number>(5);
  const [waitRating, setWaitRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await customerService.submitFeedback({
        customerId: user?.id || '',
        tokenId: activeToken?.tokenId || '',
        rating: overallRating,
        waitingRating: waitRating,
        serviceRating: serviceRating,
        comment,
        tags: selectedTags,
      });

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setIsSubmitted(true);
      clearActiveToken();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto emerald-glow-shadow">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Thank You, {user?.name?.split(' ')[0] || 'Valued Guest'}!</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Your feedback has been saved and shared with the salon operations panel. We look forward to your next visit!
        </p>

        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/services"
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700/60"
          >
            Explore More Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1.5">
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>Post-Service Review</span>
        </span>
        <h1 className="text-3xl font-extrabold text-white">How Was Your Experience?</h1>
        <p className="text-xs text-zinc-400">
          Your review directly helps our stylists refine hair styling recommendations and queue timing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl glass-panel p-6 sm:p-8 border border-zinc-800 space-y-6">
        
        {/* Overall Star Rating */}
        <div className="text-center space-y-2 pb-4 border-b border-zinc-800">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
            Overall Rating
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setOverallRating(star)}
                className="p-1.5 rounded-xl hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= overallRating
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_#f59e0b]'
                      : 'text-zinc-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-amber-300">
            {overallRating === 5 ? 'Exceptional Grooming' : overallRating === 4 ? 'Great Service' : 'Satisfactory'}
          </span>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Waiting Time Accuracy */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Wait Time Accuracy</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setWaitRating(val)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                    val <= waitRating
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-500 block">1 = Delayed • 5 = Exactly as Predicted</span>
          </div>

          {/* Stylist & Cut Quality */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Scissors className="w-4 h-4 text-amber-400" />
              <span>Haircut & Styling</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setServiceRating(val)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                    val <= serviceRating
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-500 block">1 = Poor • 5 = Masterpiece</span>
          </div>

        </div>

        {/* Highlights Tags */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-zinc-300 block">What stood out most?</label>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comments Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 block">Additional Notes / Barber Compliment</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            placeholder="Share details of your experience..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          <ThumbsUp className="w-4 h-4 fill-slate-950" />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
        </button>

      </form>
    </div>
  );
}
