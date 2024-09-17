import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DefaultResponseType} from "../../../types/default-response.type";
import {environment} from "../../../environments/environment";
import {CommentType} from "../../../types/comment.type";
import {CommentActionsType} from "../../../types/comment-actions.type";

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private http: HttpClient) {
  }

  getComments(articleId: string, offset: number = 3) {
    return this.http.get<DefaultResponseType | {allCount: number, comments: CommentType[]}>(environment.api + 'comments', {
      params: {
        offset: offset,
        article: articleId
      }
    })
  }

  addComment(text: string, articleId: string) {
    return this.http.post<DefaultResponseType>(environment.api + 'comments', {
      text: text,
      article: articleId
    })
  }

  // Запрос на применение действия для комментария. Возможные варианты для action в body: like, dislike, violate
  // Необходимо передавать авторизационный заголовок с access токеном. В ответ получаем DefaultResponse

  applyAction(commentId: string, action: CommentActionsType) {
    return this.http.post<DefaultResponseType>(environment.api + 'comments/' + commentId + '/apply-action', {
      action: action
    })
  }

  // Запрос на получение действий пользователя для комментария. Необходимо передавать авторизационный
  // заголовок с access токеном. В ответ получаем DefaultResponse в случае неудачи, либо же массив
  // действий пользователя (кроме violate)

  getActionsForComment(commentId: string) {
    return this.http.get<DefaultResponseType>(environment.api + 'comments/' + commentId + '/actions')
  }

  // Запрос на получение действий пользователя для всех комментариев в рамках одной статьи.
  // Необходимо передавать авторизационный заголовок с access токеном.
  // В ответ получаем DefaultResponse в случае неудачи, либо же массив действий
  // пользователя (кроме violate) для комментариев.

  getArticleCommentActions(articleId: string) {
    return this.http.get<DefaultResponseType>(environment.api + 'comments/article-comment-actions?articleId=' + articleId)
  }
}
