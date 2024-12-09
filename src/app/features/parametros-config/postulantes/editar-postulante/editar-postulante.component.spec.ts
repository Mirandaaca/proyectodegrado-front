import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPostulanteComponent } from './editar-postulante.component';

describe('EditarPostulanteComponent', () => {
  let component: EditarPostulanteComponent;
  let fixture: ComponentFixture<EditarPostulanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPostulanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPostulanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
