import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, of } from 'rxjs';
import { catchError, retry, retryWhen, mergeMap, finalize, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
  PagedResponse,
  OrderQueryParams,
  CreateOrderResponse,
  ApiError
} from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Busca pedidos com paginação e busca
   */
  getOrders(params?: OrderQueryParams): Observable<PagedResponse<Order>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PagedResponse<Order>>(this.apiUrl, { params: httpParams }).pipe(
      tap(response => {
        // Calcular totalPages se não vier da API
        if (!response.totalPages) {
          response.totalPages = Math.ceil(response.totalCount / response.pageSize);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Busca um pedido específico por ID
   * Inclui retry com backoff para lidar com eventual consistência do read model
   */
  getOrderById(id: string, maxRetries: number = 10): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            // Retry apenas em caso de 404 (read model ainda não atualizado)
            if (index < maxRetries && error.status === 404) {
              const delayMs = Math.min(500 * Math.pow(1.5, index), 3000);
              console.log(`Aguardando sincronização do read model... Tentativa ${index + 1}/${maxRetries} em ${delayMs}ms`);
              return timer(delayMs);
            }
            return throwError(() => error);
          })
        )
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Cria um novo pedido
   * Retorna o ID do pedido criado
   */
  createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.apiUrl, request, {
      observe: 'response'
    }).pipe(
      switchMap(response => {
        // Extrai o ID do corpo da resposta ou do header Location
        const id = response.body?.id;
        if (!id) {
          return throwError(() => new Error('ID do pedido não retornado'));
        }
        return of({ id });
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Atualiza um pedido completo
   */
  updateOrder(id: string, request: UpdateOrderRequest): Observable<void> {
    // Garantir que orderId está definido
    request.orderId = id;
    return this.http.put<void>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Atualiza apenas o status do pedido
   * Usa PUT /api/orders/{id} com UpdateOrderCommand (sem replaceItems)
   */
  updateOrderStatus(id: string, statusEnum: number): Observable<void> {
    const request: UpdateOrderRequest = {
      orderId: id,
      newStatus: statusEnum,
      replaceItems: null
    };
    return this.http.put<void>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deleta um pedido
   */
  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Helper para criar um pedido e buscar seus detalhes
   * Lida com eventual consistência do read model (MongoDB)
   */
  createOrderAndFetch(request: CreateOrderRequest): Observable<Order> {
    return this.createOrder(request).pipe(
      tap(response => {
        console.log(`Pedido criado com sucesso. ID: ${response.id}`);
        console.log('Aguardando sincronização com MongoDB...');
      }),
      switchMap(response => {
        // Aguarda 1 segundo antes da primeira tentativa para dar tempo do MongoDB sincronizar
        return timer(1000).pipe(
          switchMap(() => {
            console.log('Iniciando busca do pedido no read model...');
            return this.getOrderById(response.id, 10);
          })
        );
      })
    );
  }

  /**
   * Tratamento centralizado de erros
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro inesperado';
    let errors: string[] = [];

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
      errors = [errorMessage];
    } else {
      // Erro do lado do servidor
      if (error.status === 400 && error.error?.errors) {
        // Erro de validação estruturado
        const apiError = error.error as ApiError;
        errors = apiError.errors;
        errorMessage = errors.join('; ');
      } else if (error.status === 404) {
        errorMessage = 'Pedido não encontrado';
        errors = [errorMessage];
      } else if (error.status >= 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        errors = [errorMessage];
      } else if (error.error?.errors) {
        errors = error.error.errors;
        errorMessage = errors.join('; ');
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
        errors = [errorMessage];
      }
    }

    console.error('Erro na API:', errorMessage, error);
    
    return throwError(() => ({
      message: errorMessage,
      errors: errors,
      status: error.status
    }));
  }
}

