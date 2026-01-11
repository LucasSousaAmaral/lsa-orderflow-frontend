import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order, OrderQueryParams, OrderStatus } from '../../models/order.models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  
  // Paginação
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;
  
  // Filtros
  searchText = '';

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    const params: OrderQueryParams = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.searchText && this.searchText.trim()) {
      params.search = this.searchText.trim();
    }

    this.orderService.getOrders(params).subscribe({
      next: (response) => {
        this.orders = response.items;
        this.totalPages = response.totalPages || Math.ceil(response.totalCount / response.pageSize);
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erro ao carregar pedidos';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  clearFilters(): void {
    this.searchText = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  createOrder(): void {
    this.router.navigate(['/orders/create']);
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

  get pages(): number[] {
    const maxVisible = 5;
    const pages: number[] = [];
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}

