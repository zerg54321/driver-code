import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="px-4 sm:px-8 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 font-medium shrink-0 gap-2">
      <div className="flex space-x-4">
        <span>© 2026 全国法律法规处罚数据库</span>
        <span>数据基准更新日期：2026-05</span>
      </div>
      <div className="flex space-x-4">
        <span className="hover:text-slate-600 cursor-pointer transition-colors">免责声明</span>
        <span className="hover:text-slate-600 cursor-pointer transition-colors">使用帮助</span>
        <span className="hover:text-slate-600 cursor-pointer transition-colors">法条纠错</span>
      </div>
    </footer>
  );
};
