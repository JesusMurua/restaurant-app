import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Categoria } from './../../../../core/models/categoria.model'
import { Observable } from 'rxjs';

import { ProductsService } from 'src/app/core/services/products/products.service';
import { CartService } from 'src/app/core/services/cart/cart.service';

import { PlatilloSelected } from 'src/app/core/models/platillo.model';
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.component.html',
  styleUrls: ['./punto-venta.component.scss']
})
export class PuntoVentaComponent implements OnInit {

  //@Output() categoriaClicked: EventEmitter<any> = new EventEmitter();

  categorias: Categoria[] = [];
  platillosSelected = [];
  categoriaSeleccionada: Categoria;
  //idcategoriaSeleccionada = 0;

  meals$!: Observable<PlatilloSelected[]>;
  mealsSelected$!: Observable<PlatilloSelected[]>;

  constructor(
    private cartService: CartService,
    private productsService: ProductsService
  )
  {
    this.meals$ = this.cartService.cart$

    this.mealsSelected$ = this.cartService.cart$
    .pipe(
      map(products => products)
    );
  }

  ngOnInit(): void {
    this.fetchCategories();

    this.mealsSelected$.subscribe(
      data => {
        const lastMeal = data[data.length - 1]
        const cat = this.categorias.filter(x => x.id == lastMeal?.platillo?.idCategoria)[0]

        this.selectCategoria(cat);
      }
    )
    //lastMeal = this.mealsSelected$[colors.length - 1]
    //this.selectCategoria(this.categoriaSeleccionada);
  }

  fetchCategories(){
    this.categorias = this.productsService.getCategories();
  }

  selectCategoria(categoria: Categoria){
    this.categoriaSeleccionada = categoria;
    //this.idcategoriaSeleccionada = categoria.id;
    //this.categoriaClicked.emit(this.idcategoriaSeleccionada);
  }

  handleMinus(item: PlatilloSelected, ) {
    let descuento = 0

    if(item.Cantidad > 1) {
      descuento = (item.Total / item.Cantidad)
    }
    else{
      descuento = 0
    }

    item.Cantidad--;

    if(item.Cantidad <= 0){
      item.Cantidad = 1;
      descuento += descuento
    }

    item.Total = item.Total - Math.abs(descuento)
    console.log(item)
    //this.value--;
  }
  handlePlus(item: PlatilloSelected) {
    const extra = (item.Total / item.Cantidad)

    item.Cantidad++;
    item.Total = item.Total + extra;
    console.log(item)
  }


}
