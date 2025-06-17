
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import ParticleSystem from '../components/ParticleSystem';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import gsap from 'gsap';

const Index = () => {
  const [isTransformed, setIsTransformed] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const [transformProgress, setTransformProgress] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const particleSystemRef = useRef<any>(null);

  // Animate particle counter
  useEffect(() => {
    gsap.to({ count: 0 }, {
      count: 1500,
      duration: 2,
      ease: "power2.out",
      onUpdate: function() {
        setParticleCount(Math.floor(this.targets()[0].count));
      }
    });
  }, []);

  const handleTransform = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTransformProgress(0);
    
    // Animate progress bar
    gsap.to({ progress: 0 }, {
      progress: 100,
      duration: 2,
      ease: "power2.out",
      onUpdate: function() {
        setTransformProgress(this.targets()[0].progress);
      }
    });

    // Trigger particle transformation
    if (particleSystemRef.current) {
      particleSystemRef.current.transformToButterly();
    }

    setTimeout(() => {
      setIsTransformed(true);
      setIsAnimating(false);
    }, 2000);
  }, [isAnimating]);

  const handleReset = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTransformProgress(0);
    
    if (particleSystemRef.current) {
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

  // Click ripple effect
  const createRipple = useCallback((event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.className = 'absolute pointer-events-none rounded-full border-2 border-gold-400 opacity-70';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '0px';
    ripple.style.height = '0px';
    ripple.style.transform = 'translate(-50%, -50%)';

    canvasRef.current?.appendChild(ripple);

    gsap.to(ripple, {
      width: '200px',
      height: '200px',
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => ripple.remove()
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-radial from-gold-500/10 via-transparent to-transparent"></div>
      </div>

      {/* Header */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 via-amber-400 to-gold-600 bg-clip-text text-transparent animate-pulse">
          Particle Monarch
        </h1>
        <p className="text-slate-300 mt-2">3D Physics Playground</p>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <Card className="absolute top-6 right-6 z-10 p-4 bg-black/20 backdrop-blur-md border-gold-500/30">
          <div className="space-y-3 min-w-[200px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Particles:</span>
              <Badge variant="secondary" className="bg-gold-500/20 text-gold-400">
                {particleCount.toLocaleString()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Progress:</span>
                <span className="text-gold-400">{Math.round(transformProgress)}%</span>
              </div>
              <Progress value={transformProgress} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Status:</span>
              <Badge variant={isTransformed ? "default" : "outline"} 
                     className={isTransformed ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}>
                {isTransformed ? "Butterfly" : "Particles"}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex gap-4 items-center">
          <Button
            onClick={handleTransform}
            disabled={isTransformed || isAnimating}
            className="bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-black font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isAnimating ? 'Transforming...' : 'Transform'} ✨
          </Button>
          
          <Button
            onClick={handleReset}
            disabled={!isTransformed || isAnimating}
            variant="outline"
            className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            Reset 🔄
          </Button>
          
          <Button
            onClick={() => setShowStats(!showStats)}
            variant="ghost"
            className="text-slate-300 hover:text-gold-400 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Stats 📊
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 z-10 text-right">
        <p className="text-slate-400 text-sm">Press <kbd className="px-2 py-1 bg-slate-700 rounded">Space</kbd> to transform</p>
        <p className="text-slate-400 text-sm">Press <kbd className="px-2 py-1 bg-slate-700 rounded">R</kbd> to reset</p>
      </div>

      {/* 3D Canvas */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onClick={createRipple}
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 60 }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <color attach="background" args={['#0a0a0a']} />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ffd700" />
          <pointLight position={[-10, -10, 10]} intensity={0.5} color="#dc143c" />
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            penumbra={0.5}
            intensity={0.5}
            color="#ffd700"
          />
          
          {/* Background stars */}
          <Stars
            radius={300}
            depth={60}
            count={2000}
            factor={7}
            saturation={0}
            fade
          />
          
          {/* Particle System */}
          <ParticleSystem
            ref={particleSystemRef}
            isTransformed={isTransformed}
            particleCount={1500}
          />
          
          {/* Camera controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            autoRotate={!isTransformed}
            autoRotateSpeed={0.5}
            minDistance={5}
            maxDistance={20}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default Index;
