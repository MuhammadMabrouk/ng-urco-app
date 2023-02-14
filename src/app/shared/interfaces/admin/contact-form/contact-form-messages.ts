export interface ContactFormMessages {
  seqNo?: number;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: {
    id?: string;
    label?: string;
  };
  message?: string;
  receivedDate?: string;
  readingDate?: string;
}
