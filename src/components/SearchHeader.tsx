import React from 'react';
import { Search, X, ShieldAlert, FileText } from 'lucide-react';
import { FilterOptions } from '../types';

interface SearchHeaderProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  totalCount: number;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  filters,
  setFilters,
  totalCount,
}) => {
  const hotKeywords = ['1043', '饮酒后', '未悬挂号牌', '超速', '逆向行驶', '安全带', '无证驾驶'];

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, keyword: e.target.value }));
  };

  const handleClear = () => {
    setFilters((prev) => ({ ...prev, keyword: '' }));
  };

  const selectHotKeyword = (kw: string) => {
    setFilters((prev) => ({ ...prev, keyword: kw }));
  };

  const toggleFilter = (key: keyof FilterOptions) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key as keyof FilterOptions] }));
  };

  return (
    <header className="bg-white px-4 sm:px-8 py-6 shadow-sm border-b border-slate-100 shrink-0 transition-all">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-3 gap-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              搜索违法行为或代码
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              支持输入具体行为（如：超速、改装、酒驾）或标准4位代码（如：1043）快速精准查询
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-2 md:mt-0 flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1 text-blue-500 inline" />
            现已收录法条依据及处罚记录 <span className="font-bold text-slate-700 ml-1">{totalCount}</span> 条
          </div>
        </div>

        {/* 核心搜索框 */}
        <div className="relative group mt-3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={filters.keyword}
            onChange={handleKeywordChange}
            className="block w-full pl-12 pr-24 sm:pr-32 py-3.5 sm:py-4 bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-base sm:text-lg text-slate-800 placeholder:text-slate-400 shadow-inner"
            placeholder="输入关键词（如：超速、无证驾驶）或代码（如：1043）..."
          />
          {filters.keyword && (
            <button
              onClick={handleClear}
              className="absolute right-24 sm:right-28 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              title="清空"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button className="absolute right-2 top-2 bottom-2 px-4 sm:px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center text-sm sm:text-base cursor-pointer">
            立即查询
          </button>
        </div>

        {/* 热门搜索与快捷筛选条件 */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
            <span className="text-slate-400 mr-1 shrink-0">热门推荐：</span>
            {hotKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => selectHotKeyword(kw)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filters.keyword === kw
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <span className="text-slate-400 flex items-center mr-0.5">
              <ShieldAlert className="w-3.5 h-3.5 mr-1 text-slate-400" />
              严厉标准筛选：
            </span>
            <button
              onClick={() => toggleFilter('onlyScore')}
              className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                filters.onlyScore
                  ? 'bg-orange-50 border-orange-400 text-orange-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              记分达12分
            </button>
            <button
              onClick={() => toggleFilter('onlyDetention')}
              className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                filters.onlyDetention
                  ? 'bg-red-50 border-red-400 text-red-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              有行政拘留
            </button>
            <button
              onClick={() => toggleFilter('onlyRevoke')}
              className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                filters.onlyRevoke
                  ? 'bg-purple-50 border-purple-400 text-purple-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              吊销驾驶证
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
