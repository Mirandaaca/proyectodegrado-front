import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './shared/components/layout/sidebar/sidebar.component';
import { NavbarComponent } from './shared/components/layout/navbar/navbar.component';
import { SidebarService } from './shared/services/sidebar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public sidebarService: SidebarService) {}
}