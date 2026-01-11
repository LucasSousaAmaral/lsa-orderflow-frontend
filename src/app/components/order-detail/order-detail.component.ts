import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus, OrderStatusEnum } from '../../models/order.models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error: string | null = null;
  orderId!: string;
  
  // Status update
  showStatusModal = false;
  newStatus: OrderStatus = 'Pending';
  updatingStatus = false;
  statusError: string | null = null;
  
  // Delete confirmation
  showDeleteModal = false;
  deleting = false;
  deleteError: string | null = null;

  availableStatuses: OrderStatus[] = ['Pending', 'Paid', 'Shipped', 'Cancelled'];

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      this.loadOrder();
    });
  }

  loadOrder(): void {
    this.loading = true;
    this.error = null;

    console.log(`Carregando pedido ${this.orderId}...`);

    this.orderService.getOrderById(this.orderId, 10).subscribe({
      next: (order) => {
        console.log('Pedido carregado com sucesso:', order);
        this.order = order;
        this.newStatus = order.status;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar pedido:', err);
        this.error = err.message || 'Erro ao carregar pedido';
        this.loading = false;
      }
    });
  }

  openStatusModal(): void {
    if (this.order) {
      this.newStatus = this.order.status;
      this.showStatusModal = true;
      this.statusError = null;
    }
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.statusError = null;
  }

  updateStatus(): void {
    if (!this.order || this.newStatus === this.order.status) {
      this.closeStatusModal();
      return;
    }

    this.updatingStatus = true;
    this.statusError = null;

    // Converter status string para enum number
    const statusEnum = OrderStatusEnum[this.newStatus];

    console.log(`Atualizando status para: ${this.newStatus} (enum: ${statusEnum})`);

    this.orderService.updateOrderStatus(this.orderId, statusEnum).subscribe({
      next: () => {
        console.log('Status atualizado. Aguardando sincronização...');
        this.updatingStatus = false;
        this.closeStatusModal();
        // Aguarda 1.5s e recarrega para ver a atualização no read model
        setTimeout(() => {
          console.log('Recarregando pedido após atualização de status...');
          this.loadOrder();
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        this.statusError = err.message || 'Erro ao atualizar status';
        this.updatingStatus = false;
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.deleteError = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteError = null;
  }

  deleteOrder(): void {
    this.deleting = true;
    this.deleteError = null;

    this.orderService.deleteOrder(this.orderId).subscribe({
      next: () => {
        this.deleting = false;
        this.closeDeleteModal();
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.deleteError = err.message || 'Erro ao excluir pedido';
        this.deleting = false;
      }
    });
  }

  editOrder(): void {
    this.router.navigate(['/orders', this.orderId, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getStatusClass(status: OrderStatus): string {
    const statusClasses: Record<OrderStatus, string> = {
      'Pending': 'status-pending',
      'Paid': 'status-paid',
      'Shipped': 'status-shipped',
      'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}

