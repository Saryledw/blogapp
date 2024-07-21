'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface UseFileUploadProps {
  allowedExtensions: string;
  maxFiles: number;
  filesName: string;
}

export default function UseFileUpload  ({ allowedExtensions, maxFiles, filesName }: UseFileUploadProps)  {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const clearMessage = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const processFiles = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.filter(newFile =>
      !files.some(existingFile =>
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );

    const updatedFiles = [...files, ...newFiles];

    if (updatedFiles.length > maxFiles) {
      setErrorMessage(`You can only upload up to ${maxFiles} files.`);
      setSuccessMessage('');
      return;
    }

    for (const file of updatedFiles) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Only image files are allowed.');
        setSuccessMessage('');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Each file must be less than 5MB.');
        setSuccessMessage('');
        return;
      }
    }

    const newPreviews = updatedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setFiles(updatedFiles);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    processFiles(selectedFiles);
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleRemoveAllFile = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviews([]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (files.length === 0) {
      setErrorMessage('No files selected');
      setSuccessMessage('');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append(filesName, file));
    formData.append('allowedExtensions', allowedExtensions);
    formData.append('maxFiles', maxFiles.toString());

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setErrorMessage('');
        setSuccessMessage('Files uploaded successfully');
        previews.forEach(url => URL.revokeObjectURL(url));
        setFiles([]);
        setPreviews([]);
      } else {
        setErrorMessage(data.error || 'File upload failed');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setErrorMessage('File upload failed');
      setSuccessMessage('');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const selectedFiles = Array.from(event.dataTransfer.files);
    processFiles(selectedFiles);
    event.dataTransfer.clearData();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return {
    files,
    previews,
    errorMessage,
    successMessage,
    isDragging,
    clearMessage,
    handleFileChange,
    handleRemoveFile,
    handleRemoveAllFile,
    handleSubmit,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  };
};


