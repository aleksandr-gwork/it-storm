import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {OrderService} from "../../services/order.service";

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss']
})
export class OrderModalComponent implements OnChanges{
  @Input() modalText?: string;
  @Input() isVisible = false;
  @Output() isVisibleChange = new EventEmitter<boolean>();

  modalState = {
    isVisible: false,
    isSubmitted: false
  };

  modalForm = this.fb.group({
    service: [this.modalText, Validators.required],
    name: [''],
    phone: [''],
  });

  //TODO: Не работает передача услуги в форму

  constructor(private fb: FormBuilder, private orderService: OrderService) {}

  ngOnChanges() {
    this.modalState.isVisible = this.isVisible;
    this.modalForm.get('service')?.setValue(this.modalText);
  }

  closeModal() {
    this.modalState.isVisible = false;
    this.isVisibleChange.emit(this.modalState.isVisible);
    this.modalState.isSubmitted = false;
    this.modalForm.reset();
  }

  sendOrder() {
    this.modalState.isSubmitted = true;
  }
}
