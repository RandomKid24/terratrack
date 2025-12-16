import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Map, Tractor, Settings, Play, Pause, Save, RotateCcw, Check, Navigation, AlertTriangle, Zap, HelpCircle, X, PlusCircle, MapPin, Download, Undo2 } from 'lucide-react';
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
  <div className="bg-white/95 backdrop-blur-md px-4 py-3 shadow-sm sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 safe-top">
    <div className="flex items-center gap-2">
      <div className="bg-green-100 p-2 rounded-lg">
        <Tractor className="text-green-700" size={20} />
      </div>
      <h1 className="font-bold text-lg tracking-tight text-slate-900">{title}</h1>
    </div>
    <div className="flex items-center gap-2">
      {canInstall && (
        <button 
          onClick={onInstall}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors text-xs font-bold animate-in fade-in zoom-in duration-300"
        >
          <Download size={14} />
          Install
        </button>
      )}
      <button 
        onClick={onHelp}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        aria-label="Help"
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
  className = '',
  fullWidth = false
}: any) => {
  const baseClass = "flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none touch-manipulation border select-none";
  const variants = {
    primary: "bg-green-600 text-white border-transparent hover:bg-green-700 shadow-green-200 ring-2 ring-green-600/20 ring-offset-1",
    secondary: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
    danger: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100",
    accent: "bg-indigo-600 text-white border-transparent hover:bg-indigo-700",
    outline: "bg-transparent text-slate-600 border-slate-300 hover:bg-slate-50"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseClass} ${variants[variant as keyof typeof variants]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon size={20} strokeWidth={2.5} />}
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
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
        alert("Installation not available right now. Try opening the browser menu and selecting 'Add to Home Screen'.");
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallModal(false);
  };

  // --- Capture Logic ---

  const startSurvey = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported");
      return;
    }
    setGeoPoints([]);
    setCurrentGpsPos(null);
    setGpsError(null);
    
    // We only WATCH position to show the user where they are relative to points
    // We do NOT add points automatically anymore
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPoint: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp
        };
        setCurrentGpsPos(newPoint);
      },
      (err) => setGpsError(err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  };

  const addCornerPoint = () => {
    if (currentGpsPos) {
      setGeoPoints(prev => [...prev, currentGpsPos]);
    } else {
      alert("Waiting for GPS signal...");
    }
  };

  const undoLastPoint = () => {
    setGeoPoints(prev => prev.slice(0, -1));
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
      alert("Need at least 3 corners to form a field area.");
      return;
    }
    // We trust the user's manual points, so we don't aggressively simplify unless very close
    const simplified = GeoUtils.simplifyPoints(geoPoints, 0.5); 
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
    // For debugging/demo
    const centerLat = 40.0;
    const centerLng = -100.0;
    const s = 0.001; 
    const now = Date.now();
    
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
    const { segments } = GeoUtils.generateOptimizedPath(field.projectedPoints, equipment.width, field.bounds);
    
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

  const drawPreviewField = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We need to render:
    // 1. All captured geoPoints (solid lines)
    // 2. Current GPS position (dot)
    // 3. Line from last geoPoint to Current GPS (dashed line)

    // To do this, we need a coordinate system. 
    // If we have points, use the first point as origin.
    // If no points, we can't really draw relative shape yet, just draw a dot in center.
    
    const width = canvas.width = canvas.clientWidth;
    const height = canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

    if (!currentGpsPos && geoPoints.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Waiting for GPS...", width/2, height/2);
        return;
    }

    const pointsToDraw = [...geoPoints];
    if (currentGpsPos) pointsToDraw.push(currentGpsPos);

    if (pointsToDraw.length === 0) return;

    // Calculate Bounds
    const origin = pointsToDraw[0];
    const projected = pointsToDraw.map(p => GeoUtils.geoToCartesian(p, origin));

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    projected.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    // Add padding (meters)
    const padMeters = Math.max((maxX - minX) * 0.2, (maxY - minY) * 0.2, 5); // at least 5m padding
    minX -= padMeters; maxX += padMeters;
    minY -= padMeters; maxY += padMeters;

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    
    const scaleX = width / rangeX;
    const scaleY = height / rangeY;
    const scale = Math.min(scaleX, scaleY);

    const toScreen = (p: Point2D) => ({
      x: (p.x - minX) * scale + (width - rangeX * scale) / 2,
      // Flip Y because cartesian Y is usually up, screen Y is down
      // But our projection: Y is North (positive). So we need to flip it for screen.
      y: height - ((p.y - minY) * scale + (height - rangeY * scale) / 2) 
    });

    // Draw Fixed Path
    if (geoPoints.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 3;
        const pts = projected.slice(0, geoPoints.length);
        pts.forEach((p, i) => {
            const s = toScreen(p);
            if (i === 0) ctx.moveTo(s.x, s.y);
            else ctx.lineTo(s.x, s.y);
            
            // Draw vertex
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
        });
        ctx.stroke();
    }

    // Draw Dynamic Line (Live Segment)
    if (currentGpsPos && geoPoints.length > 0) {
        const lastFixed = projected[geoPoints.length - 1];
        const current = projected[projected.length - 1]; // This is currentGpsPos
        
        const s1 = toScreen(lastFixed);
        const s2 = toScreen(current);

        ctx.beginPath();
        ctx.strokeStyle = '#2563eb'; // Blue
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw User Cursor
    if (currentGpsPos) {
        const current = projected[projected.length - 1];
        const s = toScreen(current);
        
        ctx.beginPath();
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Pulse effect
        const time = Date.now() / 500;
        const radius = 8 + Math.sin(time) * 4;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 1;
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

  }, [geoPoints, currentGpsPos]);

  // Main Draw Field (Plan Mode)
  const drawField = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !field) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = containerRef.current;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const padding = 50; 
    const width = field.bounds.maxX - field.bounds.minX;
    const height = field.bounds.maxY - field.bounds.minY;
    const scaleX = (canvas.width - padding * 2) / width;
    const scaleY = (canvas.height - padding * 2) / height;
    const scale = Math.min(scaleX, scaleY);

    const toScreen = (p: Point2D) => ({
      x: padding + (p.x - field.bounds.minX) * scale,
      y: canvas.height - padding - (p.y - field.bounds.minY) * scale
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Field Polygon
    ctx.beginPath();
    ctx.fillStyle = '#f0fdf4'; 
    ctx.strokeStyle = '#15803d'; 
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

  useEffect(() => {
      if (mode === AppMode.CAPTURE) {
          drawPreviewField();
          // Redraw on interval to animate pulse
          const interval = setInterval(drawPreviewField, 100);
          return () => clearInterval(interval);
      }
  }, [mode, drawPreviewField]);


  const handleGeminiAnalysis = async () => {
    if (!field || !equipment) return;
    setIsLoadingInsights(true);
    setGeminiInsights(null);
    const result = await analyzeFieldWithGemini(field, equipment);
    setGeminiInsights(result);
    setIsLoadingInsights(false);
  };

  const renderCapture = () => (
    <div className="flex flex-col h-full bg-slate-50">
        
      {/* Map Area - Grows to fill space */}
      <div className="flex-1 relative m-2 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <canvas ref={previewCanvasRef} className="w-full h-full object-cover" />
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
           <div className="bg-white/90 backdrop-blur border border-slate-200 px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-slate-700 flex items-center gap-2">
              {watchId.current === null ? (
                  <>
                    <Navigation size={16} className="text-slate-400" />
                    <span>Ready to Survey</span>
                  </>
              ) : (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span>GPS Active</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-slate-900">{geoPoints.length}</span>
                    <span className="text-slate-500">corners</span>
                  </>
              )}
           </div>
        </div>

        {gpsError && (
             <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm flex items-center gap-2 shadow-sm">
                 <AlertTriangle size={18} />
                 {gpsError}
             </div>
        )}
      </div>

      {/* Controls Area - Fixed at bottom */}
      <div className="bg-white p-4 rounded-t-3xl border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 pb-8 safe-bottom">
        {watchId.current === null ? (
            <div className="flex flex-col gap-3">
                <Button onClick={startSurvey} label="Start Survey" variant="primary" icon={Play} fullWidth />
                <Button onClick={manualAddPoint} label="Simulate Field (Demo)" variant="outline" icon={Zap} fullWidth />
            </div>
        ) : (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={addCornerPoint} 
                        label="Add Corner" 
                        variant="primary" 
                        icon={PlusCircle} 
                        fullWidth 
                        className="h-16 text-lg"
                    />
                    <button 
                        onClick={undoLastPoint}
                        disabled={geoPoints.length === 0}
                        className="h-16 w-16 flex items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 active:scale-95 transition-all disabled:opacity-50"
                        aria-label="Undo"
                    >
                        <Undo2 size={24} />
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={stopCapture}
                        disabled={geoPoints.length < 3}
                        className="py-3 px-4 rounded-xl font-semibold bg-indigo-600 text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <Check size={18} /> Finish Shape
                    </button>
                     <button 
                        onClick={() => {
                            navigator.geolocation.clearWatch(watchId.current!);
                            watchId.current = null;
                            setGeoPoints([]);
                            setCurrentGpsPos(null);
                        }}
                        className="py-3 px-4 rounded-xl font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} /> Cancel
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="flex flex-col h-full p-4 gap-4 bg-slate-50">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
           Field Dimensions
           <div className="h-px bg-slate-100 flex-1"></div>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
            <span className="text-slate-500 text-xs font-medium uppercase mb-1">Area</span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{(field?.areaSqMeters || 0).toFixed(0)} <span className="text-base text-slate-400 font-sans font-normal">m²</span></div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
            <span className="text-slate-500 text-xs font-medium uppercase mb-1">Perimeter</span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{(field?.perimeterMeters || 0).toFixed(0)} <span className="text-base text-slate-400 font-sans font-normal">m</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col">
        <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
           Configuration
           <div className="h-px bg-slate-100 flex-1"></div>
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2">Equipment Name</label>
            <input 
              type="text" 
              value={equipment.name}
              onChange={(e) => setEquipment({...equipment, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="e.g. John Deere 8R"
            />
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2">Work Width (m)</label>
            <div className="relative">
                <input 
                type="number" 
                value={equipment.width}
                onChange={(e) => setEquipment({...equipment, width: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-mono font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">meters</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 px-1">Effective width of boom/header.</p>
          </div>
        </div>
        
        <div className="mt-auto pt-8 flex flex-col gap-3">
          <Button onClick={generatePlan} label="Generate Path" variant="primary" icon={Check} fullWidth />
          <Button onClick={() => setMode(AppMode.CAPTURE)} label="Resurvey" variant="secondary" icon={RotateCcw} fullWidth />
        </div>
      </div>
    </div>
  );

  const renderPlan = () => (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="flex-1 relative overflow-hidden shadow-inner bg-slate-200" ref={containerRef}>
        <div className="absolute inset-0 bg-slate-50" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
        
        <div className="absolute top-4 left-4 right-4 flex gap-2">
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex-1">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">Coverage</div>
            <div className="text-green-600 font-bold text-xl">{(simulatedProgress * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex-1">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">Time</div>
            <div className="text-slate-900 font-bold text-xl">{Math.round((plan?.estimatedTimeSeconds || 0) / 60)} <span className="text-sm text-slate-400 font-normal">min</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 border-t border-slate-200 shrink-0 pb-safe-bottom shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 rounded-t-3xl -mt-6">
        <div className="flex gap-4 mb-4">
          {isRunning ? (
            <Button onClick={() => setIsRunning(false)} label="Pause" variant="danger" icon={Pause} className="flex-1 shadow-red-100" />
          ) : (
            <Button onClick={() => setIsRunning(true)} label="Start" variant="primary" icon={Play} className="flex-1" />
          )}
          <button 
            onClick={() => setMode(AppMode.SETUP)}
            className="p-4 bg-slate-100 rounded-2xl hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>

        <div className="border-t border-slate-100 pt-4">
           {!geminiInsights ? (
             <button 
                onClick={handleGeminiAnalysis}
                disabled={isLoadingInsights}
                className="w-full py-4 px-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
             >
               <Zap size={18} className={isLoadingInsights ? "animate-spin" : ""} />
               {isLoadingInsights ? "Thinking..." : "Optimize with AI"}
             </button>
           ) : (
             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <h4 className="text-indigo-900 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} className="text-indigo-600" /> AI Insights
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