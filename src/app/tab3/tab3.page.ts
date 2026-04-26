/*
 * Author: XiangHu
 * Student ID: 24832203
 * PROG2005 Assessment 3 Part 1
 * Tab3 - Update & Delete Inventory Items Page
 * Features: Read-only item name after search, strict validation, Toast, AlertController
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonButton, IonIcon, IonSegment, IonSegmentButton,
  IonToggle, IonText, IonNote
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { create, trash, search, alertCircle, checkmarkCircle } from 'ionicons/icons';
import { InventoryApiService } from '../services/inventory-api.service';
import { InventoryItem, Category, StockStatus } from '../models/inventory-item';
import { HapticsService } from '../services/haptics.service';
import { HelpWidgetComponent } from '../components/help-widget/help-widget.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
    IonButton, IonIcon, IonSegment, IonSegmentButton,
    IonToggle, IonText, IonNote,
    HelpWidgetComponent
  ],
})
export class Tab3Page {
  // Segment control: 'update' or 'delete'
  activeSegment: string = 'update';

  // Update form model
  updateForm = {
    itemName: '',
    quantity: null as number | null,
    price: null as number | null,
    supplierName: '',
    category: '' as string,
    featuredItem: false, // Boolean for Toggle binding
    specialNote: ''
  };

  // Delete form model
  deleteItemName: string = '';

  // Category enum values for dropdown
  categories = Object.values(Category);

  // UI state
  isSubmitting: boolean = false;
  isLoadingItem: boolean = false;

  // Validation error messages per field
  validationErrors: { [key: string]: string } = {};

  // Found item for update
  foundItem: InventoryItem | null = null;

  // Help items for this page
  helpItems = [
    { question: 'How to use this page', answer: 'This is the Manage Items page. You can update existing inventory items or delete them. Use the segment control at the top to switch between "Update" and "Delete" sections.' },
    { question: 'Step 1: Update an item — Find the item', answer: 'In the Update section, enter the exact item name in the "Item Name" field and tap "Find Item". The app will verify that the item exists on the server. If found, the current data will be loaded into the form and the name field becomes read-only.' },
    { question: 'Step 2: Update an item — Modify fields', answer: 'After finding the item, modify any of the fields: Category, Quantity, Price, Supplier Name, Featured Item toggle, or Special Note. Validation errors will appear in real-time next to invalid fields.' },
    { question: 'Step 3: Update an item — Submit changes', answer: 'Tap "Update Item" to submit your changes. The app validates all modified fields before sending the update to the server. On success, a confirmation toast appears and the form resets. Tap "Cancel" to discard changes.' },
    { question: 'Step 4: Delete an item', answer: 'Switch to the Delete section. Enter the exact item name and tap "Delete Item". The app will first verify that the item exists on the server. If it exists, a confirmation dialog appears asking you to confirm the deletion. This prevents accidental data loss.' },
    { question: 'Important notes', answer: 'Item names are case-sensitive and must match exactly. You cannot change an item name — you would need to delete and re-add it. The item "Laptop" cannot be deleted (server rule). Items that do not exist on the server cannot be updated or deleted — the app will show an error message.' }
  ];

  constructor(
    private apiService: InventoryApiService,
    private alertController: AlertController,
    private toastController: ToastController,
    private hapticsService: HapticsService
  ) {
    addIcons({ create, trash, search, alertCircle, checkmarkCircle });
  }

  // Find an item by name for updating
  findItemForUpdate() {
    if (!this.updateForm.itemName.trim()) {
      this.showToast('Please enter an item name to search.', 'warning');
      return;
    }

    // Validate name format
    if (!/^[a-zA-Z\s\-]+$/.test(this.updateForm.itemName.trim())) {
      this.showToast('Item name should only contain letters, spaces, and hyphens.', 'warning');
      return;
    }

    this.isLoadingItem = true;
    this.foundItem = null;
    // Fetch all items and verify existence locally (API returns 200 even for non-existent items)
    this.apiService.getAllItems().subscribe({
      next: (data: any) => {
        const items: InventoryItem[] = (data?.value || data) || [];
        const item = items.find((i: InventoryItem) => i.item_name === this.updateForm.itemName.trim());
        if (!item) {
          this.isLoadingItem = false;
          this.showToast(`Item "${this.updateForm.itemName}" does not exist. Please check the name and try again.`, 'danger');
          return;
        }
        this.foundItem = item;
        // Populate the form with existing data
        this.updateForm.quantity = item.quantity;
        this.updateForm.price = item.price;
        this.updateForm.supplierName = item.supplier_name;
        this.updateForm.category = item.category;
        this.updateForm.featuredItem = item.featured_item === 1; // Convert to boolean
        this.updateForm.specialNote = item.special_note || '';
        this.isLoadingItem = false;
        this.showToast('Item found! You can now update the fields.', 'success');
      },
      error: (err) => {
        this.isLoadingItem = false;
        this.showToast('Failed to search item. Please try again.', 'danger');
        console.error('Error finding item:', err);
      }
    });
  }

  // Validate update form field
  private validateUpdateField(field: string, value: any): string {
    switch (field) {
      case 'quantity': {
        if (value !== null && value !== undefined && value !== '') {
          if (!Number.isInteger(Number(value))) return 'Quantity must be a whole number.';
          if (Number(value) < 0) return 'Quantity must be 0 or greater.';
        }
        return '';
      }
      case 'price': {
        if (value !== null && value !== undefined && value !== '') {
          if (!Number.isInteger(Number(value))) return 'Price must be a whole number.';
          if (Number(value) <= 0) return 'Price must be greater than 0.';
        }
        return '';
      }
      case 'supplierName': {
        if (value && value.trim() && !/^[a-zA-Z\s\-]+$/.test(value.trim())) {
          return 'Supplier Name must contain only letters, spaces, and hyphens.';
        }
        return '';
      }
      default:
        return '';
    }
  }

  // Real-time validation on input change
  onFieldChange(field: string) {
    const error = this.validateUpdateField(field, (this.updateForm as any)[field]);
    if (error) {
      this.validationErrors[field] = error;
    } else {
      delete this.validationErrors[field];
    }
  }

  // Submit the update form
  onUpdateItem() {
    // Validate all fields
    this.validationErrors = {};
    const fieldsToValidate = ['quantity', 'price', 'supplierName'];
    let isValid = true;

    for (const field of fieldsToValidate) {
      const error = this.validateUpdateField(field, (this.updateForm as any)[field]);
      if (error) {
        this.validationErrors[field] = error;
        isValid = false;
      }
    }

    if (!isValid) {
      this.showToast('Please fix the validation errors before updating.', 'warning');
      return;
    }

    // Build update data - include all fields from the form
    const updateData: Partial<InventoryItem> = {};

    if (this.updateForm.quantity !== null && this.updateForm.quantity !== undefined) {
      updateData.quantity = Math.floor(Number(this.updateForm.quantity));
      updateData.stock_status = this.apiService.getStockStatus(updateData.quantity);
    }
    if (this.updateForm.price !== null && this.updateForm.price !== undefined) {
      updateData.price = Math.floor(Number(this.updateForm.price));
    }
    if (this.updateForm.supplierName.trim()) {
      updateData.supplier_name = this.updateForm.supplierName.trim();
    }
    if (this.updateForm.category) {
      updateData.category = this.updateForm.category as Category;
    }
    updateData.featured_item = this.updateForm.featuredItem ? 1 : 0; // Convert boolean to 0/1
    if (this.updateForm.specialNote.trim()) {
      updateData.special_note = this.updateForm.specialNote.trim();
    } else {
      updateData.special_note = '';
    }

    this.isSubmitting = true;
    this.apiService.updateItem(this.updateForm.itemName, updateData).subscribe({
      next: () => {
        this.hapticsService.mediumImpact(); // Haptic feedback on update success
        this.showToast('Item updated successfully!', 'success');
        this.resetUpdateForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        const serverMsg = err?.error?.message || err?.error || 'Failed to update item.';
        this.showToast(String(serverMsg), 'danger');
        this.isSubmitting = false;
        console.error('Error updating item:', err);
      }
    });
  }

  // Show delete confirmation using AlertController
  async confirmDelete() {
    if (!this.deleteItemName.trim()) {
      this.showToast('Please enter an item name to delete.', 'warning');
      return;
    }

    // Validate name format
    if (!/^[a-zA-Z\s\-]+$/.test(this.deleteItemName.trim())) {
      this.showToast('Item name should only contain letters, spaces, and hyphens.', 'warning');
      return;
    }

    // Fetch all items and check if the item exists locally
    this.isSubmitting = true;
    this.apiService.getAllItems().subscribe({
      next: (data: any) => {
        this.isSubmitting = false;
        const items: InventoryItem[] = (data?.value || data) || [];
        const exists = items.some((item: InventoryItem) => item.item_name === this.deleteItemName.trim());
        if (!exists) {
          this.showToast(`Item "${this.deleteItemName}" does not exist. Please check the name and try again.`, 'danger');
          return;
        }
        this.showDeleteConfirmation();
      },
      error: () => {
        this.isSubmitting = false;
        this.showToast('Failed to verify item. Please try again.', 'danger');
      }
    });
  }

  // Show the actual delete confirmation dialog
  private async showDeleteConfirmation() {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${this.deleteItemName}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.onDeleteItem();
          }
        }
      ]
    });

    await alert.present();
  }

  // Execute delete after confirmation
  onDeleteItem() {
    this.isSubmitting = true;
    this.apiService.deleteItem(this.deleteItemName).subscribe({
      next: () => {
        this.hapticsService.heavyImpact(); // Haptic feedback on delete
        this.showToast('Item deleted successfully!', 'success');
        this.deleteItemName = '';
        this.isSubmitting = false;
      },
      error: (err) => {
        let serverMsg = 'Failed to delete item.';
        if (typeof err?.error === 'string') {
          serverMsg = err.error;
        } else if (err?.error?.message) {
          serverMsg = err.error.message;
        } else if (err?.error?.error) {
          serverMsg = typeof err.error.error === 'string' ? err.error.error : JSON.stringify(err.error.error);
        } else if (err?.message) {
          serverMsg = err.message;
        }
        this.showToast(serverMsg, 'danger');
        this.isSubmitting = false;
        console.error('Error deleting item:', err);
      }
    });
  }

  // Reset the update form
  resetUpdateForm() {
    this.updateForm = {
      itemName: '',
      quantity: null,
      price: null,
      supplierName: '',
      category: '',
      featuredItem: false,
      specialNote: ''
    };
    this.foundItem = null;
    this.validationErrors = {};
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
