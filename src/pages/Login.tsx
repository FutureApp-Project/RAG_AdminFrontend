import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Paper,
  styled,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import Page from "../components/Page.tsx";
import config from "../config.ts";
import { AuthContext } from "../context/AuthContext.tsx";
import { useApiMutation } from "../helpers/api.ts";
import type UserDto from "../models/UserDto.ts";
import { defaultUserDto } from "../models/UserDto.ts";


const LoginContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 400,
  padding: theme.spacing(4),
  borderRadius: "5px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
    padding: theme.spacing(3),
    marginInline: theme.spacing(2),
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: "white",
  borderRadius: "5px",
  padding: theme.spacing(1.5),
  fontSize: "1rem",
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "none",
  "&:hover": {
    background: "theme.palette.primary.main",
    boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
  },
  "&:disabled": {
    background: "rgba(255, 255, 255, 0.2)",
  },
}));

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserDto>({
    defaultValues: defaultUserDto,
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const mutation = useApiMutation("/auth/login", true);
  const { token, setToken, user, setUser } = React.useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    
    if (mutation.isSuccess) {
      setToken(mutation.data.token);
      setUser(mutation.data.user);
    }
  }, [
    mutation.isSuccess,
    mutation.data?.token,
    mutation.data?.user,
    setToken,
    setUser,
  ]);

  React.useEffect(() => {
    if (token && user) {
      localStorage.setItem(
        "authData",
        JSON.stringify({
          token,
          user,
        })
      );
      navigate("/");
    }
  }, [token, user, navigate]);
const onSubmit = React.useCallback((data: UserDto) => {
  // Send only username and password to backend
  const loginData = {
    username: data.username,
    password: data.password
  };

  mutation.mutate(loginData);
}, [mutation]);
  const errorText = "Bitte prüfen Sie Benutzername und Passwort!";

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <Page isPending={mutation.isPending} error={null}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #F5F7FA 0%, #E4E8EB 100%)",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <LoginContainer>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 600,
                mb: 2,
                letterSpacing: 1,
                whiteSpace: "pre-line",
                fontSize: { xs: "1.4rem", sm: "1.6rem" },
              }}
            >
              {config.WELCOME_MESSAGE.replace(/\\n/g, "\n")}
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ mb: 1, color: "text.primary" }}
            >
              {config.CLINIC_NAME}
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ mb: 1, color: "text.secondary" }}
            >
              Anmeldung mit Login-Daten
            </Typography>

            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="username"
              label="Benutzername"
              {...register("username", { required: true })}
              error={!!errors.username}
              sx={{
                "& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
                  transform: "translate(14px, 10px) scale(1)",
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    // borderColor: "#007AFF",
                    // boxShadow: "0 0 0 2px rgba(0, 122, 255, 0.2)",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              id="password"
              label="Passwort"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: true })}
              error={!!errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
                  transform: "translate(14px, 10px) scale(1)",
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    // borderColor: '#007AFF',
                    //boxShadow: '0 0 0 2px rgba(0, 122, 255, 0.2)',
                  },
                },
              }}
            />

            {mutation.error || errors.username || errors.password ? (
              <Typography color="error" align="center" sx={{ mt: 1, mb: 2 }}>
                {errorText}
              </Typography>
            ) : null}

            <Box sx={{ mt: 3 }}>
              <GradientButton
                fullWidth
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                Anmelden
              </GradientButton>
            </Box>
            <Typography
              variant="body2"
              align="center"
              sx={{ m: 2, letterSpacing: 1, color: "text.secondary" }}
            >
              Copyright © {new Date().getFullYear()} FutureApp Solutions GmbH
            </Typography>
          </form>
        </LoginContainer>
      </Box>
    </Page>
  );
}
