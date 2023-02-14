import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CategoriesService } from 'src/app/shared/services/admin/categories.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Category } from 'src/app/shared/interfaces/admin/category';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { slideFade } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-fade';
import { slideFadeRedHighlight } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-fade-red-highlight';
import { slideToggle } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-toggle';

@Component({
  selector: 'app-admin-categories-edit',
  templateUrl: './admin-categories-edit.component.html',
  styleUrls: ['./admin-categories-edit.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    slideFade,
    slideFadeRedHighlight,
    slideToggle
  ]
})
export class AdminCategoriesEditComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // edited category id
  categoryId: string;

  // edited category data
  categoryData: Category;

  // category form
  categoryForm: FormGroup;
  // to store initial values
  categoryFormValue;
  // to toggle visibility of save button
  categoryFormChanged: boolean;

  // upload category icon & img (input file)
  catIconProgressPercent: number[] = [];
  catImgProgressPercent: number[] = [];
  catIconProgressComplete: boolean[] = [];
  catImgProgressComplete: boolean[] = [];
  imagesUrls: string[] = [];
  // flag to check if category images have been uploaded
  catImagesValueChanged: boolean;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  subscriptions: Subscription[] = [];

  // functions that executing before refreshing the page
  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    // delete uploaded files if it is not saved
    if (this.catImagesValueChanged) {
      this.categoriesSer.deleteUploadedImages(this.imagesUrls);
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
    private router: Router,
    private activeRoute: ActivatedRoute,
    private categoriesSer: CategoriesService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['admin']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => {
      this.onLangChanges();

      // set the data to category form fields
      this.setData(this.categoryData);
    });

    // get the id of the edited category
    this.categoryId = this.activeRoute.snapshot.paramMap.get('id');

    // get data of the edited category
    this.getEditedCategory();

    // category form
    this.categoryForm = this.fb.group({
      catName: [null, [Validators.required]],
      catSlug: [{value: null, disabled: true}, [Validators.required]],
      catBrief: null,
      catIcon: [null, [Validators.required]],
      catImg: [null, [Validators.required]],
      children: this.fb.array([])
    }, {
      validator: [
        // required validation
        this.validatorsSer.anyRequired('catName', this.translateSer.instant('add-admin-categories-page.name-label')),
        this.validatorsSer.anyRequired('catSlug', this.translateSer.instant('add-admin-categories-page.slug-label')),
        this.validatorsSer.anyRequired('catIcon', this.translateSer.instant('add-admin-categories-page.icon-label')),
        this.validatorsSer.anyRequired('catImg', this.translateSer.instant('add-admin-categories-page.img-label'))
      ]
    });
  }

  get catName() { return this.categoryForm.get('catName'); }
  get catSlug() { return this.categoryForm.get('catSlug'); }
  get catBrief() { return this.categoryForm.get('catBrief'); }
  get catIcon() { return this.categoryForm.get('catIcon'); }
  get catImg() { return this.categoryForm.get('catImg'); }
  get children() { return this.categoryForm.get('children') as FormArray; }

  ngOnDestroy() {
    // delete uploaded files (catIcon & catImg) if it is not saved
    if (this.catImagesValueChanged) {
      this.categoriesSer.deleteUploadedImages(this.imagesUrls);
    }

    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('edit-admin-categories-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // get the data of the edited category
  getEditedCategory() {
    this.mainLoadingSer.startLoading();

    this.categoriesSer.getEditedCategory(this.categoryId)
      .then(category => {
        // set the data to category form fields
        this.setData(category.data());

        this.categoryData = category.data();

        // listening for changes in the initial values to show save buttons
        this.onChanges();

        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // set the data to category form fields
  setData(data: Category) {

    // set the initial values
    this.categoryForm.patchValue({
      catName: data.catName[this.currentLang],
      catSlug: data.catSlug,
      catBrief: data.catBrief[this.currentLang],
      catIcon: data.catIcon,
      catImg: data.catImg
    });

    // clear children items when the language changes
    this.children.clear();

    // set the category children
    data.children.forEach(child => {
      this.children.push(this.fb.group({
        [`catName${this.children.length}`]: [child.catName[this.currentLang], [Validators.required]],
        [`catSlug${this.children.length}`]: [{value: child.catSlug, disabled: true}, [Validators.required]]
      }, {
        validator: [
          // required validation
          this.validatorsSer.anyRequired(
            `catName${this.children.length}`,
            this.translateSer.instant('add-admin-categories-page.name-label')
          ),
          this.validatorsSer.anyRequired(
            `catSlug${this.children.length}`,
            this.translateSer.instant('add-admin-categories-page.slug-label')
          )
        ]
      }));
    });

    // set the initial values
    this.categoryFormValue = JSON.stringify(this.categoryForm.getRawValue());
  }

  // listening for changes to show save buttons
  onChanges(): void {
    this.subscriptions.push(this.categoryForm.valueChanges.pipe(delay(0)).subscribe(() => {
      if (JSON.stringify(this.categoryForm.getRawValue()) !== this.categoryFormValue) {
        this.categoryFormChanged = true;
      } else { this.categoryFormChanged = false; }
    }));
  }

  // get category icon & img from the input file
  getUploadFile(files?: FileList, controlName?: string) {
    // make it invalid until 'catSlug' field is valid
    if (files && controlName) {

      const inputLabel = controlName === 'catIcon' ? 'category icon' : 'category img';
      const uploadedFileName = this.catSlug.value.replace(/\s+/g, '_').toLowerCase();

      // required file type validation
      this.validatorsSer.requiredFileType(files, inputLabel, ['png', 'jpg', 'jpeg']).then(() => {

        // upload category icon or img then get its url
        this.categoriesSer.uploadFiles(files, controlName, uploadedFileName).then((filePromisesArray) => {

          // create array that contains 'false' values with files length to know if all files have been uploaded
          const allComplete = new Array(files.length).fill(false);

          filePromisesArray.forEach((file, index: number) => {
            this.subscriptions.push(file.subscribe(progress => {

              this[`${controlName}ProgressPercent`][index] = progress;
              this[`${controlName}ProgressComplete`][index] = false;

            }, () => {},
            () => {
              this[`${controlName}ProgressComplete`][index] = true;
              allComplete[index] = true;
              this.catImagesValueChanged = true;

              // get uploaded files url
              if (allComplete.every(item => item === true)) {
                this.categoriesSer.getFilesUrl().then(urlPromisesArray => {
                  this.subscriptions.push(urlPromisesArray[index].subscribe(url => {
                    this.categoryForm.patchValue({ [controlName]: url });
                    this.imagesUrls.push(url);
                  }));
                });
              }

            }));
          });
        });
      });

    } else {
      this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.enter-cat-slug-first'), time: 5000});
    }
  }

  // remove category icon & img
  removeImage(controlName: string) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-image'));

    if (confirmMsg) {
      this[controlName].reset();
    }
  }

  // add new child form (sub category)
  addChildForm() {
    this.children.push(this.fb.group({
      [`catName${this.children.length}`]: [null, [Validators.required]],
      [`catSlug${this.children.length}`]: [null, [Validators.required]]
    }, {
      validator: [
        // required validation
        this.validatorsSer.anyRequired(
          `catName${this.children.length}`,
          this.translateSer.instant('add-admin-categories-page.name-label')
        ),
        this.validatorsSer.anyRequired(
          `catSlug${this.children.length}`,
          this.translateSer.instant('add-admin-categories-page.slug-label')
        )
      ]
    }));
  }

  // remove child form (sub category)
  removeChildForm(index: number) {
    this.children.removeAt(index);
  }

  // edit selected category on form submit
  editCategory(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const values = form.getRawValue();
    const newObject: Category = {
      catName: this.categoryData.catName,
      catSlug: values.catSlug.replace(/\s+/g, '-').toLowerCase(),
      catBrief: this.categoryData.catBrief,
      catIcon: values.catIcon,
      catImg: values.catImg,
      children: this.categoryData.children
    };
    newObject.catName[this.currentLang] = this.globalJs.toTitleCase(values.catName);
    newObject.catBrief[this.currentLang] = values.catBrief;
    newObject.children.forEach((child: Category, index: number) => {
      child.catName[this.currentLang] = values.children[index][Object.keys(values.children[index])[0]];
    });

    // save the new category on database
    this.categoriesSer.editCategory(this.categoryId, newObject)
      .then(() => {
        this.categoryFormValue = JSON.stringify(form.getRawValue()); // get and set the new values
        this.categoryFormChanged = false; // hide save buttons
        this.catImagesValueChanged = false;

        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.changes-saved'), time: 5000});
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
      });
  }

  // redirect to parent
  redirectToParent() {
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });
  }
}
