// 这个函数用于动态加载所有职业的天赋数据
export async function loadAllTalents() {
  // 所有可能的职业名称（对应json文件名）
  const talentClasses = [
    '炼金术士', '钢铁先锋', '机械师', '暗影术士', '异能者', '驭影者',
    '游侠', '影舞者', '神行武士', '元素师', '秘术师', '魔导师', 
    '德鲁伊', '刀锋行者', '神射手', '督军', '猛袭者', '勇者',
    '机械之神', '欺诈之神', '征战之神', '知识之神', '狩猎之神', '巨力之神'
  ];

  // 用于存储所有职业的天赋数据
  const allTalents = {};

  // 并行加载所有天赋数据
  const loadPromises = talentClasses.map(async (className) => {
    try {
      const data = await import(`@/json/talent/${className}.json`);
      allTalents[className] = data;
      return { className, success: true };
    } catch (error) {
      console.error(`加载天赋数据失败: ${className}`, error);
      return { className, success: false, error };
    }
  });

  // 等待所有加载完成
  await Promise.all(loadPromises);
  
  return allTalents;
}

// 根据英雄职业名查找对应的天赋职业
export function mapHeroClassToTalentClass(heroClass) {
  // 去除空格和特殊字符，方便匹配
  const normalizedHeroClass = heroClass.trim();
  
  // 映射表：英雄职业 -> 天赋职业
  const classMapping = {
    // 直接匹配的情况
    '炼金术士': '炼金术士',
    '钢铁先锋': '钢铁先锋',
    '机械师': '机械师',
    '暗影术士': '暗影术士',
    '异能者': '异能者',
    '驭影者': '驭影者',
    '游侠': '游侠',
    '影舞者': '影舞者',
    '神行武士': '神行武士',
    '元素师': '元素师',
    '秘术师': '秘术师',
    '魔导师': '魔导师',
    '德鲁伊': '德鲁伊',
    '刀锋行者': '刀锋行者',
    '神射手': '神射手',
    '督军': '督军',
    '猛袭者': '猛袭者',
    '勇者': '勇者',
    
    // 部分匹配的情况
    '怒火': '征战之神',
    '战火': '巨力之神',
    '机械': '机械之神',
    '猎人': '狩猎之神',
    '影': '欺诈之神',
    '焰': '元素师',
    '冰': '元素师',
    '知识': '知识之神',
  };
  
  // 先尝试直接匹配
  if (classMapping[normalizedHeroClass]) {
    return classMapping[normalizedHeroClass];
  }
  
  // 如果直接匹配失败，尝试部分匹配
  for (const [key, value] of Object.entries(classMapping)) {
    if (normalizedHeroClass.includes(key)) {
      return value;
    }
  }
  
  // 默认返回一个通用职业
  return '勇者';
} 