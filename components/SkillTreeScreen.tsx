import React from 'react';
import { UserProfile, Skill } from '../types';
import { SKILLS } from '../constants';
import { ChevronLeft, Zap, Lock } from 'lucide-react';

interface SkillTreeScreenProps {
  profile: UserProfile;
  onUpgradeSkill: (skillId: string) => void;
  onBack: () => void;
}

const SkillTreeScreen: React.FC<SkillTreeScreenProps> = ({ profile, onUpgradeSkill, onBack }) => {
  const branches = ['RECOGNITION', 'PERFORMANCE', 'CONTROL'] as const;

  const renderSkillNode = (skill: Skill) => {
    const currentLevel = profile.skills[skill.id] || 0;
    const isMaxed = currentLevel >= skill.maxLevel;
    const canAfford = profile.sp >= skill.cost;

    return (
      <div key={skill.id} className="flex flex-col items-center mb-8 last:mb-0 relative group">
        <button
          onClick={() => onUpgradeSkill(skill.id)}
          disabled={isMaxed || !canAfford}
          className={`
            w-16 h-16 rounded-full border-2 flex items-center justify-center relative z-10 transition-all
            ${isMaxed 
              ? 'bg-blueprint-glow text-blueprint-bg border-blueprint-glow shadow-[0_0_15px_#00FFFF]' 
              : canAfford 
                ? 'bg-blueprint-bg text-blueprint-glow border-blueprint-glow hover:scale-110 cursor-pointer' 
                : 'bg-blueprint-bg text-gray-600 border-gray-600 cursor-not-allowed'}
          `}
        >
          <div className="text-xl font-bold">{currentLevel}</div>
          <div className="absolute -bottom-6 text-[10px] w-32 text-center text-blueprint-line pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-blueprint-bg/90 p-1 border border-blueprint-line rounded z-20">
            {skill.name}<br/>
            <span className="opacity-70">{skill.description}</span><br/>
            {!isMaxed && <span className="text-yellow-400">Cost: {skill.cost} SP</span>}
          </div>
        </button>
        {/* Connecting Line (visual only, simple vertical) */}
        <div className="h-8 w-px bg-blueprint-line/20 -mt-2 -mb-2 z-0" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-blueprint-bg text-blueprint-line relative p-6">
      <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="z-10 flex justify-between items-center mb-8 border-b border-blueprint-line/30 pb-4">
        <div>
          <h1 className="text-3xl font-bold font-mono text-blueprint-glow">SYSTEM ARCHITECTURE</h1>
          <div className="flex gap-4 mt-2 text-purple-400">
            <Zap size={16} /> <span className="font-mono">{profile.sp} SKILL POINTS</span>
          </div>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 hover:text-blueprint-glow">
          <ChevronLeft /> BACK
        </button>
      </div>

      {/* Trees */}
      <div className="z-10 flex-1 grid grid-cols-3 gap-4 h-full overflow-y-auto">
        {branches.map(branch => (
          <div key={branch} className="flex flex-col items-center border-r border-blueprint-line/10 last:border-r-0">
            <h2 className="text-sm font-bold tracking-widest mb-8 text-blueprint-line/50">{branch}</h2>
            {SKILLS.filter(s => s.branch === branch).map(renderSkillNode)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillTreeScreen;
