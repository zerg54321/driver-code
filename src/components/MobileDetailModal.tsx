import React, { useEffect } from 'react';
import { ViolationItem } from '../types';
import { DetailView } from './DetailView';

interface MobileDetailModalProps {
  item: ViolationItem | null;
  onClose: () => void;
  onJumpToLaw?: (db: 'law' | 'reg' | 'bj', artNum: number) => void;
}

export const MobileDetailModal: React.FC<MobileDetailModalProps> = ({ item, onClose, onJumpToLaw }) => {
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [item]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-3xl h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        <DetailView item={item} onCloseMobile={onClose} onJumpToLaw={onJumpToLaw} />
      </div>
    </div>
  );
};
