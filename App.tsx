import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import type { Case, ChatMessage, CaseFile } from './types';

const App: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  const activeCase = useMemo(() => {
    return cases.find(c => c.id === activeCaseId) || null;
  }, [cases, activeCaseId]);

  const handleCreateNewCase = () => {
    const newCase: Case = {
      id: `case-${Date.now()}`,
      name: `Case #${cases.length + 1}`,
      files: [],
      messages: [],
      createdAt: new Date(),
    };
    setCases(prev => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
  };

  const handleSelectCase = (id: string) => {
    setActiveCaseId(id);
  };
  
  const handleDeleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    if (activeCaseId === id) {
      setActiveCaseId(null);
    }
  };

  const handleAddFiles = (files: CaseFile[]) => {
    if (!activeCaseId) return;
    setCases(prevCases => prevCases.map(c => 
      c.id === activeCaseId 
        ? { ...c, files: [...c.files, ...files] } 
        : c
    ));
  };
  
  const handleRemoveFile = (fileName: string) => {
    if (!activeCaseId) return;
    setCases(prevCases => prevCases.map(c => 
      c.id === activeCaseId 
        ? { ...c, files: c.files.filter(f => f.name !== fileName) } 
        : c
    ));
  };

  const handleAddMessage = (message: ChatMessage) => {
    if (!activeCaseId) return;
    setCases(prevCases => prevCases.map(c => 
      c.id === activeCaseId 
        ? { ...c, messages: [...c.messages, message] } 
        : c
    ));
  };
  
  const handleUpdateLastMessage = (content: string) => {
     if (!activeCaseId) return;
     setCases(prevCases => prevCases.map(c => {
       if (c.id === activeCaseId) {
         const newMessages = [...c.messages];
         const lastMessageIndex = newMessages.length - 1;
         const lastMessage = newMessages[lastMessageIndex];
         
         if (lastMessage && lastMessage.role === 'model') {
           newMessages[lastMessageIndex] = {
             ...lastMessage,
             content: lastMessage.content + content,
           };
           return { ...c, messages: newMessages };
         }
       }
       return c;
     }));
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800">
      <Sidebar 
        cases={cases}
        activeCaseId={activeCaseId}
        onNewCase={handleCreateNewCase}
        onSelectCase={handleSelectCase}
        onDeleteCase={handleDeleteCase}
      />
      <main className="flex-1 flex flex-col h-full">
        <ChatView
          key={activeCaseId}
          activeCase={activeCase}
          onAddFiles={handleAddFiles}
          onRemoveFile={handleRemoveFile}
          onAddMessage={handleAddMessage}
          onUpdateLastMessage={handleUpdateLastMessage}
        />
      </main>
    </div>
  );
};

export default App;
