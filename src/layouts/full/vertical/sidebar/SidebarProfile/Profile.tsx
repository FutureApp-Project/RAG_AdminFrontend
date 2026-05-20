import { Box, Typography, IconButton, Tooltip, useMediaQuery } from '@mui/material';

import { Icon } from '@iconify-icon/react';

import { Link } from 'react-router';
import {AuthContext} from "src/context/AuthContext.tsx";
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useContext } from 'react';

export const Profile = () => {
  const {user} = useContext(AuthContext);
  const { isSidebarHover, isCollapse } = useContext(CustomizerContext);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == 'mini-sidebar' && !isSidebarHover : '';


  return (
    <Box
      display={'flex'}
      alignItems="center"
      gap={2}
      sx={{ m: 3, p: 2, bgcolor: `${'secondary.light'}` }}
    >
      {!hideMenu ? (
        <>
          <Icon icon="mdi:user" />

          <Box>
            <Typography variant="h6">{user?.username}</Typography>
            <Typography variant="caption">{user?.rolle}</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Logout" placement="top">
              <IconButton
                color="primary"
                component={Link}
                to="logout"
                aria-label="logout"
                size="small"
              >
                <Icon icon="tabler:power" size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : (
        ''
      )}
    </Box>
  );
};
