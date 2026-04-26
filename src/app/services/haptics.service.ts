/*
 * Author: XiangHu
 * Student ID: 24832203
 * PROG2005 Assessment 3 Part 1
 * Haptics Service - Provides native tactile feedback using Capacitor
 * Demonstrates mobile-native integration (ULO1)
 */
import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root'
})
export class HapticsService {

  // Light impact haptic feedback - for button taps, toggle changes
  async lightImpact(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available on web/platform - fail silently
      console.log('Haptics not available:', e);
    }
  }

  // Medium impact haptic feedback - for form submissions, successful operations
  async mediumImpact(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.log('Haptics not available:', e);
    }
  }

  // Heavy impact haptic feedback - for destructive actions, errors
  async heavyImpact(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      console.log('Haptics not available:', e);
    }
  }

  // Notification haptic - for success/error feedback
  async notification(): Promise<void> {
    try {
      await Haptics.notification();
    } catch (e) {
      console.log('Haptics not available:', e);
    }
  }

  // Vibrate - simple vibrate for alerts
  async vibrate(): Promise<void> {
    try {
      await Haptics.vibrate();
    } catch (e) {
      console.log('Haptics not available:', e);
    }
  }
}
