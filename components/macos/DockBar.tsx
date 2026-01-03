"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowManager } from "./WindowManager";
import Image from "next/image";

interface DockIconProps {
  appId: string;
  name: string;
  icon: React.ReactNode | string;
  className?: string;
  onClick: () => void;
  onPositionUpdate?: (appId: string, position: { x: number; y: number }) => void;
  isOpen: boolean;
}

interface MinimizedWindowIconProps {
  windowId: string;
  title: string;
  previewHtml?: string; // HTML content of window preview
  previewSize?: { width: number; height: number }; // Original window size
  onClick: () => void;
  onPositionUpdate: (windowId: string, position: { x: number; y: number }) => void;
}

const LiquidGlassFilter = () => (
  <svg
    style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
  >
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.01 0.01"
        numOctaves="1"
        seed="5"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="40"
        xChannelSelector="R"
        yChannelSelector="G"
      />
      {/* Note: I adjusted scale="40" (down from 150) so it looks good on smaller dock heights */}
    </filter>
  </svg>
);

function MinimizedWindowIcon({ windowId, title, previewHtml, previewSize, onClick, onPositionUpdate }: MinimizedWindowIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  // Thumbnail dimensions (max size)
  const maxThumbnailWidth = 60;
  const maxThumbnailHeight = 42;
  
  // Calculate scale to fit preview in thumbnail
  const scale = previewSize 
    ? Math.min(maxThumbnailWidth / previewSize.width, maxThumbnailHeight / previewSize.height)
    : 0.1;
  
  // Calculate actual thumbnail dimensions based on scaled preview
  const actualWidth = previewSize ? previewSize.width * scale : maxThumbnailWidth;
  const actualHeight = previewSize ? previewSize.height * scale : maxThumbnailHeight;

  useEffect(() => {
    const updatePosition = () => {
      if (iconRef.current && onPositionUpdate) {
        const rect = iconRef.current.getBoundingClientRect();
        onPositionUpdate(windowId, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    const timeoutId = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timeoutId);
    };
  }, [windowId, onPositionUpdate]);

  return (
    <motion.div
      ref={iconRef}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="relative cursor-pointer"
      style={{ width: actualWidth, height: actualHeight }}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs text-white z-50 whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.65) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            }}
          >
            {title}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid rgba(0, 0, 0, 0.75)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Minimized window thumbnail with HTML preview */}
      <div 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
          background: '#1e1e1e',
        }}
      >
        {previewHtml && previewSize ? (
          <div 
            className="origin-top-left pointer-events-none select-none"
            style={{
              width: previewSize.width,
              height: previewSize.height,
              transform: `scale(${scale})`,
            }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(50, 50, 50, 0.9) 100%)',
            }}
          >
            <span className="text-white/50 text-xs">{title}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DockIcon({ appId, name, icon, className, onClick, onPositionUpdate, isOpen }: DockIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (iconRef.current && onPositionUpdate) {
        const rect = iconRef.current.getBoundingClientRect();
        onPositionUpdate(appId, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    // Small delay to ensure dock animation is complete
    const timeoutId = setTimeout(updatePosition, 1000);

    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timeoutId);
    };
  }, [appId, onPositionUpdate]);

  return (
    <div
      ref={iconRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative ${className}`}
    >
      {/* Icon */}
      <motion.div
        whileTap={{ opacity: 0.5 }}
        className="relative flex items-center justify-center w-full h-full"
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-full mb-2 px-3 py-1.5 rounded-lg text-xs text-white z-50"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.65) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
              }}
            >
              {name}
              {/* Tooltip arrow pointing down */}
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: "4px solid rgba(0, 0, 0, 0.75)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {typeof icon === "string" ? <Image src={icon} alt={name} fill /> : icon}
        {isOpen && (
          // small white dot underneath the icon
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-300" />
        )}
      </motion.div>
    </div>
  );
}

export default function DockBar() {
  const { apps, openWindow, windows, registerDockIconPosition, registerMinimizedWindowPosition, restoreWindow } = useWindowManager();

  // Get minimized windows
  const minimizedWindows = windows.filter((w) => w.isMinimized);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
      className="fixed bottom-2 justify-self-center z-[9998]"
    >
      {/* 2. The Main Wrapper (handles the shape and liquid boundary) */}
      <div className="liquid-glass-wrapper">
        {/* This contains the messiness of the distortion */}
        <div className="liquid-glass-mask">
          <div className="liquid-glass-effect"></div>
          <div className="liquid-glass-tint"></div>
          <div className="liquid-glass-shine"></div>
        </div>

        {/* Layer D: The Actual Content (Must be z-indexed above the glass) */}
        <div className="liquid-glass-content px-3 py-3 flex gap-5 w-full justify-between items-center">
          {/* App Icons */}
          <div className="flex gap-8 items-center">
            {apps.map((app) => (
              <DockIcon
                key={app.id}
                appId={app.id}
                name={app.name}
                icon={app.icon}
                isOpen={windows.some((w) => w.appId === app.id && !w.isMinimized)}
                className={app.className}
                onClick={() => openWindow(app.id)}
                onPositionUpdate={registerDockIconPosition}
              />
            ))}
          </div>

          {/* Separator and Minimized Windows */}
          <AnimatePresence>
            {minimizedWindows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-5"
              >
                {/* Separator */}
                <div 
                  className="w-px h-10 mx-1"
                  style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  }}
                />
                
                {/* Minimized Windows */}
                <div className="flex gap-3 items-center">
                  <AnimatePresence>
                    {minimizedWindows.map((win) => (
                      <MinimizedWindowIcon
                        key={win.id}
                        windowId={win.id}
                        title={win.title}
                        previewHtml={win.minimizedPreviewHtml}
                        previewSize={win.minimizedSize}
                        onClick={() => restoreWindow(win.id)}
                        onPositionUpdate={registerMinimizedWindowPosition}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
