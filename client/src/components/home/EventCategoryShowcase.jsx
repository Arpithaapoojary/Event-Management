import React from 'react';
import { ArrowRight, Sparkles, Cpu, Trophy } from 'lucide-react';

/**
 * Subtle Indian traditional lotus motif for Cultural Events card
 */
function SubtleHeritageMotif({ className = "w-4 h-4 text-amber-600" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3C12.8 7 14.5 9 17.5 10C14.5 11 13 13 12 17C11 13 9.5 11 6.5 10C9.5 9 11.2 7 12 3Z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="12" cy="18.5" r="1.5" fill="currentColor" />
      <path
        d="M4 14C7 16 10 16 12 16C14 16 17 16 20 14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const CATEGORIES = [
  {
    id: 'cultural',
    title: 'Cultural Events',
    badgeText: 'Indian Heritage & Arts',
    badgeIcon: 'heritage',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/90',
    titleColor: 'text-amber-950',
    accentBorder: 'hover:border-amber-400/80',
    buttonClass: 'bg-amber-950 hover:bg-amber-900 text-amber-100',
    tagline: 'Dance • Music • Fashion • Drama • Fest',
    description:
      'Immerse in India’s vibrant performing arts, classical Bharatanatyam and Kathak rhythms, live musical fusions, ethnic couture fashion, and grand college fest celebrations.',
    tags: ['Traditional Dance', 'Music & Singing', 'Fashion Show', 'Drama & Theatre', 'Cultural Fest'],
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    searchKeyword: 'cultural',
    filterKeywords: ['dance', 'music', 'singing', 'fashion', 'theatre', 'drama', 'cultural', 'fest'],
  },
  {
    id: 'technical',
    title: 'Technical Events',
    badgeText: 'Innovation & Engineering',
    badgeIcon: 'tech',
    badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-200/90',
    titleColor: 'text-slate-900',
    accentBorder: 'hover:border-indigo-400/80',
    buttonClass: 'bg-slate-900 hover:bg-indigo-600 text-white',
    tagline: 'Hackathons • Coding • Robotics • Expos',
    description:
      'Push the frontiers of engineering across 24-hour collaborative hackathons, competitive algorithm sprints, autonomous robotics arenas, and hands-on industry workshops.',
    tags: ['Hackathons', 'Coding Competitions', 'Robotics', 'Project Exhibition', 'Workshops'],
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    searchKeyword: 'technical',
    filterKeywords: ['hackathon', 'coding', 'robotics', 'workshop', 'project', 'technical', 'tech', 'engineering'],
  },
  {
    id: 'sports',
    title: 'Sports Events',
    badgeText: 'Athletics & Championships',
    badgeIcon: 'sports',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200/90',
    titleColor: 'text-slate-900',
    accentBorder: 'hover:border-emerald-400/80',
    buttonClass: 'bg-emerald-950 hover:bg-emerald-900 text-emerald-100',
    tagline: 'Cricket • Football • Volleyball • Athletics',
    description:
      'Compete with passion and teamwork in campus cricket leagues, football championships, volleyball matches, track & field athletics, and competitive indoor games.',
    tags: ['Cricket', 'Football', 'Volleyball', 'Athletics', 'Indoor Games'],
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    searchKeyword: 'sports',
    filterKeywords: ['cricket', 'football', 'volleyball', 'athletics', 'sports', 'game', 'tournament', 'indoor'],
  },
];

export default function EventCategoryShowcase({ onSelectCategory }) {
  const handleCardClick = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat.searchKeyword, cat.filterKeywords);
    }
    const directorySection = document.getElementById('events-directory');
    if (directorySection) {
      directorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Event Categories</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Explore Campus Arenas
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Choose your arena from vibrant cultural traditions and cutting-edge technical competitions to championship athletic tournaments.
          </p>
        </div>

        {/* 3 Main Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCardClick(cat)}
              className={`group cursor-pointer rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl ${cat.accentBorder} transition-all duration-300 flex flex-col overflow-hidden`}
            >
              {/* Card Photo Header with Overlay */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-900">
                <img
                  src={cat.image}
                  alt={cat.title}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Subtle vignette gradient for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />

                {/* Category Badge on Top-Left */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xs ${cat.badgeClass}`}
                  >
                    {cat.badgeIcon === 'heritage' && <SubtleHeritageMotif className="w-3.5 h-3.5 text-amber-700" />}
                    {cat.badgeIcon === 'tech' && <Cpu className="w-3.5 h-3.5 text-indigo-600" />}
                    {cat.badgeIcon === 'sports' && <Trophy className="w-3.5 h-3.5 text-emerald-700" />}
                    <span>{cat.badgeText}</span>
                  </span>
                </div>

                {/* Title and Tagline on lower image edge */}
                <div className="absolute bottom-4 left-5 right-5 z-10 text-white">
                  <h3 className="text-2xl font-extrabold text-white tracking-tight leading-snug drop-shadow-sm group-hover:text-indigo-200 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-200/90 font-medium mt-1 truncate">
                    {cat.tagline}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                <div>
                  {/* Category Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {cat.description}
                  </p>

                  {/* Included Categories Pill Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Explore Events Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-xs group-hover:shadow inline-flex items-center justify-center gap-2 cursor-pointer ${cat.buttonClass}`}
                  >
                    <span>Explore {cat.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
