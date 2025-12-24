
import React from 'react';
import type { Case } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SidebarProps {
  cases: Case[];
  activeCaseId: string | null;
  onNewCase: () => void;
  onSelectCase: (id: string) => void;
  onDeleteCase: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ cases, activeCaseId, onNewCase, onSelectCase, onDeleteCase }) => {
  return (
    <aside className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Multi-RAG Cases</h1>
      </div>
      <div className="p-4">
        <button
          onClick={onNewCase}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <PlusIcon className="w-5 h-5" />
          New Case
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        <ul className="space-y-2">
          {cases.map((c) => (
            <li key={c.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectCase(c.id);
                }}
                className={`group flex justify-between items-center w-full p-3 rounded-lg text-left transition-colors duration-150 ${
                  activeCaseId === c.id
                    ? 'bg-blue-100 text-blue-700 shadow-inner'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <div className="flex-1 truncate">
                    <span className="font-semibold">{c.name}</span>
                    <p className="text-xs text-slate-400">
                        {c.createdAt.toLocaleDateString()}
                    </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCase(c.id);
                  }}
                  className="p-1 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-opacity"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-200 text-xs text-slate-400">
        <p>Gemini Analysis Interface</p>
      </div>
    </aside>
  );
};
