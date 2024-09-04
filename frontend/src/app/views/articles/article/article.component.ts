import {Component, OnInit} from '@angular/core';
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticleType} from "../../../../types/article.type";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  loggedUser: boolean = false;
  actionCommentStatus = {
    like: false,
    dislike: false
  }

  article: ArticleType | undefined;
  relatedArticles: ArticleType[] | undefined;

  constructor(private articlesService: ArticlesService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {

    this.activatedRoute.params
      .subscribe((params) => {
        this.articlesService.getArticle(params['url'])
          .subscribe((article: ArticleType) => {
            this.article = article;
          })
        this.articlesService.getRelatedArticles(params['url'])
          .subscribe((articles: ArticleType[]) => {
            this.relatedArticles = articles;
          })
      })
  }
}
