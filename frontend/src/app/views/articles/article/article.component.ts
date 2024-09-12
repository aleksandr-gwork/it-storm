import {Component, OnChanges, OnInit} from '@angular/core';
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticleType} from "../../../../types/article.type";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../../../core/auth.service";
import {FormBuilder, Validators} from "@angular/forms";
import {CommentsService} from "../../../shared/services/comments.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommentType} from "../../../../types/comment.type";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  isLogged: boolean = false; // Статус авторизации

  // Переменные для загрузки комментариев
  loadCommentsStatus: boolean = false; // Статус загрузки комментариев
  moreButtonStatus: boolean = false; // Статус кнопки "Показать еще"
  offset: number = 3; // Смещение для загрузки комментариев
  moreComments: { allCount: number, comments: CommentType[] } | undefined; // Список комментариев
  loadedComments: CommentType[] = []; // Список загруженных комментариев


  commentForm = this.fb.group({
    text: ['', Validators.required]
  })

  article: ArticleType | undefined;
  relatedArticles: ArticleType[] | undefined;


  constructor(private articlesService: ArticlesService,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private fb: FormBuilder,
              private commentsService: CommentsService,
              private _snackBar: MatSnackBar) {
    this.isLogged = this.authService.getIsLogged(); // Инициализируем статус авторизации
  }


  ngOnInit(): void {

    // Загружаем статью и список похожих статей
    this.processArticle();

    // Подписываемся на изменения статуса авторизации
    this.authService.isLogged$
      .subscribe((loginStatus) => {
        this.isLogged = loginStatus;
      });

  }

  addComment(articleId: string) {
    if (this.commentForm.valid && this.commentForm.value.text && articleId) {
      this.commentsService.addComment(this.commentForm.value.text, articleId)
        .subscribe((data) => {
          if (!data.error && data.message) {
            this.processArticle();
            this.commentForm.reset();
            this._snackBar.open(data.message);
          } else {
            this._snackBar.open(data.message);
          }
        })
    } else {
      this._snackBar.open('Заполните поле комментария');
    }
  }

  loadMoreComments(id: string) {
    this.loadCommentsStatus = true;
    this.commentsService.getComments(id, this.offset)
      .subscribe((data) => {
        this.loadCommentsStatus = false;
        if ((data as { allCount: number, comments: CommentType[] })) {
          this.moreComments = data as { allCount: number, comments: CommentType[] };

          if (this.moreComments && this.moreComments.comments) {
            this.loadedComments = this.loadedComments.concat(this.moreComments.comments);
            this.offset += 10;
            if (this.offset >= this.article?.commentsCount!) {
              this.moreButtonStatus = false;
            }
          }
        }
      });
  }

  processArticle() {

    this.activatedRoute.params
      .subscribe(params => {
        // Загружаем статью
        this.articlesService.getArticle(params['url'])
          .subscribe((data) => {
            this.article = data;
            // Если количество комментариев больше 3, то показываем кнопку "Показать еще"
            if (this.article && this.article.commentsCount && this.article.commentsCount > 3) {
              this.moreButtonStatus = true;
            } else {
              this.moreButtonStatus = false;
            }
            this.loadedComments = []; // Очищаем список загруженных комментариев
            this.offset = 3; // Обновляем смещение для загрузки комментариев
          });
        // Загружаем список похожих статей
        this.articlesService.getRelatedArticles(params['url'])
          .subscribe((data) => {
            this.relatedArticles = data;
          });
      });
  }
}
