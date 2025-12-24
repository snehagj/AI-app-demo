import React, { useState, useRef, useEffect } from 'react';
import type { Case, CaseFile, ChatMessage } from '../types';
import { streamMultiModalAnalysis, transcribeAudio } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { FileUploadArea } from './FileUploadArea';
import { Message } from './Message';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface ChatViewProps {
  activeCase: Case | null;
  onAddFiles: (files: CaseFile[]) => void;
  onRemoveFile: (fileName: string) => void;
  onAddMessage: (message: ChatMessage) => void;
  onUpdateLastMessage: (content: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ activeCase, onAddFiles, onRemoveFile, onAddMessage, onUpdateLastMessage }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeCase?.messages]);
  
  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          setIsTranscribing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFileForUpload = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
          const base64Content = await fileToBase64(audioFileForUpload);
          
          const audioFile: CaseFile = {
            name: 'voice-input.webm',
            type: 'audio',
            mimeType: 'audio/webm',
            size: audioBlob.size,
            dataUrl: '',
            base64Content,
          };

          try {
            const transcript = await transcribeAudio(audioFile);
            setInput(prev => prev ? `${prev} ${transcript}` : transcript);
          } catch (error) {
            console.error('Transcription error:', error);
          } finally {
            setIsTranscribing(false);
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeCase || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    onAddMessage(userMessage);
    setInput('');
    setIsLoading(true);

    const modelMessage: ChatMessage = { role: 'model', content: '' };
    onAddMessage(modelMessage);

    try {
      await streamMultiModalAnalysis(input, activeCase.files, { isThinkingMode }, (chunk) => {
        onUpdateLastMessage(chunk);
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      onUpdateLastMessage('\n\nSorry, an error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeCase) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-100">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold text-slate-600">Welcome to Multi-RAG Analysis</h2>
          <p className="mt-2 text-slate-500">Create a new case from the sidebar to begin your analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <header className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
        <h2 className="text-xl font-bold text-slate-700">{activeCase.name}</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeCase.files.length > 0 && (
          <FileUploadArea files={activeCase.files} onAddFiles={onAddFiles} onRemoveFile={onRemoveFile} />
        )}
        
        {activeCase.messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        
        {isLoading && activeCase.messages[activeCase.messages.length - 1]?.role === 'model' && (
           <div className="flex items-center justify-start">
             <div className="bg-white p-3 rounded-lg shadow-sm flex items-center space-x-2">
               <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></span>
               <span className="text-sm text-slate-500">Analyzing...</span>
             </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center justify-end mb-3 pr-2 gap-4">
            <label htmlFor="thinking-mode-toggle" className="flex items-center cursor-pointer">
              <div className="text-right mr-3">
                <p className="text-sm font-medium text-slate-700">Thinking Mode</p>
                <p className="text-xs text-slate-400">
                  {isThinkingMode ? "gemini-2.5-pro" : "gemini-2.5-flash-lite"}
                </p>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="thinking-mode-toggle" 
                  className="sr-only peer" 
                  checked={isThinkingMode}
                  onChange={() => setIsThinkingMode(!isThinkingMode)}
                />
                <div className="block bg-slate-200 w-12 h-6 rounded-full peer-checked:bg-blue-500 transition"></div>
                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
              </div>
            </label>
        </div>

        {activeCase.files.length === 0 && (
          <div className="mb-4">
             <FileUploadArea files={[]} onAddFiles={onAddFiles} onRemoveFile={onRemoveFile} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the documents, or use the mic..."
            disabled={isLoading || isRecording || isTranscribing}
            className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading || isTranscribing}
            className={`p-3 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-slate-600 hover:bg-slate-700'} text-white`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isTranscribing ? (
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white block"></span>
            ) : (
                <MicrophoneIcon className="w-6 h-6" />
            )}
          </button>

          <button
            type="submit"
            disabled={isLoading || !input.trim() || isRecording || isTranscribing}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};