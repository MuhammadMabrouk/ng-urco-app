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
import { Category } from 'src/app/shared/interfaces/admin/category';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { slideFade } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-fade';
import { slideToggle } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-toggle';

@Component({
  selector: 'app-admin-products-edit',
  templateUrl: './admin-products-edit.component.html',
  styleUrls: ['./admin-products-edit.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    slideFade,
    slideToggle
  ]
})
export class AdminProductsEditComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // edited good id
  goodId: string;

  // edited good data
  goodData: Goods;

  // editing good form
  editingGoodForm: FormGroup;
  // form controls validation
  descMinLength: number = 200;
  // to store initial values
  editingGoodFormValue;
  // to toggle visibility of save button
  editingGoodFormChanged: boolean;

  // initial categories
  initialCategories;
  // here to store goods categories
  categories;
  // here to store goods sub categories
  subCategories;

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
    private categoriesSer: CategoriesService
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

      // set the data to good form fields
      this.setData(this.goodData);
    });

    // get the id of the edited good
    this.goodId = this.activeRoute.snapshot.paramMap.get('id');

    // editing good form
    this.editingGoodForm = this.fb.group({
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
      bestLabel: false,
      oosLabel: false
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

      // get data of the edited good
      this.getEditedGood();
    });
  }

  get category() { return this.editingGoodForm.get('category'); }
  get subCategory() { return this.editingGoodForm.get('subCategory'); }
  get price() { return this.editingGoodForm.get('price'); }
  get discount() { return this.editingGoodForm.get('discount'); }
  get sizes() { return this.editingGoodForm.get('sizes') as FormArray; }
  get color() { return this.editingGoodForm.get('color'); }
  get images() { return this.editingGoodForm.get('images') as FormArray; }

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
    this.title.setTitle(this.translateSer.instant('edit-admin-products-page.page-title'));

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

  // get data of the edited good
  getEditedGood() {
    this.mainLoadingSer.startLoading();

    this.goodsSer.getEditedGood(this.goodId)
      .then(good => {

        // check if there is data
        if (good) {
          // set the data to good form fields
          this.setData(good.data(), true);

          this.goodData = good.data();
        }

        // listening for changes in the default values to show save buttons
        this.onChanges();

        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // set the data to good form fields
  setData(good: Goods, firstTime?: boolean) {

    if (firstTime) {
      // get the default values from the database
      this.editingGoodForm.patchValue({
        price: good.price,
        discount: Math.round(good.discount * 100),
        color: good.color,
        newLabel: good.newLabel,
        bestLabel: good.bestLabel,
        oosLabel: good.oosLabel
      });

      // get good sizes
      if (good.sizes) {
        good.sizes.forEach((size, index: number) => this.sizes.controls[index].setValue(size));
      }

      // get good images urls
      good.images.forEach(img => this.images.push(this.fb.control(img)));
    }

    // get the default values from the database
    this.editingGoodForm.patchValue({
      name: good.name[this.currentLang],
      desc: good.desc[this.currentLang]
    });

    // get good category
    if (good.category && good.category.children) {
      this.editingGoodForm.patchValue({
        category: {
          id: good.category.catSlug,
          label: good.category.catName[this.currentLang],
          children: {
            id: good.category.children.catSlug,
            label: good.category.children.catName[this.currentLang]
          }
        },
        subCategory: {
          id: good.category.children.catSlug,
          label: good.category.children.catName[this.currentLang]
        }
      });

      // get good sub categories
      this.subCategories = this.categories.filter(cat => cat.id === good.category.catSlug)[0].children;

    } else if (good.category) {
      this.editingGoodForm.patchValue({
        category: {
          id: good.category.catSlug,
          label: good.category.catName[this.currentLang]
        }
      });
    }

    // set the default values
    this.editingGoodFormValue = JSON.stringify(this.editingGoodForm.getRawValue());
  }

  // listening for changes to show save buttons
  onChanges(): void {
    this.subscriptions.push(this.editingGoodForm.valueChanges.pipe(delay(0)).subscribe(() => {
      if (JSON.stringify(this.editingGoodForm.getRawValue()) !== this.editingGoodFormValue) {
        this.editingGoodFormChanged = true;
      } else { this.editingGoodFormChanged = false; }
    }));
  }

  // select menu changed
  selectMenuChanged(controlName: string, value) {

    // category changed
    if (controlName === 'category') {

      // if has sub category
      if (value.children.length) {

        this.editingGoodForm.patchValue({
          category: value,
          subCategory: value.children[0]
        });

        // get good sub categories
        this.subCategories = value.children;

      } else {

        this.editingGoodForm.patchValue({
          category: value,
          subCategory: null
        });

        // reset good sub categories
        this.subCategories = null;
      }

      // sub category changed
    } else if (controlName === 'subCategory') {

      this.editingGoodForm.patchValue({
        subCategory: value
      });

      // color changed
    } else if (controlName === 'color') {

      this.editingGoodForm.patchValue({
        color: value.id
      });

    }
  }

  // update numeric values
  updateValue(controlName: string, value: number) {
    this.editingGoodForm.patchValue({
      [controlName]: +value
    });
  }

  // get uploaded images from input type file by @Output
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

  // edit the data of this good on form submit
  editGoodData(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const values = form.getRawValue();
    const priceAfterDiscount: number = values.discount ? values.price - (values.price * (values.discount / 100)) : values.price;
    const newObject: Goods = {
      category: {
        catSlug: values.category.id,
        catName: this.goodData.category.catName
      },
      mainCatSlug: values.category.id,
      name: this.goodData.name,
      price: values.price,
      discount: values.discount / 100,
      priceAfterDiscount,
      desc: this.goodData.desc,
      sizes: (values.sizes as string[]).filter(s => s),
      color: values.color,
      images: values.images,
      newLabel: values.newLabel,
      bestLabel: values.bestLabel,
      oosLabel: values.oosLabel
    };

    if (values.subCategory && this.goodData.category.children) {

      newObject.category.children = {
        catSlug: values.subCategory.id,
        catName: this.goodData.category.children.catName
      };
      newObject.category.children.catName[this.currentLang] = values.subCategory.label;

    } else if (values.subCategory) {

      newObject.category.children = {
        catSlug: values.subCategory.id,
        catName: { [this.currentLang]: values.subCategory.label }
      };

    }

    newObject.category.catName[this.currentLang] = values.category.label;
    newObject.name[this.currentLang] = values.name;
    newObject.desc[this.currentLang] = values.desc;

    // edit this good
    this.goodsSer.editGood(this.goodId, newObject)
      .then(() => {
        // check if some images was deleted
        if (this.deletedImgUrl.length) {

          // delete this images from the storage
          this.goodsSer.deleteUploadedImages(this.deletedImgUrl);

          // reset the urls array
          this.deletedImgUrl = [];
        }

        this.editingGoodFormValue = JSON.stringify(form.getRawValue()); // get and set the new values
        this.editingGoodFormChanged = false; // hide save button
        this.productImagesValueChanged = false;

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
