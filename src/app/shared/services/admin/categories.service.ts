import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { Category } from 'src/app/shared/interfaces/admin/category';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  // for category icon & img
  fileRefs: AngularFireStorageReference[] = [];
  filePuts: AngularFireUploadTask[] = [];

  constructor(
    private fs: AngularFirestore,
    private storage: AngularFireStorage
  ) { }

  // add new category
  addNewCategory(data: Category) {
    // check if the added category is exist or not
    return this.fs.firestore.doc(`categories/${data.catSlug}`).get().then(doc => {
      if (!doc.exists) {

        // get the number of documents in the collection
        return this.fs.firestore.collection('categories').get().then(snap => {

          // store categories count in database
          const categoriesCount = snap.size + 1;

          return this.fs.firestore.doc(`dashboard/general-info`).get()
            .then(infoDoc => {

              // general-info doc path
              const generalInfoDoc = this.fs.collection('dashboard').doc('general-info');
              // save the new category
              const saveNewCategory = this.fs.collection('categories').doc(data.catSlug).set(data);

              // check if the 'general-info' doc is exist or not
              if (!infoDoc.exists) {
                return generalInfoDoc.set({ categoriesCount }).then(() => saveNewCategory);
              } else {
                return generalInfoDoc.update({ categoriesCount }).then(() => saveNewCategory);
              }
            });
        });

      } else {
        throw null;
      }
    });
  }

  // upload files
  uploadFiles(files: FileList, controlName: string, uploadedFileName: string) {

    // reset array values
    this.fileRefs = [];
    this.filePuts = [];

    // create array for promises
    const filePromisesArray: Promise<Observable<number>>[] = [];

    Array.from(files).forEach(file => {
      filePromisesArray.push(new Promise((resolve) => {
        const ref = this.storage.ref(`categories/${uploadedFileName}_${controlName}`);
        const put = ref.put(file);
        this.fileRefs.push(ref);
        this.filePuts.push(put);

        resolve(put.percentageChanges());
      }));
    });

    return Promise.all(filePromisesArray);
  }

  // get files url
  getFilesUrl() {
    const urlPromisesArray: Promise<Observable<string>>[] = []; // create array for promises

    this.filePuts.forEach((put, index) => {
      urlPromisesArray.push(new Promise((resolve) => {
        put.then(() => {
          resolve(this.fileRefs[index].getDownloadURL());
        });
      }));
    });

    return Promise.all(urlPromisesArray);
  }

  // delete uploaded files (catIcon & catImg) if it is not saved
  deleteUploadedImages(urls: string[]) {
    return new Promise<void>(() => {
      urls.forEach(url => this.storage.storage.refFromURL(url).delete());
    });
  }

  // get all categories
  getCategories(): Promise<Category[]> {
    return this.fs.collection('categories', ref => ref.orderBy('seqNo')).valueChanges().pipe(first()).toPromise();
  }

  // get data of the edited category
  getEditedCategory(categoryId: string) {
    return this.fs.collection('categories').doc(categoryId).ref.get();
  }

  // edit selected category
  editCategory(id: string, data: Category) {
    return this.fs.collection('categories').doc(id).update(data);
  }

  // delete selected category
  deleteCategory(id: string) {
    // get the categories number
    return this.fs.firestore.collection('dashboard').doc('general-info').get()
      .then(res => {
        // store new count of categories in the database
        const categoriesCount = res.data().categoriesCount - 1;
        this.fs.collection('dashboard').doc('general-info').update({ categoriesCount });

        // delete category data
        return this.fs.collection('categories').doc(id).delete();
      });
  }
}
