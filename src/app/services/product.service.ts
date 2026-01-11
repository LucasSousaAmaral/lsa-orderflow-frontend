import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Produtos fixos do sistema
  private readonly products: Product[] = [
    {
      id: '22222222-2222-2222-2222-222222222221',
      name: 'Keyboard',
      price: 199.90,
      currency: 'BRL'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Mouse',
      price: 79.90,
      currency: 'BRL'
    },
    {
      id: '22222222-2222-2222-2222-222222222223',
      name: 'Headset',
      price: 249.90,
      currency: 'BRL'
    }
  ];

  constructor() {}

  /**
   * Retorna todos os produtos disponíveis (fixos)
   */
  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  /**
   * Busca um produto específico por ID
   */
  getProductById(id: string): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product);
  }
}

