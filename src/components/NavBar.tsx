/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
/*import {Icon} from "@iconify-icon/react";
import {useContext} from "react";
import {NavLink, useLocation} from "react-router";
import MenuItems from "src/layouts/full/vertical/sidebar/MenuItems.tsx";
import {CancelTestContext} from "../context/CancelTestContext.tsx";
import {MobileContext} from "../context/MobileContext.tsx";
import {useApiQuery} from "../helpers/api.ts";
import MenuItemDto from "../models/MenuItemDto.ts";
import styles from "../styles/NavBar.module.css";

interface NavLink {
	url: string;
	text: string;
	icon: string;
}*/

/** TODO: NavBar renders the main navigation bar for the application. */
export default function NavBar() {
	/*const isMobile = useContext(MobileContext);
	const location = useLocation();
	const menuQuery = useApiQuery<MenuItemDto[]>("/auth/GetMenu", {}, true);
	const navLinks: NavLink[] = (menuQuery.data ?? [])
		.sort((a, b) => (a.itemOrder ?? 0) - (b.itemOrder ?? 0))
		.map<NavLink>(menuItemDto => (
			{
				url: menuItemDto.route?.toLowerCase() ?? "",
				text: menuItemDto.text ?? "",
				icon: menuItemDto.icon ?? "",
			}
		));
	const {setTo, isTestRunning} = useContext(CancelTestContext);
	let id = 0;
	MenuItems.length = 0;
	for (const navLink of navLinks) {
		MenuItems.push({
			id: (++id).toString(),
			title: navLink.text,
			icon: navLink.icon,
			href: navLink.url,
		});
	}*/

	return <></>;

	/*return (
		<nav className={
			[styles.dashboardNavList, isCompact && !isMobile && styles.navCompact].filter(Boolean).join(" ")
		}>
			{navLinks.map((navLink, index) =>
				<NavLink
					key={index}
					to={navLink.url}
					className={
						styles.dashboardNavItem +
						(location.pathname == navLink.url ? ` ${styles.dashboardNavItemActive}` : "")
					}
					onClick={isTestRunning ? e => {e.preventDefault(); setTo(navLink.url);} : undefined}
				>
					<div className={styles.navIcon}>
						{navLink.icon && <Icon icon={navLink.icon} width={19} />}
					</div>
					<span>{navLink.text}</span>
				</NavLink>
			)}
		</nav>
	);*/
}
