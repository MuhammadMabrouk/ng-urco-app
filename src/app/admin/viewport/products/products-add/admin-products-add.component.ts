import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GoodsService } from 'src/app/shared/services/goods/goods.service';
import { CategoriesService } from 'src/app/shared/services/admin/categories.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Category } from 'src/app/shared/interfaces/admin/category';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { SelectMenu } from 'src/app/shared/ui-elements/forms/select-menu/select-menu';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { slideFade } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-fade';

@Component({
  selector: 'app-admin-products-add',
  templateUrl: './admin-products-add.component.html',
  styleUrls: ['./admin-products-add.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    slideFade
  ]
})
export class AdminProductsAddComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // new good form
  goodForm: FormGroup;
  // form controls validation
  descMinLength: number = 200;

  // initial categories
  initialCategories;
  // here to store goods categories
  categories: SelectMenu[];

  // product images upload (input file)
  productImagesValueChanged: boolean = false;
  progressPercent: number[] = [];
  progressComplete: boolean[] = [];
  imagesUrls: string[] = [];
  deletedImgUrl: string[] = [];

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  subscriptions: Subscription[] = [];

  // functions that executing before refreshing the page
  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    // delete uploaded product images if they are not saved
    if (this.productImagesValueChanged) {
      this.goodsSer.deleteUploadedImages(this.imagesUrls);
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
    private goodsSer: GoodsService,
    private categoriesSer: CategoriesService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['admin']);
  }

  ngOnInit(): void {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => {
      this.onLangChanges();

      // get mapped categories
      this.mappedCategories(this.initialCategories);
    });

    // new good form
    this.goodForm = this.fb.group({
      category: [null, Validators.required],
      subCategory: null,
      name: [null, Validators.required],
      price: [null, Validators.required],
      discount: 0,
      desc: [null, [Validators.required, Validators.minLength(this.descMinLength)]],
      sizes: this.fb.array([null, null, null, null, null, null, null]),
      color: [null, Validators.required],
      images: this.fb.array([], Validators.required),
      newLabel: false,
      bestLabel: false
    }, {
      validator: [
        // required validation
        this.validatorsSer.anyRequired('category', this.translateSer.instant('add-admin-products-page.category-label')),
        this.validatorsSer.anyRequired('name', this.translateSer.instant('add-admin-products-page.name-label')),
        this.validatorsSer.anyRequired('price', this.translateSer.instant('add-admin-products-page.price-label')),
        this.validatorsSer.anyRequired('desc', this.translateSer.instant('add-admin-products-page.desc-label')),
        this.validatorsSer.anyRequired('color', this.translateSer.instant('add-admin-products-page.colors.title')),
        this.validatorsSer.anyRequired('images', this.translateSer.instant('add-admin-products-page.images-label')),
        // description minlength validation
        this.validatorsSer.anyMinLength('desc', this.translateSer.instant('add-admin-products-page.desc-label'), this.descMinLength)
      ]
    });

    // get all categories
    this.categoriesSer.getCategories().then(categories => {
      this.initialCategories = categories;

      this.mappedCategories(categories);
    });
  }

  get category() { return this.goodForm.get('category'); }
  get subCategory() { return this.goodForm.get('subCategory'); }
  get price() { return this.goodForm.get('price'); }
  get discount() { return this.goodForm.get('discount'); }
  get sizes() { return this.goodForm.get('sizes') as FormArray; }
  get color() { return this.goodForm.get('color'); }
  get images() { return this.goodForm.get('images') as FormArray; }

  ngOnDestroy() {
    // delete uploaded product images if they are not saved
    if (this.productImagesValueChanged) {
      this.goodsSer.deleteUploadedImages(this.imagesUrls);
    }

    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('add-admin-products-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // get mapped categories
  mappedCategories(categories: Category[]) {
    this.categories = categories.map(category => {
      let children;

      if (category.children) {
        children = category.children.map(subCategory => {
          return { id: subCategory.catSlug, label: subCategory.catName[this.currentLang] };
        });
      }

      return {
        id: category.catSlug,
        label: category.catName[this.currentLang],
        icon: category.catIcon,
        children
      };
    });
  }

  // select menu changed
  selectMenuChanged(controlName: string, value) {

    // category changed
    if (controlName === 'category') {

      // if has sub category
      if (value.children.length) {

        this.goodForm.patchValue({
          category: value,
          subCategory: value.children[0]
        });

      } else {

        this.goodForm.patchValue({
          category: value,
          subCategory: null
        });
      }

      // sub category changed
    } else if (controlName === 'subCategory') {

      this.goodForm.patchValue({
        subCategory: value
      });

      // color changed
    } else if (controlName === 'color') {

      this.goodForm.patchValue({
        color: value.id
      });

    }
  }

  // update numeric values
  updateValue(controlName: string, value: number) {
    this.goodForm.patchValue({
      [controlName]: +value
    });
  }

  // get selected files from input type file by @Output
  getProductImages(files: FileList) {

    // required file type validation
    this.validatorsSer.requiredFileType(
      files,
      this.translateSer.instant('add-admin-products-page.product-image-field-title'),
      ['png', 'jpg', 'jpeg']
    ).then(() => {

      // upload product images then get their URLs
      this.goodsSer.uploadProductImages(files).then(filesPromisesArray => {

        filesPromisesArray.forEach((file, index: number) => {
          this.subscriptions.push(file.subscribe((progress: number) => {
            this.progressPercent[index] = progress;
            this.progressComplete[index] = false;
          }, () => {}, // error
          () => { // complete
            this.progressComplete[index] = true;
            this.productImagesValueChanged = true;

            // get product images urls
            this.goodsSer.getProductImagesUrls().then(urlsPromisesArray => {
              this.subscriptions.push(urlsPromisesArray[index].subscribe((url: string) => {
                this.images.push(this.fb.control(url));
                this.imagesUrls.push(url);
              }));
            });

          }));
        });
      });
    });
  }

  // remove an image form product images
  removeImage(index: number, imgUrl: string) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-image'));

    if (confirmMsg) {
      this.images.removeAt(index);

      this.deletedImgUrl.push(imgUrl);
    }
  }

  // save new good on form submit
  saveNewGood(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const values = form.getRawValue();
    // get today's date in nice format
    const todayDate: string = (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string);
    const priceAfterDiscount: number = values.discount ? values.price - (values.price * (values.discount / 100)) : values.price;
    const newObject: Goods = {
      seqNo: Date.now(),
      dateAdded: todayDate,
      category: {
        catSlug: values.category.id,
        catName: { [this.currentLang]: values.category.label }
      },
      mainCatSlug: values.category.id,
      name: { [this.currentLang]: values.name },
      price: values.price,
      discount: values.discount / 100,
      priceAfterDiscount,
      desc: { [this.currentLang]: values.desc },
      sizes: (values.sizes as string[]).filter(s => s),
      color: values.color,
      images: values.images,
      newLabel: values.newLabel,
      bestLabel: values.bestLabel,
      oosLabel: false
    };

    if (values.subCategory) {
      newObject.category.children = {
        catSlug: values.subCategory.id,
        catName: { [this.currentLang]: values.subCategory.label }
      };
    }

    // save new good on database
    this.goodsSer.addNewGood(newObject)
      .then(doc => {
        // check if some images was deleted
        if (this.deletedImgUrl.length) {

          // delete this images from the storage
          this.goodsSer.deleteUploadedImages(this.imagesUrls);

          // reset the urls array
          this.deletedImgUrl = [];
        }

        // save the generated id by firebase after saving the good to this good
        this.goodsSer.saveNewGoodId(doc.id);

        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.product-saved'), time: 5000});
        this.productImagesValueChanged = false;
        form.reset();
        this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });
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
