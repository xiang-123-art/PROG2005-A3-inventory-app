/*
 * Author: XiangHu
 * Student ID: 24832203
 * PROG2005 Assessment 3 Part 1
 * Ionic Inventory Management App - Data Model
 */

// Category enum for inventory items
export enum Category {
  Electronics = 'Electronics',
  Furniture = 'Furniture',
  Clothing = 'Clothing',
  Tools = 'Tools',
  Miscellaneous = 'Miscellaneous'
}

// Stock status enum for inventory items
export enum StockStatus {
  InStock = 'In stock',
  LowStock = 'Low stock',
  OutOfStock = 'Out of stock'
}

// Inventory item interface matching the remote database schema (snake_case)
export interface InventoryItem {
  item_id: number;          // Unique, Auto-incrementing
  item_name: string;        // String, Required
  category: Category;       // Enum
  quantity: number;         // Integer, Required
  price: number;            // Integer, Required
  supplier_name: string;    // String, Required
  stock_status: StockStatus;// Enum
  featured_item: number;    // Integer, Default: 0 (1 = featured)
  special_note?: string;    // String, Optional
}
