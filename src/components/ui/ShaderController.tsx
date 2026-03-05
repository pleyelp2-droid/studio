"use client";

import { useStore } from '@/store';
import { Eye, EyeOff, Sun, Moon, CloudFog, Sparkles, Box, Globe, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export const ShaderController = () => {
  const shaderSettings = useStore(state => state.shaderSettings);
  const setShaderSetting = useStore(state => state.setShaderSetting);

  const controls = [
    { key: 'enableFog', label: 'Fog Shader', icon: CloudFog },
    { key: 'enableSky', label: 'Atmosphere', icon: Sun },
    { key: 'enableStars', label: 'Star Field', icon: Sparkles },
    { key: 'enableAmbient', label: 'Ambient Light', icon: Moon },
    { key: 'enableDirectional', label: 'Sun Light', icon: Sun },
    { key: 'enableEnvironment', label: 'IBL Maps', icon: Globe },
    { key: 'forceEmissive', label: 'Force Glow', icon: Zap },
  ];

  return (
    <div className="bg-axiom-dark/90 backdrop-blur-2xl border border-axiom-cyan/30 rounded-3xl p-6 w-72 shadow-2xl pointer-events-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <Box className="w-5 h-5 text-axiom-cyan" />
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Shader Oversight</h3>
      </div>

      <div className="space-y-4">
        {controls.map((ctrl) => {
          const Icon = ctrl.icon;
          const isActive = (shaderSettings as any)[ctrl.key];
          
          return (
            <div key={ctrl.key} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-axiom-cyan/10 text-axiom-cyan' : 'bg-white/5 text-gray-600'}`}>
                  <Icon size={14} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {ctrl.label}
                </span>
              </div>
              <Switch 
                checked={isActive} 
                onCheckedChange={(val) => setShaderSetting(ctrl.key as any, val)}
                className="scale-75"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
          <p className="text-[8px] text-gray-500 leading-tight uppercase font-bold italic">
            Tip: If textures are missing, try disabling "Atmosphere" and "Fog" or enabling "Force Glow".
          </p>
        </div>
      </div>
    </div>
  );
};
