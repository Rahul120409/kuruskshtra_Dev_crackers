'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Scissors, 
  Clock, 
  Search, 
  Sparkles, 
  Check, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { SalonService } from '../../types';
import { customerService } from '../../services/customerService';

const CATEGORIES = ['All', 'Haircuts', 'Beard & Shave', 'Color & Styling', 'Spa & Treatments'] as const;

export default function ServicesPage() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadServices() {
      setIsLoading(true);
      try {
        const data = await customerService.getServices(selectedCategory);
        setServices(data);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  }, [selectedCategory]);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 inline-flex items-center gap-1.5">
          <Scissors className="w-3.5 h-3.5" />
          <span>Curated Salon Menu</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Precision Cuts & Treatments
        </h1>
        <p className="text-sm text-zinc-400">
          Select a master grooming service below. Or try our AI hairstyle consultation to match your look with facial structure.
        </p>

        {/* AI Banner Teaser */}
        <div className="pt-2">
          <Link
            href="/ai-recommend"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Not sure what suits you? Take our AI Style Match</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-zinc-800/60">
          <Scissors className="w-10 h-10 text-zinc-600 mx-auto mb-2 opacity-50" />
          <h3 className="text-base font-semibold text-zinc-300">No services found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try changing your search term or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-amber-500/30 overflow-hidden transition-all flex flex-col group"
            >
              {/* Image Preview */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={srv.imageUrl}
                  alt={srv.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-300 font-mono">
                  ₹{srv.price}
                </div>
                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-medium text-zinc-300">
                  {srv.category}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{srv.description}</p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{srv.durationMinutes} mins</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/booking?serviceId=${srv.id}`}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
