import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {OrderService} from "../../services/order.service";

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss']
})
export class OrderModalComponent implements OnChanges {
  @Input() service?: string;
  @Input() isVisible: boolean = false;
  @Input() serviceInput: boolean = false;
  @Output() isVisibleChange = new EventEmitter<boolean>();

  modalState = {
    isVisible: false,
    isSubmitted: false
  };

  submitError = false;
  submitErrorMessage = 'При отправке произошла ошибка. Попробуйте ещё раз позже.';

  modalForm = this.fb.group({
    service: [this.service],
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ]+$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+7\d{10}|8\d{10}$/)]],
  });

  constructor(private fb: FormBuilder, private orderService: OrderService) {
  }

  ngOnChanges() {
    this.modalState.isVisible = this.isVisible;
    this.modalForm.get('service')?.setValue(this.service);
  }

  closeModal() {
    this.modalState.isVisible = false;
    this.isVisibleChange.emit(this.modalState.isVisible);
    this.modalState.isSubmitted = false;
    this.modalForm.reset();
  }

  sendOrder() {
    if (this.modalForm.valid) {
      if (this.serviceInput) {
        let data = {
          service: this.modalForm.get('service')?.value,
          name: this.modalForm.get('name')?.value,
          phone: this.modalForm.get('phone')?.value,
          type: 'order'
        }
        this.orderService.request(data)
          .subscribe(
            () => {
              this.modalState.isSubmitted = true;
            },
            (err) => {
              this.submitErrorMessage = err.error.message;
              this.submitError = true;
            }
          );
      } else if (!this.serviceInput) {
        let data = {
          name: this.modalForm.get('name')?.value,
          phone: this.modalForm.get('phone')?.value,
          type: 'consultation'
        }
        this.orderService.request(data)
          .subscribe(
            () => {
              this.modalState.isSubmitted = true;
            },
            (err) => {
              this.submitErrorMessage = err.error.message;
              this.submitError = true;
            }
          );
      }
    }

    console.log(this.modalForm.value);
  }
}
