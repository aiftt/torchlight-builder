'use client';

import { useState, useEffect } from 'react';

const ENTRY_CATEGORIES = [
  { id: 'damage', name: '伤害机制' },
  { id: 'attributes', name: '基础属性' },
  { id: 'skills', name: '技能类型' },
  { id: 'status', name: '状态效果' },
  { id: 'all', name: '全部词条' }
];

// 示例词条数据
const ENTRIES = [
  {
    id: 'damage-form',
    title: '伤害形式',
    category: 'damage',
    content: '游戏中目前有五种伤害形式：击中伤害、持续伤害、间接伤害、反射伤害、真实伤害。',
    details: [
      '击中伤害一般是由攻击或者法术造成的，单次结算的伤害。没有特别说明时，技能造成的伤害都是击中伤害。',
      '持续伤害在一段时间内，不断对目标造成伤害。',
      '间接伤害一般作为某些行为的附带效果出现，例如"击败时使敌人爆炸"。',
      '反射伤害是防御方承受击中伤害或间接伤害时，能够对攻击方造成一定的反射伤害。',
      '真实伤害是基于固定比例的其他伤害形式的最终伤害成的伤害，不会再次受到任何加成影响，并且无视抗性，护甲和护盾。'
    ]
  },
  {
    id: 'damage-type',
    title: '伤害类型',
    category: 'damage',
    content: '游戏中目前有五种伤害类型：物理、火焰、冰冷、闪电、腐蚀。',
    details: [
      '任何一个伤害都必定属于下列五种伤害类型之一：物理、火焰、冰冷、闪电、腐蚀',
      '除了物理伤害以外，其余的伤害类型受到对应抗性的影响。'
    ]
  },
  {
    id: 'damage-calculation',
    title: '伤害计算',
    category: 'damage',
    content: '伤害值=基础伤害*(1+所有非额外百分比加成)*(1+额外百分比加成1)*(1+额外百分比加成2)...',
    details: [
      '与属性的计算方法类似，伤害的计算值=基础伤害*(1+所有的百分比增加伤害)*(1+额外百分比增加伤害1)*(1+额外百分比增加伤害2)...'
    ]
  },
  {
    id: 'critical-hit',
    title: '暴击',
    category: 'damage',
    content: '造成击中伤害时，有一定几率产生暴击。',
    details: [
      '造成击中伤害时，有一定几率产生暴击。一次技能造成多次击中时（例如螺旋击），往往只进行一次暴击的判定。',
      '暴击值：攻击时，武器的基础暴击值会参与这次技能的暴击值计算；施法时，法术的基础暴击值会参与这次技能的暴击值计算。',
      '最终暴击值=基础暴击值之和*(1+所有非额外百分比加成)*(1+额外百分比加成1)*(1+额外百分比加成2)...',
      '暴击的几率=最终暴击值/100。',
      '所有单位默认具有150%的暴击伤害。暴击时，该次击中造成的伤害提升为：原本的伤害*暴击伤害百分比。'
    ]
  },
  {
    id: 'strength',
    title: '力量',
    category: 'attributes',
    content: '每1点力量额外增加0.5%主属性包含力量的技能的伤害。',
    details: [
      '每1点力量额外增加0.5%主属性包含力量的技能的伤害，包括技能本身的伤害、技能直接造成的异常伤害和技能召唤出的召唤物的伤害。',
      '技能具有多种主属性时，主属性先叠加计算，再计算最终的伤害加成。'
    ]
  },
  {
    id: 'agility',
    title: '敏捷',
    category: 'attributes',
    content: '每1点敏捷额外增加0.5%主属性包含敏捷的技能的伤害。',
    details: [
      '每1点敏捷额外增加0.5%主属性包含敏捷的技能的伤害，包括技能本身的伤害、技能直接造成的异常伤害和技能召唤出的召唤物的伤害。',
      '技能具有多种主属性时，主属性先叠加计算，再计算最终的伤害加成。'
    ]
  },
  {
    id: 'wisdom',
    title: '智慧',
    category: 'attributes',
    content: '每1点智慧额外增加0.5%主属性包含智慧的技能的伤害。',
    details: [
      '每1点智慧额外增加0.5%主属性包含智慧的技能的伤害，包括技能本身的伤害、技能直接造成的异常伤害和技能召唤出的召唤物的伤害。',
      '技能具有多种主属性时，主属性先叠加计算，再计算最终的伤害加成。'
    ]
  },
  {
    id: 'mana',
    title: '魔力',
    category: 'attributes',
    content: '魔力用于施放技能。当前魔力小于技能消耗时无法施放技能。',
    details: [
      '玩家初始拥有40点最大魔力。等级每升1级增加5点最大魔力。',
      '玩家初始具有每秒自然回复7魔力和每秒自然回复1.75%魔力。',
      '当单位的当前魔力≤最大魔力的35%时，被视作处于低魔状态。',
      '当单位的当前魔力≥最大魔力的95%时，被视作处于满魔状态。'
    ]
  },
  {
    id: 'burn',
    title: '点燃',
    category: 'status',
    content: '一种造成持续火焰伤害的异常状态。',
    details: [
      '点燃造成持续火焰伤害，初始持续时间为4秒。',
      '对敌人造成点燃时，每秒对其造成等同于基础点燃伤害的持续火焰伤害。',
      '点燃默认具有"额外+30%加剧效果"。',
      '点燃伤害默认上限为1层，可通过后续养成增加点燃的层数上限。多个点燃同时存在于一个单位时，伤害最高的n(点燃层数上限)层点燃生效。'
    ]
  },
  {
    id: 'freeze',
    title: '冰结和冰封',
    category: 'status',
    content: '一般由冰冷伤害击中引发的，控制类的异常状态。',
    details: [
      '冰结能够造成减速，冰封能够令目标造成的伤害降低，并且令非传奇首领目标无法行动。',
      '所有冰冷伤害默认都有0%几率造成冰结。',
      '被冰结的目标降低10%的攻击、施法与移动速度，并且每秒被施加10点冰结值，持续时间无限。',
      '当一个单位的冰结值累积超过100点时，该单位的会被冰封，基础持续时间为1.5秒。'
    ]
  }
];

export default function EntryViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filteredEntries, setFilteredEntries] = useState(ENTRIES);

  // 过滤词条
  useEffect(() => {
    let result = ENTRIES;
    
    // 按类别过滤
    if (selectedCategory !== 'all') {
      result = result.filter(entry => entry.category === selectedCategory);
    }
    
    // 按搜索词过滤
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(entry => 
        entry.title.toLowerCase().includes(lowerSearchTerm) || 
        entry.content.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredEntries(result);
  }, [searchTerm, selectedCategory]);

  // 选择词条查看详情
  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-amber-400">游戏词条查询</h2>
      
      {/* 搜索和过滤 */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="搜索词条..."
            className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 flex-grow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {ENTRY_CATEGORIES.map(category => (
              <button
                key={category.id}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category.id 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 词条列表和详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 词条列表 */}
        <div className="lg:col-span-1 h-[400px] overflow-y-auto pr-2">
          {filteredEntries.length > 0 ? (
            <div className="space-y-2">
              {filteredEntries.map(entry => (
                <div 
                  key={entry.id}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedEntry?.id === entry.id 
                      ? 'bg-amber-900 border-l-4 border-amber-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handleSelectEntry(entry)}
                >
                  <h3 className="font-semibold">{entry.title}</h3>
                  <p className="text-sm text-gray-300 truncate">{entry.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              没有找到匹配的词条
            </div>
          )}
        </div>
        
        {/* 词条详情 */}
        <div className="lg:col-span-2 bg-gray-700 rounded-lg p-4 h-[400px] overflow-y-auto">
          {selectedEntry ? (
            <>
              <h3 className="text-xl font-bold text-amber-400 mb-4">{selectedEntry.title}</h3>
              <p className="mb-4">{selectedEntry.content}</p>
              <div className="space-y-2">
                {selectedEntry.details.map((detail, index) => (
                  <p key={index} className="text-gray-300">• {detail}</p>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>选择一个词条查看详细信息</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 