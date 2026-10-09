import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Product, Recipe, ProductCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { CinematicIntroModal } from './CinematicIntroModal';
import {
  Sparkles,
  ShoppingBag,
  CookingPot,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Flame,
  Play,
  Pause,
  Heart,
  ChevronRight,
  Zap,
  Users,
  CheckCircle2,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  Film,
  Check,
  Maximize2,
  Share2,
  Award,
  Plus,
  Minus,
  UtensilsCrossed,
} from 'lucide-react';

interface CustomerHomeProps {
  onNavigateTab: (tab: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onSelectProduct: (product: Product) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onNavigateTab,
  onSelectRecipe,
  onSelectProduct,
}) => {
  const { products, recipes, selectedStore, addToCart, addToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Cinematic Intro Modal state
  const [showCinematicIntro, setShowCinematicIntro] = useState<boolean>(() => {
    // Check if user has seen intro in this session
    return false; // let user click or can trigger on demand
  });

  // Watch & Cook Studio interactive state
  const [isPlayingStudio, setIsPlayingStudio] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [videoProgress, setVideoProgress] = useState<number>(35); // 0 to 100%

  // Dynamic Servings Scaler state (1 to 8 portions)
  const [servingsCount, setServingsCount] = useState<number>(4);

  // Pantry Exclusion Checklist: IDs of items user marks as "I already have this in pantry"
  const [pantryExcludedIds, setPantryExcludedIds] = useState<Record<string, boolean>>({});

  // Architecture pipeline active step
  const [activeEngineStep, setActiveEngineStep] = useState<number>(0);
  const [reelInputUrl, setReelInputUrl] = useState<string>(
    'https://youtube.com/watch?v=v2pG0BvjC90'
  );

  // Live Flash Sale Countdown
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle engine steps automatically if user is idle
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveEngineStep((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(stepInterval);
  }, []);

  // Studio video simulated progress advancement
  useEffect(() => {
    if (!isPlayingStudio) return;
    const progressTimer = setInterval(() => {
      setVideoProgress((prev) => {
        const next = (prev + 1) % 100;
        // Map progress to chapter checkpoints
        if (next < 25) setCurrentChapterIndex(0);
        else if (next < 50) setCurrentChapterIndex(1);
        else if (next < 75) setCurrentChapterIndex(2);
        else setCurrentChapterIndex(3);
        return next;
      });
    }, 600);
    return () => clearInterval(progressTimer);
  }, [isPlayingStudio]);

  const categories: { name: ProductCategory | 'All'; icon: string; count: number }[] = [
    { name: 'All', icon: '🛒', count: products.length },
    {
      name: 'Vegetables & Fruits',
      icon: '🍅',
      count: products.filter((p) => p.category === 'Vegetables & Fruits').length,
    },
    {
      name: 'Dairy & Bread',
      icon: '🧀',
      count: products.filter((p) => p.category === 'Dairy & Bread').length,
    },
    {
      name: 'Atta, Rice & Dals',
      icon: '🌾',
      count: products.filter((p) => p.category === 'Atta, Rice & Dals').length,
    },
    {
      name: 'Oils & Ghee',
      icon: '🫒',
      count: products.filter((p) => p.category === 'Oils & Ghee').length,
    },
    {
      name: 'Masalas & Spices',
      icon: '🌶️',
      count: products.filter((p) => p.category === 'Masalas & Spices').length,
    },
    {
      name: 'Meat & Eggs',
      icon: '🍗',
      count: products.filter((p) => p.category === 'Meat & Eggs').length,
    },
  ];

  const filteredProducts = useMemo(() => {
    return selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const discountedProducts = useMemo(() => {
    return products.filter((p) => p.discountPercent && p.discountPercent >= 15);
  }, [products]);

  // Featured Recipe for Watch & Cook Studio (Paneer Butter Masala)
  const featuredRecipe = recipes[0];

  // Video Chapters for the Watch & Cook Studio
  const studioChapters = [
    {
      time: '0:05',
      title: 'Mise En Place & Dicing',
      desc: 'Cut fresh malai paneer into 1-inch cubes. Puree 4 ripe vine tomatoes.',
      highlightIngredient: 'prod-paneer-fresh',
      tip: 'Soak paneer in warm salted water for 5 mins for ultra-melt-in-mouth texture.',
    },
    {
      time: '0:16',
      title: 'Aromatic Ghee Tempering',
      desc: 'Heat pure cow ghee. Splutter cumin seeds, cardamom, and sliced red onions.',
      highlightIngredient: 'prod-cow-ghee',
      tip: 'Do not burn cumin; let whole seeds crackle until golden fragrant.',
    },
    {
      time: '0:30',
      title: 'Velvety Makhani Reduction',
      desc: 'Simmer blended tomato-cashew puree until ghee floats on surface.',
      highlightIngredient: 'prod-tomato-hybrid',
      tip: 'Cover with lid to prevent red gravy splattering during 8 min reduction.',
    },
    {
      time: '0:45',
      title: 'Kasuri Methi & Butter Glaze',
      desc: 'Gently fold in paneer cubes, crush dried fenugreek leaves, finish with butter.',
      highlightIngredient: 'prod-garam-masala',
      tip: 'Rub kasuri methi between palms to release essential oils before sprinkling.',
    },
  ];

  // Base recipe ingredients for 4 portions
  const baseIngredients = [
    {
      id: 'ing-1',
      name: 'Fresh Malai Paneer',
      baseQty: 200,
      unit: 'g',
      prodId: 'prod-paneer-fresh',
      price: 95,
      isCore: true,
      category: 'Dairy',
    },
    {
      id: 'ing-2',
      name: 'Ripe Vine Tomatoes',
      baseQty: 400,
      unit: 'g',
      prodId: 'prod-tomato-hybrid',
      price: 28,
      isCore: true,
      category: 'Produce',
    },
    {
      id: 'ing-3',
      name: 'Nashik Red Onions',
      baseQty: 250,
      unit: 'g',
      prodId: 'prod-onion-sambhar',
      price: 25,
      isCore: true,
      category: 'Produce',
    },
    {
      id: 'ing-4',
      name: 'Pure Cow Ghee',
      baseQty: 40,
      unit: 'g',
      prodId: 'prod-cow-ghee',
      price: 65,
      isCore: false,
      category: 'Pantry',
    },
    {
      id: 'ing-5',
      name: 'Whole Jeera & Spices',
      baseQty: 15,
      unit: 'g',
      prodId: 'prod-cumin-seeds',
      price: 18,
      isCore: false,
      category: 'Spices',
    },
    {
      id: 'ing-6',
      name: 'Garam Masala Blend',
      baseQty: 25,
      unit: 'g',
      prodId: 'prod-garam-masala',
      price: 32,
      isCore: false,
      category: 'Spices',
    },
  ];

  // Math scaling factor based on current portion selection
  const portionFactor = servingsCount / 4;

  const scaledIngredients = useMemo(() => {
    return baseIngredients.map((item) => {
      const isExcluded = !!pantryExcludedIds[item.id];
      const scaledQty = Math.round(item.baseQty * portionFactor);
      const scaledPrice = Math.round(item.price * Math.max(1, Math.round(portionFactor)));
      return {
        ...item,
        scaledQty,
        scaledPrice,
        isExcluded,
      };
    });
  }, [portionFactor, pantryExcludedIds]);

  // Total bundle price and savings
  const bundleSummary = useMemo(() => {
    let subtotal = 0;
    let pantrySavings = 0;
    let includedCount = 0;

    scaledIngredients.forEach((item) => {
      subtotal += item.scaledPrice;
      if (item.isExcluded) {
        pantrySavings += item.scaledPrice;
      } else {
        includedCount++;
      }
    });

    const finalTotal = Math.max(0, subtotal - pantrySavings);
    return { subtotal, pantrySavings, finalTotal, includedCount };
  }, [scaledIngredients]);

  // Toggle ingredient exclusion (pantry item toggle)
  const togglePantryItem = (id: string) => {
    setPantryExcludedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Add scaled kit to cart with confetti
  const handleAddScaledMealKit = () => {
    let addedCount = 0;
    scaledIngredients.forEach((item) => {
      if (!item.isExcluded) {
        const prod = products.find((p) => p.id === item.prodId);
        if (prod && prod.isAvailable) {
          addToCart(prod, Math.max(1, Math.round(portionFactor)));
          addedCount++;
        }
      }
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    addToast(
      `Added ${addedCount} fresh ingredients for ${servingsCount} portions of Paneer Butter Masala! (Saved ₹${bundleSummary.pantrySavings} from pantry)`,
      'success'
    );
  };

  const engineSteps = [
    {
      id: 0,
      number: '01',
      title: 'Short-Form Reel',
      badge: 'Instagram / YouTube / TikTok',
      desc: 'Consumer spots an irresistible cooking reel or food video.',
      metric: 'Under 60 sec video',
      icon: '🎥',
    },
    {
      id: 1,
      number: '02',
      title: 'Gemini Vision AI Parser',
      badge: 'Multimodal AI Extraction',
      desc: 'Extracts exact spices, produce, measurements, and secret chef techniques.',
      metric: '0.8s Neural Extraction',
      icon: '✨',
    },
    {
      id: 2,
      number: '03',
      title: 'Smart Servings Scaler',
      badge: 'Exact Gram Precision',
      desc: 'Dynamically scales from 1 to 8 portions and maps to dark store stock.',
      metric: 'Zero Food Waste',
      icon: '⚖️',
    },
    {
      id: 3,
      number: '04',
      title: '10-Minute Dark Store Dispatch',
      badge: 'Hyperlocal Fulfillment',
      desc: 'Bagger picks portioned items in 2.5 mins. Fleet delivers hot to your stove.',
      metric: '8.4m Average SLA',
      icon: '🛵',
    },
  ];

  return (
    <div className="space-y-12 pb-24 overflow-hidden">
      {/* CINEMATIC INTRO MODAL OVERLAY */}
      <AnimatePresence>
        {showCinematicIntro && (
          <CinematicIntroModal
            isOpen={showCinematicIntro}
            onClose={() => setShowCinematicIntro(false)}
            onStartCooking={() => {
              setShowCinematicIntro(false);
              const studioEl = document.getElementById('watch-cook-studio');
              if (studioEl) {
                studioEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* REAL-TIME OPERATIONS MARQUEE TICKER */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white py-2.5 px-4 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30 whitespace-nowrap z-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            LIVE RADAR
          </span>

          <div className="overflow-hidden flex-1 relative">
            <div className="animate-marquee flex items-center gap-8 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <strong className="text-white">8.4 mins avg SLA</strong> across Koramangala & Indiranagar
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Flame className="h-3.5 w-3.5 text-rose-400" />
                <strong className="text-white">1,480 orders</strong> packed from dark store this hour
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <strong className="text-white">Gemini 2.5 Vision Engine</strong> active for video checklists
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <strong className="text-white">100% Guaranteed Stock</strong> at {selectedStore.name}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <CookingPot className="h-3.5 w-3.5 text-emerald-300" />
                <strong className="text-white">420 cooks</strong> prepping Dal Tadka & Paneer Butter Masala
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ULTRA-MODERN MOTION HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#022c16] via-[#064e29] to-[#047857] text-white shadow-2xl shadow-emerald-950/20 border border-emerald-500/20">
        {/* Animated Background Ambience & Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse-glow" />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: '1.5s' }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="14" cy="14" r="1.5" fill="#ffffff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dot-grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Status Badge & Replay Intro Trigger */}
            <div className="flex flex-wrap items-center gap-3">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 rounded-full bg-emerald-900/80 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white border border-emerald-400/30 shadow-lg"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-200">Reels to Meals™</span>
                <span className="text-white/40">•</span>
                <span className="text-amber-300 font-extrabold flex items-center gap-1">
                  <Zap className="h-3 w-3" /> 10-Min Dark Store Fulfillment
                </span>
              </motion.div>

              {/* Cinematic Intro Launch Button */}
              <button
                onClick={() => setShowCinematicIntro(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 px-3.5 py-1.5 text-xs font-black text-amber-300 transition transform active:scale-95 cursor-pointer shadow-md"
              >
                <Play className="h-3 w-3 fill-amber-300" />
                <span>Replay Cinematic Intro (5s)</span>
              </button>
            </div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Turn Short Reels Into <br />
                <span className="bg-gradient-to-r from-amber-300 via-emerald-200 to-white bg-clip-text text-transparent">
                  Fresh Cooked Meals.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-emerald-100 max-w-xl font-medium leading-relaxed pt-1">
                Paste any cooking video. Our Multimodal Gemini Engine extracts every gram of spice and vegetable, matches live dark store stock, and delivers to your pan in 10 minutes.
              </p>
            </motion.div>

            {/* Interactive Reel Link Input */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-2 max-w-xl"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (featuredRecipe) onSelectRecipe(featuredRecipe);
                }}
                className="group relative flex flex-col sm:flex-row gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-emerald-400/30 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 focus-within:border-amber-400 transition-all duration-300"
              >
                <div className="flex-1 flex items-center gap-2.5 px-2">
                  <span className="text-base">🎥</span>
                  <input
                    type="url"
                    value={reelInputUrl}
                    onChange={(e) => setReelInputUrl(e.target.value)}
                    placeholder="Paste YouTube, Instagram, or TikTok cooking reel..."
                    className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-emerald-200/50 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 px-5 py-3 text-xs sm:text-sm font-black transition-all transform active:scale-95 shadow-md shadow-amber-400/20 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="h-4 w-4 text-slate-950" />
                  <span>Extract Checklist →</span>
                </button>
              </form>

              {/* Sample Reels Quick Pill Clickers */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-emerald-200/80 text-[11px] font-semibold">Try sample reel:</span>
                {recipes.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectRecipe(r)}
                    className="rounded-lg bg-emerald-900/50 hover:bg-emerald-800/80 text-emerald-200 hover:text-white px-2.5 py-1 text-[11px] font-bold border border-emerald-500/20 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{r.title}</span>
                    <ArrowRight className="h-3 w-3 text-emerald-400" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Quick CTAs & Micro Props */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  const studio = document.getElementById('watch-cook-studio');
                  if (studio) studio.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 rounded-2xl bg-white text-[#022c16] hover:bg-emerald-50 px-6 py-3.5 text-xs sm:text-sm font-black shadow-lg shadow-black/10 transition transform active:scale-95 cursor-pointer"
              >
                <Film className="h-4 w-4 text-[#064e29]" />
                <span>Jump to Watch & Cook Studio</span>
              </button>

              <button
                onClick={() => onNavigateTab('products')}
                className="flex items-center gap-2 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 text-white px-6 py-3.5 text-xs sm:text-sm font-bold border border-emerald-400/30 transition transform active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-300" />
                <span>Shop Groceries ({products.length})</span>
              </button>
            </div>

            {/* Feature metric pills */}
            <div className="pt-2 grid grid-cols-3 gap-3 border-t border-emerald-500/20 max-w-xl text-center sm:text-left">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/10">
                <div className="text-lg sm:text-xl font-black text-amber-300">10 Mins</div>
                <div className="text-[10px] text-emerald-200 font-medium">Bagger & Rider SLA</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/10">
                <div className="text-lg sm:text-xl font-black text-white">100%</div>
                <div className="text-[10px] text-emerald-200 font-medium">Portioned Servings</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/10">
                <div className="text-lg sm:text-xl font-black text-emerald-300">₹0 Waste</div>
                <div className="text-[10px] text-emerald-200 font-medium">Exact Grams Only</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Spotlight Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl bg-slate-950/90 p-4 border border-emerald-500/30 shadow-2xl shadow-black/40 overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-tr from-transparent via-emerald-500/20 to-transparent rounded-full animate-radar pointer-events-none" />

              <div
                onClick={() => onSelectRecipe(featuredRecipe)}
                className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 cursor-pointer"
              >
                <img
                  src={featuredRecipe.thumbnail}
                  alt={featuredRecipe.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* Floating Equalizer Wave */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/10">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2" />
                    <span
                      className="w-1 bg-amber-400 rounded-full animate-pulse h-3"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-1 bg-emerald-400 rounded-full animate-pulse h-1.5"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                  <span>Reel Audio Synced</span>
                </div>

                <span className="absolute top-3 left-3 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider shadow-sm">
                  🔥 Viral Reel (2.4M Views)
                </span>

                {/* Center Action Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-full bg-white/95 text-slate-950 px-5 py-2.5 text-xs font-black shadow-xl group-hover:scale-110 group-hover:bg-[#10B981] group-hover:text-white transition duration-300">
                    <Sparkles className="h-4 w-4 text-[#064e29] group-hover:text-white" />
                    <span>Watch & Auto-Extract Kit</span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                  <span className="font-bold text-white">{featuredRecipe.cuisine} Classic</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-300">
                    {featuredRecipe.prepTimeMinutes + featuredRecipe.cookTimeMinutes} mins total
                  </span>
                </div>
              </div>

              {/* Card Meta & Instant Ingredient Preview */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">{featuredRecipe.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{featuredRecipe.tagline}</p>
                  </div>
                  <button
                    onClick={() => onSelectRecipe(featuredRecipe)}
                    className="flex items-center gap-1 text-xs font-extrabold text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    <span>Cook</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-2.5 border border-emerald-500/20 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{featuredRecipe.ingredients.length} Ingredients identified & in stock</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-400">10m Delivery</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WATCH & COOK STUDIO & INTERACTIVE FEATURED RECIPE BENTO CARD */}
      <section
        id="watch-cook-studio"
        className="relative rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8 overflow-hidden"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 text-xs font-black text-emerald-300 mb-2">
              <Film className="h-3.5 w-3.5 text-emerald-400" />
              <span>WATCH & COOK STUDIO™</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Interactive Recipe Reel & Smart Bento Kit
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Scrub the cooking timeline, scale portions dynamically, and toggle pantry exclusions to transfer your exact meal kit in 1 click.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 self-start md:self-auto">
            <div className="text-right">
              <div className="text-xs font-black text-amber-300">10-Min SLA</div>
              <div className="text-[10px] text-slate-400">{selectedStore.name}</div>
            </div>
            <span className="h-8 w-px bg-slate-800" />
            <button
              onClick={() => onSelectRecipe(featuredRecipe)}
              className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              <span>Full Steps</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Bento Layout: Left Video Player & Right Interactive Ingredient Scaler */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Video Reel Studio with Scrubbable Timeline */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl group">
              <img
                src={featuredRecipe.thumbnail}
                alt={featuredRecipe.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              {/* Video Player Floating Overlay Header */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-black text-amber-300 border border-white/10 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-400" /> Chef Masterclass
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className="p-1.5 rounded-lg bg-black/70 text-slate-300 hover:text-white transition cursor-pointer"
                    title={isAudioMuted ? 'Unmute' : 'Mute'}
                  >
                    {isAudioMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => setIsPlayingStudio(!isPlayingStudio)}
                    className="p-1.5 rounded-lg bg-black/70 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {isPlayingStudio ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {/* Center Play Button Overlay if paused */}
              {!isPlayingStudio && (
                <div
                  onClick={() => setIsPlayingStudio(true)}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-2xl transform active:scale-90 transition">
                    <Play className="h-6 w-6 ml-1 fill-slate-950" />
                  </div>
                </div>
              )}

              {/* Dynamic Sound Equalizer Visualizer */}
              {isPlayingStudio && (
                <div className="absolute bottom-16 right-4 flex items-end gap-1 h-5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <span className="w-1 bg-emerald-400 rounded-full h-3 animate-pulse" />
                  <span
                    className="w-1 bg-amber-400 rounded-full h-5 animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-1 bg-emerald-400 rounded-full h-2 animate-pulse"
                    style={{ animationDelay: '0.35s' }}
                  />
                  <span
                    className="w-1 bg-emerald-400 rounded-full h-4 animate-pulse"
                    style={{ animationDelay: '0.1s' }}
                  />
                </div>
              )}

              {/* Bottom Video Progress Scrub Bar */}
              <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold px-1">
                  <span>{studioChapters[currentChapterIndex].time} / 0:58</span>
                  <span className="text-emerald-400 font-mono">
                    {studioChapters[currentChapterIndex].title}
                  </span>
                </div>
                {/* Interactive Scrubber Bar */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.round((clickX / rect.width) * 100);
                    setVideoProgress(pct);
                    if (pct < 25) setCurrentChapterIndex(0);
                    else if (pct < 50) setCurrentChapterIndex(1);
                    else if (pct < 75) setCurrentChapterIndex(2);
                    else setCurrentChapterIndex(3);
                  }}
                  className="h-2 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-amber-400"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Video Chapters Timeline Clickers */}
            <div className="grid grid-cols-2 gap-2">
              {studioChapters.map((chap, idx) => {
                const isActive = currentChapterIndex === idx;
                return (
                  <button
                    key={chap.time}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      setVideoProgress(idx * 25 + 5);
                    }}
                    className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-emerald-950/70 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="font-bold text-amber-400">{chap.time}</span>
                      <span className={isActive ? 'text-emerald-300' : 'text-slate-500'}>
                        Step 0{idx + 1}
                      </span>
                    </div>
                    <div className="text-xs font-black text-white truncate">{chap.title}</div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{chap.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Chef Secret Technique Box */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-400/20 text-xs flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="space-y-0.5">
                <span className="font-black text-amber-300 text-[11px] uppercase tracking-wider block">
                  Chef Pro-Tip ({studioChapters[currentChapterIndex].time})
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {studioChapters[currentChapterIndex].tip}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Interactive Featured Recipe Bento Card with Scaler & Pantry Checklist */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
            {/* Bento Card Header: Title & Dynamic Servings Scaler */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  AI-EXTRACTED BENTO MEAL KIT
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {featuredRecipe.title}
                </h3>
                <span className="text-xs text-slate-400">
                  {featuredRecipe.cuisine} • {featuredRecipe.prepTimeMinutes + featuredRecipe.cookTimeMinutes} mins • {featuredRecipe.difficulty}
                </span>
              </div>

              {/* Dynamic Portions Scaler Switcher */}
              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-amber-400" /> Scale Servings:
                </span>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  {[
                    { count: 1, label: '1 Solo' },
                    { count: 2, label: '2 Duo' },
                    { count: 4, label: '4 Family' },
                    { count: 6, label: '6 Party' },
                    { count: 8, label: '8 Feast' },
                  ].map((s) => (
                    <button
                      key={s.count}
                      onClick={() => setServingsCount(s.count)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        servingsCount === s.count
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md scale-105'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nutrition & AI Tags Banner */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="font-mono font-black text-amber-300">
                  {Math.round(520 * (servingsCount / 4))} kcal
                </div>
                <div className="text-[10px] text-slate-400">Total Calories</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="font-mono font-black text-emerald-400">
                  {Math.round(24 * (servingsCount / 4))}g
                </div>
                <div className="text-[10px] text-slate-400">Protein</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="font-mono font-black text-white">0.8s</div>
                <div className="text-[10px] text-slate-400">AI Vision Parse</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="font-mono font-black text-emerald-300">8.4 mins</div>
                <div className="text-[10px] text-slate-400">Doorstep SLA</div>
              </div>
            </div>

            {/* Interactive Ingredients Checklist (With Pantry Deduction Toggles) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Portioned Ingredients for {servingsCount} People
                </span>
                <span className="text-[11px] text-slate-400">
                  Uncheck items you already have in pantry
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scaledIngredients.map((item) => {
                  const isCurrentChapterHighlight =
                    studioChapters[currentChapterIndex].highlightIngredient === item.prodId;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      onClick={() => togglePantryItem(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        item.isExcluded
                          ? 'bg-slate-950/40 border-slate-800 opacity-60 text-slate-500'
                          : isCurrentChapterHighlight
                          ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Interactive Checkbox */}
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md transition ${
                            item.isExcluded
                              ? 'border border-slate-700 bg-transparent text-transparent'
                              : 'bg-emerald-500 text-slate-950 shadow-xs'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black">{item.name}</span>
                            {item.isCore && (
                              <span className="rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-1 py-0.2">
                                Essential
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.scaledQty} {item.unit} •{' '}
                            {item.isExcluded ? (
                              <span className="text-amber-400">In Pantry (Saved)</span>
                            ) : (
                              <span className="text-emerald-400">Portioned Pack</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-mono font-bold ${
                            item.isExcluded ? 'line-through text-slate-500' : 'text-amber-300'
                          }`}
                        >
                          ₹{item.scaledPrice}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Meal Kit Price Summary & 1-Click Action */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Bundle Subtotal ({servingsCount} portions):</span>
                <span className="font-mono text-white">₹{bundleSummary.subtotal}</span>
              </div>

              {bundleSummary.pantrySavings > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span>Pantry Exclusions Deducted:</span>
                  <span className="font-mono font-bold">-₹{bundleSummary.pantrySavings}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Net Kit Amount ({bundleSummary.includedCount} items)
                  </span>
                  <span className="text-2xl font-black text-amber-300 font-mono">
                    ₹{bundleSummary.finalTotal}
                  </span>
                </div>

                {/* 1-Click Transfer Meal Kit Button */}
                <button
                  onClick={handleAddScaledMealKit}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-300 hover:from-emerald-400 hover:to-amber-200 text-slate-950 px-6 py-3.5 text-xs sm:text-sm font-black shadow-xl shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4 text-slate-950" />
                  <span>Transfer Scaled Kit to Cart (1-Click)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE MOTION GRAPHICS SHOWCASE: "HOW REELS TO MEALS WORKS" */}
      <section className="relative rounded-3xl bg-white p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-[#064e29] border border-emerald-200">
            <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Interactive Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How The Reels to Meals Engine Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Click through any step to see the real-time AI pipeline convert short video reels into doorstep delivery
          </p>
        </div>

        {/* Step Selector Buttons with Animated Progress */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {engineSteps.map((s, idx) => {
            const isActive = activeEngineStep === idx;
            return (
              <button
                key={s.id}
                onClick={() => setActiveEngineStep(idx)}
                className={`relative text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-step-bar"
                    className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"
                  />
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      Step {s.number}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{s.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{s.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700">{s.metric}</span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      isActive ? 'translate-x-1 text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Motion Graphics Stage Preview */}
        <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeEngineStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Step Detail */}
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                  <span>{engineSteps[activeEngineStep].badge}</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-white">
                  {engineSteps[activeEngineStep].title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {engineSteps[activeEngineStep].desc}
                </p>

                {activeEngineStep === 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Supports YouTube Shorts, Instagram Reels, and TikTok links</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Instant visual frame parsing with audio transcript synchronization</span>
                    </div>
                  </div>
                )}

                {activeEngineStep === 1 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Gemini 2.5 extracts: Ingredients, Gram weights, Units, Prep notes</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Flags pantry staples (salt, oil) so you only order what you lack</span>
                    </div>
                  </div>
                )}

                {activeEngineStep === 2 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Interactive slider scales from 1 solo serving up to 8 party portions</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Calculates exact grocery packs with 0 food spoilage</span>
                    </div>
                  </div>
                )}

                {activeEngineStep === 3 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Dark store baggers pick portioned packs in average 2.5 minutes</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Rider navigation routes optimized with live GPS dispatch in 8.4m</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (featuredRecipe) onSelectRecipe(featuredRecipe);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 text-xs transition cursor-pointer"
                  >
                    <span>Test on Paneer Butter Masala</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Step Visual Graphic Simulation */}
              <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-inner">
                {activeEngineStep === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-bold text-white">
                        <Play className="h-3.5 w-3.5 text-emerald-400" />
                        Video Ingestion Pipeline
                      </span>
                      <span className="text-emerald-400 font-mono">1080p @ 60fps</span>
                    </div>
                    <div className="h-32 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-amber-500/10 animate-pulse" />
                      <div className="text-center space-y-1 z-10">
                        <span className="text-3xl">🍲</span>
                        <div className="text-xs font-black text-white">Paneer Butter Masala (Reel #304)</div>
                        <div className="text-[10px] text-slate-400">Chef Sanjeev Style • Duration 48s</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-300 font-bold">Audio Track 100%</div>
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-300 font-bold">Frames Analyzed</div>
                      <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">
                        Verified Recipe
                      </div>
                    </div>
                  </div>
                )}

                {activeEngineStep === 1 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> Multimodal Token Stream
                      </span>
                      <span className="text-[10px] text-amber-400">Model: Gemini 2.5 Flash</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
                      <div className="text-emerald-400">✓ Detected: Fresh Malai Paneer (200g)</div>
                      <div className="text-emerald-400">✓ Detected: Vine Tomatoes (400g puree)</div>
                      <div className="text-emerald-400">✓ Detected: Pure Cow Ghee (40g crackle)</div>
                      <div className="text-slate-400">ℹ Flagged Pantry: Salt, Water (Auto-skipped)</div>
                      <div className="text-amber-300">✓ Matched with Dark Store: Store-BLR-01</div>
                    </div>
                  </div>
                )}

                {activeEngineStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-amber-400" />
                        Dynamic Math Engine
                      </span>
                      <span className="text-xs font-bold text-emerald-400">{servingsCount} People Scale</span>
                    </div>
                    <div className="p-3 bg-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Paneer: 200g × (Scale)</span>
                        <strong className="text-amber-400">{Math.round(200 * portionFactor)}g</strong>
                      </div>
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Tomatoes: 400g × (Scale)</span>
                        <strong className="text-amber-400">{Math.round(400 * portionFactor)}g</strong>
                      </div>
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Cow Ghee: 40g × (Scale)</span>
                        <strong className="text-amber-400">{Math.round(40 * portionFactor)}g</strong>
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold text-center">
                      ⚡ Recalculates dynamically with 0 rounding errors
                    </div>
                  </div>
                )}

                {activeEngineStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-emerald-400" />
                        Live Fleet Route
                      </span>
                      <span className="text-emerald-400 font-bold">ETA 8 mins</span>
                    </div>
                    <div className="relative h-28 bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-center justify-between overflow-hidden">
                      <div className="space-y-1 z-10">
                        <div className="text-xs font-black text-white">🏪 Dark Store Hub</div>
                        <div className="text-[10px] text-slate-400">Koramangala 4th Block</div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-emerald-900 text-emerald-300">
                          Packed & Sealed
                        </span>
                      </div>

                      {/* Moving Rider Graphic */}
                      <div className="flex items-center gap-1 px-4 z-10">
                        <span className="text-2xl animate-bounce">🛵</span>
                      </div>

                      <div className="space-y-1 text-right z-10">
                        <div className="text-xs font-black text-white">🏠 Your Kitchen</div>
                        <div className="text-[10px] text-slate-400">Doorstep Delivery</div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-amber-900 text-amber-300">
                          Rider Assigned
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* TRENDING RECIPE REELS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CookingPot className="h-6 w-6 text-[#10B981]" />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Trending Recipe Reels
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Pick any viral recipe, adjust portions, and cook authentic homemade meals in 10 minutes
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('recipes')}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#064e29] hover:text-emerald-700 cursor-pointer group"
          >
            <span>View All ({recipes.length})</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recipes.slice(0, 4).map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              onClick={() => onSelectRecipe(rec)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={rec.thumbnail}
                  alt={rec.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-black text-slate-900 shadow-lg group-hover:scale-105 group-hover:bg-[#10B981] group-hover:text-white transition duration-200">
                    <Sparkles className="h-3.5 w-3.5 text-[#064e29] group-hover:text-white" />
                    <span>AI Checklist</span>
                  </div>
                </div>

                <span className="absolute top-3 left-3 rounded-md bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-black text-slate-900 shadow-xs">
                  {rec.cuisine}
                </span>

                <span className="absolute bottom-3 right-3 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md">
                  {rec.prepTimeMinutes + rec.cookTimeMinutes}m cook
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-[#10B981] transition line-clamp-1">
                    {rec.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {rec.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#064e29]">
                    {rec.ingredients.length} fresh items
                  </span>
                  <span className="flex items-center gap-1 font-black text-slate-700 group-hover:text-emerald-700 text-[11px]">
                    Reel to Meal <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FLASH DEALS & HARVEST SPECIALS WITH LIVE COUNTDOWN */}
      {discountedProducts.length > 0 && (
        <section className="rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
                <Flame className="h-6 w-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">Flash Deals & Fresh Discounts</h3>
                  <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                    Save up to 40%
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-medium">
                  Daily essentials at wholesale rates directly from farm dark stores
                </p>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-4 py-2 rounded-2xl border border-amber-200 shadow-xs">
              <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
              <span className="text-xs font-bold text-slate-600">Ends in:</span>
              <div className="font-mono text-xs font-black text-slate-900 flex items-center gap-1">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-600">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {discountedProducts.slice(0, 6).map((prod) => (
              <ProductCard key={prod.id} product={prod} onOpenDetail={onSelectProduct} />
            ))}
          </div>
        </section>
      )}

      {/* SHOP GROCERIES BY AISLE WITH SPRING ANIMATED TAB */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shop Groceries by Aisle
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Dark Store: <span className="font-bold text-slate-800">{selectedStore.name}</span> • 10-Minute Instant Dispatch
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('products')}
            className="self-start sm:self-auto text-xs font-black text-[#064e29] hover:underline cursor-pointer"
          >
            Explore Full Catalogue ({products.length}) →
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredProducts.slice(0, 12).map((prod) => (
            <ProductCard key={prod.id} product={prod} onOpenDetail={onSelectProduct} />
          ))}
        </motion.div>
      </section>

      {/* FOOTER GUARANTEE & DARK STORE NOTICE */}
      <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>CYPHER 4.0 Authenticity Standard</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            10-Minute Farm-to-Kitchen Guarantee
          </h3>
          <p className="text-xs text-slate-400 max-w-lg">
            Direct farmer sourcing across Bengaluru dark stores (Koramangala, Indiranagar, HSR Layout). Real-time inventory synchronization with 0 substitute surprises.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('recipes')}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 text-xs transition cursor-pointer"
          >
            Cook With Reels
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 text-xs border border-slate-700 transition cursor-pointer"
          >
            Groceries Aisle
          </button>
        </div>
      </section>
    </div>
  );
};
