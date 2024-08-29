import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {OrderService} from "../../services/order.service";

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss']
})
export class OrderModalComponent implements OnChanges{
  @Input() modalText?: string;
  @Input() isVisible = false;
  @Output() modalChange = new EventEmitter<{ isVisible: boolean; modalText?: string }>();

  modalState = {
    isVisible: false,
    isSubmitted: false
  };

  modalForm = this.fb.group({
    service: [this.modalText],
    name: [''],
    phone: [''],
  });

  //TODO: Не работает передача услуги в форму

  constructor(private fb: FormBuilder, private orderService: OrderService) {}

  ngOnChanges() {
    this.modalState.isVisible = this.isVisible;
  }

  closeModal() {
    this.modalState.isVisible = false;
    this.modalState.isSubmitted = false;
    this.modalChange.emit(this.modalState);
    this.modalForm.reset();
  }

  sendOrder() {
    this.modalState.isSubmitted = true;
  }
}
