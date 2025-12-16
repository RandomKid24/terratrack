import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Map, Tractor, Settings, Play, Pause, Save, RotateCcw, Check, Navigation, AlertTriangle, Zap, HelpCircle, X, PlusCircle, MapPin, Download } from 'lucide-react';
import { GeoPoint, Point2D, FieldPolygon, AppMode, Equipment, CoveragePlan } from './types';
import * as GeoUtils from './services/geoUtils';
import { analyzeFieldWithGemini } from './services/geminiService';

// --- Sub-components ---

const Header = ({ 
  title, 
  mode, 
  onHelp, 
  onInstall, 
  canInstall 
}: { 
  title: string; 
  mode: AppMode; 
  onHelp: () => void;
  onInstall: () => void;
  canInstall: boolean;
}) => (
  <div className="bg-white/90 backdrop-blur-md p-4 shadow-sm sticky top-0 z-50 flex items-center justify-between border-b border-slate-200">
    <div className="flex items-center gap-2">
      <div className="bg-green-100 p-2 rounded-lg">
        <Tractor className="text-green-700" size={24} />
      </div>
      <h1 className="font-bold text-lg tracking-tight text-slate-900">{title}</h1>
    </div>
    <div className="flex items-center gap-3">
      {canInstall && (
        <button 
          onClick={onInstall}
          className="p-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors animate-in fade-in zoom-in duration-300"
          aria-label="Install App"
          title="Install App"
        >
          <Download size={20} />
        </button>
      )}
      <span className="text-xs font-bold tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline-block">
        {mode}
      </span>
      <button 
        onClick={onHelp}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        aria-label="Help & Tutorial"
      >
        <HelpCircle size={24} />
      </button>
    </div>
  </div>
);

const Button = ({ 
  onClick, 
  icon: Icon, 
  label, 
  variant = 'primary',
  disabled = false,
  className = ''
}: any) => {
  const baseClass = "flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none touch-manipulation border";
  const variants = {
    primary: "bg-green-600 text-white border-transparent hover:bg-green-700 shadow-green-200",
    secondary: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
    danger: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100",
    accent: "bg-indigo-600 text-white border-transparent hover:bg-indigo-700",
    outline: "bg-transparent text-slate-600 border-slate-300 hover:bg-slate-50"
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variants[variant as keyof typeof variants]} ${className}`}>
      {Icon && <Icon size={20} />}
      {label}
    </button>
  );
};

const InstallModal = ({ onInstall, onClose }: { onInstall: () => void, onClose: () => void }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-green-50">
        <Download className="text-green-600" size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Install TerraTrack</h3>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        Install this app on your device for the best outdoor experience, offline access, and full-screen map view.
      </p>
      <div className="flex flex-col gap-3">
        <Button onClick={onInstall} label="Install App" variant="primary" icon={Download} className="w-full" />
        <button onClick={onClose} className="py-2 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors">Maybe later</button>
      </div>
    </div>
  </div>
);

const TutorialModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="text-green-600" size={24} />
          Quick Guide
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-6 overflow-y-auto space-y-6">
        <div className="flex gap-4">
          <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">1</div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Map Boundaries</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Walk around the perimeter of your field. The app records GPS points automatically. 
              Ensure you have at least 3 points before clicking <span className="text-red-600 bg-red-50 border border-red-100 font-mono text-xs px-1 rounded">Finish Boundary</span>.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">2</div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Set Equipment</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Enter the effective width of your machinery (e.g., sprayer boom width). 
              This determines the spacing of the coverage path.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">3</div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Generate & Run</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              The app calculates the most efficient path. Click <span className="text-green-700 bg-green-50 border border-green-200 font-mono text-xs px-1 rounded">Start Job</span> to track progress.
              Use the AI features to get optimization insights.
            </p>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
           <h4 className="text-indigo-800 font-bold text-sm mb-1 flex items-center gap-2">
             <Zap size={14} className="text-indigo-600" /> Demo Mode
           </h4>
           <p className="text-xs text-indigo-700 leading-relaxed">
             Don't want to walk outside? Use the "Simulate" button on the home screen to create a test field instantly.
           </p>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <Button onClick={onClose} label="Got it" variant="primary" className="w-full shadow-md" />
      </div>
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  // State
  const [mode, setMode] = useState<AppMode>(AppMode.CAPTURE);
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
  const [currentGpsPos, setCurrentGpsPos] = useState<GeoPoint | null>(null);
  const [field, setField] = useState<FieldPolygon | null>(null);
  const [equipment, setEquipment] = useState<Equipment>({
    id: '1', name: 'Tractor A', width: 5, speed: 2.5, type: 'sprayer'
  });
  const [plan, setPlan] = useState<CoveragePlan | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0); // 0 to 1
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [geminiInsights, setGeminiInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Refs
  const watchId = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // --- Install Prompt Logic ---
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallModal(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallModal(false);
  };

  // --- Capture Logic ---

  const startCapture = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported");
      return;
    }
    setGeoPoints([]);
    setCurrentGpsPos(null);
    setGpsError(null);
    
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPoint: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp
        };
        setCurrentGpsPos(newPoint);

        // Simple filter to avoid piling up points if standing still
        setGeoPoints(prev => {
          if (prev.length > 0) {
            const dist = GeoUtils.simplifyPoints([prev[prev.length - 1], newPoint], 0.5); // reduced tolerance
            if (dist.length < 2) return prev; // Moved less than 0.5m
          }
          return [...prev, newPoint];
        });
      },
      (err) => setGpsError(err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  };

  const markCurrentLocation = () => {
    if (currentGpsPos) {
      setGeoPoints(prev => [...prev, currentGpsPos]);
    } else {
      alert("No GPS signal yet. Please wait.");
    }
  };

  const stopCapture = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    processField();
  };

  const processField = () => {
    if (geoPoints.length < 3) {
      alert("Need at least 3 points to form a field. Walk further or use 'Mark Corner'.");
      return;
    }

    // Use a small tolerance to keep shape accuracy but remove noise
    const simplified = GeoUtils.simplifyPoints(geoPoints, 1); 
    if (simplified.length < 3) {
      // If simplification kills the polygon, use raw points if we have enough
      if (geoPoints.length >= 3) {
        finishSetup(geoPoints);
        return;
      }
      alert("Field area too small or points too close.");
      return;
    }
    finishSetup(simplified);
  };

  const finishSetup = (points: GeoPoint[]) => {
    const origin = points[0];
    const projected = points.map(p => GeoUtils.geoToCartesian(p, origin));
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    projected.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const area = GeoUtils.calculatePolygonArea(projected);
    const perimeter = GeoUtils.calculatePerimeter(projected);

    setField({
      geoPoints: points,
      projectedPoints: projected,
      areaSqMeters: area,
      perimeterMeters: perimeter,
      bounds: { minX, maxX, minY, maxY }
    });

    setMode(AppMode.SETUP);
  };

  const manualAddPoint = () => {
    // For debugging/demo, let's create an irregular L-shape instead of a square
    // to demonstrate the path optimization
    const centerLat = 40.0;
    const centerLng = -100.0;
    const s = 0.001; // scale ~100m
    const now = Date.now();
    
    // Irregular Polygon (L-Shapeish)
    const mockPoints: GeoPoint[] = [
      { lat: centerLat, lng: centerLng, timestamp: now },
      { lat: centerLat + s * 1.5, lng: centerLng, timestamp: now },
      { lat: centerLat + s * 1.5, lng: centerLng + s * 0.5, timestamp: now },
      { lat: centerLat + s * 0.5, lng: centerLng + s * 0.5, timestamp: now },
      { lat: centerLat + s * 0.5, lng: centerLng + s * 1.5, timestamp: now },
      { lat: centerLat, lng: centerLng + s * 1.5, timestamp: now },
    ];
    
    setGeoPoints(mockPoints);
    finishSetup(mockPoints);
  };

  // --- Planning Logic ---

  const generatePlan = () => {
    if (!field) return;
    
    // Use the new Optimized Generator which checks multiple angles
    const { segments, angle } = GeoUtils.generateOptimizedPath(field.projectedPoints, equipment.width, field.bounds);
    
    let totalDist = 0;
    segments.forEach(s => {
      const dx = s.p2.x - s.p1.x;
      const dy = s.p2.y - s.p1.y;
      totalDist += Math.sqrt(dx * dx + dy * dy);
    });

    setPlan({
      segments,
      totalDistance: totalDist,
      estimatedTimeSeconds: totalDist / equipment.speed,
      efficiencyScore: (field.areaSqMeters / (totalDist * equipment.width)) * 100 
    });
    
    setMode(AppMode.PLAN);
  };

  // --- Rendering Logic (Canvas) ---

  const drawField = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !field) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas
    const parent = containerRef.current;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    // Scaling
    const padding = 50; // Increased padding for text
    const width = field.bounds.maxX - field.bounds.minX;
    const height = field.bounds.maxY - field.bounds.minY;
    const scaleX = (canvas.width - padding * 2) / width;
    const scaleY = (canvas.height - padding * 2) / height;
    const scale = Math.min(scaleX, scaleY);

    // Transform function: (Field Coord) -> (Screen Coord)
    const toScreen = (p: Point2D) => ({
      x: padding + (p.x - field.bounds.minX) * scale,
      y: canvas.height - padding - (p.y - field.bounds.minY) * scale
    });

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Field Polygon
    ctx.beginPath();
    ctx.fillStyle = '#f0fdf4'; // green-50
    ctx.strokeStyle = '#15803d'; // green-700
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    field.projectedPoints.forEach((p, i) => {
      const s = toScreen(p);
      if (i === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 1b. Draw Dimensions (Edge Lengths)
    if (mode === AppMode.SETUP || mode === AppMode.PLAN) {
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let i = 0; i < field.projectedPoints.length; i++) {
        const p1 = field.projectedPoints[i];
        const p2 = field.projectedPoints[(i + 1) % field.projectedPoints.length];
        
        // Calculate Distance
        const distMeters = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        
        const s1 = toScreen(p1);
        const s2 = toScreen(p2);
        
        // Midpoint
        const mx = (s1.x + s2.x) / 2;
        const my = (s1.y + s2.y) / 2;
        
        // Draw pill background
        const text = `${distMeters.toFixed(1)}m`;
        const metrics = ctx.measureText(text);
        const tw = metrics.width + 8;
        const th = 16;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.roundRect(mx - tw/2, my - th/2, tw, th, 4);
        ctx.fill();
        
        ctx.fillStyle = '#475569'; // slate-600
        ctx.fillText(text, mx, my);
      }
    }

    // 2. Draw Plan
    if (plan && mode !== AppMode.CAPTURE && mode !== AppMode.SETUP) {
      if (isRunning || simulatedProgress > 0) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
        ctx.lineWidth = equipment.width * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let distSoFar = 0;
        const targetDist = plan.totalDistance * simulatedProgress;

        for (const seg of plan.segments) {
          if (seg.type === 'turn') continue;

          const segLen = Math.sqrt(Math.pow(seg.p2.x - seg.p1.x, 2) + Math.pow(seg.p2.y - seg.p1.y, 2));
          const s1 = toScreen(seg.p1);
          const s2 = toScreen(seg.p2);

          if (distSoFar + segLen <= targetDist) {
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
          } else if (distSoFar < targetDist) {
             const ratio = (targetDist - distSoFar) / segLen;
             const pInter = {
               x: s1.x + (s2.x - s1.x) * ratio,
               y: s1.y + (s2.y - s1.y) * ratio
             };
             ctx.moveTo(s1.x, s1.y);
             ctx.lineTo(pInter.x, pInter.y);
             break; 
          }
          distSoFar += segLen;
        }
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      plan.segments.forEach(seg => {
        const s1 = toScreen(seg.p1);
        const s2 = toScreen(seg.p2);
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
      });
      ctx.setLineDash([]);
      ctx.stroke();

      if (isRunning) {
        let currentDist = plan.totalDistance * simulatedProgress;
        let pos = field.projectedPoints[0];
        
        let d = 0;
        for (const seg of plan.segments) {
          const segLen = Math.sqrt(Math.pow(seg.p2.x - seg.p1.x, 2) + Math.pow(seg.p2.y - seg.p1.y, 2));
          if (d + segLen >= currentDist) {
            const ratio = (currentDist - d) / segLen;
            pos = {
              x: seg.p1.x + (seg.p2.x - seg.p1.x) * ratio,
              y: seg.p1.y + (seg.p2.y - seg.p1.y) * ratio
            };
            break;
          }
          d += segLen;
        }
        
        const screenPos = toScreen(pos);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('🚜', screenPos.x - 7, screenPos.y - 12);
      }
    }
  }, [field, plan, mode, simulatedProgress, equipment.width, isRunning]);

  useEffect(() => {
    let animId: number;
    if (isRunning && plan) {
      const startTime = Date.now();
      const duration = 10000;
      const startProgress = simulatedProgress;

      const loop = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        let nextP = startProgress + (elapsed / duration);
        if (nextP >= 1) {
          nextP = 1;
          setIsRunning(false);
        }
        setSimulatedProgress(nextP);
        if (nextP < 1) animId = requestAnimationFrame(loop);
      };
      loop();
    }
    return () => cancelAnimationFrame(animId);
  }, [isRunning, plan]);

  useEffect(() => {
    drawField();
    window.addEventListener('resize', drawField);
    return () => window.removeEventListener('resize', drawField);
  }, [drawField]);

  const handleGeminiAnalysis = async () => {
    if (!field || !equipment) return;
    setIsLoadingInsights(true);
    setGeminiInsights(null);
    const result = await analyzeFieldWithGemini(field, equipment);
    setGeminiInsights(result);
    setIsLoadingInsights(false);
  };

  const renderCapture = () => (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center flex-1 flex flex-col items-center justify-center">
        {watchId.current === null ? (
          <>
            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center mb-6">
              <Navigation size={40} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Start Mapping</h2>
            <p className="text-slate-500 mb-8 max-w-xs text-sm">Walk the perimeter of your field. Keep the device steady.</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={startCapture} label="Start GPS Recording" variant="primary" icon={Play} />
              <Button onClick={manualAddPoint} label="Simulate (Demo Mode)" variant="outline" icon={Zap} />
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
             <div className="w-full h-48 bg-slate-50 rounded-xl border border-slate-200 mb-6 overflow-hidden relative">
                <canvas ref={previewCanvasRef} className="w-full h-full" />
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold animate-pulse">
                  Live
                </div>
             </div>

            <h2 className="text-2xl font-bold text-green-700 mb-2">Recording...</h2>
            <p className="text-slate-500 text-sm mb-6 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
               <span className="font-mono font-bold text-slate-900">{geoPoints.length}</span> points collected
            </p>
            
            <div className="w-full max-w-xs space-y-3">
               <Button 
                 onClick={markCurrentLocation} 
                 label="Mark Corner / Add Point" 
                 variant="secondary" 
                 icon={MapPin} 
                 className="w-full"
               />
               <Button 
                 onClick={stopCapture} 
                 label="Complete & Proceed" 
                 variant="primary" 
                 icon={Check} 
                 className="w-full" 
               />
            </div>
          </div>
        )}
        {gpsError && <p className="text-red-500 mt-4 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-md border border-red-100"><AlertTriangle size={14} /> {gpsError}</p>}
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
           Field Stats
           <div className="h-px bg-slate-100 flex-1"></div>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-slate-500 text-xs font-medium uppercase">Area</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{(field?.areaSqMeters || 0).toFixed(0)} <span className="text-sm text-slate-400 font-sans font-normal">m²</span></div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-slate-500 text-xs font-medium uppercase">Perimeter</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{(field?.perimeterMeters || 0).toFixed(0)} <span className="text-sm text-slate-400 font-sans font-normal">m</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
        <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
           Machine Config
           <div className="h-px bg-slate-100 flex-1"></div>
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">Machine / Equipment Name</label>
            <input 
              type="text" 
              value={equipment.name}
              onChange={(e) => setEquipment({...equipment, name: e.target.value})}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="e.g. Center Pivot, Tractor, Sprinkler"
            />
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">Processing Width (meters)</label>
            <input 
              type="number" 
              value={equipment.width}
              onChange={(e) => setEquipment({...equipment, width: Number(e.target.value)})}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Width of sprinkler boom, harvester header, or tool coverage.</p>
          </div>
        </div>
        
        <div className="mt-auto pt-8 flex flex-col gap-3">
          <Button onClick={generatePlan} label="Calculate Shortest Path" variant="primary" icon={Check} />
          <Button onClick={() => setMode(AppMode.CAPTURE)} label="Rescan Field" variant="secondary" icon={RotateCcw} />
        </div>
      </div>
    </div>
  );

  const renderPlan = () => (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="flex-1 relative overflow-hidden shadow-inner" ref={containerRef}>
        <div className="absolute inset-0 bg-slate-50" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
        
        <div className="absolute top-4 left-4 right-4 flex gap-2">
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex-1">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">Coverage</div>
            <div className="text-green-600 font-bold text-2xl">{(simulatedProgress * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex-1">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">Est. Time</div>
            <div className="text-slate-900 font-bold text-2xl">{Math.round((plan?.estimatedTimeSeconds || 0) / 60)} <span className="text-sm text-slate-400 font-normal">min</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 border-t border-slate-200 shrink-0 pb-8 shadow-lg z-10 rounded-t-2xl -mt-4">
        <div className="flex gap-4 mb-4">
          {isRunning ? (
            <Button onClick={() => setIsRunning(false)} label="Pause Job" variant="danger" icon={Pause} className="flex-1 shadow-red-100" />
          ) : (
            <Button onClick={() => setIsRunning(true)} label="Start Job" variant="primary" icon={Play} className="flex-1" />
          )}
          <button 
            onClick={() => setMode(AppMode.SETUP)}
            className="p-3.5 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>

        <div className="border-t border-slate-100 pt-4">
           {!geminiInsights ? (
             <button 
                onClick={handleGeminiAnalysis}
                disabled={isLoadingInsights}
                className="w-full py-3 px-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
             >
               <Zap size={18} className={isLoadingInsights ? "animate-spin" : ""} />
               {isLoadingInsights ? "Analyzing Field Geometry..." : "Get AI Optimization Tips"}
             </button>
           ) : (
             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <h4 className="text-indigo-900 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} className="text-indigo-600" /> AI Analysis
                  </h4>
                  <button onClick={() => setGeminiInsights(null)} className="text-indigo-400 hover:text-indigo-700 p-1"><RotateCcw size={14}/></button>
               </div>
               <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">{geminiInsights}</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 text-slate-900 font-sans">
      <Header 
        title="TerraTrack" 
        mode={mode} 
        onHelp={() => setShowTutorial(true)} 
        onInstall={handleInstallClick}
        canInstall={!!deferredPrompt}
      />
      
      <main className="flex-1 overflow-hidden relative">
        {mode === AppMode.CAPTURE && renderCapture()}
        {mode === AppMode.SETUP && renderSetup()}
        {(mode === AppMode.PLAN || mode === AppMode.RUN) && renderPlan()}
      </main>
      
      {showInstallModal && <InstallModal onInstall={handleInstallClick} onClose={() => setShowInstallModal(false)} />}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
};

export default App;