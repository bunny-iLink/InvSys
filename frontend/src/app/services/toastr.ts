// Angular imports
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class CustomToastService {
  constructor(private toastr: ToastrService) {}

  // Show toast function which takes subject, description, type and duration to show the toastr dialogue
  showToast(
    subject: string,
    description: string,
    type: string,
    duration: number = 3000
  ) {
    if (type === 'success') {
      this.toastr.success(description, subject, {
        timeOut: duration,
        positionClass: 'toast-top-right',
        progressBar: true,
      });
    } else if (type === 'error') {
      this.toastr.error(description, subject, {
        timeOut: duration,
        positionClass: 'toast-top-right',
        progressBar: true,
      });
    } else if (type === 'info') {
      this.toastr.info(description, subject, {
        timeOut: duration,
        positionClass: 'toast-top-right',
        progressBar: true,
      });
    } else if (type === 'warning') {
      this.toastr.warning(description, subject, {
        timeOut: duration,
        positionClass: 'toast-top-right',
        progressBar: true,
      });
    }
  }
}
