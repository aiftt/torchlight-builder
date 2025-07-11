'use client'

import Layout from '@/components/Layout';
import TalentSelector from '@/components/TalentSelector';
import { useState, useEffect } from 'react';
import heroData from '@/json/hero.json';

export default function Home() {
  const [heroes, setHeroes] = useState(heroData);
  const [selectedHero, setSelectedHero] = useState(null);
  const [selectedTraits, setSelectedTraits] = useState({});
  const [selectedTalents, setSelectedTalents] = useState([]);
  const [attributes, setAttributes] = useState({
    strength: 100,
    dexterity: 80,
    wisdom: 60,
    mana: 120
  });
  const [equipment, setEquipment] = useState({
    weapon: null,
    helmet: null,
    armor: null,
    gloves: null,
    belt: null,
    boots: null,
    necklace: null,
    ring: null
  });

  // 当选择英雄时，重置已选特性和属性
  useEffect(() => {
    if (selectedHero) {
      // 初始化特性选择，默认选择第一个特性
      const initialTraits = {};
      // 获取所有特性等级
      const traitLevels = [...new Set(selectedHero.skills.map(skill => skill.level))];
      
      // 对于每个等级，默认选择该等级的第一个特性
      traitLevels.forEach(level => {
        const firstTraitOfLevel = selectedHero.skills.find(skill => skill.level === level);
        if (firstTraitOfLevel) {
          initialTraits[level] = firstTraitOfLevel.name;
        }
      });
      
      setSelectedTraits(initialTraits);
      
      // 根据英雄类型设置初始属性
      // 这里只是示例，实际应该根据英雄的基础属性来设置
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
      // 重置已选天赋
      setSelectedTalents([]);
    } else {
      setSelectedTraits({});
      setAttributes({
        strength: 100,
        dexterity: 80,
        wisdom: 60,
        mana: 120
      });
      setSelectedTalents([]);
    }
  }, [selectedHero]);

  // 当特性、天赋或装备改变时，重新计算属性
  useEffect(() => {
    if (!selectedHero) return;
    
    // 获取基础属性
    let calculatedAttributes = { ...attributes };
    
    // 应用特性加成
    Object.entries(selectedTraits).forEach(([level, traitName]) => {
      const trait = selectedHero.skills.find(skill => skill.name === traitName);
      if (trait) {
        // 这里应该解析特性描述，提取属性加成
        // 这只是一个简化的示例，实际应该有更复杂的解析逻辑
        const description = trait.description[0];
        
        if (description.includes('力量')) {
          calculatedAttributes.strength += 20;
        }
        if (description.includes('敏捷')) {
          calculatedAttributes.dexterity += 20;
        }
        if (description.includes('智慧')) {
          calculatedAttributes.wisdom += 20;
        }
        if (description.includes('魔力')) {
          calculatedAttributes.mana += 30;
        }
      }
    });
    
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
    
    // 应用装备加成
    Object.values(equipment).forEach(item => {
      if (item) {
        // 这里应该应用装备的属性加成
        // 由于我们没有实际的装备数据，这里只是一个示例
      }
    });
    
    setAttributes(calculatedAttributes);
  }, [selectedTraits, selectedTalents, equipment, selectedHero]);

  // 选择特性
  const selectTrait = (level, traitName) => {
    setSelectedTraits(prev => ({
      ...prev,
      [level]: traitName
    }));
  };

  // 处理天赋选择
  const handleTalentSelect = (talents) => {
    setSelectedTalents(talents);
  };

  // 获取特定等级的所有特性
  const getTraitsByLevel = (level) => {
    if (!selectedHero) return [];
    return selectedHero.skills.filter(skill => skill.level === level);
  };

  // 检查特性是否被选中
  const isTraitSelected = (level, traitName) => {
    return selectedTraits[level] === traitName;
  };

  // 计算属性百分比
  const calculateAttributePercentage = (attribute) => {
    const maxValues = {
      strength: 200,
      dexterity: 200,
      wisdom: 200,
      mana: 200
    };
    
    return (attributes[attribute] / maxValues[attribute]) * 100;
  };

  // 计算伤害
  const calculateDamage = () => {
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
    
    // 应用特性加成
    Object.entries(selectedTraits).forEach(([level, traitName]) => {
      const trait = selectedHero.skills.find(skill => skill.name === traitName);
      if (trait) {
        const description = trait.description[0];
        
        // 解析伤害加成
        // 这只是一个简化的示例
        if (description.includes('伤害')) {
          const match = description.match(/\+(\d+)%\s*伤害/);
          if (match && match[1]) {
            baseDamage *= (1 + parseInt(match[1]) / 100);
          }
        }
      }
    });
    
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
  };

  const damage = calculateDamage();

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amber-400">火炬之光：无限 构建工具</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧 - 职业选择 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-amber-400">选择职业</h2>
          {heroes.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {heroes.map((hero, index) => (
                <div 
                  key={index} 
                  className={`bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-amber-900 transition ${selectedHero === hero ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={() => setSelectedHero(hero)}
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
              <p>英雄数据加载失败</p>
            </div>
          )}
        </div>

        {/* 中间 - 技能和属性 */}
        <div className="lg:col-span-2">
          {/* 英雄特性选择 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4 text-amber-400">英雄特性</h2>
            {selectedHero ? (
              <div className="space-y-6">
                {/* 基础特性 - 1级 */}
                <div>
                  <h3 className="font-semibold mb-2 text-amber-400">基础特性 (1级)</h3>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    {getTraitsByLevel(1).map((trait, index) => (
                      <div key={index} className="mb-2">
                        <h4 className="font-medium">{trait.name}</h4>
                        <p className="text-sm text-gray-300">{trait.description[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 45级特性 */}
                {getTraitsByLevel(45).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-amber-400">45级特性 (选择一项)</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {getTraitsByLevel(45).map((trait, index) => (
                        <div 
                          key={index} 
                          className={`bg-gray-700 p-3 rounded-lg cursor-pointer ${isTraitSelected(45, trait.name) ? 'ring-2 ring-amber-500' : ''}`}
                          onClick={() => selectTrait(45, trait.name)}
                        >
                          <h4 className="font-medium">{trait.name}</h4>
                          <p className="text-sm text-gray-300">{trait.description[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 60级特性 */}
                {getTraitsByLevel(60).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-amber-400">60级特性 (选择一项)</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {getTraitsByLevel(60).map((trait, index) => (
                        <div 
                          key={index} 
                          className={`bg-gray-700 p-3 rounded-lg cursor-pointer ${isTraitSelected(60, trait.name) ? 'ring-2 ring-amber-500' : ''}`}
                          onClick={() => selectTrait(60, trait.name)}
                        >
                          <h4 className="font-medium">{trait.name}</h4>
                          <p className="text-sm text-gray-300">{trait.description[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 75级特性 */}
                {getTraitsByLevel(75).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-amber-400">75级特性 (选择一项)</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {getTraitsByLevel(75).map((trait, index) => (
                        <div 
                          key={index} 
                          className={`bg-gray-700 p-3 rounded-lg cursor-pointer ${isTraitSelected(75, trait.name) ? 'ring-2 ring-amber-500' : ''}`}
                          onClick={() => selectTrait(75, trait.name)}
                        >
                          <h4 className="font-medium">{trait.name}</h4>
                          <p className="text-sm text-gray-300">{trait.description[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-700 p-4 rounded-lg">
                <p>请先选择一个英雄来查看特性</p>
              </div>
            )}
          </div>

          {/* 天赋选择器 */}
          <TalentSelector 
            selectedHero={selectedHero} 
            onTalentSelect={handleTalentSelect} 
          />

          {/* 属性分配 */}
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
            <div className="mt-4">
              <h3 className="font-semibold mb-2">属性说明</h3>
              <div className="bg-gray-700 p-3 rounded-lg text-sm">
                <p><span className="text-amber-400">力量:</span> 每1点力量额外增加0.5%主属性包含力量的技能伤害</p>
                <p><span className="text-amber-400">敏捷:</span> 每1点敏捷额外增加0.5%主属性包含敏捷的技能伤害</p>
                <p><span className="text-amber-400">智慧:</span> 每1点智慧额外增加0.5%主属性包含智慧的技能伤害</p>
                <p><span className="text-amber-400">魔力:</span> 用于施放技能，初始40点，每升1级增加5点</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧 - 装备和伤害统计 */}
        <div>
          {/* 英雄描述 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4 text-amber-400">英雄特性</h2>
            <div className="bg-gray-700 p-3 rounded-lg">
              {selectedHero ? (
                <>
                  <h3 className="font-semibold mb-2">{selectedHero.name}</h3>
                  <p className="text-sm">{selectedHero.desc}</p>
                </>
              ) : (
                <p className="text-sm">选择一个英雄查看其特性描述...</p>
              )}
            </div>
          </div>
          
          {/* 已选特性摘要 */}
          {selectedHero && Object.keys(selectedTraits).length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4 text-amber-400">已选特性</h2>
              <div className="space-y-2">
                {Object.entries(selectedTraits).map(([level, traitName]) => (
                  <div key={level} className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="text-sm font-medium">{level}级: {traitName}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 已选天赋摘要 */}
          {selectedTalents.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4 text-amber-400">已选天赋</h2>
              <div className="space-y-2">
                {selectedTalents.map((talent, index) => (
                  <div key={talent.id || index} className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="text-sm font-medium">{talent.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 装备选择 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4 text-amber-400">装备选择</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">武器</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">头盔</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">胸甲</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">手套</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">腰带</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">鞋子</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">项链</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">戒指</p>
              </div>
            </div>
          </div>
          
          {/* 伤害统计 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
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
            <div className="mt-4">
              <h3 className="font-semibold mb-2">伤害类型分布</h3>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">火焰: 45%</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">冰冷: 25%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">物理: 30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部 - 构建保存和分享 */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-400">构建摘要</h2>
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 rounded-lg transition ${selectedHero 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : 'bg-gray-600 cursor-not-allowed'}`}
              disabled={!selectedHero}
            >
              保存构建
            </button>
            <button 
              className={`px-4 py-2 rounded-lg transition ${selectedHero 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-600 cursor-not-allowed'}`}
              disabled={!selectedHero}
            >
              分享构建
            </button>
          </div>
        </div>
        <div className="mt-4 bg-gray-700 p-4 rounded-lg">
          {selectedHero ? (
            <>
              <h3 className="font-semibold mb-2">{selectedHero.name} - 构建方案</h3>
              <p className="text-sm text-gray-300">
                已选择 {Object.keys(selectedTraits).length} 个特性，{selectedTalents.length} 个天赋。根据所选英雄特性和天赋，您可以创建一个专属构建方案。完成技能、属性和装备配置后，可以保存和分享您的构建。
              </p>
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-2">选择英雄构建</h3>
              <p className="text-sm text-gray-300">请选择一个英雄来创建构建方案。构建方案将包含技能、属性和装备配置，以及伤害统计分析。</p>
            </>
          )}
        </div>
    </div>
    </Layout>
  );
}
