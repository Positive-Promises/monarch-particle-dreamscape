
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import gsap from 'gsap';

interface AdvancedParticleSystemProps {
  particleCount: number;
  isTransformed: boolean;
}

interface Particle {
  element: SVGCircleElement;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  type: 'body' | 'upperWing' | 'lowerWing' | 'antenna';
  formed: boolean;
  radius: number;
  originalColor: string;
  floatPhase: number;
  floatSpeed: number;
  floatAmplitude: number;
  mouseOffsetX: number;
  mouseOffsetY: number;
  originalTargetX: number;
  originalTargetY: number;
}

interface ButterflyPoint {
  x: number;
  y: number;
  type: 'body' | 'upperWing' | 'lowerWing' | 'antenna';
  color: string;
}

const AdvancedParticleSystem = forwardRef<any, AdvancedParticleSystemProps>(({ particleCount, isTransformed }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [butterflyPoints, setButterflyPoints] = useState<ButterflyPoint[]>([]);
  const [isFormed, setIsFormed] = useState(false);
  const [formationProgress, setFormationProgress] = useState(0);
  const [fps, setFps] = useState(60);
  const [frameCount, setFrameCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Advanced easing function from HTML version
  const easeOutExpo = useCallback((t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }, []);

  // Generate butterfly shape with optimized points
  const generateButterflyShape = useCallback((): ButterflyPoint[] => {
    const points: ButterflyPoint[] = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 - 50;
    const scale = Math.min(window.innerWidth, window.innerHeight) / 800;

    // Generate butterfly body (15% of particles)
    const bodyParticles = Math.floor(particleCount * 0.15);
    for (let i = 0; i < bodyParticles; i++) {
      const progress = i / (bodyParticles - 1);
      const y = centerY + (progress - 0.5) * 120 * scale;
      const thickness = Math.sin(progress * Math.PI) * 3;
      
      for (let j = 0; j < 2 && points.length < bodyParticles; j++) {
        points.push({
          x: centerX + (j - 0.5) * thickness,
          y: y,
          type: 'body',
          color: '#8B4513'
        });
      }
    }

    // Generate antennae (5% of particles)
    const antennaParticles = Math.floor(particleCount * 0.05);
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < antennaParticles / 2; i++) {
        const progress = i / (antennaParticles / 2 - 1);
        const curve = Math.sin(progress * Math.PI * 0.5);
        points.push({
          x: centerX + side * (12 + progress * 25) * scale,
          y: centerY - 70 * scale - progress * 20 * scale + curve * 10 * scale,
          type: 'antenna',
          color: '#1A1A1A'
        });
      }
    }

    // Generate wings (80% of particles)
    const wingParticles = particleCount - points.length;
    generateWings(points, centerX, centerY, scale, wingParticles);

    return points;
  }, [particleCount]);

  // Generate wing points with polka dot pattern
  const generateWings = (points: ButterflyPoint[], centerX: number, centerY: number, scale: number, wingParticles: number) => {
    const upperWingParticles = Math.floor(wingParticles * 0.6);
    const lowerWingParticles = wingParticles - upperWingParticles;

    // Generate upper wings
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < upperWingParticles / 2; i++) {
        const angle = (i / (upperWingParticles / 2)) * Math.PI;
        const radius = 40 + 25 * Math.sin(angle * 2);
        const x = centerX + side * radius * Math.cos(angle) * scale;
        const y = centerY - 30 * scale + radius * Math.sin(angle) * 0.8 * scale;
        
        points.push({
          x: x,
          y: y,
          type: 'upperWing',
          color: getWingColor(x, y, centerX, centerY)
        });
      }
    }

    // Generate lower wings
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < lowerWingParticles / 2; i++) {
        const angle = (i / (lowerWingParticles / 2)) * Math.PI * 0.7;
        const radius = 25 + 15 * Math.sin(angle * 3);
        const x = centerX + side * radius * Math.cos(angle) * scale;
        const y = centerY + 20 * scale + radius * Math.sin(angle) * 0.9 * scale;
        
        points.push({
          x: x,
          y: y,
          type: 'lowerWing',
          color: getWingColor(x, y, centerX, centerY)
        });
      }
    }
  };

  // Get wing color with polka dot pattern
  const getWingColor = (x: number, y: number, centerX: number, centerY: number): string => {
    const dotSize = 30;
    const gridX = Math.floor((x - centerX + 200) / dotSize);
    const gridY = Math.floor((y - centerY + 200) / dotSize);
    const dotCenterX = centerX - 200 + gridX * dotSize + dotSize / 2;
    const dotCenterY = centerY - 200 + gridY * dotSize + dotSize / 2;
    const distToDot = Math.sqrt((x - dotCenterX) ** 2 + (y - dotCenterY) ** 2);
    
    if (distToDot < 8) {
      return (gridX + gridY) % 3 === 0 ? '#DC143C' : '#1A1A1A';
    }
    
    return '#FFD700';
  };

  // Get edge position for particle spawn
  const getEdgePosition = useCallback(() => {
    const side = Math.floor(Math.random() * 4);
    const padding = 150;
    
    switch(side) {
      case 0: return { x: Math.random() * window.innerWidth, y: -padding };
      case 1: return { x: window.innerWidth + padding, y: Math.random() * window.innerHeight };
      case 2: return { x: Math.random() * window.innerWidth, y: window.innerHeight + padding };
      case 3: return { x: -padding, y: Math.random() * window.innerHeight };
      default: return { x: 0, y: 0 };
    }
  }, []);

  // Create particle system
  const createParticleSystem = useCallback(() => {
    if (!svgRef.current) return;

    const newButterflyPoints = generateButterflyShape();
    setButterflyPoints(newButterflyPoints);

    const newParticles: Particle[] = [];

    newButterflyPoints.forEach((point, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const radius = Math.random() * 1.5 + 1.5;
      const startPos = getEdgePosition();
      
      circle.setAttribute('r', radius.toString());
      circle.setAttribute('fill', point.color);
      circle.setAttribute('opacity', '0.5');
      circle.setAttribute('vector-effect', 'non-scaling-stroke');
      svgRef.current.appendChild(circle);

      const particle: Particle = {
        element: circle,
        startX: startPos.x,
        startY: startPos.y,
        targetX: point.x,
        targetY: point.y,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        type: point.type,
        formed: false,
        radius: radius,
        originalColor: point.color,
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatAmplitude: point.type === 'body' ? 2 : 4,
        mouseOffsetX: 0,
        mouseOffsetY: 0,
        originalTargetX: point.x,
        originalTargetY: point.y
      };

      gsap.set(circle, {
        attr: { cx: particle.startX, cy: particle.startY },
        scale: 0.6,
        opacity: 0.3
      });

      newParticles.push(particle);
    });

    setParticles(newParticles);
    return newParticles;
  }, [generateButterflyShape, getEdgePosition]);

  // Animate formation with batch processing
  const animateFormation = useCallback((particlesToAnimate: Particle[]) => {
    setIsFormed(false);
    setFormationProgress(0);
    
    const tl = gsap.timeline({
      onComplete: () => {
        setIsFormed(true);
      }
    });

    // Animate particles in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < particlesToAnimate.length; i += batchSize) {
      const batch = particlesToAnimate.slice(i, i + batchSize);
      
      tl.to(batch, {
        progress: 1,
        duration: 2.5,
        ease: "power3.out",
        stagger: {
          amount: 1.2,
          from: "random",
          ease: "power2.out"
        },
        onUpdate: () => {
          batch.forEach(particle => {
            if (particle.progress > 0) {
              updateParticlePosition(particle);
            }
          });
        }
      }, i === 0 ? 0 : "-=2.0");
    }

    // Update formation progress
    tl.to({ progress: 0 }, {
      progress: 1,
      duration: 3.5,
      ease: "power2.out",
      onUpdate: function() {
        setFormationProgress(this.targets()[0].progress);
      }
    }, 0);
  }, []);

  // Update particle position with advanced easing
  const updateParticlePosition = useCallback((particle: Particle) => {
    const easeProgress = easeOutExpo(particle.progress);
    
    const currentX = particle.startX + (particle.targetX - particle.startX) * easeProgress;
    const currentY = particle.startY + (particle.targetY - particle.startY) * easeProgress;
    
    // Apply curve to path
    const pathCurve = Math.sin(particle.progress * Math.PI) * 20;
    const curveX = currentX + pathCurve * Math.cos(particle.progress * Math.PI * 2);
    const curveY = currentY + pathCurve * 0.5 * Math.sin(particle.progress * Math.PI * 3);
    
    gsap.set(particle.element, {
      attr: { cx: curveX, cy: curveY },
      scale: 0.7 + (particle.progress * 0.5),
      opacity: 0.4 + (particle.progress * 0.5)
    });
    
    if (particle.progress > 0.95 && !particle.formed) {
      particle.formed = true;
    }
  }, [easeOutExpo]);

  // Update floating animation
  const updateFloating = useCallback(() => {
    const time = Date.now() / 1000;
    
    particles.forEach(particle => {
      if (!particle.formed) return;
      
      const offsetX = Math.sin(time * particle.floatSpeed + particle.floatPhase) * particle.floatAmplitude;
      const offsetY = Math.cos(time * particle.floatSpeed + particle.floatPhase) * particle.floatAmplitude * 0.6;
      
      const totalX = particle.targetX + offsetX + particle.mouseOffsetX;
      const totalY = particle.targetY + offsetY + particle.mouseOffsetY;
      
      particle.element.setAttribute('cx', totalX.toString());
      particle.element.setAttribute('cy', totalY.toString());
      
      // Decay mouse offset
      particle.mouseOffsetX *= 0.92;
      particle.mouseOffsetY *= 0.92;
    });
  }, [particles]);

  // Handle mouse interaction
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    
    if (isFormed) {
      const butterflyCenterX = window.innerWidth / 2;
      const butterflyCenterY = window.innerHeight / 2 - 50;
      
      particles.forEach(particle => {
        if (!particle.formed) return;
        
        const dx = mouseRef.current.x - particle.targetX;
        const dy = mouseRef.current.y - particle.targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          const force = Math.max(0, (120 - distance) / 120);
          
          const toCenterX = butterflyCenterX - particle.targetX;
          const toCenterY = butterflyCenterY - particle.targetY;
          const centerDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
          
          const centerDirX = toCenterX / (centerDist || 1);
          const centerDirY = toCenterY / (centerDist || 1);
          
          particle.mouseOffsetX = (-dx * force * 15) + (centerDirX * force * 6);
          particle.mouseOffsetY = (-dy * force * 15) + (centerDirY * force * 6);
          
          gsap.to(particle.element, {
            attr: { opacity: 1 },
            scale: 1.2,
            duration: 0.3,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
          });
        }
      });
    }
  }, [particles, isFormed]);

  // Create ripple effect
  const createRippleEffect = useCallback((x: number, y: number) => {
    if (!svgRef.current) return;
    
    const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ripple.setAttribute('cx', x.toString());
    ripple.setAttribute('cy', y.toString());
    ripple.setAttribute('r', '0');
    ripple.setAttribute('fill', 'none');
    ripple.setAttribute('stroke', '#FFD700');
    ripple.setAttribute('stroke-width', '2');
    ripple.setAttribute('opacity', '0.8');
    ripple.setAttribute('vector-effect', 'non-scaling-stroke');
    
    svgRef.current.appendChild(ripple);
    
    gsap.to(ripple, {
      attr: { r: 100 },
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      onComplete: () => {
        if (svgRef.current && svgRef.current.contains(ripple)) {
          svgRef.current.removeChild(ripple);
        }
      }
    });
    
    // Affect nearby particles
    particles.forEach(particle => {
      if (particle.formed) {
        const dx = x - particle.targetX;
        const dy = y - particle.targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.mouseOffsetX = -dx * force * 25;
          particle.mouseOffsetY = -dy * force * 25;
          
          gsap.to(particle.element, {
            attr: { opacity: 1 },
            scale: 1 + force * 0.6,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
            yoyo: true,
            repeat: 1
          });
        }
      }
    });
  }, [particles]);

  // Handle click
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current || !isFormed) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    createRippleEffect(clickX, clickY);
  }, [isFormed, createRippleEffect]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setFrameCount(prev => prev + 1);
      
      if (frameCount % 10 === 0) {
        const now = performance.now();
        if (lastTimeRef.current) {
          setFps(Math.round(1000 / (now - lastTimeRef.current)));
        }
        lastTimeRef.current = now;
      }
      
      if (isFormed && !isResetting) {
        updateFloating();
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isFormed, isResetting, updateFloating, frameCount]);

  // Initialize particle system
  useEffect(() => {
    const newParticles = createParticleSystem();
    if (newParticles) {
      animateFormation(newParticles);
    }
  }, [createParticleSystem, animateFormation]);

  // Setup canvas
  useEffect(() => {
    if (!svgRef.current) return;
    
    svgRef.current.setAttribute('width', window.innerWidth.toString());
    svgRef.current.setAttribute('height', window.innerHeight.toString());
    svgRef.current.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  }, []);

  // Reset animation
  const resetAnimation = useCallback(() => {
    if (isResetting) return;
    
    setIsResetting(true);
    setIsFormed(false);
    setFormationProgress(0);
    
    const scatterTimeline = gsap.timeline({
      onComplete: () => {
        particles.forEach(particle => {
          particle.formed = false;
          particle.progress = 0;
          
          const newStart = getEdgePosition();
          particle.startX = newStart.x;
          particle.startY = newStart.y;
          particle.targetX = particle.originalTargetX;
          particle.targetY = particle.originalTargetY;
          particle.mouseOffsetX = 0;
          particle.mouseOffsetY = 0;
        });
        
        animateFormation(particles);
        setIsResetting(false);
      }
    });
    
    particles.forEach(particle => {
      const edgePos = getEdgePosition();
      scatterTimeline.to(particle.element, {
        attr: { cx: edgePos.x, cy: edgePos.y },
        duration: 2 + Math.random() * 0.5,
        ease: "power3.out"
      }, 0);
    });
  }, [isResetting, particles, getEdgePosition, animateFormation]);

  useImperativeHandle(ref, () => ({
    transformToButterly: () => {
      // Already implemented in useEffect
    },
    resetParticles: resetAnimation,
    getStats: () => ({
      particleCount: particles.filter(p => p.formed).length,
      formationProgress: Math.round(formationProgress * 100),
      fps: fps
    })
  }));

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 cursor-crosshair"
      style={{ willChange: 'transform' }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  );
});

AdvancedParticleSystem.displayName = 'AdvancedParticleSystem';

export default AdvancedParticleSystem;
