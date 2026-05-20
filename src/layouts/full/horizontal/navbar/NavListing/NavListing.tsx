import { useContext } from 'react';

import { useLocation } from 'react-router';
import { Box, List,  useMediaQuery, type Theme } from '@mui/material';
import NavItem from '../NavItem/NavItem';
import NavCollapse from '../NavCollapse/NavCollapse';

import { useMenuItems } from '../../../vertical/sidebar/MenuItems';
import { CustomizerContext } from '../../../../../context/CustomizerContext';


const NavListing = () => {
  const { pathname } = useLocation();
  const menuItems = useMenuItems();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const { isCollapse, isSidebarHover } = useContext(CustomizerContext);
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == "mini-sidebar" && !isSidebarHover : '';

  return (
    <Box>
      <List sx={{ p: 0, display: 'flex', gap: '3px', zIndex: '100' }}>
        {menuItems.map((item) => {
          if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id} onClick={undefined} />
            );

            // {/********If Sub No Menu**********/}
          } else {
            return (
              <NavItem item={item} key={item.id} pathDirect={pathDirect} hideMenu={hideMenu} />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default NavListing;
