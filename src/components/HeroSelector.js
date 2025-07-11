'use client'

import { useState, useEffect } from 'react';

export default function HeroSelector({ heroes, onHeroSelect, loading, error }) {
  const [selectedHero, setSelectedHero] = useState(null);

  // 当heroes数据变化时，如果有默认选中的英雄，更新本地状态
  useEffect(() => {
    if (heroes && heroes.length > 0 && !selectedHero) {
      setSelectedHero(heroes[0]);
    }
  }, [heroes, selectedHero]);

  const handleHeroSelect = (hero) => {
    setSelectedHero(hero);
    if (onHeroSelect) {
      onHeroSelect(hero);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-400">选择英雄</h2>
        <div className="flex justify-center items-center h-40">
          <p>加载英雄数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-400">选择英雄</h2>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-amber-400">选择英雄</h2>
      {heroes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {heroes.map((hero, index) => (
            <div 
              key={index} 
              className={`bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-amber-900 transition ${selectedHero === hero ? 'ring-2 ring-amber-500' : ''}`}
              onClick={() => handleHeroSelect(hero)}
            >
              <h3 className="text-center text-sm">{hero.name.split('|')[0]}</h3>
              <div className="flex justify-center my-2">
                <img 
                  src={hero.avatar} 
                  alt={hero.name} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              <p className="text-xs text-gray-300 text-center">{hero.name.split('|')[1] || ''}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p>没有可用的英雄数据</p>
        </div>
      )}
    </div>
  );
} 