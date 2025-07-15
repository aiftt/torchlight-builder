'use client'

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HeroSelector from '@/components/HeroSelector';
import TalentSelector from '@/components/TalentSelector';

export default function Home() {
  // 状态管理
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
  const [selectedHeroFeatures, setSelectedHeroFeatures] = useState([]);  
  const [heroSkills, setHeroSkills] = useState([]);
  const [activeTab, setActiveTab] = useState('hero');
  const [baseWeaponDamage, setBaseWeaponDamage] = useState(100);
  
  // 伤害加成数据
  const [heroDamageBonus, setHeroDamageBonus] = useState({ normal: 0, extra: [] });
  const [talentDamageBonus, setTalentDamageBonus] = useState({ normal: 0, extra: [] });
  const [equipmentDamageBonus, setEquipmentDamageBonus] = useState({ normal: 0, extra: [] });
  const [petDamageBonus, setPetDamageBonus] = useState({ normal: 0, extra: [] });
  const [skillDamageBonus, setSkillDamageBonus] = useState({ normal: 0, extra: [] });

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

  // 当英雄变化时，加载英雄特性数据
  useEffect(() => {
    async function loadHeroSkills() {
      if (selectedHero && selectedHero.key) {
        try {
          const response = await fetch('/json/skills.json');
          if (!response.ok) {
            throw new Error(`获取英雄特性数据失败: ${response.status}`);
          }
          const skillsData = await response.json();
          
          // 获取当前英雄的特性数据
          const heroSkillsData = skillsData[selectedHero.key] || [];
          setHeroSkills(heroSkillsData);
          
          // 提取英雄特性提供的伤害加成
          let normalBonus = 0;
          let extraBonuses = [];
          
          if (heroSkillsData.length > 0) {
            const baseSkill = heroSkillsData[0]; // 基础特性
            if (baseSkill && baseSkill.description) {
              const descText = baseSkill.description.join(' ');
              
              // 解析普通伤害加成
              const normalDamageMatch = descText.match(/额外\s*\+(\d+)%\s*伤害/);
              if (normalDamageMatch && normalDamageMatch[1]) {
                normalBonus += parseInt(normalDamageMatch[1]);
              }
              
              // 解析可能的额外伤害加成
              const extraDamageMatches = descText.match(/额外\s*\+(\d+)%\s*([^，。]+?伤害)/g);
              if (extraDamageMatches) {
                extraDamageMatches.forEach(match => {
                  const detailMatch = match.match(/额外\s*\+(\d+)%\s*([^，。]+?伤害)/);
                  if (detailMatch && detailMatch[1] && detailMatch[2] && !detailMatch[2].startsWith('伤害')) {
                    extraBonuses.push({
                      value: parseInt(detailMatch[1]),
                      type: detailMatch[2]
                    });
                  }
                });
              }
            }
          }
          
          setHeroDamageBonus({ normal: normalBonus, extra: extraBonuses });
        } catch (error) {
          console.error('加载英雄特性数据出错:', error);
        }
      }
    }

    loadHeroSkills();
  }, [selectedHero]);

  // 当天赋变化时，计算天赋带来的伤害加成
  useEffect(() => {
    let normalBonus = 0;
    let extraBonuses = [];

    selectedTalents.forEach(talent => {
      if (talent.desc) {
        // 解析普通伤害加成
        const damageMatch = talent.desc.match(/\+(\d+)%\s*伤害/);
        if (damageMatch && damageMatch[1]) {
          normalBonus += parseInt(damageMatch[1]);
        }
        
        // 解析元素伤害等特定类型伤害
        const elementalMatch = talent.desc.match(/\+(\d+)%\s*(元素|火焰|冰冷|闪电)伤害/);
        if (elementalMatch && elementalMatch[1] && elementalMatch[2]) {
          extraBonuses.push({
            value: parseInt(elementalMatch[1]),
            type: `${elementalMatch[2]}伤害`
          });
        }
      }
    });

    setTalentDamageBonus({ normal: normalBonus, extra: extraBonuses });
  }, [selectedTalents]);

  // 处理英雄选择
  const handleHeroSelect = (hero) => {
    setSelectedHero(hero);
  };

  // 处理天赋选择
  const handleTalentSelect = (talents) => {
    setSelectedTalents(talents);
  };

  // 计算总伤害
  const calculateTotalDamage = () => {
    // 所有普通百分比伤害加成相加
    const normalBonusPercent = (
      heroDamageBonus.normal + 
      talentDamageBonus.normal + 
      equipmentDamageBonus.normal + 
      petDamageBonus.normal + 
      skillDamageBonus.normal
    ) / 100;
    
    // 所有额外伤害乘区相乘
    const allExtraBonuses = [
      ...heroDamageBonus.extra,
      ...talentDamageBonus.extra,
      ...equipmentDamageBonus.extra,
      ...petDamageBonus.extra,
      ...skillDamageBonus.extra
    ];
    
    let extraMultiplier = 1;
    allExtraBonuses.forEach(bonus => {
      extraMultiplier *= (1 + bonus.value / 100);
    });

    // 基础伤害 * (1 + 普通百分比加成) * 额外乘区
    return baseWeaponDamage * (1 + normalBonusPercent) * extraMultiplier;
  };

  // 渲染伤害来源明细
  const renderDamageSourceDetail = (sourceTitle, sourceData) => {
    return (
      <div className="bg-gray-700 p-3 rounded-md mb-3">
        <h4 className="text-amber-400 font-semibold mb-2">{sourceTitle}伤害加成</h4>
        <div className="text-sm space-y-1">
          {sourceData.normal > 0 && (
            <p>普通伤害: +{sourceData.normal}%</p>
          )}
          {sourceData.extra.length > 0 && (
            <div>
              <p className="text-xs text-amber-300">额外伤害加成:</p>
              <ul className="list-disc pl-5">
                {sourceData.extra.map((bonus, index) => (
                  <li key={index}>
                    {bonus.type}: +{bonus.value}%
                  </li>
                ))}
              </ul>
            </div>
          )}
          {sourceData.normal === 0 && sourceData.extra.length === 0 && (
            <p className="text-gray-400">无伤害加成</p>
          )}
        </div>
      </div>
    );
  };
  
  // 计算最终伤害值
  const totalDamage = calculateTotalDamage();

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="container mx-auto">
        {/* 页面标题 */}
        <h1 className="text-2xl font-bold text-amber-400 mb-6">火炬之光：无限 伤害计算器</h1>

        {/* 伤害计算Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Tabs区域 */}
          <Tabs defaultValue="hero" value={activeTab} onValueChange={setActiveTab}>
            {/* Tab标题 */}
            <TabsList className="w-full flex">
              <TabsTrigger value="hero" className="flex-1 py-3 px-4">英雄特性</TabsTrigger>
              <TabsTrigger value="talent" className="flex-1 py-3 px-4">天赋</TabsTrigger>
              <TabsTrigger value="equipment" className="flex-1 py-3 px-4">装备</TabsTrigger>
              <TabsTrigger value="pet" className="flex-1 py-3 px-4">契灵(宠物)</TabsTrigger>
              <TabsTrigger value="skill" className="flex-1 py-3 px-4">技能+魂烛</TabsTrigger>
            </TabsList>
            
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧和中间 - 当前选中Tab的内容 */}
                <div className="lg:col-span-2">
                  {/* 英雄特性Tab内容 */}
                  <TabsContent value="hero" className="mt-0">
                    <div className="bg-gray-800 p-4 rounded-md">
                      {/* 集成英雄选择到英雄特性标签页 */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-amber-400">选择英雄</h3>
                        <HeroSelector 
                          heroes={heroes} 
                          onHeroSelect={handleHeroSelect} 
                          loading={loading} 
                          error={error} 
                        />
                      </div>
                      
                      <div className="border-t border-gray-600 my-6 pt-6">
                        <h3 className="text-lg font-semibold mb-3 text-amber-400">英雄特性</h3>
                        
                        {selectedHero ? (
                          <div>
                            {/* 显示已选英雄信息 */}
                            <div className="bg-gray-700 rounded-lg p-4 shadow-lg mb-4">
                              <h4 className="font-medium mb-2 text-amber-300">已选英雄: {selectedHero.name}</h4>
                              <div className="flex items-center space-x-3 mb-2">
                                {selectedHero.avatar && (
                                  <img 
                                    src={selectedHero.avatar} 
                                    alt={selectedHero.name} 
                                    className="w-12 h-12 rounded-full"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm text-gray-200">{selectedHero.desc}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="font-medium mb-2 text-amber-300">基础特性</h4>
                              {heroSkills.length > 0 ? (
                                <div className="bg-gray-700 p-3 rounded-md">
                                  <div className="text-amber-400">{heroSkills[0]?.name}</div>
                                  <div className="text-sm mt-2">
                                    {heroSkills[0]?.description?.join(' ')}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-400">该英雄没有特性数据</p>
                              )}
                            </div>
                            
                            {heroSkills.length > 1 && (
                              <div>
                                <h4 className="font-medium mb-2 text-amber-300">高级特性 (等级45+)</h4>
                                <div className="space-y-2">
                                  {heroSkills.filter(skill => skill.level >= 45 && skill.level < 60).map((skill, index) => (
                                    <div key={index} className="bg-gray-700 p-3 rounded-md">
                                      <div className="text-amber-400">{skill.name} (Lv.{skill.level})</div>
                                      <div className="text-sm mt-2">
                                        {skill.description?.join(' ')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-400">请先选择一个英雄</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* 天赋Tab内容 */}
                  <TabsContent value="talent" className="mt-0">
                    <TalentSelector
                      selectedHero={selectedHero}
                      onTalentSelect={handleTalentSelect}
                    />
                  </TabsContent>
                  
                  {/* 装备Tab内容 */}
                  <TabsContent value="equipment" className="mt-0">
                    <div className="bg-gray-800 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-3">装备</h3>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">基础武器伤害</label>
                        <input
                          type="number"
                          value={baseWeaponDamage}
                          onChange={(e) => setBaseWeaponDamage(Math.max(1, parseInt(e.target.value) || 0))}
                          className="bg-gray-700 text-white p-2 rounded-md w-full"
                        />
                      </div>
                      <div className="bg-gray-700 p-3 rounded-md">
                        <p className="text-gray-400">装备系统正在建设中...</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* 契灵Tab内容 */}
                  <TabsContent value="pet" className="mt-0">
                    <div className="bg-gray-800 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-3">契灵与命运</h3>
                      <div className="bg-gray-700 p-3 rounded-md">
                        <p className="text-gray-400">契灵系统正在建设中...</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* 技能Tab内容 */}
                  <TabsContent value="skill" className="mt-0">
                    <div className="bg-gray-800 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-3">技能与魂烛</h3>
                      <div className="bg-gray-700 p-3 rounded-md">
                        <p className="text-gray-400">技能系统正在建设中...</p>
                      </div>
                    </div>
                  </TabsContent>
                </div>
                
                {/* 右侧 - 伤害计算结果面板 */}
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 sticky top-4">
                    <h3 className="text-lg font-bold mb-4 text-amber-400 border-b border-amber-400 pb-2">伤害汇总</h3>
                    
                    <div className="space-y-3">
                      {/* 基础伤害 */}
                      <div className="flex justify-between">
                        <span>基础伤害:</span>
                        <span className="font-semibold">{baseWeaponDamage}</span>
                      </div>
                      
                      {/* 总伤害 */}
                      <div className="flex justify-between text-lg text-amber-400 border-t border-amber-400 pt-2 mt-2">
                        <span>总计伤害:</span>
                        <span className="font-bold">{Math.round(totalDamage * 100) / 100}</span>
                      </div>
                      
                      <div className="border-t border-gray-600 pt-3 mt-3">
                        <h4 className="text-md font-semibold mb-2">伤害加成明细</h4>
                        
                        {renderDamageSourceDetail("英雄特性", heroDamageBonus)}
                        {renderDamageSourceDetail("天赋", talentDamageBonus)}
                        {renderDamageSourceDetail("装备", equipmentDamageBonus)}
                        {renderDamageSourceDetail("契灵", petDamageBonus)}
                        {renderDamageSourceDetail("技能", skillDamageBonus)}
                        
                        <div className="bg-gray-800 p-3 rounded-md mt-3">
                          <h4 className="text-amber-400 font-semibold mb-2">计算公式</h4>
                          <div className="text-xs text-gray-300">
                            <p>普通百分比加成: {heroDamageBonus.normal + talentDamageBonus.normal + equipmentDamageBonus.normal + petDamageBonus.normal + skillDamageBonus.normal}%</p>
                            <p>额外加成倍率: {Math.round((totalDamage / (baseWeaponDamage * (1 + (heroDamageBonus.normal + talentDamageBonus.normal + equipmentDamageBonus.normal + petDamageBonus.normal + skillDamageBonus.normal) / 100)) - 1) * 10000) / 100}%</p>
                            <p className="mt-1">伤害 = 基础伤害 × (1 + 普通百分比加成) × (1 + 额外加成1) × (1 + 额外加成2)...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </div>

        {/* 页脚 */}
        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>火炬之光：无限 构建工具 © 2023 - 本工具仅供游戏爱好者使用，与官方无关</p>
        </footer>
      </div>
    </main>
  );
}
