/*
 * Author: XiangHu
 * Student ID: 24832203
 * PROG2005 Assessment 3 Part 1
 * Tab2 - Add New Item & View Featured Items Page
 * Features: Strict input validation, Toast notifications, skeleton loading
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonNote,
  IonToggle, IonSegment, IonSegmentButton,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, star, refresh, alertCircle, checkmarkCircle } from 'ionicons/icons';
import { InventoryApiService } from '../services/inventory-api.service';
import { InventoryItem, Category, StockStatus } from '../models/inventory-item';
import { HapticsService } from '../services/haptics.service';
import { HelpWidgetComponent } from '../components/help-widget/help-widget.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
    IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonNote,
    IonToggle, IonSegment, IonSegmentButton,
    IonSkeletonText,
    HelpWidgetComponent
  ],
})
export class Tab2Page implements OnInit {
  // Segment control: 'add' or 'featured'
  activeSegment: string = 'add';

  // Form model
  newItem = {
    itemName: '',
    category: '' as string,
    quantity: null as number | null,
    price: null as number | null,
    supplierName: '',
    featuredItem: false, // Boolean for Toggle binding
    specialNote: ''
  };

  // Category enum values for dropdown
  categories = Object.values(Category);

  // Featured items list
  featuredItems: InventoryItem[] = [];

  // UI state
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  // Validation error messages per field
  validationErrors: { [key: string]: string } = {};

  // Help items for this page
  helpItems = [
    { question: 'How to use this page', answer: 'This is the Add & Featured Items page. You can add new inventory items to the server and view items that are marked as featured. Use the segment control at the top to switch between "Add" and "Featured" sections.' },
    { question: 'Step 1: Enter item details', answer: 'In the Add section, fill in all required fields: Item Name (letters, spaces, hyphens only, minimum 2 characters), Category (select from dropdown), Quantity (non-negative whole number), Price (positive whole number), and Supplier Name (letters, spaces, hyphens only).' },
    { question: 'Step 2: Optional fields', answer: 'Toggle the "Featured Item" switch to mark the item as featured. You can also add a "Special Note" for additional information. Both fields are optional.' },
    { question: 'Step 3: Add the item', answer: 'After filling in all required fields, tap the "Add Item" button. The app validates all fields before submission. If there are validation errors, they will be shown next to the relevant fields. On success, a confirmation toast appears and the form resets automatically.' },
    { question: 'Step 4: View featured items', answer: 'Switch to the "Featured" tab to see all items marked as featured. The list auto-refreshes after adding a new item. Pull down to manually refresh the list.' },
    { question: 'Validation rules', answer: 'Item Name & Supplier Name: letters, spaces, hyphens only. Quantity: whole number, 0 or greater. Price: whole number, greater than 0. Category: must be selected from the predefined list (Electronics, Furniture, Clothing, Tools, Miscellaneous). Stock Status is auto-calculated based on quantity.' }
  ];

  constructor(
    private apiService: InventoryApiService,
    private toastController: ToastController,
    private hapticsService: HapticsService
  ) {
    addIcons({ add, star, refresh, alertCircle, checkmarkCircle });
  }

  ngOnInit() {
    this.loadFeaturedItems();
  }

  // Load featured items from the server
  loadFeaturedItems() {
    this.isLoading = true;
    this.apiService.getAllItems().subscribe({
      next: (data: any) => {
        const items = ((data?.value || data) || []).filter((item: InventoryItem) =>
          item.item_name && item.item_name.trim() !== '' && /^[a-zA-Z\s\-]+$/.test(item.item_name.trim())
        );
        this.featuredItems = items.filter((item: InventoryItem) => item.featured_item === 1);
        this.isLoading = false;
      },
      error: (err) => {
        this.showToast('Failed to load featured items.', 'danger');
        this.isLoading = false;
        console.error('Error loading featured items:', err);
      }
    });
  }

  // Validate a single field and return error message (empty string if valid)
  private validateField(field: string, value: any): string {
    switch (field) {
      case 'itemName': {
        if (!value || !value.trim()) return 'Item Name is required.';
        // Name must only contain letters, spaces, and hyphens (no numbers/special chars)
        if (!/^[a-zA-Z\s\-]+$/.test(value.trim())) return 'Item Name must contain only letters, spaces, and hyphens.';
        if (value.trim().length < 2) return 'Item Name must be at least 2 characters.';
        return '';
      }
      case 'category': {
        if (!value) return 'Category is required.';
        return '';
      }
      case 'quantity': {
        if (value === null || value === undefined || value === '') return 'Quantity is required.';
        if (!Number.isInteger(Number(value))) return 'Quantity must be a whole number.';
        if (Number(value) < 0) return 'Quantity must be 0 or greater.';
        return '';
      }
      case 'price': {
        if (value === null || value === undefined || value === '') return 'Price is required.';
        if (!Number.isInteger(Number(value))) return 'Price must be a whole number.';
        if (Number(value) <= 0) return 'Price must be greater than 0.';
        return '';
      }
      case 'supplierName': {
        if (!value || !value.trim()) return 'Supplier Name is required.';
        if (!/^[a-zA-Z\s\-]+$/.test(value.trim())) return 'Supplier Name must contain only letters, spaces, and hyphens.';
        return '';
      }
      default:
        return '';
    }
  }

  // Validate all fields before submission
  private validateForm(): boolean {
    this.validationErrors = {};
    const fields = ['itemName', 'category', 'quantity', 'price', 'supplierName'];
    let isValid = true;

    for (const field of fields) {
      const error = this.validateField(field, (this.newItem as any)[field]);
      if (error) {
        this.validationErrors[field] = error;
        isValid = false;
      }
    }

    if (!isValid) {
      this.showToast('Please fix the validation errors before submitting.', 'warning');
    }
    return isValid;
  }

  // Real-time validation on input change
  onFieldChange(field: string) {
    const error = this.validateField(field, (this.newItem as any)[field]);
    if (error) {
      this.validationErrors[field] = error;
    } else {
      delete this.validationErrors[field];
    }
  }

  // Validate and submit the add item form
  onAddItem() {
    if (!this.validateForm()) return;

    // Build the item object for the API
    const item: InventoryItem = {
      item_id: 0, // Auto-incremented by the server
      item_name: this.newItem.itemName.trim(),
      category: this.newItem.category as Category,
      quantity: Math.floor(Number(this.newItem.quantity)),
      price: Math.floor(Number(this.newItem.price)),
      supplier_name: this.newItem.supplierName.trim(),
      stock_status: this.apiService.getStockStatus(Number(this.newItem.quantity)),
      featured_item: this.newItem.featuredItem ? 1 : 0, // Convert boolean to 0/1
      special_note: this.newItem.specialNote.trim() || undefined
    };

    this.isSubmitting = true;
    this.apiService.addItem(item).subscribe({
      next: () => {
        this.hapticsService.mediumImpact(); // Haptic feedback on success
        this.showToast('Item added successfully!', 'success');
        this.resetForm();
        this.loadFeaturedItems();
        this.isSubmitting = false;
      },
      error: (err) => {
        // Extract error message: try message, then string, then fallback
        let serverMsg = 'Failed to add item. Please try again.';
        if (typeof err?.error === 'string') {
          serverMsg = err.error;
        } else if (err?.error?.message) {
          serverMsg = err.error.message;
        } else if (err?.error?.error) {
          serverMsg = typeof err.error.error === 'string' ? err.error.error : JSON.stringify(err.error.error);
        } else if (err?.message) {
          serverMsg = err.message;
        }
        this.hapticsService.heavyImpact(); // Haptic feedback on error
        this.showToast(serverMsg, 'danger');
        this.isSubmitting = false;
        console.error('Error adding item:', err);
      }
    });
  }

  // Reset the add item form
  resetForm() {
    this.newItem = {
      itemName: '',
      category: '',
      quantity: null,
      price: null,
      supplierName: '',
      featuredItem: false,
      specialNote: ''
    };
    this.validationErrors = {};
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
