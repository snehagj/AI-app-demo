export interface CaseFile {
  name: string;
  type: 'image' | 'audio' | 'pdf' | 'video' | 'other';
  mimeType: string;
  size: number;
  dataUrl: string; // For previews (e.g., base64 for images)
  base64Content: string; // For API
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Case {
  id: string;
  name: string;
  files: CaseFile[];
  messages: ChatMessage[];
  createdAt: Date;
}

export interface AnalysisOptions {
  isThinkingMode: boolean;
}
