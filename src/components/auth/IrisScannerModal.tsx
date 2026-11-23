import React, { useState, useEffect, useRef } from 'react';
import { Eye, Shield, AlertTriangle, CheckCircle2, RefreshCw, X, Camera, Sparkles, Binary } from 'lucide-react';
import { irisDriverRegistry, type IrisHardwareDriver } from '../../services/irisDriverService';
import type { IrisScanResult } from '../../types/auth';

interface IrisScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (result: IrisScanResult) => void;
}

export const IrisScannerModal: React.FC<IrisScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete
}) => {
  const [activeDriver, setActiveDriver] = useState<IrisHardwareDriver>(irisDriverRegistry.getActiveDriver());
  const [scanState, setScanState] = useState<'IDLE' | 'CALIBRATING' | 'LOCALIZING' | 'EXTRACTING' | 'MATCHING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [scanProgress, setScanProgress] = useState(0);
  const [useCameraFeed, setUseCameraFeed] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<IrisScanResult | null>(null);
  const [generatedVector, setGeneratedVector] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Setup camera when toggled
  useEffect(() => {
    if (useCameraFeed && isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraError(null);
        })
        .catch((err) => {
          setCameraError('Camera access unavailable or declined. Using synthetic optical simulation.');
          setUseCameraFeed(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [useCameraFeed, isOpen]);

  // Clean close
  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanState('IDLE');
    setScanResult(null);
    onClose();
  };

  const startScan = async () => {
    setScanState('CALIBRATING');
    setScanProgress(15);
    setScanResult(null);

    // Generate random synthetic 64-bit preview blocks for the Gabor wavelet matrix
    const vectorBlocks: string[] = [];
    for (let i = 0; i < 8; i++) {
      vectorBlocks.push(Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0').toUpperCase());
    }
    setGeneratedVector(vectorBlocks);

    try {
      await activeDriver.initialize();
      setScanState('LOCALIZING');
      setScanProgress(45);
      await new Promise((r) => setTimeout(r, 600));

      setScanState('EXTRACTING');
      setScanProgress(75);
      await new Promise((r) => setTimeout(r, 700));

      setScanState('MATCHING');
      setScanProgress(90);

      const result = await activeDriver.captureAndExtract({ videoElement: videoRef.current });
      setScanProgress(100);
      setScanResult(result);
      setScanState('SUCCESS');

      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (e: any) {
      setScanState('ERROR');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono select-none">
      <div className="relative w-full max-w-xl rounded-2xl bg-cyber-bgSecondary border border-cyber-cyan/30 shadow-[0_0_50px_rgba(34,227,255,0.15)] overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-cyber-card/80 border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-cyber-cyan animate-pulse" />
            <div>
              <div className="text-xs font-bold text-white tracking-wider uppercase">
                Iris Biometric Authentication Station
              </div>
              <div className="text-[10px] text-cyber-cyan">
                {activeDriver.name}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-cyber-elevated text-cyber-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legal & Regulatory Demonstration Mode Pill */}
        <div className="bg-cyber-warning/10 border-b border-cyber-warning/30 px-5 py-2 flex items-start gap-2.5 text-[11px] text-cyber-warning">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-cyber-warning" />
          <div>
            <span className="font-bold uppercase tracking-wider">Demonstration Mode · Zero Raw Storage:</span> Standard consumer optical cameras operate in visible light spectrum and cannot perform ISO/IEC 19794-6 near-infrared retinal authentication. This laboratory module demonstrates the biometric localization, Gabor wavelet extraction, and Hamming scoring pipeline.
          </div>
        </div>

        {/* Central Viewport / HUD */}
        <div className="p-6 flex flex-col items-center justify-center space-y-5">
          <div className="relative w-64 h-64 rounded-full bg-cyber-card/60 border-2 border-cyber-cyan/40 flex items-center justify-center overflow-hidden shadow-[inset_0_0_30px_rgba(34,227,255,0.2)]">
            {/* Live Camera Viewfinder (if enabled) */}
            {useCameraFeed ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 opacity-70"
              />
            ) : (
              /* High-Tech Procedural Iris SVG */
              <svg className="w-48 h-48 animate-pulse" viewBox="0 0 200 200">
                <defs>
                  <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0B1220" />
                    <stop offset="35%" stopColor="#16233D" />
                    <stop offset="65%" stopColor="#2F6BFF" />
                    <stop offset="90%" stopColor="#22E3FF" />
                    <stop offset="100%" stopColor="#05070D" />
                  </radialGradient>
                </defs>
                {/* Sclera & Outer boundary */}
                <circle cx="100" cy="100" r="90" fill="none" stroke="#22E3FF" strokeWidth="1" strokeDasharray="4 2" />
                <circle cx="100" cy="100" r="80" fill="url(#irisGrad)" opacity="0.8" />
                {/* Iris Fibers / Collarette Rings */}
                {[20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((deg) => (
                  <line
                    key={deg}
                    x1="100"
                    y1="100"
                    x2={100 + 75 * Math.cos((deg * Math.PI) / 180)}
                    y2={100 + 75 * Math.sin((deg * Math.PI) / 180)}
                    stroke="#22E3FF"
                    strokeWidth="0.5"
                    opacity="0.4"
                  />
                ))}
                {/* Collarette Ring */}
                <circle cx="100" cy="100" r="45" fill="none" stroke="#22E3FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                {/* Pupil */}
                <circle
                  cx="100"
                  cy="100"
                  r={scanState === 'MATCHING' || scanState === 'SUCCESS' ? 24 : 30}
                  fill="#05070D"
                  stroke="#22E3FF"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
              </svg>
            )}

            {/* Rotating Reticle Ticks */}
            <div className={`absolute inset-2 border border-cyber-cyan/30 rounded-full pointer-events-none ${scanState !== 'IDLE' ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
            <div className={`absolute inset-6 border border-dashed border-cyber-cyan/20 rounded-full pointer-events-none ${scanState !== 'IDLE' ? 'animate-spin' : ''}`} style={{ animationDuration: '6s', animationDirection: 'reverse' }} />

            {/* Laser Scanning Sweep Line */}
            {scanState !== 'IDLE' && scanState !== 'SUCCESS' && scanState !== 'ERROR' && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent shadow-[0_0_15px_#22E3FF] animate-[bounce_2s_infinite]" />
            )}

            {/* Center Crosshair */}
            <div className="absolute w-6 h-6 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyber-cyan" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyber-cyan" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-cyber-cyan" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-cyber-cyan" />
            </div>

            {/* Success Overlay Check */}
            {scanState === 'SUCCESS' && (
              <div className="absolute inset-0 bg-cyber-cyan/20 backdrop-blur-xs flex items-center justify-center animate-fade-in">
                <CheckCircle2 className="w-16 h-16 text-cyber-cyan drop-shadow-[0_0_15px_#22E3FF]" />
              </div>
            )}
          </div>

          {/* Progress & Pipeline Step Label */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-cyber-muted font-bold">PIPELINE PHASE:</span>
              <span className="text-cyber-cyan font-bold">
                {scanState === 'IDLE' && 'READY TO INITIALIZE'}
                {scanState === 'CALIBRATING' && '1/4 OPTICAL SENSOR CALIBRATION'}
                {scanState === 'LOCALIZING' && '2/4 PUPIL CONTOUR SEGMENTATION'}
                {scanState === 'EXTRACTING' && '3/4 2D GABOR WAVELET EXTRACTION'}
                {scanState === 'MATCHING' && '4/4 HAMMING DISTANCE VERIFICATION'}
                {scanState === 'SUCCESS' && 'EXTRACTION & MATCH COMPLETE'}
                {scanState === 'ERROR' && 'SCAN FAILED'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-cyber-card rounded-full overflow-hidden border border-cyber-border">
              <div
                className="h-full bg-cyber-cyan transition-all duration-300 shadow-[0_0_8px_#22E3FF]"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          {/* Extracted Vector Stream Preview */}
          {generatedVector.length > 0 && (
            <div className="w-full p-2.5 rounded-xl bg-cyber-bg/80 border border-cyber-border/70 text-[10px] space-y-1">
              <div className="text-cyber-muted flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Extracted IrisCode Polar Texture Vector (Gabor Phase Quantization):</span>
              </div>
              <div className="text-cyber-cyan font-mono tracking-wider break-all">
                {generatedVector.join(' ')}
              </div>
            </div>
          )}

          {/* Scan Results Card */}
          {scanResult && (
            <div className="w-full p-3 rounded-xl bg-cyber-card border border-cyber-cyan/40 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-cyber-border/50 pb-2">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyber-cyan" />
                  <span>Biometric Verification Score</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan font-bold border border-cyber-cyan/40">
                  {scanResult.confidence}% MATCH CONFIDENCE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-cyber-muted">Pupil Dilation Ratio:</span>
                  <span className="text-white font-bold">{scanResult.pupilDilationRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-muted">Collarette Matches:</span>
                  <span className="text-white font-bold">{scanResult.collaretteMatches} / 512 bits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-muted">Hardware Class:</span>
                  <span className="text-cyber-warning font-bold">SIMULATION DEMO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-muted">ISO 19794-6 Status:</span>
                  <span className="text-cyber-muted font-bold">SYNTHETIC PASS</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-cyber-card/90 border-t border-cyber-border flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setUseCameraFeed(!useCameraFeed)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyber-border hover:border-cyber-cyan/40 text-cyber-muted hover:text-white transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>{useCameraFeed ? 'Switch to Synthetic Eye' : 'Enable Camera Viewfinder'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-cyber-border hover:bg-cyber-card text-cyber-muted hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={scanState !== 'IDLE' && scanState !== 'SUCCESS'}
              onClick={startScan}
              className="px-5 py-2 rounded-lg bg-cyber-primary hover:bg-cyber-primary/80 active:bg-cyber-primary/60 text-white font-bold flex items-center gap-2 shadow-cyber-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanState !== 'IDLE' && scanState !== 'SUCCESS' ? 'animate-spin' : ''}`} />
              <span>{scanState === 'SUCCESS' ? 'Scan Again' : 'Initialize Scan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
