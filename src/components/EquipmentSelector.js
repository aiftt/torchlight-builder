'use client'

import { useState, useEffect, useCallback } from 'react';
import EquipmentSlot from './EquipmentSlot';

// 装备类型定义
const EQUIPMENT_TYPES = {
  HEAD: 'head',
  CHEST: 'chest',
  NECK: 'neck',
  HANDS: 'hands',
  WAIST: 'waist',
  FEET: 'feet',
  FINGER_LEFT: 'finger_left',
  FINGER_RIGHT: 'finger_right',
  WEAPON_MAIN: 'weapon_main',
  WEAPON_OFF: 'weapon_off'
};

// 装备类型标签
const EQUIPMENT_LABELS = {
  [EQUIPMENT_TYPES.HEAD]: '头部',
  [EQUIPMENT_TYPES.CHEST]: '胸部',
  [EQUIPMENT_TYPES.NECK]: '颈部',
  [EQUIPMENT_TYPES.HANDS]: '手部',
  [EQUIPMENT_TYPES.WAIST]: '腰部',
  [EQUIPMENT_TYPES.FEET]: '脚部',
  [EQUIPMENT_TYPES.FINGER_LEFT]: '手指(左)',
  [EQUIPMENT_TYPES.FINGER_RIGHT]: '手指(右)',
  [EQUIPMENT_TYPES.WEAPON_MAIN]: '武器(主手)',
  [EQUIPMENT_TYPES.WEAPON_OFF]: '武器(副手)'
};

// 装备类型映射 - 增强版
const EQUIPMENT_TYPE_MAPPING = {
  // 头部装备
  'Helmet': EQUIPMENT_TYPES.HEAD,
  
  // 胸部装备
  'Armor': EQUIPMENT_TYPES.CHEST,
  
  // 项链
  'Amulet': EQUIPMENT_TYPES.NECK,
  
  // 手套
  'Gloves': EQUIPMENT_TYPES.HANDS,
  
  // 腰带
  'Belt': EQUIPMENT_TYPES.WAIST,
  
  // 鞋子
  'Shoes': EQUIPMENT_TYPES.FEET,
  'Boots': EQUIPMENT_TYPES.FEET,
  
  // 戒指
  'Ring': [EQUIPMENT_TYPES.FINGER_LEFT, EQUIPMENT_TYPES.FINGER_RIGHT],
  
  // 武器 - 主手/副手
  'Weapon': [EQUIPMENT_TYPES.WEAPON_MAIN, EQUIPMENT_TYPES.WEAPON_OFF],
  'Shield': EQUIPMENT_TYPES.WEAPON_OFF,
  
  // 主手武器
  'Wand': EQUIPMENT_TYPES.WEAPON_MAIN,
  '1HSword': EQUIPMENT_TYPES.WEAPON_MAIN,
  '2HSword': EQUIPMENT_TYPES.WEAPON_MAIN,
  '1HMace': EQUIPMENT_TYPES.WEAPON_MAIN,
  '2HMace': EQUIPMENT_TYPES.WEAPON_MAIN,
  '1HAxe': EQUIPMENT_TYPES.WEAPON_MAIN,
  '2HAxe': EQUIPMENT_TYPES.WEAPON_MAIN,
  'Bow': EQUIPMENT_TYPES.WEAPON_MAIN,
  'Claw': EQUIPMENT_TYPES.WEAPON_MAIN,
  'Staff': EQUIPMENT_TYPES.WEAPON_MAIN,
  'Shotgun': EQUIPMENT_TYPES.WEAPON_MAIN,
  'Pistol': EQUIPMENT_TYPES.WEAPON_MAIN,
  'Dagger': EQUIPMENT_TYPES.WEAPON_MAIN,
  'crossbow': EQUIPMENT_TYPES.WEAPON_MAIN
};

// 排序选项
const SORT_OPTIONS = {
  LEVEL_ASC: '等级↑',
  LEVEL_DESC: '等级↓',
  NAME_ASC: '名称↑',
  NAME_DESC: '名称↓'
};

export default function EquipmentSelector({ selectedHero, onEquipmentChange }) {
  const [equipment, setEquipment] = useState({});
  const [availableEquipment, setAvailableEquipment] = useState({});
  const [allEquipment, setAllEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.LEVEL_DESC);
  const [processedEquipment, setProcessedEquipment] = useState([]);
  
  // 加载所有装备数据
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        console.log('正在加载装备数据...');
        
        const response = await fetch('/json/equipment.json');
        if (!response.ok) {
          throw new Error('Failed to fetch equipment data');
        }
        
        const data = await response.json();
        console.log(`成功加载装备数据，共 ${data.length} 件装备`);
        setAllEquipment(data);
        setLoading(false);
      } catch (error) {
        console.error('装备数据加载失败:', error);
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, []);
  
  // 处理排序逻辑
  const sortEquipment = useCallback((items, option) => {
    const sorted = [...items];
    
    switch (option) {
      case SORT_OPTIONS.LEVEL_ASC:
        return sorted.sort((a, b) => a.level - b.level);
      case SORT_OPTIONS.LEVEL_DESC:
        return sorted.sort((a, b) => b.level - a.level);
      case SORT_OPTIONS.NAME_ASC:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case SORT_OPTIONS.NAME_DESC:
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  }, []);
  
  // 当选择英雄或装备数据加载时，处理可用装备
  useEffect(() => {
    if (selectedHero && allEquipment.length > 0) {
      console.log('处理装备数据，当前选中英雄:', selectedHero);
      
      // 重置已选装备
      setEquipment({});
      
      // 将装备转换为适合显示的格式
      const newProcessedEquipment = allEquipment.map(item => {
        const imageUrl = item.img.toLowerCase();
        
        // 检查是否是装备（而不是天赋石）
        // 天赋石的URL包含"talentslate"，装备的URL包含"equipcommon"
        const isTalentSlate = imageUrl.includes('talentslate');
        if (isTalentSlate) {
          return null; // 跳过天赋石
        }
        
        // 确定装备类型
        let equipType = 'unknown';
        // 记录匹配到的类型，用于调试
        const matchedTypes = [];
        
        for (const [key, value] of Object.entries(EQUIPMENT_TYPE_MAPPING)) {
          const keyLower = key.toLowerCase();
          if (imageUrl.includes(keyLower)) {
            equipType = key;
            matchedTypes.push(key);
          }
        }
        
        // 如果匹配到多个类型，选择最具体的那个（通常是URL中最后出现的那个）
        if (matchedTypes.length > 1) {
          console.log(`装备 ${item.name} 匹配到多个类型:`, matchedTypes);
          // 尝试找出URL中最后出现的类型
          let lastMatchIndex = -1;
          let lastMatchType = equipType;
          
          matchedTypes.forEach(type => {
            const typeIndex = imageUrl.lastIndexOf(type.toLowerCase());
            if (typeIndex > lastMatchIndex) {
              lastMatchIndex = typeIndex;
              lastMatchType = type;
            }
          });
          
          equipType = lastMatchType;
          console.log(`选择类型: ${equipType}`);
        }
        
        // 构建装备对象
        return {
          id: item.name,
          name: item.name,
          level: item.level,
          type: equipType,
          icon: item.img,
          stats: item.list.map(stat => {
            return { name: stat, value: '' };
          }),
          description: `${item.name} (等级 ${item.level})`,
          requirements: [`等级 ${item.level}`],
          equipType
        };
      }).filter(item => item !== null); // 过滤掉非装备物品
      
      console.log(`处理后的装备数量: ${newProcessedEquipment.length}`);
      setProcessedEquipment(newProcessedEquipment);
      
      // 统计各类型装备数量，用于调试
      const typeCount = {};
      const slotCount = {};
      
      // 统计装备类型数量
      newProcessedEquipment.forEach(item => {
        typeCount[item.equipType] = (typeCount[item.equipType] || 0) + 1;
      });
      console.log('装备类型统计:', typeCount);
      
      // 统计每个装备槽位的可用装备数量
      Object.values(EQUIPMENT_TYPES).forEach(type => {
        slotCount[type] = newProcessedEquipment.filter(item => {
          const mappedType = EQUIPMENT_TYPE_MAPPING[item.equipType];
          if (Array.isArray(mappedType)) {
            return mappedType.includes(type);
          }
          return mappedType === type;
        }).length;
      });
      console.log('装备槽位统计:', slotCount);
      
      // 应用当前排序并按装备类型分类
      updateAvailableEquipment(newProcessedEquipment, sortOption);
    }
  }, [selectedHero, allEquipment]);
  
  // 更新可用装备列表，应用排序
  const updateAvailableEquipment = useCallback((items, option) => {
    const sorted = sortEquipment(items, option);
    
    // 按装备类型分类
    const equipmentByType = {};
    Object.values(EQUIPMENT_TYPES).forEach(type => {
      equipmentByType[type] = sorted.filter(item => {
        const mappedType = EQUIPMENT_TYPE_MAPPING[item.equipType];
        if (Array.isArray(mappedType)) {
          return mappedType.includes(type);
        }
        return mappedType === type;
      });
      
      console.log(`${EQUIPMENT_LABELS[type]} 可用装备数量: ${equipmentByType[type].length}`);
    });
    
    setAvailableEquipment(equipmentByType);
  }, [sortEquipment]);
  
  // 当排序选项变化时，重新排序装备
  useEffect(() => {
    if (processedEquipment.length > 0) {
      updateAvailableEquipment(processedEquipment, sortOption);
    }
  }, [sortOption, processedEquipment, updateAvailableEquipment]);
  
  // 处理排序选项变化
  const handleSortChange = useCallback((e) => {
    setSortOption(e.target.value);
  }, []);
  
  // 处理装备选择
  const handleEquipmentSelect = (type, item) => {
    setEquipment(prev => {
      const newEquipment = { ...prev, [type]: item };
      
      // 通知父组件
      if (onEquipmentChange) {
        onEquipmentChange(newEquipment);
      }
      
      return newEquipment;
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-400">装备选择</h2>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p>正在加载装备数据...</p>
        </div>
      </div>
    );
  }

  if (!selectedHero) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-400">装备选择</h2>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p>请先选择一个英雄</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-amber-400">装备选择</h2>
        <div className="flex items-center">
          <label className="text-sm mr-2 text-gray-300">排序:</label>
          <select 
            className="bg-gray-700 text-white text-sm rounded-md py-1 px-2 border border-gray-600"
            value={sortOption}
            onChange={handleSortChange}
          >
            {Object.entries(SORT_OPTIONS).map(([key, value]) => (
              <option key={key} value={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.HEAD} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.HEAD]}
          equipment={equipment[EQUIPMENT_TYPES.HEAD]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.HEAD] || []}
          onSelect={handleEquipmentSelect}
        />
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.CHEST} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.CHEST]}
          equipment={equipment[EQUIPMENT_TYPES.CHEST]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.CHEST] || []}
          onSelect={handleEquipmentSelect}
        />
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.NECK} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.NECK]}
          equipment={equipment[EQUIPMENT_TYPES.NECK]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.NECK] || []}
          onSelect={handleEquipmentSelect}
        />
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.HANDS} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.HANDS]}
          equipment={equipment[EQUIPMENT_TYPES.HANDS]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.HANDS] || []}
          onSelect={handleEquipmentSelect}
        />
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.WAIST} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.WAIST]}
          equipment={equipment[EQUIPMENT_TYPES.WAIST]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.WAIST] || []}
          onSelect={handleEquipmentSelect}
        />
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.FEET} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.FEET]}
          equipment={equipment[EQUIPMENT_TYPES.FEET]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.FEET] || []}
          onSelect={handleEquipmentSelect}
        />
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.FINGER_LEFT} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.FINGER_LEFT]}
          equipment={equipment[EQUIPMENT_TYPES.FINGER_LEFT]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.FINGER_LEFT] || []}
          onSelect={handleEquipmentSelect}
        />
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.FINGER_RIGHT} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.FINGER_RIGHT]}
          equipment={equipment[EQUIPMENT_TYPES.FINGER_RIGHT]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.FINGER_RIGHT] || []}
          onSelect={handleEquipmentSelect}
        />
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.WEAPON_MAIN} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.WEAPON_MAIN]}
          equipment={equipment[EQUIPMENT_TYPES.WEAPON_MAIN]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.WEAPON_MAIN] || []}
          onSelect={handleEquipmentSelect}
        />
        <EquipmentSlot 
          type={EQUIPMENT_TYPES.WEAPON_OFF} 
          label={EQUIPMENT_LABELS[EQUIPMENT_TYPES.WEAPON_OFF]}
          equipment={equipment[EQUIPMENT_TYPES.WEAPON_OFF]}
          availableEquipment={availableEquipment[EQUIPMENT_TYPES.WEAPON_OFF] || []}
          onSelect={handleEquipmentSelect}
        />
      </div>
    </div>
  );
} 