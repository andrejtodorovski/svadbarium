import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SiteNavComponent } from './site-nav.component';

describe('SiteNavComponent', () => {
  let component: SiteNavComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiteNavComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    component = TestBed.createComponent(SiteNavComponent).componentInstance;
  });

  it('starts with the mobile menu closed', () => {
    expect(component.mobileMenuOpen()).toBeFalse();
  });

  it('toggleMobileMenu flips the open state each call', () => {
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeTrue();

    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeFalse();
  });

  it('closeMobileMenu always sets it closed, even if already closed', () => {
    component.closeMobileMenu();
    expect(component.mobileMenuOpen()).toBeFalse();

    component.toggleMobileMenu();
    component.closeMobileMenu();
    expect(component.mobileMenuOpen()).toBeFalse();
  });

  it('resizing back to a desktop width auto-closes a menu left open on mobile', () => {
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeTrue();

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    component.onResize();

    expect(component.mobileMenuOpen()).toBeFalse();
  });

  it('resizing while still narrow leaves an open menu open', () => {
    component.toggleMobileMenu();

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 400 });
    component.onResize();

    expect(component.mobileMenuOpen()).toBeTrue();
  });
});
