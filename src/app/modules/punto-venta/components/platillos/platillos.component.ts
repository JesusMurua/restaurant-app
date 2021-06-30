import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Platillo } from './../../../../core/models/Platillo.model'
import { Categoria } from './../../../../core/models/categoria.model'
import { ProductsService } from 'src/app/core/services/products/products.service';

@Component({
  selector: 'app-platillos',
  templateUrl: './platillos.component.html',
  styleUrls: ['./platillos.component.scss']
})
export class PlatillosComponent implements OnInit {

  @Input() Categoria: Categoria;
  //@Output() categoriaClicked: EventEmitter<any> = new EventEmitter();


  platillos: Platillo[] = [];



  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.fetchPlatillos();
  }

  ngOnChanges() {
    //console.log(this.IdCategoria);
    this.fetchPlatillos();
  }

  fetchPlatillos(){
    this.platillos = this.productsService.getMeals().filter(x => x.idCategoria == this.Categoria.id);
  }

}
