export interface Offer {
  id: number;
  serviceId: number;
  serviceName: string;
  description: string;
  imageUrl: string | null;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  isActive: boolean;
  expiresAt: string | null;
}
