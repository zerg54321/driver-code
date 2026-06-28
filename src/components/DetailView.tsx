import React from 'react';
import { ViolationItem } from '../types';
import { matchLawArticles } from '../data/lawsData';
import { ShieldAlert, BookOpen, Gavel, ArrowLeft, ExternalLink, HelpCircle } from 'lucide-react';

interface DetailViewProps {
  item: ViolationItem | null;
  onCloseMobile?: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ item, onCloseMobile }) => {
  if (!item) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-8 text-center text-slate-400 hidden lg:flex">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">请选择左侧违法代码条目</h3>
        <p className="text-xs text-slate-400 max-w-md">
          点击左侧列表中任意一条交通行为，此处将展开显示具体的处罚标准金额、扣分标准、以及完整的行为依据和处罚依据法律原文
        </p>
      </div>
    );
  }

  const behaviorArticles = matchLawArticles(item.behaviorLaw);
  const punishArticles = matchLawArticles(item.punishLaw);

  const hasScore = item.score && item.score !== '0' && item.score !== '';
  const hasFine = !!item.fine;
  const hasDetention = !!item.detentionDay;
  const hasRevoke = !!item.revoke || !!item.suspendMonth;

  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* 头部标题与核心处罚概览 */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-white shrink-0 relative">
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden mb-4 flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回查询列表
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 shrink-0">
              {item.code}
            </span>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                违法标准代码 · {item.category || '道路交通'}
              </span>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
                {item.behavior}
              </h2>
            </div>
          </div>
        </div>

        {/* 核心处罚指标 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-orange-50/80 p-3.5 rounded-xl border border-orange-100">
            <p className="text-[11px] text-orange-600 font-bold uppercase tracking-wider mb-1 flex items-center">
              罚款金额标准
            </p>
            <p className="text-base sm:text-lg font-extrabold text-orange-950 font-mono">
              {hasFine ? `¥${item.fine}` : (item.warning ? '处警告' : '见法条规定')}
            </p>
          </div>

          <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-100">
            <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider mb-1 flex items-center">
              记分分值
            </p>
            <p className="text-base sm:text-lg font-extrabold text-amber-950 font-mono">
              {hasScore ? `${item.score} 分` : '不记分'}
            </p>
          </div>

          <div className="bg-red-50/80 p-3.5 rounded-xl border border-red-100">
            <p className="text-[11px] text-red-600 font-bold uppercase tracking-wider mb-1 flex items-center">
              行政强制拘留
            </p>
            <p className="text-base sm:text-lg font-extrabold text-red-950">
              {hasDetention ? item.detentionDay : '无拘留'}
            </p>
          </div>

          <div className="bg-purple-50/80 p-3.5 rounded-xl border border-purple-100">
            <p className="text-[11px] text-purple-700 font-bold uppercase tracking-wider mb-1 flex items-center">
              执照扣吊措施
            </p>
            <p className="text-xs sm:text-sm font-bold text-purple-950 mt-1 leading-snug">
              {item.revoke ? item.revoke : (item.suspendMonth ? `暂扣${item.suspendMonth}月` : '无扣吊')}
            </p>
          </div>
        </div>
      </div>

      {/* 具体法条依据解读区 */}
      <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto bg-slate-50/50">
        {/* 1. 违法行为依据原文 */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h4 className="flex items-center text-sm sm:text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            <BookOpen className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
            违法行为法定依据
            <span className="ml-auto text-xs font-normal text-slate-400 font-mono">
              {item.behaviorLaw || '道交法相关规定'}
            </span>
          </h4>

          {behaviorArticles.length > 0 ? (
            <div className="space-y-4">
              {behaviorArticles.map((art, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm leading-relaxed text-slate-700">
                  <p className="font-bold text-slate-900 mb-1.5 flex items-center text-xs text-blue-700">
                    <Gavel className="w-3 h-3 mr-1" />
                    {art.title}
                  </p>
                  <div className="pl-2 border-l-2 border-blue-400 italic text-slate-800 font-serif">
                    “{art.content}”
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800 mb-1">法定行为依据指引：</p>
              <p>该行为依据为 <strong className="text-blue-600">{item.behaviorLaw || '道路交通安全法律法规通行规定'}</strong>。根据全国通行准则，驾驶人及参与者在道路上应当按规范安全通行。</p>
            </div>
          )}
        </section>

        {/* 2. 处罚法律依据原文 */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h4 className="flex items-center text-sm sm:text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            <ShieldAlert className="w-4 h-4 mr-2 text-red-600 shrink-0" />
            处罚及扣分法律依据
            <span className="ml-auto text-xs font-normal text-slate-400 font-mono">
              {item.punishLaw || '处罚法定标准'}
            </span>
          </h4>

          {punishArticles.length > 0 ? (
            <div className="space-y-4">
              {punishArticles.map((art, idx) => (
                <div key={idx} className="bg-red-50/40 p-4 rounded-xl border border-red-100/80 text-sm leading-relaxed text-slate-700">
                  <p className="font-bold text-red-900 mb-1.5 flex items-center text-xs">
                    <Gavel className="w-3 h-3 mr-1 text-red-600" />
                    {art.title}
                  </p>
                  <div className="pl-2 border-l-2 border-red-400 italic text-slate-800 font-serif">
                    “{art.content}”
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-50/40 p-4 rounded-xl border border-red-100 text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">处罚依据说明：</p>
              <p>处罚依据法条设定为 <strong className="text-red-700">{item.punishLaw || '道路交通安全法第九十条或相关细则'}</strong>。</p>
              <p className="mt-2 text-xs text-slate-500">
                标准核定：
                {item.fine && ` 罚款 ${item.fine} 元；`}
                {item.warning && ' 处警告；'}
                {item.score && ` 记 ${item.score} 分；`}
                {item.detentionDay && ` 处拘留 ${item.detentionDay}；`}
                {item.revoke && ` 执行 ${item.revoke}。`}
              </p>
            </div>
          )}
        </section>

        {/* 3. 强制措施与其他备注 */}
        {(item.forceMeasure || item.remark) && (
          <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h4 className="flex items-center text-sm font-bold text-slate-900 mb-3">
              <HelpCircle className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
              执法执行细则与备注
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              {item.forceMeasure && (
                <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100 flex gap-2">
                  <span className="font-bold text-amber-900 shrink-0">行政强制措施：</span>
                  <span>{item.forceMeasure} {item.forceMeasureLaw && `(${item.forceMeasureLaw})`}</span>
                </div>
              )}
              {item.remark && (
                <div className="bg-slate-100/80 p-3 rounded-lg flex gap-2">
                  <span className="font-bold text-slate-700 shrink-0">备注信息：</span>
                  <span>{item.remark}</span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* 底部小提示说明 */}
      <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <span>数据来源：全国交通违法处罚统一基准数据库</span>
        <a
          href="https://www.gov.cn/flfg/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          国家法律法规官方库查阅 <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
