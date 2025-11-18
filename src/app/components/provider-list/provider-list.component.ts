import { Component, OnInit } from '@angular/core';
import { ProviderService } from '../../services/provider.service';
import { Provider } from '../../models/provider.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './provider-list.component.html',
  styleUrls: ['./provider-list.component.scss']
})
export class ProviderListComponent implements OnInit {
  providers: Provider[] = [];

  constructor(private providerService: ProviderService, private router: Router) {}

  ngOnInit(): void {
    this.providerService.getAll().subscribe(data => this.providers = data);
  }

  verDetalle(id: number) {
    this.router.navigate(['/prestadores', id]);
  }
}
