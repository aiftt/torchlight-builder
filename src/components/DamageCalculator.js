'use client'

import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from './ui/sheet';

// 伤害类型定义
const DAMAGE_TYPES = {
  BASE: 'base',    // 基础伤害（点伤）
  PERCENT: 'percent', // 百分比伤害（inc）
  EXTRA: 'extra'   // 额外伤害（more）
};

// 伤害类型标签
const DAMAGE_LABELS = {
  [DAMAGE_TYPES.BASE]: '基础伤害(点伤)',
  [DAMAGE_TYPES.PERCENT]: '百分比伤害(inc)',
  [DAMAGE_TYPES.EXTRA]: '额外伤害(more)'
};

export default function DamageCalculator({ 
  selectedHero,
  selectedTalents = [],
  selectedEquipment = {},
  attributes = {},
  selectedHeroFeatures = [] // 添加英雄特性参数
}) {
  const [damagePool, setDamagePool] = useState([]);
  const [selectedDamages, setSelectedDamages] = useState([]);
  const [showSheet, setShowSheet] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 从装备和天赋中提取伤害信息
  useEffect(() => {
    const extractedDamages = [];
    let index = 0;
    
    // 从装备中提取伤害信息
    Object.values(selectedEquipment).forEach(item => {
      if (!item || !item.stats) return;
      
      item.stats.forEach(stat => {
        const damageInfo = extractDamageInfo(stat.name);
        if (damageInfo) {
          extractedDamages.push({
            id: `equipment_damage_${index++}`,
            source: item.name,
            sourceType: '装备',
            ...damageInfo
          });
        }
      });
    });
    
    // 从天赋中提取伤害信息
    selectedTalents.forEach(talent => {
      if (!talent.desc) return;
      
      const damageInfo = extractDamageInfo(talent.desc);
      if (damageInfo) {
        extractedDamages.push({
          id: `talent_damage_${index++}`,
          source: talent.name,
          sourceType: '天赋',
          ...damageInfo
        });
      }
    });
    
    // 从英雄特性中提取伤害信息
    selectedHeroFeatures.forEach(feature => {
      if (!feature.desc) return;
      
      const damageInfo = extractDamageInfo(feature.desc);
      if (damageInfo) {
        extractedDamages.push({
          id: `feature_damage_${index++}`,
          source: feature.name,
          sourceType: '英雄特性',
          ...damageInfo
        });
      }
    });
    
    setDamagePool(extractedDamages);
    // 默认选中所有伤害
    setSelectedDamages(extractedDamages.map(item => item.id));
  }, [selectedHero, selectedTalents, selectedEquipment, selectedHeroFeatures]);
  
  // 提取伤害信息的工具函数
  const extractDamageInfo = (text) => {
    // 基础伤害（点伤）匹配，如"附加50点火焰伤害"
    const baseMatch = text.match(/附加(\d+)点([\u4e00-\u9fa5]+)伤害/);
    if (baseMatch) {
      return {
        type: DAMAGE_TYPES.BASE,
        value: parseInt(baseMatch[1]),
        element: baseMatch[2],
        description: text
      };
    }
    
    // 额外伤害（more）匹配，如"额外30%伤害"
    const extraMatch = text.match(/额外(\d+)%([\u4e00-\u9fa5]*)伤害/);
    if (extraMatch) {
      return {
        type: DAMAGE_TYPES.EXTRA,
        value: parseInt(extraMatch[1]),
        element: extraMatch[2] || '所有',
        description: text
      };
    }
    
    // 百分比伤害（inc）匹配，如"增加25%物理伤害"
    const percentMatch = text.match(/(增加|提高)(\d+)%([\u4e00-\u9fa5]*)伤害/);
    if (percentMatch) {
      return {
        type: DAMAGE_TYPES.PERCENT,
        value: parseInt(percentMatch[2]),
        element: percentMatch[3] || '所有',
        description: text
      };
    }
    
    // 百分比伤害的另一种表示，如"+25%伤害"
    const percentMatch2 = text.match(/\+(\d+)%([\u4e00-\u9fa5]*)伤害/);
    if (percentMatch2) {
      return {
        type: DAMAGE_TYPES.PERCENT,
        value: parseInt(percentMatch2[1]),
        element: percentMatch2[2] || '所有',
        description: text
      };
    }
    
    return null;
  };
  
  // 过滤伤害池中的项目
  const filteredDamagePool = useMemo(() => {
    if (!searchTerm) return damagePool;
    
    return damagePool.filter(item => 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.element.includes(searchTerm)
    );
  }, [damagePool, searchTerm]);
  
  // 计算最终伤害
  const calculatedDamage = useMemo(() => {
    // 获取选中的伤害项
    const selectedItems = damagePool.filter(item => selectedDamages.includes(item.id));
    
    // 基础伤害总和
    const baseDamage = selectedItems
      .filter(item => item.type === DAMAGE_TYPES.BASE)
      .reduce((sum, item) => sum + item.value, 0);
    
    // 百分比伤害总和
    const percentDamageTotal = selectedItems
      .filter(item => item.type === DAMAGE_TYPES.PERCENT)
      .reduce((sum, item) => sum + item.value, 0);
    
    // 额外伤害系数列表
    const extraDamageFactors = selectedItems
      .filter(item => item.type === DAMAGE_TYPES.EXTRA)
      .map(item => 1 + item.value / 100);
    
    // 计算最终伤害
    let finalDamage = baseDamage * (1 + percentDamageTotal / 100);
    extraDamageFactors.forEach(factor => {
      finalDamage *= factor;
    });
    
    return {
      base: baseDamage,
      percent: percentDamageTotal,
      extra: extraDamageFactors,
      final: Math.round(finalDamage),
      selectedItems: selectedItems
    };
  }, [damagePool, selectedDamages]);
  
  // 处理伤害选择
  const handleDamageToggle = (id) => {
    setSelectedDamages(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };
  
  // 处理全选/全不选
  const handleSelectAll = (select) => {
    if (select) {
      setSelectedDamages(filteredDamagePool.map(item => item.id));
    } else {
      setSelectedDamages([]);
    }
  };

  return (
    <div className="mt-4">
      <div className="bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-xl text-amber-400 mb-3">伤害计算器</h2>
        
        {/* 伤害计算公式 */}
        <div className="mb-4 bg-gray-700 p-3 rounded-md">
          <h3 className="text-blue-300 font-medium mb-2">伤害计算公式</h3>
          <p className="text-gray-200 text-sm">伤害值 = 基础伤害 × (1 + 所有非额外百分比加成) × (1 + 额外百分比加成1) × (1 + 额外百分比加成2) ×...</p>
          <div className="mt-2 text-sm text-gray-300">
            <p>• 基础伤害（点伤）：如"附加xxx点xx伤害的"</p>
            <p>• 百分比伤害（inc）：带百分比但不包含"额外"的</p>
            <p>• 额外伤害（more）：包含"额外"的伤害</p>
          </div>
        </div>

        {/* 伤害计算结果 */}
        <div className="mb-4 bg-gray-700 p-3 rounded-md">
          <h3 className="text-green-300 font-medium mb-2">计算结果</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-gray-400">基础伤害：</span>
              <span className="text-white">{calculatedDamage.base}</span>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-gray-400">百分比加成：</span>
              <span className="text-white">+{calculatedDamage.percent}%</span>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-gray-400">额外加成数量：</span>
              <span className="text-white">{calculatedDamage.extra.length}</span>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-gray-400">最终伤害：</span>
              <span className="text-amber-400 font-bold">{calculatedDamage.final}</span>
            </div>
          </div>
        </div>
        
        {/* 已选中伤害项显示区域 */}
        <div className="mb-4 bg-gray-700 p-3 rounded-md">
          <h3 className="text-blue-300 font-medium mb-2">已选中伤害词条 ({calculatedDamage.selectedItems.length})</h3>
          
          {calculatedDamage.selectedItems.length === 0 ? (
            <p className="text-gray-400 text-center py-2">未选中任何伤害词条</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {/* 基础伤害显示 */}
              {calculatedDamage.selectedItems.filter(item => item.type === DAMAGE_TYPES.BASE).length > 0 && (
                <div>
                  <h4 className="text-green-300 text-xs font-medium mb-1">基础伤害(点伤):</h4>
                  <div className="space-y-1">
                    {calculatedDamage.selectedItems
                      .filter(item => item.type === DAMAGE_TYPES.BASE)
                      .map((item, idx) => (
                        <div key={idx} className="bg-gray-800 p-2 rounded-md text-xs flex justify-between">
                          <div>
                            <span className="text-white">{item.description}</span>
                            <div className="text-gray-400 text-[10px] mt-0.5">{item.sourceType}: {item.source}</div>
                          </div>
                          <button 
                            className="text-red-400 hover:text-red-300 ml-2" 
                            onClick={() => handleDamageToggle(item.id)}
                          >
                            移除
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* 百分比伤害显示 */}
              {calculatedDamage.selectedItems.filter(item => item.type === DAMAGE_TYPES.PERCENT).length > 0 && (
                <div className="mt-2">
                  <h4 className="text-blue-300 text-xs font-medium mb-1">百分比伤害(inc):</h4>
                  <div className="space-y-1">
                    {calculatedDamage.selectedItems
                      .filter(item => item.type === DAMAGE_TYPES.PERCENT)
                      .map((item, idx) => (
                        <div key={idx} className="bg-gray-800 p-2 rounded-md text-xs flex justify-between">
                          <div>
                            <span className="text-white">{item.description}</span>
                            <div className="text-gray-400 text-[10px] mt-0.5">{item.sourceType}: {item.source}</div>
                          </div>
                          <button 
                            className="text-red-400 hover:text-red-300 ml-2" 
                            onClick={() => handleDamageToggle(item.id)}
                          >
                            移除
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* 额外伤害显示 */}
              {calculatedDamage.selectedItems.filter(item => item.type === DAMAGE_TYPES.EXTRA).length > 0 && (
                <div className="mt-2">
                  <h4 className="text-purple-300 text-xs font-medium mb-1">额外伤害(more):</h4>
                  <div className="space-y-1">
                    {calculatedDamage.selectedItems
                      .filter(item => item.type === DAMAGE_TYPES.EXTRA)
                      .map((item, idx) => (
                        <div key={idx} className="bg-gray-800 p-2 rounded-md text-xs flex justify-between">
                          <div>
                            <span className="text-white">{item.description}</span>
                            <div className="text-gray-400 text-[10px] mt-0.5">{item.sourceType}: {item.source}</div>
                          </div>
                          <button 
                            className="text-red-400 hover:text-red-300 ml-2" 
                            onClick={() => handleDamageToggle(item.id)}
                          >
                            移除
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 伤害池按钮 */}
        <button 
          className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition"
          onClick={() => setShowSheet(true)}
        >
          管理伤害词条 ({selectedDamages.length}/{damagePool.length})
        </button>
      </div>

      {/* 伤害词条选择抽屉 */}
      <Sheet open={showSheet} onOpenChange={(open) => setShowSheet(open)}>
        <SheetContent side="right" className="w-[85%] sm:w-[450px] bg-gray-800 border-l border-gray-700">
          <SheetHeader>
            <SheetTitle className="text-amber-400">伤害词条选择</SheetTitle>
          </SheetHeader>
          
          {/* 搜索框 */}
          <div className="mt-4">
            <input 
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              placeholder="搜索伤害词条..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* 全选/全不选按钮 */}
          <div className="mt-3 flex space-x-2">
            <button 
              className="text-xs text-blue-400 hover:text-blue-300 flex-1 bg-gray-700 rounded-md py-1"
              onClick={() => handleSelectAll(true)}
            >
              全选
            </button>
            <button 
              className="text-xs text-red-400 hover:text-red-300 flex-1 bg-gray-700 rounded-md py-1"
              onClick={() => handleSelectAll(false)}
            >
              全不选
            </button>
          </div>
          
          {/* 伤害词条列表 */}
          <div className="mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {filteredDamagePool.length === 0 ? (
              <div className="text-center text-gray-400 py-10">未找到伤害词条</div>
            ) : (
              <div className="space-y-2">
                {filteredDamagePool.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-2 rounded-md cursor-pointer transition border ${
                      selectedDamages.includes(item.id) 
                        ? 'bg-gray-700 border-amber-500'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => handleDamageToggle(item.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm">{item.description}</p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] mr-2 ${
                            item.type === DAMAGE_TYPES.BASE 
                              ? 'bg-green-900 text-green-300' 
                              : item.type === DAMAGE_TYPES.PERCENT 
                                ? 'bg-blue-900 text-blue-300'
                                : 'bg-purple-900 text-purple-300'
                          }`}>
                            {DAMAGE_LABELS[item.type]}
                          </span>
                          <span className="text-xs text-gray-400">{item.sourceType}: {item.source}</span>
                        </div>
                      </div>
                      <div className="ml-2">
                        <input
                          type="checkbox"
                          checked={selectedDamages.includes(item.id)}
                          onChange={() => {}}
                          className="h-5 w-5 rounded border-gray-500 text-amber-600 focus:ring-amber-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <SheetClose asChild>
            <button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition w-full">
              确认选择
            </button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </div>
  );
} 