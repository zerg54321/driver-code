/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { SearchHeader } from './components/SearchHeader';
import { ResultList } from './components/ResultList';
import { DetailView } from './components/DetailView';
import { Footer } from './components/Footer';
import { MobileDetailModal } from './components/MobileDetailModal';
import { getViolationsList } from './data/lawsData';
import { ViolationItem, FilterOptions } from './types';

export default function App() {
  const allViolations = useMemo(() => getViolationsList(), []);

  const [activeTab, setActiveTab] = useState<string>('全部查询');
  const [filters, setFilters] = useState<FilterOptions>({
    keyword: '',
    onlyScore: false,
    onlyDetention: false,
    onlyRevoke: false,
    onlyForce: false,
    category: '',
  });

  // 默认在PC端选中热门条目1302（无证驾驶）或第一条
  const [selectedItem, setSelectedItem] = useState<ViolationItem | null>(() => {
    return allViolations.find((v) => v.code === '1302') || allViolations[0] || null;
  });

  // 当Tab切换时清空分类细化
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // 核心过滤计算
  const filteredList = useMemo(() => {
    return allViolations.filter((item) => {
      // 1. 分类 Tab 匹配
      if (activeTab !== '全部查询') {
        if (item.category !== activeTab) return false;
      }

      // 2. 关键词与违法代码匹配
      const kw = filters.keyword.trim().toLowerCase();
      if (kw) {
        const matchCode = item.code.toLowerCase().includes(kw);
        const matchBehavior = item.behavior.toLowerCase().includes(kw);
        const matchLaw =
          (item.behaviorLaw || '').toLowerCase().includes(kw) ||
          (item.punishLaw || '').toLowerCase().includes(kw);
        const matchRemark = (item.remark || '').toLowerCase().includes(kw);

        if (!matchCode && !matchBehavior && !matchLaw && !matchRemark) {
          return false;
        }
      }

      // 3. 严厉程度快捷条件过滤
      if (filters.onlyScore) {
        if (item.score !== '12') return false;
      }
      if (filters.onlyDetention) {
        if (!item.detentionDay) return false;
      }
      if (filters.onlyRevoke) {
        if (
          !item.revoke ||
          (!item.revoke.includes('吊销') && !item.revoke.includes('收缴'))
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allViolations, activeTab, filters]);

  // 当过滤列表变化，且选中的条目已不在新列表里时，如果是PC大屏则默认选新列表第一项
  const handleSelectItem = (item: ViolationItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden select-none sm:select-auto">
      {/* 顶部导航条 */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* 搜索与快捷筛选头 */}
      <SearchHeader
        filters={filters}
        setFilters={setFilters}
        totalCount={allViolations.length}
      />

      {/* 主体查询内容区：左右分栏布局 */}
      <main className="flex-1 flex overflow-hidden p-3 sm:p-6 gap-4 sm:gap-6 bg-[#F8FAFC]">
        {/* 左侧查询结果列表 */}
        <ResultList
          items={filteredList}
          selectedItem={selectedItem}
          onSelect={handleSelectItem}
        />

        {/* 右侧展开详情区（仅在PC大屏显示） */}
        <div className="hidden lg:flex flex-1 overflow-hidden h-full shrink">
          <DetailView item={selectedItem} />
        </div>
      </main>

      {/* 底部版权与免责声明 */}
      <Footer />

      {/* 移动端弹窗/抽屉详情区（仅在手机端点击条目时触发） */}
      <MobileDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
