export interface FileUpload {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  slice?: Blob;
}
