
import { useApiQuery } from "../../../../helpers/api";
import type MenuItemDto from "../../../../models/MenuItemDto";


interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}
console.log("MenuItems.tsx loaded");
export function useMenuItems(): MenuitemsType[] {
  const menuQuery = useApiQuery<MenuItemDto[]>("/auth/GetMenu", {}, true);
  let id = 0;
  return menuQuery.data
      ?.map<MenuitemsType>(menuItemDto => (
          {
            id: (++id).toString(),
            title: menuItemDto.text ?? "",
            icon: menuItemDto.icon ?? "",
            href: menuItemDto.route?.toLowerCase() ?? "",
          }
      )) ?? [];
}
