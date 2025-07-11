'use client'

import HeroSelector from '@/components/HeroSelector';
import EquipmentSelector from '@/components/EquipmentSelector';
import TalentSelector from '@/components/TalentSelector';
import { useState, useEffect, useCallback, useMemo } from 'react';

export default function Home() {
  const [heroes, setHeroes] = useState([]);
  const [selectedHero, setSelectedHero] = useState(null);
  const [selectedTalents, setSelectedTalents] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attributes, setAttributes] = useState({
    strength: 100,
    dexterity: 80,
    wisdom: 60,
    mana: 120
  });
  const [activeTab, setActiveTab] = useState('build'); // 'build', 'guide', 'data'

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
        
        // 默认选中第一个英雄
        if (heroData && heroData.length > 0) {
          setSelectedHero(heroData[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('获取英雄数据出错:', error);
        setError('无法加载英雄数据');
        setLoading(false);
      }
    }

    fetchHeroData();
  }, []);

  // 当选择英雄时，重置已选特性和属性
  useEffect(() => {
    if (selectedHero) {
      // 根据英雄类型设置初始属性
      const heroType = selectedHero.name.split('|')[1] || '';
      let baseAttributes = {
        strength: 100,
        dexterity: 80,
        wisdom: 60,
        mana: 120
      };
      
      if (heroType.includes('怒火') || heroType.includes('战火')) {
        baseAttributes = {
          strength: 140,
          dexterity: 70,
          wisdom: 50,
          mana: 100
        };
      } else if (heroType.includes('猎') || heroType.includes('影')) {
        baseAttributes = {
          strength: 70,
          dexterity: 140,
          wisdom: 60,
          mana: 110
        };
      } else if (heroType.includes('焰') || heroType.includes('冰')) {
        baseAttributes = {
          strength: 60,
          dexterity: 70,
          wisdom: 140,
          mana: 150
        };
      }
      
      setAttributes(baseAttributes);
    } else {
      setAttributes({
        strength: 100,
        dexterity: 80,
        wisdom: 60,
        mana: 120
      });
    }
  }, [selectedHero]);

  // 计算天赋对属性的加成 - 修复无限循环问题
  const calculateTalentBonuses = useCallback((baseAttributes) => {
    if (!selectedHero || !baseAttributes) return baseAttributes;
    
    // 创建一个新的属性对象，避免修改原始对象
    let calculatedAttributes = { ...baseAttributes };
    
    // 应用天赋加成
    selectedTalents.forEach(talent => {
      if (talent.desc) {
        // 解析天赋描述，提取属性加成
        const desc = talent.desc;
        
        // 处理力量加成
        if (desc.includes('力量')) {
          const strengthMatch = desc.match(/\+(\d+)\s*力量/);
          if (strengthMatch && strengthMatch[1]) {
            calculatedAttributes.strength += parseInt(strengthMatch[1]);
          }
        }

        // 处理敏捷加成
        if (desc.includes('敏捷')) {
          const dexterityMatch = desc.match(/\+(\d+)\s*敏捷/);
          if (dexterityMatch && dexterityMatch[1]) {
            calculatedAttributes.dexterity += parseInt(dexterityMatch[1]);
          }
        }
        
        // 处理智慧加成
        if (desc.includes('智慧')) {
          const wisdomMatch = desc.match(/\+(\d+)\s*智慧/);
          if (wisdomMatch && wisdomMatch[1]) {
            calculatedAttributes.wisdom += parseInt(wisdomMatch[1]);
          }
          // 处理百分比智慧加成
          const wisdomPercentMatch = desc.match(/\+(\d+)%\s*智慧/);
          if (wisdomPercentMatch && wisdomPercentMatch[1]) {
            const percent = parseInt(wisdomPercentMatch[1]) / 100;
            calculatedAttributes.wisdom += Math.floor(calculatedAttributes.wisdom * percent);
          }
        }
        
        // 处理魔力加成
        if (desc.includes('魔力') || desc.includes('最大魔力')) {
          const manaMatch = desc.match(/\+(\d+)%\s*最大魔力/);
          if (manaMatch && manaMatch[1]) {
            const percent = parseInt(manaMatch[1]) / 100;
            calculatedAttributes.mana += Math.floor(calculatedAttributes.mana * percent);
          }
        }
      }
    });
    
    return calculatedAttributes;
  }, [selectedHero, selectedTalents]);

  // 当天赋改变时，重新计算属性 - 修复无限循环
  useEffect(() => {
    if (!selectedHero) return;
    
    // 使用当前的 attributes 作为基础，而不是依赖 attributes 状态
    setAttributes(prevAttributes => calculateTalentBonuses(prevAttributes));
  }, [selectedTalents, selectedHero, calculateTalentBonuses]);

  // 处理英雄选择 - 使用 useCallback 优化
  const handleHeroSelect = useCallback((hero) => {
    setSelectedHero(hero);
    // 重置已选天赋
    setSelectedTalents([]);
  }, []);

  // 处理天赋选择 - 使用 useCallback 优化
  const handleTalentSelect = useCallback((talents) => {
    setSelectedTalents(talents);
  }, []);

  // 处理装备选择 - 使用 useCallback 优化
  const handleEquipmentChange = useCallback((equipment) => {
    setSelectedEquipment(equipment);
    // 在这里可以处理装备对属性的影响
    // 类似于处理天赋对属性的影响
  }, []);

  // 计算属性百分比 - 使用 useCallback 优化
  const calculateAttributePercentage = useCallback((attribute) => {
    const maxValues = {
      strength: 200,
      dexterity: 200,
      wisdom: 200,
      mana: 200
    };
    
    return (attributes[attribute] / maxValues[attribute]) * 100;
  }, [attributes]);

  // 计算伤害 - 使用 useMemo 优化
  const damage = useMemo(() => {
    if (!selectedHero) return { base: 0, critRate: 0, critDamage: 0, attackSpeed: 0, dps: 0 };
    
    // 基础伤害计算
    let baseDamage = 100;
    
    // 根据主属性增加基础伤害
    const heroType = selectedHero.name.split('|')[1] || '';
    if (heroType.includes('怒火') || heroType.includes('战火')) {
      baseDamage += attributes.strength * 2;
    } else if (heroType.includes('猎') || heroType.includes('影')) {
      baseDamage += attributes.dexterity * 2;
    } else if (heroType.includes('焰') || heroType.includes('冰')) {
      baseDamage += attributes.wisdom * 2;
    }
    
    // 应用天赋加成
    selectedTalents.forEach(talent => {
      const desc = talent.desc;
      
      // 解析伤害加成
      if (desc.includes('伤害')) {
        const damageMatch = desc.match(/\+(\d+)%\s*伤害/);
        if (damageMatch && damageMatch[1]) {
          baseDamage *= (1 + parseInt(damageMatch[1]) / 100);
        }
        
        // 解析元素伤害加成
        const elementalMatch = desc.match(/\+(\d+)%\s*元素伤害/);
        if (elementalMatch && elementalMatch[1] && 
            (heroType.includes('焰') || heroType.includes('冰') || heroType.includes('元素'))) {
          baseDamage *= (1 + parseInt(elementalMatch[1]) / 100);
        }
      }
    });
    
    // 暴击率和暴击伤害
    let critRate = 5 + attributes.dexterity * 0.1;
    let critDamage = 150 + attributes.strength * 0.2;
    
    // 从天赋中加入暴击率和暴击伤害的修正
    selectedTalents.forEach(talent => {
      const desc = talent.desc;
      
      // 暴击率加成
      if (desc.includes('暴击值')) {
        const critRateMatch = desc.match(/\+(\d+)%\s*暴击值/);
        if (critRateMatch && critRateMatch[1]) {
          critRate += parseInt(critRateMatch[1]);
        }
      }
      
      // 暴击伤害加成
      if (desc.includes('暴击伤害')) {
        const critDamageMatch = desc.match(/\+(\d+)%\s*暴击伤害/);
        if (critDamageMatch && critDamageMatch[1]) {
          critDamage += parseInt(critDamageMatch[1]);
        }
      }
    });
    
    // 攻击速度
    let attackSpeed = 1 + attributes.dexterity * 0.005;
    
    // 从天赋中加入攻击速度修正
    selectedTalents.forEach(talent => {
      const desc = talent.desc;
      
      if (desc.includes('攻击与施法速度')) {
        const speedMatch = desc.match(/\+(\d+)%\s*攻击与施法速度/);
        if (speedMatch && speedMatch[1]) {
          attackSpeed *= (1 + parseInt(speedMatch[1]) / 100);
        }
      }
    });
    
    // 每秒伤害
    let dps = baseDamage * attackSpeed * (1 + (critRate / 100) * (critDamage / 100 - 1));
    
    return {
      base: Math.round(baseDamage),
      critRate: Math.min(Math.round(critRate), 100),
      critDamage: Math.round(critDamage),
      attackSpeed: attackSpeed.toFixed(2),
      dps: Math.round(dps)
    };
  }, [selectedHero, attributes, selectedTalents]);

  // 渲染内容 - 使用 useCallback 优化
  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'build':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 英雄选择区域 */}
            <div className="lg:col-span-1">
              <HeroSelector 
                heroes={heroes} 
                onHeroSelect={handleHeroSelect}
                loading={loading}
                error={error}
              />
              
              {/* 属性分配 */}
              {selectedHero && (
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg mt-6">
                  <h2 className="text-xl font-bold mb-4 text-amber-400">属性分配</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">力量</span>
                        <span className="bg-amber-600 px-2 py-1 rounded text-sm">{attributes.strength}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full" 
                          style={{ width: `${calculateAttributePercentage('strength')}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">敏捷</span>
                        <span className="bg-amber-600 px-2 py-1 rounded text-sm">{attributes.dexterity}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full" 
                          style={{ width: `${calculateAttributePercentage('dexterity')}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">智慧</span>
                        <span className="bg-amber-600 px-2 py-1 rounded text-sm">{attributes.wisdom}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full" 
                          style={{ width: `${calculateAttributePercentage('wisdom')}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">魔力</span>
                        <span className="bg-amber-600 px-2 py-1 rounded text-sm">{attributes.mana}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full" 
                          style={{ width: `${calculateAttributePercentage('mana')}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 天赋选择区域 */}
            <div className="lg:col-span-2">
              <TalentSelector 
                selectedHero={selectedHero}
                onTalentSelect={handleTalentSelect}
              />
            </div>
            
            {/* 右侧 - 装备和伤害统计 */}
            <div className="lg:col-span-1">
              {/* 英雄描述 */}
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
                <h2 className="text-xl font-bold mb-4 text-amber-400">英雄特性</h2>
                <div className="bg-gray-700 p-3 rounded-lg">
                  {selectedHero ? (
                    <>
                      <h3 className="font-semibold mb-2">{selectedHero.name}</h3>
                      <p className="text-sm">{selectedHero.desc || '暂无描述'}</p>
                    </>
                  ) : (
                    <p className="text-sm">选择一个英雄查看其特性描述...</p>
                  )}
                </div>
              </div>
              
              {/* 已选天赋摘要 - 已移到天赋选择器内部 */}
              
              {/* 装备选择 */}
              <EquipmentSelector 
                selectedHero={selectedHero}
                onEquipmentChange={handleEquipmentChange}
              />
              
              {/* 伤害统计 */}
              {selectedHero && (
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg mt-6">
                  <h2 className="text-xl font-bold mb-4 text-amber-400">伤害统计</h2>
                  <div className="space-y-3">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>基础伤害</span>
                        <span className="text-amber-400">{damage.base}</span>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>暴击率</span>
                        <span className="text-amber-400">{damage.critRate}%</span>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>暴击伤害</span>
                        <span className="text-amber-400">{damage.critDamage}%</span>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>攻击速度</span>
                        <span className="text-amber-400">{damage.attackSpeed}</span>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>每秒伤害</span>
                        <span className="text-amber-400">{damage.dps}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'guide':
        return (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-amber-400">游戏攻略</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p>游戏攻略内容正在建设中...</p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">热门攻略</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>新手入门指南</li>
                  <li>职业选择建议</li>
                  <li>装备搭配技巧</li>
                  <li>天赋加点推荐</li>
                  <li>副本通关攻略</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-amber-400">游戏数据</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p>游戏数据查询功能正在建设中...</p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">可查询数据</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>装备数据库</li>
                  <li>技能效果详解</li>
                  <li>怪物图鉴</li>
                  <li>地图资源分布</li>
                  <li>材料获取途径</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, heroes, selectedHero, loading, error, attributes, handleHeroSelect, calculateAttributePercentage, handleTalentSelect, handleEquipmentChange, damage]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="container mx-auto">
        {/* 头部区域 */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold text-amber-400 mb-4 md:mb-0">火炬之光：无限 构建工具</h1>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                保存构建
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                加载构建
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                分享构建
              </button>
            </div>
          </div>
          
          {/* 导航标签页 */}
          <nav className="mt-6 border-b border-gray-700">
            <ul className="flex space-x-4">
              <li>
                <button 
                  className={`px-4 py-2 ${activeTab === 'build' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-300 hover:text-gray-100'}`}
                  onClick={() => setActiveTab('build')}
                >
                  构建工具
                </button>
              </li>
              <li>
                <button 
                  className={`px-4 py-2 ${activeTab === 'guide' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-300 hover:text-gray-100'}`}
                  onClick={() => setActiveTab('guide')}
                >
                  游戏攻略
                </button>
              </li>
              <li>
                <button 
                  className={`px-4 py-2 ${activeTab === 'data' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-300 hover:text-gray-100'}`}
                  onClick={() => setActiveTab('data')}
                >
                  数据查询
                </button>
              </li>
            </ul>
          </nav>
        </header>
        
        {/* 主要内容区域 */}
        {renderContent()}
        
        {/* 底部区域 */}
        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>火炬之光：无限 构建工具 © 2023 - 本工具仅供游戏爱好者使用，与官方无关</p>
          <p className="mt-2">数据来源于游戏内容，如有错误请反馈</p>
        </footer>
      </div>
    </main>
  );
}
