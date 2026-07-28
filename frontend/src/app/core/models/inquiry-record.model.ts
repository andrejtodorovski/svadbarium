export interface InquiryRecord {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  eventDate: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
}
