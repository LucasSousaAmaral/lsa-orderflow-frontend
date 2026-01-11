import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { 
  Product, 
  OrderItemRequest, 
  CreateOrderRequest, 
  UpdateOrderRequest,
  Order,
  OrderStatus,
  OrderStatusEnum
} from '../../models/order.models';

interface OrderItemForm {
  productId: string; // GUID
  quantity: number;
  productName: string;
  unitPrice: number;
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  products: Product[] = [];
  orderItems: OrderItemForm[] = [];
  
  isEditMode = false;
  orderId: string | null = null;
  currentStatus: OrderStatus = 'Pending';
  
  loading = false;
  loadingProducts = false;
  submitting = false;
  error: string | null = null;
  errors: string[] = [];
  
  customerId = '11111111-1111-1111-1111-111111111111'; // Fixed customer ID (GUID)

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.orderId = params['id'];
        this.loadOrder();
      } else {
        // Start with one empty item for create mode
        this.addItem();
      }
    });
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loadingProducts = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar produtos. Tente novamente.';
        this.loadingProducts = false;
      }
    });
  }

  loadOrder(): void {
    if (!this.orderId) return;
    
    this.loading = true;
    this.orderService.getOrderById(this.orderId, 5).subscribe({
      next: (order) => {
        this.currentStatus = order.status;
        this.customerId = order.customerId;
        
        // Populate form with existing items
        if (order.items && order.items.length > 0) {
          this.orderItems = order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            productName: item.productName,
            unitPrice: item.unitPrice
          }));
        } else {
          // Se não houver itens, inicia com um item vazio
          this.addItem();
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erro ao carregar pedido';
        this.loading = false;
      }
    });
  }

  addItem(): void {
    if (this.products.length > 0) {
      const firstProduct = this.products[0];
      this.orderItems.push({
        productId: firstProduct.id,
        quantity: 1,
        productName: firstProduct.name,
        unitPrice: firstProduct.price
      });
    } else {
      this.orderItems.push({
        productId: '',
        quantity: 1,
        productName: '',
        unitPrice: 0
      });
    }
  }

  removeItem(index: number): void {
    if (this.orderItems.length > 1) {
      this.orderItems.splice(index, 1);
    }
  }

  onProductChange(item: OrderItemForm): void {
    const product = this.products.find(p => p.id === item.productId);
    if (product) {
      item.productName = product.name;
      item.unitPrice = product.price;
    }
  }

  getPreviewTotal(): number {
    return this.orderItems.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);
  }

  validateForm(): boolean {
    this.errors = [];
    
    if (this.orderItems.length === 0) {
      this.errors.push('Adicione pelo menos um item ao pedido');
      return false;
    }
    
    for (let i = 0; i < this.orderItems.length; i++) {
      const item = this.orderItems[i];
      
      if (!item.productId || item.productId === '') {
        this.errors.push(`Item ${i + 1}: Selecione um produto`);
      }
      
      if (!item.quantity || item.quantity < 1) {
        this.errors.push(`Item ${i + 1}: Quantidade deve ser maior que zero`);
      }
      
      if (!Number.isInteger(item.quantity)) {
        this.errors.push(`Item ${i + 1}: Quantidade deve ser um número inteiro`);
      }
    }
    
    return this.errors.length === 0;
  }

  submitForm(): void {
    if (!this.validateForm()) {
      return;
    }
    
    this.submitting = true;
    this.error = null;
    this.errors = [];
    
    const items: OrderItemRequest[] = this.orderItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    
    if (this.isEditMode && this.orderId) {
      this.updateOrder(items);
    } else {
      this.createOrder(items);
    }
  }

  createOrder(items: OrderItemRequest[]): void {
    const request: CreateOrderRequest = {
      customerId: this.customerId,
      items: items
    };
    
    console.log('Criando pedido...', request);
    
    this.orderService.createOrderAndFetch(request).subscribe({
      next: (order) => {
        console.log('Pedido criado e sincronizado com sucesso!', order);
        this.submitting = false;
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => {
        console.error('Erro ao criar pedido:', err);
        this.handleSubmitError(err);
      }
    });
  }

  updateOrder(items: OrderItemRequest[]): void {
    if (!this.orderId) return;
    
    // Converter status string para enum number
    const statusEnum = OrderStatusEnum[this.currentStatus];
    
    const request: UpdateOrderRequest = {
      orderId: this.orderId,
      newStatus: statusEnum,
      replaceItems: items
    };
    
    console.log('Atualizando pedido...', request);
    
    this.orderService.updateOrder(this.orderId, request).subscribe({
      next: () => {
        console.log('Pedido atualizado. Aguardando sincronização...');
        this.submitting = false;
        // Aguarda 1.5s para o read model atualizar, depois busca o pedido atualizado
        setTimeout(() => {
          console.log('Buscando pedido atualizado...');
          this.orderService.getOrderById(this.orderId!, 10).subscribe({
            next: () => {
              this.router.navigate(['/orders', this.orderId]);
            },
            error: () => {
              // Se falhar, navega mesmo assim
              this.router.navigate(['/orders', this.orderId]);
            }
          });
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao atualizar pedido:', err);
        this.handleSubmitError(err);
      }
    });
  }

  handleSubmitError(err: any): void {
    this.submitting = false;
    
    if (err.errors && Array.isArray(err.errors)) {
      this.errors = err.errors;
      this.error = 'Corrija os erros abaixo:';
    } else {
      this.error = err.message || 'Erro ao salvar pedido';
    }
  }

  cancel(): void {
    if (this.isEditMode && this.orderId) {
      this.router.navigate(['/orders', this.orderId]);
    } else {
      this.router.navigate(['/orders']);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Permite apenas números no campo quantidade
   */
  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Permite apenas números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}

