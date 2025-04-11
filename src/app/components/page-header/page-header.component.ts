import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  standalone: true,
  imports: [IonicModule],
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent  implements OnInit {
  constructor(private router: Router) { }

  ngOnInit() {}

  goToSettings() {
    this.router.navigate(['/settings'])
  }

}
