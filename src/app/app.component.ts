import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'; // for translation
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // add this class based on the selected language
  host: {
    '[class.ltr]': '(appDir === \'ltr\')',
    '[class.rtl]': '(appDir === \'rtl\')'
  },
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  // for translation
  savedLang: string;
  appLang: string = 'en';
  appDir: string = 'ltr';
  enFont: string = 'https://fonts.googleapis.com/css?family=Poppins:600|Roboto:400,500&display=swap';
  arFont: string = 'https://www.fontstatic.com/f=flat-jooza';
  appFont: string = this.enFont;
  htmlElement = document.getElementsByTagName('html')[0];
  linkElement = document.getElementById('app-font');

  // for scroll to top when component has changed
  componentBeforeNavigation = null;
  routerObservable: Subscription;

  // for scroll to top button
  topPosToStartShowing: number = 600;
  showScrollTop: boolean;

  // for window scroll events
  @HostListener('window:scroll', ['$event']) onScroll(event: Event) {

    /* Both 'window.pageYOffset' and 'document.documentElement.scrollTop' returns the same result in all the cases.
    window.pageYOffset is not supported below IE 9. */
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (scrollPosition >= this.topPosToStartShowing) {
      this.showScrollTop = true;
    } else {
      this.showScrollTop = false;
    }
  }

  constructor(
    public translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    /***************/
    /* translation */
    /***************/

    // add english and arabic languages
    translate.addLangs(['en', 'ar']);
    // set english as default language
    translate.setDefaultLang('en');

    // get browser language
    const browserLang = translate.getBrowserLang();
    // get the saved language from localStorage if set
    const savedLang: string = localStorage.getItem('savedLang');

    // check if a language is saved
    if (savedLang) {
      this.savedLang = savedLang;
    } else if (browserLang.match(/en|ar/)) {
      this.savedLang = browserLang;
    } else {
      this.savedLang = this.appLang;
    }

    // use this language
    translate.use(this.savedLang);

    // adjust language settings based on the selected language
    this.onLangChange(this.savedLang);
  }

  ngOnInit() {
    // scroll to top when component changed
    this.scrollTopWhenComponentChanged();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.routerObservable.unsubscribe();
  }

  // adjust language settings based on the selected language
  onLangChange(lang: string) {
    if (lang === 'en') {
      [this.appLang, this.appDir, this.appFont, this.savedLang] = ['en', 'ltr', this.enFont, 'en'];
    } else if (lang === 'ar') {
      [this.appLang, this.appDir, this.appFont, this.savedLang] = ['ar', 'rtl', this.arFont, 'ar'];
    }

    localStorage.setItem('savedLang', this.savedLang);
    this.htmlElement.setAttribute('lang', this.appLang);
    this.htmlElement.setAttribute('dir', this.appDir);
    this.linkElement.setAttribute('href', this.appFont);
  }

  // scroll to top when component changed
  scrollTopWhenComponentChanged() {
    // listen for changes in the current url
    this.routerObservable = this.router.events.pipe(filter(value => value instanceof NavigationEnd)).subscribe((value: NavigationEnd) => {
      let currentRoute = this.route;

      // get last child
      while (currentRoute.firstChild) { currentRoute = currentRoute.firstChild; }

      // check if the component has changed
      if (this.componentBeforeNavigation !== currentRoute.component) {
        // scroll to top
        this.scrollToTop();
      }

      // cache the current component to compare with it later
      this.componentBeforeNavigation = currentRoute.component;
    });
  }

  // scroll to top button
  scrollToTop() {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    });
  }
}
