import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosPaciente } from './pagos-paciente';

describe('PagosPaciente', () => {
  let component: PagosPaciente;
  let fixture: ComponentFixture<PagosPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosPaciente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosPaciente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
