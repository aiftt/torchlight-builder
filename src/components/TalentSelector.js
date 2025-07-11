'use client'

import { useState, useEffect, useRef } from 'react';
import { loadAllTalents, mapHeroClassToTalentClass, getMainTalents } from '@/utils/talentLoader';

export default function TalentSelector({ selectedHero, onTalentSelect }) {
  const [allTalentData, setAllTalentData] = useState(null);
  const [availableTalentClasses, setAvailableTalentClasses] = useState([]);
  const [activeTalentClass, setActiveTalentClass] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [talentData, setTalentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTalents, setSelectedTalents] = useState([]);
  const [availablePoints, setAvailablePoints] = useState(20);
  const [mainTalents, setMainTalents] = useState([]);
  
  // 用于滚动的引用
  const tabsContainerRef = useRef(null);

  // 加载所有天赋数据和主要天赋列表
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [talents, mainTalentsList] = await Promise.all([
          loadAllTalents(),
          getMainTalents()
        ]);
        
        setAllTalentData(talents);
        setMainTalents(mainTalentsList);
        setLoading(false);
      } catch (error) {
        console.error("加载数据失败:", error);
        setError("无法加载天赋数据");
        setLoading(false);
      }
    }

    fetchData();
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
      // 获取所有可用的天赋大类（从allTalentData的键中获取）
      const allAvailableTalentClasses = Object.keys(allTalentData);
      
      // 首先添加主要职业天赋（如果存在）
      const talentClasses = [];
      if (primaryTalentClass && allTalentData[primaryTalentClass]) {
        talentClasses.push(primaryTalentClass);
      }
      
      // 然后添加其他所有天赋大类
      allAvailableTalentClasses.forEach(className => {
        if (!talentClasses.includes(className)) {
          talentClasses.push(className);
        }
      });
      
      // 设置可用天赋大类
      setAvailableTalentClasses(talentClasses);
      setActiveTabIndex(0);
      
      // 设置默认选中的天赋大类
      if (talentClasses.length > 0) {
        const firstTalentClass = talentClasses[0];
        setActiveTalentClass(firstTalentClass);
        
        // 加载选中的天赋大类数据
        loadTalentClassData(firstTalentClass);
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

  // 加载特定天赋大类的数据
  const loadTalentClassData = (talentClassName) => {
    if (allTalentData && allTalentData[talentClassName]) {
      // 为当前选中的天赋大类添加唯一ID
      const talentsWithIds = {
        ...allTalentData[talentClassName],
        talents: allTalentData[talentClassName].talents.map((talent, index) => ({
          ...talent,
          id: `${talentClassName}-${talent.name}-${index}`,
          isMainTalent: mainTalents.includes(talent.name)
        }))
      };
      setTalentData(talentsWithIds);
    } else {
      setError(`未找到 ${talentClassName} 的天赋数据`);
    }
  };

  // 切换天赋大类
  const switchTalentClass = (talentClassName, index) => {
    if (allTalentData && allTalentData[talentClassName]) {
      setActiveTalentClass(talentClassName);
      setActiveTabIndex(index);
      
      // 加载选中的天赋大类数据
      loadTalentClassData(talentClassName);
    }
  };

  // 向左滚动标签
  const scrollTabsLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // 向右滚动标签
  const scrollTabsRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // 切换到上一个天赋大类
  const prevTalentClass = () => {
    if (availableTalentClasses.length > 0) {
      const newIndex = (activeTabIndex - 1 + availableTalentClasses.length) % availableTalentClasses.length;
      switchTalentClass(availableTalentClasses[newIndex], newIndex);
    }
  };

  // 切换到下一个天赋大类
  const nextTalentClass = () => {
    if (availableTalentClasses.length > 0) {
      const newIndex = (activeTabIndex + 1) % availableTalentClasses.length;
      switchTalentClass(availableTalentClasses[newIndex], newIndex);
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
      // 添加所属天赋大类信息
      const talentWithClass = {
        ...talent,
        belong: talent.belong || activeTalentClass
      };
      const updatedTalents = [...selectedTalents, talentWithClass];
      setSelectedTalents(updatedTalents);
      setAvailablePoints(availablePoints - 1);
      
      // 通知父组件
      if (onTalentSelect) {
        onTalentSelect(updatedTalents);
      }
    }
  };

  // 提取天赋描述中的数值
  const extractValues = (desc) => {
    // 匹配常见的数值模式，如 +10%、+5 等
    const matches = desc.match(/[+-](\d+\.?\d*)%?/g) || [];
    return matches;
  };

  // 提取天赋描述中的效果类型
  const extractEffectTypes = (desc) => {
    const effectTypes = [];
    
    if (desc.includes('伤害')) effectTypes.push('伤害');
    if (desc.includes('力量')) effectTypes.push('力量');
    if (desc.includes('敏捷')) effectTypes.push('敏捷');
    if (desc.includes('智慧')) effectTypes.push('智慧');
    if (desc.includes('魔力')) effectTypes.push('魔力');
    if (desc.includes('生命')) effectTypes.push('生命');
    if (desc.includes('护盾')) effectTypes.push('护盾');
    if (desc.includes('暴击')) effectTypes.push('暴击');
    if (desc.includes('攻击速度') || desc.includes('施法速度')) effectTypes.push('速度');
    if (desc.includes('元素')) effectTypes.push('元素');
    if (desc.includes('抗性')) effectTypes.push('抗性');
    
    return effectTypes.length > 0 ? effectTypes : ['其他'];
  };

  // 分析已选天赋的属性加成
  const analyzeTalentBonuses = () => {
    const bonuses = {
      '伤害': 0,
      '力量': 0,
      '敏捷': 0,
      '智慧': 0,
      '魔力': 0,
      '生命': 0,
      '护盾': 0,
      '暴击率': 0,
      '暴击伤害': 0,
      '攻速': 0,
      '元素伤害': 0,
      '抗性': 0
    };

    selectedTalents.forEach(talent => {
      const desc = talent.desc;
      
      // 提取数值
      if (desc.includes('伤害') && !desc.includes('暴击伤害') && !desc.includes('元素伤害')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)%\s*伤害/);
        if (match && match[1]) bonuses['伤害'] += parseFloat(match[1]);
      }
      
      if (desc.includes('力量')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)\s*力量/);
        if (match && match[1]) bonuses['力量'] += parseFloat(match[1]);
      }
      
      if (desc.includes('敏捷')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)\s*敏捷/);
        if (match && match[1]) bonuses['敏捷'] += parseFloat(match[1]);
      }
      
      if (desc.includes('智慧')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)\s*智慧/);
        if (match && match[1]) bonuses['智慧'] += parseFloat(match[1]);
      }
      
      if (desc.includes('最大魔力')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)%\s*最大魔力/);
        if (match && match[1]) bonuses['魔力'] += parseFloat(match[1]);
      }
      
      if (desc.includes('最大生命')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)%\s*最大生命/);
        if (match && match[1]) bonuses['生命'] += parseFloat(match[1]);
      }
      
      if (desc.includes('最大护盾')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)%\s*最大护盾/);
        if (match && match[1]) bonuses['护盾'] += parseFloat(match[1]);
      }
      
      if (desc.includes('暴击值')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)%\s*暴击值/);
        if (match && match[1]) bonuses['暴击率'] += parseFloat(match[1]);
      }
      
      if (desc.includes('暴击伤害')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)%\s*暴击伤害/);
        if (match && match[1]) bonuses['暴击伤害'] += parseFloat(match[1]);
      }
      
      if (desc.includes('攻击与施法速度')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)%\s*攻击与施法速度/);
        if (match && match[1]) bonuses['攻速'] += parseFloat(match[1]);
      }
      
      if (desc.includes('元素伤害')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)%\s*元素伤害/);
        if (match && match[1]) bonuses['元素伤害'] += parseFloat(match[1]);
      }
      
      if (desc.includes('元素抗性')) {
        const match = desc.match(/\+(\d+(?:\.\d+)?)%\s*元素抗性/);
        if (match && match[1]) bonuses['抗性'] += parseFloat(match[1]);
      }
    });
    
    // 过滤掉值为0的属性
    return Object.entries(bonuses).filter(([_, value]) => value > 0);
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

  // 根据main-talent.json区分核心天赋和常规天赋
  const coreTalents = talentData.talents.filter(talent => talent.isMainTalent);
  const regularTalents = talentData.talents.filter(talent => !talent.isMainTalent);
  
  // 计算天赋加成总和
  const talentBonuses = analyzeTalentBonuses();

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
      
      {/* 天赋大类标签页 - 带左右箭头 */}
      <div className="mb-4 border-b border-gray-700 relative">
        <div className="flex items-center">
          <button 
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-l-lg text-gray-300"
            onClick={prevTalentClass}
            aria-label="上一个天赋大类"
          >
            &lt;
          </button>
          
          <div 
            ref={tabsContainerRef}
            className="flex overflow-x-auto custom-scrollbar flex-grow mx-1 scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {availableTalentClasses.map((className, index) => (
              <button
                key={className}
                className={`px-4 py-2 mx-1 rounded-t-lg text-sm font-medium whitespace-nowrap ${
                  activeTalentClass === className
                    ? 'bg-gray-700 text-amber-400 border-b-2 border-amber-400'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => switchTalentClass(className, index)}
              >
                {className}
              </button>
            ))}
          </div>
          
          <button 
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-r-lg text-gray-300"
            onClick={nextTalentClass}
            aria-label="下一个天赋大类"
          >
            &gt;
          </button>
        </div>
      </div>
      
      {/* 核心天赋 */}
      {coreTalents.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-amber-400">核心天赋 ({coreTalents.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {coreTalents.map((talent, index) => (
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
      )}
      
      {/* 常规天赋 - 添加固定高度和滚动条 */}
      {regularTalents.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-amber-400">常规天赋 ({regularTalents.length})</h3>
          <div className="h-64 overflow-y-auto pr-2 custom-scrollbar py-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {regularTalents.map((talent, index) => (
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
        </div>
      )}
      
      {/* 已选天赋摘要 - 增强数值展示 */}
      {selectedTalents.length > 0 && (
        <div className="mt-6 bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">已选天赋 ({selectedTalents.length})</h3>
            
            {/* 天赋加成总和 */}
            <div className="flex flex-wrap gap-1 justify-end">
              {talentBonuses.map(([type, value], index) => (
                <span key={index} className="bg-gray-800 px-2 py-1 rounded text-xs">
                  <span className="text-blue-300">{type}:</span> 
                  <span className="text-green-400 ml-1">+{value.toFixed(1)}</span>
                </span>
              ))}
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="text-sm">
              {selectedTalents.map((talent, index) => {
                const values = extractValues(talent.desc);
                const effectTypes = extractEffectTypes(talent.desc);
                const talentType = talent.isMainTalent ? "核心" : "常规";
                
                return (
                  <li key={talent.id || index} className="mb-2 pb-2 border-b border-gray-600 last:border-0">
                    <div className="flex items-start flex-wrap">
                      <span className="text-amber-400 mr-1">[{talent.belong}]</span>
                      <span className={`mr-1 ${talent.isMainTalent ? 'text-yellow-300' : ''}`}>
                        {talent.name}
                        <span className="text-xs text-gray-400 ml-1">({talentType})</span>
                      </span>
                      
                      {/* 显示数值和效果类型 */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {values.map((value, i) => (
                          <span key={i} className="text-green-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                            {value}
                          </span>
                        ))}
                        {effectTypes.map((type, i) => (
                          <span key={`type-${i}`} className="text-blue-300 bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">{talent.desc}</div>
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