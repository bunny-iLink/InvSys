import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm.html',
  styleUrls: ['./confirm.css'],
})
export class Confirm {
  // Input from the parent component (where this Confirm component will be used) to this component
  @Input() message: string = 'Are you sure?';
  @Input() show: boolean = false;
  @Input() confirmText: string = 'Yes';
  @Input() cancelText: string = 'No';

  // Output to the parent component (from where this COnfirm component is called). Emits confirmed or cancelled events
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  // Emit the confirmed event when clicked "Yes"
  onConfirm() {
    this.confirmed.emit();
  }

  // Emit the cancel event when clicked "No"
  onCancel() {
    this.cancelled.emit();
  }
}