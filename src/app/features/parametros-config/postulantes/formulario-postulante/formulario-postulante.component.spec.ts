import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioPostulanteComponent } from './formulario-postulante.component';

describe('FormularioPostulanteComponent', () => {
  let component: FormularioPostulanteComponent;
  let fixture: ComponentFixture<FormularioPostulanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioPostulanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioPostulanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
