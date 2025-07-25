# 火炬之光：无限 构建工具

这是一个为火炬之光：无限游戏设计的角色构建工具，帮助玩家规划和优化他们的角色构建。

## 主要功能

### 1. 英雄选择
- 选择各职业的英雄
- 显示英雄基础信息和描述

### 2. 特性选择
- 显示英雄的1级基础特性
- 可选择45/60/75级特性

### 3. 天赋树
- 动态加载所有职业的天赋数据
- 根据英雄职业自动匹配对应的天赋树
- 可选择核心天赋和常规天赋
- 有限的可用点数分配

### 4. 属性计算
- 根据职业设置基础属性值(力量、敏捷、智慧、魔力)
- 特性选择影响属性加成
- 天赋选择影响属性加成
- 装备属性加成(待实现)

### 5. 伤害计算
- 基础伤害受主属性和特性、天赋影响
- 暴击率受敏捷和天赋影响
- 暴击伤害受力量和天赋影响
- 攻击速度和DPS动态计算

### 6. 装备选择
- 武器、防具和饰品选择(待完善)
- 装备属性加成(待实现)

### 7. 构建管理
- 保存构建(待实现)
- 分享构建(待实现)

## 技术实现

- 基于Next.js框架
- 使用React Hooks进行状态管理
- 动态数据加载和计算
- 响应式UI设计

## 未来计划

- 完善装备系统
- 添加技能选择和计算
- 实现构建保存和分享功能
- 添加更多统计数据和图表显示
