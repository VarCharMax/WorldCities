import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  template: '',
})
export class BaseFormComponent {
  form: FormGroup;

  constructor() {}

  getControl(name: string) {
    return this.form.get(name);
  }

  isValid(name: string) {
    const e = this.getControl(name);
    return e && e.valid;
  }

  isChanged(name: string) {
    const e = this.getControl(name);
    return e && (e.dirty || e.touched);
  }

  hasError(name: string) {
    const e = this.getControl(name);
    return e && (e.dirty || e.touched) && e.invalid;
  }
}
