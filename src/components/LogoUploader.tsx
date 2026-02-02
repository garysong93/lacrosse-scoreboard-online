import { useRef } from 'react'

interface LogoUploaderProps {
  currentLogo?: string
  onLogoChange: (logoUrl: string | undefined) => void
  teamColor: string
  teamName: string
}

export function LogoUploader({ currentLogo, onLogoChange, teamColor, teamName }: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_SIZE = 200

          let width = img.width
          let height = img.height

          // Scale down to max 200x200 while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width)
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height)
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to base64 with reasonable quality
          const dataUrl = canvas.toDataURL('image/png', 0.9)
          resolve(dataUrl)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    try {
      const compressedUrl = await compressImage(file)
      onLogoChange(compressedUrl)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Failed to process image')
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = () => {
    onLogoChange(undefined)
  }

  return (
    <div className="logo-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id={`logo-upload-${teamName}`}
      />

      {currentLogo ? (
        <div className="logo-preview">
          <img src={currentLogo} alt={`${teamName} logo`} className="logo-image" />
          <div className="logo-actions">
            <button
              type="button"
              className="logo-btn change"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </button>
            <button
              type="button"
              className="logo-btn remove"
              onClick={handleRemoveLogo}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="logo-upload-btn"
          style={{ borderColor: teamColor }}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="upload-icon">+</span>
          <span className="upload-text">Add Logo</span>
        </button>
      )}

      <style>{`
        .logo-uploader {
          margin-top: 8px;
        }

        .logo-upload-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border: 2px dashed;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.2s;
        }

        .logo-upload-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .upload-icon {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.6);
        }

        .upload-text {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 4px;
        }

        .logo-preview {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-image {
          width: 60px;
          height: 60px;
          object-fit: contain;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px;
        }

        .logo-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .logo-btn {
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logo-btn.change {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .logo-btn.change:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        .logo-btn.remove {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .logo-btn.remove:hover {
          background: rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  )
}

export default LogoUploader
