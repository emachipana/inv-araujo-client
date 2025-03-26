import { Router } from "@angular/router";
import { parseCategory } from "../../shared/helpers/main";
import { Category } from "../../shared/models/Category";

export const getCurrentCategory = (categories: Category[], router: Router): number => {
  const categoryName: string = router.parseUrl(router.url).queryParams["category"];
  const foundCategory = categories.find((category) => parseCategory(category.name) === categoryName);
  return foundCategory ? foundCategory.id : -1;
}
