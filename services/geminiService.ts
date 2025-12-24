import { GoogleGenAI } from "@google/genai";
import type { CaseFile, AnalysisOptions } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT_TEMPLATE = `You are a highly intelligent analysis assistant. Analyze the following documents and the user's query to provide a comprehensive and accurate response. The user has provided the following files for context:

{file_context}

User query: "{user_prompt}"

Based on the provided files and the query, please formulate your response.`;

export const streamMultiModalAnalysis = async (
  prompt: string,
  files: CaseFile[],
  options: AnalysisOptions,
  onChunk: (chunk: string) => void
): Promise<void> => {
  const modelName = options.isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash-lite';
  
  const config = options.isThinkingMode 
    ? { thinkingConfig: { thinkingBudget: 32768 } } 
    : {};

  const fileParts = files.map(file => ({
    inlineData: {
      mimeType: file.mimeType,
      data: file.base64Content,
    },
  }));
  
  const fileContext = files.length > 0
    ? files.map(f => `- ${f.name} (${f.type})`).join('\n')
    : 'No files provided.';
    
  const fullPrompt = PROMPT_TEMPLATE
    .replace('{file_context}', fileContext)
    .replace('{user_prompt}', prompt);

  const responseStream = await ai.models.generateContentStream({
    model: modelName,
    contents: {
      parts: [
        ...fileParts,
        { text: fullPrompt }
      ]
    },
    config,
  });

  for await (const chunk of responseStream) {
    onChunk(chunk.text);
  }
};

export const transcribeAudio = async (audioFile: CaseFile): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: audioFile.mimeType,
                        data: audioFile.base64Content,
                    }
                },
                { text: "Transcribe the following audio recording." }
            ]
        }
    });
    return response.text.trim();
};
