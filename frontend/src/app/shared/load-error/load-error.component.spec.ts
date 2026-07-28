import { TestBed } from '@angular/core/testing';
import { LoadErrorComponent } from './load-error.component';

describe('LoadErrorComponent', () => {
  it('uses the default Macedonian message when none is provided', () => {
    const fixture = TestBed.createComponent(LoadErrorComponent);
    expect(fixture.componentInstance.message).toContain('обидете се повторно');
  });

  it('uses a custom message when provided via the input', () => {
    const fixture = TestBed.createComponent(LoadErrorComponent);
    fixture.componentInstance.message = 'Custom failure message';
    expect(fixture.componentInstance.message).toBe('Custom failure message');
  });

  it('emits retry when the button is clicked', () => {
    const fixture = TestBed.createComponent(LoadErrorComponent);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.retry.subscribe(() => (emitted = true));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emitted).toBeTrue();
  });
});
