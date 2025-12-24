
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the initial 'data:mime/type;base64,' part
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

export const getFileType = (mimeType: string): 'image' | 'audio' | 'pdf' | 'video' | 'other' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  return 'other';
};
