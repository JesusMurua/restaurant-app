import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { CartService } from '../../../../core/services/cart/cart.service'
import { SizeMeal } from '../../../../core/models/sizeMeal.model'
import { ExtraMeal } from '../../../../core/models/extraMeal.model'
import { PlatilloSelected, Platillo } from '../../../../core/models/platillo.model'
import { ProductsService } from 'src/app/core/services/products/products.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-platillo-detail',
  templateUrl: './platillo-detail.component.html',
  styleUrls: ['./platillo-detail.component.scss']
})
export class PlatilloDetailComponent implements OnInit {

  @Output() categoriaSelected: EventEmitter<any> = new EventEmitter();

  sizeSelected: SizeMeal;
  extraSelected: ExtraMeal[] = [];
  platillo: PlatilloSelected = new PlatilloSelected();
  //platillo$!: Observable<PlatilloSelected>;

  sizes: SizeMeal[] = []
  extras: ExtraMeal[] = []
  myForm: FormGroup;

  //Platillo: Platillo = { id: 1, idCategoria: 1, platillo: 'huevos', precio: 200, description: 'dfg', image: '' }

  // sizeCheck: 'chico' | 'after' = 'after';

  //@Output() productAdd: EventEmitter<any> = new EventEmitter();


  constructor(
    private router:Router,
    private cartService: CartService,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  )
  { }

  ngOnInit(): void {


    this.route.params.subscribe((params: Params) => {
      //const id = params.id
      this.platillo = this.productsService?.getMeal(params.id)
      this.getDataMeal(params.id)
      this.initForm();
    });

    // evita un subscribe dentro de otro  con switch map y product$ -> observable para no subscribir
    // this.platillo$ = this.route.params
    //   .pipe(
    //     switchMap((params: Params) => this.productsService?.getMeal(params.id))
    //   )
  }

  initForm(){
    this.myForm = this.fb.group({
      addons: this.fb.array([])
    });
  }

  getDataMeal(idPlatillo: number){
    this.sizes = this.productsService.getSizesMeal(idPlatillo)
    this.extras = this.productsService.getExtrasMeal(idPlatillo)
  }

  // clickItem(size: SizeMeal, sizeSelected: SizeMeal){
  //   //size.checked = !size.checked
  //   console.log('size:', size)
  //   console.log('sizeSelected:', sizeSelected)
  //   this.platilloSelected.size = sizeSelected
  // }

  updateTotal(parameter){
    console.log(parameter)

    const precioCantidad = (this.platillo.platillo.precio * parameter.value)
    let precioTotal = 0

    if(this.sizeSelected || this.extraSelected.length > 0) {
      precioTotal = this.platillo.Total * parameter.value
    }else{
      precioTotal = precioCantidad
    }

    this.platillo.Total = precioTotal
  }

  onChangeSize(event: MatRadioChange){
    debugger;
    if(event.value) {
      const sizeAnt = this.sizeSelected
      this.updateSizeTotal(-(sizeAnt ? sizeAnt.precio : 0))
      this.updateSizeTotal(event.value.precio)
    }
  }

  onChangeAddon(extra :ExtraMeal, event: MatCheckboxChange){
    //const addonsFormArray = <FormArray>this.myForm.controls.addons;
    const addonsFormArray = this.extraSelected

    if(event.checked) {
      //addonsFormArray.push(new FormControl(extra));
      addonsFormArray.push(extra);
      this.updateAddonsTotal(extra.precio)

    } else {
      let index = addonsFormArray.findIndex(x => x == extra)
      //addonsFormArray.removeAt(index);
      addonsFormArray.splice(index, 1);
      this.updateAddonsTotal(-extra.precio)
    }

  }

  updateAddonsTotal(price: number){
    this.platillo.Total = this.platillo.Total + (price)
  }

  updateSizeTotal(price: number){
    this.platillo.Total = this.platillo.Total + (price)
  }

  checkExtraSelected(extra :ExtraMeal){
    return this.extraSelected.some(x => x.id == extra.id)
  }

  addCart(){
    console.log('añadir')
    //this.productAdd.emit(this.product.id)
    debugger;
    this.platillo.size = this.sizeSelected
    this.platillo.extras = this.extraSelected

    this.cartService.addCart(this.platillo)
    this.router.navigate(['punto-venta'])
  }

  cancelar(){
    this.router.navigate(['punto-venta'])
  }

}


