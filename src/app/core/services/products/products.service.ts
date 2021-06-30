import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map, retry } from 'rxjs/operators';

import { Platillo, PlatilloSelected } from '../../models/platillo.model';
import { Categoria } from '../../models/categoria.model';
import { SizeMeal } from '../../models/sizeMeal.model';
import { ExtraMeal } from '../../models/extraMeal.model';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  //private API = environment.url_API


  platillos: Platillo[] =
  [
    { id: 1, idCategoria: 1, platillo: 'Plato de frutas', precio: 75, description: 'Para compartir, variados de temporada', image: '' },
    { id: 2, idCategoria: 1, platillo: 'Huevos a la mexicana', precio: 200, description: 'Huevos revueltos a la mexicana', image: '' },
    { id: 3, idCategoria: 1, platillo: 'Huevos rancheros', precio: 200, description: 'Estrellados servidos sobre tortilla y bañados con salsa ranchera', image: '' },
    { id: 4, idCategoria: 1, platillo: 'Huevos divorciados con chilaquiles', precio: 200, description: 'Dos piezas de huevos estrellados con chilaquiles', image: '' },
    { id: 5, idCategoria: 1, platillo: 'Omelettes', precio: 120, description: 'Omelettes', image: '' },
    { id: 6, idCategoria: 1, platillo: 'Sandwich Vips Club', precio: 200, description: 'Tres rebanadas de pan de trigo y mantequilla. Con jamón, pollo, queso americano, tocino y jitomate. Acompañado de papas a la francesa', image: '' },
    { id: 7, idCategoria: 1, platillo: 'Hot Cakes', precio: 200, description: 'Servidos con mantequilla, mermelada de fresa o miel', image: '' },
    { id: 8, idCategoria: 1, platillo: 'Molletes', precio: 200, description: 'Los tradicionales, gratinados con queso gouda y servidos con salsa mexicana', image: '' },
    { id: 9, idCategoria: 2, platillo: 'Alitas', precio: 150, description: 'Servidas con papas a la francesa, aderezo blue cheese y bastones de apio', image: '' },
    { id: 10, idCategoria: 2, platillo: 'Guacamole', precio: 200, description: 'El tradicional guacamole', image: '' },
    { id: 11, idCategoria: 3, platillo: 'Chilaquiles', precio: 200, description: 'Bañados en salsa verde o roja, con queso gouda gratinado, crema y cebolla', image: '' },
    { id: 12, idCategoria: 3, platillo: 'Enchiladas', precio: 200, description: 'Con nuestra tradicional salsa suiza, rellenas con pollo, gratinadas con queso gouda, cebolla y acompañadas de frijoles refritos.', image: '' },
    { id: 13, idCategoria: 3, platillo: 'Hamburguesa', precio: 180, description: 'Hamburguesa', image: '' },
    { id: 14, idCategoria: 3, platillo: 'Boneless', precio: 200, description: 'Boneless', image: '' },
    { id: 15, idCategoria: 4, platillo: 'Agua fresca del día', precio: 20, description: 'Agua fresca del día ', image: '' },
    { id: 16, idCategoria: 4, platillo: 'Limonada Natural', precio: 20, description: 'Limonada Natural', image: '' },
    { id: 17, idCategoria: 4, platillo: 'Limonada Mineral', precio: 20, description: 'Limonada Mineral', image: '' },
    { id: 18, idCategoria: 4, platillo: 'Refresco Refill', precio: 30, description: 'Refresco Refill', image: '' },
    { id: 19, idCategoria: 4, platillo: 'Tecate', precio: 30, description: 'Cerveza Tecate', image: '' },
    { id: 20, idCategoria: 5, platillo: 'Cheesecake con fresas', precio: 60, description: 'Delicioso cheesecake con fresas, acompáñalo con un café de nuetra barra de cafés', image: '' },
    { id: 20, idCategoria: 5, platillo: 'Pastel de Chocolate', precio: 60, description: 'Pan, crema y cobertura de chocolate semi amargo. Servido con durazno y un toque de salsa de naranja', image: '' },
    { id: 20, idCategoria: 5, platillo: 'Pay helado de limón', precio: 30, description: 'El tradicional pay de limón de vips', image: '' },
  ];

  categories: Categoria[] =  [
    { id: 1, categoria: 'Desayunos' },
    { id: 2, categoria: 'Entradas' },
    { id: 3, categoria: 'Comida' },
    { id: 4, categoria: 'Bebidas' },
    { id: 5, categoria: 'Postres' }
  ];

  sizes: SizeMeal[] = [
    { id: 1, idPlatillo: 1, size: 'Chico', precio: 0 },
    { id: 2, idPlatillo: 1, size: 'Mediano', precio: 10 },
    { id: 3, idPlatillo: 1, size: 'Grande', precio: 20},
    { id: 4, idPlatillo: 15, size: 'Chico', precio: 0 },
    { id: 5, idPlatillo: 15, size: 'Mediano', precio: 10 },
    { id: 6, idPlatillo: 15, size: 'Grande', precio: 20},
    { id: 7, idPlatillo: 16, size: 'Chico', precio: 0 },
    { id: 8, idPlatillo: 16, size: 'Mediano', precio: 10 },
    { id: 9, idPlatillo: 16, size: 'Grande', precio: 20},
    { id: 10, idPlatillo: 17, size: 'Chico', precio: 0 },
    { id: 11, idPlatillo: 17, size: 'Mediano', precio: 10 },
    { id: 12, idPlatillo: 17, size: 'Grande', precio: 20},
    { id: 13, idPlatillo: 18, size: 'Chico', precio: 0 },
    { id: 14, idPlatillo: 18, size: 'Mediano', precio: 20 },
    { id: 15, idPlatillo: 18, size: 'Grande', precio: 30},
  ];

  extras: ExtraMeal[] = [
    { id: 1, idPlatillo: 1, extra: 'Fruta', precio: 10 },
    { id: 2, idPlatillo: 1, extra: 'Granola', precio: 15 },
    { id: 3, idPlatillo: 1, extra: 'Yogurth', precio: 20 },
    { id: 4, idPlatillo: 2, extra: 'Tocino', precio: 10 },
    { id: 5, idPlatillo: 2, extra: 'Jamon', precio: 15 },
    { id: 6, idPlatillo: 2, extra: 'Frijoles', precio: 20 },
    { id: 7, idPlatillo: 3, extra: 'Tocino', precio: 10 },
    { id: 8, idPlatillo: 3, extra: 'Frijoles', precio: 15 },
    { id: 9, idPlatillo: 3, extra: 'Jamon', precio: 20 },
    { id: 10, idPlatillo: 4, extra: 'Frijoles', precio: 10 },
    { id: 11, idPlatillo: 4, extra: 'Tocino', precio: 15 },
    { id: 12, idPlatillo: 4, extra: 'Jamon', precio: 20 },
    { id: 13, idPlatillo: 5, extra: 'Frijoles', precio: 10 },
    { id: 14, idPlatillo: 5, extra: 'Jamon', precio: 15 },
    { id: 15, idPlatillo: 5, extra: 'Tocino', precio: 20 },
    { id: 16, idPlatillo: 14, extra: 'BBQ', precio: 10 },
    { id: 17, idPlatillo: 14, extra: 'Buffalo', precio: 15 },
    { id: 18, idPlatillo: 14, extra: 'Mango Spice', precio: 20 },
  ];


  constructor() { } //private http: HttpClient

  getCategories(): Categoria[] {
    return this.categories;
  }

  getMeals(): Platillo[] {
    return this.platillos;
  }

  getMeal(id: number) : PlatilloSelected {
    let platillo: PlatilloSelected = new PlatilloSelected();
    platillo.platillo =  this.platillos.find(x => x.id == id)

    return platillo;
  }

  getSizesMeal(idPlatillo: number){
    return this.sizes.filter(x => x.idPlatillo == idPlatillo);
  }

  getExtrasMeal(idPlatillo: number){
    return this.extras.filter(x => x.idPlatillo == idPlatillo);
  }
}
