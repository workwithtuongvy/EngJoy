import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

@Directive({
  selector: '[appAutoFont]'
})
export class AutoFontDirective implements AfterViewInit {
  @Input() minFontSize: number = 10;
  @Input() maxFontSize: number = 32;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const text = this.el.nativeElement.textContent?.trim() || '';
    const len = text.length;

    // Tính size theo độ dài text (đơn giản hóa)
    let fontSize: number;

    if (len < 8) fontSize = this.maxFontSize;
    else if (len < 18) fontSize = this.maxFontSize - 3;
    else if (len < 30) fontSize = this.maxFontSize - 6;
    else fontSize = this.minFontSize;

    fontSize = Math.max(fontSize, this.minFontSize); // Giới hạn tối thiểu

    this.el.nativeElement.style.fontSize = `${fontSize}px`;
    this.el.nativeElement.style.lineHeight = '1.3';
  }
}
