'use client'

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DamageCalculator = ({ 
  selectedHero, 
  selectedTalents, 
  selectedEquipment, 
  attributes
}) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('hero');
  const [baseWeaponDamage, setBaseWeaponDamage] = useState(100); // 默认基础伤害
  
  // 各个来源的伤害加成
  const [heroDamageBonus, setHeroDamageBonus] = useState({ normal: 0, extra: [] });
  const [talentDamageBonus, setTalentDamageBonus] = useState({ normal: 0, extra: [] });
  const [equipmentDamageBonus, setEquipmentDamageBonus] = useState({ normal: 0, extra: [] });
  const [petDamageBonus, setPetDamageBonus] = useState({ normal: 0, extra: [] });
  const [skillDamageBonus, setSkillDamageBonus] = useState({ normal: 0, extra: [] });
  const [heroSkills, setHeroSkills] = useState([]);

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

  // 当装备变化时，计算装备带来的伤害加成
  useEffect(() => {
    // 这里将来可以根据选中的装备计算加成
    // 目前先使用空值
    setEquipmentDamageBonus({ normal: 0, extra: [] });
  }, [selectedEquipment]);

  // 计算总伤害
  const totalDamage = useMemo(() => {
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
  }, [
    baseWeaponDamage,
    heroDamageBonus, 
    talentDamageBonus, 
    equipmentDamageBonus, 
    petDamageBonus, 
    skillDamageBonus
  ]);

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
  
  // 渲染英雄特性Tab内容
  const renderHeroTab = () => {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-3">英雄特性</h3>
        {selectedHero ? (
          <div>
            <div className="mb-4">
              <h4 className="font-medium mb-2">基础特性</h4>
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
                <h4 className="font-medium mb-2">高级特性 (等级45+)</h4>
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
    );
  };

  // 渲染天赋Tab内容
  const renderTalentTab = () => {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-3">已选择的天赋</h3>
        {selectedTalents.length > 0 ? (
          <div className="space-y-2">
            {selectedTalents.map((talent, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded-md">
                <div className="flex items-center">
                  {talent.img && (
                    <img 
                      src={talent.img} 
                      alt={talent.name} 
                      className="w-8 h-8 mr-2 rounded-full"
                    />
                  )}
                  <div>
                    <div className="text-amber-400">{talent.name}</div>
                    <div className="text-sm">{talent.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">尚未选择任何天赋</p>
        )}
      </div>
    );
  };

  // 渲染装备Tab内容
  const renderEquipmentTab = () => {
    return (
      <div>
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
          <p className="text-gray-400">暂未实现装备选择功能</p>
        </div>
      </div>
    );
  };

  // 渲染契灵Tab内容
  const renderPetTab = () => {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-3">契灵与命运</h3>
        <div className="bg-gray-700 p-3 rounded-md">
          <p className="text-gray-400">契灵系统尚未实现</p>
        </div>
      </div>
    );
  };

  // 渲染技能Tab内容
  const renderSkillTab = () => {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-3">技能与魂烛</h3>
        <div className="bg-gray-700 p-3 rounded-md">
          <p className="text-gray-400">技能系统尚未实现</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mt-4">
      <h2 className="text-xl font-bold mb-4 text-amber-400">伤害计算</h2>
      
      {/* 将标签栏放在顶部 */}
      <Tabs defaultValue="hero" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4 p-0 border-b-0">
          <TabsTrigger value="hero" className="flex-1 py-2 px-4">英雄特性</TabsTrigger>
          <TabsTrigger value="talent" className="flex-1 py-2 px-4">天赋</TabsTrigger>
          <TabsTrigger value="equipment" className="flex-1 py-2 px-4">装备</TabsTrigger>
          <TabsTrigger value="pet" className="flex-1 py-2 px-4">契灵(宠物)</TabsTrigger>
          <TabsTrigger value="skill" className="flex-1 py-2 px-4">技能+魂烛</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧内容区域 */}
          <div className="lg:w-3/5 w-full">
            <TabsContent value="hero" className="bg-gray-800 p-4 rounded-md">
              {renderHeroTab()}
            </TabsContent>
            
            <TabsContent value="talent" className="bg-gray-800 p-4 rounded-md">
              {renderTalentTab()}
            </TabsContent>
            
            <TabsContent value="equipment" className="bg-gray-800 p-4 rounded-md">
              {renderEquipmentTab()}
            </TabsContent>
            
            <TabsContent value="pet" className="bg-gray-800 p-4 rounded-md">
              {renderPetTab()}
            </TabsContent>
            
            <TabsContent value="skill" className="bg-gray-800 p-4 rounded-md">
              {renderSkillTab()}
            </TabsContent>
          </div>
          
          {/* 右侧伤害计算面板 */}
          <div className="lg:w-2/5 w-full bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4 text-amber-400 border-b border-amber-400 pb-2">已选伤害汇总</h3>
            
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
                <h4 className="text-lg font-semibold mb-2">伤害加成明细</h4>
                
                {renderDamageSourceDetail("英雄特性", heroDamageBonus)}
                {renderDamageSourceDetail("天赋", talentDamageBonus)}
                {renderDamageSourceDetail("装备", equipmentDamageBonus)}
                {renderDamageSourceDetail("契灵", petDamageBonus)}
                {renderDamageSourceDetail("技能", skillDamageBonus)}
                
                <div className="bg-gray-700 p-3 rounded-md mt-3">
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
      </Tabs>
    </div>
  );
};

export default DamageCalculator; 