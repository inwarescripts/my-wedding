export const RSVP_PAGE_SIZE = 10;

export interface RsvpEntryItem {
  id: string;
  name: string;
  phone: string | null;
  attending: "yes" | "no";
  guestCount: number;
  message: string | null;
  createdAt: string;
}
