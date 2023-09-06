import React, {useEffect} from 'react';
import {Box, Spacer, Text} from 'ink';
import {spawn} from 'child_process';
import {useDispatch, useSelector} from 'react-redux';
import {COLORS, setCommandProp} from './store.js';

export const Command = ({id, active}) => {
	const dispatch = useDispatch();
	const {raw, root, args, status, output, color} = useSelector(
		({root}) => root.commands[id],
	);

	const [setStatus, setColor, setOutput] = ['status', 'color', 'output'].map(
		prop => value =>
			dispatch(
				setCommandProp({
					id,
					key: prop,
					value,
				}),
			),
	);

	useEffect(() => {
		const startTime = Date.now();
		const elapsedTime = () => Date.now() - startTime;
		const tickerTimeRounded = () => Math.floor(elapsedTime() / 500);

		const tick = setInterval(() => {
			setColor(
				tickerTimeRounded() % 2 ? COLORS.pendingAlternate : COLORS.pending,
			);
			setStatus(`running... ${spinner[tickerTimeRounded() % spinner.length]}`);
		}, 500);

		const ps = spawn(root, args);

		const handleResult = exitCodeOrError => {
			const success = exitCodeOrError === 0;
			clearInterval(tick);
			setColor(success ? COLORS.success : COLORS.error);
			setStatus(parseClose(success, elapsedTime()));
		};
		const handleOutput = buffer => setOutput(buffer.toString().trim());

		ps.on('close', handleResult);
		ps.on('error', handleResult);
		ps.stdout.on('data', handleOutput);
		ps.stderr.on('data', handleOutput);

		return () => {
			clearInterval(tick);
			ps.kill();
		};
	}, [id]);

	return (
		<Box
			overflow="hidden"
			flexDirection="column"
			width="100%"
			borderStyle="bold"
			borderColor={color}
		>
			<Box>
				<Text bold>
					{`${active ? '* ' : ''}${raw}`}
					{!active && output?.length > 1 && <Text dimColor> (...)</Text>}
				</Text>

				<Spacer />

				<Text color={color}>{status}</Text>
			</Box>

			{active && output?.length > 1 && (
				<Box marginTop="1" overflow="hidden">
					<Text overflow="scroll" wrap="truncate">
						{output}
					</Text>
				</Box>
			)}
		</Box>
	);
};
const parseClose = (success, elapsedTime) =>
	`${success ? 'finished in' : 'failed after'} ${elapsedTime}ms`;
const spinner = ['|', '/', '-', '\\'];
