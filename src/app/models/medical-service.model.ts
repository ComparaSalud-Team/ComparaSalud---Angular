export interface MedicalService {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  categoryId: number | null;
  categoryName: string | null;
}
