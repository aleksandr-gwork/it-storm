import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderModalComponent } from './components/order-modal/order-modal.component';
import {ReactiveFormsModule} from "@angular/forms";
import { ArticleCardComponent } from './components/article-card/article-card.component';



@NgModule({
  declarations: [
    OrderModalComponent,
    ArticleCardComponent
  ],
  exports: [
    OrderModalComponent,
    ArticleCardComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
