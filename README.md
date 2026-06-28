# 🚦 Driver-Code

A zero-latency, offline-first data dictionary for traffic guidance and cross-source metadata linking.

`Driver-Code` 是一个专为车主、前线物流从业人员及独立技术人设计的**交管代码与多源文本联动极速检索工具**。项目采用全客户端（Client-side）轻量化架构，对官方高冗余文本进行深度“脱水”，旨在用技术手段消除信息不对称，还原清爽的路权规则查阅体验。

---

## ✨ Features | 核心亮点

* ⚡️ **Zero-Latency & Offline-First**
  全量结构化违法代码数据（700+ 条记录）纯前端加载，0ms 极速响应。无任何后端数据库依赖，即便在地下车库、高速公路上信号极差的环境下，依然支持 100% 离线查阅。
* ⛓️ **Cross-Source Meta Linking (四源联动)**
  彻底打破“法条孤岛”现象。通过前端正则与数据映射，输入任一违法代码，系统自动秒级织网，实现“**违法行为定性 ➡️ 罚款扣分标准 ➡️ 地方实施办法 ➡️ 核心法理依据**”的因果一体化看板展示。
* 📝 **Data De-redundancy (文本脱水)**
  剔除官方文本中所有宏大叙事与行政宣告文字，仅保留最具实际执法意义、现场据理力争所需的“硬核条款骨架”，大幅降低普通人的研读门槛。
* 📱 **Fluid Responsive UI (双端响应式适配)**
  PC 端采用“左侧检索列表 + 右侧固定详情看板”的高效分栏布局；手机端原生适配“顶部吸顶搜索 + 底部抽屉展开（BottomSheet）”的单手触控优化，极速、克制、无广告。

---

🛠️ Tech Stack | 技术栈（修正版）
* Bundler / Build Tool: Vite (Lightning-fast HMR)
* Library: React 18 / 19 (Functional Components + Hooks)
* Styling: Tailwind CSS (Utility-first styling)
* Language: TypeScript (Strict type safety)
* Data Layer: Modular Static Partitions (rawCsvPart1.ts etc.)

---