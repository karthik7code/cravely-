import React, { useState } from 'react';
import { Recipe } from '../../types';
import { useApp } from '../../context/AppContext';
import { Clock, Users, Link2, Sparkles, Flame, Eye, ChefHat, Filter, ListChecks } from 'lucide-react';

interface RecipeListProps {
  onSelectRecipe: (recipe: Recipe) => void;
  searchFilter?: string;
}

export const RecipeList: React.FC<RecipeListProps> = ({ onSelectRecipe, searchFilter = '' }) => {
  const { recipes } = useApp();
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [customLinkInput, setCustomLinkInput] = useState<string>('');

  const tags = ['All', 'Vegetarian', 'High-Protein', 'Gluten-Free', 'Quick & Easy'];

  const filtered = recipes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.tagline.toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedTag === 'All') return true;
    if (selectedTag === 'Vegetarian') return r.dietaryTags.includes('Vegetarian');
    if (selectedTag === 'High-Protein') return r.dietaryTags.includes('High-Protein');
    if (selectedTag === 'Gluten-Free') return r.dietaryTags.includes('Gluten-Free');
    if (selectedTag === 'Quick & Easy') return r.prepTimeMinutes + r.cookTimeMinutes <= 30;
    return true;
  });

  const handleCustomLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLinkInput.trim()) return;
    // Create custom temporary recipe object with this URL and route to detail
    const newRecipe: Recipe = {
      ...recipes[0],
      id: 'custom-' + Date.now(),
      title: 'Custom Cooking Reel Summary',
      youtubeUrl: customLinkInput,
      tagline: 'Extracted directly from provided video link',
    };
    onSelectRecipe(newRecipe);
  };

  return (
    <div className="space-y-6">
      {/* Link Input Section to Summarize through Gemini and prepare checklist */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 to-slate-900 p-6 sm:p-7 text-white shadow-xl border border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black">
            <Link2 className="h-4 w-4" />
          </span>
          <h3 className="text-base font-black">Paste Any Cooking Link ➔ Get Grocery Checklist</h3>
        </div>
        <p className="text-xs text-slate-300 max-w-xl mb-4">
          Add any reel, YouTube video, or recipe link. Our Gemini AI backend will summarize it and generate a checklist of ingredients ready for 10-minute delivery.
        </p>

        <form onSubmit={handleCustomLinkSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="url"
              placeholder="Paste recipe / reel URL (YouTube, Instagram, food blog)..."
              value={customLinkInput}
              onChange={(e) => setCustomLinkInput(e.target.value)}
              className="w-full rounded-2xl bg-slate-800/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-400 border border-slate-600 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#08B968] hover:bg-[#087F46] text-white px-5 py-2.5 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Generate Checklist</span>
          </button>
        </form>
      </div>

      {/* Category Pills Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Trending Recipe Reels</span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#087F46] border border-emerald-100">
              <Sparkles className="h-3 w-3" />
              Reels to Meals
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Select a recipe reel to view the AI summary and prepare your ingredient checklist.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-[#08B968] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => onSelectRecipe(recipe)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer"
          >
            {/* Thumbnail with Reel Overlay */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
              <img
                src={recipe.thumbnail}
                alt={recipe.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

              {/* Checklist badge overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-black text-slate-900 shadow-lg group-hover:scale-105 group-hover:bg-[#08B968] group-hover:text-white transition-all">
                  <ListChecks className="h-4 w-4 text-[#08B968] group-hover:text-white" />
                  <span>View AI Checklist</span>
                </div>
              </div>

              {/* Dietary Tags Overlay */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                <span className="rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs">
                  {recipe.cuisine}
                </span>
                {recipe.dietaryTags.slice(0, 1).map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-emerald-600/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Duration and Views Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-white/90">
                <span className="flex items-center gap-1 drop-shadow">
                  <Clock className="h-3 w-3" />
                  {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                </span>
                <span className="flex items-center gap-1 drop-shadow">
                  <Eye className="h-3 w-3" />
                  {(recipe.viewsCount / 1000).toFixed(0)}k views
                </span>
              </div>
            </div>

            {/* Recipe Content */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src={recipe.chefAvatar}
                    alt={recipe.chefName}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-500">{recipe.chefName}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#08B968] transition">
                  {recipe.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {recipe.tagline}
                </p>
              </div>

              {/* Ingredients & Servings Footnote */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>{recipe.originalServings} Servings</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-[#087F46] bg-emerald-50 px-2.5 py-1 rounded-xl">
                  <span>{recipe.ingredients.length} Items Checklist</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
