
"use client"

import React from 'react'
import { useStore } from '@/store'
import { Pickaxe, Hammer, Swords, Brain, Trophy } from 'lucide-react'

export const SkillBar = () => {
  const { agents, selectedAgentId } = useStore()
  const agent = agents.find(a => a.id === selectedAgentId)

  if (!agent || !agent.skills) return null

  const skills = [
    { id: 'mining', label: 'MINING', icon: Pickaxe, color: 'text-axiom-gold', borderColor: 'border-axiom-gold/30' },
    { id: 'smithing', label: 'FORGING', icon: Hammer, color: 'text-red-500', borderColor: 'border-red-500/30' },
    { id: 'combat', label: 'COMBAT', icon: Swords, color: 'text-axiom-cyan', borderColor: 'border-axiom-cyan/30' },
    { id: 'reflection', label: 'THINKING', icon: Brain, color: 'text-axiom-purple', borderColor: 'border-axiom-purple/30' },
  ]

  return (
    <div className="bg-black/60 backdrop-blur-2xl border border-white/5 p-2 rounded-2xl flex items-center gap-4 pointer-events-auto shadow-2xl">
      <div className="h-10 w-10 axiom-gradient rounded-xl flex items-center justify-center shadow-lg shrink-0">
        <Trophy className="text-white w-5 h-5" />
      </div>
      <div className="flex gap-2 w-full overflow-x-auto scrollbar-hide py-1">
        {skills.map((skill) => {
          const skillData = agent.skills[skill.id] || { level: 1, xp: 0 }
          const xpNeeded = skillData.level * 100 + skillData.level * skillData.level * 10
          const progress = Math.min(100, (skillData.xp / xpNeeded) * 100)

          return (
            <div key={skill.id} className={`flex flex-col gap-1 min-w-[120px] p-2 rounded-xl bg-white/5 border ${skill.borderColor} group hover:bg-white/10 transition-all`}>
              <div className="flex justify-between items-center gap-2">
                <skill.icon className={`w-3 h-3 ${skill.color}`} />
                <span className="text-[8px] font-black text-white/60 tracking-widest">{skill.label}</span>
                <span className="text-[10px] font-bold text-white ml-auto">LVL {skillData.level}</span>
              </div>
              <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${skill.color.replace('text-', 'bg-')} transition-all duration-500 shadow-[0_0_8px_currentColor]`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
