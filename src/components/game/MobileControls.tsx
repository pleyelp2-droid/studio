
"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Settings2, Move, MousePointer2 } from 'lucide-react'

export const MobileControls = () => {
  const { controlMode, setControlMode, setVirtualInput } = useStore()
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
      {/* Control Switcher */}
      <div className="flex justify-end pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-1 flex gap-1">
          <Button 
            variant={controlMode === 'JOYSTICK' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-xl h-10 w-10 p-0"
            onClick={() => setControlMode('JOYSTICK')}
          >
            <Move className="h-4 w-4" />
          </Button>
          <Button 
            variant={controlMode === 'PUSH_TO_WALK' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-xl h-10 w-10 p-0"
            onClick={() => setControlMode('PUSH_TO_WALK')}
          >
            <MousePointer2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Virtual Joystick */}
      {controlMode === 'JOYSTICK' && (
        <div className="flex justify-start items-end p-8 pointer-events-auto">
          <div 
            ref={joystickRef}
            className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 relative flex items-center justify-center touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              ref={knobRef}
              className="w-12 h-12 rounded-full axiom-gradient shadow-2xl shadow-accent/50 border-2 border-white/40 transition-transform duration-75 ease-out"
            />
          </div>
        </div>
      )}

      {/* Push to Walk Hint */}
      {controlMode === 'PUSH_TO_WALK' && (
        <div className="flex justify-center mb-12">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-accent italic animate-pulse">
            Tap Terrain to Move Neural Shell
          </div>
        </div>
      )}
    </div>
  )
}
