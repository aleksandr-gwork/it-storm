import {CommentActionsType} from "./comment-actions.type";

export type CommentType = {
  id: string,
  text: string,
  date: string,
  likesCount: number,
  dislikesCount: number,
  action: CommentActionsType[],
  user: {
    id: string,
    name: string
  }
}
