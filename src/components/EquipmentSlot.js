'use client'

import { useState, useCallback, memo } from 'react';
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
  }, []);

  return (
    <div className="relative">
      {/* 装备卡片 */}
      <div 
        className="bg-gray-700 p-2 rounded-lg text-center cursor-pointer hover:bg-gray-600 transition"
        onClick={handleSlotClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-12 h-12 bg-gray-600 mx-auto mb-1 flex items-center justify-center overflow-hidden">
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
      </div>

      {/* 装备详情提示 - 使用绝对定位 */}
      {showTooltip && equipment && (
        <div 
          className="absolute left-full ml-2 top-0 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg z-50 w-64"
          style={{ marginTop: '0px' }}
        >
          <div className="flex items-start mb-2">
            {equipment.icon && (
              <div className="w-10 h-10 bg-gray-700 mr-2 flex-shrink-0">
                <img src={equipment.icon} alt={equipment.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h4 className="font-medium text-amber-400">{equipment.name}</h4>
              <p className="text-xs text-gray-400">{equipment.type}</p>
            </div>
          </div>
          
          {equipment.stats && (
            <div className="mb-2">
              <h5 className="text-xs font-medium mb-1 text-blue-300">属性</h5>
              <ul className="text-xs space-y-1">
                {equipment.stats.map((stat, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{stat.name}</span>
                    <span className="text-green-400">{stat.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {equipment.description && (
            <div className="text-xs text-gray-300">{equipment.description}</div>
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
            
            <div className="mt-6">
              {availableEquipment.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableEquipment.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-gray-700 p-2 rounded-lg text-center cursor-pointer hover:bg-gray-600 transition"
                      onClick={() => handleSelect(item)}
                    >
                      <div className="w-12 h-12 bg-gray-600 mx-auto mb-1">
                        {item.icon && (
                          <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <p className="text-xs truncate">{item.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>暂无可用装备</p>
                </div>
              )}
            </div>
            
            <SheetFooter className="mt-6">
              <SheetClose asChild>
                <button 
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  取消
                </button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
});

export default EquipmentSlot; 