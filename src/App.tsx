/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchHeader } from './components/SearchHeader';
import { ResultList } from './components/ResultList';
import { DetailView } from './components/DetailView';
import { Footer } from './components/Footer';
import { MobileDetailModal } from './components/MobileDetailModal';
import { LawStudy } from './components/LawStudy';
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

  // 初始设为 null，避免移动端加载时直接弹出弹窗
  const [selectedItem, setSelectedItem] = useState<ViolationItem | null>(null);

  // 在 PC 大屏幕上（宽度 >= 1024px）如果未选择任何项，则默认选中热门条目 1043
  useEffect(() => {
    const selectDefaultOnDesktop = () => {
      if (window.innerWidth >= 1024 && !selectedItem) {
        const defaultItem = allViolations.find((v) => v.code === '1043') || allViolations[0] || null;
        setSelectedItem(defaultItem);
      }
    };

    selectDefaultOnDesktop();

    const handleResize = () => {
      if (window.innerWidth >= 1024 && !selectedItem) {
        const defaultItem = allViolations.find((v) => v.code === '1043') || allViolations[0] || null;
        setSelectedItem(defaultItem);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [allViolations, selectedItem]);

  const [jumpLawId, setJumpLawId] = useState<string | undefined>(undefined);
  const [jumpArticleNum, setJumpArticleNum] = useState<number | undefined>(undefined);

  const handleJumpToLaw = (db: 'law' | 'reg' | 'bj', artNum: number) => {
    const dbMap: Record<string, string> = {
      law: 'road_law',
      reg: 'road_law_rules',
      bj: 'bj_road_rules'
    };
    
    setJumpLawId(dbMap[db]);
    setJumpArticleNum(artNum);
    setActiveTab('法律法规学习');
    setSelectedItem(null); // Close mobile modal
  };

  const handleClearJump = () => {
    setJumpLawId(undefined);
    setJumpArticleNum(undefined);
  };

  // 当Tab切换时清空分类细化
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // 核心过滤计算
  const filteredList = useMemo(() => {
    return allViolations.filter((item) => {
      // 1. 分类 Tab 匹配
      if (activeTab !== '全部查询' && activeTab !== '法律法规学习') {
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

  const handleSelectItem = (item: ViolationItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden select-none sm:select-auto">
      {/* 顶部导航条 */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {activeTab === '法律法规学习' ? (
        <LawStudy
          initialLawId={jumpLawId}
          initialArticleNum={jumpArticleNum}
          onClearJump={handleClearJump}
        />
      ) : (
        <>
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
              <DetailView item={selectedItem} onJumpToLaw={handleJumpToLaw} />
            </div>
          </main>
        </>
      )}

      {/* 底部版权与免责声明 */}
      <Footer />

      {/* 移动端弹窗/抽屉详情区（仅在手机端点击条目时触发） */}
      <MobileDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onJumpToLaw={handleJumpToLaw}
      />
    </div>
  );
}
