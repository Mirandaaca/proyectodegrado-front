import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPostulanteComponent } from './crear-postulante.component';

describe('CrearPostulanteComponent', () => {
  let component: CrearPostulanteComponent;
  let fixture: ComponentFixture<CrearPostulanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPostulanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPostulanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
