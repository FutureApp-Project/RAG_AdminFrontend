
import React, { useRef, useState } from "react";
import { Box, Card, CardContent, Typography, LinearProgress, Button, Divider, alpha } from "@mui/material";
import { useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext.tsx";
import config from "../config.ts";
import PageTitle from "../components/PageTitle.tsx";
import AuthorizedPage from "../components/AuthorizedPage.tsx";


export default function Upload() {
	const { token } = React.useContext(AuthContext);
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
			setError(null);
			setSuccess(null);
		}
	};

	const handleUpload = async () => {
		if (!file) {
			setError("Bitte wählen Sie eine PDF-Datei aus.");
			return;
		}
		setUploading(true);
		setProgress(0);
		setError(null);
		setSuccess(null);
		try {
			const formData = new FormData();
			formData.append("file", file);
			const xhr = new XMLHttpRequest();
			const baseUrl = config.BASE_URL.replace(/\/+$/, "");
			xhr.open("POST", `${baseUrl}/upload/pdf`);
			xhr.setRequestHeader("Authorization", `Bearer ${token}`);
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					setProgress(Math.round((event.loaded / event.total) * 100));
				}
			};
			xhr.onload = () => {
				setUploading(false);
				if (xhr.status === 200) {
					setSuccess("Datei erfolgreich hochgeladen.");
					setFile(null);
					setProgress(100);
					setTimeout(() => navigate(-1), 1500);
				} else {
					let backendMessage = xhr.responseText;
					try {
						const parsed = JSON.parse(xhr.responseText);
						backendMessage = parsed?.detail || parsed?.message || xhr.statusText || xhr.responseText;
					} catch {
						backendMessage = xhr.statusText || xhr.responseText;
					}
					setError(`Fehler beim Hochladen: ${backendMessage}`);
				}
			};
			xhr.onerror = () => {
				setUploading(false);
				setError("Netzwerkfehler beim Hochladen.");
			};
			xhr.send(formData);
		} catch (e: any) {
			setUploading(false);
			setError("Unerwarteter Fehler beim Hochladen.");
		}
	};

	return (
		<AuthorizedPage>
			<PageTitle title="PDF hochladen" />
			<Box sx={{ maxWidth: 500, mx: 'auto', my: 4, bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)', backdropFilter: 'blur(12px)' }}>
				<Card elevation={0} sx={(theme) => ({
					p: 4,
					background: alpha(theme.palette.background.paper, 0.85),
					backdropFilter: "blur(12px)",
					borderRadius: "5px",
					border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
					boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
				})}>
					<CardContent>
						<Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 3 }}>
							Bitte wählen Sie eine PDF-Datei aus und laden Sie sie hoch.
						</Typography>
						<input
							ref={inputRef}
							type="file"
							accept="application/pdf"
							style={{ display: "none" }}
							onChange={handleFileChange}
						/>
						<Button
							variant="outlined"
							fullWidth
							sx={{ mb: 2, fontWeight: 600, borderRadius: 2 }}
							onClick={() => inputRef.current?.click()}
							disabled={uploading}
						>
							Datei auswählen
						</Button>
						{file && (
							<Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
								Ausgewählt: {file.name}
							</Typography>
						)}
						<Button
							variant="contained"
							color="primary"
							fullWidth
							sx={{ fontWeight: 600, borderRadius: 2, mb: 2 }}
							onClick={handleUpload}
							disabled={uploading || !file}
						>
							Hochladen
						</Button>
						{uploading && (
							<Box sx={{ mt: 2 }}>
								<LinearProgress variant="determinate" value={progress} />
								<Typography variant="caption" display="block" align="center">{progress}%</Typography>
							</Box>
						)}
						{error && (
							<Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>
						)}
						{success && (
							<Typography color="primary" sx={{ mt: 2, textAlign: 'center' }}>{success}</Typography>
						)}
						<Divider sx={{ my: 4 }} />
						<Box sx={{ textAlign: 'center' }}>
							<Typography variant="body2" color="text.secondary">
								Nur PDF-Dateien werden akzeptiert.
							</Typography>
						</Box>
					</CardContent>
				</Card>
			</Box>
		</AuthorizedPage>
	);
}
