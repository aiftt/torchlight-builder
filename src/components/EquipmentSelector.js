'use client'

export default function EquipmentSelector({ selectedHero }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-amber-400">装备选择</h2>
      {selectedHero ? (
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
      ) : (
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p>请先选择一个英雄</p>
        </div>
      )}
    </div>
  );
} 