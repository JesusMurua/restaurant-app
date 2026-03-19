import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminAuthService } from '../../core/services/admin-auth.service';

/** Keys available on the PIN numpad */
type NumpadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'del';

@Component({
  selector: 'app-pin',
  standalone: true,
  imports: [],
  templateUrl: './pin.component.html',
  styleUrl: './pin.component.scss',
})
export class PinComponent {

  //#region Properties

  /** Current digits entered (max 4) */
  readonly digits = signal<string[]>([]);

  /** True while showing the shake + error state */
  readonly hasError = signal(false);

  /** Flat key list for the 3×4 grid (last row: empty slot, 0, del) */
  readonly keys: (NumpadKey | null)[] = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    null, '0', 'del',
  ];

  //#endregion

  //#region Constructor
  constructor(
    private readonly authService: AdminAuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}
  //#endregion

  //#region Numpad Actions

  /** Adds a digit if fewer than 4 have been entered, then auto-submits at 4 */
  addDigit(digit: string): void {
    if (this.digits().length >= 4) return;
    this.digits.update(d => [...d, digit]);

    if (this.digits().length === 4) {
      this.submit();
    }
  }

  /** Removes the last entered digit */
  removeDigit(): void {
    this.digits.update(d => d.slice(0, -1));
    this.hasError.set(false);
  }

  /** Handles a numpad key press */
  onKey(key: NumpadKey | null): void {
    if (!key) return;
    if (key === 'del') {
      this.removeDigit();
    } else {
      this.addDigit(key);
    }
  }

  //#endregion

  //#region Auth

  /** Verifies the entered PIN and navigates to returnTo or /admin */
  async submit(): Promise<void> {
    const pin = this.digits().join('');
    const success = await this.authService.login(pin);

    if (success) {
      const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
      this.router.navigateByUrl(returnTo ?? '/admin');
    } else {
      this.hasError.set(true);
      setTimeout(() => {
        this.digits.set([]);
        this.hasError.set(false);
      }, 600);
    }
  }

  /** Returns to the POS without logging in */
  goToPOS(): void {
    this.router.navigate(['/pos']);
  }

  //#endregion

}
