import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SpecialtyService } from './services/specialty.service'; // ✅ Importar el SERVICIO

describe('SpecialtyService', () => { // ✅ Nombre correcto del servicio
  let service: SpecialtyService; // ✅ Usar SpecialtyService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // ✅ Necesario para servicios HTTP
      providers: [SpecialtyService]
    });
    service = TestBed.inject(SpecialtyService); // ✅ Inyectar SpecialtyService
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
