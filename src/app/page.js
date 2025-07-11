import Layout from '@/components/Layout';
import { useState, useEffect, useRef } from 'react';
import heroDataS8 from '@/json/hero.s8.json';

export default function Home() {
  const [season, setSeason] = useState('s8');
  const [heroes, setHeroes] = useState([]);
  const [selectedHero, setSelectedHero] = useState(null);
  const [availableSeasons, setAvailableSeasons] = useState(['s8']);
  const availableSeasonsRef = useRef(['s8']);

  // 动态加载英雄数据
  useEffect(() => {
    const loadHeroData = async () => {
      try {
        let heroData;
        
        // 根据赛季加载不同的数据
        if (season === 's8') {
          heroData = heroDataS8;
        } else if (season === 's9') {
          // 尝试动态导入 S9 数据
          try {
            const s9Module = await import('@/json/hero.s9.json');
            heroData = s9Module.default;
            
            // 如果成功加载了 S9 数据，将其添加到可用赛季中
            if (!availableSeasonsRef.current.includes('s9')) {
              availableSeasonsRef.current.push('s9');
              setAvailableSeasons([...availableSeasonsRef.current]);
            }
          } catch (error) {
            console.error('S9 数据尚未可用:', error);
            heroData = [];
          }
        }
        
        setHeroes(heroData || []);
        setSelectedHero(null); // 重置选中的英雄
      } catch (error) {
        console.error('加载英雄数据失败:', error);
        setHeroes([]);
      }
    };

    loadHeroData();
  }, [season]);

  // 检查 S9 数据是否可用
  useEffect(() => {
    const checkS9Availability = async () => {
      try {
        await import('@/json/hero.s9.json');
        if (!availableSeasonsRef.current.includes('s9')) {
          availableSeasonsRef.current.push('s9');
          setAvailableSeasons([...availableSeasonsRef.current]);
        }
      } catch (error) {
        // S9 数据不可用，不做任何操作
      }
    };

    checkS9Availability();
  }, []);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amber-400">火炬之光：无限 构建工具</h1>
        <div className="flex items-center space-x-2">
          <span>赛季:</span>
          <select 
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            <option value="s8">S8 赛季</option>
            <option value="s9" disabled={!availableSeasons.includes('s9')}>
              S9 赛季 {!availableSeasons.includes('s9') && '(即将更新)'}
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧 - 职业选择 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-amber-400">选择职业</h2>
          {heroes.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {heroes.map((hero, index) => (
                <div 
                  key={index} 
                  className={`bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-amber-900 transition ${selectedHero === hero ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={() => setSelectedHero(hero)}
                >
                  <h3 className="text-center text-sm">{hero.name.split('|')[0]}</h3>
                  <div className="flex justify-center my-2">
                    <img 
                      src={hero.avatar} 
                      alt={hero.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-300 text-center">{hero.name.split('|')[1] || ''}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p>当前赛季数据尚未可用</p>
            </div>
          )}
        </div>

        {/* 中间 - 技能和属性 */}
        <div className="lg:col-span-2">
          {/* 技能选择 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4 text-amber-400">技能配置</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">主动技能1</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">主动技能2</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">主动技能3</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">辅助技能1</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">辅助技能2</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">被动技能</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">技能搭配推荐</h3>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm">
                  {selectedHero 
                    ? "根据您选择的职业和技能方向，推荐以下技能搭配..." 
                    : "请先选择一个英雄来查看技能搭配推荐"}
                </p>
              </div>
            </div>
          </div>

          {/* 属性分配 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-amber-400">属性分配</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">力量</span>
                  <span className="bg-amber-600 px-2 py-1 rounded text-sm">120</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">敏捷</span>
                  <span className="bg-amber-600 px-2 py-1 rounded text-sm">85</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">智慧</span>
                  <span className="bg-amber-600 px-2 py-1 rounded text-sm">65</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">魔力</span>
                  <span className="bg-amber-600 px-2 py-1 rounded text-sm">150</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">属性说明</h3>
              <div className="bg-gray-700 p-3 rounded-lg text-sm">
                <p><span className="text-amber-400">力量:</span> 每1点力量额外增加0.5%主属性包含力量的技能伤害</p>
                <p><span className="text-amber-400">敏捷:</span> 每1点敏捷额外增加0.5%主属性包含敏捷的技能伤害</p>
                <p><span className="text-amber-400">智慧:</span> 每1点智慧额外增加0.5%主属性包含智慧的技能伤害</p>
                <p><span className="text-amber-400">魔力:</span> 用于施放技能，初始40点，每升1级增加5点</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧 - 装备和伤害统计 */}
        <div>
          {/* 英雄描述 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4 text-amber-400">英雄特性</h2>
            <div className="bg-gray-700 p-3 rounded-lg">
              {selectedHero ? (
                <>
                  <h3 className="font-semibold mb-2">{selectedHero.name}</h3>
                  <p className="text-sm">{selectedHero.desc}</p>
                </>
              ) : (
                <p className="text-sm">选择一个英雄查看其特性描述...</p>
              )}
            </div>
          </div>
          
          {/* 装备选择 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4 text-amber-400">装备选择</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">武器</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">头盔</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">胸甲</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">手套</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">腰带</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">鞋子</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">项链</p>
              </div>
              <div className="bg-gray-700 p-2 rounded-lg text-center">
                <div className="w-10 h-10 bg-gray-600 mx-auto mb-1"></div>
                <p className="text-xs">戒指</p>
              </div>
            </div>
          </div>

          {/* 伤害统计 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-amber-400">伤害统计</h2>
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>基础伤害</span>
                  <span className="text-amber-400">1250</span>
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>暴击率</span>
                  <span className="text-amber-400">35%</span>
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>暴击伤害</span>
                  <span className="text-amber-400">180%</span>
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>攻击速度</span>
                  <span className="text-amber-400">1.75</span>
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>每秒伤害</span>
                  <span className="text-amber-400">2850</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">伤害类型分布</h3>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">火焰: 45%</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">冰冷: 25%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">物理: 30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部 - 构建保存和分享 */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-400">构建摘要</h2>
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 rounded-lg transition ${selectedHero 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : 'bg-gray-600 cursor-not-allowed'}`}
              disabled={!selectedHero}
            >
              保存构建
            </button>
            <button 
              className={`px-4 py-2 rounded-lg transition ${selectedHero 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-600 cursor-not-allowed'}`}
              disabled={!selectedHero}
            >
              分享构建
            </button>
          </div>
        </div>
        <div className="mt-4 bg-gray-700 p-4 rounded-lg">
          {selectedHero ? (
            <>
              <h3 className="font-semibold mb-2">{selectedHero.name} - 构建方案</h3>
              <p className="text-sm text-gray-300">
                根据所选英雄特性，您可以创建一个专属构建方案。完成技能、属性和装备配置后，可以保存和分享您的构建。
              </p>
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-2">选择英雄构建</h3>
              <p className="text-sm text-gray-300">请选择一个英雄来创建构建方案。构建方案将包含技能、属性和装备配置，以及伤害统计分析。</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
