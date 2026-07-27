import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
  host: { class: 'scroll-reveal' },
})
export class ScrollRevealDirective implements AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    const element = this.elementRef.nativeElement;

    if (!('IntersectionObserver' in window)) {
      element.classList.add('scroll-reveal--visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('scroll-reveal--visible');
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
  }
}
