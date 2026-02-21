/**
 * Upload Service - Handles image upload to external PHP API
 * Endpoint: https://cuma.click/bikinligaupload/upload.php
 */

const UPLOAD_API_URL = import.meta.env.VITE_UPLOAD_API_URL || 'https://cuma.click/bikinligaupload'
const UPLOAD_API_KEY = import.meta.env.VITE_UPLOAD_API_KEY || 'bkl_upload_2024_s3cur3_k3y'

/**
 * Upload an image file to external PHP server
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The public URL of the uploaded image
 * @throws {Error} - If upload fails
 */
export async function uploadImage(file) {
    // Client-side validation
    if (!file) throw new Error('No file selected')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipe file tidak diizinkan. Gunakan JPG, PNG, GIF, WebP, atau SVG.')
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
        throw new Error('File terlalu besar. Maksimal 2MB.')
    }

    // Build FormData
    const formData = new FormData()
    formData.append('file', file)

    try {
        const response = await fetch(`${UPLOAD_API_URL}/upload.php`, {
            method: 'POST',
            headers: {
                'X-Upload-Key': UPLOAD_API_KEY,
            },
            body: formData,
            // Note: Do NOT set Content-Type header, browser will set it with boundary
        })

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.message || 'Upload gagal')
        }

        return data.url
    } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            throw new Error('Gagal terhubung ke server upload. Periksa koneksi internet.')
        }
        throw err
    }
}

export default uploadImage
