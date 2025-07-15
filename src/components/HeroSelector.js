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
      <div className="bg-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex justify-center items-center h-20">
          <p>加载英雄数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-700 rounded-lg p-4 shadow-lg">
        <div className="bg-gray-600 p-3 rounded-lg text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg p-4 shadow-lg">
      {heroes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {heroes.map((hero, index) => (
            <div 
              key={index} 
              className={`bg-gray-600 p-2 rounded-lg cursor-pointer hover:bg-amber-900 transition ${selectedHero === hero ? 'ring-2 ring-amber-500' : ''}`}
              onClick={() => handleHeroSelect(hero)}
            >
              <div className="flex flex-col items-center">
                <img 
                  src={hero.avatar} 
                  alt={hero.name} 
                  className="w-12 h-12 rounded-full object-cover mb-1"
                />
                <h3 className="text-center text-xs">{hero.name.split('|')[0]}</h3>
                <p className="text-xs text-gray-300 text-center truncate w-full">{hero.name.split('|')[1] || ''}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-600 p-3 rounded-lg text-center">
          <p>没有可用的英雄数据</p>
        </div>
      )}
    </div>
  );
} 