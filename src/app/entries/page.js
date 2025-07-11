import EntryViewer from '@/components/EntryViewer';
import Layout from '@/components/Layout';

export default function EntriesPage() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">游戏词条库</h1>
        <p className="text-gray-400">了解火炬之光无限的游戏机制和词条效果</p>
      </div>
      
      <EntryViewer />
      
      <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-amber-400">词条知识</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            在火炬之光无限中，理解游戏的各种词条和机制对于打造有效的角色构建至关重要。
            通过深入了解伤害计算方式、属性加成和各种状态效果，你可以优化你的装备和技能选择。
          </p>
          <p>
            特别需要注意的是伤害叠加和叠乘规则：在没有特殊标注的情况下，一条词缀内部的额外加成叠加计算。
            词缀内部的额外加成叠乘计算的词缀，会在词缀中标注"叠乘"字样。
          </p>
          <p>
            对于新手玩家，建议首先了解基础属性（力量、敏捷、智慧）对你选择职业的影响，
            以及不同伤害类型（物理、火焰、冰冷、闪电、腐蚀）的特性和相应的异常状态效果。
          </p>
        </div>
      </div>
    </Layout>
  );
} 