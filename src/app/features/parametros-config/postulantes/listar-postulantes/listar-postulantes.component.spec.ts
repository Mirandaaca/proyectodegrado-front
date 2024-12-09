import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPostulantesComponent } from './listar-postulantes.component';

describe('ListarPostulantesComponent', () => {
  let component: ListarPostulantesComponent;
  let fixture: ComponentFixture<ListarPostulantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPostulantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPostulantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
