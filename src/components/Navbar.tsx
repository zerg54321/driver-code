import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = ['全部查询', '机动车通行', '非机动车', '高速及快速路', '行人和乘车人'];

  return (
    <nav className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-3.5 bg-white border-b border-slate-200 shrink-0 gap-3">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
          法
        </div>
        <span className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
          违法处罚标准查询系统
        </span>
        <span className="hidden md:inline-block bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded font-mono">
          手机 & PC 通用
        </span>
      </div>

      <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm font-medium text-slate-500 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
