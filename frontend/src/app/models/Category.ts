// Category Model: Structure of a category as per the database
export interface Category {
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  createdBy: number;
  lastUpdatedBy: number;
}
