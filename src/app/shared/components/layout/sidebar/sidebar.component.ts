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
      route: '/tests',
      subItems: [
        {
          icon: 'person_search',
          label: 'Test de Personalidad',
          route: 'personalidad'
        },
        {
          icon: 'grid_view',
          label: 'Test de Raven',
          route: 'raven'
        },
        {
          icon: 'translate',
          label: 'Test de Verbalización',
          route: 'verbalizacion'
        }
      ]
    },
    {
      icon: 'analytics',
      label: 'Reportes',
      route: '/reportes/diagnosticos',
      subItems:[
        {
          icon: 'analytics',
          label: 'Diagnostico del Test de P.',
          route: 'diagnostico-personalidad'
        },
        {
          icon: 'analytics',
          label: 'Diagnostico del Test de Raven',
          route: 'diagnostico-raven'
        }
      ]
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
        },
        {
          icon: 'accessibility',
          label: 'Factores',
          route: 'factores'
        },
        {
          icon: 'quiz',
          label: 'Test Psicotecnicos',
          route: 'testpsicotecnicos'
        }
      ]
    },
    {
      icon: 'security',
      label: 'Seguridad',
      route: '/seguridad',
      expanded: false,
      subItems: [
        {
          icon: 'person',
          label: 'usuarios',
          route: 'usuarios'
        }
      ]
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