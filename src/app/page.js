'use client'

import HeroSelector from '@/components/HeroSelector';
import EquipmentSelector from '@/components/EquipmentSelector';
import TalentSelector from '@/components/TalentSelector';
import { useState, useEffect } from 'react';

export default function Home() {
  const [heroes, setHeroes] = useState([]);
  const [selectedHero, setSelectedHero] = useState(null);
  const [selectedTalents, setSelectedTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取英雄数据
  useEffect(() => {
    async function fetchHeroData() {
      setLoading(true);
      try {
        const response = await fetch('/json/hero.json');
        if (!response.ok) {
          throw new Error(`获取英雄数据失败: ${response.status}`);
        }
        const heroData = await response.json();
        setHeroes(heroData);
        setLoading(false);
      } catch (error) {
        console.error('获取英雄数据出错:', error);
        setError('无法加载英雄数据');
        setLoading(false);
      }
    }

    fetchHeroData();
  }, []);

  // 处理英雄选择
  const handleHeroSelect = (hero) => {
    setSelectedHero(hero);
    // 重置已选天赋
    setSelectedTalents([]);
  };

  // 处理天赋选择
  const handleTalentSelect = (talents) => {
    setSelectedTalents(talents);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-amber-400">火炬之光：无限 构建工具</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 英雄选择区域 */}
          <div className="lg:col-span-1">
            <HeroSelector 
              heroes={heroes} 
              onHeroSelect={handleHeroSelect}
              loading={loading}
              error={error}
            />
          </div>
          
          {/* 天赋选择区域 */}
          <div className="lg:col-span-2">
            <TalentSelector 
              selectedHero={selectedHero}
              onTalentSelect={handleTalentSelect}
            />
          </div>
          
          {/* 装备选择区域 - 将来实现 */}
          {/* <div className="lg:col-span-1">
            <EquipmentSelector selectedHero={selectedHero} />
          </div> */}
        </div>
      </div>
    </main>
  );
}
