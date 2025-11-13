import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
type FooterUrls = {
  icon?: string
  type?: string
  text?: string
  url?: string
}

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  urls: FooterUrls[][] = [
    [
      { type: 'header', text: 'lift media' },
      { text: 'Inicio', url: '/info' },
      { text: 'Quiénes somos', url: '/inquiry' },
      { text: 'Contacto', url: '/contact' },
      { text: 'Política de Privacidad', url: '/policy' },
    ],
    [
      { type: 'header', text: 'legal' },
      { icon: '', text: 'Condiciones generales', url: '/conditions' },
      { icon: '', text: 'Política de Cookies', url: '/cookies' },
      { icon: '', text: 'Prensa', url: '/prensa' },
    ],
    [
      { type: 'header', text: 'contact' },
      { icon: 'bi bi-phone', text: '123 456 789 ', url: 'tel:123456789' },
      { icon: 'bi bi-whatsapp', text: 'WhatsApp' },
      { icon: 'bi bi-envelope', text: 'hola@Liftmedia.com', url: 'mailto:hola@Liftmedia.com' },
      { icon: 'bi bi-clock', text: 'Lunes a Viernes\n09:00 a 20:00 horas' },
    ],
  ]

}
