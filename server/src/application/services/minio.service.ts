import { randomUUID } from 'node:crypto'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Buffer } from 'node:buffer'

export class MinIOService {
  private s3Client: S3Client
  private bucketName: string
  private baseUrl: string

  constructor() {
    this.bucketName = Bun.env.MINIO_BUCKET_NAME || 'images'
    this.baseUrl = Bun.env.MINIO_API_URL!

    const isProduction = Bun.env.NODE_ENV === 'production'

    this.s3Client = new S3Client({
      endpoint: this.baseUrl,
      region: 'us-east-1',
      credentials: {
        accessKeyId: Bun.env.MINIO_ACCESS_KEY!,
        secretAccessKey: Bun.env.MINIO_SECRET_KEY!
      },
      forcePathStyle: true,
      // Configuration pour supporter les ZIP avec HTML (basée sur boto3 qui fonctionnait)
      maxAttempts: 3,
      ...(isProduction
        ? {}
        : {
            requestHandler: {
              requestTimeout: 60000, // 60 secondes pour les gros fichiers
              httpsAgent: { rejectUnauthorized: false }
            }
          })
    })
  }
  /**
   * Upload un fichier vers MinIO
   */
  async uploadFile(file: File, folder: string): Promise<{ id: string; url: string }> {
    console.info(`[MINIO] Début upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    const id = randomUUID()
    const extension = this.getFileExtension(file.type)
    const fileName = `${folder}/${id}.${extension}`

    console.info(`[MINIO] Lecture du buffer...`)
    const buffer = await file.arrayBuffer()

    // Configuration adaptée selon le type de fichier
    const commandOptions: any = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: new Uint8Array(buffer),
      ContentType: file.type,
      ContentLength: file.size
    }

    console.info(`[MINIO] Envoi vers MinIO: ${fileName}`)
    const command = new PutObjectCommand(commandOptions)

    await this.s3Client.send(command)

    const result = {
      id,
      url: `${this.baseUrl}/${this.bucketName}/${fileName}`
    }

    console.info(`[MINIO] Upload réussi: ${result.url}`)
    return result
  }
  /**
   * Upload un fichier vers MinIO depuis un buffer (pour la migration)
   */
  async uploadFileFromBuffer(
    buffer: Buffer,
    originalFilename: string,
    contentType: string,
    folder: string
  ): Promise<{ id: string; url: string }> {
    const id = this.extractIdFromFilename(originalFilename) || randomUUID()
    const extension = this.getFileExtension(contentType)
    const fileName = `${folder}/${id}.${extension}`

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: new Uint8Array(buffer),
      ContentType: contentType
    })

    await this.s3Client.send(command)

    const url = `${this.baseUrl}/${this.bucketName}/${fileName}`
    return { id, url }
  }
  /**
   * Supprime un fichier de MinIO
   */
  async deleteFile(folder: string, fileId: string, extension: string): Promise<boolean> {
    try {
      const fileName = `${folder}/${fileId}.${extension}`

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName
      })

      await this.s3Client.send(command)
      return true
    } catch (error) {
      console.error('Error deleting file from MinIO:', error)
      return false
    }
  }
  /**
   * Génère une URL signée pour l'accès temporaire à un fichier
   */
  async getSignedUrl(folder: string, fileId: string, extension: string, expiresIn: number = 3600): Promise<string> {
    const fileName = `${folder}/${fileId}.${extension}`

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName
    })

    return await getSignedUrl(this.s3Client, command, { expiresIn })
  }
  /**
   * Vérifie si un fichier existe dans MinIO
   */
  async fileExists(folder: string, fileId: string, extension: string): Promise<boolean> {
    try {
      const fileName = `${folder}/${fileId}.${extension}`

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName
      })

      await this.s3Client.send(command)
      return true
    } catch {
      return false
    }
  }

  /**
   * Télécharge un fichier depuis MinIO
   */
  async downloadFile(fileUrl: string): Promise<ArrayBuffer> {
    try {
      // Extraire le nom du fichier depuis l'URL
      const urlParts = fileUrl.split('/')
      const fileName = urlParts.at(-1) || ''

      // Construire le chemin complet
      const folder = urlParts.at(-2) || 'games'
      const key = `${folder}/${fileName}`

      console.info(`[MINIO] Téléchargement du fichier: ${key}`)

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })

      const response = await this.s3Client.send(command)

      if (!response.Body) {
        throw new Error('Fichier introuvable ou vide')
      }

      // Convertir le stream en ArrayBuffer
      const chunks: Uint8Array[] = []
      const reader = response.Body.transformToWebStream().getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
        }
      } finally {
        reader.releaseLock()
      }

      // Combiner tous les chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }

      console.info(`[MINIO] Fichier téléchargé: ${totalLength} bytes`)
      return result.buffer
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error)
      throw error
    }
  }

  /**
   * Génère une URL publique pour un fichier
   */
  getAutoRenewedSignedUrl(folder: string, fileId: string, extension: string): string {
    return this.getPublicUrl(folder, fileId, extension)
  }

  /**
   * Obtient l'extension du fichier à partir du type MIME
   */
  private getFileExtension(mimeType: string): string {
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/zip': 'zip',
      'text/html': 'html',
      'application/javascript': 'js',
      'application/json': 'json',
      'application/x-shockwave-flash': 'swf'
    }

    return mimeToExt[mimeType] || 'bin'
  }

  /**
   * Obtient l'URL publique d'un fichier
   */
  getPublicUrl(folder: string, fileId: string, extension: string): string {
    return `${this.baseUrl}/${this.bucketName}/${folder}/${fileId}.${extension}`
  }

  /**
   * Extrait l'ID d'un fichier à partir de son URL
   */
  extractFileIdFromUrl(url: string): { folder: string; fileId: string; extension: string } | null {
    try {
      const urlParts = url.replace(`${this.baseUrl}/${this.bucketName}/`, '').split('/')
      const folder = urlParts[0]
      const fileWithExt = urlParts[1]
      const lastDotIndex = fileWithExt.lastIndexOf('.')
      const fileId = fileWithExt.slice(0, lastDotIndex)
      const extension = fileWithExt.slice(lastDotIndex + 1)

      return { folder, fileId, extension }
    } catch (error) {
      console.error('Error extracting file ID from URL:', error)
      return null
    }
  }

  /**
   * Extrait l'ID du nom de fichier (avant la première extension)
   */
  private extractIdFromFilename(filename: string): string | null {
    const match = filename.match(/^([^.]+)/)
    return match ? match[1] : null
  }
}
