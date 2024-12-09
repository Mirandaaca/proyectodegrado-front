// crear-editar-cita/crear-editar-cita.component.ts
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { PostulantesService } from '../../../../shared/services/postulantes.service';
import { Cita } from '../../../../models/citas/Cita';
import { Subject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-crear-editar-cita',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatAutocompleteModule,
    MatTooltipModule,
  ],
  templateUrl: './crear-editar-cita.component.html'
})
export class CrearEditarCitaComponent implements OnInit {
  form!: FormGroup;
  editando = false;
  minDate = new Date();
  postulantes$ = new Subject<any[]>();
  @Output() onSubmit = new EventEmitter<any>();
  
  colores = [
    { nombre: 'Azul', valor: '#4A90E2' },
    { nombre: 'Verde', valor: '#2ECC71' },
    { nombre: 'Rojo', valor: '#E74C3C' },
    { nombre: 'Morado', valor: '#9B59B6' },
    { nombre: 'Naranja', valor: '#E67E22' },
    { nombre: 'Turquesa', valor: '#1ABC9C' },
    { nombre: 'Rosa', valor: '#E91E63' },
    { nombre: 'Ámbar', valor: '#FFA000' }
  ];

  constructor(
    private fb: FormBuilder,
    private postulantesService: PostulantesService,
    public dialogRef: MatDialogRef<CrearEditarCitaComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Cita
  ) {
    this.editando = !!data;
    this.initForm();
    if (this.editando) {
      this.cargarDatosCita();
    }
  }

  ngOnInit() {
    // Configurar búsqueda de postulantes
    this.form.get('nombrePostulante')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(valor => this.postulantesService.obtenerPostulantesPorNombre(valor || ''))
    ).subscribe(postulantes => {
      this.postulantes$.next(postulantes);
    });

    // Manejar cambios en modalidad
    this.form.get('modalidad')?.valueChanges.subscribe(modalidad => {
      const horaInicio = this.form.get('horaInicio');
      const horaFin = this.form.get('horaFin');
      
      if (modalidad === 'Presencial') {
        if (horaInicio?.value > '12:00' || horaFin?.value > '12:00') {
          horaInicio?.setValue('08:00');
          horaFin?.setValue('12:00');
        }
      }
    });
  }
  horasDisponibles = Array.from({ length: 12 }, (_, i) => {
    const hora = i + 8; // Empezamos desde las 8
    return {
      valor: hora.toString().padStart(2, '0') + ':00',
      texto: `${hora}:00 ${hora < 12 ? 'AM' : 'PM'}`
    };
  });
  getHorasSegunModalidad() {
    const modalidad = this.form.get('modalidad')?.value;
    return this.horasDisponibles.filter(hora => {
      const horaNum = parseInt(hora.valor.split(':')[0]);
      if (modalidad === 'Presencial') {
        return horaNum >= 8 && horaNum <= 12;
      } else {
        return horaNum >= 8 && horaNum <= 19;
      }
    });
  }

  getHorasFinDisponibles() {
    const horaInicio = this.form.get('horaInicio')?.value;
    const modalidad = this.form.get('modalidad')?.value;
    
    return this.horasDisponibles.filter(hora => {
      const horaNum = parseInt(hora.valor.split(':')[0]);
      const horaInicioNum = parseInt(horaInicio.split(':')[0]);
      
      if (modalidad === 'Presencial') {
        return horaNum > horaInicioNum && horaNum <= 12;
      } else {
        return horaNum > horaInicioNum && horaNum <= 19;
      }
    });
  }
  private initForm() {
    this.form = this.fb.group({
      asunto: ['', Validators.required],
      idPostulante: ['', Validators.required],
      nombrePostulante: [''],
      fecha: [new Date(), [Validators.required]], // Aseguramos que sea un objeto Date
      modalidad: ['Virtual', Validators.required],
      horaInicio: ['08:00', [Validators.required, this.validarHoraInicio.bind(this)]],
      horaFin: ['09:00', [Validators.required, this.validarHoraFin.bind(this)]],
      lugar: ['', Validators.required],
      color: ['#4A90E2', Validators.required]
    }, { validators: this.validarRangoHoras });
  
    // Podemos agregar un listener para debuggear
    this.form.get('fecha')?.valueChanges.subscribe(value => {
      console.log('Valor de fecha:', value, 'Tipo:', typeof value);
    });
  }
  // Validadores personalizados
  validarHoraInicio(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const hora = control.value;
    const modalidad = this.form?.get('modalidad')?.value;
    
    if (modalidad === 'Presencial') {
      if (hora < '08:00' || hora > '12:00') {
        return { horaInvalida: 'Las citas presenciales deben ser entre las 8:00 AM y 12:00 PM' };
      }
    } else {
      if (hora < '08:00' || hora > '19:00') {
        return { horaInvalida: 'Las citas virtuales deben ser entre las 8:00 AM y 7:00 PM' };
      }
    }
    
    return null;
  }

  validarHoraFin(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const hora = control.value;
    const modalidad = this.form?.get('modalidad')?.value;
    
    if (modalidad === 'Presencial') {
      if (hora < '08:00' || hora > '12:00') {
        return { horaInvalida: 'Las citas presenciales deben terminar antes de las 12:00 PM' };
      }
    } else {
      if (hora < '08:00' || hora > '19:00') {
        return { horaInvalida: 'Las citas virtuales deben terminar antes de las 7:00 PM' };
      }
    }
    
    return null;
  }

  validarRangoHoras(group: FormGroup): ValidationErrors | null {
    const horaInicio = group.get('horaInicio')?.value;
    const horaFin = group.get('horaFin')?.value;
    
    if (horaInicio && horaFin && horaFin <= horaInicio) {
      return { rangoInvalido: 'La hora de fin debe ser posterior a la hora de inicio' };
    }
    
    return null;
  }
  cargarDatosCita() {
    if (this.data) {
      const fechaInicio = new Date(this.data.horaInicio);
      const horaInicio = fechaInicio.toTimeString().slice(0, 5);
      const horaFin = new Date(this.data.horaFin).toTimeString().slice(0, 5);

      this.form.patchValue({
        asunto: this.data.asunto,
        idPostulante: this.data.idPostulante,
        nombrePostulante: this.data.nombrePostulante,
        fecha: fechaInicio,
        modalidad: this.data.modalidad,
        horaInicio,
        horaFin,
        lugar: this.data.lugar,
        color: this.data.color
      });
    }
  }

  seleccionarPostulante(event: any) {
    const postulante = event.option.value;
    this.form.patchValue({
      idPostulante: postulante.id,
      nombrePostulante: `${postulante.nombre} ${postulante.apellido}`
    });
  }
  cerrar() {
    this.dialogRef.close();
  }
  guardar() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const fecha = new Date(formValue.fecha);
      
      const [horasInicio, minutosInicio] = formValue.horaInicio.split(':');
      const [horasFin, minutosFin] = formValue.horaFin.split(':');
      
      const horaInicio = new Date(Date.UTC(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        parseInt(horasInicio),
        parseInt(minutosInicio)
      ));
  
      const horaFin = new Date(Date.UTC(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        parseInt(horasFin),
        parseInt(minutosFin)
      ));
  
      const citaData = {
        id: this.editando ? this.data?.id : undefined,
        idPostulante: formValue.idPostulante,
        horaInicio: horaInicio.toISOString(),
        horaFin: horaFin.toISOString(),
        asunto: formValue.asunto,
        modalidad: formValue.modalidad,
        lugar: formValue.lugar,
        color: formValue.color
      };
  
      // En lugar de cerrar el diálogo, emitimos un evento
      this.onSubmit.emit(citaData);
    }
  }
}