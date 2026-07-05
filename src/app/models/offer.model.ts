// Refleja el OfferDTO del backend (GET /api/offers/active).
// La oferta no tiene precio propio: es un descuento sobre un servicio real
// de catalog_services, por eso trae originalPrice/discountedPrice ya
// calculados desde ese precio real.
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
