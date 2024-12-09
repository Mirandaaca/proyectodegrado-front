// notification.service.ts
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  success(message: string) {
    this.Toast.fire({
      icon: 'success',
      title: message,
      background: '#10B981',
      color: '#ffffff',
      iconColor: '#ffffff'
    });
  }

  error(message: string, details?: any) {
    const errorMessage = details ? `${message}\n${details}` : message;
    this.Toast.fire({
      icon: 'error',
      title: errorMessage,
      background: '#EF4444',
      color: '#ffffff',
      iconColor: '#ffffff',
      timer: 3000, // Más tiempo para leer el mensaje
    });
  }
  showErrorAlert(message: string, details?: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Entendido',
      background: '#ffffff',
      customClass: {
        popup: 'error-popup',
        title: 'error-title',
        confirmButton: 'error-confirm-button'
      }
    });
  }
  handleBackendError(response: any) {
    Swal.fire({
      icon: 'error',
      title: 'No se pudo completar la acción',
      html: `
        <div class="text-left">
          <p class="font-medium text-red-600">${response.message}</p>
          ${response.errors ? `
            <div class="mt-2 text-sm text-gray-600">
              <p class="font-medium">Detalles adicionales:</p>
              <ul class="list-disc pl-5">
                ${Object.entries(response.errors).map(([key, value]) => 
                  `<li>${value}</li>`
                ).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Entendido',
      customClass: {
        popup: 'error-popup',
        title: 'error-title',
        htmlContainer: 'error-content',
        confirmButton: 'error-confirm-button'
      }
    });
  }
  info(message: string) {
    this.Toast.fire({
      icon: 'info',
      title: message,
      background: '#3B82F6',
      color: '#ffffff',
      iconColor: '#ffffff'
    });
  }
  // Método específico para errores del backend
  handleError(response: any) {
    this.error(response.message || 'Ha ocurrido un error');
  }

  // Para confirmaciones (por ejemplo, antes de eliminar)
  async confirm(title: string, text: string) {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      customClass: {
        container: 'custom-swal-container',
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        confirmButton: 'custom-swal-confirm',
        cancelButton: 'custom-swal-cancel'
      }
    });
    return result.isConfirmed;
  }

  // Para mostrar un loader durante operaciones largas
  showLoading(message: string = 'Procesando...') {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Para cerrar el loader
  closeLoading() {
    Swal.close();
  }
}