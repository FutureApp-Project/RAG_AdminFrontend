// src\pages\UserChatHistory.tsx
/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Box,
  CardContent,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  alpha,
  Avatar,
  IconButton,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Collapse,
  useTheme,
  Container,
  Stack,
  Fade
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import TodayIcon from '@mui/icons-material/Today';
import UpdateIcon from '@mui/icons-material/Update';
import HistoryIcon from '@mui/icons-material/History';
import ForumIcon from '@mui/icons-material/Forum';
// CORRECTED IMPORTS - These are default exports
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';

import PageTitle from "../components/PageTitle.tsx";
import { useApiQuery } from "../helpers/api.ts";
import AuthorizedPage from "../components/AuthorizedPage.tsx";
import ButtonGoBack from "../components/ButtonGoBack.tsx";
import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

// ---------- Types ----------
interface ChatMessage {
  id: string;
  chat_session_id: string;
  user_id: number;
  message_type: string;
  content: string;
  is_user: boolean;
  timestamp: string;
  response_source?: string;
  audio_url?: string;
  image_url?: string;
}

interface ChatSession {
  id: string;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  session_date: string | null;
  message_count: number;
  messages: ChatMessage[];
}

interface ChatHistoryResponse {
  status: string;
  user_id: number;
  sessions: ChatSession[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
  };
}

interface GroupedSessions {
  today: ChatSession[];
  yesterday: ChatSession[];
  earlier: ChatSession[];
}

// ---------- Helper ----------
const formatShortDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffDays = differenceInDays(now, date);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Gestern';
    if (diffDays < 7) return format(date, 'EEEE', { locale: de });
    return format(date, 'dd.MM.yyyy');
  } catch {
    return dateString;
  }
};

const truncateText = (text: string, maxLength = 80) =>
  text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

// ---------- Main Component ----------
export default function UserChatHistory() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({
    today: [],
    yesterday: [],
    earlier: []
  });

  const { isPending, error, data, refetch } = useApiQuery<ChatHistoryResponse>(
    `/chat/GetChatById/${userId}`
  );

  useEffect(() => {
    if (data?.sessions) {
      let sessions = data.sessions;
      if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase();
        sessions = sessions.filter(
          s =>
            s.title.toLowerCase().includes(lower) ||
            s.messages.some(m => m.content.toLowerCase().includes(lower))
        );
      }
      setFilteredSessions(sessions);

      const today: ChatSession[] = [];
      const yesterday: ChatSession[] = [];
      const earlier: ChatSession[] = [];

      sessions.forEach(session => {
        const date = session.session_date
          ? parseISO(session.session_date)
          : parseISO(session.created_at);
        if (isToday(date)) today.push(session);
        else if (isYesterday(date)) yesterday.push(session);
        else earlier.push(session);
      });

      setGroupedSessions({ today, yesterday, earlier });
    }
  }, [data, searchTerm]);

  const handleSessionClick = (id: string) =>
    setExpandedSession(expandedSession === id ? null : id);

  const handleViewSession = (id: string) => navigate(`/userchats/${userId}/${id}`);

  const getLastMessage = (session: ChatSession) => {
    if (session.messages.length === 0) return null;
    const last = session.messages[session.messages.length - 1];
    return {
      content: truncateText(last.content),
      isUser: last.is_user,
      time: formatShortDate(last.timestamp)
    };
  };

  // ---------- Session Card ----------
  const renderSessionCard = (session: ChatSession) => {
    const lastMessage = getLastMessage(session);
    const isExpanded = expandedSession === session.id;

    return (
      <Fade in timeout={300}>
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            borderRadius: 3,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.03)}`,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.06)}`,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              transform: 'translateY(-2px)'
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Header – always visible */}
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => handleSessionClick(session.id)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <ForumIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3, mb: 0.5 }}>
                    {session.title || 'Unbenanntes Gespräch'}
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip
                      size="small"
                      icon={<CalendarTodayIcon sx={{ fontSize: '0.9rem' }} />}
                      label={formatShortDate(session.created_at)}
                      variant="outlined"
                      sx={{
                        borderRadius: 1.5,
                        height: 28,
                        '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem', fontWeight: 500 },
                        borderColor: alpha(theme.palette.text.secondary, 0.2)
                      }}
                    />
                    <Chip
                      size="small"
                      icon={<MessageIcon sx={{ fontSize: '0.9rem' }} />}
                      label={`${session.message_count} Nachrichten`}
                      variant="outlined"
                      sx={{
                        borderRadius: 1.5,
                        height: 28,
                        '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem', fontWeight: 500 },
                        borderColor: alpha(theme.palette.text.secondary, 0.2)
                      }}
                    />
                  </Stack>
                </Box>
              </Box>
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  transform: isExpanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s'
                }}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            {/* Last message preview (when collapsed) */}
            {lastMessage && !isExpanded && (
              <Box sx={{ mt: 2.5, ml: 7 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}
                >
                  <UpdateIcon sx={{ fontSize: 14 }} />
                  Letzte Nachricht: {lastMessage.time}
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.grey[50], 0.6),
                    borderRadius: 2.5,
                    borderColor: alpha(theme.palette.divider, 0.1)
                  }}
                >
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box
                      component="span"
                      sx={{
                        fontWeight: 600,
                        color: lastMessage.isUser ? theme.palette.primary.main : theme.palette.secondary.main,
                        minWidth: 32
                      }}
                    >
                      {lastMessage.isUser ? 'Sie:' : 'KI:'}
                    </Box>
                    <Box component="span" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}>
                      {lastMessage.content}
                    </Box>
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Expanded message history */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Nachrichtenverlauf ({session.messages.length})
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleViewSession(session.id)}
                    sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
                  >
                    Vollständige Ansicht
                  </Button>
                </Box>
                <List sx={{ maxHeight: 360, overflow: 'auto', pr: 1 }}>
                  {session.messages.slice(-5).map(msg => (
                    <ListItem
                      key={msg.id}
                      alignItems="flex-start"
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 48 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: msg.is_user
                              ? alpha(theme.palette.primary.main, 0.12)
                              : alpha(theme.palette.secondary.main, 0.12),
                            color: msg.is_user ? theme.palette.primary.main : theme.palette.secondary.main
                          }}
                        >
                          {msg.is_user ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {msg.is_user ? 'Sie' : 'KI-Assistent'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatShortDate(msg.timestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: msg.is_user
                                ? alpha(theme.palette.primary.main, 0.04)
                                : alpha(theme.palette.grey[100], 0.6),
                              border: `1px solid ${alpha(
                                msg.is_user ? theme.palette.primary.main : theme.palette.divider,
                                0.1
                              )}`
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {msg.content}
                            </Typography>
                            
                            {/* FIXED: Image and audio previews with proper icons */}
                            {msg.message_type === 'image' && (
  <Box sx={{ mt: 1 }}>
    <Typography 
      variant="caption" 
      color="text.secondary" 
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontStyle: 'italic' }}
    >
      <ImageIcon sx={{ fontSize: 16 }} />
      Bild angehängt
    </Typography>
    {msg.image_url && (
      <Box
        component="img"
        src={msg.image_url}
        alt="Preview"
        sx={{
          mt: 1,
          maxWidth: '100%',
          maxHeight: 100,
          borderRadius: 1,
          cursor: 'pointer',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
        onClick={(e) => {
          e.stopPropagation();
          window.open(msg.image_url, '_blank');
        }}
      />
    )}
  </Box>
)}

{msg.message_type === 'audio' && (
  <Box sx={{ mt: 1 }}>
    <Typography 
      variant="caption" 
      color="text.secondary" 
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontStyle: 'italic', mb: 0.5 }}
    >
      <MicIcon sx={{ fontSize: 16 }} />
      Audio angehängt
    </Typography>
    {msg.audio_url && (
      <audio 
        controls 
        style={{ height: 32, maxWidth: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <source src={msg.audio_url} type="audio/mpeg" />
      </audio>
    )}
  </Box>
)}
                          </Box>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  ))}
                </List>
                {session.messages.length > 5 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                    + {session.messages.length - 5} weitere Nachrichten
                  </Typography>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Paper>
      </Fade>
    );
  };

  // ---------- Group Section ----------
  const renderGroup = (title: string, sessions: ChatSession[], icon: React.ReactNode, color: string) => {
    if (sessions.length === 0) return null;
    return (
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2.5,
            px: 2,
            py: 1.5,
            bgcolor: alpha(color, 0.04),
            borderRadius: 2,
            borderLeft: `4px solid ${color}`
          }}
        >
          <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {title}
          </Typography>
          <Chip
            label={sessions.length}
            size="small"
            sx={{ bgcolor: color, color: 'white', fontWeight: 600, height: 22, minWidth: 32 }}
          />
        </Box>
        {sessions.map(session => renderSessionCard(session))}
      </Box>
    );
  };

  // ---------- Main Render ----------
  return (
    <AuthorizedPage isPending={isPending} error={error}>
      <Box
        sx={{
          minHeight: '100vh',
          background: `radial-gradient(circle at 0% 30%, ${alpha(theme.palette.primary.light, 0.08)} 0%, transparent 50%),
                       radial-gradient(circle at 100% 70%, ${alpha(theme.palette.secondary.light, 0.08)} 0%, transparent 50%),
                       linear-gradient(135deg, ${alpha(theme.palette.background.default, 1)} 0%, ${alpha(theme.palette.grey[50], 0.8)} 100%)`,
          py: 5
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <ButtonGoBack to="/chat-history" />
            <Typography variant="body2" color="text.secondary">Benutzer-ID: {userId}</Typography>
          </Stack>

          <PageTitle title="Chat-Verlauf" subtitle={`${data?.sessions.length || 0} Gespräche gefunden`} />

          {/* Search & Filter */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Suche nach Gesprächen oder Nachrichten..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                            Löschen
                          </Typography>
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.common.white, 0.5) } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                  <Button startIcon={<RefreshIcon />} onClick={() => refetch()} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Aktualisieren
                  </Button>
                  <Button startIcon={<FilterListIcon />} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}>
                    Filter
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            {data?.pagination && (
              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                <Chip label={`Seite ${data.pagination.page} von ${Math.ceil(data.pagination.total / data.pagination.page_size)}`} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                <Chip label={`Insgesamt: ${data.pagination.total} Gespräche`} size="small" color="primary" variant="outlined" sx={{ borderRadius: 1.5 }} />
              </Stack>
            )}
          </Paper>

          {/* Content */}
          {isPending ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={48} thickness={4} sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : filteredSessions.length === 0 ? (
            <Paper sx={{ textAlign: 'center', py: 8, px: 3, borderRadius: 4, background: alpha(theme.palette.background.paper, 0.7), backdropFilter: 'blur(12px)', border: `1px dashed ${alpha(theme.palette.divider, 0.3)}` }}>
              <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.grey[500], 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <MessageIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.4) }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Keine Gespräche gefunden
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                {searchTerm ? `Keine Gespräche mit "${searchTerm}" gefunden.` : 'Dieser Benutzer hat noch keine Gespräche geführt.'}
              </Typography>
              {searchTerm && (
                <Button variant="outlined" onClick={() => setSearchTerm('')} sx={{ borderRadius: 2, textTransform: 'none' }}>
                  Suche zurücksetzen
                </Button>
              )}
            </Paper>
          ) : (
            <Box>
              {renderGroup('Heute', groupedSessions.today, <TodayIcon />, theme.palette.primary.main)}
              {renderGroup('Gestern', groupedSessions.yesterday, <UpdateIcon />, theme.palette.secondary.main)}
              {renderGroup('Ältere Gespräche', groupedSessions.earlier, <HistoryIcon />, theme.palette.warning.main)}
              {data?.pagination.has_next && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button variant="outlined" size="large" sx={{ borderRadius: 3, px: 5, py: 1.2, textTransform: 'none', borderWidth: 2 }}>
                    Mehr Gespräche laden
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Container>
      </Box>
    </AuthorizedPage>
  );
}