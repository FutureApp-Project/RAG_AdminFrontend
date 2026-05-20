/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import { NavLink } from "react-router";
import { useState } from "react";
import PageTitle from "../components/PageTitle.tsx";

import { useApiQuery } from "../helpers/api.ts";
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  TextField, 
  InputAdornment, 
  Button, 
  Chip,
  Skeleton,
  Divider,
  styled,
  alpha
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import MovieIcon from '@mui/icons-material/Movie';
import AuthorizedPage from "../components/AuthorizedPage.tsx";




const AnimatedCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.85),
  backdropFilter: "blur(12px)",
  borderRadius: "5px",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));


export default function Faq() {
  const { isPending, error, data } = useApiQuery<string[]>("/faq/GetAllFAQFiles");
  const [searchTerm, setSearchTerm] = useState("");

  // Geeignetes Icon für den Dateityp auswählen
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()!.toLowerCase();
    switch(ext) {
      case 'pdf': return <PictureAsPdfIcon color="error" fontSize="large" />;
      case 'doc':
      case 'docx': return <DescriptionIcon color="primary" fontSize="large" />;
      case 'xls':
      case 'xlsx': return <DescriptionIcon color="success" fontSize="large" />;
      case 'ppt':
      case 'pptx': return <SlideshowIcon color="warning" fontSize="large" />;
      case 'mp4':
      case 'mov': return <MovieIcon color="secondary" fontSize="large" />;
   
      default: return <InsertDriveFileIcon color="disabled" fontSize="large" />;
    }
  };


  const getDisplayName = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
  };

  const filteredData = data?.filter((filename) =>
    getDisplayName(filename).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthorizedPage isPending={isPending} error={error}>
      <PageTitle title="Frequently Asked Questions (FAQ)" />
      
      <Box sx={{ maxWidth: 1100, mx: 'auto', my: 4  ,    bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)', backdropFilter: 'blur(12px)' }}>
        <Card elevation={0} sx={(theme) => ({
          p: 4,
          background: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(12px)",
          borderRadius: "5px",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
        })}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            
            <Typography variant="subtitle1" color="text.secondary">
              Hier können Sie Schulungsunterlagen und Informationen zum Portal und Sensor herunterladen.
            </Typography>
          </Box>

          <TextField
            fullWidth
            placeholder="Dokumente durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 4 ,border: `1px solid rgba(0, 0, 0, 0.12)`, borderRadius: 1, backgroundColor: 'background.paper' }}
          />

          {isPending ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" height={150} />
                </Grid>
              ))}
            </Grid>
          ) : filteredData && (
            <Grid container spacing={3}>
              {filteredData.length > 0 ? (
                filteredData.map((filename, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <NavLink to={"/faq/" + filename} style={{ textDecoration: 'none' }}>
                      <AnimatedCard>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {getFileIcon(filename)}
                            <Chip
                              label={filename.split('.').pop()!.toUpperCase()}
                              size="small"
                              sx={{ ml: 'auto' }}
                            />
                          </Box>
                          <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                            {getDisplayName(filename)}
                          </Typography>
                          <Box sx={{ mt: 'auto', pt: 2, display: 'flex', alignItems: 'center' }}>
                            <DownloadIcon color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Herunterladen
                            </Typography>
                          </Box>
                        </CardContent>
                      </AnimatedCard>
                    </NavLink>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                    Keine Dokumente gefunden, die Ihrer Suche entsprechen.
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}

          <Divider sx={{ my: 6 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Benötigen Sie weitere Hilfe?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Unser Support-Team steht Ihnen gerne zur Verfügung
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              startIcon={<EmailIcon />}
              component="a"
              href="mailto:info@futureapp.de"
              sx={{
                '&:hover': { backgroundColor: 'primary.main'  ,color:"white"  },
              }}
            >
              Support kontaktieren
            </Button>
          </Box>
        </Card>
      </Box>
    </AuthorizedPage>
  );
}