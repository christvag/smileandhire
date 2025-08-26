'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ProfileImageUploadProps {
  currentAvatar?: string;
  onUploadSuccess: (avatarUrl: string) => void;
  onUploadError: (error: string) => void;
}

export default function ProfileImageUpload({ 
  currentAvatar, 
  onUploadSuccess, 
  onUploadError 
}: ProfileImageUploadProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        onUploadError('Please select a JPEG file only');
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        onUploadError('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  // Create cropped image
  const getCroppedImg = useCallback((
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to 128x128 (our target size)
    canvas.width = 128;
    canvas.height = 128;

    // Calculate scale factors
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Draw the cropped image onto canvas
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      128,
      128
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.85);
    });
  }, []);

  // Handle crop completion and upload
  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) {
      onUploadError('Please select an area to crop');
      return;
    }

    setUploading(true);

    try {
      // Create cropped image blob
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('profileImage', croppedImageBlob, 'profile.jpg');

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Upload to server
      const response = await fetch('http://localhost:3006/api/upload/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Success - hide cropper and notify parent
      setShowCropper(false);
      setImgSrc('');
      onUploadSuccess(result.avatarUrl);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setImgSrc('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentAvatarUrl = () => {
    if (currentAvatar) {
      return `http://localhost:3006/uploads/${currentAvatar}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Current Avatar Display */}
      <div className="text-center">
        <div className="inline-block relative">
          {getCurrentAvatarUrl() ? (
            <img
              src={getCurrentAvatarUrl()!}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
              <span className="text-gray-400 text-4xl">👤</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {getCurrentAvatarUrl() ? 'Current profile image' : 'No profile image'}
        </p>
      </div>

      {/* File Upload Button */}
      {!showCropper && (
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg"
            onChange={onSelectFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {getCurrentAvatarUrl() ? 'Change Profile Image' : 'Upload Profile Image'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            JPEG only, max 5MB. Image will be resized to 128x128px.
          </p>
        </div>
      )}

      {/* Image Cropper */}
      {showCropper && imgSrc && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Crop Your Profile Image</h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag to select the area you want to use as your profile image. The selected area will be resized to 128x128 pixels.
          </p>
          
          <div className="max-w-md mx-auto">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1} // Square aspect ratio
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                style={{ maxHeight: '400px', maxWidth: '100%' }}
                onLoad={(e) => {
                  const { width, height } = e.currentTarget;
                  const minSize = Math.min(width, height);
                  const x = (width - minSize) / 2;
                  const y = (height - minSize) / 2;
                  
                  setCrop({
                    unit: 'px',
                    width: minSize,
                    height: minSize,
                    x: x,
                    y: y,
                  });
                }}
              />
            </ReactCrop>
          </div>

          {/* Preview */}
          {completedCrop && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Preview (128x128px):</p>
              <div className="inline-block">
                <canvas
                  style={{
                    width: '64px',
                    height: '64px',
                    border: '1px solid #ccc',
                    borderRadius: '50%'
                  }}
                  ref={(canvas) => {
                    if (canvas && imgRef.current && completedCrop) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        canvas.width = 128;
                        canvas.height = 128;
                        
                        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
                        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
                        
                        ctx.drawImage(
                          imgRef.current,
                          completedCrop.x * scaleX,
                          completedCrop.y * scaleY,
                          completedCrop.width * scaleX,
                          completedCrop.height * scaleY,
                          0,
                          0,
                          128,
                          128
                        );
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6 justify-center">
            <button
              onClick={handleCancelCrop}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              disabled={!completedCrop || uploading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Uploading...
                </>
              ) : (
                'Upload Image'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}