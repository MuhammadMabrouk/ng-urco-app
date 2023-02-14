import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from './home/pages/not-found/not-found.component';


const routes: Routes = [
  // home pages routes
  {path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule)},

  // admin dashboard routes
  {path: 'admin-dashboard', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)},

  // user dashboard routes
  {path: 'user-dashboard', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},

  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
