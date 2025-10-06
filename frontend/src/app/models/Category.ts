// Category Model: Structure of a category as per the database
export interface Category {
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  createdBy: number;
  lastUpdatedBy: number;
  createdOn: string; // ISO date string
  lastUpdatedOn: string; // ISO date string
}
