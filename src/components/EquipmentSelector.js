'use client'

import { useState, useEffect } from 'react';
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

// 装备类型映射
const EQUIPMENT_TYPE_MAPPING = {
  'Helmet': EQUIPMENT_TYPES.HEAD,
  'Armor': EQUIPMENT_TYPES.CHEST,
  'Amulet': EQUIPMENT_TYPES.NECK,
  'Gloves': EQUIPMENT_TYPES.HANDS,
  'Belt': EQUIPMENT_TYPES.WAIST,
  'Shoes': EQUIPMENT_TYPES.FEET,
  'Ring': [EQUIPMENT_TYPES.FINGER_LEFT, EQUIPMENT_TYPES.FINGER_RIGHT],
  'Weapon': [EQUIPMENT_TYPES.WEAPON_MAIN, EQUIPMENT_TYPES.WEAPON_OFF],
  'Shield': EQUIPMENT_TYPES.WEAPON_OFF,
  'Wand': EQUIPMENT_TYPES.WEAPON_MAIN,
  '1HSword': EQUIPMENT_TYPES.WEAPON_MAIN,
  '2HSword': EQUIPMENT_TYPES.WEAPON_MAIN,
  '1HMace': EQUIPMENT_TYPES.WEAPON_MAIN,
  '2HMace': EQUIPMENT_TYPES.WEAPON_MAIN,
  'Bow': EQUIPMENT_TYPES.WEAPON_MAIN,
  'Claw': EQUIPMENT_TYPES.WEAPON_MAIN
};

export default function EquipmentSelector({ selectedHero, onEquipmentChange }) {
  const [equipment, setEquipment] = useState({});
  const [availableEquipment, setAvailableEquipment] = useState({});
  const [allEquipment, setAllEquipment] = useState([]);
  
  // 加载所有装备数据
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch('/json/equipment.json');
        if (!response.ok) {
          throw new Error('Failed to fetch equipment data');
        }
        const data = await response.json();
        setAllEquipment(data);
      } catch (error) {
        console.error('Error loading equipment data:', error);
      }
    };
    
    fetchEquipment();
  }, []);
  
  // 当选择英雄或装备数据加载时，处理可用装备
  useEffect(() => {
    if (selectedHero && allEquipment.length > 0) {
      // 重置已选装备
      setEquipment({});
      
      // 将装备转换为适合显示的格式
      const processedEquipment = allEquipment.map(item => {
        // 从URL中提取装备类型
        const urlParts = item.img.split('/');
        const typeIndicator = urlParts[urlParts.length - 2]; // 例如 Armor, Helmet 等
        
        // 确定装备类型
        let equipType = 'unknown';
        for (const [key, value] of Object.entries(EQUIPMENT_TYPE_MAPPING)) {
          if (typeIndicator.includes(key)) {
            equipType = key;
            break;
          }
        }
        
        // 构建装备对象
        return {
          id: item.name,
          name: item.name,
          type: equipType,
          icon: item.img,
          stats: item.list.map(stat => {
            return { name: stat, value: '' };
          }),
          description: `${item.name} (等级 ${item.level})`,
          requirements: [`等级 ${item.level}`],
          equipType
        };
      });
      
      // 按装备类型分类
      const equipmentByType = {};
      Object.values(EQUIPMENT_TYPES).forEach(type => {
        equipmentByType[type] = processedEquipment.filter(item => {
          const mappedType = EQUIPMENT_TYPE_MAPPING[item.equipType];
          if (Array.isArray(mappedType)) {
            return mappedType.includes(type);
          }
          return mappedType === type;
        });
      });
      
      setAvailableEquipment(equipmentByType);
    }
  }, [selectedHero, allEquipment]);
  
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
      <h2 className="text-xl font-bold mb-4 text-amber-400">装备选择</h2>
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