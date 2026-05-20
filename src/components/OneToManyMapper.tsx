/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import { useEffect, useState } from "react";
import { useFieldArray, Controller, type Control, type ArrayPath} from "react-hook-form";
import {
	Select,
	MenuItem,
	Button,
	Stack,
	IconButton,
	TextField,
	Chip,
	Box,
	Autocomplete,
	FormControl,
	InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { OptionValue } from "./PopupForm";


/** OneToManyMapper provides a UI for mapping items between two lists (e.g., sensors to beds). */
export default function OneToManyMapper<P, T extends object>(
	{
		leftData,
		rightData,
		propertyKey,
		control,
		leftField,
		rightField,
		createDto,
		addButtonLabel = "Hinzufügen",
		selectPlaceholder = "Auswählen",
	}: {
		leftData: { value: number; label: string }[];
		rightData: { value: number; label: string }[];
		propertyKey: P & keyof T & ArrayPath<T>;
		control: Control<T>;
		leftField: keyof P & ArrayPath<T>;
		rightField: keyof P & ArrayPath<T>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		createDto: (leftValue: OptionValue) => any;
		addButtonLabel?: string;
		selectPlaceholder?: string;
	}
) {
	const { fields, append, remove } = useFieldArray<T>({
		control,
		name: propertyKey,
	});

	const usedLeft = fields.map((f) => f[leftField] as unknown as number);
	const availableLeft = leftData.filter((s) => !usedLeft.includes(s.value));
	const [selectedLeft, setSelectedLeft] = useState<number | undefined>(
		availableLeft[0]?.value
	);

	useEffect(() => {
		if (availableLeft.length === 0) {
			setSelectedLeft(undefined);
			return;
		}

		if (
			selectedLeft === undefined ||
			!availableLeft.some((option) => option.value === selectedLeft)
		) {
			setSelectedLeft(availableLeft[0]?.value);
		}
	}, [availableLeft, selectedLeft]);

	const selectedOption =
		selectedLeft === undefined
			? undefined
			: availableLeft.find((s) => s.value === selectedLeft);

	const addMapping = () => {
		if (!selectedOption) return;
		append(createDto(selectedOption));
		setSelectedLeft(undefined);
	};

	return (
		<Stack spacing={2}>
			<Stack direction="row" spacing={2} alignItems="center">
				<FormControl sx={{ minWidth: 220 }}>
					<InputLabel shrink id="left-select-label">Auswählen</InputLabel>
					<Select
						labelId="left-select-label"
						value={selectedLeft ?? ""}
						label="Auswählen"
						notched={true}
						onChange={(e) => {
							const nextValue = e.target.value;
							setSelectedLeft(nextValue === "" ? undefined : Number(nextValue));
						}}
					>
						{availableLeft.map((s) => (
							<MenuItem key={s.value} value={s.value}>
								{s.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<Button color="secondary" onClick={addMapping} disabled={!selectedOption}>
					{addButtonLabel}
				</Button>
			</Stack>

			{fields.map((field, idx) => (
				<Stack key={field.id} direction="row" spacing={2} alignItems="center">
					<Box sx={{ flexGrow: 1 }}>
						{
							leftData.find(
								(el) => el.value === (field[leftField] as unknown as number)
							)?.label
						}
					</Box>

					<Controller
						control={control}
						name={`${propertyKey}.${idx}.${rightField}`}
						render={({ field: fieldToRender }) => (
							<Autocomplete
								multiple
								disableCloseOnSelect
								limitTags={4}
								options={rightData}
								getOptionLabel={(option) => option.label}
								value={rightData.filter((option) =>
									(
										(Array.isArray(fieldToRender.value)
											? fieldToRender.value
											: [fieldToRender.value]) as number[]
									).includes(option.value)
								)}
								onChange={(_, selected) =>
									fieldToRender.onChange(selected.map((opt) => opt.value))
								}
								renderTags={(value, getTagProps) =>
									value.map((option, index) => (
										<Chip
											label={option.label}
											{...getTagProps({ index })}
											key={option.value}
										/>
									))
								}
								renderInput={(params) => (
									<TextField
										{...params}
										label={selectPlaceholder}
										InputLabelProps={{ shrink: true }}
									/>
								)}
								sx={{ minWidth: 300 }}
							/>
						)}
					/>

					<IconButton color="primary" onClick={() => remove(idx)}>
						<CloseIcon />
					</IconButton>
				</Stack>
			))}
		</Stack>
	);
}
