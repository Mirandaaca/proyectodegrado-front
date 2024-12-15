import { Routes } from '@angular/router';
import { ListarPostulantesComponent } from './features/parametros-config/postulantes/listar-postulantes/listar-postulantes.component';
import { CrearPostulanteComponent } from './features/parametros-config/postulantes/crear-postulante/crear-postulante.component';
import { EditarPostulanteComponent } from './features/parametros-config/postulantes/editar-postulante/editar-postulante.component';
import { LoginComponent } from './shared/components/login/login.component';
import { authGuard } from './shared/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout/layout.component';
import { CalendarioComponent } from './features/agenda/componentes/calendario/calendario.component';
import { ListarFactoresComponent } from './features/parametros-config/factores/listar-factores/listar-factores.component';
import { TestPersonalidadComponent } from './features/test-psicotecnicos/test-personalidad/test-personalidad/test-personalidad.component';
import { TomarTestPersonalidadComponent } from './features/test-psicotecnicos/test-personalidad/tomar-test-personalidad/tomar-test-personalidad.component';
import { TestRavenComponent } from './features/test-psicotecnicos/test-raven/test-raven/test-raven.component';
import { VistaPreviaRavenComponent } from './features/test-psicotecnicos/test-raven/vista-previa-raven/vista-previa-raven.component';
import { DiagnosticoPersonalidadComponent } from './features/reportes/diagnostico-personalidad/diagnostico-personalidad.component';
import { DiagnosticoRavenComponent } from './features/reportes/diagnostico-raven/diagnostico-raven.component';
import { ListarUsuariosComponent } from './features/seguridad/usuarios/listar-usuarios/listar-usuarios.component';
import { CrearUsuarioComponent } from './features/seguridad/usuarios/crear-usuario/crear-usuario.component';
import { EditarUsuarioComponent } from './features/seguridad/usuarios/editar-usuario/editar-usuario.component';
import { ListarTestPsicotecnicoComponent } from './features/parametros-config/test-psicotecnicos/listar-test-psicotecnico/listar-test-psicotecnico.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { 
      path: 'tomar-test-personalidad', 
      component: TomarTestPersonalidadComponent 
    },
    { 
      path: 'tomar-test-raven', 
      component: VistaPreviaRavenComponent 
    },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'agenda', component: CalendarioComponent },
     
      {
        path: 'tests',
        children: [
          { 
            path: 'personalidad', 
            children: [
              { path: '', component: TestPersonalidadComponent },
              { path: 'vista-previa', component: TomarTestPersonalidadComponent }
            ]
          },
          { 
            path: 'raven', 
            children: [
              { path: '', component: TestRavenComponent },
              {path: 'vista-previa', component: VistaPreviaRavenComponent}
            ]
          }
        ]
      },
      // Reportes
      {
        path: 'reportes',
        children: [
          {
            path: 'diagnosticos',
            children: [
              { path: 'diagnostico-personalidad', component: DiagnosticoPersonalidadComponent },
              { path: 'diagnostico-raven', component: DiagnosticoRavenComponent }
            ]
          }
        ]
      },
       // Seguridad
       {
        path: 'seguridad',
        children: [
          {
            path: 'usuarios',
            children: [
              { path: '', component: ListarUsuariosComponent },
              { path: 'crear', component: CrearUsuarioComponent },
              { path: 'editar/:id', component: EditarUsuarioComponent }
            ]
          }
        ]
      },
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
          },
          {
            path: 'factores',
            children:[
              {path: '', component: ListarFactoresComponent},
            ]
          },
          {
            path: 'testpsicotecnicos',
             children:[
              {path: '', component: ListarTestPsicotecnicoComponent},
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
