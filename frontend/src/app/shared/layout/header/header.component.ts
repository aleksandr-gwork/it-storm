import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isLogged: boolean = false;
  userName: string = '';

  constructor(private authService: AuthService, private router: Router,
              private _snackBar: MatSnackBar) {
    this.userName = localStorage.getItem('userName') || 'Пользователь';
    this.isLogged = !!localStorage.getItem('accessToken');
  }

  ngOnInit(): void {
    this.authService.isLogged$
      .subscribe((status) => {
        this.isLogged = status;

        if (this.isLogged) {
          this.authService.getUserInfo()
            .subscribe((data: UserInfoType | DefaultResponseType) => {
              if (data as UserInfoType && (data as UserInfoType).name) {
                localStorage.setItem('userName', (data as UserInfoType).name);
                this.userName = (data as UserInfoType).name;
              } else {
                this.doLogout();
              }
            })
        }
      })
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      })
  }

  doLogout(): void {
    this.authService.removeTokens();
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

}
