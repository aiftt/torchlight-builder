'use client'

import { useState, useEffect } from 'react';
import { loadAllTalents, mapHeroClassToTalentClass } from '@/utils/talentLoader';

export default function TalentSelector({ selectedHero, onTalentSelect }) {
  const [allTalentData, setAllTalentData] = useState(null);
  const [availableTalentClasses, setAvailableTalentClasses] = useState([]);
  const [activeTalentClass, setActiveTalentClass] = useState(null);
  const [talentData, setTalentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTalents, setSelectedTalents] = useState([]);
  const [availablePoints, setAvailablePoints] = useState(20); // 增加可用点数，因为现在可以选择多个天赋大类

  // 加载所有天赋数据
  useEffect(() => {
    async function fetchAllTalents() {
      setLoading(true);
      try {
        const talents = await loadAllTalents();
        setAllTalentData(talents);
        setLoading(false);
      } catch (error) {
        console.error("加载天赋数据失败:", error);
        setError("无法加载天赋数据");
        setLoading(false);
      }
    }

    fetchAllTalents();
  }, []);

  // 当选择英雄或加载所有天赋数据后，确定可用的天赋大类
  useEffect(() => {
    if (!selectedHero || !allTalentData) return;

    try {
      // 获取英雄的基础职业，假设格式为 "英雄名|职业名"
      const heroClass = selectedHero.name.split('|')[1]?.trim() || '';
      
      // 使用映射函数找到对应的天赋职业
      const primaryTalentClass = mapHeroClassToTalentClass(heroClass);
      
      // 确定可用的天赋大类
      const talentClasses = [];
      
      // 添加主要职业天赋
      if (primaryTalentClass && allTalentData[primaryTalentClass]) {
        talentClasses.push(primaryTalentClass);
      }
      
      // 添加通用天赋大类
      const commonTalentClasses = ['勇者', '征战之神', '知识之神', '狩猎之神', '欺诈之神', '巨力之神', '机械之神'];
      commonTalentClasses.forEach(className => {
        if (allTalentData[className] && className !== primaryTalentClass) {
          talentClasses.push(className);
        }
      });
      
      // 设置可用天赋大类
      setAvailableTalentClasses(talentClasses);
      
      // 设置默认选中的天赋大类
      if (talentClasses.length > 0) {
        setActiveTalentClass(talentClasses[0]);
        
        // 为当前选中的天赋大类添加唯一ID
        const talentsWithIds = {
          ...allTalentData[talentClasses[0]],
          talents: allTalentData[talentClasses[0]].talents.map((talent, index) => ({
            ...talent,
            id: `${talentClasses[0]}-${talent.name}-${index}`
          }))
        };
        setTalentData(talentsWithIds);
      } else {
        setError("未找到可用的天赋大类");
      }
    } catch (err) {
      console.error(`选择天赋数据失败: ${err.message}`);
      setError(`无法加载天赋数据: ${err.message}`);
    }
    
    // 重置已选天赋
    setSelectedTalents([]);
    setAvailablePoints(20);
  }, [selectedHero, allTalentData]);

  // 切换天赋大类
  const switchTalentClass = (talentClassName) => {
    if (allTalentData && allTalentData[talentClassName]) {
      setActiveTalentClass(talentClassName);
      
      // 为当前选中的天赋大类添加唯一ID
      const talentsWithIds = {
        ...allTalentData[talentClassName],
        talents: allTalentData[talentClassName].talents.map((talent, index) => ({
          ...talent,
          id: `${talentClassName}-${talent.name}-${index}`
        }))
      };
      setTalentData(talentsWithIds);
    }
  };

  // 选择或取消选择天赋
  const toggleTalent = (talent) => {
    // 检查天赋是否已经被选择，使用唯一ID进行比较
    const isSelected = selectedTalents.some(t => t.id === talent.id);
    
    if (isSelected) {
      // 如果已选择，则移除
      const updatedTalents = selectedTalents.filter(t => t.id !== talent.id);
      setSelectedTalents(updatedTalents);
      setAvailablePoints(availablePoints + 1);
      
      // 通知父组件
      if (onTalentSelect) {
        onTalentSelect(updatedTalents);
      }
    } else if (availablePoints > 0) {
      // 如果有可用点数，则添加
      const updatedTalents = [...selectedTalents, talent];
      setSelectedTalents(updatedTalents);
      setAvailablePoints(availablePoints - 1);
      
      // 通知父组件
      if (onTalentSelect) {
        onTalentSelect(updatedTalents);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-400">天赋树</h2>
        <div className="flex justify-center items-center h-40">
          <p>加载天赋数据中...</p>
        </div>
      </div>
    );
  }

  if (error && !talentData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-400">天赋树</h2>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedHero || !talentData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-400">天赋树</h2>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p>请先选择一个英雄来查看天赋树</p>
        </div>
      </div>
    );
  }

  // 渲染天赋树
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-amber-400">天赋树</h2>
        <span className="bg-amber-600 px-3 py-1 rounded text-sm">
          可用点数: {availablePoints}
        </span>
      </div>
      
      {error && (
        <div className="bg-gray-700 p-2 rounded-lg mb-4">
          <p className="text-yellow-400 text-xs">{error}</p>
        </div>
      )}
      
      {/* 天赋大类标签页 */}
      <div className="mb-4 border-b border-gray-700">
        <div className="flex overflow-x-auto pb-2 custom-scrollbar">
          {availableTalentClasses.map((className) => (
            <button
              key={className}
              className={`px-4 py-2 mr-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
                activeTalentClass === className
                  ? 'bg-gray-700 text-amber-400'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => switchTalentClass(className)}
            >
              {className}
            </button>
          ))}
        </div>
      </div>
      
      {/* 核心天赋 */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-amber-400">核心天赋</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {talentData.talents && talentData.talents.slice(0, 6).map((talent, index) => (
            <div 
              key={talent.id || index}
              className={`bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition ${
                selectedTalents.some(t => t.id === talent.id) ? 'ring-2 ring-amber-500' : ''
              }`}
              onClick={() => toggleTalent(talent)}
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full overflow-hidden mr-2">
                  {talent.img && <img src={talent.img} alt={talent.name} className="w-full h-full object-cover" />}
                </div>
                <h4 className="font-medium text-sm">{talent.name}</h4>
              </div>
              <p className="text-xs text-gray-300">{talent.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* 小型和中型天赋 - 添加固定高度和滚动条 */}
      <div>
        <h3 className="font-semibold mb-2 text-amber-400">常规天赋</h3>
        <div className="h-64 overflow-y-auto pr-2 custom-scrollbar py-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {talentData.talents && talentData.talents.slice(6).map((talent, index) => (
              <div 
                key={talent.id || (index + 6)}
                className={`bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition ${
                  selectedTalents.some(t => t.id === talent.id) ? 'ring-2 ring-amber-500' : ''
                }`}
                onClick={() => toggleTalent(talent)}
              >
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full overflow-hidden mr-2">
                    {talent.img && <img src={talent.img} alt={talent.name} className="w-full h-full object-cover" />}
                  </div>
                  <h4 className="font-medium text-sm">{talent.name}</h4>
                </div>
                <p className="text-xs text-gray-300">{talent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 已选天赋摘要 */}
      {selectedTalents.length > 0 && (
        <div className="mt-6 bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">已选天赋 ({selectedTalents.length})</h3>
          <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="text-sm">
              {selectedTalents.map((talent, index) => {
                // 提取天赋描述中的数值
                const extractValue = (desc) => {
                  // 匹配常见的数值模式，如 +10%、+5 等
                  const matches = desc.match(/\+(\d+\.?\d*)%?/g) || [];
                  return matches.length > 0 ? matches[0] : '';
                };
                
                const valueText = extractValue(talent.desc);
                
                return (
                  <li key={talent.id || index} className="mb-1 flex items-start">
                    <span className="text-amber-400 mr-1">[{talent.belong || activeTalentClass}]</span>
                    <span className="mr-1">{talent.name}</span>
                    {valueText && <span className="text-green-400 mr-1">{valueText}</span>}
                    <span className="text-gray-300">: {talent.desc}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 