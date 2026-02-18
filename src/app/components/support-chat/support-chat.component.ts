import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
type Msg = { from: 'bot' | 'user', text: string };

@Component({
  selector: 'app-support-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.css'],
})
export class SupportChatComponent {
  open = false;

  adminWhatsApp = '5493510000000'; // <-- poné el número real (sin +)
  adminEmail = 'allyespacio20@ally.com'; // <-- poné el real

  messages: Msg[] = [
    { from: 'bot', text: 'Hola 👋 Soy AllyBot. ¿En qué te puedo ayudar?' },
    { from: 'bot', text: 'Elegí una opción:' },
  ];

  quickActions = [
    { id: 'forgot', label: 'Olvidé mi contraseña' },
    { id: 'data', label: 'Cambiar datos personales' },
    { id: 'admin', label: 'Hablar con un administrador' },
  ];

  toggle() { this.open = !this.open; }

  pick(actionId: string) {
    const label = this.quickActions.find(a => a.id === actionId)?.label ?? actionId;
    this.messages.push({ from: 'user', text: label });

    if (actionId === 'forgot') {
      this.messages.push({
        from: 'bot',
        text: 'Para recuperar tu contraseña: tocá "Olvidé mi contraseña" en el login, ingresá tu email y seguí el enlace que te llega por correo.',
      });
      this.messages.push({
        from: 'bot',
        text: 'Si no recibís el correo en 2 minutos, revisá spam o contactá a un administrador.',
      });
      this.offerAdminContact();
      return;
    }

    if (actionId === 'data') {
      this.messages.push({
        from: 'bot',
        text: 'Por seguridad, los cambios de datos personales (email, documento, etc.) los gestiona un administrador.',
      });
      this.offerAdminContact();
      return;
    }

    if (actionId === 'admin') {
      this.offerAdminContact();
      return;
    }

    this.messages.push({ from: 'bot', text: 'No entendí esa opción. Probá con los botones 🙂' });
  }

  private offerAdminContact() {
    this.messages.push({
      from: 'bot',
      text: `📩 Email: ${this.adminEmail}`,
    });
    this.messages.push({
      from: 'bot',
      text: `💬 WhatsApp: https://wa.me/${this.adminWhatsApp}`,
    });
  }
}