import { Routes } from '@angular/router';
import { ListarPostulantesComponent } from './features/parametros-config/postulantes/listar-postulantes/listar-postulantes.component';
import { CrearPostulanteComponent } from './features/parametros-config/postulantes/crear-postulante/crear-postulante.component';
import { EditarPostulanteComponent } from './features/parametros-config/postulantes/editar-postulante/editar-postulante.component';
import { LoginComponent } from './shared/components/login/login.component';
import { authGuard } from './shared/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout/layout.component';
import { CalendarioComponent } from './features/agenda/componentes/calendario/calendario.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'agenda', component: CalendarioComponent },

      {
        path: 'parametrosyconfigs',
        children: [
          {
            path: 'postulantes',
            children: [
              { path: '', component: ListarPostulantesComponent },
              { path: 'crear', component: CrearPostulanteComponent },
              { path: 'editar/:id', component: EditarPostulanteComponent }
            ]
          }
        ]
      },
      { path: '', redirectTo: 'agenda', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'app', pathMatch: 'full' },
  { path: '**', redirectTo: 'app' }

];
