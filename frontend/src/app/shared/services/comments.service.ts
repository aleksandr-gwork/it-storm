import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DefaultResponseType} from "../../../types/default-response.type";
import {environment} from "../../../environments/environment";
import {ArticleType} from "../../../types/article.type";
import {CommentType} from "../../../types/comment.type";

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private http: HttpClient) {
  }

  getComments(articleId: string, offset: number = 3) {
    return this.http.get<DefaultResponseType | { allCount: number, comments: CommentType[] }>(environment.api + 'comments', {
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
}
