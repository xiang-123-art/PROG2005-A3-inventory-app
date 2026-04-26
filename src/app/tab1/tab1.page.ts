/*
 * Author: XiangHu
 * Student ID: 24832203
 * PROG2005 Assessment 3 Part 1
 * Tab1 - List and Search Inventory Items Page
 * Features: API-based search, local filter, pull-to-refresh, skeleton loading
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonItem, IonLabel, IonBadge, IonNote, IonIcon,
  IonButton, IonRefresher, IonRefresherContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonText, IonSkeletonText, IonChip
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { search, refresh, eye, list, alertCircle, closeCircle } from 'ionicons/icons';
import { InventoryApiService } from '../services/inventory-api.service';
import { InventoryItem, StockStatus } from '../models/inventory-item';
import { HelpWidgetComponent } from '../components/help-widget/help-widget.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
    IonList, IonItem, IonLabel, IonBadge, IonNote, IonIcon,
    IonButton, IonRefresher, IonRefresherContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonText, IonSkeletonText, IonChip,
    HelpWidgetComponent
  ],
})
export class Tab1Page implements OnInit {
  // All inventory items from the server
  allItems: InventoryItem[] = [];
  // Filtered items displayed in the list
  filteredItems: InventoryItem[] = [];
  // Search keyword
  searchTerm: string = '';
  // Loading state
  isLoading: boolean = false;
  // Whether we are performing an API search (vs local filter)
  isApiSearch: boolean = false;
  // Error message
  errorMessage: string = '';
  // Stock status enum reference for template
  stockStatus = StockStatus;

  // Help items for this page
  helpItems = [
    { question: 'How to use this page', answer: 'This is the Inventory List page. It displays all inventory items stored on the server. Items are sorted with the newest additions shown at the top. The list automatically refreshes every time you switch to this tab.' },
    { question: 'Step 1: View all items', answer: 'When you open this page, all items are loaded automatically. Each item card shows the item name, ID, category, quantity, price, supplier, stock status, and special note (if any). Featured items are marked with a "Featured" badge.' },
    { question: 'Step 2: Search for an item', answer: 'Type an item name in the search bar at the top. As you type, the list filters locally to show matching items. Press Enter to perform an exact API search on the server. To clear the search and see all items, tap the X button on the search bar.' },
    { question: 'Step 3: Refresh the data', answer: 'Pull down on the list to trigger a pull-to-refresh, which reloads all items from the server. This is useful if you have added or modified items on another tab.' },
    { question: 'Understanding stock status badges', answer: 'Green badge = In Stock (quantity > 10), Orange badge = Low Stock (quantity 1-10), Red badge = Out of Stock (quantity = 0). Stock status is auto-calculated based on the item quantity.' },
    { question: 'Tips', answer: 'Item names must contain only letters, spaces, and hyphens. Items with invalid names (e.g., numbers) are automatically filtered out. If no items are shown, try refreshing or check your network connection.' }
  ];

  constructor(
    private apiService: InventoryApiService,
    private toastController: ToastController
  ) {
    addIcons({ search, refresh, eye, list, alertCircle, closeCircle });
  }

  ngOnInit() {
    this.loadItems();
  }

  // Reload items every time the tab becomes active
  ionViewWillEnter() {
    this.loadItems();
  }

  // Load all items from the server
  loadItems() {
    this.isLoading = true;
    this.errorMessage = '';
    this.isApiSearch = false;
    this.apiService.getAllItems().subscribe({
      next: (data: any) => {
        const rawItems = (data?.value || data) || [];
        this.allItems = rawItems.filter((item: InventoryItem) =>
          item.item_name && item.item_name.trim() !== '' && /^[a-zA-Z\s\-]+$/.test(item.item_name.trim())
        ).sort((a: InventoryItem, b: InventoryItem) => (b.item_id ?? 0) - (a.item_id ?? 0));
        this.filteredItems = [...this.allItems];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load items. Please check your connection.';
        this.isLoading = false;
        console.error('Error loading items:', err);
      }
    });
  }

  // Handle pull-to-refresh
  handleRefresh(event: any) {
    this.isApiSearch = false;
    this.searchTerm = '';
    this.apiService.getAllItems().subscribe({
      next: (data: any) => {
        const rawItems = (data?.value || data) || [];
        this.allItems = rawItems.filter((item: InventoryItem) =>
          item.item_name && item.item_name.trim() !== '' && /^[a-zA-Z\s\-]+$/.test(item.item_name.trim())
        ).sort((a: InventoryItem, b: InventoryItem) => (b.item_id ?? 0) - (a.item_id ?? 0));
        this.filteredItems = [...this.allItems];
        event.target.complete();
      },
      error: (err) => {
        this.errorMessage = 'Failed to refresh items.';
        event.target.complete();
        console.error('Error refreshing items:', err);
      }
    });
  }

  // Search via API when user submits the search bar (Enter key)
  onSearchSubmit() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // If search term is empty, show all items
      this.filteredItems = [...this.allItems];
      this.isApiSearch = false;
      return;
    }

    // Validate: name should only contain letters, spaces, and hyphens
    const nameRegex = /^[a-zA-Z\s\-]+$/;
    if (!nameRegex.test(this.searchTerm.trim())) {
      this.showToast('Item name should only contain letters, spaces, and hyphens.', 'warning');
      return;
    }

    this.isLoading = true;
    this.isApiSearch = true;
    this.errorMessage = '';
    this.apiService.getItemByName(this.searchTerm.trim()).subscribe({
      next: (data: any) => {
        const item = data?.value || data;
        this.filteredItems = item ? [item] : [];
        this.isLoading = false;
      },
      error: (err) => {
        this.filteredItems = [];
        this.isLoading = false;
        this.showToast('No item found with that name. Try a different search term.', 'warning');
        console.error('Error searching item:', err);
      }
    });
  }

  // Local filter as user types (does not call API)
  filterItems() {
    this.isApiSearch = false;
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredItems = [...this.allItems];
    } else {
      const term = this.searchTerm.trim().toLowerCase();
      this.filteredItems = this.allItems.filter(item =>
        item.item_name.toLowerCase().includes(term)
      );
    }
  }

  // Clear the search and show all items
  clearSearch() {
    this.searchTerm = '';
    this.filteredItems = [...this.allItems];
    this.isApiSearch = false;
  }

  // Get the color for stock status badge
  getStockColor(status: string): string {
    switch (status) {
      case StockStatus.InStock: return 'success';
      case StockStatus.LowStock: return 'warning';
      case StockStatus.OutOfStock: return 'danger';
      default: return 'medium';
    }
  }

  // Show toast notification
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [{ text: 'Dismiss', role: 'cancel' }]
    });
    await toast.present();
  }
}
