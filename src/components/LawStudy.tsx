import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getLawsList } from '../data/lawsData';
import { BookOpen, Search, Scale, ChevronRight, FileText, Bookmark, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LawStudyProps {
  initialLawId?: string;
  initialArticleNum?: number;
  onClearJump?: () => void;
}

export const LawStudy: React.FC<LawStudyProps> = ({
  initialLawId,
  initialArticleNum,
  onClearJump
}) => {
  const laws = useMemo(() => getLawsList(), []);

  // Selected Law
  const [selectedLawId, setSelectedLawId] = useState<string>('road_law');
  const currentLaw = useMemo(() => {
    return laws.find((l) => l.law_id === selectedLawId) || laws[0];
  }, [laws, selectedLawId]);

  // Selected Chapter / Catalog Filter
  const [activeChapter, setActiveChapter] = useState<string>('');

  // Search input
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ref to the article elements for scrolling
  const articleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Initialize selected chapter when current law changes or a valid jump is received
  useEffect(() => {
    if (!currentLaw.catalogs || currentLaw.catalogs.length === 0) {
      setActiveChapter('');
      return;
    }

    // If we jumped with a specific article, find which chapter has it
    if (initialLawId === selectedLawId && initialArticleNum) {
      const artStr = initialArticleNum.toString();
      const foundCatalog = currentLaw.catalogs.find((cat) =>
        cat.sections.some((sec) => sec.articles.includes(artStr))
      );
      if (foundCatalog) {
        setActiveChapter(foundCatalog.chapter);
        return;
      }
    }

    // Only fallback to the first chapter if the current activeChapter is not valid for this law
    const isCurrentChapterValid = currentLaw.catalogs.some((cat) => cat.chapter === activeChapter);
    if (!isCurrentChapterValid) {
      setActiveChapter(currentLaw.catalogs[0].chapter);
    }
  }, [selectedLawId, initialLawId, initialArticleNum]);

  // Support jumping to a specific article
  useEffect(() => {
    if (initialLawId) {
      setSelectedLawId(initialLawId);
    }
    if (initialLawId && initialArticleNum) {
      // Short delay to allow DOM to render
      const timer = setTimeout(() => {
        const element = articleRefs.current[initialArticleNum.toString()];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Flash highlight
          element.classList.add('bg-amber-50', 'border-amber-300', 'ring-2', 'ring-amber-200');
          setTimeout(() => {
            element.classList.remove('bg-amber-50', 'border-amber-300', 'ring-2', 'ring-amber-200');
            if (onClearJump) onClearJump();
          }, 3000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initialLawId, initialArticleNum]);

  // Get articles belonging to the active chapter
  const chapterArticles = useMemo(() => {
    if (!activeChapter || searchQuery) return [];
    const cat = currentLaw.catalogs.find((c) => c.chapter === activeChapter);
    if (!cat) return [];

    const articleIds: string[] = [];
    cat.sections.forEach((sec) => {
      sec.articles.forEach((art) => {
        articleIds.push(art);
      });
    });
    return articleIds;
  }, [currentLaw, activeChapter, searchQuery]);

  // Search filter across the entire law
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const results: string[] = [];
    const entities = currentLaw.entities as Record<string, any>;

    Object.entries(entities).forEach(([artNum, data]) => {
      // 1. Search by article number (e.g. "第36条", "36")
      const matchesNum = artNum === query || `第${artNum}条`.includes(query) || data.title.includes(query);
      
      // 2. Search in content text
      let matchesContent = false;
      if (data.clauses) {
        Object.values(data.clauses).forEach((clause: any) => {
          if (clause.text.toLowerCase().includes(query)) {
            matchesContent = true;
          }
          if (clause.items) {
            Object.values(clause.items).forEach((itemText: any) => {
              if (itemText.toLowerCase().includes(query)) {
                matchesContent = true;
              }
            });
          }
        });
      }

      if (matchesNum || matchesContent) {
        results.push(artNum);
      }
    });

    // Sort article numbers numerically
    return results.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [currentLaw, searchQuery]);

  // Which list of article IDs to display on the right
  const displayedArticleIds = useMemo(() => {
    if (searchQuery) {
      return searchResults;
    }
    return chapterArticles;
  }, [searchQuery, searchResults, chapterArticles]);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* 左侧控制栏 / 侧边栏 */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 md:h-full overflow-hidden">
        {/* 三部法律选择卡片 */}
        <div className="p-4 border-b border-slate-100 shrink-0">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            选择法律法规
          </label>
          <div className="space-y-1.5">
            {laws.map((law) => {
              const isSelected = law.law_id === selectedLawId;
              return (
                <button
                  key={law.law_id}
                  onClick={() => {
                    setSelectedLawId(law.law_id);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-start space-x-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-xs'
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-l-4 border-transparent'
                  }`}
                >
                  <Scale className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="leading-tight">
                    <div className="font-semibold">{law.law_name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">版本: {law.version}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索法条 (如 '36' 或 '超速')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-100 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1 rounded cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 章节目录大纲 (仅在无搜索时显示) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
          <AnimatePresence mode="wait">
            {!searchQuery ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  章节目录
                </div>
                {currentLaw.catalogs.map((cat) => {
                  const isActive = cat.chapter === activeChapter;
                  return (
                    <button
                      key={cat.chapter}
                      onClick={() => setActiveChapter(cat.chapter)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className="truncate">{cat.chapter}</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? 'rotate-90 text-slate-600' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              <div className="p-2 text-center text-slate-400 text-xs">
                正在展示全法搜索结果
                <div className="mt-1 text-[10px]">共找到 {searchResults.length} 条匹配</div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 右侧条文阅读区 */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col h-full bg-[#FAFAFA]">
        {/* 面包屑 / 当前标题 */}
        <div className="mb-6 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>法律法规库</span>
            <ChevronRight className="w-2.5 h-2.5" />
            <span className="font-medium text-slate-600 truncate max-w-[200px] sm:max-w-xs">{currentLaw.law_name}</span>
            {!searchQuery && (
              <>
                <ChevronRight className="w-2.5 h-2.5" />
                <span className="text-slate-500 font-semibold truncate max-w-[150px] sm:max-w-xs">{activeChapter}</span>
              </>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {searchQuery ? '全法检索匹配条文' : activeChapter || '法律正文'}
            {searchQuery && (
              <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                共 {searchResults.length} 条结果
              </span>
            )}
          </h2>
        </div>

        {/* 条文列表 */}
        <div className="flex-1 space-y-6 max-w-3xl">
          <AnimatePresence mode="popLayout">
            {displayedArticleIds.length > 0 ? (
              displayedArticleIds.map((artId) => {
                const entity = (currentLaw.entities as any)[artId];
                if (!entity) return null;

                const hasClauses = entity.clauses && Object.keys(entity.clauses).length > 0;

                return (
                  <motion.div
                    key={artId}
                    ref={(el) => {
                      articleRefs.current[artId] = el;
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs transition-all hover:shadow-sm duration-300 relative group"
                  >
                    {/* 装饰书签 */}
                    <div className="absolute top-0 right-6 w-5 h-6 bg-slate-100 rounded-b-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Bookmark className="w-3 h-3 text-slate-400" />
                    </div>

                    {/* 法条标题 */}
                    <div className="flex items-center space-x-2.5 mb-4 pb-2 border-b border-slate-100">
                      <div className="w-2 h-4 bg-blue-600 rounded-xs"></div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight font-sans">
                        {entity.title}
                      </h3>
                      {searchQuery && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                          来自: {entity.chapter || '正文'}
                        </span>
                      )}
                    </div>

                    {/* 条文详细内容 (款 & 项) */}
                    <div className="space-y-4">
                      {hasClauses ? (
                        Object.entries(entity.clauses)
                          .sort(([k1], [k2]) => parseInt(k1, 10) - parseInt(k2, 10))
                          .map(([clauseNum, clause]: [string, any]) => {
                            const hasItems = clause.items && Object.keys(clause.items).length > 0;
                            return (
                              <div key={clauseNum} className="space-y-2.5 leading-relaxed text-slate-700 text-sm">
                                {/* 款 (Clause) */}
                                <p className="font-normal pl-1 border-l-2 border-transparent hover:border-blue-100 transition-colors">
                                  {clause.text}
                                </p>
                                
                                {/* 项 (Items) */}
                                {hasItems && (
                                  <div className="pl-5 space-y-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/60 font-mono text-xs text-slate-600">
                                    {Object.entries(clause.items)
                                      .sort(([k1], [k2]) => parseInt(k1, 10) - parseInt(k2, 10))
                                      .map(([itemNum, itemText]) => (
                                        <div key={itemNum} className="flex items-start gap-1">
                                          <span className="shrink-0">{itemText as string}</span>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-sm text-slate-500 italic">本条尚无具体款项内容</p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center bg-white border border-slate-150 rounded-xl"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-base font-bold text-slate-800">没有检索到对应条文</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto px-4">
                  尝试更改关键字或搜索其他法条序号。您可以直接在搜索框中输入数字来精准跳转，例如“36”。
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
