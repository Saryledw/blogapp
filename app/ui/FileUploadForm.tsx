'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent, useImperativeHandle, forwardRef } from 'react';
import styles from './FileUploadForm.module.css';
import Button from "./Button";
import AlertMessage from "./AlertMessage";
import Container from "./Container";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface FileUploadFormProps {
  allowedExtensions: string;
  maxFiles: number;
  filesName: string;
  uploadButton: boolean;
  className?: string;
  hiddenContent?: boolean;
}

export interface FileUploadFormHandle {
  submitFiles: () => Promise<string[]>;
  resetForm: () => void;
	files: File[];
}

const FileUploadForm: React.ForwardRefRenderFunction<FileUploadFormHandle, FileUploadFormProps> = (
  { allowedExtensions, maxFiles, filesName, uploadButton, className, hiddenContent = true },
  ref
) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(hiddenContent);
  const [buttonLabel, setButtonLabel] = useState<string>(hiddenContent ? '⮟' : '⮝');

  useImperativeHandle(ref, () => ({
    submitFiles,
    resetForm,
		files
  }));

  const clearMessage = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const toggleContentVisibility = () => {
    if (isHidden) {
      setIsHidden(false);
      setButtonLabel('⮝');
    } else {
      setIsHidden(true);
      setButtonLabel('⮟');
    }
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

  const submitFiles = async (): Promise<string[]> => {
    if (files.length === 0) {
      setErrorMessage('No files selected');
      setSuccessMessage('');
      return [];
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
        const urls = data.files.map((file: { url: string }) => file.url);
        previews.forEach(url => URL.revokeObjectURL(url));
        setFiles([]);
        setPreviews([]);
        return urls;
      } else {
        setErrorMessage(data.error || 'File upload failed');
        setSuccessMessage('');
        return [];
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setErrorMessage('File upload failed');
      setSuccessMessage('');
      return [];
    }
  };

  const resetForm = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviews([]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

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

	const inputId = `fileInput-${filesName}`;

  return (
    <Container header='Upload files' isButtonVisible={true} buttonLabel={buttonLabel} onHeaderClick={toggleContentVisibility} centeredContent={false} hiddenContent={isHidden} className={className} onButtonClick={toggleContentVisibility}>
      <form onSubmit={submitFiles} className={styles.formContainer} encType="multipart/form-data">
        <div className={styles.fileInputAndSelectedFilesContainer}>
          <div
            className={`${styles.fileInputContainer} ${isDragging ? styles.dragging : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <svg className={styles.svgBorder}>
              <rect x="0" y="0" width="100%" height="100%" />
            </svg>
            <FileUploadIcon style={{ color: '#ef6865', fontSize: '3vw' }} />
            <p className={styles.fileInputContainerText}>Перетащите файлы для загрузки</p>
            <p className={styles.fileInputContainerText}>или</p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className={styles.inputField}
              id={inputId}
            />
            <label htmlFor={inputId} className={styles.fileInputLabel} onClick={clearMessage}>
              Select Files
            </label>
            <p style={{ textAlign: 'center' }}>Поддерживаемые форматы файлов: <b>{allowedExtensions.replace(/\./g, '').toUpperCase()}</b></p>
          </div>

          {files.length > 0 && (
            <div className={styles.selectedFilesContainer}>
              <div className={styles.fileCount}>
                <div>{files.length} file(s) selected</div>
                <Button label='Remove all' type="button" onClick={handleRemoveAllFile} size="small" />
              </div>
              <p className={styles.selectedFilesTitle}>Selected files:</p>
              <ul className={styles.fileList}>
                {files.map((file, index) => (
                  <li key={index} className={styles.fileListItem}>
                    <p className={styles.fileListItemName}>{file.name}</p>
                    <img src={previews[index]} alt="File preview" className={styles.filePreview} />
                    <DeleteForeverIcon onClick={() => handleRemoveFile(index)} style={{ color: '#ef6865', fontSize: '2vw', cursor: 'pointer' }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {(errorMessage || successMessage) && <AlertMessage message={errorMessage || successMessage} success={successMessage} />}
        {files.length > 0 && uploadButton && (
          <Button label='Upload' type='submit' className={styles.uploadButton} size='large' />
        )}
      </form>
    </Container>
  );
};

export default forwardRef(FileUploadForm);
