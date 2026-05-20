/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Button,
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  alpha,
  useTheme,
  Stack,
  Chip,
  Fade,
  Zoom
} from "@mui/material";
import config from "../config.ts";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import SmartToyIcon from '@mui/icons-material/SmartToy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ForumIcon from '@mui/icons-material/Forum';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { useApiQuery } from "../helpers/api.ts";
import AuthorizedPage from "../components/AuthorizedPage.tsx";
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { de } from 'date-fns/locale';


// ---------- Types ----------
interface ChatMessage {
  id: string;
  chat_session_id: string;
  user_id: number;
  message_type: "text" | "image" | "audio";
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

// ---------- Helpers ----------
const formatTime = (ts: string) => {
  try {
    return format(parseISO(ts), 'HH:mm');
  } catch {
    return '';
  }
};

const formatHeaderDate = (ds: string) => {
  try {
    const d = parseISO(ds);
    if (isToday(d)) return 'Heute';
    if (isYesterday(d)) return 'Gestern';
    return format(d, 'dd. MMMM yyyy', { locale: de });
  } catch {
    return ds;
  }
};

// Helper to get full URL
const getFullUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${config.BASE_URL}${url}`;
};

// ---------- Message Bubble Component ----------
const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const theme = useTheme();
  const isUser = message.is_user;
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [audioError, setAudioError] = useState(false);

  const fullImageUrl = getFullUrl(message.image_url);
  const fullAudioUrl = getFullUrl(message.audio_url);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        mb: 2.5,
        maxWidth: '85%',
        ml: isUser ? 'auto' : 0,
        mr: isUser ? 0 : 'auto'
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, px: 1 }}>
        <Typography variant="caption" fontWeight={600} color={isUser ? 'primary.main' : 'secondary.main'}>
          {isUser ? 'Sie' : 'KI-Assistent'}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {formatTime(message.timestamp)}
        </Typography>
        {!isUser && message.response_source && (
          <Chip
            label={message.response_source}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.dark,
              '& .MuiChip-label': { px: 1 }
            }}
          />
        )}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          bgcolor: isUser
            ? alpha(theme.palette.primary.main, 0.12)
            : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(
            isUser ? theme.palette.primary.main : theme.palette.divider,
            0.15
          )}`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.02)}`,
          maxWidth: '100%',
          wordBreak: 'break-word'
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {message.content}
        </Typography>

        {/* Image Attachment */}
        {message.message_type === 'image' && message.image_url && (
          <Box sx={{ mt: 1.5, position: 'relative' }}>
            {/* Loading State */}
            {imageLoading && !imageError && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 200, 
                width: '100%',
                bgcolor: alpha(theme.palette.grey[100], 0.5),
                borderRadius: 2
              }}>
                <CircularProgress size={40} />
              </Box>
            )}
            
            {/* Error State */}
            {imageError ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 150, 
                width: '100%',
                bgcolor: alpha(theme.palette.error.main, 0.05),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`,
                p: 2
              }}>
                <BrokenImageIcon sx={{ fontSize: 40, color: alpha(theme.palette.error.main, 0.5), mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Bild konnte nicht geladen werden
                </Typography>
              </Box>
            ) : (
              <Box
                component="img"
                src={fullImageUrl}
                alt="Bild"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                  console.error('Failed to load image:', fullImageUrl);
                }}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 300,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  display: imageLoading ? 'none' : 'block',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={() => window.open(fullImageUrl, '_blank')}
              />
            )}
            
            <Chip
              icon={<ImageIcon />}
              label="Bild"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: alpha(theme.palette.common.black, 0.6),
                color: 'white',
                backdropFilter: 'blur(4px)',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Box>
        )}

        {/* Audio Attachment */}
        {message.message_type === 'audio' && message.audio_url && (
          <Box sx={{ 
            mt: 1.5, 
            p: 2, 
            bgcolor: alpha(theme.palette.grey[900], 0.05), 
            borderRadius: 2,
            border: audioError ? `1px dashed ${alpha(theme.palette.error.main, 0.3)}` : 'none'
          }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <MicIcon fontSize="small" color={audioError ? 'error' : 'action'} />
              <Typography variant="caption" color={audioError ? 'error' : 'text.secondary'}>
                {audioError ? 'Audio konnte nicht geladen werden' : 'Audio-Nachricht'}
              </Typography>
              {!audioError && (
                <audio 
                  controls 
                  style={{ height: 32, maxWidth: '100%', marginLeft: 'auto' }}
                  onError={() => {
                    setAudioError(true);
                    console.error('Failed to load audio:', fullAudioUrl);
                  }}
                >
                  <source src={fullAudioUrl} type="audio/mpeg" />
                  Ihr Browser unterstützt das Audio-Element nicht.
                </audio>
              )}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// ---------- Main Component ----------
export default function UserFullChatHistory() {
  const { userId, sessionId } = useParams<{ userId: string; sessionId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { isPending, error, data } = useApiQuery<ChatSession>(
    `/chat/sessions/${sessionId}`
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isPending) {
    return (
      <AuthorizedPage isPending={true} error={null}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress size={56} thickness={4} sx={{ color: theme.palette.primary.main }} />
        </Box>
      </AuthorizedPage>
    );
  }

  if (error || !data) {
    return (
      <AuthorizedPage isPending={false} error={error}>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(12px)',
              border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`
            }}
          >
            <ForumIcon sx={{ fontSize: 64, color: alpha(theme.palette.error.main, 0.5), mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Chat nicht gefunden
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Die angeforderte Unterhaltung existiert nicht oder Sie haben keine Berechtigung.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/userchat/${userId}`)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Zurück zur Übersicht
            </Button>
          </Paper>
        </Container>
      </AuthorizedPage>
    );
  }

  const session = data;
  const userCount = session.messages.filter(m => m.is_user).length;
  const aiCount = session.messages.length - userCount;

  return (
    <AuthorizedPage isPending={false} error={null}>
      <Box
        sx={{
          minHeight: '100vh',
          background: `radial-gradient(circle at 0% 30%, ${alpha(theme.palette.primary.light, 0.06)} 0%, transparent 50%),
                       radial-gradient(circle at 100% 70%, ${alpha(theme.palette.secondary.light, 0.06)} 0%, transparent 50%),
                       linear-gradient(135deg, ${alpha(theme.palette.background.default, 1)} 0%, ${alpha(theme.palette.grey[50], 0.9)} 100%)`,
          py: 4
        }}
      >
        <Container maxWidth="lg">
          {/* Header with back button */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={() => navigate(`/userchat/${userId}`)}
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(8px)',
                  borderRadius: 2,
                  '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.9) }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                Zurück zur Übersicht
              </Typography>
            </Stack>
            <Chip 
              label={`Benutzer-ID: ${userId}`} 
              size="small" 
              variant="outlined" 
              sx={{ borderRadius: 1.5 }} 
            />
          </Stack>

          {/* Main Chat Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.75),
              backdropFilter: 'blur(16px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.04)}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 160px)',
              minHeight: 600
            }}
          >
            {/* Session Header */}
            <Box
              sx={{
                p: 3,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                background: alpha(theme.palette.background.paper, 0.5)
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <ForumIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                    {session.title || 'Unbenanntes Gespräch'}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarTodayIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatHeaderDate(session.created_at)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <AccessTimeIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        {format(parseISO(session.created_at), 'HH:mm', { locale: de })} Uhr
                      </Typography>
                    </Stack>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`${session.messages.length} Nachrichten`}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.08),
                        color: theme.palette.success.dark,
                        fontWeight: 500,
                        borderRadius: 1.5
                      }}
                    />
                    <Chip label={`${userCount} von Ihnen`} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                    <Chip label={`${aiCount} von KI`} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 3,
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: alpha(theme.palette.grey[50], 0.3)
              }}
              onScroll={handleScroll}
            >
              {session.messages.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <SmartToyIcon sx={{ fontSize: 64, color: alpha(theme.palette.text.disabled, 0.3), mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Noch keine Nachrichten in diesem Gespräch
                  </Typography>
                </Box>
              ) : (
                <>
                  {session.messages.map(msg => (
                    <Fade in timeout={300} key={msg.id}>
                      <div>
                        <MessageBubble message={msg} />
                      </div>
                    </Fade>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Scroll to bottom button */}
            <Zoom in={showScrollButton}>
              <IconButton
                onClick={scrollToBottom}
                sx={{
                  position: 'absolute',
                  bottom: 24,
                  right: 32,
                  bgcolor: alpha(theme.palette.primary.main, 0.9),
                  color: 'white',
                  backdropFilter: 'blur(8px)',
                  boxShadow: theme.shadows[4],
                  '&:hover': { bgcolor: theme.palette.primary.main },
                  width: 44,
                  height: 44
                }}
              >
                <ArrowBackIcon sx={{ transform: 'rotate(90deg)' }} />
              </IconButton>
            </Zoom>
          </Paper>

          {/* Session Footer */}
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.5),
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.06)}`
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Session-ID: {session.id}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Letzte Aktivität: {format(parseISO(session.updated_at), 'dd.MM.yyyy HH:mm', { locale: de })}
              </Typography>
              {session.session_date && (
                <Chip
                  label={`Sitzungsdatum: ${format(parseISO(session.session_date), 'dd.MM.yyyy')}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 1.5 }}
                />
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>
    </AuthorizedPage>
  );
}