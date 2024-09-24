import {Component, OnInit} from '@angular/core';
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticleType} from "../../../../types/article.type";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../../../core/auth.service";
import {FormBuilder, Validators} from "@angular/forms";
import {CommentsService} from "../../../shared/services/comments.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommentType} from "../../../../types/comment.type";
import {CommentActionsType} from "../../../../types/comment-actions.type";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  protected readonly CommentActionsType = CommentActionsType;

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
  initArticles: CommentType[] | undefined;
  relatedArticles: ArticleType[] | undefined;

  commentsActions: {
    comment: string,
    action: CommentActionsType
  }[] = [];


  constructor(private articlesService: ArticlesService,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private fb: FormBuilder,
              private commentsService: CommentsService,
              private _snackBar: MatSnackBar) {
    this.isLogged = this.authService.getIsLogged(); // Инициализируем статус авторизации
    this.loadedComments = []; // Очищаем список загруженных комментариев
    this.offset = 3; // Обновляем смещение для загрузки комментариев
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

          this.moreComments.comments.forEach(comment => {
            if (this.commentsActions.find(action => action.comment === comment.id)) {
              comment.action = this.commentsActions.find(action => action.comment === comment.id)!.action;
            }
          })

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
            this.initArticles = data.comments;

            this.commentsService.getArticleCommentActions(this.article.id)
              .subscribe((data: DefaultResponseType | { comment: string, action: CommentActionsType }[]) => {
                if ((data as { comment: string, action: CommentActionsType }[])) {
                  this.commentsActions = data as ({ comment: string, action: CommentActionsType }[]);
                  this.article?.comments?.forEach(comment => {
                    this.commentsActions.forEach(commentAction => {
                      if (comment.id === commentAction.comment) {
                        comment.action = commentAction.action;
                      }
                    })
                  })
                }
              })
            this.moreButtonFunction();
          });
        // Загружаем список похожих статей
        this.articlesService.getRelatedArticles(params['url'])
          .subscribe((data) => {
            this.relatedArticles = data;
          });
      });
  }

  moreButtonFunction() {
    // Если количество комментариев больше 3, то показываем кнопку "Показать еще"
    if (this.article && this.article.commentsCount && this.article.commentsCount > 3) {
      this.moreButtonStatus = true;
    } else {
      this.moreButtonStatus = false;
    }
    this.loadedComments = []; // Очищаем список загруженных комментариев
    this.offset = 3; // Обновляем смещение для загрузки комментариев
  }

  applyAction(commentId: string, action: CommentActionsType, articlesArray: CommentType[]) {
    this.commentsService.applyAction(commentId, action)
      .subscribe({
        next: (data: DefaultResponseType) => {
          if (!data.error && data.message) {
            // Ищем комментарий в списке загруженных комментариев
            const commentIndex = articlesArray.findIndex(comment => comment.id === commentId);
            if (commentIndex !== -1) {
              //Обновляем действие комментария в массиве loadedComments
              articlesArray[commentIndex].action = action;
              //Также можно обновить счётчик лайков/дизлайков, если он есть
              //Например, если action это лайк или дизлайк - увеличиваем или уменьшаем значение
              if (action === CommentActionsType.like) {
                articlesArray[commentIndex].likesCount++;
                // Так же нужно сбросить дизлайк, если он есть
                if (articlesArray[commentIndex].action === CommentActionsType.like) {
                  articlesArray[commentIndex].dislikesCount--;
                }
              } else if (action === CommentActionsType.dislike) {
                articlesArray[commentIndex].dislikesCount++;
                // Так же нужно сбросить лайк, если он есть
                if (articlesArray[commentIndex].action === CommentActionsType.dislike) {
                  articlesArray[commentIndex].likesCount--;
                }
              }
            }
            // Показываем уведомление
            this._snackBar.open(data.message);
          }
        },
        error: (e) => {
          this._snackBar.open(e.error.message);
        }
      });
  }
}
