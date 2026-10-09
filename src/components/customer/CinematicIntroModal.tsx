import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Play,
  Pause,
  X,
  ChevronRight,
  Flame,
  Zap,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';

interface CinematicIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCooking?: () => void;
}

export const CinematicIntroModal: React.FC<CinematicIntroModalProps> = ({
  isOpen,
  onClose,
  onStartCooking,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // 0 to 5000 ms

  const TOTAL_DURATION_MS = 6000; // 6 seconds total cinematic intro
  const STAGES_COUNT = 4;
  const STAGE_DURATION_MS = TOTAL_DURATION_MS / STAGES_COUNT;

  // Handle escape key to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Main 5-second countdown timer loop
  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0);
      setCurrentStage(0);
      return;
    }

    if (isPaused) return;

    const interval = 50; // update every 50ms
    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const nextTime = prev + interval;
        if (nextTime >= TOTAL_DURATION_MS) {
          clearInterval(timer);
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
          setTimeout(() => {
            onClose();
          }, 400);
          return TOTAL_DURATION_MS;
        }

        const calculatedStage = Math.min(
          STAGES_COUNT - 1,
          Math.floor(nextTime / STAGE_DURATION_MS)
        );
        setCurrentStage(calculatedStage);
        return nextTime;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, onClose]);

  if (!isOpen) return null;

  const secondsRemaining = Math.max(0, Math.ceil((TOTAL_DURATION_MS - elapsedTime) / 1000));
  const progressRatio = Math.min(1, elapsedTime / TOTAL_DURATION_MS);

  const stagesMeta = [
    {
      num: '01',
      title: 'Viral Reel Spotted',
      subtitle: 'Social Short-Form Video',
      icon: '📱',
      badge: 'Instagram / YouTube / TikTok',
      color: 'from-amber-400 to-rose-500',
    },
    {
      num: '02',
      title: 'Gemini AI Vision Split',
      subtitle: 'Exact Gram Checklist in 0.8s',
      icon: '⚡',
      badge: 'Multimodal AI Extraction',
      color: 'from-emerald-400 to-teal-500',
    },
    {
      num: '03',
      title: 'Dark Store Robot Bagging',
      subtitle: 'Portioned Meal Kit Packed in 2.5m',
      icon: '🏪',
      badge: 'Zero Spoilage Guarantee',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      num: '04',
      title: '10-Min Doorstep Sprint',
      subtitle: 'Delivered Pan-Ready to Stove',
      icon: '🛵',
      badge: '8.4m Average Live SLA',
      color: 'from-emerald-400 to-amber-400',
    },
  ];

  const handleSelectStage = (idx: number) => {
    setCurrentStage(idx);
    setElapsedTime(idx * STAGE_DURATION_MS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-2xl">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        />
        {/* Subtle dot matrix grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      </div>

      {/* Main Cinematic Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-emerald-500/30 text-white shadow-2xl shadow-emerald-950/60 overflow-hidden"
      >
        {/* TOP STATUS BAR: Countdown timer, Step pills & Skip action */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
          {/* Brand & Live Beacon */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-emerald-950/90 border border-emerald-500/40 px-3 py-1 text-xs font-black text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              CINEMATIC OVERVIEW
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-slate-400">
              How Cravely "Reels to Meals" Delivers in 10 Mins
            </span>
          </div>

          {/* Controls: Pause/Play, Audio & Skip */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Countdown Circular Ring Indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-bold text-white">{secondsRemaining}s</span>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={isPaused ? 'Resume Intro' : 'Pause Intro'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>

            {/* Audio Toggle (Simulated sound cues) */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            </button>

            {/* Skip Intro Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black px-4 py-2 text-xs transition transform active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <span>Skip Intro</span>
              <span className="hidden sm:inline opacity-60 text-[10px] font-mono">(Esc)</span>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* TIME PROGRESS BAR */}
        <div className="h-1.5 w-full bg-slate-800 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400"
            style={{ width: `${progressRatio * 100}%` }}
            transition={{ ease: 'linear', duration: 0.05 }}
          />
        </div>

        {/* STAGES STEP TABS */}
        <div className="grid grid-cols-4 bg-slate-950/50 border-b border-white/5">
          {stagesMeta.map((s, idx) => {
            const isActive = currentStage === idx;
            const isCompleted = currentStage > idx;
            return (
              <button
                key={s.num}
                onClick={() => handleSelectStage(idx)}
                className={`px-3 py-3 text-left transition-all relative cursor-pointer border-r last:border-r-0 border-white/5 ${
                  isActive
                    ? 'bg-slate-800/60 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="intro-tab-highlight"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-amber-400"
                  />
                )}
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="font-mono text-[10px] font-bold text-emerald-400">
                    STAGE {s.num}
                  </span>
                  <span>{s.icon}</span>
                </div>
                <div className="text-xs font-black truncate">{s.title}</div>
              </button>
            );
          })}
        </div>

        {/* MAIN CINEMATIC STAGE DISPLAY */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* STAGE 1: VIRAL REEL SPOTTED */}
            {currentStage === 0 && (
              <motion.div
                key="stage-0"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                {/* Left: Graphic Phone Frame with Reel Animation */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="relative w-64 aspect-[9/16] rounded-3xl bg-slate-950 border-4 border-slate-700 shadow-2xl overflow-hidden p-2">
                    {/* Simulated Reel Media */}
                    <img
                      src="/images/dish-paneer-butter-masala.jpg"
                      alt="Paneer Butter Masala Reel"
                      className="w-full h-full object-cover rounded-2xl animate-pulse"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent rounded-2xl" />

                    {/* Floating Hearts & Comments */}
                    <div className="absolute right-4 bottom-24 flex flex-col items-center gap-3">
                      <div className="flex flex-col items-center text-white">
                        <span className="text-2xl animate-bounce">❤️</span>
                        <span className="text-[10px] font-bold">142K</span>
                      </div>
                      <div className="flex flex-col items-center text-white">
                        <span className="text-2xl">💬</span>
                        <span className="text-[10px] font-bold">3.8K</span>
                      </div>
                      <div className="flex flex-col items-center text-white">
                        <span className="text-2xl">🔥</span>
                        <span className="text-[10px] font-bold">Share</span>
                      </div>
                    </div>

                    {/* Reel Chef Tag */}
                    <div className="absolute bottom-4 left-4 right-14 text-white">
                      <div className="text-[10px] font-bold text-amber-300">@chef_kavita • Sanjeev Style</div>
                      <div className="text-xs font-black line-clamp-1">Viral Paneer Butter Masala 🔥</div>
                      <div className="text-[9px] text-slate-300 mt-0.5">🎵 Original Audio - Sizzling Tadka</div>
                    </div>

                    {/* Soundwave Bars */}
                    <div className="absolute top-4 right-4 flex items-end gap-1 h-4">
                      <span className="w-1 bg-amber-400 rounded-full h-2 animate-pulse" />
                      <span className="w-1 bg-emerald-400 rounded-full h-4 animate-pulse" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1 bg-amber-400 rounded-full h-3 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>

                {/* Right: Stage Copy & Insight */}
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-black text-rose-300">
                    <Flame className="h-3.5 w-3.5 text-rose-400" />
                    <span>STEP 1: INGEST ANY SHORT-FORM REEL</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    You Spot An Irresistible Cooking Video.
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Whether browsing YouTube Shorts, Instagram Reels, or TikTok, watching mouthwatering food usually ends in frustration because you lack the exact ingredients and measurements.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Supported Platforms</span>
                      <span className="text-emerald-400">Instant URL Hook</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white">
                      <span className="px-2 py-1 rounded bg-slate-800">YouTube Shorts</span>
                      <span className="px-2 py-1 rounded bg-slate-800">Instagram Reels</span>
                      <span className="px-2 py-1 rounded bg-slate-800">TikTok Clips</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: GEMINI MULTIMODAL AI DECONSTRUCTION */}
            {currentStage === 1 && (
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                {/* Left: AI Laser Scanning Graphic */}
                <div className="md:col-span-5">
                  <div className="relative aspect-video rounded-3xl bg-slate-950 border-2 border-emerald-500/50 shadow-2xl p-4 overflow-hidden">
                    {/* Laser Scanning Line */}
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* AI Bounding Boxes */}
                    <div className="space-y-2 font-mono text-[11px] pt-2">
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        <span>[BBOX-1] Fresh Malai Paneer</span>
                        <span className="font-bold">200g (99.8%)</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        <span>[BBOX-2] Vine Ripe Tomatoes</span>
                        <span className="font-bold">400g (98.4%)</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        <span>[BBOX-3] Pure Cow Ghee</span>
                        <span className="font-bold">40g (97.9%)</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400">
                        <span>[PANTRY] Salt & Water</span>
                        <span>Auto-Skipped</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Description */}
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-black text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>STEP 2: GEMINI 2.5 MULTIMODAL EXTRACTION</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    AI Deconstructs Video Into Exact Grams & Units.
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Our AI models ingest the video frames and synchronized chef audio transcripts. It detects secret spices, eliminates common pantry items you already own (salt/water), and scales mathematically.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20">
                      <div className="text-emerald-400 text-lg font-black font-mono">0.78s</div>
                      <div className="text-[11px] text-slate-400 font-medium">Neural Extraction Latency</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20">
                      <div className="text-amber-400 text-lg font-black font-mono">100% Exact</div>
                      <div className="text-[11px] text-slate-400 font-medium">Gram-Precision Scalability</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: DARK STORE ROBOTIC CONVEYOR */}
            {currentStage === 2 && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                {/* Left: Conveyor Belt Animation */}
                <div className="md:col-span-5">
                  <div className="rounded-3xl bg-slate-950 border-2 border-blue-500/40 p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-blue-400 flex items-center gap-1.5">
                        <ShoppingBag className="h-4 w-4" /> Dark Store Conveyor Line
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400">Packing: 2.1m</span>
                    </div>

                    {/* Animated Conveyor Track */}
                    <div className="relative h-28 bg-slate-900 rounded-2xl p-3 border border-slate-800 flex items-center justify-around overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500 animate-marquee" />

                      {/* Moving Packs */}
                      <motion.div
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 border border-slate-700 shadow-md text-xs font-bold text-white"
                        animate={{ x: [-20, 20, -20] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <span className="text-xl">🧀</span>
                        <div>
                          <div>Paneer Pack</div>
                          <div className="text-[10px] text-emerald-400 font-mono">200g Sealed</div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 border border-slate-700 shadow-md text-xs font-bold text-white"
                        animate={{ x: [20, -20, 20] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <span className="text-xl">🍅</span>
                        <div>
                          <div>Vine Tomato</div>
                          <div className="text-[10px] text-emerald-400 font-mono">400g Puree</div>
                        </div>
                      </motion.div>
                    </div>

                    <div className="text-center text-[11px] font-bold text-slate-400">
                      ✓ Insulated cold-chain bag sealed for dispatch
                    </div>
                  </div>
                </div>

                {/* Right: Description */}
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-500/40 px-3 py-1 text-xs font-black text-blue-300">
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                    <span>STEP 3: HYPERLOCAL DARK STORE PACKING</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    Micro-Fulfillment Packs Your Meal Kit in 2.5 Mins.
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Our neighborhood dark stores maintain portioned stock of artisanal cheeses, hydroponic herbs, and spices. Automated picking algorithms bundle your exact kit with zero supermarket wandering.
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>No leftover half-bottles or rotten produce rotting in your fridge</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 4: 10-MINUTE DOORSTEP SPRINT */}
            {currentStage === 3 && (
              <motion.div
                key="stage-3"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                {/* Left: Speeding Rider Graphic */}
                <div className="md:col-span-5">
                  <div className="rounded-3xl bg-slate-950 border-2 border-emerald-500/50 p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-emerald-400 flex items-center gap-1.5">
                        <Zap className="h-4 w-4" /> Live Fleet Velocity
                      </span>
                      <span className="text-[11px] font-mono text-amber-400">ETA: 8.4 Mins</span>
                    </div>

                    <div className="relative h-32 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex items-center justify-between overflow-hidden">
                      {/* Trail glow */}
                      <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-emerald-500/20 to-transparent pointer-events-none" />

                      <div className="space-y-0.5 z-10">
                        <div className="text-xs font-black text-white">🏪 Koramangala Hub</div>
                        <div className="text-[10px] text-slate-400">Bagged & Sealed</div>
                      </div>

                      <div className="text-4xl animate-bounce z-10">🛵💨</div>

                      <div className="space-y-0.5 text-right z-10">
                        <div className="text-xs font-black text-white">🍳 Your Stove</div>
                        <div className="text-[10px] text-emerald-400 font-bold">Pan Heating Up</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-center text-xs font-black text-emerald-300">
                      ⚡ From TikTok/Reel to Sizzling Pan in 10 Minutes flat!
                    </div>
                  </div>
                </div>

                {/* Right: Final CTA */}
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-black text-amber-300">
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    <span>STEP 4: HOT PAN READY</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    Start Cooking Right Away With 0 Prep Friction.
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    By the time you tie your apron and chop an onion, your delivery partner is ringing the doorbell with freshly weighed malai paneer, rich dairy cream, and secret whole spices.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        onClose();
                        if (onStartCooking) onStartCooking();
                      }}
                      className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 px-6 py-3.5 text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 text-slate-950" />
                      <span>Experience Interactive Studio Now →</span>
                    </button>

                    <button
                      onClick={onClose}
                      className="rounded-2xl bg-slate-800 hover:bg-slate-700 text-white px-5 py-3.5 text-xs sm:text-sm font-bold border border-slate-700 transition cursor-pointer"
                    >
                      Close & Browse
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM STEP NAVIGATION FOOTER */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-slate-950/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-white">Stage {currentStage + 1} of 4:</span>
            <span>{stagesMeta[currentStage].subtitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectStage(Math.max(0, currentStage - 1))}
              disabled={currentStage === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 font-bold transition cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (currentStage < STAGES_COUNT - 1) {
                  handleSelectStage(currentStage + 1);
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition cursor-pointer"
            >
              <span>{currentStage < STAGES_COUNT - 1 ? 'Next Stage' : 'Finish'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
