import {deDE} from "@mui/x-date-pickers/locales";
import { useQueryClient } from "@tanstack/react-query";
import {
	useEffect,
	type ReactNode,
} from "react";
import {
	Controller,
	type Path,
	useForm,
	type ArrayPath,
	type PathValue,
	type UseFormReturn,
} from "react-hook-form";
import {
	Box,
	Grid,
	TextField,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	FormHelperText,
	Switch,
	FormControlLabel,
	Typography,
	Autocomplete,
	Chip,
} from "@mui/material";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/de";
import { useApiMutation, useApiQuery } from "../helpers/api.ts";
import { createSubmitHandler } from "../helpers/form.ts";
import styles from "../styles/Popup.module.css";


import Page from "./Page.tsx";
import Popup from "./Popup.tsx";
import OneToManyMapper from "./OneToManyMapper.tsx";


export interface OptionDefinition {
	id: number | string;
	name: string;
}

export type OptionValue = { value: number; label: string };

export interface FieldDefinition<T extends object> {
	propertyKey?: {
		[K in keyof T]: T[K] extends ReactNode | object[] ? K : never;
	}[keyof T] & string;
	group?: string;
	emptySpace?: boolean;
	spanTwoColumns?: boolean;
	label?: string;
	required?: true | string;
	maxLength?: number;
	type?: string;
	options?: OptionDefinition[];
	disable?: (watched: Record<string, string | number>) => boolean;
	disableEditing?: boolean;
	multiListData?: OptionValue[];
	leftData?: OptionValue[];
	rightData?: OptionValue[];
	leftField?: string;
	rightField?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	createDto?: (leftValue: OptionValue) => any;
	addButtonLabel?: string;
	selectPlaceholder?: string;
	watch?: boolean;
	validate?: (
		value: string | number,
		watched: Record<string, string | number>
	) => boolean | string;
	showIf?: (watched: Record<string, string | number>) => boolean;
	setValue?: (
		watched: Record<string, string | number>,
		setValue: (value: string | number) => void
	) => void;
	renderCustom?: (context: {
		form: UseFormReturn<T>;
		formDisabled: boolean;
		isEditForm: boolean;
		watched: Record<string, PathValue<T, Path<T>>>;
	}) => ReactNode;
}

interface PopupFormBase<T extends object> {
	name: string;
	endpoint?: string;
	fields: FieldDefinition<T>[] | ((dto: T) => FieldDefinition<T>[]);
	isOpen: boolean;
	adjustData?: (dto: T) => void;
	onClose: () => void;
	onSave?: (dto: T) => void;
	defaultDto?: T;
	twoColumns?: boolean;
	duplicateError?: string;
	errorProperty?: keyof T;
	isSelectForm?: boolean;
	idColumn?: keyof T;
	plural?: boolean;
}

interface PopupFormSelect<T extends object> extends PopupFormBase<T> {
	isSelectForm?: true;
	defaultDto: T;
	endpoint?: never;
	dto?: never;
	id?: never;
	getEndpoint?: never;
	idColumn?: never;
}

interface PopupFormCreate<T extends object> extends PopupFormBase<T> {
	endpoint: string;
	defaultDto: T;
	dto?: never;
	id?: never;
	getEndpoint?: string;
}

interface PopupFormWithDto<T extends object> extends PopupFormBase<T> {
	endpoint: string;
	dto: T;
	id?: never;
	getEndpoint?: never;
}

interface PopupFormWithEndpoint<T extends object> extends PopupFormBase<T> {
	endpoint: string;
	dto?: never;
	id: number;
	getEndpoint: string;
}

/**
 * PopupForm is a generic modal form component for creating and editing entities.
 * It supports dynamic field definitions, validation, and integration with API endpoints.
 * Used for all entity creation/editing dialogs throughout the application.
 * @param name The name/title of the form
 * @param endpoint API endpoint for saving data
 * @param fields Field definitions for the form
 * @param defaultDto Default data object
 * @param dto Data object for editing
 * @param idColumn Unique identifier column
 * @param getEndpoint API endpoint for fetching data for editing
 * @param isOpen Whether the popup is open
 * @param onClose Callback for closing the popup
 * @param onSave Callback after saving
 * @param twoColumns Whether to use a two-column layout
 * @param duplicateError Error message for duplicates
 * @param errorProperty Property that can contain the error text for display
 */
export default function PopupForm<T extends object>(
	{
		name,
		endpoint,
		fields,
		defaultDto,
		dto: initialDto,
		idColumn,
		id,
		getEndpoint,
		isOpen,
		adjustData,
		onClose,
		onSave,
		duplicateError,
		errorProperty,
		isSelectForm,
		plural = false,
	}: PopupFormCreate<T> | PopupFormWithDto<T> | PopupFormWithEndpoint<T> | PopupFormSelect<T>
) {
	const isEditForm = !!(initialDto || (id && getEndpoint));
	const form = useForm<T>();
	const query = useApiQuery<T>(`${getEndpoint}/${id ?? -1}`, {
		enabled: !!(isOpen && getEndpoint),
	});

	let dto = initialDto;
	console.log("PopupForm - initialDto:", initialDto, "query.data:", query.data, "defaultDto:", defaultDto);
	if (query.data) {
		dto = query.data;
		adjustData?.(dto);
	}
	dto = { ...(defaultDto as object), ...(dto as object) } as T;
	console.log("PopupForm - merged dto:", dto);
	for (const key in defaultDto) {
		const dtoValue = dto[key];
		const isEmptyString = typeof dtoValue === 'string' && dtoValue.trim() === '';
		if (
			(!dtoValue || isEmptyString) &&
			dtoValue !== false &&
			defaultDto[key] !== null &&
			defaultDto[key] !== undefined
		) {
			dto[key] = defaultDto[key];
		}
	}
	if (!isEditForm && idColumn) {
		dto[idColumn] = -1 as never;
	}

	const stripTimeFromDate = (value: unknown) => {
		if (typeof value !== "string") {
			return value;
		}
		const [datePart] = value.split("T");
		return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : value;
	};

	if (typeof fields === "function") {
		fields = fields(dto ?? ({} as T));
	}

	const mutation = useApiMutation(endpoint ?? "");
	const queryClient = useQueryClient();
	useEffect(() => {
		if (isOpen && query.isSuccess) {
			query.refetch();
		}
	}, [isOpen]);
	useEffect(() => {
		if (dto) {
			for (const field of fields) {
				if (field.type === "date" && field.propertyKey) {
					dto[field.propertyKey] = stripTimeFromDate(dto[field.propertyKey]) as never;
				}
			console.log("PopupForm - form.reset with dto:", dto);
			}
			form.reset(dto);
		}
		mutation.reset();
	}, [isOpen, query.isSuccess]);
	useEffect(() => {
		if (mutation.status === "success") {
			console.log("PopupForm - mutation success, data:", mutation.data);
			queryClient.invalidateQueries();
		}
	}, [mutation.status]);
	
	useEffect(() => {
		if (mutation.error) {
			console.error("PopupForm - mutation error:", mutation.error);
		}
	}, [mutation.error]);

	const onSubmit = createSubmitHandler(dto ?? {}, isSelectForm ? () => {} : mutation.mutate, onSave);
	console.log("PopupForm - onSubmit handler created with dto:", dto);
	const formDisabled = !!getEndpoint && (query.isPending || !!query.error || !query.data);

	const DUPLICATE_ERROR = -12121;
	let errorText = "";
	const mutationDataId: number = mutation.data?.[idColumn ?? "id"] ?? -Infinity;
	if (mutationDataId === 0) {
		errorText = mutation.data[errorProperty] ?? "";
	} else if (mutationDataId === DUPLICATE_ERROR) {
		errorText =
			duplicateError || "Das ist ein Duplikat. Bitte überprüfen Sie die Angaben.";
	}
	const error =
		mutation.error ??
		((mutation.isSuccess && mutationDataId < 0 && mutationDataId !== DUPLICATE_ERROR) ||
		(mutation.isSuccess && mutationDataId === 0 && !errorText)
			? new Error(`Unknown returned id ${mutationDataId}.`)
			: null);

	const formErrors = form.formState.errors;
	const getError = (field: FieldDefinition<T>) => formErrors[field.propertyKey as keyof typeof form.formState.errors]!;

	const watched: Record<string, PathValue<T, Path<T>>> = {};
	for (const field of fields) {
		if (field.watch) {
			const key = field.propertyKey as unknown as Path<T>;
			watched[key as string] = form.watch(key);
		}
	}

	useEffect(() => {
		for (const field of fields) {
			field.setValue?.(watched, (value: string | number) =>
				form.setValue(field.propertyKey as unknown as Path<T>, value as PathValue<T, Path<T>>)
			);
		}
	}, [watched]);

	if (!isOpen) {
		return null;
	}

	const gridWidth = { xs: 12, sm: 12 } as const;

	return (
		<LocalizationProvider
			dateAdapter={AdapterDayjs}
			adapterLocale="de"
			localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
		>
			<Popup
				title={
					mutation.isSuccess
						? ""
						: `${name} ${isSelectForm ? "auswählen" : isEditForm ? "bearbeiten" : "anlegen"}`
				}
				isOpen={isOpen}
				onClose={() => {
					if (mutation.isSuccess && errorText) {
						errorText = "";
						mutation.reset();
					} else {
						onClose();
					}
				}}
				onButtonClick={form.handleSubmit(onSubmit)}
				disableClosingOnOverlayClick
				fullWidth
				maxWidth={fields.some(field => field.type == "editor") && !errorText && mutation.isIdle ? "xl" : "sm"}
				buttonText="Speichern"
				buttonDisabled={formDisabled || form.formState.isSubmitting}
				okInsteadOfCancel={mutation.isSuccess}
				firstButtonText={errorText ? "Zurück" : undefined}
				isButtonVisible={mutation.isIdle}
			>
				<Page isPending={mutation.isPending} error={error}>
				{errorText && (
					<Typography color="error" sx={{ mb: 2 }}>
						{errorText}
					</Typography>
				)}
				{mutation.isSuccess && !errorText && (
					<Typography sx={{ mb: 2 }}>
						{`${name.replace("Neuen", "Neuer")} ${plural ? "wurden" : "wurde"} erfolgreich ${
							isEditForm ? "aktualisiert" : "hinzugefügt"
						}.`}
					</Typography>
				)}
				{mutation.isIdle && (
					<Box mt={1} component="form" onSubmit={form.handleSubmit(onSubmit)}>
						<Grid container spacing={2} className={styles.popupFormGrid}>
							{fields
								.filter((field) => !field.showIf || field.showIf(watched))
								.map((field, index) => {
									const label = <>
										{field.label}
										{field.required && <span style={{ color: "red" }}> *</span>}
									</>;
									if (field.emptySpace) {
										return <Grid key={index} item xs={12} sm={12} />;
									}

									if (field.group !== undefined) {
										return (
											<Grid key={index} item xs={12} sm={12}>
												<Typography variant="h6" sx={{ my: 1 }}>
													{field.group}
												</Typography>
											</Grid>
										);
									}

									// Define isTextarea here
									const isTextarea = field.type === "textarea";
									const textFieldInputProps =
										field.type === "number" ? { min: 1, step: 1 } : undefined;

									// Always vertical layout - each field in its own row
									return (
										<Grid key={index} item {...gridWidth}>
											{/* Checkbox / Switch */}
											{field.type === "checkbox" && field.propertyKey && (
												<Controller
													name={field.propertyKey as unknown as Path<T>}
													control={form.control}
													rules={field.required ? { required: field.required } : {}}
													render={({ field: ctrField }) => (
														<FormControlLabel
															control={
																<Switch
																	{...ctrField}
																	checked={!!ctrField.value}
																	disabled={
																		formDisabled ||
																		field.disable?.(watched) ||
																		(field.disableEditing && isEditForm)
																	}
																/>
															}
															label={label}
														/>
													)}
												/>
											)}

											{/* Multi‑select list */}
											{field.propertyKey && field.multiListData && (
												<Controller
													name={field.propertyKey as unknown as Path<T>}
													control={form.control}
													rules={field.required ? { required: field.required } : {}}
													render={({ field: ctrField }) => (
														<Autocomplete
															multiple
															options={field.multiListData!}
															getOptionLabel={(option) => option.label}
															isOptionEqualToValue={(o, v) => o.value === v.value}
															value={field.multiListData!.filter((o) =>
																(ctrField.value as number[]).includes(o.value)
															)}
															onChange={(_, selected) => {
																const ids = selected.map((opt) => opt.value);
																ctrField.onChange(ids);
															}}
															renderTags={(value, getTagProps) =>
																value.map((option, idx) => (
																	<Chip label={option.label} {...getTagProps({ index: idx })} />
																))
															}
															renderInput={(params) => (
																<TextField
																	{...params}
																	label={label}
																	variant="outlined"
																	error={!!getError(field)}
																	helperText={getError(field)?.message as string}
																	disabled={
																		formDisabled ||
																		field.disable?.(watched) ||
																		(field.disableEditing && isEditForm)
																	}
																	InputLabelProps={{ shrink: true }}
																/>
															)}
														/>
													)}
												/>
											)}

											{/* One‑to‑Many mapper */}
											{field.propertyKey &&
												field.type === "oneToMany" &&
												field.leftData &&
												field.rightData &&
												field.leftField &&
												field.rightField &&
												field.createDto && (
													<OneToManyMapper
														leftData={field.leftData}
														rightData={field.rightData}
														leftField={field.leftField as ArrayPath<T>}
														rightField={field.rightField as ArrayPath<T>}
														propertyKey={field.propertyKey as ArrayPath<T>}
														control={form.control}
														createDto={field.createDto}
														addButtonLabel={field.addButtonLabel}
														selectPlaceholder={field.selectPlaceholder}
													/>
												)}

											{/* Date picker */}
											{field.propertyKey && field.type === "datePicker" && (
												<Controller
													name={field.propertyKey as unknown as Path<T>}
													control={form.control}
													rules={{
														...(field.required ? { required: field.required } : {}),
													}}
													render={({ field: ctrl }) => {
														const isDisabled =
															formDisabled ||
															field.disable?.(watched) ||
															(field.disableEditing && isEditForm);
														const fieldError = getError(field);
														const helperText =
															(fieldError?.message as string) ||
															(fieldError?.type === "required"
																? "Dieses Feld ist erforderlich!"
																: undefined);

														const value =
															typeof ctrl.value === "string" && ctrl.value
																? dayjs(ctrl.value)
																: null;

														return (
															<DatePicker
																label={label}
																value={value}
																onChange={(newValue) =>
																	ctrl.onChange(
																		newValue ? newValue.format("YYYY-MM-DD") : ""
																	)
																}
																disabled={isDisabled}
																slotProps={{
																	textField: {
																		fullWidth: true,
																		error: !!fieldError,
																		helperText,
																	},
																}}
															/>
														);
													}}
												/>
											)}

											{/* Time picker */}
											{field.propertyKey && field.type === "timePicker" && (
												<Controller
													name={field.propertyKey as unknown as Path<T>}
													control={form.control}
													rules={{
														...(field.required ? { required: field.required } : {}),
														...(field.validate
															? {
																validate: (value: string) =>
																	field.validate?.(value, watched),
															}
															: {}),
													}}
													render={({ field: ctrl }) => {
														const isDisabled =
															formDisabled ||
															field.disable?.(watched) ||
															(field.disableEditing && isEditForm);
														const fieldError = getError(field);
														const helperText =
															(fieldError?.message as string) ||
															(fieldError?.type === "required"
																? "Dieses Feld ist erforderlich!"
																: undefined);

														const value =
															typeof ctrl.value === "string" && ctrl.value
																? dayjs(`1970-01-01T${ctrl.value}`)
																: null;

														return (
															<TimePicker
																label={label}
																value={value}
																onChange={(newValue) =>
																	ctrl.onChange(
																		newValue ? newValue.format("HH:mm:ss") : ""
																	)
																}
																disabled={isDisabled}
																ampm={false}
																format="HH:mm"
																slotProps={{
																	textField: {
																		fullWidth: true,
																		error: !!fieldError,
																		helperText,
																	},
																}}
															/>
														);
													}}
												/>
											)}

											{/* Standard input field */}
											{field.propertyKey &&
												!field.multiListData &&
												!["select", "checkbox", "oneToMany", "editor", "datePicker", "timePicker"].includes(field.type ?? "") && (
													<TextField
														{...form.register(field.propertyKey as unknown as Path<T>, {
															required: field.required,
															maxLength: field.maxLength,
															valueAsNumber: field.type == "number" ? true : undefined,
															min: field.type == "number" ? { value: 1, message: "Der Minimalwert ist 1." } : undefined,
															validate: field.validate
																? (value) => field.validate?.(value, watched)
																: (field.type == "number" ? (value => Number.isSafeInteger(value) || "Bitte geben sie eine Zahl an.") : undefined),
														})}
														label={label}
														type={isTextarea ? undefined : field.type}
														variant="outlined"
														multiline={isTextarea}
														minRows={isTextarea ? 3 : undefined}
														maxRows={isTextarea ? 3 : undefined}
														fullWidth
														error={!!getError(field)}
														helperText={
															getError(field)?.message as string ||
															(getError(field)?.type === "required"
																? "Dieses Feld ist erforderlich!"
																: getError(field)?.type === "maxLength"
																	? `Maximal ${field.maxLength} Zeichen für das Feld ${field.label} erlaubt.`
																	: undefined)
														}
														inputProps={textFieldInputProps}
														disabled={
															formDisabled ||
															field.disable?.(watched) ||
															(field.disableEditing && isEditForm)
														}
														InputLabelProps={{ shrink: true }}
													/>
												)}

											{/* Select field */}
											{field.propertyKey &&
												!field.multiListData &&
												field.type === "select" && (
													<Controller
														name={field.propertyKey as unknown as Path<T>}
														control={form.control}
														rules={{validate: v => field.required && !v ? `Bitte ${field.label} auswählen.` : true}}
														render={({ field: ctrl }) => (
															<FormControl
																fullWidth
																error={!!getError(field)}
																disabled={
																	formDisabled ||
																	field.disable?.(watched) ||
																	(field.disableEditing && isEditForm)
																}
															>
																<InputLabel shrink>
																	{field.label}
																	{field.required && " *"}
																</InputLabel>

																<Select notched={true} label={label} {...ctrl}>
																	{field.options?.map(option => (
																		<MenuItem
																			key={option.id}
																			disabled={!option.id}
																			value={option.id !== 0 ? option.id : 0}
																		>
																			{option.name}
																		</MenuItem>
																	))}
																</Select>

																{getError(field) && (
																	<FormHelperText>{getError(field).message as string}</FormHelperText>
																)}
															</FormControl>
														)}
													/>
												)}
										</Grid>
									);
								})}
						</Grid>
					</Box>
				)}
			</Page>
			</Popup>
		</LocalizationProvider>
	);
}