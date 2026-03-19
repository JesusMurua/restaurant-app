import { Component, Input, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';

import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { Product, ProductExtra, ProductSize, calcUnitPriceCents } from '../../../../core/models';
import { CartService } from '../../../../core/services/cart.service';
import { DatabaseService } from '../../../../core/services/database.service';
import { ProductService } from '../../../../core/services/product.service';

/** Reactive form shape for the product detail page */
interface DetailForm {
  sizeId:   FormControl<number | null>;
  extras:   FormArray<FormControl<boolean>>;
  quantity: FormControl<number>;
  notes:    FormControl<string>;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    RadioButtonModule,
    CheckboxModule,
    InputTextareaModule,
    DividerModule,
    PricePipe,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {

  //#region Inputs
  /** Route param — bound via withComponentInputBinding() in app.config.ts */
  @Input({ required: true }) id!: string;
  //#endregion

  //#region Properties
  readonly product = signal<Product | null>(null);
  form!: FormGroup<DetailForm>;

  /** Live price preview updated as form values change */
  readonly previewPriceCents = signal(0);
  //#endregion

  //#region Constructor
  constructor(
    private readonly fb: FormBuilder,
    private readonly productService: ProductService,
    private readonly db: DatabaseService,
    private readonly cartService: CartService,
    private readonly location: Location,
  ) {}
  //#endregion

  //#region Lifecycle
  async ngOnInit(): Promise<void> {
    const productId = Number(this.id);

    // Check signal cache first (already loaded), fallback to IndexedDB
    let product = this.productService.products().find(p => p.id === productId);
    if (!product) {
      product = await this.db.products.get(productId) ?? undefined;
    }

    if (!product) {
      this.location.back();
      return;
    }

    this.product.set(product);
    this.buildForm(product);
    this.updatePreview();
  }
  //#endregion

  //#region Form Methods

  /**
   * Builds the reactive form based on the product's available sizes and extras.
   * @param product The product being customized
   */
  private buildForm(product: Product): void {
    const extrasControls = product.extras.map(() => new FormControl(false, { nonNullable: true }));

    this.form = this.fb.group<DetailForm>({
      sizeId:   new FormControl<number | null>(product.sizes[0]?.id ?? null),
      extras:   this.fb.array(extrasControls) as FormArray<FormControl<boolean>>,
      quantity: new FormControl(1, { nonNullable: true }),
      notes:    new FormControl('', { nonNullable: true }),
    });

    this.form.valueChanges.subscribe(() => this.updatePreview());
  }

  /** Recalculates the live price preview based on current form values */
  private updatePreview(): void {
    const product = this.product();
    if (!product) return;

    const { sizeId, extras } = this.form.getRawValue();
    const size = product.sizes.find(s => s.id === sizeId);
    const selectedExtras = product.extras.filter((_, i) => extras[i]);

    const unit = calcUnitPriceCents(product, size, selectedExtras);
    this.previewPriceCents.set(unit * (this.form.getRawValue().quantity ?? 1));
  }
  //#endregion

  //#region Accessors

  get extrasArray(): FormArray<FormControl<boolean>> {
    return this.form.controls.extras;
  }
  //#endregion

  //#region Cart Methods

  /** Adds the configured product to the cart and navigates back */
  async onAddToCart(): Promise<void> {
    const product = this.product();
    if (!product || this.form.invalid) return;

    const { sizeId, extras, quantity, notes } = this.form.getRawValue();
    const size: ProductSize | undefined = product.sizes.find(s => s.id === sizeId);
    const selectedExtras: ProductExtra[] = product.extras.filter((_, i) => extras[i]);

    for (let i = 0; i < quantity; i++) {
      await this.cartService.addItem(product, size, selectedExtras, notes || undefined);
    }

    this.location.back();
  }
  //#endregion

}
