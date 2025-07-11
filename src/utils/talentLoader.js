/**
 * 映射英雄职业到天赋职业
 * @param {string} heroClass - 英雄职业名称
 * @returns {string} - 对应的天赋职业名称
 */
export function mapHeroClassToTalentClass(heroClass) {
  // 英雄职业到天赋职业的映射
  const classMapping = {
    '战士': '战士',
    '法师': '元素师',
    '刺客': '刀锋行者',
    '射手': '猎人',
    '召唤师': '召唤师',
    // 添加更多映射...
  };
  
  return classMapping[heroClass] || heroClass;
}

/**
 * 加载所有可用的天赋数据
 * @returns {Promise<Object>} - 包含所有天赋数据的对象
 */
export async function loadAllTalents() {
  try {
    // 获取所有可用的天赋职业
    const classesResponse = await fetch('/json/talent/index.json');
    if (!classesResponse.ok) {
      throw new Error(`获取天赋职业列表失败: ${classesResponse.status}`);
    }
    const talentClasses = await classesResponse.json();
    
    // 为每个职业加载天赋数据
    const allTalents = {};
    
    await Promise.all(talentClasses.map(async (talentClass) => {
      try {
        const response = await fetch(`/json/talent/${encodeURIComponent(talentClass)}.json`);
        if (!response.ok) {
          console.error(`加载 ${talentClass} 天赋数据失败: ${response.status}`);
          return;
        }
        
        const talentData = await response.json();
        allTalents[talentClass] = talentData;
      } catch (error) {
        console.error(`加载 ${talentClass} 天赋数据出错:`, error);
      }
    }));
    
    return allTalents;
  } catch (error) {
    console.error('加载天赋数据出错:', error);
    throw error;
  }
}

/**
 * 获取主要天赋列表
 * @returns {Promise<string[]>} - 主要天赋名称列表
 */
export async function getMainTalents() {
  try {
    const response = await fetch('/json/main-talent.json');
    if (!response.ok) {
      throw new Error(`获取主要天赋列表失败: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取主要天赋列表出错:', error);
    throw error;
  }
} 