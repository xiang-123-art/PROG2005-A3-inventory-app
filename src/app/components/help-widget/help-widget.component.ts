/*
 * Author: XiangHu
 * Student ID: 24832203
 * PROG2005 Assessment 3 Part 1
 * Help Widget Component - provides contextual help on each page
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { helpCircle, close, informationCircle } from 'ionicons/icons';

@Component({
  selector: 'app-help-widget',
  templateUrl: './help-widget.component.html',
  styleUrls: ['./help-widget.component.scss'],
  imports: [CommonModule, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent],
})
export class HelpWidgetComponent {
  @Input() pageTitle: string = '';
  @Input() helpItems: { question: string; answer: string }[] = [];

  isModalOpen = false;

  constructor() {
    addIcons({ helpCircle, close, informationCircle });
  }

  // Open the help modal
  openHelp() {
    this.isModalOpen = true;
  }

  // Close the help modal
  closeHelp() {
    this.isModalOpen = false;
  }
}
