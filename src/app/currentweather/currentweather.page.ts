import { ChangeDetectorRef, Component } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { PreferenceService } from 'src/app/services/preference.service';

import { InitializationService } from 'src/app/services/initialization.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { ThemeService } from '../services/theme.service';
import { Network } from '@capacitor/network';
import { DeepseekApiService } from '../services/deepseek-api.service';

@Component({
  selector: 'app-currentweather',
  templateUrl: './currentweather.page.html',
  styleUrls: ['./currentweather.page.scss'],
  standalone: false
})
export class CurrentweatherPage {
  private initStatusSubscription: Subscription | undefined;
  isConnected: boolean = false;
  userSettings: any;
  location: { lat: number, lon: number } | null = null;
  weatherData: {
    tempFormat: string | null;
    currentWeather: {
      tempFormat: any,
      weather: any,
      wind: any,
      main: any,
      icon: string
    } | null;
    hourlyWeather: {
      tempFormat: any,
      list: {
        dt: string,
        weather: any,
        wind: any,
        main: any,
        icon: string
      }[];
      
    } | null;
    dailyWeather: {
      tempFormat: any,
      list: {
        dt: string;
        temp: any;
        weather: any;
        main?: any;
        icon?: string;
      }[];
    } | null;
  } = {
    tempFormat: null,
    currentWeather: null,
    hourlyWeather: null,
    dailyWeather: null,
  };
  
  currentWeatherParams: any = null;
  hourlyWeatherParams: any = null;
  dailyWeatherParams: any = null;
  search: string = '';
  searched: string = '';
  advice: string = "";

  loading: boolean = true;

  constructor(
    private weatherService: WeatherService,
    private preferenceService: PreferenceService,
    private initService: InitializationService,
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef,
    private themeService: ThemeService,
    private deepseekApiService: DeepseekApiService
  ) {
  }

  async ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.initStatusSubscription = this.initService.getInitStatus().subscribe(isInitialized => {
      if(isInitialized) {
        this.search = '';
        this.searched = '';
        this.loadData()
      }
    });
  }

  private async loadData() {
    this.userSettings = await this.preferenceService.getPreference('settings');

    this.themeService.toggleChange(this.userSettings.darkMode);

    this.sharedService.connectionStatus$.subscribe(data => {
      if(this.isConnected != data) {
        this.isConnected = data;
      }
      
    })

    

    this.sharedService.weatherData$.subscribe(data => {
      this.weatherData = data;
      this.assignCurrentWeatherParams();
      this.assignHourlyWeatherParams();
      this.assignDailyWeatherParams();
    })
    console.log('Weather Data: ', this.weatherData);
    this.loading = false;
    console.log('Done loading weather data!');

    if(this.advice === "") {
      await this.fetchAdvice();
      console.log('Done loading advice!');
    }
  }

  async fetchAdvice() {
    try {
      const res: any = await firstValueFrom(
        this.deepseekApiService.sendToDeepSeek(
          'You are a weather reporter', `${this.weatherData.currentWeather?.main.temp} degrees ${this.weatherData.currentWeather?.tempFormat}, what advice can you give? limit it to a sentence`
        )
      );

      this.advice = res.choices[0].message.content;
      console.log('Advice fetched');
    } catch(error) {
      this.advice = "No available advices right now :(";
    }
  }

  assignCurrentWeatherParams() {
    this.currentWeatherParams = {
      tempFormat: this.weatherData.tempFormat,
      weather: this.weatherData.currentWeather?.weather[0],
      wind: this.weatherData.currentWeather?.wind,
      main: this.weatherData.currentWeather?.main,
      icon: 'assets/icon/weather-icons/' + this.weatherData.currentWeather?.weather[0].icon + '.png',
    };
  }

  assignHourlyWeatherParams() {
    if (!this.weatherData.hourlyWeather?.list) return;
  
    this.hourlyWeatherParams = [];
  
    for (let counter = 0; counter < 5; counter++) {
      const hour = this.weatherData.hourlyWeather.list[counter];
  
      if (!hour || typeof hour.dt !== 'number') continue;
  
      this.hourlyWeatherParams[counter] = {
        tempFormat: this.weatherData.tempFormat,
        dt: this.formatTimestampToTime(hour.dt * 1000),
        weather: hour.weather?.[0],
        wind: hour.wind,
        main: hour.main,
        icon: 'assets/icon/weather-icons/' + (hour.weather?.[0]?.icon ?? '01d') + '.png',
      };
    }
  }

  assignDailyWeatherParams() {
    if (!this.weatherData.dailyWeather?.list) return;
  
    this.dailyWeatherParams = [];
  
    for (let counter = 0; counter < 5; counter++) {
      const day = this.weatherData.dailyWeather.list[counter];
  
      if (!day || typeof day.dt !== 'number') continue;
  
      this.dailyWeatherParams[counter] = {
        tempFormat: this.weatherData.tempFormat,
        dt: this.formatTimestampToString(day.dt * 1000),
        weather: day.weather?.[0],
        temp: day.temp,
        main: day.main,
        icon: 'assets/icon/weather-icons/' + (day.weather?.[0]?.icon ?? '01d') + '.png',
      };
    }
  }

  formatTimestampToTime(timestamp: number) {
    return new Date(timestamp).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatTimestampToString(timestamp: number): string {
    const date = new Date(timestamp);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[date.getDay()];
    return `${dayName}, ${formattedDate}`;
  }

  async searchWeather() {
    this.searched = this.search;
    this.advice = "";
    if(this.search === '') {
      this.loading = true;
      this.weatherData = await this.preferenceService.getPreference('weatherData');
      this.sharedService.setWeatherData(this.weatherData);
      this.loading= false;
      this.cdRef.detectChanges();
      console.log(this.weatherData);
    } else {
      
      this.loading = true;
      this.weatherData.tempFormat = this.userSettings.tempFormat;
      await this.getWeatherDataByCityName(this.search);
      this.sharedService.setWeatherData(this.weatherData);
      this.loading= false;
      this.cdRef.detectChanges();
      console.log(this.weatherData);
    }

    await this.fetchAdvice();
  }

  async getWeatherDataByCityName(city: string) {
    try{
      const [current, hourly, daily] = await Promise.all([
        firstValueFrom(this.weatherService.getCurrentWeatherByCityName(city, this.userSettings.tempFormat)),
        firstValueFrom(this.weatherService.getHourlyWeatherByCityName(city, 5, this.userSettings.tempFormat)),
        firstValueFrom(this.weatherService.getDailyWeatherByCityName(city, 5, this.userSettings.tempFormat))
      ]);

      this.weatherData = {
        tempFormat: this.userSettings.tempFormat,
        currentWeather: current,
        hourlyWeather: hourly,
        dailyWeather: daily
      }
    } catch(error) {
      console.error('Error fetching weather data by city name as of the moment: ', error);
    }
  }

  async getWeatherData() {
    if(!this.location) {
      alert('Cannot get weather data as of this moment!');
      return;
    }

    try {
      const [current, hourly, daily] = await Promise.all([
        firstValueFrom(this.weatherService.getCurrentWeather(this.location, this.userSettings.tempFormat)),
        firstValueFrom(this.weatherService.getHourlyWeather(this.location, 5, this.userSettings.tempFormat)),
        firstValueFrom(this.weatherService.getDailyWeather(this.location, 5, this.userSettings.tempFormat))
      ]);

      this.weatherData = {
        tempFormat: this.userSettings.tempFormat,
        currentWeather: current,
        hourlyWeather: hourly,
        dailyWeather: daily
      }
    } catch(error) {
      console.error('Error fetching weather data as of this moment: ', error);
    }
  }

  async onSearch() {
    await this.searchWeather();
  }
}
