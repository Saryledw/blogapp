'use server';

import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import { generateRandomString } from '@/app/lib/generateRandomString';
import { getDate } from '@/app/lib/getDate';


const uploadDir = path.join(process.cwd(), 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });


const filterFiles = (files: formidable.Files): formidable.File[] => {
  // Get the first key from the files object, which represents the file input name
  const inputName = Object.keys(files)[0];

  // Handle the case where no files are uploaded (files object is empty)
  if (!inputName) {
    return [];
  }

  const fileList = files[inputName];
  
  // Ensure fileList is defined and is either an array or a single file
  if (!fileList) {
    return [];
  }

  const filesArray = Array.isArray(fileList) ? fileList : [fileList];

  // Filter out undefined values
  return filesArray.filter((file): file is formidable.File => file !== undefined);
};


const validateFiles = (filteredFiles: formidable.File[], allowedExtensions: string[], maxFiles: number): { isValid: boolean, error?: string } => {

	if (filteredFiles.length > maxFiles) {
		return { isValid: false, error: `Only ${maxFiles} files are allowed.` };
	}

	for (const file of filteredFiles) {
		const fileExtension = path.extname(file.originalFilename || '').toLowerCase();
		if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
			return { isValid: false, error: `File type ${fileExtension} is not allowed.` };
		}
	}

	return { isValid: true };
};


const deleteUnwantedFiles = (filteredFiles: formidable.File[]) => {
	for (const file of filteredFiles) {
		fs.unlink(file.filepath, (err) => {
			if (err) {
				console.error(`Failed to delete file: ${file.filepath}`, err);
			}
		});
	}
};





export async function POST(request: Request) {
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 1 * 1024 * 1024, // 1MB
  });

  return new Promise(async (resolve, reject) => {
    // Convert Request to a Node.js Readable stream
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(buffer);
    readableStream.push(null);

    // Mock headers required by formidable
    const mockReq = readableStream as IncomingMessage;
    mockReq.headers = {
      'content-length': buffer.length.toString(),
      'content-type': request.headers.get('content-type') || '',
    };

    form.parse(mockReq, (err, fields, files) => {
      if (err) {
        console.error('File upload error:', err);
        resolve(NextResponse.json({ error: 'File upload error' }, { status: 500 }));
        return;
      }


			const filteredFiles = filterFiles(files);
			

			const inputName = Object.keys(files)[0];

			const allowedExtensionsField = fields.allowedExtensions as string | string[] | undefined;
      const allowedExtensions = Array.isArray(allowedExtensionsField)
        ? allowedExtensionsField[0]?.split(',').map(ext => ext.trim())
        : (allowedExtensionsField?.split(',').map(ext => ext.trim()) || []); // Default to allowing any extension
				
			  const maxFilesField = fields.maxFiles as string | string[] | undefined;
      const maxFiles = Array.isArray(maxFilesField)
        ? parseInt(maxFilesField[0] || '1', 10)
        : parseInt(maxFilesField || '1', 10);


      const validation = validateFiles(filteredFiles, allowedExtensions, maxFiles);
      if (!validation.isValid) {
        deleteUnwantedFiles(filteredFiles);
        resolve(NextResponse.json({ error: validation.error }, { status: 400 }));
        return;
      }

			const uploadedFiles = filteredFiles.map((file) => {

				
        // Ensure the file has the correct extension
        const originalExtension = path.extname(file.originalFilename || '');
				const timestamp = getDate();
				const randomString = generateRandomString(10);
        const newFilename = `${inputName}-${timestamp}-${randomString}${originalExtension}`;
        const newPath = path.join(uploadDir, newFilename);
        fs.renameSync(file.filepath, newPath);

        const fileUrl = `/uploads/${newFilename}`;
        return { url: fileUrl };
      });

      resolve(NextResponse.json({ files: uploadedFiles }, { status: 200 }));
    });
  });
}
