// sidebar.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarService } from '../../../services/sidebar.service';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  expanded?: boolean;
  subItems?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit{
  menuItems = signal<MenuItem[]>([
    {
      icon: 'calendar_today',
      label: 'Agenda',
      route: '/agenda'
    },
    {
      icon: 'psychology',
      label: 'Test Psicotécnicos',
      route: '/tests'
    },
    {
      icon: 'analytics',
      label: 'Reportes',
      route: '/reportes'
    },
    {
      icon: 'settings',
      label: 'Parametros y Config.',
      route: '/parametrosyconfigs',
      expanded: false,
      subItems: [
        {
          icon: 'person',
          label: 'Postulantes',
          route: 'postulantes'
        }
      ]
    },
    {
      icon: 'security',
      label: 'Seguridad',
      route: '/seguridad'
    }
  ]);

  constructor(
    public sidebarService: SidebarService,
    private router: Router
  ) {}
  ngOnInit(): void {
  }

  toggleMenu(item: MenuItem) {
    item.expanded = !item.expanded;
  }

  isRouteActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}