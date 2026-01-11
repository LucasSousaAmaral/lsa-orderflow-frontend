import { Routes } from '@angular/router';
import { OrderListComponent } from './components/order-list/order-list.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderFormComponent } from './components/order-form/order-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/orders', pathMatch: 'full' },
  { path: 'orders', component: OrderListComponent },
  { path: 'orders/create', component: OrderFormComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
  { path: 'orders/:id/edit', component: OrderFormComponent },
  { path: '**', redirectTo: '/orders' }
];

