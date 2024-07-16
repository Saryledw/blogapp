// DragAndDropHandler.tsx
'use client';

import { useEffect } from 'react';

const DragAndDropHandler = () => {
  useEffect(() => {
    const preventDefault = (event: DragEvent) => {
      event.preventDefault();
    };


    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);

    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  return null;
};

export default DragAndDropHandler;
