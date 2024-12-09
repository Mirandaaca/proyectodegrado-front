import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isCollapsed = signal(localStorage.getItem('sidebarCollapsed') === 'true');

  getCollapsedState() {
    return this.isCollapsed;
  }

  toggleSidebar() {
    this.isCollapsed.update(state => {
      const newState = !state;
      localStorage.setItem('sidebarCollapsed', newState.toString());
      return newState;
    });
  }
}