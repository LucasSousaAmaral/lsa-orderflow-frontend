// Product model
export interface Product {
  id: string; // GUID
  name: string;
  price: number;
  currency?: string;
}

// Order item for requests (only productId and quantity)
export interface OrderItemRequest {
  productId: string; // GUID
  quantity: number;
}

// Order item from read model (with all details)
export interface OrderItem {
  id: string; // GUID
  productId: string; // GUID
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Order status enum (match API)
export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Cancelled';

// Order read model
export interface Order {
  id: string;
  customerId: string;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  items?: OrderItem[]; // Opcional - pode não vir na lista
}

// Create order request
export interface CreateOrderRequest {
  customerId?: string;
  items: OrderItemRequest[];
}

// Update order request (matches API UpdateOrderCommand)
export interface UpdateOrderRequest {
  orderId: string;
  newStatus?: number | null; // Status como enum int
  replaceItems?: OrderItemRequest[] | null;
}

// Update order status request (usando UpdateOrderCommand)
export interface UpdateOrderStatusRequest {
  orderId: string;
  newStatus: number;
}

// Paginated response
export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number; // Opcional - calcularemos se não vier
}

// API Error response
export interface ApiError {
  status: number;
  errors: string[];
}

// Order query params (apenas search, page, pageSize)
export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// Status enum mapping (match API enum values)
export const OrderStatusEnum = {
  'Pending': 1,
  'Paid': 2,
  'Shipped': 3,
  'Cancelled': 4
} as const;

// Create order response
export interface CreateOrderResponse {
  id: string;
}

