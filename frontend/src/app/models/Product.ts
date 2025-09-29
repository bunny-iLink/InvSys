// Product Model: Represents a product. Structure as per the TbProducts table
export interface Product {
    productId: number;
    productName: string;
    categoryId: number;
    price: number;
    quantity: number;
    categoryName: string | null;
    mfgOn: string | null;
    expiryDate: string | null;
    isActive: boolean;
    createdBy: number;
    lastUpdatedBy: number | null;
    manufacturer: string | null;
    sku: string | null;
}