import React, { useState, useMemo, useEffect } from 'react';
import { Recipe, Product } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Link2,
  Sparkles,
  ShoppingBag,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Users,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  ListChecks,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { summarizeReelAndExtractChecklist, ReelExtractionResult, askChefAI } from '../../services/geminiService';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onOpenCart: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, onOpenCart }) => {
  const { scaleRecipeIngredients, addRecipeIngredientsToCart, products } = useApp();

  // Serving counter state
  const [servings, setServings] = useState<number>(recipe.originalServings);

  // Link input state
  const [reelUrlInput, setReelUrlInput] = useState<string>(recipe.youtubeUrl || 'https://www.youtube.com/watch?v=v2pG0BvjC90');
  const [dishHintInput, setDishHintInput] = useState<string>(recipe.title);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [customExtraction, setCustomExtraction] = useState<ReelExtractionResult | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  // AI chef prompt state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initial trigger to extract/summarize if needed
  const handleAnalyzeLink = async (customUrl?: string, customHint?: string) => {
    const url = customUrl || reelUrlInput;
    const hint = customHint || dishHintInput;
    if (!url.trim()) return;

    setIsSummarizing(true);
    try {
      const result = await summarizeReelAndExtractChecklist(
        url,
        hint,
        products.map((p) => ({ id: p.id, name: p.name }))
      );
      setCustomExtraction(result);
      if (result.servings) {
        setServings(result.servings);
      }
    } catch {
      // Fallback
    } finally {
      setIsSummarizing(false);
    }
  };

  // Determine current active recipe details (either extracted via Gemini or from initial recipe)
  const activeTitle = customExtraction?.title || recipe.title;
  const activeSummary = customExtraction?.summary || recipe.description;
  const activeTagline = customExtraction?.tagline || recipe.tagline;
  const activeCuisine = customExtraction?.cuisine || recipe.cuisine;
  const activePrepTime = customExtraction?.prepTimeMinutes || recipe.prepTimeMinutes;
  const activeCookTime = customExtraction?.cookTimeMinutes || recipe.cookTimeMinutes;
  const activeChefTip = customExtraction?.chefTip || 'Crush kasuri methi between palms to release aromatic oils before taking off heat.';
  const activeSteps = customExtraction?.keySteps || recipe.instructions.map((i) => i.instruction);

  // Calculate scaled ingredients
  const scaledIngredients = useMemo(() => {
    const scaleMultiplier = servings / (customExtraction?.servings || recipe.originalServings || 4);

    if (customExtraction && customExtraction.checklist.length > 0) {
      return customExtraction.checklist.map((item, idx) => {
        const scaledQty = Math.round(item.quantity * scaleMultiplier * 10) / 10;
        let matched = products.find((p) => p.id === item.matchedProductId);
        if (!matched) {
          // match by name similarity
          matched = products.find((p) =>
            p.name.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
          );
        }

        let substitute: Product | undefined;
        if (matched?.substitutes && matched.substitutes.length > 0) {
          substitute = products.find((p) => p.id === matched.substitutes![0]);
        }

        let packsNeeded = 1;
        if (matched) {
          const matchUnitNumbers = matched.unit.match(/\d+/);
          const packSize = matchUnitNumbers ? parseInt(matchUnitNumbers[0], 10) : 100;
          if (item.unit === 'g' || item.unit === 'ml') {
            packsNeeded = Math.max(1, Math.ceil(scaledQty / packSize));
          }
        }

        const isAvailable = !!matched && matched.isAvailable && matched.stock > 0;
        const priceEstimate = matched ? matched.price * packsNeeded : 0;

        return {
          id: `ext-${idx}`,
          name: item.name,
          scaledQuantity: scaledQty,
          unit: item.unit,
          notes: item.notes,
          matchedProduct: matched,
          packsNeeded,
          isAvailable,
          substituteProduct: substitute,
          substituteSuggestion: item.substituteSuggestion,
          priceEstimate,
        };
      });
    }

    // Default scaling using base recipe
    return scaleRecipeIngredients(recipe, servings).map((item) => ({
      id: item.ingredient.id,
      name: item.ingredient.name,
      scaledQuantity: item.scaledQuantity,
      unit: item.unit,
      notes: item.ingredient.notes,
      matchedProduct: item.matchedProduct,
      packsNeeded: item.packsNeeded,
      isAvailable: item.isAvailable,
      substituteProduct: item.substituteProduct,
      substituteSuggestion: item.ingredient.substituteSuggestion,
      priceEstimate: item.priceEstimate,
    }));
  }, [recipe, servings, customExtraction, scaleRecipeIngredients, products]);

  // Selected ingredients checkbox map
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  // Sync selected map whenever scaled ingredients change
  useEffect(() => {
    const initialMap: Record<string, boolean> = {};
    scaledIngredients.forEach((item) => {
      initialMap[item.id] = item.isAvailable;
    });
    setSelectedMap(initialMap);
  }, [scaledIngredients]);

  const toggleSelect = (id: string) => {
    setSelectedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAll = () => {
    const next: Record<string, boolean> = {};
    scaledIngredients.forEach((item) => {
      if (item.isAvailable) next[item.id] = true;
    });
    setSelectedMap(next);
  };

  const clearAll = () => {
    setSelectedMap({});
  };

  // Selected summary calculations
  const selectedSummary = useMemo(() => {
    let totalEstimatedPrice = 0;
    let selectedCount = 0;
    const batchToAdd: { productId: string; quantity: number }[] = [];

    scaledIngredients.forEach((item) => {
      if (selectedMap[item.id] && item.matchedProduct && item.isAvailable) {
        totalEstimatedPrice += item.matchedProduct.price * item.packsNeeded;
        selectedCount++;
        batchToAdd.push({
          productId: item.matchedProduct.id,
          quantity: item.packsNeeded,
        });
      }
    });

    return { totalEstimatedPrice, selectedCount, batchToAdd };
  }, [scaledIngredients, selectedMap]);

  const handleAddChecklistToCart = () => {
    if (selectedSummary.batchToAdd.length === 0) return;
    addRecipeIngredientsToCart(recipe, servings, selectedSummary.batchToAdd);
  };

  const handleAskChef = async (queryText?: string) => {
    const textToAsk = queryText || aiQuestion;
    if (!textToAsk.trim()) return;
    setIsAiLoading(true);
    setAiAnswer(null);
    try {
      const response = await askChefAI({
        recipeTitle: activeTitle,
        userPrompt: textToAsk,
        currentIngredients: scaledIngredients.map((i) => `${i.scaledQuantity}${i.unit} ${i.name}`),
      });
      setAiAnswer(response);
    } catch {
      setAiAnswer('Chef Cravely recommends: Simmer on low flame to meld the spices harmoniously!');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Back to Recipe Reels</span>
        </button>

        <span className="text-xs font-bold text-[#087F46] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          Gemini AI Link Summarizer & Checklist Engine
        </span>
      </div>

      {/* SECTION TO ADD LINK & SUMMARIZE THROUGH GEMINI (No YouTube video) */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-slate-700">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black">
              <Link2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Summarize Cooking Reel & Generate Grocery Checklist
              </h2>
              <p className="text-xs text-slate-300">
                Paste any food video / reel URL. Gemini AI in the backend will parse the dish, summarize instructions, and prepare your instant 10-minute grocery checklist.
              </p>
            </div>
          </div>

          {/* Reel Link Input & Gemini Trigger Form */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="url"
                placeholder="Paste video / reel link (e.g. YouTube, Instagram Reel, TikTok, Blog)..."
                value={reelUrlInput}
                onChange={(e) => setReelUrlInput(e.target.value)}
                className="w-full rounded-2xl bg-slate-800/90 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-400 border border-slate-600 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleAnalyzeLink()}
              disabled={isSummarizing || !reelUrlInput.trim()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#08B968] hover:bg-[#087F46] disabled:opacity-50 text-white px-6 py-3 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{isSummarizing ? 'Gemini Analyzing Reel...' : 'Summarize & Extract Checklist'}</span>
            </button>
          </div>

          {/* Quick Preset Reel Links for 1-Click Judge Testing */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Quick Demo Links:</span>
            {[
              { label: 'Paneer Butter Masala', url: 'https://youtube.com/watch?v=v2pG0BvjC90', hint: 'Restaurant Style Paneer Butter Masala' },
              { label: 'Old Delhi Butter Chicken', url: 'https://youtube.com/watch?v=a03U45jFxOI', hint: 'Authentic Butter Chicken Murgh Makhani' },
              { label: 'Dhaba Dal Tadka', url: 'https://youtube.com/watch?v=kP-Q24gK0xM', hint: 'Highway Dhaba Style Dal Tadka' },
              { label: 'Garlic Palak Paneer', url: 'https://youtube.com/watch?v=b_fL5kYj-7w', hint: 'Dhaba Palak Paneer with Garlic' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setReelUrlInput(preset.url);
                  setDishHintInput(preset.hint);
                  handleAnalyzeLink(preset.url, preset.hint);
                }}
                className="rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-600 px-3 py-1 text-[11px] font-semibold transition cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN WORKSPACE: LEFT = GEMINI SUMMARY & STEPS, RIGHT = INTERACTIVE CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Summary & Recipe Cooking Guide */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recipe Overview Card */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#087F46] bg-emerald-50 px-2.5 py-1 rounded-md">
                  {activeCuisine}
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {recipe.difficulty}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Source: {reelUrlInput ? new URL(reelUrlInput.startsWith('http') ? reelUrlInput : `https://${reelUrlInput}`).hostname : 'Reel'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {activeTitle}
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#087F46]">
                {activeTagline}
              </p>
            </div>

            {/* AI Summary Box */}
            <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Gemini Backend Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {activeSummary}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 border border-slate-100 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Prep Time</span>
                <span className="font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  {activePrepTime} mins
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cook Time</span>
                <span className="font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  {activeCookTime} mins
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Base Servings</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {servings} portions
                </span>
              </div>
            </div>

            {/* Chef Tip */}
            {activeChefTip && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/70 text-xs text-amber-900">
                <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black">Chef's Secret: </span>
                  <span className="font-medium">{activeChefTip}</span>
                </div>
              </div>
            )}
          </div>

          {/* Cooking Instructions Card */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm space-y-4">
            <div
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center justify-between cursor-pointer"
            >
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Cooking Steps ({activeSteps.length})</span>
              </h3>
              <button className="text-slate-400 hover:text-slate-600">
                {showInstructions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            {showInstructions && (
              <div className="space-y-3 pt-2">
                {activeSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#087F46] font-black text-xs">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium flex-1">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chef Gemini Floating Prompt Helper */}
          <div className="rounded-3xl bg-violet-50/50 p-5 border border-violet-100 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <h4 className="text-xs font-black text-slate-900">Have a cooking question about this dish?</h4>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Chef Gemini (e.g. Can I make this dairy-free? How to reduce spice?)..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskChef()}
                className="flex-1 rounded-xl bg-white px-3.5 py-2 text-xs text-slate-900 border border-slate-200 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={() => handleAskChef()}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {isAiLoading ? 'Asking...' : 'Ask Chef'}
              </button>
            </div>
            {aiAnswer && (
              <div className="rounded-xl bg-white p-3.5 border border-violet-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {aiAnswer}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: PREPARED CHECKLIST OF ITEMS TO GIVE TO CONSUMER */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl bg-white p-5 sm:p-6 border border-emerald-950/10 shadow-xl shadow-emerald-950/5 space-y-4">
            {/* Header: Title & Interactive Servings Scaler */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#087F46] flex items-center gap-1">
                    <ListChecks className="h-3.5 w-3.5" />
                    Consumer Item Checklist
                  </span>
                  <h3 className="text-lg font-black text-slate-900">Ingredients Checklist</h3>
                </div>

                {/* Servings Stepper */}
                <div className="flex items-center gap-2 bg-emerald-50 p-1 rounded-2xl border border-emerald-100">
                  <button
                    onClick={() => setServings((prev) => Math.max(1, prev - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 hover:text-emerald-700 shadow-xs font-black cursor-pointer active:scale-95 transition"
                    title="Decrease servings"
                  >
                    -
                  </button>
                  <div className="px-2 text-center">
                    <span className="text-base font-black text-emerald-900">{servings}</span>
                    <span className="block text-[9px] font-bold text-[#087F46] -mt-1">
                      {servings === 1 ? 'serving' : 'servings'}
                    </span>
                  </div>
                  <button
                    onClick={() => setServings((prev) => Math.min(12, prev + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 hover:text-emerald-700 shadow-xs font-black cursor-pointer active:scale-95 transition"
                    title="Increase servings"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Formula & Scaling Indicator */}
              <p className="mt-2 text-[11px] text-slate-500">
                Quantities auto-scaled for <strong>{servings} servings</strong>. Check items you already have at home or add all to cart.
              </p>
            </div>

            {/* Checklist action controls & Filter Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-black text-slate-800">
                  {selectedSummary.selectedCount} of {scaledIngredients.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="font-bold text-[#087F46] hover:underline cursor-pointer text-xs"
                  >
                    Select All ({scaledIngredients.filter((i) => i.isAvailable).length})
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="font-medium text-slate-500 hover:text-slate-800 cursor-pointer text-xs"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Status Banner when items are AI-extracted */}
              {customExtraction && (
                <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 rounded-xl px-3 py-1.5 text-[11px] border border-emerald-100 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>AI-Extracted from link & matched to stock</span>
                  </span>
                  <span className="font-bold bg-white text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                    {scaledIngredients.filter((i) => i.isAvailable).length} in stock
                  </span>
                </div>
              )}
            </div>

            {/* THE INGREDIENT CHECKLIST ITEMS */}
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
              {scaledIngredients.map((item) => {
                const isChecked = !!selectedMap[item.id];
                const matched = item.matchedProduct;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.isAvailable) toggleSelect(item.id);
                    }}
                    className={`py-3 px-2 -mx-2 rounded-2xl flex items-start gap-3 transition cursor-pointer select-none ${
                      !item.isAvailable
                        ? 'opacity-65 cursor-not-allowed bg-slate-50/60'
                        : isChecked
                        ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Checkbox button */}
                    <button
                      type="button"
                      disabled={!item.isAvailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(item.id);
                      }}
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition cursor-pointer ${
                        !item.isAvailable
                          ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                          : isChecked
                          ? 'border-[#08B968] bg-[#08B968] text-white shadow-xs'
                          : 'border-slate-300 bg-white hover:border-[#08B968]'
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5" />}
                    </button>

                    {/* Product image if matched in dark store */}
                    {matched ? (
                      <img
                        src={matched.image}
                        alt={matched.name}
                        className="h-11 w-11 shrink-0 rounded-xl object-cover border border-slate-100 shadow-2xs"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (matched.name.toLowerCase().includes('coriander') || matched.id.includes('coriander')) {
                            target.src = '/images/coriander-bunch.jpg';
                          } else {
                            target.src = '/images/prod-tomato-hybrid.jpg';
                          }
                        }}
                      />
                    ) : (
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        🛒
                      </div>
                    )}

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className={`text-xs font-bold transition ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                            {item.name}
                          </h4>
                          <span className="text-[11px] font-black text-[#087F46]">
                            {item.scaledQuantity} {item.unit}
                          </span>
                        </div>

                        {/* Price calculation */}
                        {matched && item.isAvailable && (
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-black block ${isChecked ? 'text-slate-900' : 'text-slate-400'}`}>
                              ₹{matched.price * item.packsNeeded}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({item.packsNeeded}x {matched.unit})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stock availability & Dark Store product match badge */}
                      {!item.isAvailable ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>Out of stock in 10-min Dark Store</span>
                        </div>
                      ) : (
                        <p className="mt-0.5 text-[10px] text-slate-500 truncate flex items-center gap-1">
                          <span className="text-emerald-700 font-bold">✓ Matches:</span>
                          <span>{matched?.name}</span>
                        </p>
                      )}

                      {/* Notes / Chef instructions */}
                      {item.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Checkout Action Box */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">
                    Checked {selectedSummary.selectedCount} ingredients
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-slate-900">
                      ₹{selectedSummary.totalEstimatedPrice}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">estimated total</span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  ⚡ 10-Min Fast Dispatch
                </span>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                disabled={selectedSummary.selectedCount === 0}
                onClick={handleAddChecklistToCart}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#08B968] hover:bg-[#087F46] disabled:opacity-50 text-white py-3.5 font-black text-sm shadow-lg shadow-emerald-600/25 transition active:scale-98 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add {selectedSummary.selectedCount} Checked Items to Cart</span>
              </button>

              <button
                type="button"
                onClick={onOpenCart}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[#087F46] hover:underline cursor-pointer py-1"
              >
                <span>View Full Basket & Place Order</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
