import { Component, OnInit, computed, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { countries as optionCountries, fruits } from './options';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="container">
      <h2>Country Selection</h2>
      <p>Choose a country from different sources.</p>
      
      <div class="input-group">
        <label for="apiCountries">API:</label>
        <p>Select a country from the fetched API list. As you type at least 3 characters, the list dynamically filters to match your input.</p>
        <p>This helps in narrowing down the selection, ensuring relevant results appear quickly. Germany is always included in the list, regardless of the input.</p>
        <input 
          list="api-countries-list" 
          id="apiCountries" 
          name="apiCountries"
          [ngModel]="apiCountryInput()"
          (ngModelChange)="apiCountryInput.set($event)"
          placeholder="Type 3+ characters..."
        />
        <datalist id="api-countries-list">
          <option *ngFor="let country of filteredApiCountries()" [value]="country"></option>
        </datalist>
      </div>

      <div class="input-group">
        <label for="optionsCountries">Options:</label>
        <p>Select a country from the predefined list. Once you type at least 3 characters, the list updates to show only matching options.</p>
        <p>This makes it easier to find the correct country without having to scroll through a long list. Germany is always included in the results, even if it does not match the input.</p>
        <input 
          list="options-countries-list" 
          id="optionsCountries" 
          name="optionsCountries"
          [ngModel]="optionsCountryInput()"
          (ngModelChange)="optionsCountryInput.set($event)"
          placeholder="Type 3+ characters..."
        />
        <datalist id="options-countries-list">
          <option *ngFor="let country of filteredOptionCountries()" [value]="country"></option>
        </datalist>
      </div>

      <div class="input-group">
        <label for="allCountries">All:</label>
        <p>Select any country from the full list without filtering. Unlike other inputs, this one does not require typing characters to filter the results.</p>
        <p>Instead, it provides the entire list of countries, allowing direct selection from the dropdown.</p>
        <input 
          list="all-countries-list" 
          id="allCountries" 
          name="allCountries"
          placeholder="Select from all countries..."
        />
        <datalist id="all-countries-list">
          <option *ngFor="let country of countries()" [value]="country"></option>
        </datalist>
      </div>

      <h2>Fruit Selection</h2>
      <p>Choose your favorite fruit from the predefined list. As you begin typing, the input suggests matching fruits dynamically.</p>
        <p>This feature helps you quickly find and select your desired fruit from the list.</p>
      <div class="input-group">
        <label for="fruits">Fruit:</label>
        <input 
          list="fruits-list" 
          id="fruits" 
          name="fruits" 
          placeholder="Type fruit..."
        />
        <datalist id="fruits-list">
          <option *ngFor="let fruit of fruits" [value]="fruit"></option>
        </datalist>
      </div>
    </div>
  `,
  styles: [
    `
    .container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 1rem;
      font-family: Arial, sans-serif;
    }
    .input-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #333;
    }
    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    h2 {
      margin-top: 1.5rem;
    }
  `,
  ],
})
export class App implements OnInit {
  // Signals for API-fetched countries and input models.
  countries = signal<string[]>([]);
  apiCountryInput = signal('');
  optionsCountryInput = signal('');

  // Static arrays for fruits and option countries (imported)
  fruits = fruits;
  optionCountries = optionCountries;

  // Computed signal to filter API countries based on the input.
  filteredApiCountries = computed(() => {
    let filtered: string[] = [];
    const input = this.apiCountryInput();
    if (input.length >= 3) {
      const lowerInput = input.toLowerCase();
      filtered = this.countries().filter((country) =>
        country.toLowerCase().includes(lowerInput)
      );
    }
    if (!filtered.some((country) => country.toLowerCase() === 'germany')) {
      filtered = [...filtered, 'Germany'];
    }
    return filtered;
  });

  // Computed signal to filter option countries based on the input.
  filteredOptionCountries = computed(() => {
    let filtered: string[] = [];
    const input = this.optionsCountryInput();
    if (input.length >= 3) {
      const lowerInput = input.toLowerCase();
      filtered = this.optionCountries.filter((country) =>
        country.toLowerCase().includes(lowerInput)
      );
    }
    if (!filtered.some((country) => country.toLowerCase() === 'germany')) {
      filtered = [...filtered, 'Germany'];
    }
    return filtered;
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  private loadCountries(): void {
    this.getCountriesFromApi().subscribe({
      next: (data: string[]) => {
        this.countries.set(data);
      },
      error: (error) => {
        console.error('Error fetching countries:', error);
      },
    });
  }

  private getCountriesFromApi() {
    return this.http.get<any[]>('https://restcountries.com/v3.1/all').pipe(
      map((data) =>
        data
          .map((country) => country.name?.common)
          .filter((name) => !!name)
          .sort()
      )
    );
  }
}

bootstrapApplication(App);
