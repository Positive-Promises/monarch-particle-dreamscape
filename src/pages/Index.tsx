
import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdvancedParticleSystem from '../components/AdvancedParticleSystem';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import gsap from 'gsap';

const Index = () => {
  const [isTransformed, setIsTransformed] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const [transformProgress, setTransformProgress] = useState(0);
  const [showStats, setShowStats] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fps, setFps] = useState(60);
  const canvasRef = useRef<HTMLDivElement>(null);
  const particleSystemRef = useRef<any>(null);

  // Animate particle counter on load
  useEffect(() => {
    gsap.to({ count: 0 }, {
      count: 1500,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: function() {
        setParticleCount(Math.floor(this.targets()[0].count));
      }
    });
  }, []);

  // Update stats from particle system
  const updateStats = useCallback(() => {
    if (particleSystemRef.current?.getStats) {
      const stats = particleSystemRef.current.getStats();
      setParticleCount(stats.particleCount);
      setTransformProgress(stats.formationProgress);
      setFps(stats.fps);
    }
  }, []);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(updateStats, 100);
    return () => clearInterval(interval);
  }, [updateStats]);

  const handleTransform = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTransformProgress(0);
    
    gsap.to({ progress: 0 }, {
      progress: 100,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: function() {
        setTransformProgress(this.targets()[0].progress);
      }
    });

    setTimeout(() => {
      setIsTransformed(true);
      setIsAnimating(false);
    }, 2500);
  }, [isAnimating]);

  const handleReset = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTransformProgress(0);
    
    if (particleSystemRef.current?.resetParticles) {
      particleSystemRef.current.resetParticles();
    }

    setTimeout(() => {
      setIsTransformed(false);
      setIsAnimating(false);
    }, 1000);
  }, [isAnimating]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (!isTransformed) handleTransform();
      } else if (event.key.toLowerCase() === 'r') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isTransformed, handleTransform, handleReset]);

  // Enhanced UI entrance animations
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    
    tl.from('.hero-title', {
      y: 80,
      opacity: 0,
      scale: 0.8,
      duration: 1.5,
      ease: "power3.out"
    })
    .from('.hero-subtitle', {
      y: 50,
      opacity: 0,
      duration: 1.2,
      ease: "power2.out"
    }, "-=1")
    .from('.control-buttons', {
      y: 40,
      opacity: 0,
      scale: 0.9,
      duration: 1,
      ease: "back.out(1.7)"
    }, "-=0.8")
    .from('.stats-panel', {
      x: 120,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    }, "-=1")
    .from('.instructions', {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=0.8");

    // Continuous gradient animation
    gsap.to('.hero-title', {
      backgroundPosition: '200% center',
      duration: 4,
      ease: "none",
      repeat: -1
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced background with multiple gradients */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-radial from-gold-500/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/5 via-transparent to-gold-900/5"></div>
      </div>

      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Header with glassmorphism */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="hero-title text-4xl font-bold bg-gradient-to-r from-gold-400 via-amber-400 to-gold-600 bg-clip-text text-transparent bg-size-200 animate-pulse">
          Ethereal Monarch
        </h1>
        <p className="hero-subtitle text-slate-300 mt-2 font-light">Advanced Physics Playground</p>
      </div>

      {/* Enhanced Stats Panel with glassmorphism */}
      {showStats && (
        <Card className="stats-panel absolute top-6 right-6 z-10 p-6 bg-black/10 backdrop-blur-xl border-gold-500/20 border-2 rounded-2xl">
          <div className="space-y-4 min-w-[220px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Active Particles:</span>
              <Badge variant="secondary" className="bg-gold-500/20 text-gold-400 font-bold px-3 py-1">
                {particleCount.toLocaleString()}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Formation:</span>
                <span className="text-gold-400 font-bold">{Math.round(transformProgress)}%</span>
              </div>
              <Progress value={transformProgress} className="h-3 bg-slate-800/50" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Performance:</span>
              <Badge variant="outline" className="text-emerald-400 border-emerald-400/50 font-bold">
                {fps} FPS
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Status:</span>
              <Badge 
                variant={isTransformed ? "default" : "outline"} 
                className={isTransformed ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-slate-400 border-slate-600"}
              >
                {isTransformed ? "🦋 Formed" : "✨ Floating"}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Controls with glassmorphism */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="control-buttons flex gap-4 items-center backdrop-blur-xl bg-black/10 p-4 rounded-2xl border border-gold-500/20">
          <Button
            onClick={handleTransform}
            disabled={isTransformed || isAnimating}
            className="bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-black font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-xl hover:shadow-gold-500/30"
          >
            {isAnimating ? '✨ Transforming...' : '🦋 Transform'} 
          </Button>
          
          <Button
            onClick={handleReset}
            disabled={!isTransformed || isAnimating}
            variant="outline"
            className="border-2 border-gold-500/50 text-gold-400 hover:bg-gold-500/10 px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 backdrop-blur-md bg-black/20 font-bold shadow-lg hover:shadow-gold-500/20"
          >
            🔄 Reset
          </Button>
          
          <Button
            onClick={() => setShowStats(!showStats)}
            variant="ghost"
            className="text-slate-300 hover:text-gold-400 px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-md bg-black/10 font-bold hover:bg-gold-500/10"
          >
            📊 Stats
          </Button>
        </div>
      </div>

      {/* Enhanced Instructions */}
      <div className="instructions absolute bottom-8 right-8 z-10 text-right backdrop-blur-md bg-black/20 p-4 rounded-xl border border-gold-500/20">
        <p className="text-slate-300 text-sm font-medium mb-1">
          Press <kbd className="px-2 py-1 bg-gold-500/20 rounded font-bold text-gold-400">Space</kbd> to transform
        </p>
        <p className="text-slate-300 text-sm font-medium">
          Press <kbd className="px-2 py-1 bg-gold-500/20 rounded font-bold text-gold-400">R</kbd> to reset
        </p>
        <p className="text-slate-400 text-xs mt-2 italic">Click anywhere for ripple effects</p>
      </div>

      {/* Advanced Particle System */}
      <div 
        ref={canvasRef}
        className="absolute inset-0"
      >
        <AdvancedParticleSystem
          ref={particleSystemRef}
          isTransformed={isTransformed}
          particleCount={1500}
        />
      </div>
    </div>
  );
};

export default Index;
