import React from 'react';
import { ViolationItem } from '../types';
import { ChevronRight, AlertCircle, FileSearch } from 'lucide-react';
import { formatLawReference } from '../data/lawsData';

interface ResultListProps {
  items: ViolationItem[];
  selectedItem: ViolationItem | null;
  onSelect: (item: ViolationItem) => void;
}

export const ResultList: React.FC<ResultListProps> = ({
  items,
  selectedItem,
  onSelect,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 min-h-[300px]">
        <FileSearch className="w-12 h-12 mb-3 text-slate-300" />
        <p className="text-base font-semibold text-slate-600 mb-1">未查询到符合条件的违法记录</p>
        <p className="text-xs text-slate-400 max-w-sm">
          请尝试缩短搜索词（如将“影响正常行驶”改为“车道”或“1043”），或清空上方严厉筛选条件
        </p>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-4/12 xl:w-4/12 flex flex-col h-full overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-2 mb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          查询结果共 <strong className="text-slate-700">{items.length}</strong> 项
        </span>
        <span className="text-[11px] text-slate-400 lg:hidden">
          点击卡片展开法条及处罚详情
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          const hasScore = item.score && item.score !== '0' && item.score !== '';
          const hasDetention = !!item.detentionDay;
          const hasRevoke = !!item.revoke;

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`rounded-xl p-4 transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                  : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5 gap-2">
                <div className="flex items-center flex-wrap gap-1.5">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-bold font-mono tracking-wider ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}
                  >
                    代码 {item.code}
                  </span>
                  <span className="text-[11px] text-slate-400 border border-slate-100 px-1.5 py-0.2 rounded">
                    {item.category || '道路交通'}
                  </span>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {hasScore && (
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      扣{item.score}分
                    </span>
                  )}
                  {hasDetention && (
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      拘留
                    </span>
                  )}
                  {hasRevoke && (
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      吊销
                    </span>
                  )}
                </div>
              </div>

              <h3 className={`font-bold leading-snug mb-2 text-sm sm:text-base ${isSelected ? 'text-blue-950' : 'text-slate-900'}`}>
                {item.behavior}
              </h3>

              <div className="text-xs text-slate-600 flex items-start gap-1 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">处罚标准：</span>
                  <span>
                    {item.fine ? `罚款 ${item.fine} 元；` : ''}
                    {item.warning ? '处警告；' : ''}
                    {item.detentionDay ? `拘留${item.detentionDay}；` : ''}
                    {item.suspendMonth ? `暂扣${item.suspendMonth}月；` : ''}
                    {item.revoke ? `${item.revoke}；` : ''}
                    {!item.fine && !item.warning && !item.detentionDay && !item.revoke && '见展开详情'}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[180px] sm:max-w-[200px]" title={formatLawReference(item.punishLaw || item.behaviorLaw)}>
                  依据：{formatLawReference(item.punishLaw || item.behaviorLaw)}
                </span>
                <span className={`flex items-center font-medium shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}>
                  {isSelected ? '正在查看法条' : '展开具体法条'}
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
