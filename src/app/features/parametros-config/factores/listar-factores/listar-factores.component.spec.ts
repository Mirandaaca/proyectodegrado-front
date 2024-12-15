import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarFactoresComponent } from './listar-factores.component';

describe('ListarFactoresComponent', () => {
  let component: ListarFactoresComponent;
  let fixture: ComponentFixture<ListarFactoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarFactoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarFactoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
