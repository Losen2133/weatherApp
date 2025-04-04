import { ChangeDetectorRef, Component } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { LocationService } from 'src/app/services/location.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { NavigationStart, Router } from '@angular/router';
import { InitializationService } from 'src/app/services/initialization.service';
import { first, firstValueFrom, Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-currentweather',
  templateUrl: './currentweather.page.html',
  styleUrls: ['./currentweather.page.scss'],
  standalone: false
})
export class CurrentweatherPage {
  private initStatusSubscription: Subscription | undefined;
  userSettings: any;
  location: { lat: number; lon: number } | null = null;
  
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
  search: string = 'mandaue';

  loading: boolean = true;

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService,
    private preferenceService: PreferenceService,
    private initService: InitializationService,
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef
  ) {
  }

  async ngOnInit() {
    this.initStatusSubscription = this.initService.getInitStatus().subscribe(isInitialized => {
      if(isInitialized) {
        this.loadData()
      }
    });
  }

  private async loadData() {
    this.userSettings = await this.preferenceService.getPreference('settings');

    this.locationService.startWatchingPosition();
    this.locationService.location$.subscribe(coords => {
      if(coords) {
        this.location = coords;
      }
    });
    this.location = await this.locationService.getCurrentPosition();

    this.sharedService.weatherData$.subscribe(data => {
      this.weatherData = data;
    })
    this.assignCurrentWeatherParams();
    this.assignHourlyWeatherParams();
    this.assignDailyWeatherParams();


    this.loading = false;
    console.log('Done loading!');

    // await this.searchWeather();
    // console.log('Done Search');
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
    if(this.search === '') {
      this.weatherData = await this.preferenceService.getPreference('weatherData');
    } else {
      
      this.loading = true;
      this.weatherData.tempFormat = this.userSettings.tempFormat;
      await this.getWeatherDataByCityName(this.search);
      this.sharedService.setWeatherData(this.weatherData);
      this.assignCurrentWeatherParams();
      this.assignHourlyWeatherParams();
      this.assignDailyWeatherParams();
      this.loading= false;
      this.cdRef.detectChanges();
      console.log(this.weatherData);
    }
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
}
