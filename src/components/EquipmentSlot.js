'use client'

import { useState, useCallback, memo, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from './ui/sheet';

// 使用 memo 包装组件，防止不必要的重新渲染
const EquipmentSlot = memo(function EquipmentSlot({ 
  type, 
  label, 
  equipment, 
  onSelect,
  availableEquipment = []
}) {
  const [showSheet, setShowSheet] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minLevel, setMinLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(100);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const tooltipRef = useRef(null);

  // 处理装备选择 - 使用 useCallback 优化
  const handleSelect = useCallback((item) => {
    if (onSelect) {
      onSelect(type, item);
    }
    setShowSheet(false);
  }, [onSelect, type]);

  // 处理点击装备槽 - 使用 useCallback 优化
  const handleSlotClick = useCallback(() => {
    setShowSheet(true);
  }, []);

  // 处理鼠标悬停 - 使用 useCallback 优化
  const handleMouseEnter = useCallback(() => {
    if (equipment) {
      setShowTooltip(true);
    }
  }, [equipment]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // 处理 Sheet 状态变化 - 使用 useCallback 优化
  const handleSheetOpenChange = useCallback((open) => {
    setShowSheet(open);
    if (open) {
      // 重置筛选条件
      setSearchTerm('');
    }
  }, []);
  
  // 筛选装备
  useEffect(() => {
    if (!availableEquipment.length) {
      setFilteredEquipment([]);
      return;
    }
    
    // 应用筛选条件
    const filtered = availableEquipment.filter(item => {
      const nameMatch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const levelMatch = (!minLevel || item.level >= minLevel) && (!maxLevel || item.level <= maxLevel);
      return nameMatch && levelMatch;
    });
    
    setFilteredEquipment(filtered);
  }, [availableEquipment, searchTerm, minLevel, maxLevel]);

  // 获取装备等级对应的背景颜色
  const getItemRarityColor = useCallback((level) => {
    if (level >= 50) return 'bg-orange-700 border-orange-500'; // 传奇
    if (level >= 30) return 'bg-purple-700 border-purple-500'; // 史诗
    if (level >= 15) return 'bg-blue-700 border-blue-500';    // 稀有
    if (level >= 5) return 'bg-green-700 border-green-500';   // 魔法
    return 'bg-gray-600 border-gray-500';                    // 普通
  }, []);
  
  // 格式化装备属性文本，为数值添加颜色
  const formatStatText = useCallback((text) => {
    // 匹配正数值并添加绿色，匹配负数值并添加红色
    return text.replace(/\+([0-9]+)/g, '<span class="text-green-400">+$1</span>')
               .replace(/\-([0-9]+)/g, '<span class="text-red-400">-$1</span>');
  }, []);

  // 处理搜索输入
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);
  
  // 处理最小等级变化
  const handleMinLevelChange = useCallback((e) => {
    const value = parseInt(e.target.value) || '';
    setMinLevel(value);
  }, []);
  
  // 处理最大等级变化
  const handleMaxLevelChange = useCallback((e) => {
    const value = parseInt(e.target.value) || '';
    setMaxLevel(value);
  }, []);
  
  // 清除筛选条件
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setMinLevel(1);
    setMaxLevel(100);
  }, []);

  return (
    <div className="relative">
      {/* 装备卡片 */}
      <div 
        className={`bg-gray-700 p-2 rounded-lg text-center cursor-pointer hover:bg-gray-600 transition ${equipment ? 'border-2 border-amber-500' : 'border-2 border-gray-700'}`}
        onClick={handleSlotClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`w-12 h-12 mx-auto mb-1 flex items-center justify-center overflow-hidden rounded-md ${equipment ? getItemRarityColor(equipment.level || 1) : 'bg-gray-600'}`}>
          {equipment?.icon ? (
            <img 
              src={equipment.icon} 
              alt={equipment.name} 
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        <p className="text-xs truncate">
          {equipment?.name || label}
        </p>
        {equipment && <p className="text-[10px] text-gray-400">等级 {equipment.level || 1}</p>}
      </div>

      {/* 装备详情提示 - 使用绝对定位 */}
      {showTooltip && equipment && (
        <div 
          ref={tooltipRef}
          className="absolute left-full ml-2 top-0 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg z-50 w-64"
          style={{ marginTop: '0px' }}
        >
          <div className="flex items-start mb-2">
            {equipment.icon && (
              <div className={`w-10 h-10 mr-2 flex-shrink-0 rounded ${getItemRarityColor(equipment.level || 1)}`}>
                <img src={equipment.icon} alt={equipment.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h4 className="font-medium text-amber-400">{equipment.name}</h4>
              <p className="text-xs text-gray-400">{equipment.type || '装备'} · 等级 {equipment.level || 1}</p>
            </div>
          </div>
          
          {equipment.stats && equipment.stats.length > 0 && (
            <div className="mb-2">
              <h5 className="text-xs font-medium mb-1 text-blue-300">属性</h5>
              <ul className="text-xs space-y-1">
                {equipment.stats.map((stat, index) => (
                  <li key={index} className="text-gray-200" dangerouslySetInnerHTML={{
                    __html: formatStatText(stat.name)
                  }} />
                ))}
              </ul>
            </div>
          )}
          
          {equipment.description && (
            <div className="text-xs text-gray-300 mt-2">{equipment.description}</div>
          )}
          
          {equipment.requirements && (
            <div className="mt-2 text-xs">
              <h5 className="font-medium mb-1 text-red-300">需求</h5>
              <ul className="space-y-1">
                {equipment.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 装备选择抽屉 - 使用Sheet组件 */}
      {showSheet && (
        <Sheet open={showSheet} onOpenChange={handleSheetOpenChange}>
          <SheetContent side="left" className="w-[85%] sm:w-[400px] bg-gray-800 border-r border-gray-700">
            <SheetHeader>
              <SheetTitle className="text-amber-400">选择{label}</SheetTitle>
            </SheetHeader>
            
            {/* 筛选控件 */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-gray-300 block mb-1">装备名称搜索</label>
                <input 
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                  placeholder="输入装备名称关键字..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="text-sm text-gray-300 block mb-1">最低等级</label>
                  <input 
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    placeholder="1"
                    min="1"
                    value={minLevel}
                    onChange={handleMinLevelChange}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-300 block mb-1">最高等级</label>
                  <input 
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    placeholder="100"
                    min="1"
                    value={maxLevel}
                    onChange={handleMaxLevelChange}
                  />
                </div>
              </div>
              
              <button
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                onClick={handleClearFilters}
              >
                清除筛选条件
              </button>
            </div>
            
            <div className="mt-4 overflow-y-auto max-h-[calc(100vh-280px)]">
              {filteredEquipment.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {filteredEquipment.map((item, index) => (
                    <div 
                      key={`${item.id}-${index}`}
                      className={`bg-gray-700 p-2 rounded-lg text-center cursor-pointer hover:bg-gray-600 transition border border-gray-600`}
                      onClick={() => handleSelect(item)}
                    >
                      <div className={`w-12 h-12 mx-auto mb-1 rounded overflow-hidden ${getItemRarityColor(item.level || 1)}`}>
                        {item.icon && (
                          <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <p className="text-xs truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">等级 {item.level || 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {availableEquipment.length > 0 ? (
                    <p>没有匹配的装备</p>
                  ) : (
                    <p>暂无可用装备</p>
                  )}
                </div>
              )}
            </div>
            
            <SheetFooter className="mt-6">
              <div className="flex w-full space-x-2">
                <SheetClose asChild>
                  <button 
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  >
                    取消
                  </button>
                </SheetClose>
                <button 
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white"
                  onClick={() => {
                    if (equipment) {
                      handleSelect(null);
                    }
                  }}
                >
                  {equipment ? "卸下装备" : "清空"}
                </button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
});

export default EquipmentSlot; 