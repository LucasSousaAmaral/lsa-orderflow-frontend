import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <h1 class="logo">LSA OrderFlow</h1>
          <p class="subtitle">Sistema de Gerenciamento de Pedidos</p>
        </div>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      <footer class="app-footer">
        <div class="container">
          <p>&copy; 2026 LSA OrderFlow - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
      padding: 2rem 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .logo {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .subtitle {
      margin: 0.5rem 0 0 0;
      font-size: 1rem;
      opacity: 0.9;
    }

    .app-main {
      flex: 1;
      background: #f5f7fa;
    }

    .app-footer {
      background: #2c3e50;
      color: white;
      padding: 1.5rem 0;
      margin-top: auto;
    }

    .app-footer p {
      margin: 0;
      text-align: center;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .logo {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 0.9rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'LSA OrderFlow';
}

