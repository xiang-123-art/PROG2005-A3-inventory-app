/*
 * Author: XiangHu
 * Student ID: 24832203
 * PROG2005 Assessment 3 Part 1
 * Ionic Inventory Management App - REST API Service
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryItem, StockStatus } from '../models/inventory-item';

// Server endpoint for the ArtGallery inventory API
const API_ENDPOINT = 'https://prog2005.it.scu.edu.au/ArtGalley';

@Injectable({
  providedIn: 'root'
})
export class InventoryApiService {

  constructor(private http: HttpClient) {}

  // GET all items from the server
  getAllItems(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(API_ENDPOINT + '/');
  }

  // GET a single item by name
  getItemByName(name: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(API_ENDPOINT + '/' + encodeURIComponent(name.trim()));
  }

  // POST a new item to the server
  addItem(item: InventoryItem): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(API_ENDPOINT + '/', item, { headers });
  }

  // PUT (update) an existing item by name
  updateItem(name: string, item: Partial<InventoryItem>): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(API_ENDPOINT + '/' + encodeURIComponent(name.trim()), item, { headers });
  }

  // DELETE an item by name (note: "Laptop" deletion is forbidden on the server)
  deleteItem(name: string): Observable<any> {
    return this.http.delete(API_ENDPOINT + '/' + encodeURIComponent(name.trim()));
  }

  // Utility: calculate stock status based on quantity
  getStockStatus(quantity: number): StockStatus {
    if (quantity <= 0) return StockStatus.OutOfStock;
    if (quantity <= 10) return StockStatus.LowStock;
    return StockStatus.InStock;
  }
}
