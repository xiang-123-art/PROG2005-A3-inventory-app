/*
 * Author: XiangHu
 * Student ID: 24832203
 * PROG2005 Assessment 3 Part 1
 * Tab4 - Privacy & Security Requirements Page
 * Enhanced with Australian Privacy Act references, ULO4 alignment
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shield, lockClosed, eyeOff, notifications, informationCircle, documentText, fingerPrint } from 'ionicons/icons';
import { HelpWidgetComponent } from '../components/help-widget/help-widget.component';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonAccordion, IonAccordionGroup, IonItem, IonLabel,
    HelpWidgetComponent
  ],
})
export class Tab4Page {
  // Help items for this page
  helpItems = [
    { question: 'How to use this page', answer: 'This is the Privacy & Security page. It provides a comprehensive analysis of privacy and security considerations for this mobile inventory management application, aligned with PROG2005 and the Australian Privacy Act 1988. Scroll down to read through each section.' },
    { question: 'Core Security Requirements', answer: 'This section explains how the app protects your data through input validation (letters-only names, integer-only quantities), HTTPS encryption for all server communication, URL encoding to prevent injection, and confirmation dialogs for destructive actions like delete.' },
    { question: 'Privacy & Australian Privacy Act', answer: 'This section details compliance with the Australian Privacy Principles (APPs). Key points: the app does not collect personal information (APP 3, APP 6), all data stays on an Australian server with no cross-border transfer (APP 8), and security standards are applied to all data (APP 11).' },
    { question: 'Ionic & Capacitor Architecture Security', answer: 'This section covers the hybrid mobile security model: the app runs in a sandboxed WebView with browser security features, Capacitor provides a secure bridge for native features (haptics, keyboard, status bar), and no credentials or tokens are stored on the device.' },
    { question: 'Ongoing Security Practices', answer: 'This section describes continuous security measures: keeping dependencies updated (Ionic 8, Angular 20, Capacitor 8), Angular template sanitisation to prevent XSS, proper API error handling, CORS configuration, and the principle of least privilege for device permissions.' },
    { question: 'Security FAQ', answer: 'Expand the FAQ section at the bottom to find answers to common security questions: what data is stored on your device (none), how data is encrypted (HTTPS in transit), what happens if you lose your device (no data risk), and how the app prevents unauthorised modifications.' }
  ];

  constructor() {
    addIcons({ shield, lockClosed, eyeOff, notifications, informationCircle, documentText, fingerPrint });
  }
}
