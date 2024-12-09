import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEditarCitaComponent } from './crear-editar-cita.component';

describe('CrearEditarCitaComponent', () => {
  let component: CrearEditarCitaComponent;
  let fixture: ComponentFixture<CrearEditarCitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearEditarCitaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearEditarCitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
