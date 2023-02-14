import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { UserProfile } from 'src/app/shared/interfaces/user/user-profile';
import { CountryDropDown } from 'src/app/shared/interfaces/country-drop-down';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

// animations
import { slideFade } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-fade';
import { slideToggle } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-toggle';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  animations: [
    slideFade,
    slideToggle
  ]
})
export class UserProfileComponent implements OnInit, OnDestroy {

  langChangeObservable: Subscription;

  // user info
  userInfo: UserProfile;
  userObservable: Subscription;

  // user info forms
  basicInfoForm: FormGroup;
  additionalInfoForm: FormGroup;
  securityForm: FormGroup;
  profilePictureForm: FormGroup;

  // to store initial values
  basicInfoFormValue;
  additionalInfoFormValue;
  securityFormValue;
  profilePictureFormValue;

  // to toggle visibility of save buttons
  basicInfoFormChanged: boolean;
  additionalInfoFormChanged: boolean;
  securityFormChanged: boolean;
  profilePictureFormChanged: boolean;

  basicInfoFormValueObservable: Subscription;
  additionalInfoFormValueObservable: Subscription;
  securityFormValueObservable: Subscription;
  profilePictureFormValueObservable: Subscription;

  // form controls validators
  nameMinLength: number = 3;
  passwordMinLength: number = 6;

  // here to store countries
  countries: Array<object>;

  // date picker settings
  birthDateOptions: IAngularMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
    disableUntil: {year: 1900, month: 1, day: 1},
    firstDayOfWeek: 'sa'
  };

  // profile picture upload (input file)
  progressPercent: number[] = [];
  progressComplete: boolean[] = [];
  profilePictureUrl: string;
  deletedImgUrl: string;
  // store subscriptions for unsubscribe when component destroyed
  profilePictureSubscription: Subscription[] = [];

  // functions that executing before refreshing the page
  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    // delete uploaded profile picture if it is not saved
    if (this.profilePictureFormChanged) {
      this.userSer.deleteUploadedPicture(this.profilePictureUrl);
    }
  }

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private authSer: AuthService,
    private userSer: UserService,
    private generalSettingsSer: GeneralSettingsService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(1, ['user']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    this.mainLoadingSer.startLoading();

    // get user info
    this.userObservable = this.authSer.user.pipe(first()).subscribe(user => {
      if (user) {
        this.userSer.getUserInfo().then(data => {
          this.userInfo = data;

          this.basicInfoForm.patchValue({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            country: data.country
          });

          const savedBirthDate: IMyDateModel
          = data.birthDate ? { isRange: false, singleDate: { date: data.birthDate }, dateRange: null } : null;

          this.additionalInfoForm.patchValue({
            birthDate: savedBirthDate,
            gender: data.gender ? data.gender : 'male'
          });

          // if the user have profile picture
          if (data.profilePicture) {
            this.profilePictureForm.patchValue({
              photoUrl: data.profilePicture.url
            });
          }

          // get the default values from the database and set it to the form controls
          this.basicInfoFormValue = JSON.stringify(this.basicInfoForm.getRawValue());
          this.additionalInfoFormValue = JSON.stringify(this.additionalInfoForm.getRawValue());
          this.securityFormValue = JSON.stringify(this.securityForm.getRawValue());
          this.profilePictureFormValue = JSON.stringify(this.profilePictureForm.getRawValue());

          // listening for changes in the default values to show save buttons
          this.onChanges();

          this.mainLoadingSer.endLoading();
        });
      }
    });

    // user info forms
    this.basicInfoForm = this.fb.group({
      firstName: [null, [Validators.required, Validators.minLength(this.nameMinLength)]],
      lastName: [null, [Validators.required, Validators.minLength(this.nameMinLength)]],
      email: [null, [Validators.required, Validators.email]],
      country: [null, Validators.required]
    }, {
      validator: [
        // firstName & lastName & email required validation
        this.validatorsSer.anyRequired('firstName', this.translateSer.instant('profile-page.basic-info.first-name-label')),
        this.validatorsSer.anyRequired('lastName', this.translateSer.instant('profile-page.basic-info.last-name-label')),
        this.validatorsSer.anyRequired('email', this.translateSer.instant('profile-page.basic-info.email-label')),
        // firstName & lastName minlength validation
        this.validatorsSer.anyMinLength(
          'firstName',
          this.translateSer.instant('profile-page.basic-info.first-name-label'),
          this.nameMinLength
        ),
        this.validatorsSer.anyMinLength(
          'lastName',
          this.translateSer.instant('profile-page.basic-info.last-name-label'),
          this.nameMinLength
        ),
        // Email format validation
        this.validatorsSer.emailFormat('email')
      ]
    });

    this.additionalInfoForm = this.fb.group({
      birthDate: [null, Validators.required],
      gender: ['male', Validators.required]
    }, {
      validator: [
        // Birth Date format validation
        this.validatorsSer.dateFormat('birthDate')
      ]
    });

    this.securityForm = this.fb.group({
      newPassword: [null, [Validators.required, Validators.minLength(this.passwordMinLength)]],
      confirmNewPassword: [null, [Validators.required, Validators.minLength(this.passwordMinLength)]]
    }, {
      validator: [
        // passwords match validation
        this.validatorsSer.passwordsMatch('newPassword', 'confirmNewPassword'),
        // password minlength validation
        this.validatorsSer.anyMinLength(
          'newPassword',
          this.translateSer.instant('profile-page.security.password'),
          this.passwordMinLength
        ),
        // cannot contain spaces validation
        this.validatorsSer.cannotContainSpaces('newPassword', this.translateSer.instant('profile-page.security.password')),
        // password required validation
        this.validatorsSer.passwordRequired('newPassword', 'confirmNewPassword'),
        // confirm password required validation
        this.validatorsSer.confirmPasswordRequired('newPassword', 'confirmNewPassword')
      ]
    });

    this.profilePictureForm = this.fb.group({ photoUrl: null });

    // get countries
    this.countries = this.generalSettingsSer.getAllCountries().map(country => {
      return {
        dial: country.dial,
        icon: country.flag,
        id: country.code,
        label: country.name
      };
    });
  }

  get firstName() { return this.basicInfoForm.get('firstName'); }
  get lastName() { return this.basicInfoForm.get('lastName'); }
  get email() { return this.basicInfoForm.get('email'); }
  get country() { return this.basicInfoForm.get('country'); }
  get birthDate() { return this.additionalInfoForm.get('birthDate'); }
  get gender() { return this.additionalInfoForm.get('gender'); }
  get newPassword() { return this.securityForm.get('newPassword'); }
  get confirmNewPassword() { return this.securityForm.get('confirmNewPassword'); }
  get photoUrl() { return this.profilePictureForm.get('photoUrl'); }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();

    this.userObservable.unsubscribe();
    this.basicInfoFormValueObservable.unsubscribe();
    this.additionalInfoFormValueObservable.unsubscribe();
    this.securityFormValueObservable.unsubscribe();

    if (this.profilePictureFormChanged) {
      this.userSer.deleteUploadedPicture(this.profilePictureUrl).then(() => {
        this.profilePictureFormValueObservable.unsubscribe();
      });
    } else { this.profilePictureFormValueObservable.unsubscribe(); }
    this.profilePictureSubscription.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('profile-page.page-title'));
  }

  // listening for changes to show save buttons
  onChanges(): void {
    this.basicInfoFormValueObservable = this.basicInfoForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.basicInfoForm.getRawValue()) !== this.basicInfoFormValue) {
        this.basicInfoFormChanged = true;
      } else { this.basicInfoFormChanged = false; }
    });

    this.additionalInfoFormValueObservable = this.additionalInfoForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.additionalInfoForm.getRawValue()) !== this.additionalInfoFormValue) {
        this.additionalInfoFormChanged = true;
      } else { this.additionalInfoFormChanged = false; }
    });

    this.securityFormValueObservable = this.securityForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.securityForm.getRawValue()) !== this.securityFormValue) {
        this.securityFormChanged = true;
      } else { this.securityFormChanged = false; }
    });

    this.profilePictureFormValueObservable = this.profilePictureForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.profilePictureForm.getRawValue()) !== this.profilePictureFormValue) {
        this.profilePictureFormChanged = true;
      } else { this.profilePictureFormChanged = false; }
    });
  }

  // get country value
  countryChanged(option: CountryDropDown) {
    this.basicInfoForm.patchValue({
      country: option
    });
  }

  // get selected files from input type file by @Output
  getProfilePicture(files: FileList) {

    // required file type validation
    this.validatorsSer.requiredFileType(
      files,
      this.translateSer.instant('profile-page.profile-picture.field-title'),
      ['png', 'jpg', 'jpeg']
    ).then(() => {

      // upload profile picture then get its url
      this.userSer.uploadProfilePicture(files).then((filePromisesArray) => {

        // create array that contains 'false' values with files length to show save button only if all files have been uploaded
        const allComplete = new Array(files.length).fill(false);

        filePromisesArray.forEach((file, index: number) => {
          this.profilePictureSubscription.push(file.subscribe((progress: number) => {
            this.progressPercent[index] = progress;
            this.progressComplete[index] = false;
          }, () => {}, // error
          () => { // complete
            this.progressComplete[index] = true;
            allComplete[index] = true;

            // get profile picture url
            if (allComplete.every(item => item === true)) {
              this.userSer.getProfilePictureUrl().then(urlPromisesArray => {
                this.profilePictureSubscription.push(urlPromisesArray[index].subscribe((url: string) => {
                  this.profilePictureForm.patchValue({ photoUrl: url });
                  this.profilePictureUrl = url;
                }));
              });
            }

          }));
        });
      });
    });
  }

  // delete profile picture
  deleteProfilePicture(imgUrl: string) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-picture'));

    if (confirmMsg) {
      this.photoUrl.reset();

      this.deletedImgUrl = imgUrl;
    }
  }

  // update user data
  updateUserData(form: FormGroup, name: string) {
    this.mainLoadingSer.startLoading();

    this.userSer.updateUserData(form.getRawValue(), name)
      .then(() => {
        // check if some images was deleted
        if (this.deletedImgUrl) {

          // delete this image from the storage
          this.userSer.deleteUploadedPicture(this.deletedImgUrl);

          // reset the deleted url
          this.deletedImgUrl = '';
        }

        this[`${name}Value`] = JSON.stringify(form.getRawValue()); // get and set the new values
        this[`${name}Changed`] = false; // hide save buttons

        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.changes-saved'), time: 5000});
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
      });
  }

  // Function to Toggle Password Visibility
  togglePasswordVisibility(el) {
    this.globalJs.togglePasswordVisibility(el);
  }
}
