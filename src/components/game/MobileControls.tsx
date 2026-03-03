
"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Settings2, Move, MousePointer2, Smartphone, Monitor } from 'lucide-react'

export const MobileControls = () => {
  const { controlMode, setControlMode, setVirtualInput, isMobile } = useStore()
  const [isTouching, setIsTouching] = useState(false)
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = () => setIsTouching(true)
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouching || !joystickRef.current) return
    
    const touch = e.touches[0]
    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    let dx = touch.clientX - centerX
    let dy = touch.clientY - centerY
    
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxRadius = rect.width / 2
    
    if (distance > maxRadius) {
      dx *= maxRadius / distance
      dy *= maxRadius / distance
    }
    
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`
    }
    
    // Normalize to -1 to 1 for the game engine
    setVirtualInput({
      x: dx / maxRadius,
      z: dy / maxRadius
    })
  }

  const handleTouchEnd = () => {
    setIsTouching(false)
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(0, 0)`
    }
    setVirtualInput({ x: 0, z: 0 })
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between p-6">
      {/* Control Switcher Overlay */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-axiom-cyan mr-4 italic">
            {isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
            <span>System: {isMobile ? 'Android' : 'Desktop'}</span>
          </div>
          <div className="flex gap-1">
            <Button 
              variant={controlMode === 'JOYSTICK' ? 'default' : 'ghost'} 
              size="sm" 
              className={`rounded-xl h-10 w-10 p-0 ${controlMode === 'JOYSTICK' ? 'axiom-gradient border-0' : ''}`}
              onClick={() => setControlMode('JOYSTICK')}
              title="Joystick Mode"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button 
              variant={controlMode === 'PUSH_TO_WALK' ? 'default' : 'ghost'} 
              size="sm" 
              className={`rounded-xl h-10 w-10 p-0 ${controlMode === 'PUSH_TO_WALK' ? 'axiom-gradient border-0' : ''}`}
              onClick={() => setControlMode('PUSH_TO_WALK')}
              title="Push to Walk"
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Virtual Joystick UI */}
      {controlMode === 'JOYSTICK' && (
        <div className="flex justify-start items-end p-8 pointer-events-auto">
          <div 
            ref={joystickRef}
            className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-md border-2 border-white/10 relative flex items-center justify-center touch-none shadow-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              ref={knobRef}
              className="w-14 h-14 rounded-full axiom-gradient shadow-[0_0_30px_rgba(31,184,184,0.6)] border-2 border-white/20 transition-transform duration-75 ease-out flex items-center justify-center"
            >
               <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Hint */}
      {controlMode === 'PUSH_TO_WALK' && (
        <div className="flex justify-center mb-12">
          <div className="bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-full border border-axiom-cyan/30 text-[10px] font-black uppercase tracking-[0.4em] text-axiom-cyan italic animate-pulse shadow-2xl">
            Tap Terrain to Manifest Destination
          </div>
        </div>
      )}
    </div>
  )
}
