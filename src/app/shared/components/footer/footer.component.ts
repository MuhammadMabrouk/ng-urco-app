import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserGuardService } from 'src/app/shared/services/routes-guards/user-guard.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { NewsletterService } from 'src/app/shared/services/admin/newsletter.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  // newsletter form
  newsletterForm: FormGroup;

  constructor(
    public authSer: AuthService,
    private userGuardSer: UserGuardService,
    private router: Router,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private newsletterSer: NewsletterService
  ) { }

  ngOnInit() {
    // sign in form
    this.newsletterForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]]
    }, {
      validator: [
        // email required validation
        this.validatorsSer.anyRequired('email', 'Email'),
        // Email format validation
        this.validatorsSer.emailFormat('email')
      ]
    });
  }

  // redirect to the 'sign-in' page with the 'returnUrl'
  navigateToSignIn() {
    const returnUrl = this.router.url;

    if (returnUrl.includes('sign-up')) {
      this.router.navigate(['/sign-in'], { queryParams: { returnUrl: '/' }});
    } else {
      this.router.navigate(['/sign-in'], { queryParams: { returnUrl: this.router.url }});
    }
  }

  // logOut
  logOut() {
    // tell the guard to go to the homepage after logout
    this.userGuardSer.redirectUrl = '/';

    // sign out
    this.authSer.logOut();
  }

  // subscribe to the newsletter
  newsletterSubscribe(form: FormGroup) {
    this.newsletterSer.newSubscribe(form);
  }
}
